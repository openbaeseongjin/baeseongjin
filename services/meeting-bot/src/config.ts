import { resolve } from "node:path";
import { z } from "zod";

const snowflake = z.string().regex(/^\d{17,20}$/, "must be a Discord snowflake ID");
const optionalNonEmptyString = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional()
);

const booleanFromEnv = z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true");

const positiveIntegerFromEnv = (defaultValue: number) => z.coerce.number().int().positive().default(defaultValue);
const snowflakeListFromEnv = z.preprocess(
    (value) =>
        typeof value === "string"
            ? value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
            : [],
    z.array(snowflake).max(10)
);

const environmentSchema = z
    .object({
        DISCORD_BOT_TOKEN: z.string().min(1),
        DISCORD_CLIENT_ID: snowflake,
        DISCORD_GUILD_ID: snowflake,
        DISCORD_MEETING_CHANNEL_ID: snowflake,
        DISCORD_MINUTES_CHANNEL_ID: snowflake,
        DISCORD_REFERENCE_CHANNEL_IDS: snowflakeListFromEnv,
        LOCAL_TRANSCRIPTION_MODEL: z.string().min(1).default("tiny"),
        LOCAL_WHISPER_PYTHON: optionalNonEmptyString,
        LOCAL_MODEL_CACHE_DIR: z.string().min(1).default(".data/models"),
        GITHUB_REPOSITORY: z
            .string()
            .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
            .default("openbaeseongjin/baeseongjin"),
        GITHUB_BRANCH: z.string().min(1).default("main"),
        GITHUB_TOKEN: z.string().optional(),
        GITHUB_APP_ID: z.string().optional(),
        GITHUB_APP_INSTALLATION_ID: z.string().optional(),
        GITHUB_APP_PRIVATE_KEY_BASE64: z.string().optional(),
        ALLOW_PUBLIC_GITHUB_MINUTES: booleanFromEnv,
        MEETING_DATA_DIR: z.string().min(1).default(".data"),
        RETAIN_AUDIO: booleanFromEnv,
        LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
        CODEX_ENABLED: booleanFromEnv,
        CODEX_BIN: z.string().min(1).default("codex"),
        CODEX_PROVIDER: z.enum(["codex", "ollama", "lmstudio"]).default("ollama"),
        CODEX_MODEL: optionalNonEmptyString,
        OLLAMA_BIN: z.string().min(1).default("ollama"),
        OLLAMA_STARTUP_TIMEOUT_MS: positiveIntegerFromEnv(15_000),
        MEETING_CLASSIFIER_ENABLED: booleanFromEnv,
        MEETING_CLASSIFIER_MODEL: optionalNonEmptyString,
        MEETING_CLASSIFIER_TIMEOUT_MS: positiveIntegerFromEnv(120_000),
        MEETING_CLASSIFIER_MAX_TRANSCRIPT_CHARACTERS: positiveIntegerFromEnv(24_000),
        MEETING_OUTPUT_LANGUAGE: z.enum(["ko", "en"]).default("ko"),
        CODEX_REPOSITORY_ROOT: z.string().min(1).default("../.."),
        CODEX_MAX_CONTEXT_MESSAGES: positiveIntegerFromEnv(30),
        CODEX_MAX_CONTEXT_CHARACTERS: positiveIntegerFromEnv(20_000),
        CODEX_MAX_OUTSTANDING_JOBS: positiveIntegerFromEnv(5),
        CODEX_JOB_TIMEOUT_MS: positiveIntegerFromEnv(600_000)
    })
    .superRefine((environment, context) => {
        const appFields = [
            environment.GITHUB_APP_ID,
            environment.GITHUB_APP_INSTALLATION_ID,
            environment.GITHUB_APP_PRIVATE_KEY_BASE64
        ];
        const hasCompleteAppConfig = appFields.every(Boolean);
        const hasPartialAppConfig = appFields.some(Boolean) && !hasCompleteAppConfig;

        if (!environment.GITHUB_TOKEN && !hasCompleteAppConfig) {
            context.addIssue({
                code: "custom",
                message: "provide GITHUB_TOKEN or the complete GitHub App configuration",
                path: ["GITHUB_TOKEN"]
            });
        }

        if (hasPartialAppConfig) {
            context.addIssue({
                code: "custom",
                message: "GitHub App authentication requires app ID, installation ID, and private key",
                path: ["GITHUB_APP_ID"]
            });
        }

        if (environment.DISCORD_REFERENCE_CHANNEL_IDS.includes(environment.DISCORD_MINUTES_CHANNEL_ID)) {
            context.addIssue({
                code: "custom",
                message: "the minutes channel cannot be used as a meeting reference channel",
                path: ["DISCORD_REFERENCE_CHANNEL_IDS"]
            });
        }

        if (
            environment.MEETING_CLASSIFIER_ENABLED &&
            !environment.MEETING_CLASSIFIER_MODEL &&
            !(environment.CODEX_PROVIDER === "ollama" && environment.CODEX_MODEL)
        ) {
            context.addIssue({
                code: "custom",
                message: "meeting classification requires MEETING_CLASSIFIER_MODEL or CODEX_MODEL",
                path: ["MEETING_CLASSIFIER_MODEL"]
            });
        }

        if (
            environment.MEETING_CLASSIFIER_ENABLED &&
            environment.CODEX_ENABLED &&
            environment.CODEX_PROVIDER === "ollama" &&
            environment.MEETING_CLASSIFIER_MODEL &&
            environment.CODEX_MODEL &&
            environment.MEETING_CLASSIFIER_MODEL !== environment.CODEX_MODEL
        ) {
            context.addIssue({
                code: "custom",
                message: "meeting classification and /codex must use the same Ollama model",
                path: ["MEETING_CLASSIFIER_MODEL"]
            });
        }
    });

export interface AppConfig {
    discord: {
        botToken: string;
        clientId: string;
        guildId: string;
        meetingChannelId: string;
        minutesChannelId: string;
        captureChannelIds: string[];
    };
    localProcessing: {
        transcriptionModel: string;
        pythonExecutable: string;
        modelCacheDir: string;
    };
    github: {
        repository: string;
        branch: string;
        token?: string;
        app?: {
            appId: string;
            installationId: string;
            privateKeyBase64: string;
        };
        allowPublicMinutes: boolean;
    };
    runtime: {
        dataDir: string;
        retainAudio: boolean;
        logLevel: "debug" | "info" | "warn" | "error";
    };
    codex: {
        enabled: boolean;
        binary: string;
        provider: "codex" | "ollama" | "lmstudio";
        model?: string;
        ollamaBinary: string;
        ollamaStartupTimeoutMs: number;
        repositoryRoot: string;
        maxContextMessages: number;
        maxContextCharacters: number;
        maxOutstandingJobs: number;
        timeoutMs: number;
    };
    meetingClassifier: {
        enabled: boolean;
        model?: string;
        timeoutMs: number;
        maxTranscriptCharacters: number;
        outputLanguage: "ko" | "en";
    };
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
    const parsed = environmentSchema.parse(environment);
    const githubApp =
        parsed.GITHUB_APP_ID && parsed.GITHUB_APP_INSTALLATION_ID && parsed.GITHUB_APP_PRIVATE_KEY_BASE64
            ? {
                  appId: parsed.GITHUB_APP_ID,
                  installationId: parsed.GITHUB_APP_INSTALLATION_ID,
                  privateKeyBase64: parsed.GITHUB_APP_PRIVATE_KEY_BASE64
              }
            : undefined;
    const meetingClassifierModel =
        parsed.MEETING_CLASSIFIER_MODEL ??
        (parsed.CODEX_PROVIDER === "ollama" ? parsed.CODEX_MODEL : undefined);

    return {
        discord: {
            botToken: parsed.DISCORD_BOT_TOKEN,
            clientId: parsed.DISCORD_CLIENT_ID,
            guildId: parsed.DISCORD_GUILD_ID,
            meetingChannelId: parsed.DISCORD_MEETING_CHANNEL_ID,
            minutesChannelId: parsed.DISCORD_MINUTES_CHANNEL_ID,
            captureChannelIds: [
                ...new Set([parsed.DISCORD_MEETING_CHANNEL_ID, ...parsed.DISCORD_REFERENCE_CHANNEL_IDS])
            ]
        },
        localProcessing: {
            transcriptionModel: parsed.LOCAL_TRANSCRIPTION_MODEL,
            pythonExecutable: resolve(
                parsed.LOCAL_WHISPER_PYTHON ??
                    (process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python")
            ),
            modelCacheDir: resolve(parsed.LOCAL_MODEL_CACHE_DIR)
        },
        github: {
            repository: parsed.GITHUB_REPOSITORY,
            branch: parsed.GITHUB_BRANCH,
            ...(parsed.GITHUB_TOKEN ? { token: parsed.GITHUB_TOKEN } : {}),
            ...(githubApp ? { app: githubApp } : {}),
            allowPublicMinutes: parsed.ALLOW_PUBLIC_GITHUB_MINUTES
        },
        runtime: {
            dataDir: resolve(parsed.MEETING_DATA_DIR),
            retainAudio: parsed.RETAIN_AUDIO,
            logLevel: parsed.LOG_LEVEL
        },
        codex: {
            enabled: parsed.CODEX_ENABLED,
            binary: parsed.CODEX_BIN,
            provider: parsed.CODEX_PROVIDER,
            ...(parsed.CODEX_MODEL ? { model: parsed.CODEX_MODEL } : {}),
            ollamaBinary: parsed.OLLAMA_BIN,
            ollamaStartupTimeoutMs: parsed.OLLAMA_STARTUP_TIMEOUT_MS,
            repositoryRoot: resolve(parsed.CODEX_REPOSITORY_ROOT),
            maxContextMessages: parsed.CODEX_MAX_CONTEXT_MESSAGES,
            maxContextCharacters: parsed.CODEX_MAX_CONTEXT_CHARACTERS,
            maxOutstandingJobs: parsed.CODEX_MAX_OUTSTANDING_JOBS,
            timeoutMs: parsed.CODEX_JOB_TIMEOUT_MS
        },
        meetingClassifier: {
            enabled: parsed.MEETING_CLASSIFIER_ENABLED,
            ...(meetingClassifierModel ? { model: meetingClassifierModel } : {}),
            timeoutMs: parsed.MEETING_CLASSIFIER_TIMEOUT_MS,
            maxTranscriptCharacters: parsed.MEETING_CLASSIFIER_MAX_TRANSCRIPT_CHARACTERS,
            outputLanguage: parsed.MEETING_OUTPUT_LANGUAGE
        }
    };
}
