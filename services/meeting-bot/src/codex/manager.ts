import { join } from "node:path";
import {
    MessageFlags,
    type ChatInputCommandInteraction,
    type Client,
    type Message
} from "discord.js";
import type { AppConfig } from "../config.js";
import { DiscordPublisher } from "../discord-publisher.js";
import { checkpoint, safeErrorMessage } from "../logger.js";
import { CodexAdmissionController } from "./admission.js";
import { buildDiscordContext, type DiscordContextMessage } from "./context.js";
import { CodexJobStore } from "./job-store.js";
import { renderCodexJob } from "./result.js";
import { CodexRunner } from "./runner.js";
import { CODEX_SKILLS, CODEX_SOURCES, type CodexSkill, type CodexSource } from "./types.js";
import { CodexJobWorker, type CodexRunnerLike } from "./worker.js";

function isCodexSkill(value: string): value is CodexSkill {
    return CODEX_SKILLS.some((candidate) => candidate === value);
}

function isCodexSource(value: string): value is CodexSource {
    return CODEX_SOURCES.some((candidate) => candidate === value);
}

export class CodexManager {
    private readonly store: CodexJobStore;
    private readonly worker: CodexJobWorker;
    private readonly publisher: DiscordPublisher;
    private readonly admission: CodexAdmissionController;

    constructor(
        private readonly client: Client,
        private readonly config: AppConfig,
        runner?: CodexRunnerLike
    ) {
        const codexDataDirectory = join(config.runtime.dataDir, "codex");
        this.store = new CodexJobStore(codexDataDirectory);
        this.publisher = new DiscordPublisher(client, config.discord.minutesChannelId);
        const selectedRunner =
            runner ??
            new CodexRunner({
                binary: config.codex.binary,
                repositoryRoot: config.codex.repositoryRoot,
                dataDirectory: codexDataDirectory,
                timeoutMs: config.codex.timeoutMs,
                provider: config.codex.provider,
                ...(config.codex.model ? { model: config.codex.model } : {})
            });
        this.worker = new CodexJobWorker(
            this.store,
            selectedRunner,
            async (job) => {
                await this.publisher.publish(renderCodexJob(job));
            },
            config.codex.maxOutstandingJobs
        );
        this.admission = new CodexAdmissionController(config.codex.maxOutstandingJobs);
    }

    async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        if (interaction.commandName !== "codex") {
            return;
        }
        if (!this.config.codex.enabled) {
            await interaction.reply({
                content: "The Codex gateway is disabled. Set CODEX_ENABLED=true after local validation.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        if (
            !interaction.inGuild() ||
            interaction.guildId !== this.config.discord.guildId ||
            interaction.channelId !== this.config.discord.meetingChannelId
        ) {
            await interaction.reply({
                content: "Use this command in the configured meeting channel.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        if (this.config.codex.provider !== "ollama") {
            await interaction.reply({
                content: "The public Codex gateway only supports the local Ollama provider.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "plan") {
            await this.plan(interaction);
        } else if (subcommand === "cancel") {
            await this.cancel(interaction);
        } else {
            await this.show(interaction, subcommand === "result");
        }
    }

    private async plan(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const admission = this.admission.acquire(interaction.user.id);
        if (!admission.accepted) {
            await interaction.editReply(
                admission.reason === "requester-busy"
                    ? "You already have an outstanding Codex job. Wait for it to finish or cancel it."
                    : "The local Codex queue is full. Try again after another job finishes."
            );
            return;
        }

        let enqueued = false;
        try {
            const skillValue = interaction.options.getString("skill", true);
            const sourceValue = interaction.options.getString("source", true);
            const instruction = interaction.options.getString("instruction", true).trim();
            if (!isCodexSkill(skillValue) || !isCodexSource(sourceValue) || !instruction) {
                await interaction.editReply("The Codex planning request was invalid.");
                return;
            }
            const contextMessages = await this.fetchContextMessages(sourceValue);
            if (contextMessages.length === 0) {
                await interaction.editReply("No eligible Discord content was found for this source.");
                return;
            }
            const context = buildDiscordContext(
                contextMessages,
                this.config.codex.maxContextMessages,
                this.config.codex.maxContextCharacters
            );
            const job = await this.store.create({
                guildId: interaction.guildId ?? this.config.discord.guildId,
                channelId: interaction.channelId,
                requesterId: interaction.user.id,
                skill: skillValue,
                source: sourceValue,
                instruction,
                context
            });
            const completion = this.worker.enqueue(job.id);
            enqueued = true;
            void completion
                .catch(async (error: unknown) => {
                    const message = safeErrorMessage(error);
                    await this.store
                        .update(job.id, { status: "failed", error: message })
                        .catch((updateError: unknown) => {
                            checkpoint(
                                "FAILED",
                                `Codex job ${job.id} status update | ${safeErrorMessage(updateError)}`
                            );
                        });
                    checkpoint("FAILED", `Codex job ${job.id} | ${message}`);
                })
                .finally(() => admission.release());
            await interaction.editReply(
                `Codex job **${job.id}** queued in read-only mode. Use \`/codex status\` to check it.`
            );
        } finally {
            if (!enqueued) {
                admission.release();
            }
        }
    }

    private async show(interaction: ChatInputCommandInteraction, includeResult: boolean): Promise<void> {
        const id = interaction.options.getString("job", true).trim().toUpperCase();
        const job = await this.store.get(id);
        if (!job) {
            await interaction.reply({ content: "Codex job not found.", flags: MessageFlags.Ephemeral });
            return;
        }
        const content = includeResult
            ? renderCodexJob(job).slice(0, 1_900)
            : `Codex job **${job.id}** is **${job.status}**.`;
        await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }

    private async cancel(interaction: ChatInputCommandInteraction): Promise<void> {
        const id = interaction.options.getString("job", true).trim().toUpperCase();
        const cancelled = await this.worker.cancel(id);
        await interaction.reply({
            content: cancelled
                ? `Codex job **${id}** was cancelled.`
                : "That job was not found or can no longer be cancelled.",
            flags: MessageFlags.Ephemeral
        });
    }

    private async fetchContextMessages(source: CodexSource): Promise<DiscordContextMessage[]> {
        const channelId =
            source === "last-meeting" ? this.config.discord.minutesChannelId : this.config.discord.meetingChannelId;
        const channel = await this.client.channels.fetch(channelId);
        if (!channel?.isTextBased() || !("messages" in channel)) {
            throw new Error("Configured Codex context source is not a readable text channel");
        }
        const messages = await channel.messages.fetch({
            limit: Math.min(this.config.codex.maxContextMessages, 100)
        });
        return [...messages.values()]
            .filter((message: Message) => source === "last-meeting" || !message.author.bot)
            .map((message: Message) => ({
                id: message.id,
                createdAt: message.createdAt,
                authorName: message.member?.displayName ?? message.author.displayName,
                content: message.content,
                attachmentNames: [...message.attachments.values()].map(
                    (attachment) => attachment.name ?? "unnamed file"
                )
            }));
    }
}
