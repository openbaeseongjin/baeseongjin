# GitHub full meeting content design

Date: 2026-08-12
Status: Approved
Component: `services/meeting-bot`

## Problem

`/meeting end` currently produces classified minutes (SUMMARY / DISCUSSED / DECIDED /
REJECTED / HYPOTHESES / ACTION ITEMS / BLOCKERS / NEXT MEETING / REFERENCES) and tries
to publish them to two places:

1. Discord (`DiscordPublisher`), capped at 20 messages / ~1,900 characters per chunk,
   with a truncation notice when the minutes don't fit.
2. GitHub (`GitHubStore`), writing an untruncated `docs/meetings/<date>.md` plus
   `DECISIONS.md` / `TASKS.md` updates, in one atomic commit.

The GitHub path already solves the Discord character-limit problem for the classified
minutes, but it is gated behind `ALLOW_PUBLIC_GITHUB_MINUTES` because
`openbaeseongjin/baeseongjin` is a public repository whose `docs/` folder is served by
GitHub Pages. That flag has never been turned on, so `docs/meetings/` in the repo
contains only its README — every meeting so far has only ever reached Discord, where
long meetings get truncated. This is why the user saw "the bot didn't write the meeting
content."

Separately, even once GitHub sync is turned on, it only ever persists the *classified*
minutes. The raw per-speaker transcript (`TranscriptEntry[]`, produced by
`LocalMeetingService.transcribe`) is computed during `/meeting end` and then discarded
after being used to build the minutes — it is not stored anywhere. The user wants the
full verbatim conversation (who said what, in order) preserved as well, not just the
classified summary.

## Goals

- Turn on the existing GitHub minutes pipeline (config-only; see "Out of scope").
- Add a new artifact — the full raw transcript — to the same atomic GitHub commit that
  already writes the daily minutes file, so both the classified minutes and the
  verbatim conversation are always fully available on GitHub regardless of what Discord
  could fit.
- Keep Discord behavior unchanged: it still only ever receives the classified minutes,
  truncated if necessary, with a pointer to the GitHub documents for the rest.

## Non-goals

- No change to how minutes are classified/promoted (`promotion-gate.ts`,
  `ollama-meeting-classifier.ts`).
- No change to Discord publishing behavior or its character/message caps.
- Not building a second, parallel storage system — this extends the existing
  `GitHubStore` / `buildDocumentUpdates` pipeline.

## Out of scope (user-performed, not code)

- Setting `ALLOW_PUBLIC_GITHUB_MINUTES=true` in `.env` and confirming `GITHUB_TOKEN` (or
  the `GITHUB_APP_*` trio) is populated. `.env` is treated as a secret file and is not
  edited by the assistant. The user has confirmed the team approves public posting of
  meeting minutes (including the verbatim transcript) via GitHub Pages.

## Design

### New artifact: per-day transcript document

`docs/meetings/transcripts/<date>.md` (KST date, same `kstDate()` helper already used
for the daily minutes path), mirroring the existing daily-minutes file convention:

- One file per day; multiple meetings on the same day append additional sections to the
  same file.
- Each meeting's section is preceded by the same `<!-- meeting-id:<id> -->` HTML comment
  marker already used in `docs/meetings/<date>.md` / `DECISIONS.md` / `TASKS.md`, so a
  retried sync against a file that already has the marker is a no-op (idempotent, same
  pattern as `buildDocumentUpdates` today).
- If a meeting captured zero transcript entries, no transcript file/section is written
  for it (mirrors the existing "only write DECISIONS.md/TASKS.md when there is real
  content" rule).

### Transcript section format

New function in `markdown.ts`:

```ts
export function renderTranscriptSection(metadata: MeetingMetadata, entries: TranscriptEntry[]): string
```

Renders (entries are already time-sorted by `LocalMeetingService.transcribe`):

```
<!-- meeting-id:20260812-220000 -->
## Meeting 22:00–23:00 KST

- 22:00:03 KST — 성진 (text, #회의): 오늘 시작할까요
- 22:00:41 KST — 용호 (voice): 네 시작합시다
```

Formatting rules:

- Timestamp via the existing `kstTime()` helper, `source` shown as `text` or `voice`,
  channel name shown only for `text` entries (`channelName` is undefined for voice
  entries per `TranscriptEntry`).
- Text is escaped with the existing `markdownText()` escaping (backslash-escaping
  markdown control characters, stripping control chars, collapsing whitespace) but
  called with an effectively unbounded `maxLength` (pass `Number.MAX_SAFE_INTEGER`
  rather than reusing a capped default) — this is the one place in the codebase where
  we deliberately do *not* truncate, since the whole point is the untruncated record.
  Speaker display names still use the default bounded call (consistent with how they're
  rendered elsewhere).
- No bullet-list empty-state ("- None recorded") applies here: this function is simply
  not called (see "zero entries" rule above).

### `github-documents.ts`

`buildDocumentUpdates(metadata, minutes, existing)` gains a `transcript: TranscriptEntry[]`
parameter and, when non-empty, computes a 4th potential `DocumentUpdate` for
`docs/meetings/transcripts/<date>.md`, using the same `appendSection` +
marker-dedup logic already used for the daily minutes file: if `existing[path]` is
missing/empty it seeds `# Meeting Transcript — <date>\n` (mirrors the
`# Meeting Minutes — <date>\n` default already used for the daily minutes file), then
appends `renderTranscriptSection(...)`. Order of the returned array becomes: daily
minutes, transcript, DECISIONS.md, TASKS.md (transcript placed next to the minutes file
it accompanies; DECISIONS/TASKS unaffected).

### `github-store.ts`

`syncMeeting(metadata, minutes, transcript)` gains the `transcript` parameter and
threads it through to `buildDocumentUpdates`. `createAtomicCommit`'s fixed `paths` array
(currently `[docs/meetings/<date>.md, DECISIONS.md, TASKS.md]`) gains
`docs/meetings/transcripts/<date>.md` so its existing content is read at the same HEAD
and included in the same tree/commit — this stays a single atomic commit, not two.

### `meeting-manager.ts`

In `end()`, `transcription.entries` (currently only fed into
`this.localProcessing.summarize(...)` and then dropped) is kept in a local variable and
passed as the third argument to `this.github.syncMeeting(metadata, minutes,
transcription.entries)`.

### Discord path

Unchanged. `DiscordPublisher` continues to receive only the rendered classified-minutes
markdown. No transcript content is ever sent to Discord.

### `docs/meetings/README.md`

One paragraph added noting that `transcripts/<date>.md` holds the unedited, per-speaker
conversation record captured between `/meeting start` and `/meeting end`, and that
because the repository is public this is subject to the same
`ALLOW_PUBLIC_GITHUB_MINUTES` gate and team-approval expectation as the minutes files.

## Data flow (end-to-end)

1. `/meeting end` stops capture, reconciles Discord history, transcribes voice.
2. `LocalMeetingService.transcribe(...)` returns `{ entries, failures }`; `entries` is
   now retained (previously dropped after this point).
3. `LocalMeetingService.summarize(entries)` builds `minutes` as today.
4. `renderDailyDocument(metadata, minutes)` → Discord markdown (unchanged).
5. `Promise.allSettled([publisher.publish(markdown), github.syncMeeting(metadata, minutes, entries)])`.
6. `github.syncMeeting` reads `docs/meetings/<date>.md`,
   `docs/meetings/transcripts/<date>.md`, `DECISIONS.md`, `TASKS.md` at the branch HEAD,
   builds the update set via `buildDocumentUpdates`, and — if non-empty — writes one
   commit covering whichever of those files actually changed.
7. The ephemeral `/meeting end` reply's `GitHub: <paths> (<sha>)` line will include the
   transcript path whenever one was written.

## Error handling

No new failure modes are introduced:

- GitHub auth/permission/public-repo-block failures are caught exactly as today (the
  existing `Promise.allSettled` isolation + one retry against a fresh branch head in
  `GitHubStore.syncMeeting`); Discord publication succeeds/fails independently, per
  existing behavior in `resultStatus` / `githubResultStatus`.
- `renderTranscriptSection` is a pure, synchronous string-building function with no I/O,
  so it cannot fail independently of the rest of the (already-synchronous) minutes
  rendering step.
- Reusing the existing marker-based idempotency means a retried commit (e.g. after the
  one built-in retry) cannot double-append a meeting's transcript section.

## Testing

- `test/markdown.test.ts`: add cases for `renderTranscriptSection` — correct KST
  timestamp/speaker/channel formatting, markdown-control-character escaping, and that a
  very long transcript entry is rendered in full (not truncated at the 240/1000-char
  limits used elsewhere in the file).
- `test/github-documents.test.ts`: add cases — transcript file created only when
  `transcript` is non-empty; omitted entirely for an empty transcript; idempotent given
  an existing meeting-id marker; multiple entries preserve chronological order.
- `test/meeting-manager.test.ts`: update the fake `GitHubStore` test double's
  `syncMeeting` signature/assertions to verify it is invoked with the same
  `transcription.entries` that were used to build `minutes`.
- `test/discord-publisher.test.ts`: no behavioral change expected; existing tests should
  pass unmodified (regression check only).

## Rollout

1. Ship the code change (transcript persisted whenever GitHub sync runs).
2. User sets `ALLOW_PUBLIC_GITHUB_MINUTES=true` and confirms GitHub credentials in
   `.env` (out of scope for this change, performed by the user directly).
3. Next `/meeting end` after both are true produces, in one commit:
   `docs/meetings/<date>.md`, `docs/meetings/transcripts/<date>.md`, and (when
   applicable) `DECISIONS.md` / `TASKS.md` updates.
