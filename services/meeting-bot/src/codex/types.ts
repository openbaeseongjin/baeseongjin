import { z } from "zod";
import { usesKoreanOrEnglishWritingSystems } from "../writing-system.js";

export { usesKoreanOrEnglishWritingSystems } from "../writing-system.js";

export const CODEX_SKILLS = ["meeting-to-game-plan", "repo-task-plan", "discord-repo-cross-reference"] as const;
export const CODEX_SOURCES = ["last-meeting", "recent-messages"] as const;

export type CodexSkill = (typeof CODEX_SKILLS)[number];
export type CodexSource = (typeof CODEX_SOURCES)[number];
export type CodexJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

function codexOutputText(maximumLength: number) {
    return z
        .string()
        .min(1)
        .max(maximumLength)
        .refine(usesKoreanOrEnglishWritingSystems, "must use only Korean or English writing systems");
}

export const codexResultSchema = z.object({
    status: z.enum(["completed", "needs_approval"]),
    summary: codexOutputText(4_000),
    proposedChanges: z.array(codexOutputText(1_000)).max(30),
    verification: z.array(codexOutputText(1_000)).max(30),
    risks: z.array(codexOutputText(1_000)).max(30)
});

export type CodexResult = z.infer<typeof codexResultSchema>;

export const codexResultJsonSchema = {
    type: "object",
    additionalProperties: false,
    required: ["status", "summary", "proposedChanges", "verification", "risks"],
    properties: {
        status: { type: "string", enum: ["completed", "needs_approval"] },
        summary: { type: "string", minLength: 1, maxLength: 4_000 },
        proposedChanges: {
            type: "array",
            maxItems: 30,
            items: { type: "string", minLength: 1, maxLength: 1_000 }
        },
        verification: {
            type: "array",
            maxItems: 30,
            items: { type: "string", minLength: 1, maxLength: 1_000 }
        },
        risks: {
            type: "array",
            maxItems: 30,
            items: { type: "string", minLength: 1, maxLength: 1_000 }
        }
    }
} as const;

export interface CreateCodexJob {
    guildId: string;
    channelId: string;
    requesterId: string;
    skill: CodexSkill;
    source: CodexSource;
    instruction: string;
    context: string;
}

export interface CodexJob extends CreateCodexJob {
    id: string;
    status: CodexJobStatus;
    createdAt: string;
    updatedAt: string;
    result?: CodexResult;
    error?: string;
}

export interface CodexRunInput {
    id: string;
    skill: CodexSkill;
    instruction: string;
    context: string;
}
