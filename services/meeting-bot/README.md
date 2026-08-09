# Discord meeting minutes bot

This long-running Node.js service captures a meeting only between `/meeting start` and `/meeting end`. It does not schedule or start the team's 22:00–23:00 KST meeting automatically.

## Implemented scope

- Guild slash commands: `/meeting start` and `/meeting end`.
- Text capture from one configured Discord meeting channel.
- Optional voice capture from the command user's current voice channel.
- DAVE-enabled Discord voice connection and per-Discord-user audio segments.
- OpenAI transcription with `gpt-4o-transcribe-diarize` and exact Discord user attribution.
- Structured `DISCUSSED / DECIDED / REJECTED / HYPOTHESES / ACTION ITEMS / BLOCKERS / NEXT MEETING` minutes.
- A deterministic promotion gate: a model result cannot enter `DECISIONS.md`, `TASKS.md`, or `NEXT MEETING` unless its cited raw transcript entry exists and contains an explicit confirmation, assignment, or schedule marker.
- Discord minutes-channel publication and one atomic Git commit covering the dated minutes plus any eligible decision/task ledger updates.
- Local mock transcript tests. No live token or paid API call is required by the test suite.

GitHub Issue creation is intentionally not implemented.

## Data flow

1. `/meeting start` begins text capture. If the caller is in voice, the bot joins with DAVE enabled and announces that audio will be sent to OpenAI.
2. Discord voice packets are separated by Discord user ID, decoded from Opus, and written as short WAV speaking segments in `MEETING_DATA_DIR`.
3. `/meeting end` closes the streams and sends each segment to the OpenAI Transcription API. Discord's user identity remains the authoritative speaker label.
4. The transcript is summarized with strict JSON Schema output. A local gate re-checks the cited raw entries before anything is promoted as a decision, action, rejection, or next meeting.
5. Minutes are posted to the configured Discord channel and committed to GitHub. Audio is deleted after processing unless `RETAIN_AUDIO=true`.

## Prerequisites

- Node.js 22.12 or newer and npm.
- A Discord application installed in the target server.
- An OpenAI API project key with access to the configured transcription and summary models.
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

## OpenAI setup

Create a project-scoped key and set `OPENAI_API_KEY`. The default transcription model is `gpt-4o-transcribe-diarize`, which supports speaker-annotated transcription responses. The default summary model is configurable through `OPENAI_SUMMARY_MODEL`. API requests use `store: false` for the meeting-summary response, but the team's OpenAI data controls and retention policy still apply.

No API key is needed for `npm run check`; all tests are local.

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
npm run check
npm run diagnose:voice
npm run register
npm run dev
```

Fill `.env` before the registration/start commands. `.env` and runtime audio are ignored by Git; never copy secrets into `.env.example`.

`npm run register` creates guild-scoped commands, which normally update faster than global commands. Run it again only when the command schema changes.

## Docker deployment

Build and run the service on an always-on host:

```powershell
docker build -t baeseongjin-meeting-bot .
docker run --restart unless-stopped --env-file .env baeseongjin-meeting-bot
```

The service has no inbound HTTP port. It needs outbound HTTPS/WebSocket access to Discord, OpenAI, and GitHub, plus outbound/return UDP for Discord voice. Keep only one instance active for this guild unless distributed session coordination is added.

## Operational behavior and recovery

- Only one meeting can be active in this service instance.
- A meeting is capped at 5,000 text messages and 500 voice segments; hitting either cap is recorded as a blocker instead of consuming resources without bound.
- Continuous speech segments rotate at eight minutes to stay below typical transcription upload limits.
- A process restart ends the in-memory meeting; it cannot resume a voice stream. Restart the meeting explicitly.
- GitHub writes retry once against a fresh branch head and never force-update history.
- If model summarization fails, the fallback minute contains discussion text but promotes no decisions or action items.
- If a voice segment cannot be transcribed, that segment is excluded from promotion and a blocker is recorded.
- Secret-shaped values are redacted from compact service errors. Raw API responses are not logged.
- Attachment names are captured, but signed Discord attachment URLs and file contents are not copied into minutes.
- Audio is removed after processing by default. Set `RETAIN_AUDIO=true` only with a documented retention and access policy.

## DAVE and Discord voice constraints

Discord requires DAVE/E2EE support for voice connections as of March 1, 2026. This service pins `@discordjs/voice` 0.19.2, enables `daveEncryption`, and uses the package's bundled `@snazzah/davey` implementation. Version 0.19.2 includes the upstream DAVE receive fix merged in March 2026.

Discord does not document bot audio receive as a stable public feature, and the discord.js package likewise does not guarantee stable receive support. Validate the exact deployment OS, UDP path, server/channel permissions, and current package versions with a real consented test call before relying on voice minutes. Text capture and the rest of the pipeline remain independently usable.

Useful checks:

```powershell
npm run diagnose:voice
npm audit --omit=dev --audit-level=high
npm run check
```

Relevant primary documentation:

- [Discord Voice and DAVE](https://docs.discord.com/developers/topics/voice-connections)
- [discord.js voice package](https://www.npmjs.com/package/%40discordjs/voice)
- [OpenAI GPT-4o Transcribe Diarize](https://developers.openai.com/api/docs/models/gpt-4o-transcribe-diarize)
