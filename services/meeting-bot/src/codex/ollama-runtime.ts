import { spawn, type SpawnOptions } from "node:child_process";
import { checkpoint, safeErrorMessage } from "../logger.js";
import { buildCodexEnvironment } from "./runner.js";

export type OllamaReadiness = { state: "skipped" } | { state: "ready"; started: boolean } | { state: "unavailable" };

export interface OllamaRuntimeLike {
    ensureReady(): Promise<OllamaReadiness>;
}

type ProbeResult = "ready" | "server-unavailable" | "model-unavailable";

interface OllamaRuntimeOptions {
    enabled: boolean;
    model?: string;
    binary?: string;
    startupTimeoutMs?: number;
    fetchImplementation?: typeof fetch;
    launchImplementation?: () => Promise<void>;
    nowImplementation?: () => number;
    waitImplementation?: (durationMs: number) => Promise<void>;
}

export interface OllamaLaunch {
    executable: string;
    argumentsList: string[];
    options: SpawnOptions;
}

export function buildOllamaLaunch(binary: string, environment: NodeJS.ProcessEnv = process.env): OllamaLaunch {
    return {
        executable: binary,
        argumentsList: ["serve"],
        options: {
            detached: true,
            env: buildCodexEnvironment(environment),
            stdio: "ignore",
            windowsHide: true
        }
    };
}

export class OllamaRuntime implements OllamaRuntimeLike {
    private inFlight: Promise<OllamaReadiness> | undefined;

    constructor(private readonly options: OllamaRuntimeOptions) {}

    async ensureReady(): Promise<OllamaReadiness> {
        if (!this.options.enabled) {
            return { state: "skipped" };
        }
        if (this.inFlight) {
            return this.inFlight;
        }

        const attempt = this.ensureReadyOnce();
        this.inFlight = attempt;
        try {
            return await attempt;
        } finally {
            if (this.inFlight === attempt) {
                this.inFlight = undefined;
            }
        }
    }

    private async ensureReadyOnce(): Promise<OllamaReadiness> {
        if (!this.options.model) {
            checkpoint("BLOCKED", "Ollama auto-start | CODEX_MODEL is not configured");
            return { state: "unavailable" };
        }

        const deadline = this.now() + (this.options.startupTimeoutMs ?? 15_000);
        const initial = await this.probe(deadline);
        if (initial === "ready") {
            return { state: "ready", started: false };
        }
        if (initial === "model-unavailable") {
            checkpoint("BLOCKED", "Ollama auto-start | Configured local model is not installed");
            return { state: "unavailable" };
        }
        if (this.remaining(deadline) <= 0) {
            return this.timedOut();
        }

        try {
            await this.launchBefore(deadline);
            checkpoint("RUNNING", "Ollama auto-start | Waiting for local loopback service");
        } catch (error: unknown) {
            checkpoint("FAILED", `Ollama auto-start | ${safeErrorMessage(error)}`);
            return { state: "unavailable" };
        }
        if (this.remaining(deadline) <= 0) {
            return this.timedOut();
        }

        while (this.remaining(deadline) > 0) {
            await this.wait(deadline);
            if (this.remaining(deadline) <= 0) {
                break;
            }
            const result = await this.probe(deadline);
            if (result === "ready") {
                checkpoint("SUCCESS", "Ollama auto-start | Local model is ready");
                return { state: "ready", started: true };
            }
            if (result === "model-unavailable") {
                checkpoint("BLOCKED", "Ollama auto-start | Configured local model is not installed");
                return { state: "unavailable" };
            }
        }

        return this.timedOut();
    }

    private async probe(deadline: number): Promise<ProbeResult> {
        const remaining = this.remaining(deadline);
        if (remaining <= 0) {
            return "server-unavailable";
        }
        try {
            const response = await (this.options.fetchImplementation ?? fetch)("http://127.0.0.1:11434/api/tags", {
                method: "GET",
                redirect: "error",
                signal: AbortSignal.timeout(Math.max(1, Math.min(2_000, Math.ceil(remaining))))
            });
            if (!response.ok) {
                return "server-unavailable";
            }

            const payload: unknown = await response.json();
            if (this.remaining(deadline) <= 0) {
                return "server-unavailable";
            }
            if (!payload || typeof payload !== "object" || !("models" in payload)) {
                return "server-unavailable";
            }
            const models = (payload as { models?: unknown }).models;
            if (!Array.isArray(models)) {
                return "server-unavailable";
            }
            const available = models.some((candidate: unknown) => {
                if (!candidate || typeof candidate !== "object") {
                    return false;
                }
                const record = candidate as { model?: unknown; name?: unknown };
                return record.name === this.options.model || record.model === this.options.model;
            });
            return available ? "ready" : "model-unavailable";
        } catch {
            return "server-unavailable";
        }
    }

    private async launchBefore(deadline: number): Promise<void> {
        const remaining = this.remaining(deadline);
        if (remaining <= 0) {
            throw new Error("Ollama startup deadline elapsed");
        }

        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
            await Promise.race([
                this.launch(),
                new Promise<never>((_resolvePromise, rejectPromise) => {
                    timeout = setTimeout(() => rejectPromise(new Error("Ollama startup deadline elapsed")), remaining);
                })
            ]);
        } finally {
            if (timeout) {
                clearTimeout(timeout);
            }
        }
    }

    private async launch(): Promise<void> {
        if (this.options.launchImplementation) {
            await this.options.launchImplementation();
            return;
        }

        await new Promise<void>((resolvePromise, rejectPromise) => {
            const launch = buildOllamaLaunch(this.options.binary ?? "ollama");
            const child = spawn(launch.executable, launch.argumentsList, launch.options);
            child.once("error", rejectPromise);
            child.once("spawn", () => {
                child.unref();
                resolvePromise();
            });
        });
    }

    private async wait(deadline: number): Promise<void> {
        const durationMs = Math.min(250, Math.max(0, this.remaining(deadline)));
        if (durationMs <= 0) {
            return;
        }
        if (this.options.waitImplementation) {
            await this.options.waitImplementation(durationMs);
            return;
        }
        await new Promise<void>((resolvePromise) => setTimeout(resolvePromise, durationMs));
    }

    private now(): number {
        return this.options.nowImplementation?.() ?? Date.now();
    }

    private remaining(deadline: number): number {
        return deadline - this.now();
    }

    private timedOut(): OllamaReadiness {
        checkpoint("FAILED", "Ollama auto-start | Local service did not become ready before timeout");
        return { state: "unavailable" };
    }
}
