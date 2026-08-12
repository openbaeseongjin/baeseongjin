import { describe, expect, it, vi } from "vitest";
import { DiscordPublisher } from "../src/discord-publisher.js";
import { renderDailyDocument } from "../src/markdown.js";
import type { MeetingMetadata, Minutes } from "../src/types.js";

describe("DiscordPublisher", () => {
  it("bounds message amplification and reports Discord-only truncation", async () => {
    type PublishedMessage = {
      content: string;
      allowedMentions: { parse: never[] };
    };
    const send = vi.fn(async (_message: PublishedMessage) => undefined);
    const client = {
      channels: {
        fetch: vi.fn(async () => ({ isTextBased: () => true, send })),
      },
    };
    const publisher = new DiscordPublisher(client as never, "minutes-channel");
    const markdown = Array.from(
      { length: 1_000 },
      (_, index) => `- ${index}: ${"가".repeat(100)}`,
    ).join("\n");

    await publisher.publish(markdown);

    expect(send).toHaveBeenCalledTimes(20);
    expect(send.mock.calls.at(-1)?.[0]).toEqual({
      content:
        "Minutes were truncated for Discord after 19 message chunks. Review the dated document or source channels for remaining details.",
      allowedMentions: { parse: [] },
    });
    expect(
      send.mock.calls.every((call) => call[0]?.allowedMentions.parse.length === 0),
    ).toBe(true);
  });

  it("publishes every classified section before truncating reference-heavy minutes", async () => {
    type PublishedMessage = {
      content: string;
      allowedMentions: { parse: never[] };
    };
    const send = vi.fn(async (_message: PublishedMessage) => undefined);
    const publisher = new DiscordPublisher(
      {
        channels: {
          fetch: vi.fn(async () => ({ isTextBased: () => true, send })),
        },
      } as never,
      "minutes-channel",
    );
    const metadata: MeetingMetadata = {
      id: "20260811-220000",
      guildId: "guild",
      startedAt: "2026-08-11T13:00:00.000Z",
      endedAt: "2026-08-11T14:00:00.000Z",
      startedBy: "성현",
      voiceChannelName: "회의방",
    };
    const references = Array.from({ length: 200 }, (_, index) => ({
      timestamp: "2026-08-11T13:10:00.000Z",
      channelName: "기획",
      authorName: "성현",
      note: `참고 자료 ${index} ${"가".repeat(500)}`,
      urls: [`https://example.com/reference/${index}`],
      attachments: [],
    }));
    const minutes: Minutes = {
      summary: ["논의: 로프", "결정: 도형", "할 일: 용호 — 구현"],
      discussed: ["로프 액션"],
      decided: ["도형 그래픽"],
      rejected: ["AI 추리게임"],
      hypotheses: ["수집 시스템"],
      actionItems: [{ owner: "용호", task: "로프 구현", due: null }],
      blockers: ["DAVE 확인"],
      nextMeeting: "내일 오후 10시",
      references,
    };

    await publisher.publish(renderDailyDocument(metadata, minutes));

    const published = send.mock.calls.map(([message]) => message.content).join("\n");
    for (const heading of [
      "### DISCUSSED",
      "### DECIDED",
      "### REJECTED",
      "### HYPOTHESES",
      "### ACTION ITEMS",
      "### BLOCKERS",
      "### NEXT MEETING",
    ]) {
      expect(published).toContain(heading);
    }
    expect(send).toHaveBeenCalledTimes(20);
    expect(send.mock.calls.at(-1)?.[0].content).toContain("truncated for Discord");
  });
});
