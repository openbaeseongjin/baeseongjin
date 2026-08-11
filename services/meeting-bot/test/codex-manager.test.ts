import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.js";
import { CodexManager } from "../src/codex/manager.js";

function config(overrides: NodeJS.ProcessEnv = {}) {
    return loadConfig({
        DISCORD_BOT_TOKEN: "discord-token",
        DISCORD_CLIENT_ID: "12345678901234567",
        DISCORD_GUILD_ID: "12345678901234568",
        DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
        DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
        GITHUB_TOKEN: "github-token",
        ...overrides
    });
}

describe("CodexManager", () => {
    it("refuses jobs while the explicitly disabled-by-default gateway is off", async () => {
        const reply = vi.fn(async () => undefined);
        const manager = new CodexManager({ channels: {} } as never, config());
        const interaction = {
            commandName: "codex",
            guildId: "12345678901234568",
            channelId: "12345678901234569",
            inGuild: () => true,
            reply
        };

        await manager.handleCommand(interaction as never);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining("disabled") }));
    });

    it("rejects the command outside the configured meeting channel", async () => {
        const reply = vi.fn(async () => undefined);
        const manager = new CodexManager({ channels: {} } as never, config({ CODEX_ENABLED: "true" }));
        const interaction = {
            commandName: "codex",
            guildId: "12345678901234568",
            channelId: "12345678901234999",
            inGuild: () => true,
            reply
        };

        await manager.handleCommand(interaction as never);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({ content: expect.stringContaining("configured meeting channel") })
        );
    });
});
