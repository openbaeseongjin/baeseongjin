# GitHub Full Meeting Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the full raw per-speaker transcript to GitHub (`docs/meetings/transcripts/<date>.md`) in the same atomic commit that already writes the classified minutes, so `/meeting end` always leaves the complete meeting content (both the classified minutes and the verbatim conversation) on GitHub — never truncated the way Discord's message limit truncates it.

**Architecture:** Extend the existing atomic-commit pipeline (`GitHubStore` + `buildDocumentUpdates`) rather than building a new system. `MeetingManager.end()` already computes `transcription.entries` (`TranscriptEntry[]`) before building the classified `minutes`; today those entries are discarded right after. This plan threads them through one extra parameter at each layer (`meeting-manager.ts` → `github-store.ts` → `github-documents.ts`) down to a new `renderTranscriptSection` renderer in `markdown.ts`. Discord publishing is untouched.

**Tech Stack:** TypeScript (Node 22), Vitest for tests, existing `kstDate`/`kstTime` helpers (`src/time.ts`) and `markdownText` escaping (`src/markdown.ts`).

## Global Constraints

- Reuse existing helpers — do not invent a new time formatter; `kstTime()` returns `HH:MM` (no seconds) and that is what every rendered timestamp in this codebase uses (see `docs/meetings/*.md` REFERENCES section, `test/markdown.test.ts:132`). Do not add seconds precision.
- All rendered free text (speaker names, message text, channel names) MUST go through `markdownText()` — this is the codebase's only sanctioned escaping path (prevents Markdown injection / XSS-in-docs). Never interpolate raw strings into rendered output.
- The transcript document is the one place in the codebase that intentionally does NOT truncate text (call `markdownText(text, Number.MAX_SAFE_INTEGER)`); every other call site keeps its existing bounded length.
- Preserve the existing `<!-- meeting-id:<id> -->` marker + `appendSection` idempotency pattern already used for `docs/meetings/<date>.md`, `DECISIONS.md`, `TASKS.md`. The new transcript file follows the identical pattern — do not invent a different dedup mechanism.
- A meeting with zero transcript entries must not produce a transcript file/section at all (mirrors the existing "only write DECISIONS.md/TASKS.md when there is real content" rule already in `buildDocumentUpdates`).
- Discord publishing (`discord-publisher.ts`) is out of scope — no changes.
- `.env` / secrets are out of scope — the user configures `ALLOW_PUBLIC_GITHUB_MINUTES` and GitHub credentials themselves.
- Run `npm run check` (from `services/meeting-bot`) before each commit — it runs the project's lint/typecheck. Run `npx vitest run` for the full test suite before each commit.

---

### Task 1: Render the transcript section (`markdown.ts`)

**Files:**
- Modify: `services/meeting-bot/src/markdown.ts`
- Test: `services/meeting-bot/test/markdown.test.ts`

**Interfaces:**
- Consumes: `TranscriptEntry` (from `src/types.ts`, already defined — `{ id, source: "text"|"voice", timestamp, speakerId, speaker, text, channelId?, channelName? }`), `MeetingMetadata`, existing `markdownText()`, `kstTime()`.
- Produces: `export function renderTranscriptSection(metadata: MeetingMetadata, entries: TranscriptEntry[]): string` — Task 2 calls this. Entries are assumed already sorted by timestamp (they arrive pre-sorted from `LocalMeetingService.transcribe`, see `src/local-meeting-service.ts:161`); this function does not sort.

- [ ] **Step 1: Write the failing tests**

Add to `services/meeting-bot/test/markdown.test.ts` (add `renderTranscriptSection` and `TranscriptEntry` to the existing top import lines, and add a new `describe` block at the end of the file, before the final closing of the file):

```ts
import { markdownText, renderDailyDocument, renderTranscriptSection, splitMarkdown } from "../src/markdown.js";
import type { MeetingMetadata, Minutes, TranscriptEntry } from "../src/types.js";
```

```ts
describe("transcript markdown", () => {
  const metadata: MeetingMetadata = {
    id: "20260812-220000",
    guildId: "123",
    startedAt: "2026-08-12T13:00:00.000Z",
    endedAt: "2026-08-12T14:00:00.000Z",
    startedBy: "진행자",
    voiceChannelName: "회의",
  };

  it("renders each entry with KST time, speaker, source, and channel", () => {
    const entries: TranscriptEntry[] = [
      {
        id: "text:1",
        source: "text",
        timestamp: "2026-08-12T13:00:03.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "c1",
        channelName: "회의",
        text: "오늘 시작할까요",
      },
      {
        id: "voice:1",
        source: "voice",
        timestamp: "2026-08-12T13:01:00.000Z",
        speakerId: "u2",
        speaker: "용호",
        text: "네 시작합시다",
      },
    ];

    const markdown = renderTranscriptSection(metadata, entries);

    expect(markdown).toContain("<!-- meeting-id:20260812-220000 -->");
    expect(markdown).toContain("- 22:00 KST — 성진 (text, #회의): 오늘 시작할까요");
    expect(markdown).toContain("- 22:01 KST — 용호 (voice): 네 시작합시다");
    expect(markdown.indexOf("성진")).toBeLessThan(markdown.indexOf("용호"));
  });

  it("does not truncate a very long transcript entry", () => {
    const longText = "가".repeat(5_000);
    const entries: TranscriptEntry[] = [
      {
        id: "text:1",
        source: "text",
        timestamp: "2026-08-12T13:00:00.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "c1",
        channelName: "회의",
        text: longText,
      },
    ];

    const markdown = renderTranscriptSection(metadata, entries);

    expect(markdown).toContain(longText);
  });

  it("escapes markdown control characters in transcript text", () => {
    const entries: TranscriptEntry[] = [
      {
        id: "text:1",
        source: "text",
        timestamp: "2026-08-12T13:00:00.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "c1",
        channelName: "회의",
        text: "[링크](https://attacker.example) **강조**",
      },
    ];

    const markdown = renderTranscriptSection(metadata, entries);

    expect(markdown).toContain(
      "\\[링크\\]\\(https://attacker.example\\) \\*\\*강조\\*\\*",
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run (from `services/meeting-bot`): `npx vitest run test/markdown.test.ts`
Expected: FAIL — `renderTranscriptSection` is not exported from `../src/markdown.js`.

- [ ] **Step 3: Implement `renderTranscriptSection`**

In `services/meeting-bot/src/markdown.ts`, change the top import to include `TranscriptEntry`:

```ts
import type { MeetingMetadata, Minutes, TranscriptEntry } from "./types.js";
```

Add this function after `renderMeetingSection` and before `renderDailyDocument`:

```ts
export function renderTranscriptSection(metadata: MeetingMetadata, entries: TranscriptEntry[]): string {
  const startedAt = new Date(metadata.startedAt);
  const endedAt = new Date(metadata.endedAt);
  const lines = entries.map((entry) => {
    const time = kstTime(new Date(entry.timestamp));
    const channel =
      entry.source === "text" && entry.channelName ? `, #${markdownText(entry.channelName)}` : "";
    const speaker = markdownText(entry.speaker);
    const text = markdownText(entry.text, Number.MAX_SAFE_INTEGER);
    return `- ${time} KST — ${speaker} (${entry.source}${channel}): ${text}`;
  });

  return [
    `<!-- meeting-id:${metadata.id} -->`,
    `## Meeting ${kstTime(startedAt)}–${kstTime(endedAt)} KST`,
    "",
    ...lines,
  ].join("\n");
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run test/markdown.test.ts`
Expected: PASS (all tests in the file, including the pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add services/meeting-bot/src/markdown.ts services/meeting-bot/test/markdown.test.ts
git commit -m "feat(meeting-bot): render full meeting transcript markdown"
```

---

### Task 2: Build transcript document updates (`github-documents.ts`)

**Files:**
- Modify: `services/meeting-bot/src/github-documents.ts`
- Test: `services/meeting-bot/test/github-documents.test.ts`

**Interfaces:**
- Consumes: `renderTranscriptSection` (Task 1), existing `appendSection`, `kstDate`.
- Produces: `buildDocumentUpdates(metadata: MeetingMetadata, minutes: Minutes, transcript: TranscriptEntry[], existing: Record<string, string>): DocumentUpdate[]` — signature gains the `transcript` parameter as the 3rd argument (before `existing`). Task 3 (`github-store.ts`) calls this with the new signature.

- [ ] **Step 1: Write the failing tests**

In `services/meeting-bot/test/github-documents.test.ts`, update the top import to add `TranscriptEntry`:

```ts
import type { MeetingMetadata, Minutes, TranscriptEntry } from "../src/types.js";
```

Update the three existing `buildDocumentUpdates(...)` calls to pass an empty transcript as the new 3rd argument:

1. `const updates = buildDocumentUpdates(metadata, minutes, {});` → `const updates = buildDocumentUpdates(metadata, minutes, [], {});`
2. `expect(buildDocumentUpdates(metadata, minutes, existing)).toEqual([]);` → `expect(buildDocumentUpdates(metadata, minutes, [], existing)).toEqual([]);`
3. The multi-line call in the third test:

```ts
    const updates = buildDocumentUpdates(
      metadata,
      {
        ...minutes,
        summary: ["가설: 수집 생물 후보", "결정: 없음", "할 일: 없음"],
        decided: [],
        actionItems: [],
      },
      {},
    );
```

becomes:

```ts
    const updates = buildDocumentUpdates(
      metadata,
      {
        ...minutes,
        summary: ["가설: 수집 생물 후보", "결정: 없음", "할 일: 없음"],
        decided: [],
        actionItems: [],
      },
      [],
      {},
    );
```

Then add these new test cases inside the existing `describe("GitHub document updates", ...)` block:

```ts
  it("creates a transcripts file when the transcript is non-empty", () => {
    const transcript: TranscriptEntry[] = [
      {
        id: "text:1",
        source: "text",
        timestamp: "2026-08-09T13:00:03.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "c1",
        channelName: "회의",
        text: "오늘 시작할까요",
      },
    ];

    const updates = buildDocumentUpdates(metadata, minutes, transcript, {});

    expect(updates.map((update) => update.path)).toEqual([
      "docs/meetings/2026-08-09.md",
      "docs/meetings/transcripts/2026-08-09.md",
      "DECISIONS.md",
      "TASKS.md",
    ]);
    expect(
      updates.find((update) => update.path === "docs/meetings/transcripts/2026-08-09.md")
        ?.content,
    ).toContain("성진");
  });

  it("omits the transcript file entirely when the transcript is empty", () => {
    const updates = buildDocumentUpdates(metadata, minutes, [], {});

    expect(updates.map((update) => update.path)).not.toContain(
      "docs/meetings/transcripts/2026-08-09.md",
    );
  });

  it("does not duplicate a transcript section for an existing meeting marker", () => {
    const marker = "<!-- meeting-id:20260809-220000 -->";
    const transcript: TranscriptEntry[] = [
      {
        id: "text:1",
        source: "text",
        timestamp: "2026-08-09T13:00:03.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "c1",
        channelName: "회의",
        text: "오늘 시작할까요",
      },
    ];
    const existing = {
      "docs/meetings/2026-08-09.md": `# Meeting Minutes\n\n${marker}\n`,
      "docs/meetings/transcripts/2026-08-09.md": `# Meeting Transcript\n\n${marker}\n`,
      "DECISIONS.md": `# Decisions\n\n${marker}\n`,
      "TASKS.md": `# Tasks\n\n${marker}\n`,
    };

    expect(buildDocumentUpdates(metadata, minutes, transcript, existing)).toEqual([]);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run (from `services/meeting-bot`): `npx vitest run test/github-documents.test.ts`
Expected: FAIL — too many/wrong-typed arguments to `buildDocumentUpdates` (TypeScript error) and the new tests fail since the transcript path is never produced.

- [ ] **Step 3: Implement the transcript branch**

In `services/meeting-bot/src/github-documents.ts`, update the import and function signature:

```ts
import type { MeetingMetadata, Minutes, TranscriptEntry } from "./types.js";
import { markdownText, renderMeetingSection, renderTranscriptSection } from "./markdown.js";
import { kstDate } from "./time.js";
```

```ts
export function buildDocumentUpdates(
  metadata: MeetingMetadata,
  minutes: Minutes,
  transcript: TranscriptEntry[],
  existing: Record<string, string>,
): DocumentUpdate[] {
  const date = kstDate(new Date(metadata.startedAt));
  const marker = `<!-- meeting-id:${metadata.id} -->`;
  const dailyPath = `docs/meetings/${date}.md`;
  const dailyExisting = existing[dailyPath] || `# Meeting Minutes — ${date}\n`;
  const updates: DocumentUpdate[] = [];

  if (!dailyExisting.includes(marker)) {
    updates.push({
      path: dailyPath,
      content: appendSection(dailyExisting, renderMeetingSection(metadata, minutes)),
    });
  }

  if (transcript.length > 0) {
    const transcriptPath = `docs/meetings/transcripts/${date}.md`;
    const transcriptExisting = existing[transcriptPath] || `# Meeting Transcript — ${date}\n`;
    if (!transcriptExisting.includes(marker)) {
      updates.push({
        path: transcriptPath,
        content: appendSection(transcriptExisting, renderTranscriptSection(metadata, transcript)),
      });
    }
  }

  if (minutes.decided.length > 0) {
    // ...unchanged...
```

(Leave the rest of the function — the `DECISIONS.md` and `TASKS.md` blocks and the final `return updates;` — exactly as-is.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run test/github-documents.test.ts`
Expected: PASS (all tests, including pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add services/meeting-bot/src/github-documents.ts services/meeting-bot/test/github-documents.test.ts
git commit -m "feat(meeting-bot): include transcript document in GitHub minutes updates"
```

---

### Task 3: Thread the transcript through the atomic GitHub commit (`github-store.ts`)

**Files:**
- Modify: `services/meeting-bot/src/github-store.ts`

**Interfaces:**
- Consumes: `buildDocumentUpdates` with the new 4-argument signature (Task 2).
- Produces: `GitHubStore.syncMeeting(metadata: MeetingMetadata, minutes: Minutes, transcript: TranscriptEntry[]): Promise<GitHubSyncResult>` — Task 4 (`meeting-manager.ts`) calls this with the new signature.

There is no existing dedicated test file for `github-store.ts` (it isn't in `services/meeting-bot/test/`, presumably because exercising it requires mocking the Octokit REST client). This task is a mechanical signature/array change with no new branching logic — the actual document-building logic it delegates to is already covered by Task 2's tests, and the threading from `MeetingManager` is covered by Task 4's test. Verify this task with `npm run check` (typecheck) plus the full test suite rather than a new unit test, consistent with the file's existing (untested) status.

- [ ] **Step 1: Update `syncMeeting` and `createAtomicCommit` signatures**

In `services/meeting-bot/src/github-store.ts`, update the import:

```ts
import type { MeetingMetadata, Minutes, TranscriptEntry } from "./types.js";
```

Update `syncMeeting`:

```ts
  async syncMeeting(
    metadata: MeetingMetadata,
    minutes: Minutes,
    transcript: TranscriptEntry[],
  ): Promise<GitHubSyncResult> {
    await this.assertPublicationAllowed();

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.createAtomicCommit(metadata, minutes, transcript);
      } catch (error: unknown) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }
```

Update `createAtomicCommit`'s signature and its `paths` array:

```ts
  private async createAtomicCommit(
    metadata: MeetingMetadata,
    minutes: Minutes,
    transcript: TranscriptEntry[],
  ): Promise<GitHubSyncResult> {
    const reference = await this.octokit.rest.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
    });
    const headSha = reference.data.object.sha;
    const commit = await this.octokit.rest.git.getCommit({
      owner: this.owner,
      repo: this.repo,
      commit_sha: headSha,
    });

    const date = kstDate(new Date(metadata.startedAt));
    const paths = [
      `docs/meetings/${date}.md`,
      `docs/meetings/transcripts/${date}.md`,
      "DECISIONS.md",
      "TASKS.md",
    ];
    const existing = Object.fromEntries(
      await Promise.all(paths.map(async (path) => [path, await this.readFile(path, headSha)] as const)),
    );
    const updates = buildDocumentUpdates(metadata, minutes, transcript, existing);
```

(The remainder of `createAtomicCommit` — tree creation, commit creation, ref update, return value — is unchanged.)

- [ ] **Step 2: Typecheck and run the full test suite**

Run (from `services/meeting-bot`): `npm run check && npx vitest run`
Expected: `npm run check` passes with no type errors (this confirms every caller of `syncMeeting`/`createAtomicCommit`/`buildDocumentUpdates` has been updated consistently). The full test suite will still show `meeting-manager.test.ts` failures at this point if Task 4 hasn't been done yet — that's expected; re-run after Task 4.

- [ ] **Step 3: Commit**

```bash
git add services/meeting-bot/src/github-store.ts
git commit -m "feat(meeting-bot): thread meeting transcript into the atomic GitHub commit"
```

---

### Task 4: Pass the transcript from the meeting manager, and document the new file

**Files:**
- Modify: `services/meeting-bot/src/meeting-manager.ts:547-551`
- Modify: `work/baeseongjin/docs/meetings/README.md` (repo root `docs/`, the public GitHub Pages folder — this is intentionally different from the `services/meeting-bot/docs/` used for specs/plans)
- Test: `services/meeting-bot/test/meeting-manager.test.ts`

**Interfaces:**
- Consumes: `GitHubStore.syncMeeting` with the new 3-argument signature (Task 3).
- Produces: nothing new consumed by later tasks — this is the last task.

- [ ] **Step 1: Write the failing test**

Add this test to the `describe("MeetingManager", ...)` block in `services/meeting-bot/test/meeting-manager.test.ts` (place it after the "claims the end boundary..." test, before the closing `});` of the describe block):

```ts
  it("passes the raw transcript entries through to the GitHub sync", async () => {
    const minutesSend = vi.fn(async () => undefined);
    const client = {
      channels: {
        fetch: vi.fn(async (channelId: string) =>
          channelId === "12345678901234570"
            ? { isTextBased: (): boolean => true, send: minutesSend }
            : {
                isTextBased: (): boolean => true,
                messages: { fetch: vi.fn(async () => new Map()) },
              },
        ),
      },
    };
    const github = {
      syncMeeting: vi.fn(async () => ({ paths: [], commitSha: "1234567" })),
    };
    const manager = new MeetingManager(client as never, config(), github as never, {
      ensureReady: vi.fn(async () => ({ state: "skipped" as const })),
    });
    const transcriptEntries = [
      {
        id: "text:1",
        source: "text" as const,
        timestamp: "2026-08-12T13:00:00.000Z",
        speakerId: "u1",
        speaker: "성진",
        channelId: "12345678901234569",
        channelName: "회의",
        text: "오늘 시작할까요",
      },
    ];
    const localProcessing = {
      transcribe: vi.fn(async (_messages: unknown[]) => ({ entries: transcriptEntries, failures: [] })),
      summarize: vi.fn(
        async (): Promise<Minutes> => ({
          summary: ["논의: 없음", "결정: 없음", "할 일: 없음"],
          discussed: [],
          decided: [],
          rejected: [],
          hypotheses: [],
          references: [],
          actionItems: [],
          blockers: [],
          nextMeeting: null,
        }),
      ),
    };
    (manager as unknown as { localProcessing: typeof localProcessing }).localProcessing = localProcessing;
    const guild = {
      members: {
        fetch: vi.fn(async () => ({
          displayName: "Regular Member",
          voice: { channel: null },
        })),
      },
      channels: {
        cache: new Map(),
        fetch: vi.fn(async () => permissionChannel()),
      },
    };
    const baseInteraction = {
      commandName: "meeting",
      guildId: "12345678901234568",
      channelId: "12345678901234569",
      inGuild: () => true,
      guild,
      user: { id: "12345678901234571" },
      reply: vi.fn(async () => undefined),
      editReply: vi.fn(async () => undefined),
    };

    await manager.handleCommand({
      ...baseInteraction,
      options: { getSubcommand: () => "start" },
      deferReply: vi.fn(async () => undefined),
    } as never);
    await manager.handleCommand({
      ...baseInteraction,
      createdAt: new Date(),
      options: { getSubcommand: () => "end" },
      deferReply: vi.fn(async () => undefined),
    } as never);

    expect(github.syncMeeting.mock.calls[0]?.[2]).toEqual(transcriptEntries);
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run (from `services/meeting-bot`): `npx vitest run test/meeting-manager.test.ts`
Expected: FAIL — `github.syncMeeting.mock.calls[0]?.[2]` is `undefined` (only 2 arguments are currently passed).

- [ ] **Step 3: Pass the transcript entries through**

In `services/meeting-bot/src/meeting-manager.ts`, locate this block (currently around line 547-551):

```ts
      const markdown = renderDailyDocument(metadata, minutes);
      const results = await Promise.allSettled([
        this.publisher.publish(markdown),
        this.github.syncMeeting(metadata, minutes),
      ]);
```

Change the `syncMeeting` call to include the transcript entries:

```ts
      const markdown = renderDailyDocument(metadata, minutes);
      const results = await Promise.allSettled([
        this.publisher.publish(markdown),
        this.github.syncMeeting(metadata, minutes, transcription.entries),
      ]);
```

(`transcription` is already in scope — it's assigned earlier in `end()` via `const transcription = await this.localProcessing.transcribe(meeting.messages, voiceSegments);`. No other change is needed in this file.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run test/meeting-manager.test.ts`
Expected: PASS (all tests in the file, including pre-existing ones).

- [ ] **Step 5: Run the full test suite and typecheck**

Run (from `services/meeting-bot`): `npm run check && npx vitest run`
Expected: everything passes — this is the point where Task 3's "re-run after Task 4" note resolves.

- [ ] **Step 6: Document the new transcript file**

In `work/baeseongjin/docs/meetings/README.md`, append a new paragraph after the existing two paragraphs:

```markdown
`transcripts/<date>.md` holds the unedited, per-speaker conversation record captured between `/meeting start` and `/meeting end` (every text message and voice transcript line, verbatim, in order) — not just the classified minutes above. It is written in the same commit and is subject to the same `ALLOW_PUBLIC_GITHUB_MINUTES` gate and team-approval expectation.
```

- [ ] **Step 7: Commit**

```bash
git add services/meeting-bot/src/meeting-manager.ts services/meeting-bot/test/meeting-manager.test.ts docs/meetings/README.md
git commit -m "feat(meeting-bot): persist full meeting transcript to GitHub on /meeting end"
```

---

## After this plan lands

The code always tries to write `docs/meetings/transcripts/<date>.md` whenever a meeting captured any content, in the same commit as the classified minutes. Nothing will actually reach GitHub, though, until the user (per the design doc's "Out of scope" section) sets `ALLOW_PUBLIC_GITHUB_MINUTES=true` and confirms `GITHUB_TOKEN` (or the `GITHUB_APP_*` trio) in `.env` — that step is intentionally not automated here.
