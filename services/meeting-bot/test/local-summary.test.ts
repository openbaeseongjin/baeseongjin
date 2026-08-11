import { describe, expect, it } from "vitest";
import * as promotionGate from "../src/promotion-gate.js";
import type { Minutes, TranscriptEntry } from "../src/types.js";

const transcript: TranscriptEntry[] = [
  {
    id: "t1",
    source: "text",
    timestamp: "2026-08-10T13:00:00.000Z",
    speakerId: "1",
    speaker: "성현",
    text: "아이작과 산나비를 참고해보자.",
  },
  {
    id: "t2",
    source: "text",
    timestamp: "2026-08-10T13:01:00.000Z",
    speakerId: "2",
    speaker: "용호",
    text: "결정: 2D 횡스크롤로 확정",
  },
  {
    id: "t3",
    source: "text",
    timestamp: "2026-08-10T13:02:00.000Z",
    speakerId: "3",
    speaker: "재진",
    text: "기각: AI 추리게임 방향은 제외",
  },
  {
    id: "t4",
    source: "text",
    timestamp: "2026-08-10T13:03:00.000Z",
    speakerId: "1",
    speaker: "성현",
    text: "아이디어: 자동 성장 시스템",
  },
  {
    id: "t5",
    source: "text",
    timestamp: "2026-08-10T13:04:00.000Z",
    speakerId: "2",
    speaker: "용호",
    text: "할 일: 용호 | 로프 프로토타입 구현 | 내일",
  },
  {
    id: "t6",
    source: "text",
    timestamp: "2026-08-10T13:05:00.000Z",
    speakerId: "3",
    speaker: "재진",
    text: "다음 회의: 내일 오후 10시",
  },
  {
    id: "t7",
    source: "text",
    timestamp: "2026-08-10T13:06:00.000Z",
    speakerId: "1",
    speaker: "성현",
    text: "로프 액션으로 결정할까?",
  },
];

describe("free local meeting summary", () => {
  it("promotes only explicitly labelled meeting statements", () => {
    const summarizeLocally = (
      promotionGate as unknown as {
        summarizeLocally(entries: TranscriptEntry[]): Minutes;
      }
    ).summarizeLocally;

    const minutes = summarizeLocally(transcript);

    expect(minutes).toEqual({
      summary: [
        "결정: 2D 횡스크롤로 확정",
        "할 일: 용호 — 로프 프로토타입 구현 (기한: 내일)",
        "다음 회의: 내일 오후 10시",
        "논의: 성현: 아이작과 산나비를 참고해보자. 외 1건",
        "가설: 자동 성장 시스템",
      ],
      discussed: ["성현: 아이작과 산나비를 참고해보자.", "성현: 로프 액션으로 결정할까?"],
      decided: ["2D 횡스크롤로 확정"],
      rejected: ["AI 추리게임 방향은 제외"],
      hypotheses: ["자동 성장 시스템"],
      actionItems: [{ owner: "용호", task: "로프 프로토타입 구현", due: "내일" }],
      blockers: [],
      nextMeeting: "내일 오후 10시",
    });
  });

  it("keeps sparse summaries between three and five bounded lines without promoting hypotheses", () => {
    const summarizeLocally = (
      promotionGate as unknown as {
        summarizeLocally(entries: TranscriptEntry[]): Minutes;
      }
    ).summarizeLocally;
    const longHypothesis = "가".repeat(400);

    const minutes = summarizeLocally([
      {
        id: "only-hypothesis",
        source: "text",
        timestamp: "2026-08-10T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: `아이디어: ${longHypothesis}`,
      },
    ]);

    expect(minutes.summary).toHaveLength(3);
    expect(minutes.summary[0]).toMatch(/^가설: /u);
    expect(minutes.summary[0]).not.toMatch(/^결정: /u);
    expect(minutes.summary.every((line) => line.length <= 240)).toBe(true);
  });
});
