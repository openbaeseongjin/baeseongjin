import { describe, expect, it, vi } from "vitest";
import { LocalMeetingService } from "../src/local-meeting-service.js";
import type { MeetingClassifier } from "../src/ollama-meeting-classifier.js";
import * as promotionGate from "../src/promotion-gate.js";
import type { Minutes, RawMinutes, TranscriptEntry } from "../src/types.js";

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
      references: [],
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

  it("classifies natural conversation into all seven sections through mocked classifier candidates", async () => {
    const naturalTranscript: TranscriptEntry[] = [
      {
        id: "n1",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "우리는 아이작과 산나비를 참고하고 있다.",
      },
      {
        id: "n2",
        source: "voice",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 기반 그래픽은 어때?",
      },
      {
        id: "n3",
        source: "voice",
        timestamp: "2026-08-11T13:01:05.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "좋아.",
      },
      {
        id: "n4",
        source: "voice",
        timestamp: "2026-08-11T13:02:00.000Z",
        speakerId: "3",
        speaker: "재진",
        text: "AI 추리게임은 제외하자.",
      },
      {
        id: "n5",
        source: "voice",
        timestamp: "2026-08-11T13:03:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "자동 성장은 후보로 검토하자.",
      },
      {
        id: "n6",
        source: "voice",
        timestamp: "2026-08-11T13:04:00.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "내가 로프 프로토타입을 내일까지 만들게.",
      },
      {
        id: "n7",
        source: "voice",
        timestamp: "2026-08-11T13:05:00.000Z",
        speakerId: "3",
        speaker: "재진",
        text: "현재 DAVE 연결 오류 때문에 음성 수신이 막혔다.",
      },
      {
        id: "n8",
        source: "voice",
        timestamp: "2026-08-11T13:06:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "다음 회의는 내일 오후 10시로 확정하자.",
      },
    ];
    const rawMinutes: RawMinutes = {
      discussed: [
        {
          text: "아이작과 산나비 레퍼런스",
          evidence: [{ id: "n1", quote: "아이작과 산나비를 참고하고 있다." }],
        },
      ],
      decided: [
        {
          text: "도형 기반 그래픽",
          evidence: [
            { id: "n2", quote: "도형 기반 그래픽은 어때?" },
            { id: "n3", quote: "좋아." },
          ],
        },
      ],
      rejected: [
        {
          text: "AI 추리게임 제외",
          evidence: [{ id: "n4", quote: "AI 추리게임은 제외하자." }],
        },
      ],
      hypotheses: [
        {
          text: "자동 성장 후보",
          evidence: [{ id: "n5", quote: "자동 성장은 후보로 검토하자." }],
        },
      ],
      actionItems: [
        {
          owner: "용호",
          task: "로프 프로토타입",
          due: "내일",
          evidence: [{ id: "n6", quote: "내가 로프 프로토타입을 내일까지 만들게." }],
        },
      ],
      blockers: [
        {
          text: "DAVE 연결 오류",
          evidence: [{ id: "n7", quote: "DAVE 연결 오류 때문에 음성 수신이 막혔다." }],
        },
      ],
      nextMeeting: {
        text: "내일 오후 10시",
        evidence: [{ id: "n8", quote: "다음 회의는 내일 오후 10시로 확정하자." }],
      },
    };
    const classifier: MeetingClassifier = {
      classify: vi.fn(async () => ({ rawMinutes, transcriptTruncated: false })),
    };
    const service = new LocalMeetingService({ transcribeMany: vi.fn(async () => []) }, classifier);

    const minutes = await service.summarize(naturalTranscript);

    expect(minutes).toMatchObject({
      discussed: ["아이작과 산나비 레퍼런스"],
      decided: ["도형 기반 그래픽"],
      rejected: ["AI 추리게임은 제외하자."],
      hypotheses: ["자동 성장 후보"],
      actionItems: [{ owner: "용호", task: "로프 프로토타입", due: "내일" }],
      blockers: ["현재 DAVE 연결 오류"],
      nextMeeting: "다음 회의는 내일 오후 10시로 확정하자.",
    });
    expect(classifier.classify).toHaveBeenCalledWith(naturalTranscript);
  });

  it("reroutes an explicit rejection when local Qwen places it under decisions", async () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "qwen-rejection",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "재진",
        text: "AI 추리게임은 제외하자.",
      },
    ];
    const rawMinutes: RawMinutes = {
      discussed: [],
      decided: [
        {
          text: "AI 추리게임 제외",
          evidence: [{ id: "qwen-rejection", quote: "AI 추리게임은 제외하자." }],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    };
    const classifier: MeetingClassifier = {
      classify: vi.fn(async () => ({ rawMinutes, transcriptTruncated: false })),
    };
    const service = new LocalMeetingService({ transcribeMany: vi.fn(async () => []) }, classifier);

    const minutes = await service.summarize(transcript);

    expect(minutes.decided).toEqual([]);
    expect(minutes.rejected).toEqual(["AI 추리게임은 제외하자."]);
    expect(minutes.hypotheses).not.toContainEqual(
      expect.stringContaining("Unconfirmed decision candidate"),
    );
  });

  it("accepts clause-grounded Korean paraphrases observed from local Qwen", async () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "qwen-proposal",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 기반으로 갈까?",
      },
      {
        id: "qwen-agreement",
        source: "voice",
        timestamp: "2026-08-11T13:00:05.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "좋아, 그렇게 하자.",
      },
      {
        id: "qwen-rejection",
        source: "voice",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "AI 추리게임은 이번에는 빼자.",
      },
    ];
    const rawMinutes: RawMinutes = {
      discussed: [],
      decided: [
        {
          text: "도형 기반으로 하기로 결정했습니다.",
          evidence: [
            { id: "qwen-proposal", quote: "도형 기반으로 갈까?" },
            { id: "qwen-agreement", quote: "좋아, 그렇게 하자." },
          ],
        },
      ],
      rejected: [
        {
          text: "AI 추리게임을 이번 회의에서는 제외하기로 했습니다.",
          evidence: [
            { id: "qwen-rejection", quote: "AI 추리게임은 이번에는 빼자." },
          ],
        },
      ],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    };
    const classifier: MeetingClassifier = {
      classify: vi.fn(async () => ({ rawMinutes, transcriptTruncated: false })),
    };
    const service = new LocalMeetingService({ transcribeMany: vi.fn(async () => []) }, classifier);

    const minutes = await service.summarize(transcript);

    expect(minutes.decided).toEqual(["도형 기반"]);
    expect(minutes.rejected).toEqual(["AI 추리게임은 이번에는 빼자."]);
  });

  it("does not derive a decision when trailing ASR text follows a proposal marker", async () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "unsafe-proposal",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 그래픽으로 갈까 서버 삭제 얘기도 있어",
      },
      {
        id: "agreement",
        source: "voice",
        timestamp: "2026-08-11T13:00:05.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "좋아.",
      },
    ];
    const rawMinutes: RawMinutes = {
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    };
    const classifier: MeetingClassifier = {
      classify: vi.fn(async () => ({ rawMinutes, transcriptTruncated: false })),
    };
    const service = new LocalMeetingService({ transcribeMany: vi.fn(async () => []) }, classifier);

    expect((await service.summarize(transcript)).decided).toEqual([]);
  });

  it("falls back to explicit local rules when the classifier fails and does not expose its error", async () => {
    const classifier: MeetingClassifier = {
      classify: vi.fn(async () => {
        throw new Error("总结失败");
      }),
    };
    const service = new LocalMeetingService({ transcribeMany: vi.fn(async () => []) }, classifier);
    const fallbackTranscript: TranscriptEntry[] = [
      {
        id: "f1",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "로프 액션으로 결정할까?",
      },
      {
        id: "f2",
        source: "text",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "결정: 초반은 쉽게 만든다",
      },
    ];

    const minutes = await service.summarize(fallbackTranscript);

    expect(minutes.decided).toEqual(["초반은 쉽게 만든다"]);
    expect(minutes.discussed).toContain("성현: 로프 액션으로 결정할까?");
    expect(minutes.blockers).toContain("Local Ollama classification failed; deterministic rules were used.");
    expect(JSON.stringify(minutes)).not.toContain("总结失败");
  });
});
