# Discord meeting minutes bot

This long-running Node.js service captures a meeting only between `/meeting start` and `/meeting end`. It does not schedule or start the team's 22:00–23:00 KST meeting automatically.

## Implemented scope

- Guild slash commands: `/meeting start` and `/meeting end`.
- Text capture from one configured Discord meeting channel.
- Optional voice capture from the command user's current voice channel.
- DAVE-enabled Discord voice connection and per-Discord-user audio segments.
- Free local speech transcription with `faster-whisper`, CPU `int8`, and exact Discord user attribution.
- Structured `DISCUSSED / DECIDED / REJECTED / HYPOTHESES / ACTION ITEMS / BLOCKERS / NEXT MEETING` minutes.
- Deterministic local classification: only explicitly labelled statements can enter `DECISIONS.md`, `TASKS.md`, or `NEXT MEETING`.
- Discord minutes-channel publication and one atomic Git commit covering the dated minutes plus any eligible decision/task ledger updates.
- Local mock transcript tests. No AI API key or paid API call is used by the service or test suite.
- Opt-in `/codex plan`, `/codex status`, `/codex result`, and `/codex cancel` commands that run only allowlisted repository planning skills in the Codex CLI read-only sandbox.

GitHub Issue creation is intentionally not implemented.
Codex code modification, approval, worktree, push, pull request, and merge operations are intentionally not implemented in V1.

## Data flow

1. `/meeting start` begins text capture. If the caller is in voice, the bot joins with DAVE enabled and announces local recording and transcription.
2. Discord voice packets are separated by Discord user ID, decoded from Opus, and written as short WAV speaking segments in `MEETING_DATA_DIR`.
3. `/meeting end` closes the streams and runs each segment through `faster-whisper` on the bot host. Audio is not sent to an AI API. Discord's user identity remains the authoritative speaker label.
4. Deterministic rules classify explicitly labelled statements. Ambiguous conversation remains in `DISCUSSED` and is never promoted automatically.
5. Minutes are posted to the configured Discord channel and committed to GitHub. Audio is deleted after processing unless `RETAIN_AUDIO=true`.

## Read-only Discord to Codex gateway

The gateway is disabled by default. When `CODEX_ENABLED=true`, a meeting operator can run:

```text
/codex plan skill:meeting-to-game-plan source:last-meeting instruction:다음 개발 순서를 정리해줘
/codex plan skill:repo-task-plan source:recent-messages instruction:이 기능의 구현 범위를 계획해줘
/codex status job:CX-YYYYMMDD-ABC123
/codex result job:CX-YYYYMMDD-ABC123
/codex cancel job:CX-YYYYMMDD-ABC123
```

Only `meeting-to-game-plan` and `repo-task-plan` are accepted. Discord content is delimited as untrusted data, bounded by message and character limits, and never interpreted as shell or permission instructions. Jobs are persisted under `.data/codex/jobs`, processed one at a time, and posted to the configured minutes channel with mentions disabled.

The runner invokes the locally installed `codex exec` with `--ephemeral`, `--ignore-user-config`, `-s read-only`, and a strict JSON output schema. It passes a small operating-system environment allowlist and removes Discord, GitHub, OpenAI, and GitHub App secrets from the child process. It does not use `OPENAI_API_KEY`, but the authenticated Codex CLI provider may consume account quota. Keep `CODEX_ENABLED=false` if that is not acceptable.

V1 cannot edit the repository, install software, invoke `$github-task-flow`, publish a PR, or merge code. A completed plan is advisory and needs a separate human-approved implementation flow.

## Prerequisites

- Node.js 22.12 or newer and npm.
- Python 3.11–3.13 for local transcription.
- A Discord application installed in the target server.
- A fine-grained GitHub token or GitHub App installation authorized only for this repository.
- Participant consent and a team retention policy appropriate for voice recording, transcription, and public or private publication.

## Discord Developer Portal setup

1. Create an application and bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. On the **Bot** page, enable the privileged **Message Content Intent**. Guild and voice-state events are requested by the service but do not require an additional privileged-intent toggle.
3. Reset/copy the bot token once and store it only in the deployment environment as `DISCORD_BOT_TOKEN`.
4. Copy the application ID into `DISCORD_CLIENT_ID` and the server ID into `DISCORD_GUILD_ID`.
5. With Discord Developer Mode enabled, copy the meeting text/channel-chat ID into `DISCORD_MEETING_CHANNEL_ID` and the `#회의록` channel ID into `DISCORD_MINUTES_CHANNEL_ID`.
6. Create a meeting-operator role and copy it into `DISCORD_OPERATOR_ROLE_ID`, or leave it empty to require Discord's **Manage Server** permission.
7. In **OAuth2 > URL Generator**, select `bot` and `applications.commands`. Grant only:
    - View Channels
    - Send Messages
    - Read Message History
    - Connect
8. Install the bot in the server. Grant the same permissions through channel overrides for the meeting, voice, and minutes channels.

The start command uses the caller's current voice channel. If the caller is not in voice, the meeting is text-only. If the caller is in voice and the DAVE connection fails, the service refuses to start instead of silently dropping audio.

## Free local transcription and classification

No OpenAI key is required. Voice transcription uses `faster-whisper` with the multilingual `tiny` model on CPU. The first voice transcription downloads the free model into `LOCAL_MODEL_CACHE_DIR`; subsequent meetings reuse that local cache. This has no per-use API fee, but it uses the host's CPU, memory, disk, and initial download bandwidth.

For safe deterministic promotion, use these exact text forms in the meeting channel:

```text
결정: 2D 횡스크롤로 확정
기각: AI 추리게임 방향은 제외
아이디어: 자동 성장 시스템
할 일: 용호 | 로프 프로토타입 구현 | 내일
막힘: 로프 충돌 판정 불안정
다음 회의: 내일 오후 10시
```

Ordinary text and unlabelled voice transcript remain in `DISCUSSED`. Voice recognition may omit punctuation, so text labels are the reliable way to update `DECISIONS.md` and `TASKS.md` without a language-model API.

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

Before enabling the Codex gateway, also verify `codex --version` and run one local read-only fixture or low-risk plan. Set `CODEX_ENABLED=true`, rerun `npm run register`, and restart the service only after accepting the active Codex provider's quota or cost model.

## Docker deployment

Build and run the service on an always-on host:

```powershell
docker build -t baeseongjin-meeting-bot .
docker run --restart unless-stopped --env-file .env baeseongjin-meeting-bot
```

The service has no inbound HTTP port. It needs outbound HTTPS/WebSocket access to Discord and GitHub, initial outbound HTTPS access to Hugging Face for the free model download, plus outbound/return UDP for Discord voice. Keep only one instance active for this guild unless distributed session coordination is added.

## Operational behavior and recovery

- Only one meeting can be active in this service instance.
- A meeting is capped at 5,000 text messages and 500 voice segments; hitting either cap is recorded as a blocker instead of consuming resources without bound.
- Continuous speech segments rotate at eight minutes to bound local processing and memory use.
- A process restart ends the in-memory meeting; it cannot resume a voice stream. Restart the meeting explicitly.
- GitHub writes retry once against a fresh branch head and never force-update history.
- If local classification fails, the fallback minute contains discussion text but promotes no decisions or action items.
- If a voice segment cannot be transcribed, that segment is excluded from promotion and a blocker is recorded.
- Secret-shaped values are redacted from compact service errors. Raw API responses are not logged.
- Codex jobs survive as local status/result records, but an in-progress child process interrupted by a bot restart is not resumed automatically in V1.
- Codex result publication failure does not authorize a retry with broader permissions; use `/codex result` to inspect the persisted job.
- Attachment names are captured, but signed Discord attachment URLs and file contents are not copied into minutes.
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
