---
name: coordinate-github-tasks
description: "같은 GitHub 저장소의 두 Codex 대화가 실제로 동시에 구현 소스를 수정하고, 같은 checkout·hunk·public contract에서 충돌할 가능성이 있을 때만 활성 편집 대화끼리 쓰기 소유권과 필요한 병합 순서를 최소한으로 조정한다. 사용자가 `$coordinate-github-tasks`를 호출하거나 `$github-task-flow`가 실제 동시 소스 diff의 중첩을 확인했을 때 사용한다. 개발 계획·예정 파일·열린 Issue/PR만 비교하거나 계획을 분배하는 데 사용하지 않으며, 구현을 마친 대화를 재활성화하거나 새 구현을 맡기지 않는다."
---

# 동시 소스 수정 조정

두 활성 대화가 같은 구현 경계를 동시에 쓰는 상황만 짧게 조정한다. 계획 분배는 사용자가 소유한다. 새 구현은 새 대화에서 시작하며, 이 스킬은 완료된 대화를 다시 작업자로 만들지 않는다.

## 진입 게이트

다음 조건을 모두 만족할 때만 다른 대화에 연락한다.

1. 현재 대화가 실행·빌드·테스트 동작을 바꾸는 구현 소스를 실제로 편집 중이다.
2. 같은 저장소의 다른 대화도 현재 구현 소스를 실제로 편집 중이다.
3. 두 대화의 실제 diff가 같은 checkout, hunk, 생성 파일 또는 public contract에서 충돌할 근거가 있다.

`git status --short --branch`, `git diff --name-only`, `git diff --cached --name-only`와 각 worktree의 실제 diff를 근거로 삼는다. 사용자가 두 활성 편집 대화와 공유 경계를 명시했다면 그 정보도 근거로 사용할 수 있다.

아래 항목은 진입 근거가 아니다.

- 계획 전용 대화, 인터뷰, 설계·일정·백로그 분배
- 예정 파일 목록, 작업 제목, 요약, 같은 기능 영역이라는 추정
- 열린 Issue·PR 또는 같은 저장소라는 사실만 있는 경우
- 문서만 읽거나 검토·검증만 하는 대화
- 구현을 끝내고 `completed`, `published`, `merged`, `closed` 상태가 되었거나 완료 보고를 남긴 대화

조건이 부족하면 다른 대화에 메시지를 보내거나 ACK를 기다리지 말고 `활성 소스 충돌 없음`으로 종료한다. 열린 Issue·PR은 이미 확인된 충돌의 배경 증거로만 읽고 후보 대화를 만드는 데 사용하지 않는다.

## 완료된 대화 보호

- 완료된 대화에는 상태 확인, 범위 카드, 후속 구현, ACK 요청 메시지를 보내지 않는다.
- 완료된 대화를 interrupt, resume, follow-up 또는 재할당하지 않는다.
- 완료된 결과가 필요하면 merge된 코드, commit, PR과 Issue를 읽기 전용 근거로 사용한다.
- 후속 또는 새 구현은 새 대화에서 시작한다. **새 구현은 새 대화**라는 사용자 소유 경계를 바꾸지 않는다.
- 상대가 조정 중 구현을 완료하면 추가 메시지를 중단하고 GitHub의 merge 상태만 확인한다.

## 최소 조정 절차

### 1. 활성 편집 대화만 선별한다

1. Codex 앱의 작업 목록을 한 번 조회해 같은 저장소 후보를 찾는다.
2. 최근 상태를 읽고 `현재 구현 소스 편집 중`인 대화만 남긴다.
3. 계획 전용·대기·검증 전용·완료 대화는 즉시 제외한다.
4. 현재 checkout과 각 활성 대화의 worktree·branch·실제 changed paths를 대조한다.

작업 도구가 없으면 로컬 worktree와 diff만 확인한다. 활성 대화를 증명할 수 없으면 추측으로 연락하지 않는다.

### 2. 실제 충돌만 분류한다

근거 우선순위는 `실제 hunk/diff > public contract 변경 > 같은 shared checkout > 사용자 명시`다.

| 결과 | 조건 | 처리 |
| --- | --- | --- |
| `none` | changed paths와 contract가 분리됨 | 메시지·Issue 댓글 없이 종료 |
| `shared-checkout` | 두 활성 대화가 같은 cwd의 작업 트리·stage를 공유함 | 한 대화만 Git 쓰기를 소유하고 다른 대화는 별도 worktree로 이동하거나 해당 hunk를 기다림 |
| `hunk` | 같은 파일의 같은 심볼·구간을 수정함 | hunk 소유자 한 명만 정함 |
| `contract` | schema, public API, fixture, 공통 index, 생성 목록을 함께 바꿈 | contract 소유자 한 명과 소비자 요구만 정함 |
| `duplicate` | 두 활성 대화가 같은 결과를 이미 구현 중임 | 사용자가 정한 주 대화를 우선하고 중복 편집만 중단 |

같은 파일이라도 hunk와 public contract가 분리되면 `none`으로 처리한다. 계획 문서나 핸드오프의 동시 편집은 구현 소스 충돌과 함께 발생한 경우에만 그 구현 조정에 포함한다.

### 3. 겹치는 대화에 한 번만 보낸다

실제 충돌이 확인된 활성 편집 대화에만 다음 최소 결정을 보내고 한 번의 ACK 또는 수정 요청을 받는다.

```text
SOURCE-OVERLAP v1
paths: <겹치는 실제 changed paths와 hunk/contract>
checkout: <각 worktree 또는 shared checkout>
owner: <공유 경계를 수정할 활성 대화>
dependent: <겹치는 수정만 멈출 활성 대화 또는 none>
merge-order: <owner -> dependent 또는 independent>
```

- 사용자가 이미 나눈 기능·일정·계획을 다시 분배하지 않는다.
- 상대 대화의 전체 계획, 예정 파일, 완료 조건을 요청하지 않는다.
- 다른 worktree·branch·stage·commit을 대신 변경하지 않는다.
- 응답이 없으면 겹치는 write만 보류하고 독립 hunk는 계속 진행한다.

### 4. 필요한 경우에만 GitHub에 남긴다

두 활성 구현이 실제 `hunk` 또는 `contract` 의존 순서를 만들고 양쪽 Issue가 있을 때만 Issue 댓글에 `paths`, `owner`, `merge-order`를 한 번 기록한다. `none`, 계획 관계, 단순 관련성에는 댓글을 남기지 않는다.

선행 구현이 끝나면 완료된 대화에 다시 메시지하지 않는다. PR 또는 merge SHA를 확인하고 의존 worktree를 최신 `origin/main`에 rebase한 뒤 영향받은 검증만 다시 수행한다.

## 재확인

고정된 3회 재확인을 수행하지 않는다. 아래 사건이 생길 때만 한 번 다시 확인한다.

- 실제 diff가 새 공유 hunk나 public contract로 넓어짐
- shared checkout의 Git 소유자가 바뀜
- 선행 PR이 병합되어 의존 작업이 재개됨

재확인 시에도 완료된 대화를 재활성화하지 않는다.

## 완료 보고

충돌이 없으면 `활성 소스 충돌 없음`과 확인한 diff 근거만 짧게 보고한다. 충돌이 있으면 겹친 경로·소유자·병합 순서·남은 blocker만 보고한다. 계획 요약, 전체 작업 카드, 불필요한 Issue 목록은 반복하지 않는다.
