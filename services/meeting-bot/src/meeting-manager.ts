import {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
  type VoiceConnection,
} from "@discordjs/voice";
import { resolve } from "node:path";
import {
  type ChatInputCommandInteraction,
  type Client,
  type Message,
  MessageFlags,
  PermissionFlagsBits,
  type VoiceBasedChannel,
} from "discord.js";
import type { AppConfig } from "./config.js";
import { DiscordPublisher } from "./discord-publisher.js";
import { GitHubStore, type GitHubSyncResult } from "./github-store.js";
import { checkpoint, safeErrorMessage } from "./logger.js";
import { LocalMeetingService, LocalWhisperTranscriber } from "./local-meeting-service.js";
import { renderDailyDocument } from "./markdown.js";
import { meetingId } from "./time.js";
import type { MeetingMetadata, Minutes, TextMessageRecord, VoiceSegment } from "./types.js";
import { VoiceRecorder } from "./voice-recorder.js";

interface ActiveMeeting {
  id: string;
  startedAt: Date;
  startedBy: string;
  messages: TextMessageRecord[];
  connection?: VoiceConnection;
  recorder?: VoiceRecorder;
  voiceChannelName: string | null;
  voiceWarnings: string[];
}

const MAX_TEXT_MESSAGES = 5_000;

export class MeetingManager {
  private active: ActiveMeeting | undefined;
  private readonly localProcessing: LocalMeetingService;
  private readonly publisher: DiscordPublisher;

  constructor(
    private readonly client: Client,
    private readonly config: AppConfig,
    private readonly github: GitHubStore,
  ) {
    this.localProcessing = new LocalMeetingService(
      new LocalWhisperTranscriber({
        pythonExecutable: config.localProcessing.pythonExecutable,
        scriptPath: resolve("scripts/local_whisper.py"),
        model: config.localProcessing.transcriptionModel,
        cacheDir: config.localProcessing.modelCacheDir,
      }),
    );
    this.publisher = new DiscordPublisher(client, config.discord.minutesChannelId);
  }

  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.commandName !== "meeting") {
      return;
    }
    if (
      !interaction.inGuild() ||
      interaction.guildId !== this.config.discord.guildId ||
      interaction.channelId !== this.config.discord.meetingChannelId
    ) {
      await interaction.reply({
        content: "Use this command in the configured meeting channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      throw new Error("meeting command did not resolve a guild");
    }
    const roleCollection = interaction.member?.roles;
    const hasOperatorRole =
      this.config.discord.operatorRoleId &&
      (Array.isArray(roleCollection)
        ? roleCollection.includes(this.config.discord.operatorRoleId)
        : roleCollection?.cache.has(this.config.discord.operatorRoleId));
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) && !hasOperatorRole) {
      await interaction.reply({
        content: "You need Manage Server or the configured meeting-operator role.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "start") {
      await this.start(interaction);
    } else if (subcommand === "end") {
      await this.end(interaction);
    }
  }

  captureMessage(message: Message): void {
    if (
      !this.active ||
      message.author.bot ||
      message.guildId !== this.config.discord.guildId ||
      message.channelId !== this.config.discord.meetingChannelId ||
      message.createdAt < this.active.startedAt
    ) {
      return;
    }

    const content = message.content.trim();
    const attachments = [...message.attachments.values()].map(
      (attachment) => attachment.name ?? "unnamed file",
    );
    if (!content && attachments.length === 0) {
      return;
    }
    if (this.active.messages.length >= MAX_TEXT_MESSAGES) {
      if (!this.active.voiceWarnings.includes("The text capture limit was reached.")) {
        this.active.voiceWarnings.push("The text capture limit was reached.");
      }
      return;
    }
    this.active.messages.push({
      id: message.id,
      timestamp: message.createdAt.toISOString(),
      authorId: message.author.id,
      authorName: message.member?.displayName ?? message.author.displayName,
      content,
      attachments,
    });
  }

  private async start(interaction: ChatInputCommandInteraction): Promise<void> {
    if (this.active) {
      await interaction.reply({
        content: `A meeting is already active (${this.active.id}).`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();
    const guild = interaction.guild;
    if (!guild) {
      throw new Error("meeting command did not resolve a guild");
    }
    const member = await guild.members.fetch(interaction.user.id);
    const voiceChannel = member.voice.channel;
    const startedAt = new Date();
    const id = meetingId(startedAt);
    const meeting: ActiveMeeting = {
      id,
      startedAt,
      startedBy: member.displayName,
      messages: [],
      voiceChannelName: voiceChannel?.name ?? null,
      voiceWarnings: [],
    };

    if (voiceChannel) {
      try {
        await this.connectVoice(meeting, voiceChannel);
      } catch (error: unknown) {
        meeting.connection?.destroy();
        checkpoint("FAILED", `Voice connection ${id} | ${safeErrorMessage(error)}`);
        await interaction.editReply(
          "Meeting was not started because the DAVE voice connection failed. " +
            "Run `npm run diagnose:voice`, fix the voice runtime, or leave voice before starting a text-only meeting.",
        );
        return;
      }
    }

    this.active = meeting;
    const voiceStatus = voiceChannel
      ? `Voice recording is active in **${voiceChannel.name}** with DAVE encryption.`
      : "No voice channel was detected; this meeting is text-only.";
    await interaction.editReply(
      [
        `Meeting **${id}** started.`,
        voiceStatus,
        "Messages in this channel are being captured until `/meeting end`.",
        "Voice audio is transcribed locally on this bot host and is not sent to an AI API. Confirm participant consent before continuing.",
      ].join("\n"),
    );
    checkpoint("SUCCESS", `Meeting ${id} started | Voice: ${voiceChannel ? "enabled" : "text-only"}`);
  }

  private async connectVoice(meeting: ActiveMeeting, voiceChannel: VoiceBasedChannel): Promise<void> {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: true,
      daveEncryption: true,
    });
    meeting.connection = connection;
    connection.on("error", (error) => {
      meeting.voiceWarnings.push("The Discord voice connection reported an error.");
      checkpoint("FAILED", `Voice connection ${meeting.id} | ${safeErrorMessage(error)}`);
    });
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

    const recorder = new VoiceRecorder(
      connection,
      meeting.id,
      this.config.runtime.dataDir,
      (userId) => voiceChannel.guild.members.cache.get(userId)?.displayName ?? `Discord user ${userId}`,
    );
    await recorder.start();
    meeting.recorder = recorder;
  }

  private async end(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!this.active) {
      await interaction.reply({
        content: "No meeting is active.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const meeting = this.active;
    this.active = undefined;
    const endedAt = new Date();
    let voiceSegments: VoiceSegment[] = [];

    try {
      voiceSegments = (await meeting.recorder?.stop()) ?? [];
      if (meeting.recorder?.didReachSegmentLimit()) {
        meeting.voiceWarnings.push("The voice segment capture limit was reached.");
      }
    } finally {
      meeting.connection?.destroy();
    }

    const transcription = await this.localProcessing.transcribe(meeting.messages, voiceSegments);
    let minutes: Minutes;
    try {
      minutes = this.localProcessing.summarize(transcription.entries);
    } catch (error: unknown) {
      checkpoint("FAILED", `Meeting summary ${meeting.id} | ${safeErrorMessage(error)}`);
      minutes = this.safeFallbackMinutes(transcription.entries.map((entry) => `${entry.speaker}: ${entry.text}`));
    }
    if (transcription.failures.length > 0) {
      minutes.blockers.push(
        `${transcription.failures.length} voice segment(s) could not be transcribed; no content from them was promoted.`,
      );
      checkpoint(
        "FAILED",
        `Meeting ${meeting.id} transcription | ${transcription.failures.length} segment(s) failed`,
      );
    }
    minutes.blockers.push(...meeting.voiceWarnings);

    const metadata: MeetingMetadata = {
      id: meeting.id,
      guildId: interaction.guildId ?? this.config.discord.guildId,
      startedAt: meeting.startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      startedBy: meeting.startedBy,
      voiceChannelName: meeting.voiceChannelName,
    };
    const markdown = renderDailyDocument(metadata, minutes);
    const results = await Promise.allSettled([
      this.publisher.publish(markdown),
      this.github.syncMeeting(metadata, minutes),
    ]);

    const discordStatus = this.resultStatus(results[0], "Discord");
    const githubStatus = this.githubResultStatus(results[1]);
    if (!this.config.runtime.retainAudio && meeting.recorder) {
      await meeting.recorder.cleanup(voiceSegments);
    }

    await interaction.editReply(
      [
        `Meeting **${meeting.id}** ended.`,
        `Captured ${meeting.messages.length} text message(s) and ${voiceSegments.length} voice segment(s).`,
        discordStatus,
        githubStatus,
      ].join("\n"),
    );
    checkpoint("SUCCESS", `Meeting ${meeting.id} finalized | ${discordStatus} | ${githubStatus}`);
  }

  private safeFallbackMinutes(discussed: string[]): Minutes {
    return {
      discussed: discussed.slice(0, 100),
      decided: [],
      rejected: [],
      hypotheses: [
        "Automated classification failed; no decisions or action items were promoted automatically.",
      ],
      actionItems: [],
      blockers: ["Local meeting classification failed; manual review is required."],
      nextMeeting: null,
    };
  }

  private resultStatus(result: PromiseSettledResult<unknown>, label: string): string {
    if (result.status === "fulfilled") {
      return `${label}: published.`;
    }
    checkpoint("FAILED", `${label} publish | ${safeErrorMessage(result.reason)}`);
    return `${label}: publish failed; check the sanitized service log.`;
  }

  private githubResultStatus(result: PromiseSettledResult<GitHubSyncResult>): string {
    if (result.status === "fulfilled") {
      const paths = result.value.paths.length > 0 ? result.value.paths.join(", ") : "already current";
      return `GitHub: ${paths} (${result.value.commitSha.slice(0, 7)}).`;
    }
    checkpoint("BLOCKED", `GitHub sync | ${safeErrorMessage(result.reason)}`);
    return "GitHub: sync blocked or failed; Discord minutes remain available.";
  }
}
