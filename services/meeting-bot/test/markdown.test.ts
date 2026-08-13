import { describe, expect, it } from "vitest";
import { markdownText, renderDailyDocument, renderTranscriptSection, splitMarkdown } from "../src/markdown.js";
import type { MeetingMetadata, Minutes, TranscriptEntry } from "../src/types.js";

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
      references: [],
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
      "REFERENCES",
      "ACTION ITEMS",
      "BLOCKERS",
      "NEXT MEETING",
    ]) {
      expect(markdown).toContain(`### ${heading}`);
    }
    expect(markdown.indexOf("### SUMMARY")).toBeLessThan(
      markdown.indexOf("### DISCUSSED"),
    );
    expect(markdown.indexOf("### HYPOTHESES")).toBeLessThan(
      markdown.indexOf("### ACTION ITEMS"),
    );
    expect(markdown.indexOf("### NEXT MEETING")).toBeLessThan(
      markdown.indexOf("### REFERENCES"),
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
      references: [],
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

  it("renders reference metadata safely without channel IDs or Markdown injection", () => {
    const metadata: MeetingMetadata = {
      id: "20260811-221000",
      guildId: "123",
      startedAt: "2026-08-11T13:00:00.000Z",
      endedAt: "2026-08-11T14:00:00.000Z",
      startedBy: "진행자",
      voiceChannelName: "회의",
    };
    const minutes: Minutes = {
      summary: ["논의: 참고자료", "결정: 없음", "할 일: 없음"],
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      references: [
        {
          timestamp: "2026-08-11T13:10:00.000Z",
          channelName: "기획\n### DECIDED",
          authorName: "@everyone **성현**",
          note: "[산나비](https://attacker.example) `자료`",
          urls: ["https://example.com/rope"],
          attachments: [
            {
              name: "rope\n### ACTION ITEMS.png",
              contentType: "image/png",
              sizeBytes: 4096,
            },
          ],
        },
      ],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    };

    const markdown = renderDailyDocument(metadata, minutes);
    const references = markdown.match(/### REFERENCES\n\n([\s\S]*)$/u)?.[1] ?? "";

    expect(references).toContain("22:10 KST");
    expect(references).toContain("Channel: 기획 \\#\\#\\# DECIDED");
    expect(references).toContain("By: @everyone \\*\\*성현\\*\\*");
    expect(references).toContain("https://example.com/rope");
    expect(references).toContain("rope \\#\\#\\# ACTION ITEMS.png");
    expect(markdown.match(/^### ACTION ITEMS$/gmu)).toHaveLength(1);
    expect(markdown).not.toContain("channel-planning");
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

describe("transcript markdown", () => {
  const metadata: MeetingMetadata = {
    id: "20260812-220000",
    guildId: "123",
    startedAt: "2026-08-12T13:00:00.000Z",
    endedAt: "2026-08-12T14:00:00.000Z",
    startedBy: "진행자",
    voiceChannelName: "회의",
  };

  it("renders each entry with KST time, speaker, source, and channel", () => {
    const entries: TranscriptEntry[] = [
      {
        id: "text:1",
        source: "text",
        timestamp: "2026-08-12T13:00:03.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "c1",
        channelName: "회의",
        text: "오늘 시작할까요",
      },
      {
        id: "voice:1",
        source: "voice",
        timestamp: "2026-08-12T13:01:00.000Z",
        speakerId: "u2",
        speaker: "용호",
        text: "네 시작합시다",
      },
    ];

    const markdown = renderTranscriptSection(metadata, entries);

    expect(markdown).toContain("<!-- meeting-id:20260812-220000 -->");
    expect(markdown).toContain("- 22:00 KST — 성진 (text, #회의): 오늘 시작할까요");
    expect(markdown).toContain("- 22:01 KST — 용호 (voice): 네 시작합시다");
    expect(markdown.indexOf("성진")).toBeLessThan(markdown.indexOf("용호"));
  });

  it("does not truncate a very long transcript entry", () => {
    const longText = "가".repeat(5_000);
    const entries: TranscriptEntry[] = [
      {
        id: "text:1",
        source: "text",
        timestamp: "2026-08-12T13:00:00.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "c1",
        channelName: "회의",
        text: longText,
      },
    ];

    const markdown = renderTranscriptSection(metadata, entries);

    expect(markdown).toContain(longText);
  });

  it("escapes markdown control characters in transcript text", () => {
    const entries: TranscriptEntry[] = [
      {
        id: "text:1",
        source: "text",
        timestamp: "2026-08-12T13:00:00.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "c1",
        channelName: "회의",
        text: "[링크](https://attacker.example) **강조**",
      },
    ];

    const markdown = renderTranscriptSection(metadata, entries);

    expect(markdown).toContain(
      "\\[링크\\]\\(https://attacker.example\\) \\*\\*강조\\*\\*",
    );
  });
});
