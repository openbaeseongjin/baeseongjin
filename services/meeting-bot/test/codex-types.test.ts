import { describe, expect, it } from "vitest";
import { codexResultSchema } from "../src/codex/types.js";

function resultWith(summary: string) {
    return {
        status: "completed",
        summary,
        proposedChanges: ["RopeRenderer 경로를 확인합니다."],
        verification: ["Run test #12 -> PASS."],
        risks: []
    };
}

describe("Codex result writing systems", () => {
    it("accepts Korean, English, numbers, symbols, and Markdown together", () => {
        expect(codexResultSchema.safeParse(resultWith("**로프 action v2** is ready ✅")).success).toBe(true);
    });

    it.each(["总结", "まとめ", "Результат", "النتيجة"])("rejects an unsupported writing system in %s", (summary) => {
        expect(codexResultSchema.safeParse(resultWith(summary)).success).toBe(false);
    });
});
