import { safeErrorMessage } from "../logger.js";
import type { CodexJobStore } from "./job-store.js";
import {
    codexResultSchema,
    usesKoreanOrEnglishWritingSystems,
    type CodexJob,
    type CodexResult,
    type CodexRunInput
} from "./types.js";

export interface CodexRunnerLike {
    run(input: CodexRunInput, signal?: AbortSignal): Promise<CodexResult>;
}

interface PendingJob {
    id: string;
    resolve: () => void;
    reject: (error: unknown) => void;
}

export class CodexJobWorker {
    private readonly pending: PendingJob[] = [];
    private isDraining = false;
    private outstandingJobs = 0;
    private active: { id: string; controller: AbortController } | undefined;

    constructor(
        private readonly store: CodexJobStore,
        private readonly runner: CodexRunnerLike,
        private readonly publish: (job: CodexJob) => Promise<void>,
        private readonly maximumOutstandingJobs = 5
    ) {}

    enqueue(id: string): Promise<void> {
        if (this.outstandingJobs >= this.maximumOutstandingJobs) {
            return Promise.reject(new Error("The Codex job queue is full"));
        }
        this.outstandingJobs += 1;
        return new Promise<void>((resolvePromise, rejectPromise) => {
            let settled = false;
            const finish = (): void => {
                if (!settled) {
                    settled = true;
                    this.outstandingJobs -= 1;
                }
            };
            this.pending.push({
                id,
                resolve: () => {
                    finish();
                    resolvePromise();
                },
                reject: (error: unknown) => {
                    finish();
                    rejectPromise(error);
                }
            });
            void this.drain();
        });
    }

    async cancel(id: string): Promise<boolean> {
        const pendingIndex = this.pending.findIndex((job) => job.id === id);
        if (pendingIndex >= 0) {
            const [pending] = this.pending.splice(pendingIndex, 1);
            if (!pending) {
                return false;
            }
            try {
                const job = await this.store.get(id);
                if (!job || ["completed", "failed", "cancelled"].includes(job.status)) {
                    pending.resolve();
                    return false;
                }
                await this.store.update(id, { status: "cancelled", error: "Cancelled by a Discord member." });
                pending.resolve();
                return true;
            } catch (error: unknown) {
                pending.reject(error);
                throw error;
            }
        }

        const job = await this.store.get(id);
        if (!job || ["completed", "failed", "cancelled"].includes(job.status)) {
            return false;
        }
        if (this.active?.id === id) {
            this.active.controller.abort();
        }
        await this.store.update(id, { status: "cancelled", error: "Cancelled by a Discord member." });
        return true;
    }

    private async drain(): Promise<void> {
        if (this.isDraining) {
            return;
        }
        this.isDraining = true;
        try {
            for (;;) {
                const pending = this.pending.shift();
                if (!pending) {
                    return;
                }
                try {
                    await this.process(pending.id);
                    pending.resolve();
                } catch (error: unknown) {
                    pending.reject(error);
                }
            }
        } finally {
            this.isDraining = false;
            if (this.pending.length > 0) {
                void this.drain();
            }
        }
    }

    private async process(id: string): Promise<void> {
        const controller = new AbortController();
        this.active = { id, controller };
        try {
            const current = await this.store.get(id);
            if (!current || current.status === "cancelled") {
                return;
            }
            if (controller.signal.aborted) {
                await this.markCancelled(id);
                return;
            }
            await this.store.update(id, { status: "running" });
            if (controller.signal.aborted) {
                await this.markCancelled(id);
                return;
            }
            const result = codexResultSchema.parse(
                await this.runner.run(
                    {
                        id: current.id,
                        skill: current.skill,
                        instruction: current.instruction,
                        context: current.context
                    },
                    controller.signal
                )
            );
            if (controller.signal.aborted) {
                await this.markCancelled(id);
                return;
            }
            const latest = await this.store.get(id);
            if (latest?.status === "cancelled") {
                return;
            }
            const completed = await this.store.update(id, { status: "completed", result });
            if (controller.signal.aborted) {
                await this.markCancelled(id);
                return;
            }
            await this.publish(completed);
        } catch (error: unknown) {
            const latest = await this.store.get(id);
            if (controller.signal.aborted) {
                await this.markCancelled(id);
            } else if (latest?.status !== "cancelled") {
                const message = safeErrorMessage(error);
                await this.store.update(id, {
                    status: "failed",
                    error: usesKoreanOrEnglishWritingSystems(message)
                        ? message
                        : "Codex job failed; unsupported error details were withheld."
                });
            }
        } finally {
            if (this.active?.id === id) {
                this.active = undefined;
            }
        }
    }

    private async markCancelled(id: string): Promise<void> {
        await this.store.update(id, { status: "cancelled", error: "Cancelled by a Discord member." });
    }
}
