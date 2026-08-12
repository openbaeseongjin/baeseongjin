import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import * as serviceModule from "../src/local-meeting-service.js";
import type { TextMessageRecord, VoiceSegment } from "../src/types.js";

describe("local meeting processing", () => {
  it("invokes a local transcription process and reads its JSON result", async () => {
    const LocalWhisperTranscriber = (
      serviceModule as unknown as {
        LocalWhisperTranscriber: new (options: {
          pythonExecutable: string;
          scriptPath: string;
          model: string;
          cacheDir: string;
        }) => { transcribeMany(filePaths: string[]): Promise<Array<{ text?: string; error?: string }>> };
      }
    ).LocalWhisperTranscriber;
    const transcriber = new LocalWhisperTranscriber({
      pythonExecutable: process.execPath,
      scriptPath: fileURLToPath(new URL("./fixtures/fake-whisper.mjs", import.meta.url)),
      model: "tiny",
      cacheDir: ".test-model-cache",
    });

    await expect(transcriber.transcribeMany(["voice-1.wav", "voice-2.wav"])).resolves.toEqual([
      { text: "local:voice-1.wav" },
      { text: "local:voice-2.wav" },
    ]);
  });

  it("combines text and locally transcribed voice with Discord speaker identity", async () => {
    const LocalMeetingService = (
      serviceModule as unknown as {
        LocalMeetingService: new (transcriber: {
          transcribeMany(filePaths: string[]): Promise<Array<{ text?: string; error?: string }>>;
        }) => {
          transcribe(
            messages: TextMessageRecord[],
            voiceSegments: VoiceSegment[],
          ): Promise<{
            entries: Array<{
              id: string;
              source: string;
              timestamp: string;
              speakerId: string;
              speaker: string;
              text: string;
            }>;
            failures: string[];
          }>;
        };
      }
    ).LocalMeetingService;
    const service = new LocalMeetingService({
      async transcribeMany(filePaths: string[]): Promise<Array<{ text: string }>> {
        expect(filePaths).toEqual(["voice.wav"]);
        return [{ text: "로프 액션으로 결정하자" }];
      },
    });
    const messages: TextMessageRecord[] = [
      {
        id: "message-1",
        channelId: "channel-planning",
        channelName: "기획",
        timestamp: "2026-08-10T13:00:00.000Z",
        authorId: "user-1",
        authorName: "성현",
        content: "아이디어: 자동 성장",
        attachments: [
          { name: "growth-reference.pdf", contentType: "application/pdf", sizeBytes: 1024 },
        ],
      },
    ];
    const voiceSegments: VoiceSegment[] = [
      {
        id: "voice-1",
        filePath: "voice.wav",
        userId: "user-2",
        userName: "용호",
        startedAt: "2026-08-10T13:01:00.000Z",
        endedAt: "2026-08-10T13:01:02.000Z",
      },
    ];

    const result = await service.transcribe(messages, voiceSegments);

    expect(result.failures).toEqual([]);
    expect(result.entries).toEqual([
      {
        id: "text:message-1",
        source: "text",
        timestamp: "2026-08-10T13:00:00.000Z",
        speakerId: "user-1",
        speaker: "성현",
        text: "아이디어: 자동 성장",
        channelId: "channel-planning",
        channelName: "기획",
      },
      {
        id: "voice-1",
        source: "voice",
        timestamp: "2026-08-10T13:01:00.000Z",
        speakerId: "user-2",
        speaker: "용호",
        text: "로프 액션으로 결정하자",
      },
    ]);
  });
});
