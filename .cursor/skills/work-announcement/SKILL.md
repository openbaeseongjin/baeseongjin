---
name: work-announcement
description: >-
  Build a repository-evidenced development announcement for a selected period,
  work domain, and contributor; obtain draft approval; and optionally publish
  the exact approved text to Discord. Use for whole-project updates or filtered
  notices such as one graphics contributor's work. Do not use for speculative
  plans or announcements without Git-backed work.
---

# Work Announcement

Turn work already reflected in this repository into a concise, reviewable announcement. The repository is the evidence source; Discord is only the approved publication destination.

## 활용 가능한 사용법

사용자는 기간, 분야, 담당자와 결과 단계를 자유롭게 조합할 수 있다.

- `$work-announcement 어제부터 현재까지 전체 개발 작업 공지 초안 만들어줘`
- `$work-announcement 8월 20일부터 25일까지 그래픽 분야만 정리해줘`
- `$work-announcement 지난주 그래픽 담당자 홍길동의 작업만 공지로 만들어줘`
- `$work-announcement 8월 24일 이후 멀티플레이 버그 수정만 작업별 시간대와 함께 정리해줘`
- `$work-announcement 앞에서 승인한 최종안을 공지 채널에 올려줘`

스킬 이름만 호출했거나 범위가 불명확하면 장황한 설명 대신 다음 네 입력을 안내한다: `기간`, `분야(전체 가능)`, `담당자(전체 가능)`, `초안만/승인 후 게시`. 기간만 주어지면 분야와 담당자는 전체로 처리한다. 게시 요청이 함께 있어도 먼저 완성된 초안을 보여주고 승인받는다.

## Scope

Resolve three independent filters before summarizing:

- **Period:** explicit start and end in Asia/Seoul time. Convert relative phrases such as "어제부터 현재까지" into visible dates and times. Default the end to the current time only when the user says "현재까지".
- **Domain:** all development by default, or a requested area such as graphics, gameplay, multiplayer, scenario, audio, infrastructure, or documentation. Classify from changed paths, symbols, commit bodies, and current canonical documents—not the subject line alone.
- **Contributor:** all contributors by default, or one requested person's actual work. Resolve the person's Git author identities from feature commits and relevant trailers. Do not treat the merge commit author as the implementation author. Ask only when one human maps ambiguously to multiple unmatched identities.

When multiple filters are supplied, use their intersection. State the resolved period, domain, and contributor in the draft so the user can detect a wrong scope.

## Repository Evidence

1. Read `AGENTS.md`, `SESSION-HANDOFF.md`, `docs/development-rules.md`, and only the canonical documents needed to check whether a claim is still current.
2. Confirm the branch and worktree state without changing files.
3. Read `main` first-parent history within the selected period. Count merged PRs separately from direct operational commits.
4. For each merge, inspect the second-parent feature commit's author, body, changed paths, verification, and declared gaps. Follow additional commits only when the merge contains more than one implementation commit or attribution remains unclear.
5. Include direct `main` commits only when they materially change the announced result, such as a release or production endpoint update. Do not inflate the PR count with them.
6. Compare selected work with current canonical documents and later commits. Describe work that was superseded as a transition or omit stale detail; never present it as the current product state.

Do not use uncommitted files, commit subjects, or Discord discussion as proof that work was completed. Do not expose author email addresses, Discord IDs, tokens, private identifiers, or raw operational logs.

## Draft Shape

Lead with the selected scope and exact PR count. Group related commits by player or production value rather than listing every PR.

Each work group must include its own approximate KST time window derived from merge or direct-application timestamps. Do not replace these with one continuous overall work duration. Parallel groups may overlap, and disjoint bursts may list more than one window.

Prioritize:

1. shipped gameplay or production changes;
2. user-visible and operational bug fixes, including regressions found during verification;
3. content, graphics, scenario, or tooling changes inside the selected domain;
4. important remaining verification.

Keep the announcement concise, but do not hide meaningful bug fixes merely to shorten it. Distinguish implementation, reference-only assets, verification, and remaining work. Use human-facing language; retain code identifiers only when they clarify the result.

For a domain or contributor-filtered announcement, include only matching work. A shared commit may be included only for the matching portion that changed relevant paths or contracts. Do not credit a contributor for unrelated work merely because their name appears on a merge or deployment commit.

## Review and Publication

Always show the complete proposed Discord text before sending it. No draft request, wording correction, scope adjustment, or request to add timestamps authorizes publication. Any material edit after approval resets approval.

Publish only after the user explicitly approves the exact final text and the destination is unambiguous. For this repository, resolve the human-readable `공지` channel through Discord MCP when it is uniquely sendable; never store or hardcode guild, channel, or message IDs. Use the configured Discord MCP and the safety/setup procedure in `../discord-repo-cross-reference/SKILL.md`.

Send plain text with mentions disabled when supported. If the text exceeds Discord's message limit, show the proposed split and obtain approval for that exact split before sending. Do not edit, delete, react to, crosspost, moderate, or administer other Discord content.

After success, report the human-readable server and channel. Do not expose raw IDs or operational output.

## User-Facing Result

- 초안 단계에서는 적용한 `기간 · 분야 · 담당자`, Git 근거의 PR 수, 작업별 시간대가 포함된 완전한 게시 문구를 보여준다.
- 필터 결과가 없으면 억지로 공지를 만들지 말고 어떤 필터에서 0건이 되었는지 말한 뒤 사용할 수 있는 입력 예시를 한두 개 제시한다.
- Discord 연결이나 권한 문제가 있으면 `discord-repo-cross-reference`의 MCP Setup Recovery를 적용하고 사용자가 수행할 다음 단계만 짧게 안내한다.
- 게시 성공 시 서버와 채널의 사람이 읽는 이름, 게시한 범위만 요약한다.
