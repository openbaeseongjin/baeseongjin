# Discord meeting minutes bot

This long-running Node.js service captures a meeting only between `/meeting start` and `/meeting end`. It does not schedule or start the team's 22:00–23:00 KST meeting automatically.

## Implemented scope

- Guild slash commands: `/meeting start` and `/meeting end`, available to every guild member in the configured meeting channel.
- Text capture from the meeting channel plus optional planning/coding channels configured through `DISCORD_REFERENCE_CHANNEL_IDS`, strictly between start and end.
- Optional voice capture from the command user's current voice channel.
- DAVE-enabled Discord voice connection and per-Discord-user audio segments.
- Free local speech transcription with `faster-whisper`, CPU `int8`, and exact Discord user attribution.
- An optional free loopback-Ollama classifier for natural Korean/English conversation, followed by a deterministic evidence and intent gate.
- A deterministic 3–5 line `SUMMARY`, followed by structured `DISCUSSED / DECIDED / REJECTED / HYPOTHESES / REFERENCES / ACTION ITEMS / BLOCKERS / NEXT MEETING` minutes.
- Non-promotable `REFERENCES` containing channel, author, time, external URL, and attachment name/type/size metadata. The bot never downloads or opens linked files.
- End-time history reconciliation so edits, deletions, and messages missed during a Gateway interruption use the final channel state when Discord permits history access.
- Conservative promotion: only evidence-backed explicit agreement, rejection, assignment/commitment, blocker, or confirmed schedule can enter the corresponding final field.
- Discord minutes-channel publication and one atomic Git commit covering the dated minutes plus any eligible decision/task ledger updates.
- Local mock transcript tests. No OpenAI key or paid API call is used by the service or test suite.
- Opt-in `/codex plan`, `/codex status`, `/codex result`, and `/codex cancel` commands that run only allowlisted repository skills in the Codex CLI read-only sandbox.

GitHub Issue creation is intentionally not implemented.
Codex code modification, approval, worktree, push, pull request, and merge operations are intentionally not implemented in V1.

## Data flow

1. `/meeting start` begins capture in the configured meeting/reference channels. The public start notice lists those channels and the fields that will be republished. If the caller is in voice, the bot joins with DAVE enabled and announces local recording and transcription.
2. Discord voice packets are separated by Discord user ID, decoded from Opus, and written as short WAV speaking segments in `MEETING_DATA_DIR`.
3. `/meeting end` closes the streams and runs each segment through `faster-whisper` on the bot host. Audio is not sent to an AI API. Discord's user identity remains the authoritative speaker label.
4. Discord history is reconciled for each capture channel within the meeting window. If history access fails for a channel, the bot keeps its live capture and records a blocker.
5. When `MEETING_CLASSIFIER_ENABLED=true`, fixed-loopback Ollama proposes all seven semantic categories with exact transcript evidence. Strict schema, writing-system, exact-quote, topic-overlap, speaker, uncertainty, and intent checks make the final decision. A model failure falls back to labelled deterministic rules without exposing raw model errors.
6. Links and safe attachment metadata are extracted independently into `REFERENCES`; Discord signed attachment URLs and file contents are never persisted.
7. A 3–5 line `SUMMARY` is derived only from the already-gated detail fields. It is display data, not evidence for `DECISIONS.md` or `TASKS.md`.
8. Summary-first minutes are posted to the configured Discord channel and, only when explicitly permitted, committed to GitHub. Audio is deleted after processing unless `RETAIN_AUDIO=true`.

## Read-only Discord to Codex gateway

The gateway is disabled by default. It is independent from `MEETING_CLASSIFIER_ENABLED`: natural meeting classification can run locally without exposing `/codex`. When `CODEX_ENABLED=true`, any server member can run these commands in the configured meeting channel:

```text
/codex plan skill:meeting-to-game-plan source:last-meeting instruction:다음 개발 순서를 정리해줘
/codex plan skill:repo-task-plan source:recent-messages instruction:이 기능의 구현 범위를 계획해줘
/codex plan skill:discord-repo-cross-reference source:recent-messages instruction:논의와 현재 코드·문서·테스트의 일치 여부를 양방향으로 연결해줘
/codex status job:CX-YYYYMMDD-ABC123
/codex result job:CX-YYYYMMDD-ABC123
/codex cancel job:CX-YYYYMMDD-ABC123
```

Only `meeting-to-game-plan`, `repo-task-plan`, and `discord-repo-cross-reference` are accepted. The cross-reference skill maps Discord claims to repository evidence and repository evidence back to related Discord claims without modifying either side. Discord content is delimited as untrusted data, bounded by message and character limits, and never interpreted as shell or permission instructions. Every member with access to the configured meeting channel may submit, inspect, and cancel jobs. Each member may have one outstanding plan at a time, and `CODEX_MAX_OUTSTANDING_JOBS` caps the total outstanding jobs (default `5`). Jobs are persisted under `.data/codex/jobs`, processed one at a time, and posted to the configured minutes channel with mentions disabled.

The public Discord gateway accepts only `CODEX_PROVIDER=ollama`. Authenticated Codex CLI and LM Studio providers are rejected so an unrestricted server member cannot consume Codex account quota or select a broader local endpoint through `/codex`.

With `CODEX_PROVIDER=ollama`, the runner loads the selected allowlisted repository `SKILL.md` itself and calls only the fixed loopback endpoint `http://127.0.0.1:11434/api/chat`. The response is required to be JSON and is validated against the same strict local schema. This path uses no OpenAI API key or Codex account quota. When `/meeting start` is accepted, meeting capture becomes active first and Ollama preparation continues in the background. The bot probes `http://127.0.0.1:11434/api/tags`; if the service is down, it launches `<OLLAMA_BIN> serve` as a detached hidden process and waits up to `OLLAMA_STARTUP_TIMEOUT_MS` for the configured `CODEX_MODEL`. The child receives only a small operating-system environment allowlist, not Discord, GitHub, or OpenAI secrets. The bot does not install Ollama or pull a missing model automatically. A launch or model failure leaves the meeting running and updates the start response to report that `/codex` is unavailable; it never falls back to a paid API. The detached Ollama service remains running after `/meeting end`. Keep `CODEX_ENABLED=false` when the local resource model is not acceptable.

Codex output is limited to Korean or English writing systems. A trusted operator instruction containing Hangul requests Korean output; other instructions request English. Every result field is checked after generation and again before persistence and rendering. If the first local result contains Han ideographs, Japanese kana, Cyrillic, Arabic, or another unsupported writing system, Ollama receives one bounded validation retry. A second failure is not published, and legacy invalid results are withheld from `/codex result`. This is a deterministic writing-system guarantee; it cannot distinguish English from another language written entirely with Latin letters.

V1 cannot edit the repository, install software, invoke `$github-task-flow`, publish a PR, or merge code. A completed plan is advisory and needs a separate human-approved implementation flow.

## Prerequisites

- Node.js 22.12 or newer and npm.
- Python 3.11–3.13 for local transcription.
- A Discord application installed in the target server.
- A fine-grained GitHub token or GitHub App installation authorized only for this repository.
- Ollama plus the configured local model installed on the bot host when using the meeting classifier or `CODEX_PROVIDER=ollama`.
- Participant consent and a team retention policy appropriate for voice recording, transcription, and public or private publication.

## Discord Developer Portal setup

1. Create an application and bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. On the **Bot** page, enable the privileged **Message Content Intent**. Guild and voice-state events are requested by the service but do not require an additional privileged-intent toggle.
3. Reset/copy the bot token once and store it only in the deployment environment as `DISCORD_BOT_TOKEN`.
4. Copy the application ID into `DISCORD_CLIENT_ID` and the server ID into `DISCORD_GUILD_ID`.
5. With Discord Developer Mode enabled, copy the meeting text/channel-chat ID into `DISCORD_MEETING_CHANNEL_ID`, the `#회의록` channel ID into `DISCORD_MINUTES_CHANNEL_ID`, and optional planning/coding IDs as a comma-separated `DISCORD_REFERENCE_CHANNEL_IDS` value.
6. Every server member may use `/meeting` and `/codex` in the configured meeting text channel. Both commands reject requests from other servers or channels.
7. In **OAuth2 > URL Generator**, select `bot` and `applications.commands`. Grant only:
    - View Channels
    - Send Messages
    - Read Message History
    - Connect
8. Install the bot in the server. In every capture channel grant the bot **View Channel** and **Read Message History**. Grant **Send Messages** only in channels where the bot posts notices/minutes, and **Connect** in the voice channel.
9. In the meeting channel, ensure the team or `@everyone` role has **Use Application Commands** and is not denied under **Server Settings > Integrations**. Reference channels do not need command permission.

Before every start, the service verifies that the requester can view every capture channel and the minutes channel. It also requires all capture/minutes channels to share the same category parent and the same explicit `View Channel` overwrite policy; use Discord's synced category permissions. The start fails closed when a channel or audience policy cannot be verified. This prevents a broader minutes audience from receiving private planning/coding text, display names, links, or filenames. The service also refuses to use the minutes channel itself as a reference channel.

The start command uses the caller's current voice channel. If the caller is not in voice, the meeting is text-only. If the caller is in voice and the DAVE connection fails, the service refuses to start instead of silently dropping audio.

## Free local transcription and classification

No OpenAI key is required. Voice transcription uses `faster-whisper` with the multilingual `tiny` model on CPU. The first voice transcription downloads the free model into `LOCAL_MODEL_CACHE_DIR`; subsequent meetings reuse that local cache. This has no per-use API fee, but it uses the host's CPU, memory, disk, and initial download bandwidth.

For ordinary natural conversation, set `MEETING_CLASSIFIER_ENABLED=true`, install the selected model in Ollama, and set `MEETING_CLASSIFIER_MODEL`. `CODEX_MODEL` is reused only when `CODEX_PROVIDER=ollama`; when both local features are enabled, they must use the same Ollama model. The classifier calls only `http://127.0.0.1:11434/api/chat`, uses a strict JSON schema, and never falls back to OpenAI, Codex account quota, or another paid endpoint. Generated fields permit only Latin/Hangul writing systems; exact evidence quotes remain internal and are never rendered. Invalid structured/language output receives one bounded repair attempt. Timeout, transport failure, a second invalid result, or an over-limit single transcript entry activates the deterministic fallback and records a safe blocker.

Ollama output is only a candidate. Every category must cite exact transcript substrings. Questions and tentative phrases remain hypotheses; a conversational decision requires either an explicit decision phrase or an adjacent proposal followed within two minutes by clear agreement from a different speaker in the same source/channel. Explicit rejection, blocker, and schedule intent is conservatively re-routed from the cited source when the small local model chooses the wrong category. Action owners, tasks, and due dates must occur in the same cited assignment span, and a confirmed next meeting must include a real schedule expression. Unrelated evidence cannot be combined across clauses to promote another topic.

For safe deterministic promotion, use these exact text forms in the meeting channel:

```text
결정: 2D 횡스크롤로 확정
기각: AI 추리게임 방향은 제외
아이디어: 자동 성장 시스템
할 일: 용호 | 로프 프로토타입 구현 | 내일
막힘: 로프 충돌 판정 불안정
다음 회의: 내일 오후 10시
```

When the optional classifier is disabled or unavailable, ordinary text and unlabelled voice transcript remain in `DISCUSSED`. Voice recognition may omit punctuation, so the labels above remain the most reliable way to update `DECISIONS.md` and `TASKS.md`.

The summary prioritizes confirmed decisions, explicit action items, blockers, the next meeting, and discussion, while retaining `가설` or `제외` labels when those categories are shown. It contains 3–5 bounded lines and never reclassifies a hypothesis as a decision. The summary itself makes no Ollama or paid API call; it is derived from the final gated fields.

`REFERENCES` is deterministic and independent from the classifier. A message becomes a reference when it contains an external HTTP(S) URL or attachment. The bot records the source channel name, author display name, KST time, note, external URLs, and attachment filename/MIME/size. It omits signed Discord attachment links, OAuth/JWT/credential-bearing URLs, and Discord/Slack webhook secrets. It does not request a URL, follow redirects, download Discord attachments, run OCR, or inspect PDFs/images/archives. Reference text is never promotion evidence for `DECISIONS.md` or `TASKS.md`.

## GitHub authentication and publication safety

Choose one method:

- **Fine-grained token:** set `GITHUB_TOKEN`; scope it to `openbaeseongjin/baeseongjin` with **Contents: Read and write** only.
- **GitHub App:** grant **Metadata: Read** and **Contents: Read and write**, install it only on this repository, and set `GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, and a base64-encoded private key in `GITHUB_APP_PRIVATE_KEY_BASE64`.

The service writes one non-force Git commit to `GITHUB_BRANCH`. If branch protection requires pull requests, direct synchronization will be rejected safely while the Discord copy remains available. Use a maintainer-approved automation branch or explicitly permit this bot identity; do not weaken unrelated branch protections.

This repository is public and `docs/` is published by GitHub Pages. GitHub synchronization is therefore blocked unless `ALLOW_PUBLIC_GITHUB_MINUTES=true`. Set it only after every participant understands that the minutes will be public. Keeping the flag false still permits Discord publication.

## Local setup

From `services/meeting-bot`:

```powershell
Copy-Item .env.example .env
npm ci
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-local.txt
npm run check
npm run diagnose:voice
npm run register
npm run dev
```

Use Python 3.11–3.13 when creating the virtual environment. On macOS/Linux, use `.venv/bin/python` instead of `.venv\Scripts\python.exe`. Fill `.env` before the registration/start commands. `.env`, `.venv`, downloaded models, and runtime audio are ignored by Git; never copy secrets into `.env.example`.

`npm run register` creates guild-scoped commands, which normally update faster than global commands. Run it again only when the command schema changes.

Before enabling local model features, verify `ollama list`. For meeting classification set `MEETING_CLASSIFIER_ENABLED=true` and `MEETING_CLASSIFIER_MODEL=<installed-model>`. For the separate public planning gateway also set `CODEX_ENABLED=true`, `CODEX_PROVIDER=ollama`, and `CODEX_MODEL=<installed-model>`. Restart the service after environment changes. Command registration is unchanged, so `npm run register` is not required.

## Docker deployment

Build and run the service on an always-on host:

```powershell
docker build -t baeseongjin-meeting-bot .
docker run --restart unless-stopped --env-file .env baeseongjin-meeting-bot
```

The service has no inbound HTTP port. It needs outbound HTTPS/WebSocket access to Discord and GitHub, initial outbound HTTPS access to Hugging Face for the free model download, plus outbound/return UDP for Discord voice. Keep only one instance active for this guild unless distributed session coordination is added.

## Operational behavior and recovery

- Only one meeting can be active in this service instance.
- Any member of the configured guild may start or end that meeting, but only from `DISCORD_MEETING_CHANNEL_ID`; other guilds and channels remain rejected.
- A meeting is capped at 5,000 reconciled text messages and 500 voice segments; hitting either cap is recorded as a blocker instead of consuming resources without bound.
- Discord publication is capped at 20 messages with mentions disabled. All seven classified headings are rendered before the potentially large `REFERENCES` section; overflow ends with an explicit Discord-only truncation notice.
- At `/meeting end`, bounded history reads make the final Discord state authoritative: edited text is updated, deleted messages disappear, and reconnect-missed messages are recovered. A channel history failure retains live events and records a blocker.
- Continuous speech segments rotate at eight minutes to bound local processing and memory use.
- A process restart ends the in-memory meeting; it cannot resume a voice stream. Restart the meeting explicitly.
- GitHub writes retry once against a fresh branch head and never force-update history.
- If local Ollama classification fails, the fallback keeps discussion text and applies only explicit deterministic labels; raw provider errors are not published.
- If a voice segment cannot be transcribed, that segment is excluded from promotion and a blocker is recorded.
- Secret-shaped values are redacted from compact service errors. Raw API responses are not logged.
- Codex jobs survive as local status/result records, but an in-progress child process interrupted by a bot restart is not resumed automatically in V1.
- Codex result publication failure does not authorize a retry with broader permissions; use `/codex result` to inspect the persisted job.
- Attachment names/type/size are captured, but signed Discord attachment URLs and file contents are not copied into minutes.
- Audio is removed after processing by default. Set `RETAIN_AUDIO=true` only with a documented retention and access policy.

## DAVE and Discord voice constraints

Discord requires DAVE/E2EE support for voice connections as of March 1, 2026. This service pins `@discordjs/voice` 0.19.2, enables `daveEncryption`, and uses the package's bundled `@snazzah/davey` implementation. Version 0.19.2 includes the upstream DAVE receive fix merged in March 2026.

Discord does not document bot audio receive as a stable public feature, and the discord.js package likewise does not guarantee stable receive support. Validate the exact deployment OS, UDP path, server/channel permissions, and current package versions with a real consented test call before relying on voice minutes. Text capture and the rest of the pipeline remain independently usable.

Useful checks:

```powershell
npm run diagnose:voice
npm audit --omit=dev --audit-level=high
.\.venv\Scripts\python.exe -m pip check
npm run check
```

Relevant primary documentation:

- [Discord Voice and DAVE](https://docs.discord.com/developers/topics/voice-connections)
- [discord.js voice package](https://www.npmjs.com/package/%40discordjs/voice)
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
