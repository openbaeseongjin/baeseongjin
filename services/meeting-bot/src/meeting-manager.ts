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
import { markdownText, renderDailyDocument } from "./markdown.js";
import { discordMessageRecord, reconcileMeetingMessages } from "./message-history.js";
import { extractReferenceMaterials } from "./message-references.js";
import { buildMeetingSummary } from "./meeting-summary.js";
import { OllamaMeetingClassifier } from "./ollama-meeting-classifier.js";
import { meetingId } from "./time.js";
import type { MeetingMetadata, Minutes, MinutesDetails, TextMessageRecord, VoiceSegment } from "./types.js";
import { VoiceRecorder } from "./voice-recorder.js";
import {
  OllamaRuntime,
  type OllamaReadiness,
  type OllamaRuntimeLike,
} from "./codex/ollama-runtime.js";

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

interface ViewOverwriteEntry {
  id: string;
  type: number;
  allow: { has(permission: bigint): boolean };
  deny: { has(permission: bigint): boolean };
}

interface OverwriteHolder {
  permissionOverwrites: {
    cache: {
      values(): IterableIterator<ViewOverwriteEntry>;
    };
  };
}

interface PermissionAuditableChannel extends OverwriteHolder {
  parentId: string | null;
  isTextBased(): boolean;
  permissionsFor(member: unknown): { has(permission: bigint): boolean } | null;
}

function auditableChannel(value: unknown): PermissionAuditableChannel | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const channel = value as Partial<PermissionAuditableChannel>;
  return (
    typeof channel.isTextBased === "function" &&
    typeof channel.permissionsFor === "function" &&
    Boolean(channel.permissionOverwrites?.cache) &&
    "parentId" in channel
  )
    ? (channel as PermissionAuditableChannel)
    : null;
}

function auditableOverwriteHolder(value: unknown): OverwriteHolder | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const holder = value as Partial<OverwriteHolder>;
  return Boolean(holder.permissionOverwrites?.cache) ? (holder as OverwriteHolder) : null;
}

function viewOverwrites(holder: OverwriteHolder | null): Array<readonly [string, string]> {
  if (!holder) {
    return [];
  }
  return [...holder.permissionOverwrites.cache.values()].flatMap((overwrite) => {
    const allow = overwrite.allow.has(PermissionFlagsBits.ViewChannel);
    const deny = overwrite.deny.has(PermissionFlagsBits.ViewChannel);
    return allow || deny
      ? ([[`${overwrite.type}:${overwrite.id}`, `${allow ? 1 : 0}:${deny ? 1 : 0}`]] as const)
      : [];
  });
}

// A channel's effective "who can view this" audience comes from its own overwrites layered on
// top of its category's overwrites (channel-level wins), not from sharing the same category ID.
// Comparing the resolved audience instead of parentId lets capture/minutes channels live under
// different categories as long as they still resolve to the same View Channel overwrite set.
function visibilityFingerprint(
  channel: PermissionAuditableChannel,
  parentOverwritesById: Map<string, OverwriteHolder | null>,
): string {
  const merged = new Map<string, string>();
  if (channel.parentId) {
    for (const [key, value] of viewOverwrites(parentOverwritesById.get(channel.parentId) ?? null)) {
      merged.set(key, value);
    }
  }
  for (const [key, value] of viewOverwrites(channel)) {
    merged.set(key, value);
  }
  return [...merged.entries()]
    .map(([key, value]) => `${key}:${value}`)
    .sort()
    .join("|");
}

export class MeetingManager {
  private active: ActiveMeeting | undefined;
  private starting = false;
  private ending = false;
  private readonly localProcessing: LocalMeetingService;
  private readonly publisher: DiscordPublisher;
  private readonly ollama: OllamaRuntimeLike;

  constructor(
    private readonly client: Client,
    private readonly config: AppConfig,
    private readonly github: GitHubStore,
    ollama?: OllamaRuntimeLike,
  ) {
    const meetingClassifier =
      config.meetingClassifier.enabled && config.meetingClassifier.model
        ? new OllamaMeetingClassifier({
            model: config.meetingClassifier.model,
            timeoutMs: config.meetingClassifier.timeoutMs,
            maxTranscriptCharacters: config.meetingClassifier.maxTranscriptCharacters,
            outputLanguage: config.meetingClassifier.outputLanguage,
          })
        : undefined;
    this.localProcessing = new LocalMeetingService(
      new LocalWhisperTranscriber({
        pythonExecutable: config.localProcessing.pythonExecutable,
        scriptPath: resolve("scripts/local_whisper.py"),
        model: config.localProcessing.transcriptionModel,
        cacheDir: config.localProcessing.modelCacheDir,
      }),
      meetingClassifier,
    );
    this.publisher = new DiscordPublisher(client, config.discord.minutesChannelId);
    const codexUsesOllama = config.codex.enabled && config.codex.provider === "ollama";
    const ollamaModel = config.meetingClassifier.enabled
      ? config.meetingClassifier.model
      : codexUsesOllama
        ? config.codex.model
        : undefined;
    this.ollama =
      ollama ??
      new OllamaRuntime({
        enabled: codexUsesOllama || config.meetingClassifier.enabled,
        ...(ollamaModel ? { model: ollamaModel } : {}),
        binary: config.codex.ollamaBinary,
        startupTimeoutMs: config.codex.ollamaStartupTimeoutMs,
      });
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
      !this.config.discord.captureChannelIds.includes(message.channelId) ||
      message.createdAt < this.active.startedAt
    ) {
      return;
    }

    const record = discordMessageRecord(message);
    if (!record) {
      return;
    }
    if (this.active.messages.length >= MAX_TEXT_MESSAGES) {
      if (!this.active.voiceWarnings.includes("The text capture limit was reached.")) {
        this.active.voiceWarnings.push("The text capture limit was reached.");
      }
      return;
    }
    this.active.messages.push(record);
  }

  private async start(interaction: ChatInputCommandInteraction): Promise<void> {
    if (this.active || this.starting || this.ending) {
      await interaction.reply({
        content: this.active
          ? `A meeting is already active (${this.active.id}).`
          : this.ending
            ? "A meeting is already ending. Wait for finalization to finish."
            : "A meeting is already starting.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    this.starting = true;
    try {
      await this.startReserved(interaction);
    } finally {
      this.starting = false;
    }
  }

  private async startReserved(interaction: ChatInputCommandInteraction): Promise<void> {
    const startedAt = interaction.createdAt ?? new Date();
    await interaction.deferReply();
    const guild = interaction.guild;
    if (!guild) {
      throw new Error("meeting command did not resolve a guild");
    }
    const member = await guild.members.fetch(interaction.user.id);
    const accessError = await this.captureAccessError(guild, member);
    if (accessError) {
      await interaction.editReply(accessError);
      return;
    }
    const voiceChannel = member.voice.channel;
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
    const safeVoiceChannelName = voiceChannel
      ? markdownText(voiceChannel.name).replace(/@/gu, "@\u200b")
      : null;
    const voiceStatus = voiceChannel
      ? `Voice recording is active in **${safeVoiceChannelName}** with DAVE encryption.`
      : "No voice channel was detected; this meeting is text-only.";
    await interaction.editReply(this.startReply(id, voiceStatus, this.ollamaPreparingStatus()));
    void this.finishOllamaPreparation(interaction, meeting, voiceStatus).catch((error: unknown) => {
      checkpoint("FAILED", `Ollama status update | ${safeErrorMessage(error)}`);
    });
    checkpoint("SUCCESS", `Meeting ${id} started | Voice: ${voiceChannel ? "enabled" : "text-only"}`);
  }

  private async finishOllamaPreparation(
    interaction: ChatInputCommandInteraction,
    meeting: ActiveMeeting,
    voiceStatus: string,
  ): Promise<void> {
    const readiness = await this.ensureOllamaReady();
    if (this.active !== meeting) {
      return;
    }
    await interaction.editReply(this.startReply(meeting.id, voiceStatus, this.ollamaStatus(readiness)));
  }

  private startReply(id: string, voiceStatus: string, ollamaStatus?: string): string {
    const capturedChannels = this.config.discord.captureChannelIds
      .map((channelId) => `<#${channelId}>`)
      .join(", ");
    return [
      `Meeting **${id}** started.`,
      voiceStatus,
      ...(ollamaStatus ? [ollamaStatus] : []),
      `Messages posted between start and end in ${capturedChannels} are being captured until \`/meeting end\`.`,
      "Captured message text, display names, external links, and attachment filenames are republished to the configured minutes channel.",
      "Voice audio is transcribed locally on this bot host and is not sent to an AI API. Confirm participant consent before continuing.",
    ].join("\n");
  }

  private async captureAccessError(
    guild: NonNullable<ChatInputCommandInteraction["guild"]>,
    member: unknown,
  ): Promise<string | null> {
    try {
      const channelIds = [
        ...this.config.discord.captureChannelIds,
        this.config.discord.minutesChannelId,
      ];
      const channels = await Promise.all(
        channelIds.map(async (channelId) =>
          auditableChannel(guild.channels.cache.get(channelId) ?? (await guild.channels.fetch(channelId))),
        ),
      );
      if (channels.some((channel) => !channel?.isTextBased())) {
        return "Meeting was not started because a configured capture/minutes channel could not be verified.";
      }
      const verifiedChannels = channels as PermissionAuditableChannel[];
      if (
        verifiedChannels.some(
          (channel) => !channel.permissionsFor(member)?.has(PermissionFlagsBits.ViewChannel),
        )
      ) {
        return "Meeting was not started because the requester cannot view every capture and minutes channel.";
      }
      const parentIds = [
        ...new Set(
          verifiedChannels.flatMap((channel) => (channel.parentId ? [channel.parentId] : [])),
        ),
      ];
      const parentEntries = await Promise.all(
        parentIds.map(async (parentId) =>
          [
            parentId,
            auditableOverwriteHolder(
              guild.channels.cache.get(parentId) ?? (await guild.channels.fetch(parentId)),
            ),
          ] as const,
        ),
      );
      const parentOverwritesById = new Map(parentEntries);

      const minutesChannel = verifiedChannels.at(-1)!;
      const minutesAudience = visibilityFingerprint(minutesChannel, parentOverwritesById);
      if (
        verifiedChannels
          .slice(0, -1)
          .some((channel) => visibilityFingerprint(channel, parentOverwritesById) !== minutesAudience)
      ) {
        return "Meeting was not started because capture/minutes channel visibility policies are not aligned.";
      }
      return null;
    } catch (error: unknown) {
      checkpoint("FAILED", `Meeting channel permission validation | ${safeErrorMessage(error)}`);
      return "Meeting was not started because capture/minutes channel visibility could not be verified.";
    }
  }

  private ollamaPreparingStatus(): string | undefined {
    return (this.config.codex.enabled && this.config.codex.provider === "ollama") ||
      this.config.meetingClassifier.enabled
      ? "Ollama is being prepared in the background; meeting capture is already active."
      : undefined;
  }

  private async ensureOllamaReady(): Promise<OllamaReadiness> {
    try {
      return await this.ollama.ensureReady();
    } catch (error: unknown) {
      checkpoint("FAILED", `Ollama preparation | ${safeErrorMessage(error)}`);
      return { state: "unavailable" };
    }
  }

  private ollamaStatus(readiness: OllamaReadiness): string | undefined {
    if (readiness.state === "skipped") {
      return undefined;
    }
    if (readiness.state === "ready") {
      const purpose = this.ollamaPurpose();
      return readiness.started
        ? `Ollama started automatically and is ready for ${purpose}.`
        : `Local Ollama is ready for ${purpose}.`;
    }
    return `Ollama is unavailable. The meeting will continue, but ${this.ollamaPurpose()} will use only available fallback behavior.`;
  }

  private ollamaPurpose(): string {
    const purposes = [
      ...(this.config.meetingClassifier.enabled ? ["meeting classification"] : []),
      ...(this.config.codex.enabled && this.config.codex.provider === "ollama" ? ["`/codex`"] : []),
    ];
    return purposes.length > 0 ? purposes.join(" and ") : "local features";
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
    if (this.ending) {
      await interaction.reply({
        content: "A meeting is already ending.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (!this.active) {
      await interaction.reply({
        content: "No meeting is active.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const meeting = this.active;
    this.active = undefined;
    this.ending = true;
    const endedAt = interaction.createdAt ?? new Date();
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch((error: unknown) => {
        checkpoint(
          "FAILED",
          `Meeting end acknowledgement ${meeting.id} | ${safeErrorMessage(error)}`,
        );
      });
      let voiceSegments: VoiceSegment[] = [];

      try {
        voiceSegments = (await meeting.recorder?.stop()) ?? [];
        if (meeting.recorder?.didReachSegmentLimit()) {
          meeting.voiceWarnings.push("The voice segment capture limit was reached.");
        }
      } finally {
        meeting.connection?.destroy();
      }

      const reconciledMessages = await reconcileMeetingMessages(this.client, {
        guildId: this.config.discord.guildId,
        captureChannelIds: this.config.discord.captureChannelIds,
        startedAt: meeting.startedAt,
        endedAt,
        liveMessages: meeting.messages,
        maxMessages: MAX_TEXT_MESSAGES,
      });
      meeting.messages = reconciledMessages.messages;
      meeting.voiceWarnings.push(...reconciledMessages.warnings);

      const transcription = await this.localProcessing.transcribe(meeting.messages, voiceSegments);
      let minutes: Minutes;
      try {
        minutes = await this.localProcessing.summarize(transcription.entries);
      } catch (error: unknown) {
        checkpoint("FAILED", `Meeting summary ${meeting.id} | ${safeErrorMessage(error)}`);
        minutes = this.safeFallbackMinutes(
          transcription.entries.map((entry) => `${entry.speaker}: ${entry.text}`),
        );
      }
      const referenceMaterials = extractReferenceMaterials(meeting.messages);
      minutes.references = referenceMaterials.items;
      const operationalBlockers: string[] = [];
      if (referenceMaterials.itemCapReached) {
        operationalBlockers.push(
          "Reference materials were truncated at 200 items; review the source channels.",
        );
      }
      if (referenceMaterials.perMessageCapReached) {
        operationalBlockers.push(
          "One or more messages exceeded the per-message URL or attachment limit; review the source channels.",
        );
      }
      if (referenceMaterials.sensitiveUrlOmitted) {
        operationalBlockers.push(
          "One or more reference URLs were withheld as credential-bearing, oversized, or over the per-message limit; review the source channels.",
        );
      }
      if (transcription.failures.length > 0) {
        operationalBlockers.push(
          `${transcription.failures.length} voice segment(s) could not be transcribed; no content from them was promoted.`,
        );
        checkpoint(
          "FAILED",
          `Meeting ${meeting.id} transcription | ${transcription.failures.length} segment(s) failed`,
        );
      }
      operationalBlockers.push(...meeting.voiceWarnings);
      minutes.blockers.unshift(...operationalBlockers);
      minutes.summary = buildMeetingSummary(minutes);

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
    } finally {
      this.ending = false;
    }
  }

  private safeFallbackMinutes(discussed: string[]): Minutes {
    const details: MinutesDetails = {
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
    return { summary: buildMeetingSummary(details), references: [], ...details };
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
