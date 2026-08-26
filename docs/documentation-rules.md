# 문서 작성 규칙

이 문서는 `docs/`의 문서 인덱스 운영, 작성 위치, 파일 형식과 이미지 첨부 기준을 정의한다. [`README.md`](./README.md)는 문서 목록과 읽는 순서만 제공하고, 주제별 설명과 규칙은 각각의 기준 문서에서 관리한다.

## 1. 인덱스와 기준 문서

- 루트 `AGENTS.md`는 상세 규칙을 담지 않는 점진적 공개(Progressive Disclosure) 인덱스다. Level 1은 모든 작업의 공통 기준, Level 2는 영역별 필수 기준, Level 3은 앞선 기준 문서가 연결하는 작업별 세부 문서로 제한한다.
- `docs/README.md`는 문서 인덱스다. 각 문서의 링크와 역할을 한 줄로 안내하고 주제별 상세 설명을 직접 담지 않는다.
- 한 주제에는 현재 기준 문서를 하나만 둔다. 설명이 길어지거나 독립된 관점이 생기면 별도 문서로 분리하고 인덱스에서 연결한다.
- 새 문서를 추가하거나 문서의 역할을 바꾸면 같은 작업에서 `docs/README.md`의 분류와 설명을 갱신한다.
- 완료된 patch package, migration plan, 보조 검증 가이드는 현재 기준 문서와 역할을 중복한 채 인덱스에 남기지 않는다. 아직 필요한 결정만 기준 문서에 흡수하고, 대체 관계가 필요하면 `decision-history.md`에 한 항목으로 요약한 뒤 원문 파일과 인덱스 링크를 제거한다.
- `SESSION-HANDOFF.md`는 아직 기준 문서에 흡수되지 않은 결정·진행 중 전환·문서화되지 않은 blocker만 임시로 기록한다. 기준 문서가 내용을 충분히 소유하면 링크 요약도 남기지 않고 같은 작업에서 핸드오프 항목을 제거한다.
- 최신 사용자 결정이 기존 문서와 충돌하면 기준 문서를 현행화하고, 완전히 대체된 결정은 [`decision-history.md`](./decision-history.md)로 이동한다.

## 2. 작성 위치

- `docs/` 바로 아래는 메인 개발자가 관리하는 공유 기준 문서 위치다.
- 메인 개발자가 아닌 작업자는 별도 공용 경로가 정해진 경우를 제외하고 `docs/<이름>/` 아래에서 작업한다. 예를 들어 `bsh` 작업자의 문서는 `docs/bsh/`에 둔다.
- 작업자별 문서를 공유 기준 문서로 승격하거나 `docs/` 바로 아래로 옮길 때는 메인 개발자의 명시적인 결정에 따른다.

## 3. 시나리오 문서와 현재 상태

- `docs/bsh/scenario/`의 Sector·Stage 문서는 해당 기획과 제작 기준을 소유한다.
- 각 Stage의 `PRODUCTION-ALIGNMENT.md`는 해당 Stage의 authored Runtime 연결 상태와 마지막 확인 근거를 소유한다. 여러 Stage의 현황을 수동 중앙 목록으로 다시 만들지 않는다.
- 제품 우선순위는 `game-hackathon-planning.md`, 아직 기준 문서에 흡수되지 않은 진행 상태만 `SESSION-HANDOFF.md`가 소유한다. 완료 이력과 날짜별 Stage 개수는 Git과 `decision-history.md`가 소유한다.
- Stage 문서의 고정 Git SHA는 작성 당시 근거인 `AUTHORING SNAPSHOT`으로 표시하고 현재 상태는 해당 `PRODUCTION-ALIGNMENT.md`와 Runtime source에서 확인한다.

## 4. 파일 형식

- 일반 문서는 Markdown(`.md`)으로 작성한다.
- 발표를 목적으로 만든 자료는 예외적으로 HTML(`.html`), PowerPoint(`.ppt`, `.pptx`) 등 발표에 적합한 형식을 사용할 수 있다.
- 발표 자료가 아닌 기획, 설계, 개발 규칙, 운영 절차와 기록은 Markdown 형식을 유지한다.
- `docs/bsh/scenario/<sector>/<stage>/AREA-SPEC.json`은 기계 검증이 목적인 구현 계약 파일이라 위 발표 자료 예외와 무관하게 JSON을 유지한다. 스키마와 작성 규칙은 [`bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md`](./bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md)를 따른다.

## 5. 이미지 첨부

- 이미지는 문서가 있는 작업 폴더의 `images/` 하위에 저장한다. `docs/` 문서의 이미지는 `docs/images/`, `docs/bsh/` 문서의 이미지는 `docs/bsh/images/`에 둔다.
- Markdown 이미지는 문서 기준 상대 경로 `./images/<file-name>.png`를 사용한다.
- HTML 자료에서는 `<img src="./images/file-name.png" alt="이미지 설명">`처럼 같은 상대 경로를 사용한다.
- 로컬 컴퓨터의 절대 경로나 임시 첨부 URL을 문서에 연결하지 않는다.
- 시나리오용 `Scenario Art Reference`의 생성·상태·검수는 [`bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`](./bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md)를 따른다. 생성 전에 현재 Stage 문서와 Runtime을 확인하고 `RETIRED`·`PENDING REGENERATION` 이미지를 새 생성 입력으로 사용하지 않는다.
