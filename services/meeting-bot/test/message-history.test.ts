import { describe, expect, it, vi } from "vitest";
import { reconcileMeetingMessages } from "../src/message-history.js";
import type { TextMessageRecord } from "../src/types.js";

function discordMessage(options: {
  id: string;
  channelId?: string;
  createdAt: string;
  content: string;
}) {
  return {
    id: options.id,
    guildId: "12345678901234568",
    channelId: options.channelId ?? "12345678901234572",
    channel: { name: "기획" },
    createdAt: new Date(options.createdAt),
    author: { id: "member-1", bot: false, displayName: "성현" },
    member: { displayName: "성현" },
    content: options.content,
    attachments: new Map(),
  };
}

function liveRecord(id: string, channelId: string, content: string): TextMessageRecord {
  return {
    id,
    channelId,
    channelName: channelId === "12345678901234572" ? "기획" : "코딩",
    timestamp: "2026-08-11T13:10:00.000Z",
    authorId: "member-1",
    authorName: "성현",
    content,
    attachments: [],
  };
}

describe("meeting message history reconciliation", () => {
  it("uses final channel state for edits, deletions, and gateway-missed messages", async () => {
    const fetchHistory = vi.fn(async () =>
      new Map([
        [
          "missed",
          discordMessage({
            id: "missed",
            createdAt: "2026-08-11T13:15:00.000Z",
            content: "게이트웨이가 놓친 참고 https://example.com/missed",
          }),
        ],
        [
          "edited",
          discordMessage({
            id: "edited",
            createdAt: "2026-08-11T13:10:00.000Z",
            content: "수정된 최종 내용",
          }),
        ],
        [
          "before-start",
          discordMessage({
            id: "before-start",
            createdAt: "2026-08-11T12:59:59.000Z",
            content: "회의 전 메시지",
          }),
        ],
      ]),
    );
    const client = {
      channels: {
        fetch: vi.fn(async () => ({
          isTextBased: () => true,
          messages: { fetch: fetchHistory },
        })),
      },
    };

    const result = await reconcileMeetingMessages(client as never, {
      guildId: "12345678901234568",
      captureChannelIds: ["12345678901234572"],
      startedAt: new Date("2026-08-11T13:00:00.000Z"),
      endedAt: new Date("2026-08-11T14:00:00.000Z"),
      liveMessages: [
        liveRecord("edited", "12345678901234572", "수정 전 내용"),
        liveRecord("deleted", "12345678901234572", "삭제된 메시지"),
      ],
      maxMessages: 5_000,
    });

    expect(result.warnings).toEqual([]);
    expect(result.messages.map((message) => [message.id, message.content])).toEqual([
      ["edited", "수정된 최종 내용"],
      ["missed", "게이트웨이가 놓친 참고 https://example.com/missed"],
    ]);
    expect(fetchHistory).toHaveBeenCalledWith({ limit: 100, before: expect.any(String) });
  });

  it("preserves live capture for a channel when history access fails", async () => {
    const client = {
      channels: {
        fetch: vi.fn(async () => {
          throw new Error("Missing Access");
        }),
      },
    };
    const live = liveRecord("coding-live", "12345678901234573", "코딩 자료");

    const result = await reconcileMeetingMessages(client as never, {
      guildId: "12345678901234568",
      captureChannelIds: ["12345678901234573"],
      startedAt: new Date("2026-08-11T13:00:00.000Z"),
      endedAt: new Date("2026-08-11T14:00:00.000Z"),
      liveMessages: [live],
      maxMessages: 5_000,
    });

    expect(result.messages).toEqual([live]);
    expect(result.warnings).toEqual([
      "Message history reconciliation failed for one capture channel; live capture was retained.",
    ]);
    expect(JSON.stringify(result)).not.toContain("Missing Access");
  });

  it("retains the most recent messages when the reconciled total reaches its cap", async () => {
    const client = {
      channels: {
        fetch: vi.fn(async () => {
          throw new Error("offline");
        }),
      },
    };
    const old = liveRecord("old", "12345678901234573", "초반 메시지");
    const middle = { ...liveRecord("middle", "12345678901234573", "중간 메시지"), timestamp: "2026-08-11T13:20:00.000Z" };
    const latest = { ...liveRecord("latest", "12345678901234573", "최종 결정"), timestamp: "2026-08-11T13:30:00.000Z" };

    const result = await reconcileMeetingMessages(client as never, {
      guildId: "12345678901234568",
      captureChannelIds: ["12345678901234573"],
      startedAt: new Date("2026-08-11T13:00:00.000Z"),
      endedAt: new Date("2026-08-11T14:00:00.000Z"),
      liveMessages: [old, middle, latest],
      maxMessages: 2,
    });

    expect(result.messages.map((message) => message.id)).toEqual(["middle", "latest"]);
    expect(result.warnings).toContain("The reconciled text message capture limit was reached.");
  });

  it("retains live capture when the page cap is reached before the start boundary", async () => {
    let pageIndex = 0;
    const fetchHistory = vi.fn(async () => {
      const currentPage = pageIndex;
      pageIndex += 1;
      return new Map(
        Array.from({ length: 100 }, (_, index) => {
          const id = `history-${currentPage}-${index}`;
          return [
            id,
            discordMessage({
              id,
              createdAt: "2026-08-11T13:59:00.000Z",
              content: `기록 ${currentPage}-${index}`,
            }),
          ];
        }),
      );
    });
    const client = {
      channels: {
        fetch: vi.fn(async () => ({
          isTextBased: () => true,
          messages: { fetch: fetchHistory },
        })),
      },
    };
    const live = liveRecord("live-important", "12345678901234572", "실시간 중요 기록");

    const result = await reconcileMeetingMessages(client as never, {
      guildId: "12345678901234568",
      captureChannelIds: ["12345678901234572"],
      startedAt: new Date("2026-08-11T13:00:00.000Z"),
      endedAt: new Date("2026-08-11T14:00:00.000Z"),
      liveMessages: [live],
      maxMessages: 6_000,
    });

    expect(fetchHistory).toHaveBeenCalledTimes(50);
    expect(result.messages.some((message) => message.id === "live-important")).toBe(true);
    expect(result.warnings).toContain(
      "Message history reconciliation was incomplete for one capture channel; live capture was retained.",
    );
  });
});
