import { describe, expect, it } from "vitest";
import { markdownText, renderDailyDocument, splitMarkdown } from "../src/markdown.js";
import type { MeetingMetadata, Minutes } from "../src/types.js";

describe("minutes markdown", () => {
  it("renders every required section", () => {
    const metadata: MeetingMetadata = {
      id: "20260809-220000",
      guildId: "123",
      startedAt: "2026-08-09T13:00:00.000Z",
      endedAt: "2026-08-09T14:00:00.000Z",
      startedBy: "진행자",
      voiceChannelName: "회의",
    };
    const minutes: Minutes = {
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    };
    const markdown = renderDailyDocument(metadata, minutes);

    for (const heading of [
      "DISCUSSED",
      "DECIDED",
      "REJECTED",
      "HYPOTHESES",
      "ACTION ITEMS",
      "BLOCKERS",
      "NEXT MEETING",
    ]) {
      expect(markdown).toContain(`### ${heading}`);
    }
  });

  it("splits Discord posts below the configured limit", () => {
    const chunks = splitMarkdown(Array.from({ length: 100 }, (_, index) => `- item ${index}`).join("\n"), 100);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 100)).toBe(true);
  });

  it("prevents transcript text from injecting HTML or new markdown lines", () => {
    expect(markdownText("hello\n<script>alert(1)</script>")).toBe(
      "hello &lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });
});
