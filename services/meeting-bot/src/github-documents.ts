import type { MeetingMetadata, Minutes } from "./types.js";
import { markdownText, renderMeetingSection } from "./markdown.js";
import { kstDate } from "./time.js";

function appendSection(existing: string, section: string): string {
  const trimmed = existing.trimEnd();
  return trimmed ? `${trimmed}\n\n${section}\n` : `${section}\n`;
}

export interface DocumentUpdate {
  path: string;
  content: string;
}

export function buildDocumentUpdates(
  metadata: MeetingMetadata,
  minutes: Minutes,
  existing: Record<string, string>,
): DocumentUpdate[] {
  const date = kstDate(new Date(metadata.startedAt));
  const marker = `<!-- meeting-id:${metadata.id} -->`;
  const dailyPath = `docs/meetings/${date}.md`;
  const dailyExisting = existing[dailyPath] || `# Meeting Minutes — ${date}\n`;
  const updates: DocumentUpdate[] = [];

  if (!dailyExisting.includes(marker)) {
    updates.push({
      path: dailyPath,
      content: appendSection(dailyExisting, renderMeetingSection(metadata, minutes)),
    });
  }

  if (minutes.decided.length > 0) {
    const path = "DECISIONS.md";
    const current = existing[path] || "# Decisions\n";
    if (!current.includes(marker)) {
      const section = [
        marker,
        `## ${date} — ${metadata.id}`,
        "",
        ...minutes.decided.map((decision) => `- ${markdownText(decision)}`),
      ].join("\n");
      updates.push({ path, content: appendSection(current, section) });
    }
  }

  if (minutes.actionItems.length > 0) {
    const path = "TASKS.md";
    const current = existing[path] || "# Tasks\n";
    if (!current.includes(marker)) {
      const section = [
        marker,
        `## ${date} — ${metadata.id}`,
        "",
        ...minutes.actionItems.map((item) => {
          const due = item.due ? ` (due: ${item.due})` : "";
          return `- [ ] ${markdownText(item.owner)} — ${markdownText(item.task)}${markdownText(due)}`;
        }),
      ].join("\n");
      updates.push({ path, content: appendSection(current, section) });
    }
  }

  return updates;
}
