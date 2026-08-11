import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { loadConfig } from "./config.js";
import { CodexManager } from "./codex/manager.js";
import { GitHubStore } from "./github-store.js";
import { checkpoint, safeErrorMessage } from "./logger.js";
import { MeetingManager } from "./meeting-manager.js";

async function main(): Promise<void> {
    const config = loadConfig();
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates
        ]
    });
    const github = await GitHubStore.create(config.github);
    const meetings = new MeetingManager(client, config, github);
    const codex = new CodexManager(client, config);

    client.once(Events.ClientReady, (readyClient) => {
        checkpoint("SUCCESS", `Discord bot ready | User: ${readyClient.user.tag}`);
    });
    client.on(Events.MessageCreate, (message) => meetings.captureMessage(message));
    client.on(Events.InteractionCreate, (interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        const manager = interaction.commandName === "codex" ? codex : meetings;
        void manager.handleCommand(interaction).catch(async (error: unknown) => {
            checkpoint("FAILED", `Interaction | ${safeErrorMessage(error)}`);
            const message = "The command failed. Check the sanitized service log.";
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(message).catch(() => undefined);
            } else {
                await interaction.reply({ content: message, flags: 64 }).catch(() => undefined);
            }
        });
    });

    await client.login(config.discord.botToken);
}

main().catch((error: unknown) => {
    checkpoint("FAILED", `Startup | ${safeErrorMessage(error)}`);
    process.exitCode = 1;
});
