import { describe, expect, it, vi } from "vitest";
import { buildOllamaLaunch, OllamaRuntime } from "../src/codex/ollama-runtime.js";

const model = "qwen2.5:7b-instruct";

function tags(models: string[]): Response {
    return new Response(JSON.stringify({ models: models.map((name) => ({ name })) }), {
        status: 200,
        headers: { "content-type": "application/json" }
    });
}

describe("OllamaRuntime", () => {
    it("builds a direct detached launch without forwarding application secrets", () => {
        const launch = buildOllamaLaunch("C:\\Program Files\\Ollama\\ollama.exe", {
            PATH: "safe-path",
            DISCORD_BOT_TOKEN: "discord-secret",
            GITHUB_TOKEN: "github-secret",
            OPENAI_API_KEY: "openai-secret"
        });

        expect(launch).toMatchObject({
            executable: "C:\\Program Files\\Ollama\\ollama.exe",
            argumentsList: ["serve"],
            options: {
                detached: true,
                stdio: "ignore",
                windowsHide: true,
                env: { PATH: "safe-path" }
            }
        });
        expect(launch.options.shell).toBeUndefined();
    });

    it("skips all probes and launches when local Ollama is disabled", async () => {
        const fetchImplementation = vi.fn(async () => tags([model]));
        const launchImplementation = vi.fn(async () => undefined);
        const runtime = new OllamaRuntime({
            enabled: false,
            model,
            fetchImplementation,
            launchImplementation
        });

        await expect(runtime.ensureReady()).resolves.toEqual({ state: "skipped" });
        expect(fetchImplementation).not.toHaveBeenCalled();
        expect(launchImplementation).not.toHaveBeenCalled();
    });

    it("reuses an already-running server with the configured model", async () => {
        const fetchImplementation = vi.fn(async () => tags([model]));
        const launchImplementation = vi.fn(async () => undefined);
        const runtime = new OllamaRuntime({
            enabled: true,
            model,
            binary: "ollama",
            startupTimeoutMs: 1_000,
            fetchImplementation,
            launchImplementation
        });

        await expect(runtime.ensureReady()).resolves.toEqual({ state: "ready", started: false });
        expect(fetchImplementation).toHaveBeenCalledWith(
            "http://127.0.0.1:11434/api/tags",
            expect.objectContaining({ method: "GET" })
        );
        expect(launchImplementation).not.toHaveBeenCalled();
    });

    it("starts the server and waits until the configured model is ready", async () => {
        const fetchImplementation = vi
            .fn<typeof fetch>()
            .mockRejectedValueOnce(new TypeError("connection refused"))
            .mockResolvedValueOnce(tags([model]));
        const launchImplementation = vi.fn(async () => undefined);
        const waitImplementation = vi.fn(async () => undefined);
        const runtime = new OllamaRuntime({
            enabled: true,
            model,
            binary: "ollama",
            startupTimeoutMs: 1_000,
            fetchImplementation,
            launchImplementation,
            waitImplementation
        });

        await expect(Promise.all([runtime.ensureReady(), runtime.ensureReady()])).resolves.toEqual([
            { state: "ready", started: true },
            { state: "ready", started: true }
        ]);
        expect(launchImplementation).toHaveBeenCalledOnce();
        expect(waitImplementation).toHaveBeenCalled();
    });

    it("does not launch another server when only the configured model is missing", async () => {
        const launchImplementation = vi.fn(async () => undefined);
        const runtime = new OllamaRuntime({
            enabled: true,
            model,
            binary: "ollama",
            startupTimeoutMs: 1_000,
            fetchImplementation: vi.fn(async () => tags([])),
            launchImplementation
        });

        await expect(runtime.ensureReady()).resolves.toEqual({ state: "unavailable" });
        expect(launchImplementation).not.toHaveBeenCalled();
    });

    it("counts the initial probe against the configured startup deadline", async () => {
        let now = 0;
        const launchImplementation = vi.fn(async () => undefined);
        const runtime = new OllamaRuntime({
            enabled: true,
            model,
            startupTimeoutMs: 500,
            nowImplementation: () => now,
            fetchImplementation: vi.fn(async () => {
                now = 500;
                throw new TypeError("connection timed out");
            }),
            launchImplementation
        });

        await expect(runtime.ensureReady()).resolves.toEqual({ state: "unavailable" });
        expect(launchImplementation).not.toHaveBeenCalled();
    });

    it("keeps startup failures non-throwing so meeting recording can continue", async () => {
        const runtime = new OllamaRuntime({
            enabled: true,
            model,
            binary: "ollama",
            startupTimeoutMs: 1_000,
            fetchImplementation: vi.fn(async () => {
                throw new TypeError("connection refused");
            }),
            launchImplementation: vi.fn(async () => {
                throw new Error("binary not found");
            })
        });

        await expect(runtime.ensureReady()).resolves.toEqual({ state: "unavailable" });
    });
});
