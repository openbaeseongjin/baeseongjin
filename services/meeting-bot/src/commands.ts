import { SlashCommandBuilder } from "discord.js";

export const meetingCommand = new SlashCommandBuilder()
  .setName("meeting")
  .setDescription("Record and publish hackathon meeting minutes")
  .addSubcommand((subcommand) =>
    subcommand.setName("start").setDescription("Start text capture and, when joined, voice recording"),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("end").setDescription("Stop capture, transcribe, summarize, and publish minutes"),
  );

export const guildCommands = [meetingCommand.toJSON()];
