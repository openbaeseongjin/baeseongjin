# 문서 작성 규칙

이 문서는 `docs/`의 문서 인덱스 운영, 작성 위치, 파일 형식과 이미지 첨부 기준을 정의한다. [`README.md`](./README.md)는 문서 목록과 읽는 순서만 제공하고, 주제별 설명과 규칙은 각각의 기준 문서에서 관리한다.

## 1. 인덱스와 기준 문서

- `docs/README.md`는 문서 인덱스다. 각 문서의 링크와 역할을 한 줄로 안내하고 주제별 상세 설명을 직접 담지 않는다.
- 한 주제에는 현재 기준 문서를 하나만 둔다. 설명이 길어지거나 독립된 관점이 생기면 별도 문서로 분리하고 인덱스에서 연결한다.
- 새 문서를 추가하거나 문서의 역할을 바꾸면 같은 작업에서 `docs/README.md`의 분류와 설명을 갱신한다.
- `SESSION-HANDOFF.md`에는 현재 결론과 기준 문서 위치만 남기고 상세 규칙을 복제하지 않는다.
- 최신 사용자 결정이 기존 문서와 충돌하면 기준 문서를 현행화하고, 완전히 대체된 결정은 [`decision-history.md`](./decision-history.md)로 이동한다.

## 2. 작성 위치

- `docs/` 바로 아래는 메인 개발자가 관리하는 공유 기준 문서 위치다.
- 메인 개발자가 아닌 작업자는 별도 공용 경로가 정해진 경우를 제외하고 `docs/<이름>/` 아래에서 작업한다. 예를 들어 `bsh` 작업자의 문서는 `docs/bsh/`에 둔다.
- 작업자별 문서를 공유 기준 문서로 승격하거나 `docs/` 바로 아래로 옮길 때는 메인 개발자의 명시적인 결정에 따른다.

## 3. 시나리오 문서와 현재 상태

- `docs/bsh/scenario/`의 Sector·Stage 문서는 해당 기획과 제작 기준을 소유한다.
- [`scenario-development-integration.md`](./scenario-development-integration.md)는 여러 Sector에 걸친 상세 Stage 목록, 현재 authored Runtime 연결 상태, 열린 차단 요소와 마지막 확인 근거를 소유한다.
- `SESSION-HANDOFF.md`와 `implementation-roadmap.md`에는 현재 요약과 통합 현황 링크만 남긴다. 날짜별 Stage 개수나 Runtime 상태를 별도 기준처럼 복제하지 않는다.
- Stage 문서의 고정 Git SHA는 작성 당시 근거인 `AUTHORING SNAPSHOT`으로 표시하고 현재 상태는 통합 현황에서 확인한다.

## 4. 파일 형식

- 일반 문서는 Markdown(`.md`)으로 작성한다.
- 발표를 목적으로 만든 자료는 예외적으로 HTML(`.html`), PowerPoint(`.ppt`, `.pptx`) 등 발표에 적합한 형식을 사용할 수 있다.
- 발표 자료가 아닌 기획, 설계, 개발 규칙, 운영 절차와 기록은 Markdown 형식을 유지한다.

## 5. 이미지 첨부

- 이미지는 문서가 있는 작업 폴더의 `images/` 하위에 저장한다. `docs/` 문서의 이미지는 `docs/images/`, `docs/bsh/` 문서의 이미지는 `docs/bsh/images/`에 둔다.
- Markdown에서는 `![이미지 설명](./images/file-name.png)`처럼 상대 경로로 연결한다.
- HTML 자료에서는 `<img src="./images/file-name.png" alt="이미지 설명">`처럼 같은 상대 경로를 사용한다.
- 로컬 컴퓨터의 절대 경로나 임시 첨부 URL을 문서에 연결하지 않는다.
- 시나리오용 `Scenario Art Reference`의 생성·상태·검수는 [`bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`](./bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md)를 따른다. 생성 전에 현재 Stage 문서와 Runtime을 확인하고 `RETIRED`·`PENDING REGENERATION` 이미지를 새 생성 입력으로 사용하지 않는다.
