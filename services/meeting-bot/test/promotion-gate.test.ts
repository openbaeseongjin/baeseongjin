import { describe, expect, it } from "vitest";
import fixture from "./fixtures/transcript.json" with { type: "json" };
import { rawMinutesSchema } from "../src/minutes-schema.js";
import { enforceExplicitPromotions } from "../src/promotion-gate.js";
import type { TranscriptEntry } from "../src/types.js";

describe("explicit promotion gate", () => {
  it("promotes only explicitly evidenced decisions and action items", () => {
    const minutes = enforceExplicitPromotions(
      rawMinutesSchema.parse(fixture.rawMinutes),
      fixture.transcript as TranscriptEntry[],
    );

    expect(minutes.decided).toEqual(["도형 기반 그래픽을 사용한다."]);
    expect(minutes.rejected).toEqual(["AI 추리게임 방향은 제외한다."]);
    expect(minutes.actionItems).toEqual([
      { owner: "개발", task: "로프 프로토타입 구현", due: "내일" },
    ]);
    expect(minutes.nextMeeting).toBe("내일 오후 10시");
    expect(minutes.hypotheses).toContain(
      "Unconfirmed decision candidate: 팰월드식 수집을 사용한다.",
    );
    expect(minutes.hypotheses).toContain(
      "Unconfirmed action candidate: 모션 — 수집 시스템 구현",
    );
  });

  it("rejects invented evidence IDs", () => {
    const raw = rawMinutesSchema.parse(fixture.rawMinutes);
    raw.decided[0]!.evidenceIds = ["missing"];

    const minutes = enforceExplicitPromotions(raw, fixture.transcript as TranscriptEntry[]);

    expect(minutes.decided).toEqual([]);
    expect(minutes.hypotheses[0]).toMatch(/Unconfirmed decision candidate/u);
  });
});
