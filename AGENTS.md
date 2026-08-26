# 저장소 에이전트 문서 인덱스

이 파일은 상세 규칙을 복제하지 않는 **점진적 공개(Progressive Disclosure) 기반 인덱스**다. 모든 자동화 에이전트는 아래 Level 순서로 읽고, 상세 규칙은 링크된 기준 문서 한 곳에서만 해석한다.

## Level 1 — 모든 작업의 필수 기준

- [`docs/development-rules.md`](./docs/development-rules.md) — 작업 시작·완료, 객체 설계, 검증, 문서 결정 흡수와 Git 운영의 단일 기준.

## Level 2 — 해당 영역을 수정할 때 필수 기준

- [`docs/multiplayer-synchronization.md`](./docs/multiplayer-synchronization.md) — 멀티 권한, 전송, 예측·보간, snapshot과 실제 두 클라이언트 검증의 단일 기준.
- [`docs/performance-architecture.md`](./docs/performance-architecture.md) — fixed step, 공간 index, 활성 객체, snapshot, render와 전송 예산의 단일 기준.

## Level 3 — 작업별 세부 기준

- [`docs/README.md`](./docs/README.md) — 아래 목록에 없는 문서가 필요할 때 사용하는 전체 문서 인덱스.
- [`docs/game-hackathon-planning.md`](./docs/game-hackathon-planning.md) — 게임 방향, 핵심 경험, 플레이 흐름이나 열린 제품 결정을 바꿀 때 읽는다.
- [`docs/architecture.md`](./docs/architecture.md) — 모듈 책임, 객체 상태 소유권, 의존 방향이나 Runtime 경계를 바꿀 때 읽는다.
- [`docs/map-editor.md`](./docs/map-editor.md) — authored Stage geometry·object·portal을 만들거나 Map Editor 저장 흐름을 바꿀 때 읽는다.
- [`docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md`](./docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md) — Scenario `AREA-SPEC`과 generated Stage 계약을 수정할 때 읽는다.
- [`docs/two-device-playtest-protocol.md`](./docs/two-device-playtest-protocol.md) — 실제 두 기기 멀티플레이를 검증하거나 결과를 기록할 때 읽는다.
- [`docs/graphics-asset-guide.md`](./docs/graphics-asset-guide.md) — sprite·environment·UI 등 그래픽 자산을 생성·교체·통합할 때 읽는다.
- [`docs/audio-asset-guide.md`](./docs/audio-asset-guide.md) — 오디오를 생성·인계·통합하거나 runtime audio package를 바꿀 때 읽는다.
- [`docs/dev-environment-setup.md`](./docs/dev-environment-setup.md) — 로컬 서버, 개발 환경, 실행 명령이나 문제 해결 절차가 필요할 때 읽는다.
- [`docs/version-management.md`](./docs/version-management.md) — 버전, 서버 코드, 배포 candidate 또는 완료 절차를 바꿀 때 읽는다.
- [`docs/documentation-rules.md`](./docs/documentation-rules.md) — 문서를 추가·삭제·승격하거나 인덱스와 기록 위치를 바꿀 때 읽는다.
- [`docs/decision-history.md`](./docs/decision-history.md) — 과거 결정과 충돌하거나 반복 유사 버그의 대체 이력을 감사할 때 읽는다.
- 이 파일에 세부 규칙, 현재 구현 현황, 완료 이력 또는 임시 핸드오프를 다시 적지 않는다.
