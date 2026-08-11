import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.js";
import { MeetingManager } from "../src/meeting-manager.js";

function config() {
  return loadConfig({
    DISCORD_BOT_TOKEN: "discord-token",
    DISCORD_CLIENT_ID: "12345678901234567",
    DISCORD_GUILD_ID: "12345678901234568",
    DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
    DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
    GITHUB_TOKEN: "github-token",
  });
}

describe("MeetingManager", () => {
  it("lets a regular guild member start a meeting in the configured channel", async () => {
    const reply = vi.fn(async () => undefined);
    const deferReply = vi.fn(async () => undefined);
    const editReply = vi.fn(async () => undefined);
    const guild = {
      members: {
        fetch: vi.fn(async () => ({
          displayName: "Regular Member",
          voice: { channel: null },
        })),
      },
    };
    const manager = new MeetingManager({} as never, config(), {} as never);
    const interaction = {
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      member: { roles: [] },
      memberPermissions: { has: () => false },
      user: { id: "12345678901234571" },
      options: { getSubcommand: () => "start" },
      reply,
      deferReply,
      editReply,
    };

    await manager.handleCommand(interaction as never);

    expect(reply).not.toHaveBeenCalled();
    expect(deferReply).toHaveBeenCalledOnce();
    expect(editReply).toHaveBeenCalledWith(expect.stringContaining("started"));
  });
});
