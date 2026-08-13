import type { MeetingMetadata, Minutes, TranscriptEntry } from "./types.js";
import { markdownText, renderMeetingSection, renderTranscriptSection } from "./markdown.js";
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
  transcript: TranscriptEntry[],
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

  if (transcript.length > 0) {
    const transcriptPath = `docs/meetings/transcripts/${date}.md`;
    const transcriptExisting = existing[transcriptPath] || `# Meeting Transcript — ${date}\n`;
    if (!transcriptExisting.includes(marker)) {
      updates.push({
        path: transcriptPath,
        content: appendSection(transcriptExisting, renderTranscriptSection(metadata, transcript)),
      });
    }
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
