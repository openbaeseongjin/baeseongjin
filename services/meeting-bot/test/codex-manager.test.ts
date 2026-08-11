import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.js";
import { CodexJobStore } from "../src/codex/job-store.js";
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

    it.each([
        {
            location: "another guild",
            guildId: "12345678901234999",
            inGuild: true
        },
        {
            location: "a direct message",
            guildId: null,
            inGuild: false
        }
    ])("rejects the command from $location", async ({ guildId, inGuild }) => {
        const reply = vi.fn(async () => undefined);
        const manager = new CodexManager({ channels: {} } as never, config({ CODEX_ENABLED: "true" }));
        const interaction = {
            commandName: "codex",
            guildId,
            channelId: "12345678901234569",
            inGuild: () => inGuild,
            reply
        };

        await manager.handleCommand(interaction as never);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({ content: expect.stringContaining("configured meeting channel") })
        );
    });

    it("lets a regular guild member use Codex commands in the meeting channel", async () => {
        const reply = vi.fn(async () => undefined);
        const manager = new CodexManager(
            { channels: {} } as never,
            config({
                CODEX_ENABLED: "true",
                CODEX_PROVIDER: "ollama",
                CODEX_MODEL: "qwen2.5:7b-instruct"
            })
        );
        const interaction = {
            commandName: "codex",
            guildId: "12345678901234568",
            channelId: "12345678901234569",
            inGuild: () => true,
            member: { roles: [] },
            memberPermissions: { has: () => false },
            user: { id: "12345678901234571" },
            options: {
                getSubcommand: () => "status",
                getString: () => "CX-20990101-NOTFND"
            },
            reply
        };

        await manager.handleCommand(interaction as never);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ content: "Codex job not found." }));
    });

    it("refuses the authenticated Codex CLI provider on the public gateway", async () => {
        const reply = vi.fn(async () => undefined);
        const manager = new CodexManager(
            { channels: {} } as never,
            config({ CODEX_ENABLED: "true", CODEX_PROVIDER: "codex" })
        );
        const interaction = {
            commandName: "codex",
            guildId: "12345678901234568",
            channelId: "12345678901234569",
            inGuild: () => true,
            options: {
                getSubcommand: () => "status",
                getString: () => "CX-20990101-NOTFND"
            },
            reply
        };

        await manager.handleCommand(interaction as never);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining("local Ollama") }));
    });

    it("lets a regular member queue a plan through the local read-only runner", async () => {
        const dataDirectory = await mkdtemp(join(tmpdir(), "codex-manager-"));
        const send = vi.fn(async () => undefined);
        const contextMessage = {
            id: "12345678901234572",
            createdAt: new Date("2026-08-11T08:00:00.000Z"),
            author: { bot: false, displayName: "Regular Member" },
            member: { displayName: "Regular Member" },
            content: "The rope prototype needs a shorter cooldown.",
            attachments: new Map()
        };
        const client = {
            channels: {
                fetch: vi.fn(async (channelId: string) =>
                    channelId === "12345678901234569"
                        ? {
                              isTextBased: (): boolean => true,
                              messages: { fetch: async () => new Map([[contextMessage.id, contextMessage]]) }
                          }
                        : { isTextBased: (): boolean => true, send }
                )
            }
        };
        const runner = {
            async run() {
                return {
                    status: "completed" as const,
                    summary: "local regular-member plan",
                    proposedChanges: [],
                    verification: [],
                    risks: []
                };
            }
        };
        const manager = new CodexManager(
            client as never,
            config({
                CODEX_ENABLED: "true",
                CODEX_PROVIDER: "ollama",
                CODEX_MODEL: "test-only-missing-model",
                MEETING_DATA_DIR: dataDirectory
            }),
            runner
        );
        const editReply = vi.fn(async (_content: string) => undefined);
        const interaction = {
            commandName: "codex",
            guildId: "12345678901234568",
            channelId: "12345678901234569",
            inGuild: () => true,
            member: { roles: [] },
            memberPermissions: { has: () => false },
            user: { id: "12345678901234571" },
            options: {
                getSubcommand: () => "plan",
                getString: (name: string) =>
                    ({
                        skill: "repo-task-plan",
                        source: "recent-messages",
                        instruction: "Plan the next rope prototype task."
                    } as Record<string, string>)[name]
            },
            deferReply: vi.fn(async () => undefined),
            editReply,
            reply: vi.fn(async () => undefined)
        };

        await manager.handleCommand(interaction as never);
        const queuedReply = String(editReply.mock.calls[0]?.[0] ?? "");
        const id = queuedReply.match(/CX-\d{8}-[A-Z0-9]{6}/u)?.[0];
        expect(id).toBeTruthy();
        const store = new CodexJobStore(join(dataDirectory, "codex"));
        await vi.waitFor(async () => {
            expect((await store.get(id ?? ""))?.result?.summary).toBe("local regular-member plan");
        });
        expect(send).toHaveBeenCalled();
    });
});
