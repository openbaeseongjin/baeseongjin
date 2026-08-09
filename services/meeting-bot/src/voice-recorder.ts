import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import {
  EndBehaviorType,
  type AudioReceiveStream,
  type VoiceConnection,
} from "@discordjs/voice";
import prism from "prism-media";
import { checkpoint, safeErrorMessage } from "./logger.js";
import type { VoiceSegment } from "./types.js";
import { WavFileWriter } from "./wav-file-writer.js";

interface ActiveCapture {
  stream: AudioReceiveStream;
  completion: Promise<void>;
  rotationTimer: ReturnType<typeof setTimeout>;
}

const MAX_SEGMENT_DURATION_MS = 8 * 60 * 1_000;
const MAX_SEGMENTS_PER_MEETING = 500;

export class VoiceRecorder {
  private readonly active = new Map<string, ActiveCapture>();
  private readonly segments: VoiceSegment[] = [];
  private sequence = 0;
  private stopped = false;
  private limitReached = false;

  constructor(
    private readonly connection: VoiceConnection,
    private readonly meetingId: string,
    private readonly dataDir: string,
    private readonly resolveUserName: (userId: string) => string,
  ) {}

  async start(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    this.connection.receiver.speaking.on("start", this.onSpeakingStart);
  }

  private readonly onSpeakingStart = (userId: string): void => {
    if (this.stopped || this.active.has(userId)) {
      return;
    }
    this.capture(userId);
  };

  private capture(userId: string): void {
    if (this.stopped || this.active.has(userId)) {
      return;
    }
    if (this.sequence >= MAX_SEGMENTS_PER_MEETING) {
      this.limitReached = true;
      return;
    }
    const startedAt = new Date();
    const sequence = ++this.sequence;
    const id = `voice:${this.meetingId}:${sequence}`;
    const filePath = resolve(this.dataDir, `${this.meetingId}-${sequence}.wav`);
    const stream = this.connection.receiver.subscribe(userId, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 1_000 },
    });
    const rotationTimer = setTimeout(() => stream.push(null), MAX_SEGMENT_DURATION_MS);
    rotationTimer.unref();
    const decoder = new prism.opus.Decoder({ rate: 16_000, channels: 1, frameSize: 320 });
    const writer = new WavFileWriter(filePath);

    const completion = pipeline(stream, decoder, writer)
      .then(async () => {
        const stats = await fs.stat(filePath);
        if (stats.size <= 8_044) {
          await this.removeAudio(filePath);
          return;
        }
        this.segments.push({
          id,
          filePath,
          userId,
          userName: this.resolveUserName(userId),
          startedAt: startedAt.toISOString(),
          endedAt: new Date().toISOString(),
        });
      })
      .catch(async (error: unknown) => {
        checkpoint("FAILED", `Voice segment ${id} | ${safeErrorMessage(error)}`);
        await this.removeAudio(filePath);
      })
      .finally(() => {
        clearTimeout(rotationTimer);
        this.active.delete(userId);
        if (!this.stopped && this.connection.receiver.speaking.users.has(userId)) {
          this.capture(userId);
        }
      });

    this.active.set(userId, { stream, completion, rotationTimer });
  }

  async stop(): Promise<VoiceSegment[]> {
    this.stopped = true;
    this.connection.receiver.speaking.off("start", this.onSpeakingStart);
    for (const capture of this.active.values()) {
      clearTimeout(capture.rotationTimer);
      capture.stream.push(null);
    }
    await Promise.all([...this.active.values()].map((capture) => capture.completion));
    return [...this.segments].sort((left, right) => left.startedAt.localeCompare(right.startedAt));
  }

  async cleanup(segments: VoiceSegment[]): Promise<void> {
    await Promise.all(segments.map((segment) => this.removeAudio(segment.filePath)));
  }

  didReachSegmentLimit(): boolean {
    return this.limitReached;
  }

  private async removeAudio(filePath: string): Promise<void> {
    const resolvedDataDir = resolve(this.dataDir) + sep;
    const resolvedFile = resolve(filePath);
    if (!resolvedFile.startsWith(resolvedDataDir)) {
      throw new Error("refusing to remove audio outside MEETING_DATA_DIR");
    }
    await fs.rm(resolvedFile, { force: true });
  }
}
