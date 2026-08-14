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
| [`game-hackathon-planning.md`](./game-hackathon-planning.md) | 제품 방향과 핵심 경험 |
| [`development-schedule.md`](./development-schedule.md) | 역할별 병렬 작업, 필수 선행 관계와 제출 일정 |
| [`implementation-roadmap.md`](./implementation-roadmap.md) | 구현 현황과 개발 우선순위 |
| [`sector-01-world-structure-plan.md`](./sector-01-world-structure-plan.md) | 하나의 연속 월드 안에서 Sector 01 진행 영역을 연결하는 기획·구현 계획 |
| [`sector-timer-and-boss-flow.md`](./sector-timer-and-boss-flow.md) | 섹터 일반 타이머·상승 붕괴·최소 관전·보스 타이머 전환 기준 |
| [`decision-history.md`](./decision-history.md) | 대체되거나 완료된 결정 이력 |

## 아키텍처와 개발 규칙

| 문서 | 역할 |
| --- | --- |
| [`architecture.md`](./architecture.md) | 모듈 구조와 책임 경계 |
| [`development-rules.md`](./development-rules.md) | 공통 개발·검증·Git 규칙 |
| [`documentation-rules.md`](./documentation-rules.md) | 문서 작성과 관리 규칙 |
| [`graphics-asset-guide.md`](./graphics-asset-guide.md) | 그래픽 자산 공통 작업 안내 |
| [`pixel-graphics-design-guide.md`](./pixel-graphics-design-guide.md) | 픽셀 자산의 제작 크기, 타일 격자와 화면 위계 |
| [`sprite-asset-format.md`](./sprite-asset-format.md) | 캐릭터 스프라이트 교환 형식 |
| [`environment-asset-format.md`](./environment-asset-format.md) | 환경 자산 교환 형식 |
| [`audio-asset-guide.md`](./audio-asset-guide.md) | 오디오 작업자의 제작·인계 안내 |
| [`audio-asset-format.md`](./audio-asset-format.md) | 오디오 package·manifest 교환 형식 |
| [`tech-stack.md`](./tech-stack.md) | 기술 스택 선택 기준 |
| [`reusable-game-resources.md`](./reusable-game-resources.md) | 재사용 가능한 기반 모듈 인덱스 |

## 멀티플레이

| 문서 | 역할 |
| --- | --- |
| [`multiplayer-synchronization.md`](./multiplayer-synchronization.md) | **현재 기준.** 멀티 권한과 동기화 계약 |
| [`client-first-network-feel.md`](./client-first-network-feel.md) | 클라이언트 우선 구조 전환 기록 |
| [`two-device-playtest-protocol.md`](./two-device-playtest-protocol.md) | 실제 두 기기 검증 절차 |
| [`multiplayer-sharing.md`](./multiplayer-sharing.md) | 게임 서버 공유와 Pages 배포 절차 |

## 실행, 배포와 버전

| 문서 | 역할 |
| --- | --- |
| [`dev-environment-setup.md`](./dev-environment-setup.md) | 로컬 실행과 문제 해결 |
| [`version-management.md`](./version-management.md) | 버전 관리와 배포 완료 절차 |
| [`pwa-auto-update.md`](./pwa-auto-update.md) | PWA 자동 업데이트 정책 |

## 회의 기록

| 문서 | 역할 |
| --- | --- |
| [`meetings/README.md`](./meetings/README.md) | Discord 회의록 작성과 공개 조건 |

## 작업자별 문서

| 문서 | 역할 |
| --- | --- |
| [`bsh/scenario-skeleton-v0.1.html`](./bsh/scenario-skeleton-v0.1.html) | `bsh` 시나리오 발표 자료 |
| [`bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`](./bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md) | 현재 Runtime을 확인한 뒤 일관된 Scenario Art Reference를 생성·검수하는 공통 규격 |
| [`bsh/scenario/1/README.md`](./bsh/scenario/1/README.md) | `bsh` Sector 01 공용 배경 아트 레퍼런스와 Stage 인덱스 |
| [`bsh/scenario/1/1-1/README.md`](./bsh/scenario/1/1-1/README.md) | `bsh` 기본 Rope 오프닝 Authored Stage(1-1) Blockout·제작 규격 |
| [`bsh/scenario/1/1-2/README.md`](./bsh/scenario/1/1-2/README.md) | `bsh` Airborne Re-Attach Benchmark Stage(1-2) Blockout 후보·제작 규격 |
| [`bsh/scenario/1/1-3/README.md`](./bsh/scenario/1/1-3/README.md) | `bsh` Sentry Telegraph·LOS·이동 회피 Stage(1-3) Blockout 후보·제작 규격 |
| [`bsh/scenario/1/1-3/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-3/PRODUCTION-ALIGNMENT.md) | 1-3 Runtime 좌표·Camera·Sentry FSM·Story·Asset 인계 계약 |
| [`bsh/scenario/1/1-4/README.md`](./bsh/scenario/1/1-4/README.md) | `bsh` 첫 Rope Augment 3지선다·Calibration Stage(1-4) Blockout 후보·제작 규격 |
| [`bsh/scenario/1/1-5/README.md`](./bsh/scenario/1/1-5/README.md) | `bsh` 첫 Build Expression·Augment별 경로 Stage(1-5) Blockout 후보·제작 규격 |
| [`bsh/scenario/1/1-6/README.md`](./bsh/scenario/1/1-6/README.md) | `bsh` 첫 Wind·지속풍과 주기풍 Stage(1-6) Blockout 후보·제작 규격 |
| [`bsh/scenario/1/1-7/README.md`](./bsh/scenario/1/1-7/README.md) | `bsh` Rope·Augment·Wind·Sentry 첫 복합 Stage(1-7) Blockout 후보·제작 규격 |
| [`bsh/scenario/1/1-8/README.md`](./bsh/scenario/1/1-8/README.md) | `bsh` Sector 1 일반 구간 최종 종합·Containment Gate·Boss 전환 후보 Stage(1-8) Blockout 제작 규격 |
| [`bsh/scenario/2/README.md`](./bsh/scenario/2/README.md) | `bsh` Sector 02 Worker District 마스터플랜(2-1~2-8 개요) |
| [`bsh/scenario/2/2-1/README.md`](./bsh/scenario/2/2-1/README.md) | `bsh` Worker District 첫 저압 전환 Stage(2-1) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-2/README.md`](./bsh/scenario/2/2-2/README.md) | `bsh` 첫 Patrol Drone·Moving Threat Stage(2-2) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-3/README.md`](./bsh/scenario/2/2-3/README.md) | `bsh` 첫 Rope Specialization 선택 Rest/Reward Stage(2-3) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-4/README.md`](./bsh/scenario/2/2-4/README.md) | `bsh` Sector 02 첫 본격 Multi-Route·Patrol Drone Stage(2-4) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-5/README.md`](./bsh/scenario/2/2-5/README.md) | `bsh` Evacuation Story Pressure·Multi-Route Stage(2-5) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-6/README.md`](./bsh/scenario/2/2-6/README.md) | `bsh` Enemy 없는 Relief·주거 규모 Reveal Stage(2-6) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-7/README.md`](./bsh/scenario/2/2-7/README.md) | `bsh` 2 Patrol Drone 순차·Build Synthesis·TRANSFER SUSPENDED 공개 Stage(2-7) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-8/README.md`](./bsh/scenario/2/2-8/README.md) | `bsh` Sector 02 Finale·Group A/B/C Transfer 결과 공개 Stage(2-8) Blockout 후보·제작 규격 |
| [`bsh/scenario/3/README.md`](./bsh/scenario/3/README.md) | `bsh` Sector 03 Commercial District 마스터플랜(3-1~3-8 개요, HYPOTHESIS) |
| [`bsh/scenario/3/3-1/README.md`](./bsh/scenario/3/3-1/README.md) | `bsh` Worker→Commercial District 저압 전환 Stage(3-1) Blockout 후보·제작 규격 |
| [`bsh/scenario/3/3-2/README.md`](./bsh/scenario/3/3-2/README.md) | `bsh` 첫 Access Scan Field(Scanner) Stage(3-2) Blockout 후보·제작 규격, 구현 의존성 명세 포함 |
| [`bsh/scenario/3/3-3/README.md`](./bsh/scenario/3/3-3/README.md) | `bsh` Scanner+Patrol Drone 첫 결합 Stage(3-3) Blockout 후보·제작 규격, Runtime 교차검증 포함 |
| [`bsh/scenario/3/3-4/README.md`](./bsh/scenario/3/3-4/README.md) | `bsh` Public/Service 첫 Multi-Route 분기 Stage(3-4) Blockout 후보·제작 규격, Runtime 교차검증 포함 |
| [`bsh/scenario/3/3-5/README.md`](./bsh/scenario/3/3-5/README.md) | `bsh` Rest·Build Diagnostic Stage(3-5) Blockout 후보·제작 규격, Growth Gate HOLD 근거와 Runtime 교차검증 포함 |
