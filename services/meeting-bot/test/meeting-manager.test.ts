import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.js";
import { MeetingManager } from "../src/meeting-manager.js";
import type { Minutes } from "../src/types.js";

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

  it("reports that Ollama was started automatically with the meeting", async () => {
    const editReply = vi.fn(async () => undefined);
    const guild = {
      members: {
        fetch: vi.fn(async () => ({
          displayName: "Regular Member",
          voice: { channel: null },
        })),
      },
    };
    const ollama = {
      ensureReady: vi.fn(async () => ({ state: "ready" as const, started: true })),
    };
    const manager = new MeetingManager({} as never, config(), {} as never, ollama);
    const interaction = {
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      options: { getSubcommand: () => "start" },
      reply: vi.fn(async () => undefined),
      deferReply: vi.fn(async () => undefined),
      editReply,
    };

    await manager.handleCommand(interaction as never);

    expect(editReply).toHaveBeenCalledWith(expect.stringContaining("Ollama started automatically"));
  });

  it("rejects a second start after capture begins while Ollama is still preparing", async () => {
    let releaseOllama: ((value: { state: "ready"; started: boolean }) => void) | undefined;
    const firstReadiness = new Promise<{ state: "ready"; started: boolean }>((resolvePromise) => {
      releaseOllama = resolvePromise;
    });
    const ollama = {
      ensureReady: vi
        .fn()
        .mockImplementationOnce(async () => firstReadiness)
        .mockResolvedValue({ state: "ready" as const, started: false }),
    };
    const guild = {
      members: {
        fetch: vi.fn(async () => ({
          displayName: "Regular Member",
          voice: { channel: null },
        })),
      },
    };
    const manager = new MeetingManager({} as never, config(), {} as never, ollama);
    const first = {
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      options: { getSubcommand: () => "start" },
      reply: vi.fn(async () => undefined),
      deferReply: vi.fn(async () => undefined),
      editReply: vi.fn(async () => undefined),
    };
    const secondReply = vi.fn(async () => undefined);
    const second = {
      ...first,
      reply: secondReply,
      deferReply: vi.fn(async () => undefined),
      editReply: vi.fn(async () => undefined),
    };

    const firstStart = manager.handleCommand(first as never);
    await vi.waitFor(() => expect(first.deferReply).toHaveBeenCalledOnce());
    await manager.handleCommand(second as never);
    releaseOllama?.({ state: "ready", started: true });
    await firstStart;

    expect(secondReply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining("already") }),
    );
  });

  it("starts and can end the meeting while Ollama is still preparing", async () => {
    let releaseOllama: ((value: { state: "ready"; started: boolean }) => void) | undefined;
    const readiness = new Promise<{ state: "ready"; started: boolean }>((resolvePromise) => {
      releaseOllama = resolvePromise;
    });
    const minutesSend = vi.fn(async () => undefined);
    const client = {
      channels: {
        fetch: vi.fn(async () => ({ isTextBased: () => true, send: minutesSend })),
      },
    };
    const github = {
      syncMeeting: vi.fn(async (_metadata: unknown, _minutes: Minutes) => ({
        paths: [],
        commitSha: "1234567",
      })),
    };
    const manager = new MeetingManager(client as never, config(), github as never, {
      ensureReady: vi.fn(async () => readiness),
    });
    const localProcessing = {
      transcribe: vi.fn(async () => ({ entries: [], failures: ["segment failed"] })),
      summarize: vi.fn(
        (): Minutes => ({
          summary: ["블로커: 기존 제품 블로커", "결정: 없음", "할 일: 없음"],
          discussed: [],
          decided: [],
          rejected: [],
          hypotheses: [],
          actionItems: [],
          blockers: ["기존 제품 블로커"],
          nextMeeting: null,
        }),
      ),
    };
    (manager as unknown as { localProcessing: typeof localProcessing }).localProcessing = localProcessing;
    const guild = {
      members: {
        fetch: vi.fn(async () => ({
          displayName: "Regular Member",
          voice: { channel: null },
        })),
      },
    };
    const startEditReply = vi.fn(async () => undefined);
    const startInteraction = {
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      options: { getSubcommand: () => "start" },
      reply: vi.fn(async () => undefined),
      deferReply: vi.fn(async () => undefined),
      editReply: startEditReply,
    };
    const endEditReply = vi.fn(async () => undefined);
    const endInteraction = {
      ...startInteraction,
      options: { getSubcommand: () => "end" },
      reply: vi.fn(async () => undefined),
      deferReply: vi.fn(async () => undefined),
      editReply: endEditReply,
    };

    const start = manager.handleCommand(startInteraction as never);
    for (let index = 0; index < 5; index += 1) {
      await new Promise<void>((resolvePromise) => setImmediate(resolvePromise));
    }
    const captureStartedBeforeOllama = startEditReply.mock.calls.length > 0;
    await manager.handleCommand(endInteraction as never);
    releaseOllama?.({ state: "ready", started: true });
    await start;
    await new Promise<void>((resolvePromise) => setImmediate(resolvePromise));

    expect(captureStartedBeforeOllama).toBe(true);
    expect(endEditReply).toHaveBeenCalledWith(expect.stringContaining("ended"));
    expect(github.syncMeeting.mock.calls[0]?.[1].summary[0]).toBe(
      "블로커: 1 voice segment(s) could not be transcribed; no content from them was promoted. 외 1건",
    );
    expect((manager as unknown as { active?: unknown }).active).toBeUndefined();
  });

  it("keeps the meeting active and reports a warning when Ollama preparation throws", async () => {
    const editReply = vi.fn(async () => undefined);
    const guild = {
      members: {
        fetch: vi.fn(async () => ({
          displayName: "Regular Member",
          voice: { channel: null },
        })),
      },
    };
    const manager = new MeetingManager({} as never, config(), {} as never, {
      ensureReady: vi.fn(async () => {
        throw new Error("local startup failed");
      }),
    });
    const interaction = {
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      options: { getSubcommand: () => "start" },
      reply: vi.fn(async () => undefined),
      deferReply: vi.fn(async () => undefined),
      editReply,
    };

    await manager.handleCommand(interaction as never);
    await vi.waitFor(() =>
      expect(editReply).toHaveBeenLastCalledWith(expect.stringContaining("Ollama is unavailable")),
    );

    expect((manager as unknown as { active?: unknown }).active).toBeDefined();
  });
});
