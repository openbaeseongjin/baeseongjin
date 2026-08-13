import { PermissionFlagsBits } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.js";
import { MeetingManager } from "../src/meeting-manager.js";
import type { Minutes, TranscriptEntry } from "../src/types.js";

function config(overrides: NodeJS.ProcessEnv = {}) {
  return loadConfig({
    DISCORD_BOT_TOKEN: "discord-token",
    DISCORD_CLIENT_ID: "12345678901234567",
    DISCORD_GUILD_ID: "12345678901234568",
    DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
    DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
    GITHUB_TOKEN: "github-token",
    ...overrides,
  });
}

interface ViewOverwriteSpec {
  id: string;
  type: number;
  allow?: boolean;
  deny?: boolean;
}

function overwriteCache(overwrites: ViewOverwriteSpec[]) {
  return new Map(
    overwrites.map((overwrite) => [
      overwrite.id,
      {
        id: overwrite.id,
        type: overwrite.type,
        allow: { has: (permission: bigint) => Boolean(overwrite.allow) && permission === PermissionFlagsBits.ViewChannel },
        deny: { has: (permission: bigint) => Boolean(overwrite.deny) && permission === PermissionFlagsBits.ViewChannel },
      },
    ]),
  );
}

function permissionChannel(
  parentId: string | null = "shared-category",
  canView = true,
  overwrites: ViewOverwriteSpec[] = [],
) {
  return {
    parentId,
    isTextBased: (): boolean => true,
    permissionsFor: () => ({ has: () => canView }),
    permissionOverwrites: { cache: overwriteCache(overwrites) },
  };
}

function categoryChannel(overwrites: ViewOverwriteSpec[] = []) {
  return {
    permissionOverwrites: { cache: overwriteCache(overwrites) },
  };
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
      channels: {
        cache: new Map(),
        fetch: vi.fn(async () => permissionChannel()),
      },
    };
    const manager = new MeetingManager({} as never, config(), {} as never);
    const commandTime = new Date("2026-08-11T13:00:00.000Z");
    const interaction = {
      commandName: "meeting",
      createdAt: commandTime,
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
    expect(
      (manager as unknown as { active?: { startedAt: Date } }).active?.startedAt,
    ).toEqual(commandTime);
  });

  it("captures human messages and safe attachment metadata from configured reference channels", async () => {
    const manager = new MeetingManager(
      {} as never,
      config({ DISCORD_REFERENCE_CHANNEL_IDS: "12345678901234572,12345678901234573" }),
      {} as never,
    );
    const guild = {
      members: {
        fetch: vi.fn(async () => ({
          displayName: "Regular Member",
          voice: { channel: null },
        })),
      },
      channels: {
        cache: new Map(),
        fetch: vi.fn(async () => permissionChannel()),
      },
    };
    const editReply = vi.fn(async () => undefined);
    await manager.handleCommand({
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
    } as never);

    expect(editReply).toHaveBeenCalledWith(expect.stringContaining("<#12345678901234572>"));
    expect(editReply).toHaveBeenCalledWith(expect.stringContaining("republished"));

    const baseMessage = {
      id: "planning-message",
      createdAt: new Date(Date.now() + 1_000),
      guildId: "12345678901234568",
      channelId: "12345678901234572",
      channel: { name: "기획" },
      author: { id: "member-1", bot: false, displayName: "성현" },
      member: { displayName: "성현" },
      content: "산나비 로프 참고 https://example.com/rope",
      attachments: new Map([
        [
          "attachment-1",
          {
            name: "rope-reference.png",
            contentType: "image/png",
            size: 4096,
            url: "https://cdn.discordapp.com/signed-secret",
            proxyURL: "https://media.discordapp.net/signed-secret",
          },
        ],
      ]),
    };
    manager.captureMessage(baseMessage as never);
    manager.captureMessage({
      ...baseMessage,
      id: "other-channel",
      channelId: "12345678901234999",
      channel: { name: "잡담" },
    } as never);
    manager.captureMessage({
      ...baseMessage,
      id: "bot-message",
      channelId: "12345678901234573",
      channel: { name: "코딩" },
      author: { ...baseMessage.author, bot: true },
    } as never);

    const active = (
      manager as unknown as {
        active?: { messages: Array<Record<string, unknown>> };
      }
    ).active;
    expect(active?.messages).toEqual([
      {
        id: "planning-message",
        channelId: "12345678901234572",
        channelName: "기획",
        timestamp: baseMessage.createdAt.toISOString(),
        authorId: "member-1",
        authorName: "성현",
        content: "산나비 로프 참고 https://example.com/rope",
        attachments: [
          { name: "rope-reference.png", contentType: "image/png", sizeBytes: 4096 },
        ],
      },
    ]);
    expect(JSON.stringify(active?.messages)).not.toContain("signed-secret");
  });

  it("refuses multi-channel capture when the minutes audience policy differs", async () => {
    const reply = vi.fn(async () => undefined);
    const deferReply = vi.fn(async () => undefined);
    const member = { displayName: "Regular Member", voice: { channel: null } };
    const guild = {
      members: { fetch: vi.fn(async () => member) },
      channels: {
        cache: new Map(),
        fetch: vi.fn(async (id: string) => {
          if (id === "12345678901234572") {
            return permissionChannel("private-category");
          }
          if (id === "private-category") {
            return categoryChannel([{ id: "private-team-role", type: 0, allow: true }]);
          }
          if (id === "public-category") {
            return categoryChannel([{ id: "everyone-role", type: 0, allow: true }]);
          }
          return permissionChannel("public-category");
        }),
      },
    };
    const manager = new MeetingManager(
      {} as never,
      config({ DISCORD_REFERENCE_CHANNEL_IDS: "12345678901234572" }),
      {} as never,
    );

    const editReply = vi.fn(async () => undefined);
    await manager.handleCommand({
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      options: { getSubcommand: () => "start" },
      reply,
      deferReply,
      editReply,
    } as never);

    expect(editReply).toHaveBeenCalledWith(expect.stringContaining("visibility"));
    expect(reply).not.toHaveBeenCalled();
    expect(deferReply).toHaveBeenCalledOnce();
    expect((manager as unknown as { active?: unknown }).active).toBeUndefined();
  });

  it("allows multi-channel capture when channels sit under different categories with the same resolved audience", async () => {
    const deferReply = vi.fn(async () => undefined);
    const member = { displayName: "Regular Member", voice: { channel: null } };
    const guild = {
      members: { fetch: vi.fn(async () => member) },
      channels: {
        cache: new Map(),
        fetch: vi.fn(async (id: string) => {
          if (id === "12345678901234569") {
            return permissionChannel("category-x");
          }
          if (id === "12345678901234570") {
            return permissionChannel("category-y");
          }
          if (id === "category-x" || id === "category-y") {
            return categoryChannel([{ id: "team-role", type: 0, allow: true }]);
          }
          return permissionChannel("category-x");
        }),
      },
    };
    const manager = new MeetingManager({} as never, config(), {} as never);

    const editReply = vi.fn(async () => undefined);
    await manager.handleCommand({
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      options: { getSubcommand: () => "start" },
      reply: vi.fn(async () => undefined),
      deferReply,
      editReply,
    } as never);

    expect(editReply).toHaveBeenCalledWith(expect.stringContaining("started"));
    expect(
      (manager as unknown as { active?: { startedAt: Date } }).active,
    ).toBeDefined();
  });

  it("refuses multi-channel capture when the requester cannot view every source", async () => {
    const reply = vi.fn(async () => undefined);
    const member = { displayName: "Regular Member", voice: { channel: null } };
    const guild = {
      members: { fetch: vi.fn(async () => member) },
      channels: {
        cache: new Map(),
        fetch: vi.fn(async (channelId: string) =>
          permissionChannel("shared-category", channelId !== "12345678901234572"),
        ),
      },
    };
    const manager = new MeetingManager(
      {} as never,
      config({ DISCORD_REFERENCE_CHANNEL_IDS: "12345678901234572" }),
      {} as never,
    );

    const editReply = vi.fn(async () => undefined);
    await manager.handleCommand({
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      options: { getSubcommand: () => "start" },
      reply,
      deferReply: vi.fn(async () => undefined),
      editReply,
    } as never);

    expect(editReply).toHaveBeenCalledWith(expect.stringContaining("cannot view"));
    expect(reply).not.toHaveBeenCalled();
    expect((manager as unknown as { active?: unknown }).active).toBeUndefined();
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
      channels: {
        cache: new Map(),
        fetch: vi.fn(async () => permissionChannel()),
      },
    };
    const ollama = {
      ensureReady: vi.fn(async () => ({ state: "ready" as const, started: true })),
    };
    const manager = new MeetingManager(
      {} as never,
      config({
        CODEX_ENABLED: "false",
        MEETING_CLASSIFIER_ENABLED: "true",
        MEETING_CLASSIFIER_MODEL: "qwen2.5:7b-instruct",
      }),
      {} as never,
      ollama,
    );
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
    expect(editReply).toHaveBeenCalledWith(expect.stringContaining("meeting classification"));
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
    const historyByChannel = new Map<string, Map<string, unknown>>();
    const client = {
      channels: {
        fetch: vi.fn(async (channelId: string) =>
          channelId === "12345678901234570"
            ? { isTextBased: (): boolean => true, send: minutesSend }
            : {
                isTextBased: (): boolean => true,
                messages: {
                  fetch: vi.fn(async () => historyByChannel.get(channelId) ?? new Map()),
                },
              },
        ),
      },
    };
    const github = {
      syncMeeting: vi.fn(async (_metadata: unknown, _minutes: Minutes) => ({
        paths: [],
        commitSha: "1234567",
      })),
    };
    const manager = new MeetingManager(
      client as never,
      config({ DISCORD_REFERENCE_CHANNEL_IDS: "12345678901234572" }),
      github as never,
      {
        ensureReady: vi.fn(async () => readiness),
      },
    );
    const localProcessing = {
      transcribe: vi.fn(async () => ({ entries: [], failures: ["segment failed"] })),
      summarize: vi.fn(
        (): Minutes => ({
          summary: ["블로커: 기존 제품 블로커", "결정: 없음", "할 일: 없음"],
          discussed: [],
          decided: [],
          rejected: [],
          hypotheses: [],
          references: [],
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
      channels: {
        cache: new Map(),
        fetch: vi.fn(async () => permissionChannel()),
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
    const referenceMessage = {
      id: "planning-reference",
      createdAt: new Date(),
      guildId: "12345678901234568",
      channelId: "12345678901234572",
      channel: { name: "기획" },
      author: { id: "member-1", bot: false, displayName: "성현" },
      member: { displayName: "성현" },
      content: "산나비 로프 참고 https://example.com/rope",
      attachments: new Map(),
    };
    manager.captureMessage(referenceMessage as never);
    historyByChannel.set(
      "12345678901234572",
      new Map([[referenceMessage.id, referenceMessage]]),
    );
    await manager.handleCommand(endInteraction as never);
    releaseOllama?.({ state: "ready", started: true });
    await start;
    await new Promise<void>((resolvePromise) => setImmediate(resolvePromise));

    expect(captureStartedBeforeOllama).toBe(true);
    expect(endEditReply).toHaveBeenCalledWith(expect.stringContaining("ended"));
    expect(github.syncMeeting.mock.calls[0]?.[1].summary[0]).toBe(
      "블로커: 1 voice segment(s) could not be transcribed; no content from them was promoted. 외 1건",
    );
    expect(github.syncMeeting.mock.calls[0]?.[1].references).toEqual([
      {
        timestamp: expect.any(String),
        channelName: "기획",
        authorName: "성현",
        note: "산나비 로프 참고",
        urls: ["https://example.com/rope"],
        attachments: [],
      },
    ]);
    expect(minutesSend).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining("### REFERENCES") }),
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
      channels: {
        cache: new Map(),
        fetch: vi.fn(async () => permissionChannel()),
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

  it("claims the end boundary before awaiting and rejects a concurrent end", async () => {
    let releaseDefer: (() => void) | undefined;
    const pendingDefer = new Promise<void>((resolvePromise) => {
      releaseDefer = resolvePromise;
    });
    const minutesSend = vi.fn(async () => undefined);
    const client = {
      channels: {
        fetch: vi.fn(async (channelId: string) =>
          channelId === "12345678901234570"
            ? { isTextBased: (): boolean => true, send: minutesSend }
            : {
                isTextBased: (): boolean => true,
                messages: { fetch: vi.fn(async () => new Map()) },
              },
        ),
      },
    };
    const github = {
      syncMeeting: vi.fn(async () => ({ paths: [], commitSha: "1234567" })),
    };
    const manager = new MeetingManager(client as never, config(), github as never, {
      ensureReady: vi.fn(async () => ({ state: "skipped" as const })),
    });
    const localProcessing = {
      transcribe: vi.fn(async (_messages: unknown[]) => ({ entries: [], failures: [] })),
      summarize: vi.fn(
        async (): Promise<Minutes> => ({
          summary: ["논의: 없음", "결정: 없음", "할 일: 없음"],
          discussed: [],
          decided: [],
          rejected: [],
          hypotheses: [],
          references: [],
          actionItems: [],
          blockers: [],
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
      channels: {
        cache: new Map(),
        fetch: vi.fn(async () => permissionChannel()),
      },
    };
    const baseInteraction = {
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      reply: vi.fn(async () => undefined),
      editReply: vi.fn(async () => undefined),
    };
    await manager.handleCommand({
      ...baseInteraction,
      options: { getSubcommand: () => "start" },
      deferReply: vi.fn(async () => undefined),
    } as never);

    const firstEnd = {
      ...baseInteraction,
      createdAt: new Date(),
      options: { getSubcommand: () => "end" },
      deferReply: vi.fn(async () => pendingDefer),
    };
    const endPromise = manager.handleCommand(firstEnd as never);
    await vi.waitFor(() => expect(firstEnd.deferReply).toHaveBeenCalledOnce());

    expect((manager as unknown as { active?: unknown }).active).toBeUndefined();
    expect((manager as unknown as { ending: boolean }).ending).toBe(true);
    manager.captureMessage({
      id: "after-end",
      createdAt: new Date(),
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      channel: { name: "회의" },
      author: { id: "member-1", bot: false, displayName: "성현" },
      member: { displayName: "성현" },
      content: "종료 뒤 메시지",
      attachments: new Map(),
    } as never);
    const concurrentReply = vi.fn(async () => undefined);
    await manager.handleCommand({
      ...baseInteraction,
      options: { getSubcommand: () => "end" },
      reply: concurrentReply,
      deferReply: vi.fn(async () => undefined),
    } as never);

    expect(concurrentReply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining("already ending") }),
    );
    releaseDefer?.();
    await endPromise;
    expect(localProcessing.transcribe.mock.calls[0]?.[0]).toEqual([]);
    expect((manager as unknown as { ending: boolean }).ending).toBe(false);
  });

  it("passes the raw transcript entries through to the GitHub sync", async () => {
    const minutesSend = vi.fn(async () => undefined);
    const client = {
      channels: {
        fetch: vi.fn(async (channelId: string) =>
          channelId === "12345678901234570"
            ? { isTextBased: (): boolean => true, send: minutesSend }
            : {
                isTextBased: (): boolean => true,
                messages: { fetch: vi.fn(async () => new Map()) },
              },
        ),
      },
    };
    const github = {
      syncMeeting: vi.fn(async (_metadata: unknown, _minutes: Minutes, _transcript: TranscriptEntry[]) => ({
        paths: [],
        commitSha: "1234567",
      })),
    };
    const manager = new MeetingManager(client as never, config(), github as never, {
      ensureReady: vi.fn(async () => ({ state: "skipped" as const })),
    });
    const transcriptEntries = [
      {
        id: "text:1",
        source: "text" as const,
        timestamp: "2026-08-12T13:00:00.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "12345678901234569",
        channelName: "회의",
        text: "오늘 시작할까요",
      },
    ];
    const localProcessing = {
      transcribe: vi.fn(async (_messages: unknown[]) => ({ entries: transcriptEntries, failures: [] })),
      summarize: vi.fn(
        async (): Promise<Minutes> => ({
          summary: ["논의: 없음", "결정: 없음", "할 일: 없음"],
          discussed: [],
          decided: [],
          rejected: [],
          hypotheses: [],
          references: [],
          actionItems: [],
          blockers: [],
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
      channels: {
        cache: new Map(),
        fetch: vi.fn(async () => permissionChannel()),
      },
    };
    const baseInteraction = {
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      reply: vi.fn(async () => undefined),
      editReply: vi.fn(async () => undefined),
    };

    await manager.handleCommand({
      ...baseInteraction,
      options: { getSubcommand: () => "start" },
      deferReply: vi.fn(async () => undefined),
    } as never);
    await manager.handleCommand({
      ...baseInteraction,
      createdAt: new Date(),
      options: { getSubcommand: () => "end" },
      deferReply: vi.fn(async () => undefined),
    } as never);

    expect(github.syncMeeting.mock.calls[0]?.[2]).toEqual(transcriptEntries);
  });
});
