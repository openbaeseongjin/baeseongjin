# 프로젝트 문서 인덱스

이 문서는 `docs/` 아래 문서의 역할과 읽는 순서를 안내한다. 같은 주제를 다루는 문서가 있으면 아래에 표시한 **현재 기준 문서**가 우선한다. 작업을 시작할 때는 저장소 루트의 [`SESSION-HANDOFF.md`](../SESSION-HANDOFF.md)에서 현재 상태와 다음 작업을 먼저 확인한다.

## 빠른 시작

처음 프로젝트를 파악할 때는 다음 순서로 읽는다.

1. [`game-hackathon-planning.md`](./game-hackathon-planning.md) — 게임의 목표와 핵심 경험
2. [`implementation-roadmap.md`](./implementation-roadmap.md) — 현재 구현 상태와 다음 개발 순서
3. [`architecture.md`](./architecture.md) — 코드 구조와 객체 책임
4. [`development-rules.md`](./development-rules.md) — 모든 개발 작업에 적용하는 규칙
5. [`multiplayer-synchronization.md`](./multiplayer-synchronization.md) — 현재 멀티플레이 동기화 방식
6. [`dev-environment-setup.md`](./dev-environment-setup.md) — 로컬 실행과 검증 방법

## 제품과 기획

| 문서 | 역할 |
| --- | --- |
| [`game-hackathon-planning.md`](./game-hackathon-planning.md) | 장르, 핵심 경험, 로프 액션, 성장, 비주얼과 프로토타입 범위를 정의하는 제품 기준 |
| [`implementation-roadmap.md`](./implementation-roadmap.md) | 제품 기준을 실제 구현 순서와 P0·P1·P2 작업으로 나눈 로드맵 |
| [`decision-history.md`](./decision-history.md) | 대체되었거나 완료된 과거 결정을 보존하는 이력이며 현재 기준으로 사용하지 않음 |

## 아키텍처와 개발 규칙

| 문서 | 역할 |
| --- | --- |
| [`architecture.md`](./architecture.md) | 모듈 경계, 실행 흐름, 객체·capability/mixin 구조와 의존 방향의 현재 기준 |
| [`development-rules.md`](./development-rules.md) | 작업 절차, 책임 설계, 테스트, 코드 스타일과 반복 버그 대응의 현재 기준 |
| [`sprite-asset-format.md`](./sprite-asset-format.md) | PixelLab·SpriteCook 원본을 여러 PNG atlas와 animation manifest로 정규화하는 교환 형식과 AI 작업 진입점 |
| [`environment-asset-format.md`](./environment-asset-format.md) | 기업도시 배경·충돌 정렬 지형·비충돌 장식의 다중 PNG atlas 교환 형식과 component별 fallback 규약 |
| [`tech-stack.md`](./tech-stack.md) | 언어, 런타임, 렌더링, 서버와 도구 선택 기준 |
| [`reusable-game-resources.md`](./reusable-game-resources.md) | 다른 게임에서도 재사용할 수 있는 기반 모듈과 공개 진입점 |

## 멀티플레이

| 문서 | 역할 |
| --- | --- |
| [`multiplayer-synchronization.md`](./multiplayer-synchronization.md) | **현재 동기화 방식의 유일한 기준.** 상단 요약과 권한 분리, claim, 보간, 수렴, 복구와 구현 계약을 함께 관리 |
| [`client-first-network-feel.md`](./client-first-network-feel.md) | 클라이언트 체감 우선 구조로 전환할 때 사용한 계획과 점검 기록. 현재 규칙이 충돌하면 동기화 기준 문서가 우선 |
| [`two-device-playtest-protocol.md`](./two-device-playtest-protocol.md) | PC·모바일 등 실제 두 기기에서 협동 동기화를 검증하는 메인 시나리오와 기록 양식 |
| [`multiplayer-sharing.md`](./multiplayer-sharing.md) | 로컬 게임 서버, 임시 외부 공유와 GitHub Pages 연결·배포 절차 |

## 실행, 배포와 버전

| 문서 | 역할 |
| --- | --- |
| [`dev-environment-setup.md`](./dev-environment-setup.md) | 요구 사항, 실행 명령, 검증과 문제 해결 절차 |
| [`version-management.md`](./version-management.md) | 앱·서버 버전 원본, 화면 노출, 필수 변경·완료 절차와 캐시 정책 |
| [`pwa-auto-update.md`](./pwa-auto-update.md) | 서비스 워커 기반 최신 버전 확인, 자동 업데이트와 데이터 보존 정책 |

## 회의 기록

| 문서 | 역할 |
| --- | --- |
| [`meetings/README.md`](./meetings/README.md) | Discord 회의록 생성 위치와 공개 저장소 게시 조건 |

회의 기록은 결정의 근거 자료다. 회의에서 확정된 현재 제품·아키텍처 규칙은 해당 기준 문서와 [`SESSION-HANDOFF.md`](../SESSION-HANDOFF.md)에 반영한 뒤 사용한다.

## 문서 관리 원칙

- 한 주제에는 현재 기준 문서를 하나만 둔다. 요약과 상세 규약이 모두 필요하면 같은 문서 안에서 관리한다.
- `SESSION-HANDOFF.md`에는 현재 결론과 기준 문서 위치만 남기고 상세 규칙을 복제하지 않는다.
- 새 문서를 추가하거나 역할을 변경하면 이 인덱스의 분류와 설명도 같은 작업에서 갱신한다.
- 최신 사용자 결정과 기존 문서가 충돌하면 최신 결정을 기준 문서에 반영하고 대체된 내용은 [`decision-history.md`](./decision-history.md)로 이동한다.
