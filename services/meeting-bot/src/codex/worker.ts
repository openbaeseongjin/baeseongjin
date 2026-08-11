import { safeErrorMessage } from "../logger.js";
import type { CodexJobStore } from "./job-store.js";
import type { CodexJob, CodexResult, CodexRunInput } from "./types.js";

interface CodexRunnerLike {
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
    private active: { id: string; controller: AbortController } | undefined;

    constructor(
        private readonly store: CodexJobStore,
        private readonly runner: CodexRunnerLike,
        private readonly publish: (job: CodexJob) => Promise<void>
    ) {}

    enqueue(id: string): Promise<void> {
        return new Promise<void>((resolvePromise, rejectPromise) => {
            this.pending.push({ id, resolve: resolvePromise, reject: rejectPromise });
            void this.drain();
        });
    }

    async cancel(id: string): Promise<boolean> {
        const job = await this.store.get(id);
        if (!job || ["completed", "failed", "cancelled"].includes(job.status)) {
            return false;
        }
        if (this.active?.id === id) {
            this.active.controller.abort();
        }
        await this.store.update(id, { status: "cancelled", error: "Cancelled by an operator." });
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
        const current = await this.store.get(id);
        if (!current || current.status === "cancelled") {
            return;
        }
        const controller = new AbortController();
        this.active = { id, controller };
        await this.store.update(id, { status: "running" });
        try {
            const result = await this.runner.run(
                {
                    id: current.id,
                    skill: current.skill,
                    instruction: current.instruction,
                    context: current.context
                },
                controller.signal
            );
            const latest = await this.store.get(id);
            if (latest?.status === "cancelled") {
                return;
            }
            const completed = await this.store.update(id, { status: "completed", result });
            await this.publish(completed);
        } catch (error: unknown) {
            const latest = await this.store.get(id);
            if (latest?.status !== "cancelled") {
                await this.store.update(id, {
                    status: "failed",
                    error: safeErrorMessage(error)
                });
            }
        } finally {
            if (this.active?.id === id) {
                this.active = undefined;
            }
        }
    }
}
