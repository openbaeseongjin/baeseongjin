import type { EvidencedItem, Minutes, RawMinutes, TranscriptEntry } from "./types.js";

const decisionPattern =
  /(확정|결정|정했|하기로\s*했|가기로\s*했|로\s*가자|그렇게\s*하자|채택|승인|confirmed|decided|agreed|approved|let(?:'s| us) go with)/iu;
const rejectionPattern = /(기각|제외|안\s*하기로|하지\s*않기로|버리자|rejected|ruled out|will not|won't)/iu;
const actionPattern =
  /(내가.{0,40}(할게|하겠)|[가-힣A-Za-z0-9_-]+(?:이|가|은|는).{0,40}(담당|맡|해줘|할게|하겠)|담당자|까지.{0,40}(할|완료)|\bI(?:'ll| will)\b|\bassigned\b|\bowner\b|\bwill do\b)/iu;
const nextMeetingPattern =
  /(다음\s*회의|회의는.{0,30}(월|화|수|목|금|토|일|시|분)|next meeting|meet again)/iu;

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function evidenceText(
  item: EvidencedItem | { evidenceIds: string[] },
  entriesById: Map<string, TranscriptEntry>,
): string | null {
  const entries = item.evidenceIds.map((id) => entriesById.get(id));
  if (entries.some((entry) => !entry)) {
    return null;
  }
  return entries.map((entry) => entry?.text ?? "").join("\n");
}

export function enforceExplicitPromotions(
  rawMinutes: RawMinutes,
  transcript: TranscriptEntry[],
): Minutes {
  const entriesById = new Map(transcript.map((entry) => [entry.id, entry]));
  const hypotheses = [...rawMinutes.hypotheses];

  const decided = rawMinutes.decided.flatMap((item) => {
    const evidence = evidenceText(item, entriesById);
    if (evidence && decisionPattern.test(evidence)) {
      return [item.text];
    }
    hypotheses.push(`Unconfirmed decision candidate: ${item.text}`);
    return [];
  });

  const rejected = rawMinutes.rejected.flatMap((item) => {
    const evidence = evidenceText(item, entriesById);
    if (evidence && rejectionPattern.test(evidence)) {
      return [item.text];
    }
    hypotheses.push(`Unconfirmed rejection candidate: ${item.text}`);
    return [];
  });

  const actionItems = rawMinutes.actionItems.flatMap((item) => {
    const evidence = evidenceText(item, entriesById);
    if (evidence && actionPattern.test(evidence)) {
      return [{ owner: item.owner, task: item.task, due: item.due }];
    }
    hypotheses.push(`Unconfirmed action candidate: ${item.owner} — ${item.task}`);
    return [];
  });

  let nextMeeting: string | null = null;
  if (rawMinutes.nextMeeting) {
    const evidence = evidenceText(rawMinutes.nextMeeting, entriesById);
    if (evidence && nextMeetingPattern.test(evidence)) {
      nextMeeting = rawMinutes.nextMeeting.text;
    } else {
      hypotheses.push(`Unconfirmed next meeting: ${rawMinutes.nextMeeting.text}`);
    }
  }

  return {
    discussed: unique(rawMinutes.discussed),
    decided: unique(decided),
    rejected: unique(rejected),
    hypotheses: unique(hypotheses),
    actionItems,
    blockers: unique(rawMinutes.blockers),
    nextMeeting,
  };
}
