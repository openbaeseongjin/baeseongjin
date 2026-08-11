import type { MinutesDetails } from "./types.js";

const MIN_SUMMARY_LINES = 3;
const MAX_SUMMARY_LINES = 5;
const MAX_SUMMARY_LINE_LENGTH = 240;

function normalizeSummaryText(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function categoryLine(label: string, values: string[]): string | null {
  const normalized = values.map(normalizeSummaryText).filter(Boolean);
  if (normalized.length === 0) {
    return null;
  }

  const prefix = `${label}: `;
  const suffix = normalized.length > 1 ? ` 외 ${normalized.length - 1}건` : "";
  const available = Math.max(0, MAX_SUMMARY_LINE_LENGTH - prefix.length - suffix.length);
  return `${prefix}${normalized[0]!.slice(0, available)}${suffix}`;
}

export function buildMeetingSummary(details: MinutesDetails): string[] {
  const actionItems = details.actionItems.map((item) => {
    const due = item.due ? ` (기한: ${item.due})` : "";
    return `${item.owner} — ${item.task}${due}`;
  });
  const candidates = [
    categoryLine("결정", details.decided),
    categoryLine("할 일", actionItems),
    categoryLine("블로커", details.blockers),
    details.nextMeeting ? categoryLine("다음 회의", [details.nextMeeting]) : null,
    categoryLine("논의", details.discussed),
    categoryLine("가설", details.hypotheses),
    categoryLine("제외", details.rejected),
  ];
  const summary = candidates
    .filter((line): line is string => line !== null)
    .slice(0, MAX_SUMMARY_LINES);
  const fillers = ["결정: 없음", "할 일: 없음", "논의: 없음", "다음 회의: 미정"];

  for (const filler of fillers) {
    if (summary.length >= MIN_SUMMARY_LINES) {
      break;
    }
    const label = filler.slice(0, filler.indexOf(":"));
    if (!summary.some((line) => line.startsWith(`${label}:`))) {
      summary.push(filler);
    }
  }

  return summary;
}
