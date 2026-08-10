import { execFile } from "node:child_process";
import { delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("local Whisper Python entrypoint", () => {
  it("transcribes on CPU int8 and returns one JSON object", async () => {
    const scriptPath = fileURLToPath(new URL("../scripts/local_whisper.py", import.meta.url));
    const fixturePath = fileURLToPath(new URL("./fixtures/python", import.meta.url));
    const pythonExecutable = process.platform === "win32" ? "py" : "python3";
    const pythonPrefix = process.platform === "win32" ? ["-3"] : [];
    const { stdout } = await execFileAsync(
      pythonExecutable,
      [
        ...pythonPrefix,
        scriptPath,
        "--model",
        "tiny",
        "--cache-dir",
        "model-cache",
        "--language",
        "ko",
        "voice-1.wav",
        "voice-2.wav",
      ],
      {
        env: {
          ...process.env,
          PYTHONPATH: [fixturePath, process.env.PYTHONPATH].filter(Boolean).join(delimiter),
        },
        windowsHide: true,
      },
    );

    expect(JSON.parse(stdout)).toEqual({
      results: [{ text: "로프 액션 로그라이크" }, { text: "로프 액션 로그라이크" }],
    });
  });
});
