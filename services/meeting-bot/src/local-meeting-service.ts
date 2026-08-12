import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { safeErrorMessage } from "./logger.js";
import { buildMeetingSummary } from "./meeting-summary.js";
import type { MeetingClassifier } from "./ollama-meeting-classifier.js";
import {
  enforceExplicitPromotions,
  mergeExplicitTranscriptSignals,
  summarizeLocally,
} from "./promotion-gate.js";
import type {
  Minutes,
  MinutesDetails,
  TextMessageRecord,
  TranscriptEntry,
  VoiceSegment,
} from "./types.js";

export interface TranscriptionResult {
  entries: TranscriptEntry[];
  failures: string[];
}

export interface VoiceTranscriber {
  transcribeMany(filePaths: string[]): Promise<VoiceTranscription[]>;
}

export interface VoiceTranscription {
  text?: string;
  error?: string;
}

interface LocalWhisperOptions {
  pythonExecutable: string;
  scriptPath: string;
  model: string;
  cacheDir: string;
}

const execFileAsync = promisify(execFile);

function environmentWithoutSecrets(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) => !/(?:TOKEN|KEY|SECRET|PASSWORD|PRIVATE)/iu.test(name),
    ),
  );
}

export class LocalWhisperTranscriber implements VoiceTranscriber {
  constructor(private readonly options: LocalWhisperOptions) {}

  async transcribeMany(filePaths: string[]): Promise<VoiceTranscription[]> {
    const allResults: VoiceTranscription[] = [];
    for (let offset = 0; offset < filePaths.length; offset += 50) {
      const batch = filePaths.slice(offset, offset + 50);
      const { stdout } = await execFileAsync(
        this.options.pythonExecutable,
        [
          this.options.scriptPath,
          "--model",
          this.options.model,
          "--cache-dir",
          this.options.cacheDir,
          "--language",
          "ko",
          ...batch,
        ],
        {
          env: environmentWithoutSecrets(),
          maxBuffer: 1024 * 1024,
          timeout: 10 * 60 * 1000,
          windowsHide: true,
        },
      );
      const parsed = JSON.parse(stdout) as { results?: unknown };
      if (!Array.isArray(parsed.results) || parsed.results.length !== batch.length) {
        throw new Error("Local Whisper returned an invalid result count");
      }
      for (const result of parsed.results) {
        if (
          typeof result !== "object" ||
          result === null ||
          ("text" in result && typeof result.text !== "string") ||
          ("error" in result && typeof result.error !== "string")
        ) {
          throw new Error("Local Whisper returned an invalid result");
        }
        allResults.push(result as VoiceTranscription);
      }
    }
    return allResults;
  }
}

export class LocalMeetingService {
  constructor(
    private readonly voiceTranscriber: VoiceTranscriber,
    private readonly meetingClassifier?: MeetingClassifier,
  ) {}

  async transcribe(
    messages: TextMessageRecord[],
    voiceSegments: VoiceSegment[],
  ): Promise<TranscriptionResult> {
    const entries: TranscriptEntry[] = messages.flatMap((message) => {
      const text = message.content.trim();
      if (!text) {
        return [];
      }
      return [
        {
          id: `text:${message.id}`,
          source: "text" as const,
          timestamp: message.timestamp,
          speakerId: message.authorId,
          speaker: message.authorName,
          channelId: message.channelId,
          channelName: message.channelName,
          text,
        },
      ];
    });
    const failures: string[] = [];

    let voiceResults: VoiceTranscription[] = [];
    try {
      voiceResults = await this.voiceTranscriber.transcribeMany(
        voiceSegments.map((segment) => segment.filePath),
      );
    } catch (error: unknown) {
      const message = safeErrorMessage(error);
      failures.push(...voiceSegments.map((segment) => `${segment.id}: ${message}`));
    }

    for (const [index, segment] of voiceSegments.entries()) {
      const result = voiceResults[index];
      if (!result) {
        if (voiceResults.length > 0) {
          failures.push(`${segment.id}: Local Whisper returned no result`);
        }
        continue;
      }
      if (result.error) {
        failures.push(`${segment.id}: ${result.error}`);
        continue;
      }
      const text = result.text?.trim();
      if (text) {
        entries.push({
          id: segment.id,
          source: "voice",
          timestamp: segment.startedAt,
          speakerId: segment.userId,
          speaker: segment.userName,
          text,
        });
      }
    }

    entries.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
    return { entries, failures };
  }

  async summarize(transcript: TranscriptEntry[]): Promise<Minutes> {
    if (transcript.length === 0) {
      const details: MinutesDetails = {
        discussed: [],
        decided: [],
        rejected: [],
        hypotheses: [],
        actionItems: [],
        blockers: ["No transcript content was captured."],
        nextMeeting: null,
      };
      return { summary: buildMeetingSummary(details), references: [], ...details };
    }
    if (!this.meetingClassifier) {
      return summarizeLocally(transcript);
    }

    try {
      const classification = await this.meetingClassifier.classify(transcript);
      const candidates = mergeExplicitTranscriptSignals(classification.rawMinutes, transcript);
      const minutes = enforceExplicitPromotions(candidates, transcript);
      if (!classification.transcriptTruncated) {
        return minutes;
      }
      const blockers = [
        ...minutes.blockers,
        "The local classifier transcript was truncated; review the full transcript.",
      ];
      return {
        ...minutes,
        blockers,
        summary: buildMeetingSummary({ ...minutes, blockers }),
      };
    } catch {
      const minutes = summarizeLocally(transcript);
      const blockers = [
        ...minutes.blockers,
        "Local Ollama classification failed; deterministic rules were used.",
      ];
      return {
        ...minutes,
        blockers,
        summary: buildMeetingSummary({ ...minutes, blockers }),
      };
    }
  }
}
