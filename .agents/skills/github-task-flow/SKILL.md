---
name: github-task-flow
description: "`$github-task-flow` 호출만으로 GitHub CLI 설치·웹 인증·쓰기 권한 점검을 자동 준비하고, 현재 작업을 GitHub Issue로 기록한 뒤 이슈 번호 기반 브랜치, 단일 Lore 커밋, push, pull request, 최신 origin/main rebase와 재검증, 일반 merge commit과 이슈 종료까지 수행한다. GitHub 쓰기 환경이 아직 구성되지 않았거나 팀원이 별도 설명 없이 현재 작업의 커밋과 브랜치 계보를 보존해 main에 병합하려 할 때 사용한다."
---

# GitHub Task Flow

GitHub Issue를 작업의 기준 이력으로 삼고 PR을 통해 단일 커밋으로 전달한다.

## 호출 계약

- 사용자가 `$github-task-flow`만 입력하면 **“현재 작업을 GitHub 이력으로 만들고 병합해줘”**로 해석하고 전체 흐름을 즉시 실행한다.
- 같은 요청이나 목적을 다시 설명하도록 요구하지 않는다.
- 작업 범위는 현재 대화에서 완료한 요청, 작업 트리 diff, 검증 결과를 근거로 자동 구성한다.
- 호출 뒤의 문장은 기본 의미를 대체하지 않고 Issue 제목·범위·제약을 보충한다.
- 현재 대화와 작업 트리 모두에서 게시할 작업을 식별할 수 없을 때만 작업 부재를 보고하고 종료한다.
- merge 권한, 필수 승인, 실패한 검사처럼 자동 해결할 수 없는 외부 blocker가 없으면 중간 확인 없이 끝까지 진행한다.
- GitHub 쓰기 환경이 없으면 아래 초기화 절차까지 호출 의미에 포함하고, 설정 후 원래 흐름을 자동 재개한다.

## 필수 원칙

- 커밋 제목과 본문의 자연어 문장은 반드시 한국어로 작성한다. `Related`, `Confidence`, `Scope-risk`, `Tested`, `Not-tested` 같은 Lore trailer 키와 `low`·`medium`·`high`, `narrow`·`moderate`·`broad` 같은 규약상 고정 값만 원문 표기를 유지하고, 검증 내용과 미검증 사유는 한국어로 작성한다.
- GitHub Issue를 브랜치와 커밋보다 먼저 생성한다.
- 브랜치 이름은 `issue/<issue-number>-<short-slug>`를 사용한다.
- 작업 브랜치는 `origin/main` 최신 상태에서 만들고 병합 직전에 최신 `origin/main` 위로 다시 rebase한다.
- 한 작업은 한 브랜치, 한 PR, 한 최종 커밋으로 유지한다.
- PR은 일반 merge commit으로 병합해 Lore 커밋 SHA와 브랜치 계보를 `main`에 보존한다.
- `main`에 직접 push하거나 로컬 merge하지 않는다.
- 사용자가 명시적으로 요청하지 않는 한 squash merge와 rebase merge를 사용하지 않는다.
- `main`과 공유 브랜치의 이력을 재작성하지 않는다. 이미 push한 단일 소유 전용 작업 브랜치의 필수 rebase 결과만 `--force-with-lease`로 갱신하고 `--force`는 사용하지 않는다.
- 보호 규칙과 필수 검사를 우회하지 않는다.
- 관련 없는 변경을 커밋에 포함하지 않는다.
- 저장소의 `AGENTS.md`, CODEOWNERS, PR 템플릿, 커밋 규칙을 우선 적용한다.

## 0. GitHub 쓰기 환경 초기화

Issue 생성 전에 GitHub App 또는 커넥터의 쓰기 기능을 먼저 확인한다. 조회만 가능하거나 Issue 생성이 403으로 거부되면 로컬 `gh` CLI로 자동 전환한다.

### CLI 설치

1. `gh --version` 또는 `Get-Command gh`로 기존 설치를 확인한다.
2. 없으면 운영체제의 신뢰된 기본 패키지 관리자로 설치한다.

```powershell
winget install --id GitHub.cli --exact --source winget
```

```bash
brew install gh
```

Linux에서는 배포판 공식 패키지 저장소의 `gh`를 우선 사용한다. 원격 설치 스크립트를 shell에 pipe하지 않는다.

3. 설치 후 새 shell을 요구하지 말고 실행 파일 경로를 다시 검색한다.
4. `gh --version`으로 설치 결과를 확인한다.

### 웹 인증과 Git 연동

1. `gh auth status --hostname github.com`으로 인증 상태를 확인한다.
2. 인증되지 않았으면 저장소 루트에서 다음 명령을 직접 실행한다.

```powershell
gh auth login --hostname github.com --git-protocol https --web
```

3. 브라우저 또는 device code 인증 화면이 열리면 사용자가 GitHub에서 승인을 완료할 때까지 기다린다. 사용자에게 별도 터미널을 열거나 명령을 다시 입력하게 하지 않는다.
4. 인증 완료 후 다음을 실행한다.

```powershell
gh auth setup-git
gh auth status --hostname github.com
gh api user
```

5. 토큰, device code, credential helper 값은 출력·로그·Issue·커밋에 기록하지 않는다.

### 저장소 권한 확인

- `gh repo view --json nameWithOwner,viewerPermission`으로 대상 저장소와 권한을 확인한다.
- `viewerPermission`이 `WRITE`, `MAINTAIN`, `ADMIN` 중 하나인지 확인한다.
- 필요한 권한이 없으면 다른 계정으로 임의 전환하거나 권한 범위를 확대하지 않는다. 필요한 저장소 권한만 정확히 보고한다.
- 인증이 끝나면 Issue 생성 단계부터 원래 작업을 자동 재개한다.
- 설치가 관리자 승인, GUI 확인 또는 재부팅을 요구할 때만 현재 상태와 사용자가 해야 할 한 가지 행동을 보고하고 대기한다.

## 1. 사전 점검

1. 저장소 루트, 현재 브랜치, upstream, remote, 작업 트리를 확인한다.
2. 초기화된 GitHub 연결과 `gh auth status --hostname github.com`을 확인한다.
3. 현재 변경사항에서 작업 범위를 요약하고 관련 없는 변경을 분리한다.
4. 비밀 파일과 자격 증명 징후를 검사한다. 의심되는 비밀이 있으면 게시를 중단하고 위치와 유형만 보고한다.
5. 같은 목적의 열린 Issue나 PR이 있는지 확인한다.

인증, 권한 또는 작업 범위가 불명확하면 외부 변경 전에 필요한 정보만 요청한다.

## 2. GitHub Issue 생성

```markdown
## 목적

사용자 또는 운영상 필요한 결과를 설명한다.

## 범위

- 포함할 변경
- 제외할 변경

## 완료 조건

- [ ] 검증 가능한 조건

## 검증

- 실행할 테스트와 확인 방법
```

- 제목은 결과 중심의 짧은 문장으로 작성한다.
- 생성 응답에서 Issue 번호와 URL을 확인한다.
- Issue 번호를 이후 브랜치·PR·최종 보고의 기준으로 사용한다.

## 3. 이슈 브랜치 생성

1. 미커밋 변경은 미추적 파일까지 포함해 복구 가능한 임시 stash로 보관한다.
2. `git fetch origin main`을 실행한다.
3. `origin/main`에서 `issue/<number>-<slug>` 브랜치를 만든다.
4. 임시 stash를 복원하고 충돌 여부를 확인한다.
5. 브랜치가 정확한 Issue 번호를 포함하는지 확인한다.

slug는 영문 소문자, 숫자, 하이픈만 사용하고 40자 이내로 유지한다.

## 4. 구현과 검증

- 요청된 변경만 구현한다.
- 위험도에 맞춰 테스트, lint, typecheck, 정적 분석을 실행한다.
- 실패한 검증이 있으면 수정 후 다시 실행한다.
- `git diff --check`와 최종 diff 검토를 포함한다.
- Issue 완료 조건과 실제 diff가 일치하는지 확인한다.

## 5. 단일 Lore 커밋

1. 관련 파일만 명시적으로 stage한다.
2. `git diff --cached`로 범위와 비밀 포함 여부를 재확인한다.
3. Lore Commit Protocol에 맞춘 커밋 메시지를 작성한다.

커밋 제목과 본문을 영어로 작성하지 않는다. 코드 식별자·명령어·파일 경로·테스트 이름처럼 번역하면 의미가 바뀌는 항목만 원문으로 유지한다.

```text
<변경 이유를 설명하는 의도 문장>

<제약과 접근 이유>

Related: #<issue-number>
Confidence: <low|medium|high>
Scope-risk: <narrow|moderate|broad>
Tested: <실행한 검증>
Not-tested: <남은 검증 또는 None>
```

- 첫 줄의 의도 문장과 본문의 제약·접근 이유는 완전한 한국어 문장으로 작성한다.
- `Tested`와 `Not-tested`의 설명도 한국어로 작성한다. 미검증 항목이 없으면 `Not-tested: 없음`으로 기록한다.
- Lore trailer 키와 규약이 정한 열거 값은 저장소 파싱 호환성을 위해 번역하지 않는다.

- push 전 `origin/main..HEAD` 커밋 수가 정확히 1인지 확인한다.
- 둘 이상이면 아직 공유되지 않은 로컬 커밋만 기준 커밋 위로 합친다.
- 이미 push한 브랜치의 기록은 7절의 필수 rebase를 제외하고 재작성하지 않는다. 다른 사람이 사용하는 브랜치는 예외 없이 blocker를 보고한다.

## 6. Push와 Pull Request

1. `git push -u origin <branch>`로 새 브랜치를 push한다.
2. `main`을 base로 PR을 생성한다.
3. PR 본문에 결과, 검증, `Closes #<issue-number>`를 포함한다.
4. PR URL과 연결된 Issue 번호를 확인한다.
5. CODEOWNERS 승인과 필수 검사 상태를 확인한다.

## 7. 최신 main rebase와 재검증

1. PR 검사와 승인이 준비되면 `git fetch origin main`을 실행하고 현재 `origin/main` SHA를 기록한다.
2. 현재 브랜치가 Issue 전용 단일 소유 브랜치인지 확인한다. 공유 브랜치이거나 소유 여부가 불명확하면 기록을 재작성하지 말고 blocker를 보고한다.
3. `git rebase origin/main`을 실행한다. 충돌은 작업 범위 안에서 해결하고 관련 없는 변경을 버리지 않는다.
4. 최종 rebase 뒤 4절의 필수 검사를 모두 다시 실행하고 `git diff --check`를 통과시킨다.
5. `git merge-base HEAD origin/main`과 `git rev-parse origin/main`이 같은 SHA인지 확인한다.
6. 이미 push한 전용 브랜치의 SHA가 바뀌었으면 원격 tip을 확인한 뒤 `git push --force-with-lease`로만 갱신한다. `--force`를 사용하지 않는다.
7. PR의 필수 검사, 승인과 mergeable 상태를 다시 확인한다.
8. 실제 병합 직전에 `git fetch origin main`을 한 번 더 실행한다. `origin/main`이 기록한 SHA보다 전진했으면 3~7단계를 반복한다.

rebase 충돌, 실패한 재검증 또는 최신 base 확인 실패를 우회해 stale 브랜치를 병합하지 않는다. 이 절의 브랜치 rebase는 GitHub의 rebase merge 방식과 다르며, 병합 자체는 8절의 일반 merge commit을 사용한다.

## 8. Merge와 정리

- 모든 필수 검사와 승인이 통과한 뒤 일반 merge commit으로 병합한다.
- `gh pr merge <number> --merge --delete-branch`처럼 GitHub의 정상 PR 병합 경로를 사용한다.
- 병합 뒤 `main` 그래프에 기존 Lore 커밋 SHA와 새 merge commit SHA가 모두 존재하는지 확인한다.
- merge queue가 필요하면 queue에 등록하고 완료를 기다린다.
- 자동 삭제되지 않은 원격 작업 브랜치를 삭제한다.
- Issue가 닫혔는지 확인하고 필요하면 PR 연결 확인 후 닫는다.
- `main`의 최종 커밋과 PR merge 상태를 확인한다.

보호 규칙, 실패한 검사, 승인 부족을 우회하지 않고 blocker와 필요한 다음 행동을 보고한다.

## 완료 보고

- Issue: 번호와 URL
- Branch: 이름
- Commit: SHA와 제목
- PR: 번호와 URL
- Checks: 통과 항목 또는 blocker
- Rebase: 최종 `origin/main` SHA와 `--force-with-lease` 사용 여부
- Merge: Lore 커밋 SHA, merge commit SHA, 일반 merge 방식
- Remaining: 남은 위험 또는 `없음`
