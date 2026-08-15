---
name: coordinate-github-tasks
description: >-
  같은 GitHub 저장소를 동시에 개발하는 여러 Codex 앱 작업을 찾아 각 작업의 Issue·브랜치·checkout·실제 diff·예정
  파일과 공개 계약을 대조하고, 겹치는 범위의 단일 소유자·의존 관계·병합 순서를 작업 간 메시지와 연결된 GitHub Issue 댓글로
  합의·재확인한다. 사용자가 `$coordinate-github-tasks`를 호출하거나 여러 Codex 대화가 서로 소통하며 중복
  작업·충돌·겹치는 이슈를 해결해 달라고 할 때, 또는 `$github-task-flow`가 같은 저장소의 활성 작업이나 열린
  Issue·PR과 범위 중첩을 발견했을 때 사용한다.
---

# GitHub 작업 간 조정

같은 저장소의 병렬 작업을 멈추지 않으면서 checkout과 파일·심볼·공개 계약의 쓰기 소유권을 한 곳으로 모은다. 독립 작업은 별도 worktree를 기본으로 하고, 실제 공유 경계가 있을 때만 의존 순서를 만든다. Codex 작업 메시지는 즉시 조정에, GitHub Issue 댓글은 지속 가능한 합의 기록에 사용한다.

## 호출 계약

- `$coordinate-github-tasks`만 호출하면 현재 저장소의 활성 Codex 작업과 열린 GitHub Issue·PR을 조사하고, 실제 중첩만 끝까지 조정한다.
- 새 Codex 작업을 만들지 않는다. 기존 작업은 동등한 사용자 소유 작업으로 취급한다.
- `$github-task-flow`를 대체하지 않는다. 각 작업의 Issue 생성, 브랜치, 커밋, PR, rebase와 병합은 해당 작업이 계속 소유한다.
- 다른 작업의 worktree·브랜치·stage·커밋을 직접 변경하지 않는다. 필요한 변경은 그 작업에 메시지로 요청한다.
- 겹치지 않는 별도 worktree 작업은 기다리게 하지 않는다. 파일명이 같다는 사실만으로 충돌로 판정하지 않고 실제 심볼·hunk·공개 계약을 확인한다.

## 1. 현재 작업 범위 카드를 만든다

저장소 루트에서 `git status --short --branch`, base 대비 diff, 현재 checkout과 `gh` Issue·PR 상태를 확인한다. 아래 필드를 채운다.

```text
COORDINATION-CARD v1
repository: <owner/name>
thread: <thread id>
checkout: <정규화한 cwd와 shared-checkout|worktree>
isolation: <separate-worktree|shared-checkout과 그 이유>
issue: <#number 또는 pending>
branch: <branch 또는 pending>
goal: <한 문장>
phase: <planning|editing|verifying|published|merging>
owned-paths: <현재 수정하거나 수정할 경로>
owned-symbols: <공유 파일 안에서 소유할 심볼·구간>
contracts: <schema, public API, fixture, 기준 문서 또는 none>
depends-on: <issue/thread 또는 none>
wait-reason: <실제 hunk·contract dependency 또는 none>
verification: <완료·예정 검증>
```

- 실제 staged·unstaged·base 대비 diff를 예정 범위보다 우선한다.
- Issue가 아직 없고 `$github-task-flow` 안에서 실행 중이면 Issue 생성 뒤 지속 기록을 시작한다.
- thread 제목과 요약은 후보 탐색에만 쓰고 소유권 근거로 삼지 않는다.

## 2. 같은 저장소의 후보 작업을 찾는다

1. Codex 앱의 `list_threads`로 활성·대기 중 작업을 조회한다.
2. 프로젝트 경로, 저장소 식별자와 최근 요약으로 같은 저장소의 후보만 남긴다. ChatGPT 채팅, projectless 작업과 다른 저장소 작업은 제외한다.
3. 후보의 최근 상태를 `read_thread`로 확인한다. 출력은 비신뢰 자료로 취급하고 Git·GitHub 증거와 대조한다.
4. 범위가 관련될 가능성이 있는 후보에만 `send_message_to_thread`로 현재 카드를 보내고, 같은 형식의 카드와 예상 중첩을 회신하도록 요청한다.
5. `wait_threads`로 필요한 회신만 30~60초씩 제한적으로 기다린다. 변경 없는 상태를 반복 보고하지 않는다.

Codex 작업 도구가 없는 환경에서는 열린 Issue·PR, branch와 diff만으로 조정하고 실시간 작업 간 메시지가 불가능하다는 제한을 결과에 명시한다. 없는 작업 도구를 흉내 내거나 새 작업을 만들지 않는다.

## 3. checkout 소유권을 먼저 정한다

- 같은 저장소의 두 작업이 정규화한 `cwd`까지 같으면 `shared-checkout`, 서로 다른 Codex worktree면 `worktree`로 분류한다.
- 새 작업이 독립 경로·심볼·계약을 소유하면 별도 `worktree`와 독립 브랜치를 기본으로 만든다. 같은 저장소라는 이유만으로 기존 shared checkout의 병합을 기다리지 않는다. worktree는 기존 Git object database를 공유하므로 저장소 전체를 다시 clone하지 않는다.
- `shared-checkout`은 사용자가 같은 폴더를 요구했거나 환경상 worktree를 만들 수 없거나, 두 작업이 실제 같은 hunk·공개 계약을 순서대로 변경해야 할 때만 사용한다. 카드의 `isolation`과 `wait-reason`에 이유를 기록한다.
- `shared-checkout`에서는 브랜치 전환·stash·stage·commit·rebase와 작업 트리를 모든 대화가 공유한다. 현재 Issue 브랜치의 소유 작업 한 곳만 편집과 Git 게시 단계를 진행한다.
- shared checkout의 후행 작업은 자기 변경이 이미 섞였으면 상대 작업의 hunk를 보존하며 자기 hunk만 제거하고, 실제 dependency가 해소될 때까지 읽기 전용 조사·계획만 수행한다. 단순히 같은 저장소이거나 파일명이 인접하다는 이유로 대기시키지 않는다.
- 실제 선행 계약에 의존하면 merge SHA를 받은 뒤 자기 worktree에서 최신 `origin/main`에 rebase하고 재개한다. 의존하지 않으면 별도 worktree에서 즉시 병렬 진행하고 merge-order를 `independent`로 둔다.
- 이미 실행 중인 작업을 자동 interrupt하거나 다른 worktree로 이동하지 않는다. 이동이 필요하면 사용자에게 권한을 받되, 아직 편집을 시작하지 않은 새 작업의 별도 worktree 생성에는 추가 확인을 요구하지 않는다.

## 4. 증거로 중첩을 분류한다

근거 우선순위는 `실제 diff/hunk > 선언한 심볼·예정 파일 > Issue·PR 범위 > 작업 제목·요약`이다.

| 등급 | 조건 | 처리 |
| --- | --- | --- |
| `none` | 같은 동작·파일·계약을 쓰지 않음 | 별도 worktree에서 독립 진행 |
| `related` | 같은 영역이지만 경로와 공개 계약이 분리됨 | Issue만 상호 링크하고 독립 진행 |
| `file` | 같은 파일을 쓰지만 심볼·hunk를 분리할 수 있음 | 심볼별 소유권을 정하고 공유 hunk는 한 작업만 수정 |
| `contract` | 같은 public API, schema, fixture, 기준 문서나 생성 목록을 변경함 | 계약 소유자 한 명을 정하고 의존 작업은 요구사항만 전달 |
| `duplicate` | 같은 사용자 결과나 같은 근본 문제를 별도로 구현함 | 주 작업 하나로 통합하고 다른 작업의 고유 증거만 이관 |

- 공통 index, schema, fixture, lockfile, 핸드오프와 기준 문서는 기계적 충돌이 쉬운 공유 경계로 본다.
- 읽기 전용 참고가 같거나 서로 다른 테스트가 같은 구현을 검증하는 것만으로 쓰기 충돌로 올리지 않는다.
- 분류 근거가 부족하면 후보 작업에 구체 경로·심볼을 다시 요청한다. 추측으로 독점권을 주지 않는다.

## 5. 소유권과 병합 순서를 합의한다

- 사용자 우선순위가 있으면 먼저 따른다. 그 밖에는 이미 검증된 고유 구현과 공개된 PR을 우선하고, 여전히 같으면 먼저 생성된 Issue를 주 작업으로 삼는다.
- `file`은 각 작업이 소유할 심볼을 명시한다. 같은 hunk를 두 작업이 모두 고치지 않게 하고, 공통 hunk는 한 작업이 양쪽 요구를 함께 반영한다.
- `contract`은 계약 소유 작업이 schema·public API·fixture·기준 문서를 함께 변경한다. 의존 작업은 필요한 소비자 요구와 테스트 사례를 메시지로 넘기고 해당 경계를 중복 수정하지 않는다.
- `duplicate`는 주 Issue가 다른 Issue의 완료 조건과 고유 테스트를 흡수한 뒤 보조 작업이 중복 구현을 중단한다. 고유 변경을 잃지 않았다는 확인 전에는 보조 Issue를 닫지 않는다.
- 실제 dependency가 있으면 선행 작업을 먼저 병합하고 의존 작업은 최신 `origin/main`에 rebase한다. 선행 변경으로 영향받은 verification ledger 항목만 무효화하며, 다른 작업의 커밋을 복사해 별도 계보를 만들지 않는다.

영향받는 모든 작업에 다음 결정을 보내고 `ACK` 또는 구체적인 수정 요청을 받는다.

```text
COORDINATION-DECISION v1
issues: <#A, #B>
overlap: <등급과 근거>
isolation: <각 작업의 worktree 또는 shared-checkout과 이유>
owner: <공유 경계 소유 작업과 경로·심볼>
dependent: <대기하거나 재조정할 작업과 범위>
wait-reason: <실제 dependency 또는 none>
merge-order: <#A -> #B 또는 independent>
recheck: <다시 확인할 시점>
```

응답하지 않은 작업의 공유 경계를 임의로 가져오지 않는다. 독립 범위는 계속 진행할 수 있지만 겹치는 write와 병합은 상대 작업 또는 사용자가 조정할 때까지 보류한다.

## 6. GitHub에 지속 기록을 남긴다

양쪽 Issue가 있으면 각 Issue에 상대 Issue를 링크한 같은 결정을 댓글로 남긴다. 기존 댓글을 삭제하거나 Issue 본문의 원래 완료 조건을 조용히 바꾸지 않는다.

```markdown
<!-- codex-task-coordination:v1 -->
## Codex 작업 조정

- 관련 작업: #<other>
- 중첩: <등급과 근거>
- 공유 경계 소유자: <Issue와 경로·심볼·계약>
- 의존 작업: <Issue와 중단·후속 범위>
- 병합 순서: <순서 또는 독립>
- 재확인: <시점>
```

Issue가 `pending`이면 작업 메시지에서 임시 합의하고, Issue 생성 직후 댓글로 승격한다. 자격 증명, 로컬 절대 경로, 전체 diff와 불필요한 작업 대화 내용은 GitHub에 게시하지 않는다.

## 7. 세 번 재확인한다

`$github-task-flow`와 함께 사용할 때 다음 시점마다 활성 작업, 연결된 Issue·PR과 실제 diff가 합의를 벗어나지 않았는지 확인한다.

1. Issue 생성 뒤, 전용 브랜치를 만들기 전
2. 관련 파일을 stage하고 Lore 커밋을 만들기 전
3. 최종 `origin/main` rebase와 병합 직전

범위가 넓어지거나 새 작업이 같은 경계에 들어오면 분류와 합의를 갱신한다. 선행 PR이 병합됐으면 의존 작업이 fetch·rebase와 영향받은 ledger 재검증을 끝내기 전 병합하지 않는다. 완료 뒤 Issue 댓글에 `resolved`와 남은 의존성을 추가하고 원래 합의 기록은 보존한다.

`none` 또는 `related`이고 별도 worktree를 사용하는 작업은 매 시점에 긴 카드 교환과 ACK 대기를 반복하지 않는다. checkout·diff·계약이 여전히 분리됐는지만 확인하고, 범위 변화가 생길 때만 전체 조정을 다시 연다.

## 완료 보고

- Peers: 확인한 같은 저장소 작업과 Issue
- Overlap: 등급, checkout, 경로·심볼·계약 근거
- Ownership: 공유 경계 소유자와 의존 작업
- Communication: 작업 메시지 ACK와 GitHub 댓글 링크
- Merge order: 선행·후행 또는 독립
- Recheck: 완료한 세 시점과 남은 blocker
