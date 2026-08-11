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
      summary: ["논의: 없음", "결정: 없음", "할 일: 없음"],
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
      "SUMMARY",
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
    expect(markdown.indexOf("### SUMMARY")).toBeLessThan(
      markdown.indexOf("### DISCUSSED"),
    );
    expect(
      markdown.match(/### SUMMARY\n\n([\s\S]*?)\n\n### DISCUSSED/u)?.[1]?.split("\n"),
    ).toEqual(["- 논의: 없음", "- 결정: 없음", "- 할 일: 없음"]);
  });

  it("renders five bounded summary lines safely before the detailed minutes", () => {
    const metadata: MeetingMetadata = {
      id: "20260809-220000",
      guildId: "123",
      startedAt: "2026-08-09T13:00:00.000Z",
      endedAt: "2026-08-09T14:00:00.000Z",
      startedBy: "진행자",
      voiceChannelName: "회의",
    };
    const minutes: Minutes = {
      summary: [
        `결정: ${"*".repeat(235)} 외 1건`,
        "할 일: 용호 — 로프 구현",
        "블로커: <script>alert(1)</script>",
        "다음 회의: 내일 22시",
        `논의: ${"<".repeat(240)}`,
      ],
      discussed: ["로프 액션"],
      decided: ["2D 횡스크롤"],
      rejected: [],
      hypotheses: [],
      actionItems: [{ owner: "용호", task: "로프 구현", due: null }],
      blockers: ["테스트"],
      nextMeeting: "내일 22시",
    };

    const markdown = renderDailyDocument(metadata, minutes);
    const summary = markdown.match(/### SUMMARY\n\n([\s\S]*?)\n\n### DISCUSSED/u)?.[1];
    const summaryLines = summary?.split("\n") ?? [];

    expect(summaryLines).toHaveLength(5);
    expect(summaryLines.every((line) => line.length <= 242)).toBe(true);
    expect(summaryLines[0]).toMatch(/ 외 1건$/u);
    expect(summary).toContain("&lt;script&gt;alert\\(1\\)&lt;/script&gt;");
    expect(summary).not.toContain("<script>");
  });

  it("splits Discord posts below the configured limit", () => {
    const chunks = splitMarkdown(Array.from({ length: 100 }, (_, index) => `- item ${index}`).join("\n"), 100);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 100)).toBe(true);
  });

  it("prevents transcript text from injecting HTML or new markdown lines", () => {
    expect(markdownText("hello\n<script>alert(1)</script>")).toBe(
      "hello &lt;script&gt;alert\\(1\\)&lt;/script&gt;",
    );
  });

  it("renders untrusted Markdown links and formatting as literal text", () => {
    expect(markdownText("[공식](https://attacker.example) # **제목** `코드` ||숨김||")).toBe(
      "\\[공식\\]\\(https://attacker.example\\) \\# \\*\\*제목\\*\\* \\`코드\\` \\|\\|숨김\\|\\|",
    );
  });
});
