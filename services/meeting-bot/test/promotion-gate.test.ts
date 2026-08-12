import { describe, expect, it } from "vitest";
import fixture from "./fixtures/transcript.json" with { type: "json" };
import { rawMinutesSchema } from "../src/minutes-schema.js";
import {
  enforceExplicitPromotions,
  mergeExplicitTranscriptSignals,
} from "../src/promotion-gate.js";
import type { TranscriptEntry } from "../src/types.js";

describe("explicit promotion gate", () => {
  it("promotes only explicitly evidenced decisions and action items", () => {
    const minutes = enforceExplicitPromotions(
      rawMinutesSchema.parse(fixture.rawMinutes),
      fixture.transcript as TranscriptEntry[],
    );

    expect(minutes.decided).toEqual(["도형 기반 그래픽을 사용한다."]);
    expect(minutes.rejected).toEqual(["AI 추리게임은 안 하기로 했다."]);
    expect(minutes.actionItems).toEqual([
      { owner: "개발", task: "로프 프로토타입 구현", due: "내일" },
    ]);
    expect(minutes.nextMeeting).toBe("내일 오후 10시");
    expect(minutes.blockers).toContain(
      "One or more ungrounded classifier candidates were withheld.",
    );
    expect(minutes.summary).toEqual([
      "결정: 도형 기반 그래픽을 사용한다.",
      "할 일: 개발 — 로프 프로토타입 구현 (기한: 내일)",
      "블로커: One or more ungrounded classifier candidates were withheld.",
      "다음 회의: 내일 오후 10시",
      "논의: 그래픽 스타일 외 1건",
    ]);
    expect(minutes.summary).not.toContain("결정: 팰월드식 수집을 사용한다.");
  });

  it("rejects invented evidence IDs", () => {
    const raw = rawMinutesSchema.parse(fixture.rawMinutes);
    raw.decided[0]!.evidence = [{ id: "missing", quote: "그래픽은 도형 기반으로 가자" }];

    const minutes = enforceExplicitPromotions(raw, fixture.transcript as TranscriptEntry[]);

    expect(minutes.decided).toEqual([]);
    expect(minutes.blockers).toContain(
      "One or more ungrounded classifier candidates were withheld.",
    );
    expect(minutes.summary.some((line) => line.startsWith("결정: 팰월드식"))).toBe(false);
  });

  it("accepts a proposal followed by another speaker's clear agreement as a decision", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "proposal",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 기반 그래픽으로 갈까?",
      },
      {
        id: "agreement",
        source: "voice",
        timestamp: "2026-08-11T13:00:02.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "좋아.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "도형 기반 그래픽으로 진행한다.",
          evidence: [
            { id: "proposal", quote: "도형 기반 그래픽으로 갈까?" },
            { id: "agreement", quote: "좋아." },
          ],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.decided).toEqual(["도형 기반 그래픽으로 진행한다."]);
  });

  it("does not treat the same speaker's own acknowledgement as team agreement", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "proposal",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 기반 그래픽으로 갈까?",
      },
      {
        id: "self-agreement",
        source: "voice",
        timestamp: "2026-08-11T13:00:02.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "좋아.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "도형 기반 그래픽으로 진행한다.",
          evidence: [
            { id: "proposal", quote: "도형 기반 그래픽으로 갈까?" },
            { id: "self-agreement", quote: "좋아." },
          ],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.decided).toEqual([]);
    expect(minutes.hypotheses).toContain(
      "Unconfirmed decision candidate: 도형 기반 그래픽으로 진행한다.",
    );
  });

  it("does not bind one generic acknowledgement to multiple proposals in one entry", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "multiple-proposals",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 그래픽은 어때? 서버 삭제는 어때?",
      },
      {
        id: "generic-agreement",
        source: "voice",
        timestamp: "2026-08-11T13:00:05.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "좋아.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "서버 삭제",
          evidence: [
            { id: "multiple-proposals", quote: "서버 삭제는 어때?" },
            { id: "generic-agreement", quote: "좋아." },
          ],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    });

    expect(enforceExplicitPromotions(raw, transcript).decided).toEqual([]);
    expect(
      enforceExplicitPromotions(
        mergeExplicitTranscriptSignals({ ...raw, decided: [] }, transcript),
        transcript,
      ).decided,
    ).toEqual([]);
  });

  it("does not launder an unrelated candidate through a separate decision quote", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "pixel-discussion",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "픽셀 그래픽을 더 논의해보자.",
      },
      {
        id: "rope-decision",
        source: "voice",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "로프 액션은 확정하자.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "픽셀 그래픽을 사용한다.",
          evidence: [
            { id: "pixel-discussion", quote: "픽셀 그래픽을 더 논의해보자." },
            { id: "rope-decision", quote: "로프 액션은 확정하자." },
          ],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.decided).toEqual([]);
  });

  it("does not promote undecided owners, decisions, or meeting times", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "undecided",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "아직 그래픽 방향을 결정한 건 아니다.",
      },
      {
        id: "unassigned",
        source: "voice",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "로프 구현 담당자는 미정이야.",
      },
      {
        id: "unscheduled",
        source: "voice",
        timestamp: "2026-08-11T13:02:00.000Z",
        speakerId: "3",
        speaker: "재진",
        text: "다음 회의 시간도 미정이야.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "그래픽 방향을 확정했다.",
          evidence: [{ id: "undecided", quote: "아직 그래픽 방향을 결정한 건 아니다." }],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [
        {
          owner: "용호",
          task: "로프 구현",
          due: null,
          evidence: [{ id: "unassigned", quote: "로프 구현 담당자는 미정이야." }],
        },
      ],
      blockers: [],
      nextMeeting: {
        text: "다음 회의 시간 미정",
        evidence: [{ id: "unscheduled", quote: "다음 회의 시간도 미정이야." }],
      },
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.decided).toEqual([]);
    expect(minutes.actionItems).toEqual([]);
    expect(minutes.nextMeeting).toBeNull();
  });

  it("does not promote Korean negative decisions or commitments", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "negative-decision",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "그래픽 방향은 결정 안 했어.",
      },
      {
        id: "negative-action",
        source: "voice",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "내가 로프 프로토타입은 안 만들게.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "그래픽 방향 결정",
          evidence: [{ id: "negative-decision", quote: "그래픽 방향은 결정 안 했어." }],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [
        {
          owner: "용호",
          task: "로프 프로토타입",
          due: null,
          evidence: [{ id: "negative-action", quote: "내가 로프 프로토타입은 안 만들게." }],
        },
      ],
      blockers: [],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.decided).toEqual([]);
    expect(minutes.actionItems).toEqual([]);
  });

  it("binds an action owner to the same assignment clause as the task", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "mixed-owners",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "용호는 모션을 맡고, 로프 프로토타입은 내가 구현할게.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      actionItems: [
        {
          owner: "용호",
          task: "로프 프로토타입",
          due: null,
          evidence: [
            {
              id: "mixed-owners",
              quote: "용호는 모션을 맡고, 로프 프로토타입은 내가 구현할게.",
            },
          ],
        },
      ],
      blockers: [],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.actionItems).toEqual([]);
  });

  it("does not launder a punctuationless named assignment through a later first-person action", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "whisper-mixed-owners",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "용호는 모션을 맡고 로프 프로토타입은 내가 구현할게",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      actionItems: [
        {
          owner: "성현",
          task: "모션",
          due: null,
          evidence: [
            {
              id: "whisper-mixed-owners",
              quote: "용호는 모션을 맡고 로프 프로토타입은 내가 구현할게",
            },
          ],
        },
      ],
      blockers: [],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.actionItems).toEqual([]);
  });

  it.each([
    "용호는 모션을 맡기로 했고 로프 프로토타입은 내가 구현할게",
    "용호는 모션 담당이고 로프 프로토타입은 내가 구현할게",
    "용호가 모션을 할 거고 로프 프로토타입은 내가 구현할게",
  ])("withholds ambiguous mixed-owner Whisper text: %s", (text) => {
    const transcript: TranscriptEntry[] = [
      {
        id: "ambiguous-mixed-owners",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text,
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      actionItems: [
        {
          owner: "성현",
          task: "모션",
          due: null,
          evidence: [{ id: "ambiguous-mixed-owners", quote: text }],
        },
      ],
      blockers: [],
      nextMeeting: null,
    });

    expect(enforceExplicitPromotions(raw, transcript).actionItems).toEqual([]);
  });

  it("binds dangerous-category intent and topic to the same semantic clause", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "mixed-decision",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 그래픽은 확정하고 픽셀 그래픽은 계속 논의하자",
      },
      {
        id: "mixed-proposal",
        source: "voice",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 그래픽은 어때? 서버 삭제 얘기도 있어.",
      },
      {
        id: "agreement",
        source: "voice",
        timestamp: "2026-08-11T13:01:10.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "좋아.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "픽셀 그래픽",
          evidence: [{ id: "mixed-decision", quote: transcript[0]!.text }],
        },
        {
          text: "서버 삭제",
          evidence: [
            { id: "mixed-proposal", quote: transcript[1]!.text },
            { id: "agreement", quote: "좋아." },
          ],
        },
        {
          text: "도형 그래픽 서버삭제",
          evidence: [{ id: "mixed-decision", quote: "도형 그래픽은 확정" }],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    });

    expect(enforceExplicitPromotions(raw, transcript).decided).toEqual([]);
  });

  it.each([
    "도형 그래픽은 확정인데 픽셀 그래픽은 계속 논의하자",
    "도형 그래픽은 확정됐고 픽셀 그래픽은 계속 논의하자",
    "도형 그래픽은 결정됐지만 픽셀 그래픽은 계속 논의하자",
  ])("does not attach a later Korean topic to earlier decision intent: %s", (text) => {
    const transcript: TranscriptEntry[] = [
      {
        id: "later-topic",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text,
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        { text: "픽셀 그래픽", evidence: [{ id: "later-topic", quote: text }] },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    });

    expect(enforceExplicitPromotions(raw, transcript).decided).toEqual([]);
  });

  it("does not duplicate a next-meeting schedule confirmation into decided", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "schedule-confirm",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "다음 회의는 내일 오후 10시로 확정하자.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "다음 회의는 내일 오후 10시로 확정한다.",
          evidence: [{ id: "schedule-confirm", quote: transcript[0]!.text }],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: {
        text: "내일 오후 10시",
        evidence: [{ id: "schedule-confirm", quote: transcript[0]!.text }],
      },
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.decided).toEqual([]);
    expect(minutes.nextMeeting).toBe("내일 오후 10시");
  });

  it("recognizes a first-person commitment verb without an exact task token match", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "rope-physics-commitment",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "용호",
        text: "내가 로프 물리를 내일까지 구현할게.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      actionItems: [
        {
          owner: "용호",
          task: "로프 물리 구현",
          due: "내일",
          evidence: [{ id: "rope-physics-commitment", quote: transcript[0]!.text }],
        },
      ],
      blockers: [],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.actionItems).toEqual([
      { owner: "용호", task: "로프 물리 구현", due: "내일" },
    ]);
  });

  it("supports English topic text on either side of explicit intent", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "english-decision",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "Sung",
        text: "We decided to use geometric graphics.",
      },
      {
        id: "english-rejection",
        source: "voice",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "2",
        speaker: "Yongho",
        text: "We rejected the AI mystery game.",
      },
      {
        id: "english-blocker",
        source: "voice",
        timestamp: "2026-08-11T13:02:00.000Z",
        speakerId: "1",
        speaker: "Sung",
        text: "The blocker is DAVE.",
      },
      {
        id: "english-next",
        source: "voice",
        timestamp: "2026-08-11T13:03:00.000Z",
        speakerId: "1",
        speaker: "Sung",
        text: "The next meeting is tomorrow at 10:00.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "use geometric graphics",
          evidence: [{ id: "english-decision", quote: transcript[0]!.text }],
        },
      ],
      rejected: [
        {
          text: "AI mystery game",
          evidence: [{ id: "english-rejection", quote: transcript[1]!.text }],
        },
      ],
      hypotheses: [],
      actionItems: [],
      blockers: [
        {
          text: "DAVE",
          evidence: [{ id: "english-blocker", quote: transcript[2]!.text }],
        },
      ],
      nextMeeting: {
        text: "tomorrow at 10:00",
        evidence: [{ id: "english-next", quote: transcript[3]!.text }],
      },
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.decided).toEqual(["use geometric graphics"]);
    expect(minutes.rejected).toEqual(["AI mystery game"]);
    expect(minutes.blockers).toContain("DAVE");
    expect(minutes.nextMeeting).toBe("tomorrow at 10:00");
  });

  it("binds action owner, task, and due date to one assignment clause", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "assignments",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "용호는 로프 구현을 맡고 재진은 모션을 내일까지 만들게",
      },
      {
        id: "sentences",
        source: "voice",
        timestamp: "2026-08-11T13:01:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "용호는 로프 구현 담당. 성현은 서버 삭제 담당.",
      },
      {
        id: "reverse-mixed",
        source: "voice",
        timestamp: "2026-08-11T13:02:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "내가 로프 프로토타입을 할 예정이고 용호는 모션을 맡을게",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      actionItems: [
        {
          owner: "용호",
          task: "로프 구현",
          due: "내일",
          evidence: [{ id: "assignments", quote: transcript[0]!.text }],
        },
        {
          owner: "용호",
          task: "서버 삭제",
          due: null,
          evidence: [{ id: "sentences", quote: transcript[1]!.text }],
        },
        {
          owner: "성현",
          task: "모션",
          due: null,
          evidence: [{ id: "reverse-mixed", quote: transcript[2]!.text }],
        },
      ],
      blockers: [],
      nextMeeting: null,
    });

    expect(enforceExplicitPromotions(raw, transcript).actionItems).toEqual([
      { owner: "용호", task: "로프 구현", due: null },
    ]);
  });

  it("does not connect a proposal to a distant unrelated acknowledgement", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "proposal-old",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 기반 그래픽으로 갈까?",
      },
      {
        id: "different-topic",
        source: "voice",
        timestamp: "2026-08-11T13:05:00.000Z",
        speakerId: "3",
        speaker: "재진",
        text: "점심 메뉴를 정하자.",
      },
      {
        id: "agreement-late",
        source: "voice",
        timestamp: "2026-08-11T13:10:00.000Z",
        speakerId: "2",
        speaker: "용호",
        text: "좋아.",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [
        {
          text: "도형 기반 그래픽으로 진행한다.",
          evidence: [
            { id: "proposal-old", quote: "도형 기반 그래픽으로 갈까?" },
            { id: "agreement-late", quote: "좋아." },
          ],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.decided).toEqual([]);
  });

  it("does not promote a tentative blocker question as an actual blocker", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "blocker-question",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "DAVE 연동이 문제일까?",
      },
    ];
    const raw = rawMinutesSchema.parse({
      discussed: [],
      decided: [],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [
        {
          text: "DAVE 연동 문제",
          evidence: [{ id: "blocker-question", quote: "DAVE 연동이 문제일까?" }],
        },
      ],
      nextMeeting: null,
    });

    const minutes = enforceExplicitPromotions(raw, transcript);

    expect(minutes.blockers).toEqual([
      "One or more ungrounded classifier candidates were withheld.",
    ]);
    expect(minutes.hypotheses).not.toContain("Unconfirmed blocker candidate: DAVE 연동 문제");
  });

  it("requires exact quoted evidence that supports each classifier item", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "mixed",
        source: "voice",
        timestamp: "2026-08-11T13:00:00.000Z",
        speakerId: "1",
        speaker: "성현",
        text: "도형 그래픽은 결정하고 픽셀 그래픽은 후보로 남기자.",
      },
    ];
    const parsed = rawMinutesSchema.safeParse({
      discussed: [],
      decided: [
        {
          text: "도형 그래픽 결정",
          evidence: [{ id: "mixed", quote: "도형 그래픽은 결정" }],
        },
        {
          text: "픽셀 그래픽으로 진행한다.",
          evidence: [{ id: "mixed", quote: "도형 그래픽은 결정" }],
        },
        {
          text: "도형 그래픽 결정",
          evidence: [{ id: "mixed", quote: "도형 그래픽으로 확정" }],
        },
      ],
      rejected: [],
      hypotheses: [],
      actionItems: [],
      blockers: [],
      nextMeeting: null,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }

    const minutes = enforceExplicitPromotions(parsed.data, transcript);

    expect(minutes.decided).toEqual(["도형 그래픽 결정"]);
    expect(minutes.blockers).toContain(
      "One or more ungrounded classifier candidates were withheld.",
    );
  });
});
