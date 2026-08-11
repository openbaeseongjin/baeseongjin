import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CodexJobStore } from "../src/codex/job-store.js";

describe("CodexJobStore", () => {
    it("persists a queued job and its later result atomically", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-job-store-"));
        const store = new CodexJobStore(directory);
        const job = await store.create({
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "Plan the rope prototype.",
            context: "Member: We should prototype the rope."
        });

        expect(job.status).toBe("queued");
        expect(await store.get(job.id)).toMatchObject({ id: job.id, status: "queued" });

        const completed = await store.update(job.id, {
            status: "completed",
            result: {
                status: "completed",
                summary: "A bounded plan was produced.",
                proposedChanges: ["Add a deterministic rope simulation test."],
                verification: ["Run npm test."],
                risks: []
            }
        });

        expect(completed.status).toBe("completed");
        const persisted = JSON.parse(await readFile(join(directory, "jobs", `${job.id}.json`), "utf8")) as {
            result: { summary: string };
        };
        expect(persisted.result.summary).toBe("A bounded plan was produced.");
    });

    it("returns jobs newest first without accepting path traversal", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-job-store-"));
        const store = new CodexJobStore(directory);

        await expect(store.get("../secrets")).resolves.toBeUndefined();
        await expect(store.update("../secrets", { status: "failed" })).rejects.toThrow("Invalid Codex job ID");
    });
});
