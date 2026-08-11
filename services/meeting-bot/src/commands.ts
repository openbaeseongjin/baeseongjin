import { SlashCommandBuilder } from "discord.js";
import { CODEX_SKILLS } from "./codex/types.js";

export const meetingCommand = new SlashCommandBuilder()
    .setName("meeting")
    .setDescription("Record and publish hackathon meeting minutes")
    .addSubcommand((subcommand) =>
        subcommand.setName("start").setDescription("Start text capture and, when joined, voice recording")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("end").setDescription("Stop capture, transcribe, summarize, and publish minutes")
    );

export const codexCommand = new SlashCommandBuilder()
    .setName("codex")
    .setDescription("Run an allowlisted read-only repository skill")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("plan")
            .setDescription("Queue a read-only repository job")
            .addStringOption((option) =>
                option
                    .setName("skill")
                    .setDescription("Allowlisted repository skill")
                    .setRequired(true)
                    .addChoices(...CODEX_SKILLS.map((skill) => ({ name: skill, value: skill })))
            )
            .addStringOption((option) =>
                option
                    .setName("source")
                    .setDescription("Discord context source")
                    .setRequired(true)
                    .addChoices(
                        { name: "Last meeting minutes", value: "last-meeting" },
                        { name: "Recent channel messages", value: "recent-messages" }
                    )
            )
            .addStringOption((option) =>
                option
                    .setName("instruction")
                    .setDescription("Repository request; Discord content remains untrusted data")
                    .setRequired(true)
                    .setMaxLength(1_000)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("status")
            .setDescription("Show a Codex job status")
            .addStringOption((option) => option.setName("job").setDescription("Job ID").setRequired(true))
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("result")
            .setDescription("Show a completed Codex job result")
            .addStringOption((option) => option.setName("job").setDescription("Job ID").setRequired(true))
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("cancel")
            .setDescription("Cancel a queued or running Codex job")
            .addStringOption((option) => option.setName("job").setDescription("Job ID").setRequired(true))
    );

export const guildCommands = [meetingCommand.toJSON(), codexCommand.toJSON()];
