import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { CodexJobStore } from "../src/codex/job-store.js";
import { CodexJobWorker } from "../src/codex/worker.js";
import type { CodexJob, CodexResult, CodexRunInput } from "../src/codex/types.js";

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

    it("rejects jobs beyond the configured outstanding-job limit", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-worker-"));
        const store = new CodexJobStore(directory);
        let releaseFirst: (() => void) | undefined;
        let calls = 0;
        const runner = {
            async run(input: CodexRunInput): Promise<CodexResult> {
                calls += 1;
                if (calls === 1) {
                    await new Promise<void>((resolvePromise) => {
                        releaseFirst = resolvePromise;
                    });
                }
                return {
                    status: "completed",
                    summary: `planned ${input.id}`,
                    proposedChanges: [],
                    verification: [],
                    risks: []
                };
            }
        };
        const worker = new CodexJobWorker(store, runner, async () => undefined, 1);
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
            requesterId: "12345678901234570",
            skill: "meeting-to-game-plan",
            source: "last-meeting",
            instruction: "second",
            context: "second context"
        });

        const firstCompletion = worker.enqueue(first.id);
        await vi.waitFor(() => expect(releaseFirst).toBeTypeOf("function"));
        let rejection: unknown;
        const secondCompletion = worker.enqueue(second.id).catch((error: unknown) => {
            rejection = error;
        });
        await new Promise<void>((resolvePromise) => setImmediate(resolvePromise));
        const rejectedBeforeRelease = rejection instanceof Error;
        releaseFirst?.();
        await Promise.all([firstCompletion, secondCompletion]);

        expect(rejectedBeforeRelease).toBe(true);
        expect(rejection).toBeInstanceOf(Error);
        expect((rejection as Error).message).toContain("queue is full");
        expect(calls).toBe(1);
    });

    it("settles a queued cancellation and immediately frees capacity", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-worker-"));
        const store = new CodexJobStore(directory);
        let releaseFirst: (() => void) | undefined;
        const calls: string[] = [];
        const runner = {
            async run(input: CodexRunInput): Promise<CodexResult> {
                calls.push(input.id);
                if (calls.length === 1) {
                    await new Promise<void>((resolvePromise) => {
                        releaseFirst = resolvePromise;
                    });
                }
                return {
                    status: "completed",
                    summary: `planned ${input.id}`,
                    proposedChanges: [],
                    verification: [],
                    risks: []
                };
            }
        };
        const worker = new CodexJobWorker(store, runner, async () => undefined, 2);
        const jobs = await Promise.all(
            ["first", "second", "third"].map((instruction, index) =>
                store.create({
                    guildId: "12345678901234567",
                    channelId: "12345678901234568",
                    requesterId: `123456789012345${69 + index}`,
                    skill: "repo-task-plan",
                    source: "recent-messages",
                    instruction,
                    context: `${instruction} context`
                })
            )
        );
        const [first, second, third] = jobs as [CodexJob, CodexJob, CodexJob];

        const firstCompletion = worker.enqueue(first.id);
        await vi.waitFor(() => expect(releaseFirst).toBeTypeOf("function"));
        let secondSettled = false;
        const secondCompletion = worker.enqueue(second.id).then(() => {
            secondSettled = true;
        });
        expect(await worker.cancel(second.id)).toBe(true);
        await new Promise<void>((resolvePromise) => setImmediate(resolvePromise));
        const settledImmediately = secondSettled;
        let thirdRejection: unknown;
        const thirdCompletion = worker.enqueue(third.id).catch((error: unknown) => {
            thirdRejection = error;
        });
        await new Promise<void>((resolvePromise) => setImmediate(resolvePromise));
        releaseFirst?.();
        await Promise.allSettled([firstCompletion, secondCompletion, thirdCompletion]);

        expect(settledImmediately).toBe(true);
        expect(thirdRejection).toBeUndefined();
        expect((await store.get(second.id))?.status).toBe("cancelled");
        expect(calls).toEqual([first.id, third.id]);
    });

    it("does not resurrect a cancellation during queued-to-running activation", async () => {
        const initialJob: CodexJob = {
            id: "CX-20260811-A1B2C3",
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "activation race",
            context: "activation race context",
            status: "queued",
            createdAt: "2026-08-11T09:00:00.000Z",
            updatedAt: "2026-08-11T09:00:00.000Z"
        };
        let currentJob = { ...initialJob };
        let getCalls = 0;
        let releaseInitialGet: (() => void) | undefined;
        let notifyInitialGet: (() => void) | undefined;
        const initialGetStarted = new Promise<void>((resolvePromise) => {
            notifyInitialGet = resolvePromise;
        });
        const store = {
            async get(): Promise<CodexJob> {
                getCalls += 1;
                if (getCalls === 1) {
                    const staleQueuedSnapshot = { ...currentJob };
                    notifyInitialGet?.();
                    await new Promise<void>((resolvePromise) => {
                        releaseInitialGet = resolvePromise;
                    });
                    return staleQueuedSnapshot;
                }
                return { ...currentJob };
            },
            async update(_id: string, changes: Partial<CodexJob>): Promise<CodexJob> {
                currentJob = {
                    ...currentJob,
                    ...changes,
                    id: currentJob.id,
                    updatedAt: new Date().toISOString()
                };
                return { ...currentJob };
            }
        };
        const run = vi.fn(async (): Promise<CodexResult> => ({
            status: "completed",
            summary: "should not run",
            proposedChanges: [],
            verification: [],
            risks: []
        }));
        const publish = vi.fn(async () => undefined);
        const worker = new CodexJobWorker(store as unknown as CodexJobStore, { run }, publish);

        const completion = worker.enqueue(initialJob.id);
        await initialGetStarted;
        expect(await worker.cancel(initialJob.id)).toBe(true);
        releaseInitialGet?.();
        await completion;

        expect(currentJob.status).toBe("cancelled");
        expect(run).not.toHaveBeenCalled();
        expect(publish).not.toHaveBeenCalled();
    });

    it("keeps an active cancellation final when the runner ignores the abort signal", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-worker-"));
        const store = new CodexJobStore(directory);
        let releaseRunner: (() => void) | undefined;
        let notifyRunner: (() => void) | undefined;
        const runnerStarted = new Promise<void>((resolvePromise) => {
            notifyRunner = resolvePromise;
        });
        const runner = {
            async run(): Promise<CodexResult> {
                notifyRunner?.();
                await new Promise<void>((resolvePromise) => {
                    releaseRunner = resolvePromise;
                });
                return {
                    status: "completed",
                    summary: "late completion",
                    proposedChanges: [],
                    verification: [],
                    risks: []
                };
            }
        };
        const publish = vi.fn(async () => undefined);
        const worker = new CodexJobWorker(store, runner, publish);
        const job = await store.create({
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "cancel active work",
            context: "active context"
        });

        const completion = worker.enqueue(job.id);
        await runnerStarted;
        expect(await worker.cancel(job.id)).toBe(true);
        releaseRunner?.();
        await completion;

        expect((await store.get(job.id))?.status).toBe("cancelled");
        expect(publish).not.toHaveBeenCalled();
    });

    it("does not persist or publish a runner result with an unsupported writing system", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-worker-"));
        const store = new CodexJobStore(directory);
        const runner = {
            async run(): Promise<CodexResult> {
                return {
                    status: "completed",
                    summary: "总结",
                    proposedChanges: [],
                    verification: [],
                    risks: []
                };
            }
        };
        const publish = vi.fn(async () => undefined);
        const worker = new CodexJobWorker(store, runner, publish);
        const job = await store.create({
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "reject unsupported output",
            context: "context"
        });

        await worker.enqueue(job.id);

        const persisted = await store.get(job.id);
        expect(persisted?.status).toBe("failed");
        expect(persisted?.result).toBeUndefined();
        expect(publish).not.toHaveBeenCalled();
    });

    it("does not persist an unsupported writing system from a runner error", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-worker-"));
        const store = new CodexJobStore(directory);
        const runner = {
            async run(): Promise<CodexResult> {
                throw new Error("处理失败");
            }
        };
        const worker = new CodexJobWorker(store, runner, async () => undefined);
        const job = await store.create({
            guildId: "12345678901234567",
            channelId: "12345678901234568",
            requesterId: "12345678901234569",
            skill: "repo-task-plan",
            source: "recent-messages",
            instruction: "reject unsupported errors",
            context: "context"
        });

        await worker.enqueue(job.id);

        const persisted = await store.get(job.id);
        expect(persisted?.status).toBe("failed");
        expect(persisted?.error).toContain("withheld");
        expect(persisted?.error).not.toMatch(/\p{Script=Han}/u);
    });
});
