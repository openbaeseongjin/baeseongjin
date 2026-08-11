import type { MeetingMetadata, Minutes } from "./types.js";
import { kstDate, kstTime } from "./time.js";

export function markdownText(value: string, maxLength = 1_000): string {
  const normalized = value
    .replace(/[\u0000-\u001f\u007f]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
  let escaped = "";

  for (const character of normalized) {
    const token =
      character === "<"
        ? "&lt;"
        : character === ">"
          ? "&gt;"
          : /[\\`*_\[\]{}()#+!|~]/u.test(character)
            ? `\\${character}`
            : character;
    if (escaped.length + token.length > maxLength) {
      break;
    }
    escaped += token;
  }

  return escaped;
}

function summaryText(value: string): string {
  const countSuffix = value.match(/ 외 \d+건$/u)?.[0];
  if (!countSuffix) {
    return markdownText(value, 240);
  }

  const renderedSuffix = ` ${markdownText(countSuffix.trim())}`;
  const body = value.slice(0, -countSuffix.length);
  return `${markdownText(body, 240 - renderedSuffix.length)}${renderedSuffix}`;
}

function bulletList(
  items: string[],
  renderItem: (item: string) => string = markdownText,
): string {
  return items.length > 0
    ? items.map((item) => `- ${renderItem(item)}`).join("\n")
    : "- None recorded";
}

export function renderMeetingSection(metadata: MeetingMetadata, minutes: Minutes): string {
  const startedAt = new Date(metadata.startedAt);
  const endedAt = new Date(metadata.endedAt);
  const actions = minutes.actionItems.map((item) => {
    const due = item.due ? ` (due: ${item.due})` : "";
    return `- [ ] ${markdownText(item.owner)} — ${markdownText(item.task)}${markdownText(due)}`;
  });

  return [
    `<!-- meeting-id:${metadata.id} -->`,
    `## Meeting ${kstTime(startedAt)}–${kstTime(endedAt)} KST`,
    "",
    `- Started by: ${markdownText(metadata.startedBy)}`,
    `- Voice channel: ${markdownText(metadata.voiceChannelName ?? "Text only")}`,
    "",
    "### SUMMARY",
    "",
    bulletList(minutes.summary, summaryText),
    "",
    "### DISCUSSED",
    "",
    bulletList(minutes.discussed),
    "",
    "### DECIDED",
    "",
    bulletList(minutes.decided),
    "",
    "### REJECTED",
    "",
    bulletList(minutes.rejected),
    "",
    "### HYPOTHESES",
    "",
    bulletList(minutes.hypotheses),
    "",
    "### ACTION ITEMS",
    "",
    actions.length > 0 ? actions.join("\n") : "- None recorded",
    "",
    "### BLOCKERS",
    "",
    bulletList(minutes.blockers),
    "",
    "### NEXT MEETING",
    "",
    minutes.nextMeeting ? `- ${markdownText(minutes.nextMeeting)}` : "- Not explicitly scheduled",
  ].join("\n");
}

export function renderDailyDocument(metadata: MeetingMetadata, minutes: Minutes): string {
  const date = kstDate(new Date(metadata.startedAt));
  return [`# Meeting Minutes — ${date}`, "", renderMeetingSection(metadata, minutes), ""].join("\n");
}

export function splitMarkdown(markdown: string, maxLength = 1_900): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const line of markdown.split("\n")) {
    if (line.length > maxLength) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      for (let offset = 0; offset < line.length; offset += maxLength) {
        chunks.push(line.slice(offset, offset + maxLength));
      }
      continue;
    }

    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length > maxLength) {
      chunks.push(current);
      current = line;
    } else {
      current = candidate;
    }
  }

  if (current) {
    chunks.push(current);
  }
  return chunks;
}
