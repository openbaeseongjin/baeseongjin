import { describe, expect, it } from "vitest";
import { renderCodexJob } from "../src/codex/result.js";
import type { CodexJob } from "../src/codex/types.js";

describe("renderCodexJob", () => {
    it("renders a mention-safe Discord result with a job ID", () => {
        const job: CodexJob = {
            id: "CX-20260811-ABC123",
            status: "completed",
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "plan",
            context: "context",
            createdAt: "2026-08-11T00:00:00.000Z",
            updatedAt: "2026-08-11T00:01:00.000Z",
            result: {
                status: "completed",
                summary: "Notify @everyone and use <script>.",
                proposedChanges: ["Add planning boundary."],
                verification: ["Run tests."],
                risks: []
            }
        };

        const output = renderCodexJob(job);

        expect(output).toContain("CX-20260811-ABC123");
        expect(output).toContain("@\u200beveryone");
        expect(output).toContain("&lt;script&gt;");
        expect(output).not.toContain("context");
    });

    it("withholds a legacy result that contains a non-Korean-or-English writing system", () => {
        const job: CodexJob = {
            id: "CX-20260811-LEGACY",
            status: "completed",
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "한국어로 정리해줘",
            context: "context",
            createdAt: "2026-08-11T00:00:00.000Z",
            updatedAt: "2026-08-11T00:01:00.000Z",
            result: {
                status: "completed",
                summary: "总结",
                proposedChanges: [],
                verification: [],
                risks: []
            }
        };

        const output = renderCodexJob(job);

        expect(output).toContain("Result withheld");
        expect(output).not.toContain("总结");
    });

    it("withholds unsupported writing systems from a persisted error", () => {
        const job: CodexJob = {
            id: "CX-20260811-ERROR1",
            status: "failed",
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "plan",
            context: "context",
            createdAt: "2026-08-11T00:00:00.000Z",
            updatedAt: "2026-08-11T00:01:00.000Z",
            error: "处理失败"
        };

        const output = renderCodexJob(job);

        expect(output).toContain("Error details withheld");
        expect(output).not.toContain("处理失败");
    });
});
