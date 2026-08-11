import type { CodexJob } from "./types.js";

function safeDiscordText(value: string): string {
    return value
        .replace(/[\u0000-\u001f\u007f]/gu, " ")
        .replace(/</gu, "&lt;")
        .replace(/>/gu, "&gt;")
        .replace(/@(everyone|here)/giu, "@\u200b$1")
        .trim();
}

function list(title: string, values: string[]): string[] {
    return [
        `**${title}**`,
        ...(values.length > 0 ? values.map((value) => `- ${safeDiscordText(value)}`) : ["- None recorded"])
    ];
}

export function renderCodexJob(job: CodexJob): string {
    if (!job.result) {
        const error = job.error ? ` — ${safeDiscordText(job.error)}` : "";
        return `**Codex job ${job.id}** — ${job.status}${error}`;
    }
    return [
        `## Codex plan — ${job.id}`,
        `- Skill: ${job.skill}`,
        `- Source: ${job.source}`,
        `- Status: ${job.result.status}`,
        "",
        safeDiscordText(job.result.summary),
        "",
        ...list("Proposed changes", job.result.proposedChanges),
        "",
        ...list("Verification", job.result.verification),
        "",
        ...list("Risks", job.result.risks),
        "",
        "This V1 result is read-only. No repository files or external systems were changed."
    ].join("\n");
}
