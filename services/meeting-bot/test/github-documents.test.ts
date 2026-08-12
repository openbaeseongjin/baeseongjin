import { describe, expect, it } from "vitest";
import { buildDocumentUpdates } from "../src/github-documents.js";
import type { MeetingMetadata, Minutes } from "../src/types.js";

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
    "결정: 로프 액션 로그라이크로 진행한다.",
    "할 일: 개발 — 로프 프로토타입",
    "논의: 장르",
  ],
  discussed: ["장르"],
  decided: ["로프 액션 로그라이크로 진행한다."],
  rejected: [],
  hypotheses: ["수집 생물 후보"],
  references: [
    {
      timestamp: "2026-08-09T13:10:00.000Z",
      channelName: "기획",
      authorName: "성현",
      note: "결정: 참고자료의 문구일 뿐",
      urls: ["https://example.com/rope"],
      attachments: [
        { name: "할 일: 가짜 작업.md", contentType: "text/markdown", sizeBytes: 1024 },
      ],
    },
  ],
  actionItems: [{ owner: "개발", task: "로프 프로토타입", due: null }],
  blockers: [],
  nextMeeting: null,
};

describe("GitHub document updates", () => {
  it("creates the daily minutes, decisions, and tasks from promoted fields", () => {
    const updates = buildDocumentUpdates(metadata, minutes, {});

    expect(updates.map((update) => update.path)).toEqual([
      "docs/meetings/2026-08-09.md",
      "DECISIONS.md",
      "TASKS.md",
    ]);
    expect(updates.find((update) => update.path === "DECISIONS.md")?.content).not.toContain(
      "수집 생물 후보",
    );
    expect(
      updates.find((update) => update.path === "docs/meetings/2026-08-09.md")?.content,
    ).toContain("### REFERENCES");
    expect(updates.find((update) => update.path === "DECISIONS.md")?.content).not.toContain(
      "참고자료의 문구",
    );
    expect(updates.find((update) => update.path === "TASKS.md")?.content).not.toContain(
      "가짜 작업",
    );
  });

  it("is idempotent for an existing meeting marker", () => {
    const marker = "<!-- meeting-id:20260809-220000 -->";
    const existing = {
      "docs/meetings/2026-08-09.md": `# Meeting Minutes\n\n${marker}\n`,
      "DECISIONS.md": `# Decisions\n\n${marker}\n`,
      "TASKS.md": `# Tasks\n\n${marker}\n`,
    };

    expect(buildDocumentUpdates(metadata, minutes, existing)).toEqual([]);
  });

  it("does not create decision or task ledgers when nothing was explicit", () => {
    const updates = buildDocumentUpdates(
      metadata,
      {
        ...minutes,
        summary: ["가설: 수집 생물 후보", "결정: 없음", "할 일: 없음"],
        decided: [],
        actionItems: [],
      },
      {},
    );

    expect(updates.map((update) => update.path)).toEqual(["docs/meetings/2026-08-09.md"]);
  });
});
