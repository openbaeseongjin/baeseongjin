import { codexResultSchema, usesKoreanOrEnglishWritingSystems, type CodexJob } from "./types.js";

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
        const error = job.error
            ? usesKoreanOrEnglishWritingSystems(job.error)
                ? ` — ${safeDiscordText(job.error)}`
                : " — Error details withheld: unsupported writing system."
            : "";
        return `**Codex job ${job.id}** — ${job.status}${error}`;
    }
    const validated = codexResultSchema.safeParse(job.result);
    if (!validated.success) {
        return `**Codex job ${job.id}** — Result withheld: output must use only Korean or English writing systems.`;
    }
    const result = validated.data;
    return [
        `## Codex plan — ${job.id}`,
        `- Skill: ${job.skill}`,
        `- Source: ${job.source}`,
        `- Status: ${result.status}`,
        "",
        safeDiscordText(result.summary),
        "",
        ...list("Proposed changes", result.proposedChanges),
        "",
        ...list("Verification", result.verification),
        "",
        ...list("Risks", result.risks),
        "",
        "This V1 result is read-only. No repository files or external systems were changed."
    ].join("\n");
}
