import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { finished } from "node:stream/promises";
import { afterEach, describe, expect, it } from "vitest";
import { WavFileWriter } from "../src/wav-file-writer.js";

let testDirectory: string | undefined;

afterEach(async () => {
  if (testDirectory) {
    await fs.rm(testDirectory, { recursive: true, force: true });
    testDirectory = undefined;
  }
});

describe("WAV writer", () => {
  it("writes a valid PCM header with the final data length", async () => {
    testDirectory = await fs.mkdtemp(join(tmpdir(), "meeting-bot-wav-"));
    const filePath = join(testDirectory, "segment.wav");
    const writer = new WavFileWriter(filePath);
    const pcm = Buffer.alloc(19_200, 1);

    writer.end(pcm);
    await finished(writer);

    const output = await fs.readFile(filePath);
    expect(output.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(output.subarray(8, 12).toString("ascii")).toBe("WAVE");
    expect(output.readUInt16LE(22)).toBe(1);
    expect(output.readUInt32LE(24)).toBe(16_000);
    expect(output.readUInt32LE(40)).toBe(pcm.length);
    expect(output.length).toBe(44 + pcm.length);
  });
});
