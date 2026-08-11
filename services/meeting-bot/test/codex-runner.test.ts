import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { CodexRunner, buildCodexEnvironment, resolveCodexLaunch, resolveCodexExecutable } from "../src/codex/runner.js";

describe("CodexRunner", () => {
    it("runs Codex in a read-only ephemeral process and validates structured output", async () => {
        const dataDirectory = await mkdtemp(join(tmpdir(), "codex-runner-"));
        const runner = new CodexRunner({
            binary: process.execPath,
            prefixArguments: [resolve("test/fixtures/fake-codex.mjs")],
            repositoryRoot: resolve("../.."),
            dataDirectory,
            timeoutMs: 5_000
        });

        const result = await runner.run({
            id: "CX-20260811-TEST01",
            skill: "meeting-to-game-plan",
            instruction: "Turn the meeting into a plan.",
            context: '<discord-context trust="untrusted-data">data</discord-context>'
        });

        expect(result).toMatchObject({
            status: "completed",
            summary: "fixture result"
        });
    });

    it("does not pass application secrets into the Codex child environment", () => {
        const environment = buildCodexEnvironment({
            PATH: "safe-path",
            USERPROFILE: "safe-profile",
            DISCORD_BOT_TOKEN: "discord-secret",
            GITHUB_TOKEN: "github-secret",
            OPENAI_API_KEY: "openai-secret",
            GITHUB_APP_PRIVATE_KEY_BASE64: "private-key"
        });

        expect(environment.PATH).toBe("safe-path");
        expect(environment.USERPROFILE).toBe("safe-profile");
        expect(environment.DISCORD_BOT_TOKEN).toBeUndefined();
        expect(environment.GITHUB_TOKEN).toBeUndefined();
        expect(environment.OPENAI_API_KEY).toBeUndefined();
        expect(environment.GITHUB_APP_PRIVATE_KEY_BASE64).toBeUndefined();
    });

    it("selects the explicit local Ollama provider without falling back to account usage", async () => {
        const dataDirectory = await mkdtemp(join(tmpdir(), "codex-runner-"));
        const localResult = {
            status: "completed",
            summary: "local fixture result",
            proposedChanges: ["one change"],
            verification: ["one check"],
            risks: []
        };
        const fetchImplementation = vi.fn(
            async (_input: string | URL | Request, _init?: RequestInit) =>
                new Response(JSON.stringify({ message: { content: JSON.stringify(localResult) } }), {
                    status: 200,
                    headers: { "content-type": "application/json" }
                })
        );
        const runner = new CodexRunner({
            binary: "codex",
            repositoryRoot: resolve("../.."),
            dataDirectory,
            timeoutMs: 5_000,
            provider: "ollama",
            model: "qwen2.5:7b-instruct",
            fetchImplementation
        });

        const result = await runner.run({
            id: "CX-20260811-TEST02",
            skill: "repo-task-plan",
            instruction: "local provider test",
            context: '<discord-context trust="untrusted-data">data</discord-context>'
        });

        expect(result.summary).toBe("local fixture result");
        expect(fetchImplementation).toHaveBeenCalledOnce();
        const [url, request] = fetchImplementation.mock.calls[0] ?? [];
        expect(url).toBe("http://127.0.0.1:11434/api/chat");
        expect(String(request?.body)).toContain("# Repo Task Plan");
        expect(String(request?.body)).toContain('"format":"json"');
    });

    it("resolves a native executable instead of an unspawnable Windows npm wrapper", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-bin-"));
        const executable = join(directory, "codex.exe");
        await writeFile(executable, "fixture", "utf8");

        await expect(resolveCodexExecutable("codex", { PATH: directory, PATHEXT: ".EXE;.CMD" }, "win32")).resolves.toBe(
            executable
        );
    });

    it("runs the Windows npm Codex shim through Node instead of spawning the cmd wrapper", async () => {
        const directory = await mkdtemp(join(tmpdir(), "codex-npm-shim-"));
        const script = join(directory, "node_modules", "@openai", "codex", "bin", "codex.js");
        await mkdir(join(directory, "node_modules", "@openai", "codex", "bin"), {
            recursive: true
        });
        await writeFile(script, "fixture", "utf8");

        await expect(resolveCodexLaunch("codex", { PATH: directory }, "win32")).resolves.toEqual({
            executable: process.execPath,
            prefixArguments: [script]
        });
    });
});
