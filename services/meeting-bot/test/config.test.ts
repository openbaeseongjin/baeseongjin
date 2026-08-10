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
      LOCAL_MODEL_CACHE_DIR: ".test-model-cache",
    });

    expect(config.localProcessing).toEqual({
      transcriptionModel: "tiny",
      pythonExecutable: resolve(".venv/Scripts/python.exe"),
      modelCacheDir: resolve(".test-model-cache"),
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
      LOCAL_WHISPER_PYTHON: "",
    });

    expect(config.localProcessing.pythonExecutable).toBe(
      resolve(process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python"),
    );
  });
});
