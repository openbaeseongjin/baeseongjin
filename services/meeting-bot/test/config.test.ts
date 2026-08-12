import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("local meeting processing configuration", () => {
    it("starts without an OpenAI API key", () => {
        const config = loadConfig({
            DISCORD_BOT_TOKEN: "discord-token",
            DISCORD_CLIENT_ID: "12345678901234567",
            DISCORD_GUILD_ID: "12345678901234568",
            DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
            DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
            GITHUB_TOKEN: "github-token",
            LOCAL_TRANSCRIPTION_MODEL: "tiny",
            LOCAL_WHISPER_PYTHON: ".venv/Scripts/python.exe",
            LOCAL_MODEL_CACHE_DIR: ".test-model-cache"
        });

        expect(config.localProcessing).toEqual({
            transcriptionModel: "tiny",
            pythonExecutable: resolve(".venv/Scripts/python.exe"),
            modelCacheDir: resolve(".test-model-cache")
        });
    });

    it("uses the platform Python virtual environment when the override is blank", () => {
        const config = loadConfig({
            DISCORD_BOT_TOKEN: "discord-token",
            DISCORD_CLIENT_ID: "12345678901234567",
            DISCORD_GUILD_ID: "12345678901234568",
            DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
            DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
            GITHUB_TOKEN: "github-token",
            LOCAL_WHISPER_PYTHON: ""
        });

        expect(config.localProcessing.pythonExecutable).toBe(
            resolve(process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python")
        );
    });

    it("keeps the Codex gateway disabled and read-only by default", () => {
        const config = loadConfig({
            DISCORD_BOT_TOKEN: "discord-token",
            DISCORD_CLIENT_ID: "12345678901234567",
            DISCORD_GUILD_ID: "12345678901234568",
            DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
            DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
            GITHUB_TOKEN: "github-token"
        });

        expect(config.codex).toMatchObject({
            enabled: false,
            binary: "codex",
            provider: "ollama",
            ollamaBinary: "ollama",
            ollamaStartupTimeoutMs: 15_000,
            maxOutstandingJobs: 5,
            maxContextMessages: 30,
            maxContextCharacters: 20_000,
            timeoutMs: 600_000
        });
        expect(config.codex.repositoryRoot).toBe(resolve("../.."));
    });

    it("supports an explicit free local Ollama model", () => {
        const config = loadConfig({
            DISCORD_BOT_TOKEN: "discord-token",
            DISCORD_CLIENT_ID: "12345678901234567",
            DISCORD_GUILD_ID: "12345678901234568",
            DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
            DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
            GITHUB_TOKEN: "github-token",
            CODEX_ENABLED: "true",
            CODEX_PROVIDER: "ollama",
            CODEX_MODEL: "qwen2.5:7b-instruct",
            OLLAMA_BIN: "custom-ollama",
            OLLAMA_STARTUP_TIMEOUT_MS: "25000",
            CODEX_MAX_OUTSTANDING_JOBS: "3"
        });

        expect(config.codex).toMatchObject({
            enabled: true,
            provider: "ollama",
            model: "qwen2.5:7b-instruct",
            ollamaBinary: "custom-ollama",
            ollamaStartupTimeoutMs: 25_000,
            maxOutstandingJobs: 3
        });
    });

    it("adds bounded reference channels to meeting text capture", () => {
        const config = loadConfig({
            DISCORD_BOT_TOKEN: "discord-token",
            DISCORD_CLIENT_ID: "12345678901234567",
            DISCORD_GUILD_ID: "12345678901234568",
            DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
            DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
            DISCORD_REFERENCE_CHANNEL_IDS: "12345678901234571, 12345678901234572,12345678901234571",
            GITHUB_TOKEN: "github-token"
        });

        expect(config.discord.captureChannelIds).toEqual([
            "12345678901234569",
            "12345678901234571",
            "12345678901234572"
        ]);
    });

    it("rejects the minutes channel as a meeting reference source", () => {
        expect(() =>
            loadConfig({
                DISCORD_BOT_TOKEN: "discord-token",
                DISCORD_CLIENT_ID: "12345678901234567",
                DISCORD_GUILD_ID: "12345678901234568",
                DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
                DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
                DISCORD_REFERENCE_CHANNEL_IDS: "12345678901234570",
                GITHUB_TOKEN: "github-token"
            })
        ).toThrow(/minutes channel/iu);
    });

    it("enables meeting classification without opening the public Codex gateway", () => {
        const config = loadConfig({
            DISCORD_BOT_TOKEN: "discord-token",
            DISCORD_CLIENT_ID: "12345678901234567",
            DISCORD_GUILD_ID: "12345678901234568",
            DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
            DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
            GITHUB_TOKEN: "github-token",
            CODEX_ENABLED: "false",
            MEETING_CLASSIFIER_ENABLED: "true",
            MEETING_CLASSIFIER_MODEL: "qwen2.5:7b-instruct",
            MEETING_CLASSIFIER_TIMEOUT_MS: "90000",
            MEETING_CLASSIFIER_MAX_TRANSCRIPT_CHARACTERS: "24000",
            MEETING_OUTPUT_LANGUAGE: "ko"
        });

        expect(config.codex.enabled).toBe(false);
        expect(config.meetingClassifier).toEqual({
            enabled: true,
            model: "qwen2.5:7b-instruct",
            timeoutMs: 90_000,
            maxTranscriptCharacters: 24_000,
            outputLanguage: "ko"
        });
    });

    it("rejects different Ollama models for meeting classification and /codex", () => {
        expect(() =>
            loadConfig({
                DISCORD_BOT_TOKEN: "discord-token",
                DISCORD_CLIENT_ID: "12345678901234567",
                DISCORD_GUILD_ID: "12345678901234568",
                DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
                DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
                GITHUB_TOKEN: "github-token",
                CODEX_ENABLED: "true",
                CODEX_PROVIDER: "ollama",
                CODEX_MODEL: "qwen2.5:7b-instruct",
                MEETING_CLASSIFIER_ENABLED: "true",
                MEETING_CLASSIFIER_MODEL: "another-local-model"
            })
        ).toThrow(/same Ollama model/iu);
    });

    it("does not inherit a non-Ollama Codex model for meeting classification", () => {
        expect(() =>
            loadConfig({
                DISCORD_BOT_TOKEN: "discord-token",
                DISCORD_CLIENT_ID: "12345678901234567",
                DISCORD_GUILD_ID: "12345678901234568",
                DISCORD_MEETING_CHANNEL_ID: "12345678901234569",
                DISCORD_MINUTES_CHANNEL_ID: "12345678901234570",
                GITHUB_TOKEN: "github-token",
                CODEX_ENABLED: "true",
                CODEX_PROVIDER: "codex",
                CODEX_MODEL: "remote-model",
                MEETING_CLASSIFIER_ENABLED: "true"
            })
        ).toThrow(/MEETING_CLASSIFIER_MODEL/iu);
    });
});
