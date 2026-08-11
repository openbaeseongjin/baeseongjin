import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CodexJob, CreateCodexJob } from "./types.js";

const JOB_ID_PATTERN = /^CX-\d{8}-[A-Z0-9]{6}$/u;

function createJobId(now: Date): string {
    const date = now.toISOString().slice(0, 10).replaceAll("-", "");
    return `CX-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export class CodexJobStore {
    private readonly jobsDirectory: string;

    constructor(dataDirectory: string) {
        this.jobsDirectory = join(dataDirectory, "jobs");
    }

    async create(input: CreateCodexJob): Promise<CodexJob> {
        const now = new Date();
        const job: CodexJob = {
            ...input,
            id: createJobId(now),
            status: "queued",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };
        await this.write(job);
        return job;
    }

    async get(id: string): Promise<CodexJob | undefined> {
        if (!JOB_ID_PATTERN.test(id)) {
            return undefined;
        }
        try {
            return JSON.parse(await readFile(this.pathFor(id), "utf8")) as CodexJob;
        } catch (error: unknown) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                return undefined;
            }
            throw error;
        }
    }

    async update(id: string, changes: Partial<CodexJob>): Promise<CodexJob> {
        this.assertValidId(id);
        const current = await this.get(id);
        if (!current) {
            throw new Error(`Codex job ${id} was not found`);
        }
        const updated: CodexJob = {
            ...current,
            ...changes,
            id: current.id,
            updatedAt: new Date().toISOString()
        };
        await this.write(updated);
        return updated;
    }

    private assertValidId(id: string): void {
        if (!JOB_ID_PATTERN.test(id)) {
            throw new Error("Invalid Codex job ID");
        }
    }

    private pathFor(id: string): string {
        return join(this.jobsDirectory, `${id}.json`);
    }

    private async write(job: CodexJob): Promise<void> {
        await mkdir(this.jobsDirectory, { recursive: true });
        const destination = this.pathFor(job.id);
        const temporary = `${destination}.${process.pid}.tmp`;
        await writeFile(temporary, `${JSON.stringify(job, null, 2)}\n`, {
            encoding: "utf8",
            mode: 0o600
        });
        await rename(temporary, destination);
    }
}
