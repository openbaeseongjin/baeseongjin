import { buildMeetingSummary } from "./meeting-summary.js";
import type {
  EvidenceCitation,
  EvidencedItem,
  Minutes,
  MinutesDetails,
  RawMinutes,
  TranscriptEntry,
} from "./types.js";

const decisionPattern =
  /(확정|결정|정했|하기로\s*했|가기로\s*했|로\s*가자|그렇게\s*하자|채택|승인|confirmed|decided|agreed|approved|let(?:'s| us) go with)/iu;
const negatedDecisionPattern =
  /((결정|확정).{0,12}(안|않|아니|못)|(안|않|못).{0,12}(결정|확정)|not\s+(decided|confirmed)|(?:did|have|has)\s+not\s+(decide|confirm))/iu;
const rejectionPattern =
  /(기각|제외|안\s*하기로|하지\s*않기로|버리자|빼자|하지\s*말자|rejected|ruled out|will not|won't)/iu;
const negatedRejectionPattern =
  /(제외하지|기각하지|빼지\s*않|버리지\s*않|not\s+reject|not\s+ruled?\s+out|keep\s+it)/iu;
const actionPattern =
  /(할\s*일|액션|action item|todo|내가.{0,60}(할게|해볼게|만들게|구현할게|맡을게|준비할게|하겠)|[가-힣A-Za-z0-9_-]+(?:이|가|은|는).{0,40}(담당|맡|해줘|할게|만들게|구현할게|준비할게|완료할게|하겠)|담당자|까지.{0,40}(할|완료)|\bI(?:'ll| will)\b|\bassigned\b|\bowner\b|\bwill do\b)/iu;
const negatedActionPattern =
  /((안|못)\s*[가-힣A-Za-z]*(할게|해볼게|만들게|구현할게|맡을게|준비할게|하겠)|(하지|만들지|구현하지|맡지|준비하지)\s*(않|말)|\b(?:won't|will\s+not|can't|cannot|not\s+going\s+to)\b)/iu;
const blockerPattern =
  /(막힘|막혔|차단|오류|실패|불가|문제|blocker|blocked|blocking|error|failure|cannot|can't|unable)/iu;
const nextMeetingPattern =
  /(다음\s*회의|회의는.{0,30}(월|화|수|목|금|토|일|시|분)|next meeting|meet again)/iu;
const uncertaintyPattern =
  /(미정|후보|검토\s*중|아직.{0,30}(아니|않|못\s*정)|정한\s*건\s*아니|undecided|not\s+decided|not\s+assigned|tbd|unconfirmed|under\s+review)/iu;
const questionPattern = /(\?|할까|할까요|갈까|갈까요|어때|어떨까|should\s+we|could\s+we|would\s+we)/iu;
const proposalPattern = /(할까|할까요|갈까|갈까요|어때|어떨까|제안|should\s+we|what\s+about)/iu;
const agreementPattern =
  /^\s*(좋아|좋습니다|오케이|그래|찬성|동의|yes|agree|agreed|okay|ok|sounds\s+good)(?:\s*[,，]\s*(?:그렇게|그걸로)\s*(?:하자|진행하자))?[.!]?\s*$/iu;
const schedulePattern =
  /(오늘|내일|모레|월요일|화요일|수요일|목요일|금요일|토요일|일요일|\d{1,2}\s*월|\d{1,2}\s*일|\d{1,2}\s*시|\d{1,2}:\d{2}|am|pm)/iu;
const firstPersonPattern = /(?:내가|제가|나는|저는|\bI(?:'ll| will)\b)/iu;
const DANGEROUS_SUPPORT_RATIO = 1;
const MAX_AGREEMENT_GAP_MS = 120_000;

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

interface ResolvedEvidence {
  entries: TranscriptEntry[];
  quotes: string[];
}

function normalizeEvidenceText(value: string): string {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim().toLocaleLowerCase();
}

function splitActionClauses(value: string): string[] {
  return splitSemanticClauses(value)
    .map((clause) => clause.trim())
    .filter(Boolean);
}

function splitSemanticClauses(value: string): string[] {
  return value
    .replace(
      /((?:확정|결정|채택|승인|제외|기각|담당|맡|구현|만들|준비|완료|진행|하)(?:기로\s*했고|ㄹ\s*예정이고|ㄹ\s*거고|했으며|했고|하고|하며|해서|이고|이며|고|며))\s+/giu,
      "$1\n",
    )
    .split(
      /\n|(?<=[.!?。！？,，;；])\s*|\s+(?:그리고|하지만|그런데|반면|and|but|while|whereas|however)\s+/iu,
    )
    .map((clause) => clause.trim())
    .filter(Boolean);
}

function intentBoundedSpan(value: string, pattern: RegExp): string | null {
  const match = pattern.exec(value);
  pattern.lastIndex = 0;
  if (!match || match.index === undefined) {
    return null;
  }
  const intentEnd = match.index + match[0].length;
  if (contentTokens(value.slice(0, match.index)).length === 0) {
    return value;
  }
  const remainder = value.slice(intentEnd);
  const nextSubject = remainder.search(
    /\s+(?=(?:[\p{L}\p{N}_-]+\s+){0,3}[\p{L}\p{N}_-]+(?:은|는|이|가)\s)/u,
  );
  return nextSubject < 0 ? value : value.slice(0, intentEnd + nextSubject);
}

function namedOwnerActionSpan(value: string, normalizedOwner: string): string | null {
  const normalizedValue = normalizeEvidenceText(value);
  const ownerIndex = normalizedValue.indexOf(normalizedOwner);
  if (ownerIndex < 0) {
    return null;
  }
  const fromOwner = normalizedValue.slice(ownerIndex);
  const actionMatch =
    /(?:담당|맡(?:을|기로|고|았|겠)?|해줘|할\s*(?:게|거|예정)|(?:구현|만들|준비|완료)(?:할게|하겠|해줘|게)|\b(?:assigned|will do)\b)/iu.exec(
      fromOwner,
    );
  if (!actionMatch || actionMatch.index === undefined) {
    return null;
  }
  return fromOwner.slice(0, actionMatch.index + actionMatch[0].length);
}

function hasDistinctNamedAssignment(value: string): boolean {
  if (!firstPersonPattern.test(value)) {
    return false;
  }
  const subjectPattern = /[\p{L}\p{N}_-]{2,}(?:이|가|은|는)\s*/gu;
  for (const match of value.matchAll(subjectPattern)) {
    const tail = value.slice((match.index ?? 0) + match[0].length).slice(0, 80);
    const actionIndex = tail.search(/(?:담당|맡|할\s*(?:게|거|예정)|구현|만들|준비|완료)/iu);
    if (actionIndex >= 0 && !firstPersonPattern.test(tail.slice(0, actionIndex))) {
      return true;
    }
  }
  return false;
}

function resolveEvidence(
  item: { evidence: EvidenceCitation[] },
  entriesById: Map<string, TranscriptEntry>,
): ResolvedEvidence | null {
  const resolved: Array<{ entry: TranscriptEntry; quote: string }> = [];
  for (const citation of item.evidence) {
    const entry = entriesById.get(citation.id);
    const quote = normalizeEvidenceText(citation.quote);
    if (!entry || !quote || !normalizeEvidenceText(entry.text).includes(quote)) {
      return null;
    }
    resolved.push({ entry, quote: citation.quote.trim() });
  }

  resolved.sort((left, right) => left.entry.timestamp.localeCompare(right.entry.timestamp));
  return {
    entries: resolved.map((item) => item.entry),
    quotes: resolved.map((item) => item.quote),
  };
}

function contentTokens(value: string): string[] {
  const classificationRoots = [
    "사용",
    "진행",
    "결정",
    "확정",
    "채택",
    "승인",
    "합의",
    "제외",
    "기각",
    "거절",
    "담당",
    "예정",
  ];
  const boilerplateWords = new Set([
    "가자",
    "갈까",
    "하자",
    "어때",
    "어떨까",
    "빼자",
    "이번",
    "이번에는",
    "이걸로",
    "계속",
    "얘기",
    "얘기도",
    "있어",
    "the",
    "we",
    "to",
    "on",
    "is",
    "was",
    "were",
    "at",
    "for",
    "use",
    "merely",
    "discussed",
    "blocker",
    "decision",
    "decided",
    "reject",
    "rejected",
    "next",
    "meeting",
    "scheduled",
  ]);
  return [
    ...new Set(
      (normalizeEvidenceText(value).match(/[\p{L}\p{N}]+/gu) ?? [])
        .map((token) =>
          token.replace(
            /(으로|에서|에게|부터|까지|하고|이며|이다|한다|하기|하자|했다|된다|되다|할게|해볼게|만들게|맡을게|하겠|은|는|이|가|을|를|와|과|로|에)$/u,
            "",
          ),
        )
        .filter(
          (token) =>
            token.length >= 2 &&
            !classificationRoots.some(
              (root) => token === root || (token.startsWith(root) && token.length <= root.length + 6),
            ) &&
            !boilerplateWords.has(token) &&
            !/^(?:하기로|했다|했어|했습니다|한다|합니다|된다|됩니다|됐다|예정됨)$/u.test(token),
        ),
    ),
  ];
}

function supportsBoundedTopic(candidate: string, evidence: string): boolean {
  if (!supportsCandidate(candidate, [evidence], 1)) {
    return false;
  }
  const candidateTokens = new Set(contentTokens(candidate));
  const evidenceTokens = contentTokens(evidence);
  if (evidenceTokens.length === 0) {
    return false;
  }
  const coveredEvidence = evidenceTokens.filter((token) => candidateTokens.has(token)).length;
  return coveredEvidence / evidenceTokens.length >= 0.6;
}

function supportsCandidate(candidate: string, quotes: string[], minimumRatio = 0.6): boolean {
  const candidateTokens = contentTokens(candidate);
  if (candidateTokens.length === 0) {
    return false;
  }
  const evidenceTokens = new Set(contentTokens(quotes.join(" ")));
  const matches = candidateTokens.filter((token) => evidenceTokens.has(token)).length;
  return matches / candidateTokens.length >= minimumRatio;
}

function isImmediateAgreement(
  proposer: TranscriptEntry | undefined,
  confirmer: TranscriptEntry | undefined,
  entryPositions: Map<string, number>,
): boolean {
  if (!proposer || !confirmer || proposer.speakerId === confirmer.speakerId) {
    return false;
  }
  const proposerPosition = entryPositions.get(proposer.id);
  const confirmerPosition = entryPositions.get(confirmer.id);
  const elapsed = Date.parse(confirmer.timestamp) - Date.parse(proposer.timestamp);
  const sameScope =
    proposer.channelId && confirmer.channelId
      ? proposer.channelId === confirmer.channelId
      : !proposer.channelId && !confirmer.channelId && proposer.source === confirmer.source;
  return (
    proposerPosition !== undefined &&
    confirmerPosition === proposerPosition + 1 &&
    elapsed >= 0 &&
    elapsed <= MAX_AGREEMENT_GAP_MS &&
    sameScope
  );
}

function isScheduleConfirmationClause(clause: string): boolean {
  return nextMeetingPattern.test(clause) && schedulePattern.test(clause);
}

function supportsDecision(
  candidate: string,
  evidence: ResolvedEvidence,
  entryPositions: Map<string, number>,
): boolean {
  if (
    evidence.quotes.some((quote) =>
      splitSemanticClauses(quote).some((clause) => {
        const intentSpan = intentBoundedSpan(clause, decisionPattern);
        return (
          intentSpan !== null &&
          !negatedDecisionPattern.test(clause) &&
          !uncertaintyPattern.test(clause) &&
          !questionPattern.test(clause) &&
          !isScheduleConfirmationClause(clause) &&
          supportsBoundedTopic(candidate, intentSpan)
        );
      }),
    )
  ) {
    return true;
  }

  return evidence.quotes.some((quote, proposalIndex) => {
    const supportingProposal = splitSemanticClauses(quote).some((clause) => {
      const intentSpan = intentBoundedSpan(clause, proposalPattern);
      return (
        intentSpan !== null &&
        !uncertaintyPattern.test(clause) &&
        !isScheduleConfirmationClause(clause) &&
        supportsBoundedTopic(candidate, intentSpan)
      );
    });
    if (!supportingProposal) {
      return false;
    }
    const proposer = evidence.entries[proposalIndex];
    if (
      !proposer ||
      splitSemanticClauses(proposer.text).filter(
        (clause) => proposalPattern.test(clause) && proposalTopic(clause),
      ).length !== 1
    ) {
      return false;
    }
    return evidence.quotes.slice(proposalIndex + 1).some((confirmation, offset) => {
      const confirmer = evidence.entries[proposalIndex + offset + 1];
      return (
        agreementPattern.test(confirmation) &&
        isImmediateAgreement(proposer, confirmer, entryPositions)
      );
    });
  });
}

function supportsRejection(candidate: string, evidence: ResolvedEvidence): boolean {
  return evidence.quotes.some((quote) =>
    splitSemanticClauses(quote).some((clause) => {
      const intentSpan = intentBoundedSpan(clause, rejectionPattern);
      return (
        intentSpan !== null &&
        !negatedRejectionPattern.test(clause) &&
        !uncertaintyPattern.test(clause) &&
        !questionPattern.test(clause) &&
        supportsBoundedTopic(candidate, intentSpan)
      );
    }),
  );
}

function supportsBlocker(candidate: string, evidence: ResolvedEvidence): boolean {
  return evidence.quotes.some((quote) =>
    splitSemanticClauses(quote).some((clause) => {
      const intentSpan = intentBoundedSpan(clause, blockerPattern);
      return (
        intentSpan !== null &&
        !uncertaintyPattern.test(clause) &&
        !questionPattern.test(clause) &&
        supportsBoundedTopic(candidate, intentSpan)
      );
    }),
  );
}

function supportsScheduledMeeting(
  candidate: string,
  evidence: ResolvedEvidence,
  entryPositions: Map<string, number>,
): boolean {
  const explicitlyScheduled = evidence.quotes.some((quote) =>
    splitSemanticClauses(quote).some((clause) => {
      const intentSpan = intentBoundedSpan(clause, nextMeetingPattern);
      return (
        intentSpan !== null &&
        schedulePattern.test(clause) &&
        !questionPattern.test(clause) &&
        !uncertaintyPattern.test(clause) &&
        supportsBoundedTopic(candidate, intentSpan)
      );
    }),
  );
  if (explicitlyScheduled) {
    return true;
  }

  return evidence.quotes.some((quote, proposalIndex) => {
    const supportingProposal = splitSemanticClauses(quote).some((clause) => {
      const intentSpan = intentBoundedSpan(clause, nextMeetingPattern);
      return (
        intentSpan !== null &&
        schedulePattern.test(clause) &&
        questionPattern.test(clause) &&
        !uncertaintyPattern.test(clause) &&
        supportsBoundedTopic(candidate, intentSpan)
      );
    });
    if (!supportingProposal) {
      return false;
    }
    const proposer = evidence.entries[proposalIndex];
    return evidence.quotes.slice(proposalIndex + 1).some((confirmation, offset) => {
      const confirmer = evidence.entries[proposalIndex + offset + 1];
      return (
        agreementPattern.test(confirmation) &&
        isImmediateAgreement(proposer, confirmer, entryPositions)
      );
    });
  });
}

function proposalTopic(value: string): string | null {
  const ending =
    /\s*(?:(?:으로|로)\s*)?(?:갈까|갈까요|할까|할까요|어때|어떨까)\s*[?？]?\s*$/iu.exec(
      value,
    );
  if (!ending || ending.index === undefined) {
    return null;
  }
  const topic = value
    .slice(0, ending.index)
    .replace(/(?:은|는|이|가)\s*$/u, "")
    .trim();
  return topic && topic.length <= 1_000 ? topic : null;
}

export function mergeExplicitTranscriptSignals(
  rawMinutes: RawMinutes,
  transcript: TranscriptEntry[],
): RawMinutes {
  const entryPositions = new Map(transcript.map((entry, index) => [entry.id, index]));
  const decided: EvidencedItem[] = [];
  const rejected: EvidencedItem[] = [];
  const blockers: EvidencedItem[] = [];
  let nextMeeting: EvidencedItem | null = null;

  for (const entry of transcript) {
    for (const clause of splitSemanticClauses(entry.text)) {
      if (clause.length > 1_000) {
        continue;
      }
      const evidence = [{ id: entry.id, quote: clause }];
      if (
        rejectionPattern.test(clause) &&
        !negatedRejectionPattern.test(clause) &&
        !uncertaintyPattern.test(clause) &&
        !questionPattern.test(clause)
      ) {
        rejected.push({ text: clause, evidence });
      }
      if (
        blockerPattern.test(clause) &&
        !uncertaintyPattern.test(clause) &&
        !questionPattern.test(clause)
      ) {
        const blockerSpan = intentBoundedSpan(clause, blockerPattern);
        if (blockerSpan) {
          blockers.push({ text: blockerSpan, evidence });
        }
      }
      if (
        !nextMeeting &&
        nextMeetingPattern.test(clause) &&
        schedulePattern.test(clause) &&
        !uncertaintyPattern.test(clause) &&
        !questionPattern.test(clause)
      ) {
        nextMeeting = { text: clause, evidence };
      }
    }
  }

  for (let index = 0; index < transcript.length - 1; index += 1) {
    const proposer = transcript[index];
    const confirmer = transcript[index + 1];
    if (!proposer || !confirmer || !agreementPattern.test(confirmer.text)) {
      continue;
    }
    const proposals = splitSemanticClauses(proposer.text).flatMap((clause) => {
      const topic = proposalPattern.test(clause) ? proposalTopic(clause) : null;
      return topic && !uncertaintyPattern.test(clause) ? [{ clause, topic }] : [];
    });
    if (
      proposals.length === 1 &&
      isImmediateAgreement(proposer, confirmer, entryPositions)
    ) {
      const proposal = proposals[0]!;
      decided.push({
        text: proposal.topic,
        evidence: [
          { id: proposer.id, quote: proposal.clause },
          { id: confirmer.id, quote: confirmer.text },
        ],
      });
    }
  }

  const prependUnique = (derived: EvidencedItem[], generated: EvidencedItem[], limit: number) => {
    const seen = new Set<string>();
    const derivedEvidenceIds = new Set(
      derived.flatMap((item) => item.evidence.map((citation) => citation.id)),
    );
    const nonOverlappingGenerated = generated.filter(
      (item) => !item.evidence.some((citation) => derivedEvidenceIds.has(citation.id)),
    );
    return [...derived, ...nonOverlappingGenerated]
      .filter((item) => {
        const key = normalizeEvidenceText(item.text);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  };

  return {
    ...rawMinutes,
    decided: prependUnique(decided, rawMinutes.decided, 100),
    rejected: prependUnique(rejected, rawMinutes.rejected, 100),
    blockers: prependUnique(blockers, rawMinutes.blockers, 100),
    nextMeeting: nextMeeting ?? rawMinutes.nextMeeting,
  };
}

export function enforceExplicitPromotions(
  rawMinutes: RawMinutes,
  transcript: TranscriptEntry[],
): Minutes {
  const entriesById = new Map(transcript.map((entry) => [entry.id, entry]));
  const entryPositions = new Map(transcript.map((entry, index) => [entry.id, index]));
  let withheldCandidates = 0;
  const grounded = (item: EvidencedItem, minimumRatio = 0.2): ResolvedEvidence | null => {
    const evidence = resolveEvidence(item, entriesById);
    if (!evidence || !supportsCandidate(item.text, evidence.quotes, minimumRatio)) {
      withheldCandidates += 1;
      return null;
    }
    return evidence;
  };
  const discussed = rawMinutes.discussed.flatMap((item) =>
    grounded(item) ? [item.text] : [],
  );
  const hypotheses = rawMinutes.hypotheses.flatMap((item) =>
    grounded(item) ? [item.text] : [],
  );
  const blockers = rawMinutes.blockers.flatMap((item) => {
    const evidence = grounded(item, DANGEROUS_SUPPORT_RATIO);
    if (evidence && supportsBlocker(item.text, evidence)) {
      return [item.text];
    }
    if (evidence) {
      hypotheses.push(`Unconfirmed blocker candidate: ${item.text}`);
    }
    return [];
  });

  const decided = rawMinutes.decided.flatMap((item) => {
    const evidence = grounded(item, DANGEROUS_SUPPORT_RATIO);
    if (!evidence) {
      return [];
    }
    if (supportsDecision(item.text, evidence, entryPositions)) {
      return [item.text];
    }
    if (
      supportsRejection(item.text, evidence) ||
      supportsBlocker(item.text, evidence) ||
      supportsScheduledMeeting(item.text, evidence, entryPositions)
    ) {
      return [];
    }
    hypotheses.push(`Unconfirmed decision candidate: ${item.text}`);
    return [];
  });

  const rejected = rawMinutes.rejected.flatMap((item) => {
    const evidence = grounded(item, DANGEROUS_SUPPORT_RATIO);
    if (evidence && supportsRejection(item.text, evidence)) {
      return [item.text];
    }
    if (!evidence) {
      return [];
    }
    if (supportsDecision(item.text, evidence, entryPositions)) {
      return [];
    }
    hypotheses.push(`Unconfirmed rejection candidate: ${item.text}`);
    return [];
  });

  const actionItems = rawMinutes.actionItems.flatMap((item) => {
    const evidence = resolveEvidence(item, entriesById);
    const normalizedOwner = normalizeEvidenceText(item.owner);
    const explicitLabel = evidence?.quotes.some((quote) => {
      const match = quote.match(actionLabel);
      return (
        match &&
        normalizeEvidenceText(match[1] ?? "") === normalizedOwner &&
        normalizeEvidenceText(match[2] ?? "") === normalizeEvidenceText(item.task) &&
        normalizeEvidenceText(match[3] ?? "") === normalizeEvidenceText(item.due ?? "")
      );
    });
    if (explicitLabel) {
      return [{ owner: item.owner, task: item.task, due: item.due }];
    }
    const supportingClauses =
      evidence?.quotes.flatMap((quote, index) => {
        const entry = evidence.entries[index];
        if (
          entry &&
          normalizeEvidenceText(entry.speaker) === normalizedOwner &&
          hasDistinctNamedAssignment(quote)
        ) {
          return [];
        }
        return splitActionClauses(quote).flatMap((clause) => {
          const firstPerson = firstPersonPattern.test(clause);
          const actionSpan = firstPerson
            ? clause
            : namedOwnerActionSpan(clause, normalizedOwner);
          const ownerSupported = firstPerson
            ? Boolean(entry && normalizeEvidenceText(entry.speaker) === normalizedOwner)
            : actionSpan !== null;
          return ownerSupported &&
            actionSpan !== null &&
            actionPattern.test(actionSpan) &&
            !negatedActionPattern.test(actionSpan) &&
            !uncertaintyPattern.test(actionSpan) &&
            !questionPattern.test(actionSpan) &&
            supportsCandidate(item.task, [actionSpan], DANGEROUS_SUPPORT_RATIO)
            ? [{ clause: actionSpan }]
            : [];
        });
      }) ?? [];
    if (evidence && supportingClauses.length > 0) {
      const due =
        item.due &&
        supportingClauses.some(({ clause }) =>
          normalizeEvidenceText(clause).includes(normalizeEvidenceText(item.due!)),
        )
          ? item.due
          : null;
      return [{ owner: item.owner, task: item.task, due }];
    }
    if (!evidence || !supportsCandidate(item.task, evidence.quotes)) {
      withheldCandidates += 1;
      return [];
    }
    hypotheses.push(`Unconfirmed action candidate: ${item.owner} — ${item.task}`);
    return [];
  });

  let nextMeeting: string | null = null;
  if (rawMinutes.nextMeeting) {
    const evidence = grounded(rawMinutes.nextMeeting, DANGEROUS_SUPPORT_RATIO);
    if (
      evidence &&
      supportsScheduledMeeting(rawMinutes.nextMeeting.text, evidence, entryPositions)
    ) {
      nextMeeting = rawMinutes.nextMeeting.text;
    } else if (evidence) {
      hypotheses.push(`Unconfirmed next meeting: ${rawMinutes.nextMeeting.text}`);
    }
  }

  if (withheldCandidates > 0) {
    blockers.push("One or more ungrounded classifier candidates were withheld.");
  }

  const details: MinutesDetails = {
    discussed: unique(discussed),
    decided: unique(decided),
    rejected: unique(rejected),
    hypotheses: unique(hypotheses),
    actionItems,
    blockers: unique(blockers),
    nextMeeting,
  };
  return { summary: buildMeetingSummary(details), references: [], ...details };
}

const decisionLabel = /^\s*(?:결정|확정|DECIDED)\s*[:：]\s*(.+)$/iu;
const rejectionLabel = /^\s*(?:기각|제외|REJECTED)\s*[:：]\s*(.+)$/iu;
const hypothesisLabel = /^\s*(?:아이디어|가설|후보|HYPOTHESIS|HYPOTHESES)\s*[:：]\s*(.+)$/iu;
const blockerLabel = /^\s*(?:막힘|블로커|BLOCKER|BLOCKERS)\s*[:：]\s*(.+)$/iu;
const nextMeetingLabel = /^\s*(?:다음\s*회의|NEXT\s*MEETING)\s*[:：]\s*(.+)$/iu;
const actionLabel =
  /^\s*(?:할\s*일|액션|TODO|ACTION\s*ITEM)\s*[:：]\s*([^|｜]+?)\s*[|｜]\s*([^|｜]+?)(?:\s*[|｜]\s*(.+?))?\s*$/iu;

export function summarizeLocally(transcript: TranscriptEntry[]): Minutes {
  const rawMinutes: RawMinutes = {
    discussed: [],
    decided: [],
    rejected: [],
    hypotheses: [],
    actionItems: [],
    blockers: [],
    nextMeeting: null,
  };

  for (const entry of transcript) {
    const text = entry.text.trim();
    let match: RegExpMatchArray | null;

    if ((match = text.match(decisionLabel))) {
      rawMinutes.decided.push({
        text: match[1]!,
        evidence: [{ id: entry.id, quote: text }],
      });
    } else if ((match = text.match(rejectionLabel))) {
      rawMinutes.rejected.push({
        text: match[1]!,
        evidence: [{ id: entry.id, quote: text }],
      });
    } else if ((match = text.match(hypothesisLabel))) {
      rawMinutes.hypotheses.push({
        text: match[1]!,
        evidence: [{ id: entry.id, quote: text }],
      });
    } else if ((match = text.match(actionLabel))) {
      rawMinutes.actionItems.push({
        owner: match[1]!.trim(),
        task: match[2]!.trim(),
        due: match[3]?.trim() || null,
        evidence: [{ id: entry.id, quote: text }],
      });
    } else if ((match = text.match(blockerLabel))) {
      rawMinutes.blockers.push({
        text: match[1]!,
        evidence: [{ id: entry.id, quote: text }],
      });
    } else if ((match = text.match(nextMeetingLabel))) {
      rawMinutes.nextMeeting = {
        text: match[1]!,
        evidence: [{ id: entry.id, quote: text }],
      };
    } else {
      rawMinutes.discussed.push({
        text: `${entry.speaker}: ${text}`,
        evidence: [{ id: entry.id, quote: text }],
      });
    }
  }

  return enforceExplicitPromotions(rawMinutes, transcript);
}
