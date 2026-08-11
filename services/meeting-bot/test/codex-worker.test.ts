import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CodexJobStore } from "../src/codex/job-store.js";
import { CodexJobWorker } from "../src/codex/worker.js";
import type { CodexResult, CodexRunInput } from "../src/codex/types.js";

describe("CodexJobWorker", () => {
    it("processes one job at a time and publishes its structured result", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-worker-"));
        const store = new CodexJobStore(directory);
        let concurrent = 0;
        let maximumConcurrent = 0;
        const published: string[] = [];
        const runner = {
            async run(input: CodexRunInput): Promise<CodexResult> {
                concurrent += 1;
                maximumConcurrent = Math.max(maximumConcurrent, concurrent);
                await new Promise((resolvePromise) => setTimeout(resolvePromise, 10));
                concurrent -= 1;
                return {
                    status: "completed",
                    summary: `planned ${input.id}`,
                    proposedChanges: [],
                    verification: [],
                    risks: []
                };
            }
        };
        const worker = new CodexJobWorker(store, runner, async (job) => {
            published.push(job.id);
        });
        const first = await store.create({
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "first",
            context: "first context"
        });
        const second = await store.create({
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "meeting-to-game-plan",
            source: "last-meeting",
            instruction: "second",
            context: "second context"
        });

        await Promise.all([worker.enqueue(first.id), worker.enqueue(second.id)]);

        expect(maximumConcurrent).toBe(1);
        expect(published).toEqual([first.id, second.id]);
        expect((await store.get(first.id))?.status).toBe("completed");
        expect((await store.get(second.id))?.status).toBe("completed");
    });

    it("cancels a queued job without invoking the runner", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-worker-"));
        const store = new CodexJobStore(directory);
        let calls = 0;
        const runner = {
            async run(): Promise<CodexResult> {
                calls += 1;
                return {
                    status: "completed",
                    summary: "unexpected",
                    proposedChanges: [],
                    verification: [],
                    risks: []
                };
            }
        };
        const worker = new CodexJobWorker(store, runner, async () => undefined);
        const job = await store.create({
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "cancel",
            context: "context"
        });

        await worker.cancel(job.id);
        await worker.enqueue(job.id);

        expect(calls).toBe(0);
        expect((await store.get(job.id))?.status).toBe("cancelled");
    });
});
