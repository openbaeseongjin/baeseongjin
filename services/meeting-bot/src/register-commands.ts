import "dotenv/config";
import { REST, Routes } from "discord.js";
import { guildCommands } from "./commands.js";
import { loadConfig } from "./config.js";
import { checkpoint, safeErrorMessage } from "./logger.js";

async function main(): Promise<void> {
    const config = loadConfig();
    const rest = new REST({ version: "10" }).setToken(config.discord.botToken);
    await rest.put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId), {
        body: guildCommands
    });
    checkpoint("SUCCESS", `Registered /meeting and /codex in guild ${config.discord.guildId}`);
}

main().catch((error: unknown) => {
    checkpoint("FAILED", `Command registration | ${safeErrorMessage(error)}`);
    process.exitCode = 1;
});
