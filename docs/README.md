# 프로젝트 문서 인덱스

이 문서는 `docs/` 아래 문서의 역할과 읽는 순서를 안내한다. 같은 주제를 다루는 문서가 있으면 아래에 표시한 **현재 기준 문서**가 우선한다. 저장소 루트의 [`SESSION-HANDOFF.md`](../SESSION-HANDOFF.md)는 아직 기준 문서에 흡수되지 않은 항목만 제공하며, 현재 구현 순서와 시나리오 상태는 아래 기준 문서에서 직접 확인한다.

## 빠른 시작

처음 프로젝트를 파악할 때는 다음 순서로 읽는다.

1. [`game-hackathon-planning.md`](./game-hackathon-planning.md) — 게임의 목표와 핵심 경험
2. [`implementation-roadmap.md`](./implementation-roadmap.md) — 현재 구현 상태와 다음 개발 순서
3. [`scenario-development-integration.md`](./scenario-development-integration.md) — 시나리오 문서와 Runtime의 최근 통합 현황
4. [`architecture.md`](./architecture.md) — 코드 구조와 객체 책임
5. [`development-rules.md`](./development-rules.md) — 모든 개발 작업에 적용하는 규칙
6. [`multiplayer-synchronization.md`](./multiplayer-synchronization.md) — 현재 멀티플레이 동기화 방식
7. [`dev-environment-setup.md`](./dev-environment-setup.md) — 로컬 실행과 검증 방법

## 제품과 기획

| 문서 | 역할 |
| --- | --- |
| [`game-hackathon-planning.md`](./game-hackathon-planning.md) | 제품 방향과 핵심 경험 |
| [`development-schedule.md`](./development-schedule.md) | 역할별 병렬 작업, 필수 선행 관계와 제출 일정 |
| [`implementation-roadmap.md`](./implementation-roadmap.md) | 구현 현황과 개발 우선순위 |
| [`augment-v1.md`](./augment-v1.md) | 0.26.0 증강 22장·선택·Action·멀티 피해 계약 |
| [`enemy-density-composition.md`](./enemy-density-composition.md) | 0.32.0 Sector 01~03 authored slot 밀도·결정적 적 조합 계약 |
| [`scenario-development-integration.md`](./scenario-development-integration.md) | 상세 Stage 목록, authored Runtime 연결 상태, 차단 요소와 마지막 확인 근거 |
| [`sector-timer-and-boss-flow.md`](./sector-timer-and-boss-flow.md) | 섹터 `60/+10/cap60` Timer·Purge 240px/s·topology HOLD·보스 분리 기준 |
| [`design-decision-requests.md`](./design-decision-requests.md) | P1~P5 기획 결정의 확정 답변과 구현 상태 추적 |
| [`design-decision-resolution-package.md`](./design-decision-resolution-package.md) | Boss·Timer·NPC·Ending의 구현 가능한 통합 기획 계약 |
| [`decision-history.md`](./decision-history.md) | 대체되거나 완료된 결정 이력 |

## 아키텍처와 개발 규칙

| 문서 | 역할 |
| --- | --- |
| [`architecture.md`](./architecture.md) | 모듈 구조와 책임 경계 |
| [`superpowers/specs/2026-08-19-map-editor-v2-foundation-design.md`](./superpowers/specs/2026-08-19-map-editor-v2-foundation-design.md) | 맵 에디터 v2 저작·생성·Stage cutover 기반 설계 |
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

Stage README와 과거 제작 자료에는 0.26.0 이전 Foundation·Impulse·Relay·Shear 아이디어가 authored history로 남아 있을 수 있다. 현재 Runtime 효과와 멀티 claim 권위는 [`augment-v1.md`](./augment-v1.md)와 [`multiplayer-synchronization.md`](./multiplayer-synchronization.md)이며, legacy 이름을 새 구현 입력이나 필수 Route 조건으로 사용하지 않는다.

| 문서 | 역할 |
| --- | --- |
| [`bsh/scenario-skeleton-v0.1.html`](./bsh/scenario-skeleton-v0.1.html) | `bsh` 시나리오 발표 자료 |
| [`bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`](./bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md) | 현재 Runtime을 확인한 뒤 일관된 Scenario Art Reference를 생성·검수하는 공통 규격 |
| [`bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md`](./bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md) | Stage별 `AREA-SPEC.json`(구현 계약) 스키마·Local ID·preset·검증 규칙을 정의하는 공통 규격 |
| [`bsh/scenario/AREA-SPEC-TEMPLATE.json`](./bsh/scenario/AREA-SPEC-TEMPLATE.json) | `AREA-SPEC.json` 작성용 template — 실제 Stage로 집계되지 않음 |
| [`bsh/scenario/1/README.md`](./bsh/scenario/1/README.md) | `bsh` Sector 01 공용 배경 아트 레퍼런스와 Stage 인덱스 |
| [`bsh/scenario/1/STAGE-SCALE-UNIQUENESS-GATE-REV1.md`](./bsh/scenario/1/STAGE-SCALE-UNIQUENESS-GATE-REV1.md) | `bsh` Stage 규모/고유성 승인 게이트 프로세스 규칙(DESIGN LOCKED) — bounds 산출 순서, Map similarity, Obstacle function, Length/pacing, Runtime check |
| [`bsh/scenario/1/1-1/README.md`](./bsh/scenario/1/1-1/README.md) | `bsh` 기본 Rope 오프닝 Authored Stage(1-1) Blockout·제작 규격, REV 8.0 |
| [`bsh/scenario/1/1-1/AREA-SPEC.json`](./bsh/scenario/1/1-1/AREA-SPEC.json) | 1-1 구현 계약(area-spec-v1), REV 8.0 — Local ID·Route·Recovery·Acceptance Tests |
| [`bsh/scenario/1/1-1/DIRECTION-SPEC.json`](./bsh/scenario/1/1-1/DIRECTION-SPEC.json) | 1-1 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/1/1-1/MAP-PREVIEW.html`](./bsh/scenario/1/1-1/MAP-PREVIEW.html) | 1-1 승인 Map 시각화 |
| [`bsh/scenario/1/1-1/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/1/1-1/STORY-DIRECTION-PREVIEW.html) | 1-1 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/1/1-1/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-1/PRODUCTION-ALIGNMENT.md) | 1-1 Runtime 좌표·Camera·Story·Asset 인계 계약 |
| [`bsh/scenario/1/1-1/RUNTIME-HANDOFF.md`](./bsh/scenario/1/1-1/RUNTIME-HANDOFF.md) | 1-1 구현 delta 인계 |
| [`bsh/scenario/1/1-1/VALIDATION.md`](./bsh/scenario/1/1-1/VALIDATION.md) | 1-1 acceptance checklist |
| [`bsh/scenario/1/1-1/ASSET-REQUIREMENTS.md`](./bsh/scenario/1/1-1/ASSET-REQUIREMENTS.md) | 1-1 art/audio/UI 요구사항 |
| [`bsh/scenario/1/1-1/MANIFEST.md`](./bsh/scenario/1/1-1/MANIFEST.md) | 1-1 REV8.0 패키지 파일 목록·권위 |
| [`bsh/scenario/1/1-2/README.md`](./bsh/scenario/1/1-2/README.md) | `bsh` Airborne Re-Attach Benchmark Stage(1-2) Blockout·제작 규격, REV 8.0 |
| [`bsh/scenario/1/1-2/AREA-SPEC.json`](./bsh/scenario/1/1-2/AREA-SPEC.json) | 1-2 구현 계약(area-spec-v1), REV 8.0 |
| [`bsh/scenario/1/1-2/DIRECTION-SPEC.json`](./bsh/scenario/1/1-2/DIRECTION-SPEC.json) | 1-2 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/1/1-2/MAP-PREVIEW.html`](./bsh/scenario/1/1-2/MAP-PREVIEW.html) | 1-2 승인 Map 시각화 |
| [`bsh/scenario/1/1-2/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/1/1-2/STORY-DIRECTION-PREVIEW.html) | 1-2 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/1/1-2/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-2/PRODUCTION-ALIGNMENT.md) | 1-2 Runtime 좌표·Camera·Story·Asset 인계 계약, REV 8.0 — geometry 구현 완료 |
| [`bsh/scenario/1/1-2/RUNTIME-HANDOFF.md`](./bsh/scenario/1/1-2/RUNTIME-HANDOFF.md) | 1-2 구현 delta 인계 |
| [`bsh/scenario/1/1-2/VALIDATION.md`](./bsh/scenario/1/1-2/VALIDATION.md) | 1-2 acceptance checklist |
| [`bsh/scenario/1/1-2/ASSET-REQUIREMENTS.md`](./bsh/scenario/1/1-2/ASSET-REQUIREMENTS.md) | 1-2 art/audio/UI 요구사항 |
| [`bsh/scenario/1/1-2/MANIFEST.md`](./bsh/scenario/1/1-2/MANIFEST.md) | 1-2 REV8.0 패키지 파일 목록·권위 |
| [`bsh/scenario/1/1-3/README.md`](./bsh/scenario/1/1-3/README.md) | `bsh` Sentry Telegraph·LOS·이동 회피 Stage(1-3) Blockout·제작 규격, REV 8.0 |
| [`bsh/scenario/1/1-3/AREA-SPEC.json`](./bsh/scenario/1/1-3/AREA-SPEC.json) | 1-3 구현 계약(area-spec-v1), REV 8.0 |
| [`bsh/scenario/1/1-3/DIRECTION-SPEC.json`](./bsh/scenario/1/1-3/DIRECTION-SPEC.json) | 1-3 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/1/1-3/MAP-PREVIEW.html`](./bsh/scenario/1/1-3/MAP-PREVIEW.html) | 1-3 승인 Map 시각화 |
| [`bsh/scenario/1/1-3/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/1/1-3/STORY-DIRECTION-PREVIEW.html) | 1-3 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/1/1-3/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-3/PRODUCTION-ALIGNMENT.md) | 1-3 Runtime 좌표·Camera·Sentry FSM·Story·Asset 인계 계약, REV 8.0 — Runtime 구현 대기 |
| [`bsh/scenario/1/1-3/RUNTIME-HANDOFF.md`](./bsh/scenario/1/1-3/RUNTIME-HANDOFF.md) | 1-3 구현 delta 인계 |
| [`bsh/scenario/1/1-3/VALIDATION.md`](./bsh/scenario/1/1-3/VALIDATION.md) | 1-3 acceptance checklist |
| [`bsh/scenario/1/1-3/ASSET-REQUIREMENTS.md`](./bsh/scenario/1/1-3/ASSET-REQUIREMENTS.md) | 1-3 art/audio/UI 요구사항 |
| [`bsh/scenario/1/1-3/MANIFEST.md`](./bsh/scenario/1/1-3/MANIFEST.md) | 1-3 REV8.0 패키지 파일 목록·권위 |
| [`bsh/scenario/1/1-4/README.md`](./bsh/scenario/1/1-4/README.md) | `bsh` 첫 Rope Augment 3지선다·Calibration Stage(1-4) Blockout 후보·제작 규격, REV 8.1 |
| [`bsh/scenario/1/1-4/AREA-SPEC.json`](./bsh/scenario/1/1-4/AREA-SPEC.json) | 1-4 구현 계약(area-spec-v1), REV 8.1 |
| [`bsh/scenario/1/1-4/CALIBRATION-PROFILES.json`](./bsh/scenario/1/1-4/CALIBRATION-PROFILES.json) | 1-4 12개 첫선택 카드별 calibration profile 정의(전부 계획 단계 NOT_IMPLEMENTED) |
| [`bsh/scenario/1/1-4/DIRECTION-SPEC.json`](./bsh/scenario/1/1-4/DIRECTION-SPEC.json) | 1-4 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/1/1-4/MAP-PREVIEW.html`](./bsh/scenario/1/1-4/MAP-PREVIEW.html) | 1-4 승인 Map 시각화 |
| [`bsh/scenario/1/1-4/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/1/1-4/STORY-DIRECTION-PREVIEW.html) | 1-4 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/1/1-4/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-4/PRODUCTION-ALIGNMENT.md) | 1-4 Runtime 좌표·Camera·generic Augment 선택·augment-calibration objective 구현 계약 |
| [`bsh/scenario/1/1-4/RUNTIME-HANDOFF.md`](./bsh/scenario/1/1-4/RUNTIME-HANDOFF.md) | 1-4 구현 delta 인계 |
| [`bsh/scenario/1/1-4/VALIDATION.md`](./bsh/scenario/1/1-4/VALIDATION.md) | 1-4 acceptance checklist |
| [`bsh/scenario/1/1-4/ASSET-REQUIREMENTS.md`](./bsh/scenario/1/1-4/ASSET-REQUIREMENTS.md) | 1-4 art/audio/UI 요구사항 |
| [`bsh/scenario/1/1-4/MANIFEST.md`](./bsh/scenario/1/1-4/MANIFEST.md) | 1-4 REV8.1 패키지 파일 목록·권위 |
| [`bsh/scenario/1/1-5/README.md`](./bsh/scenario/1/1-5/README.md) | `bsh` 첫 Build Expression·Augment별 경로 Stage(1-5) Blockout 후보·제작 규격, REV 8.0 |
| [`bsh/scenario/1/1-5/AREA-SPEC.json`](./bsh/scenario/1/1-5/AREA-SPEC.json) | 1-5 구현 계약(area-spec-v1), REV 8.0 |
| [`bsh/scenario/1/1-5/DIRECTION-SPEC.json`](./bsh/scenario/1/1-5/DIRECTION-SPEC.json) | 1-5 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/1/1-5/MAP-PREVIEW.html`](./bsh/scenario/1/1-5/MAP-PREVIEW.html) | 1-5 승인 Map 시각화 |
| [`bsh/scenario/1/1-5/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/1/1-5/STORY-DIRECTION-PREVIEW.html) | 1-5 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/1/1-5/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-5/PRODUCTION-ALIGNMENT.md) | 1-5 Runtime 좌표 대조·Camera/Story 미구현 명시 계약 |
| [`bsh/scenario/1/1-5/RUNTIME-HANDOFF.md`](./bsh/scenario/1/1-5/RUNTIME-HANDOFF.md) | 1-5 구현 delta 인계 |
| [`bsh/scenario/1/1-5/VALIDATION.md`](./bsh/scenario/1/1-5/VALIDATION.md) | 1-5 acceptance checklist |
| [`bsh/scenario/1/1-5/ASSET-REQUIREMENTS.md`](./bsh/scenario/1/1-5/ASSET-REQUIREMENTS.md) | 1-5 art/audio/UI 요구사항 |
| [`bsh/scenario/1/1-5/MANIFEST.md`](./bsh/scenario/1/1-5/MANIFEST.md) | 1-5 REV8.0 패키지 파일 목록·권위 |
| [`bsh/scenario/1/1-6/README.md`](./bsh/scenario/1/1-6/README.md) | `bsh` 첫 Wind·지속풍과 주기풍 Stage(1-6) Blockout 후보·제작 규격, REV 8.0 |
| [`bsh/scenario/1/1-6/AREA-SPEC.json`](./bsh/scenario/1/1-6/AREA-SPEC.json) | 1-6 구현 계약(area-spec-v1), REV 8.0 |
| [`bsh/scenario/1/1-6/DIRECTION-SPEC.json`](./bsh/scenario/1/1-6/DIRECTION-SPEC.json) | 1-6 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/1/1-6/MAP-PREVIEW.html`](./bsh/scenario/1/1-6/MAP-PREVIEW.html) | 1-6 승인 Map 시각화 |
| [`bsh/scenario/1/1-6/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/1/1-6/STORY-DIRECTION-PREVIEW.html) | 1-6 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/1/1-6/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-6/PRODUCTION-ALIGNMENT.md) | 1-6 Wind 물리 구현 확인·Runtime 좌표 대조·Camera/Story 미구현 명시 계약 |
| [`bsh/scenario/1/1-6/RUNTIME-HANDOFF.md`](./bsh/scenario/1/1-6/RUNTIME-HANDOFF.md) | 1-6 구현 delta 인계 |
| [`bsh/scenario/1/1-6/VALIDATION.md`](./bsh/scenario/1/1-6/VALIDATION.md) | 1-6 acceptance checklist |
| [`bsh/scenario/1/1-6/ASSET-REQUIREMENTS.md`](./bsh/scenario/1/1-6/ASSET-REQUIREMENTS.md) | 1-6 art/audio/UI 요구사항 |
| [`bsh/scenario/1/1-6/MANIFEST.md`](./bsh/scenario/1/1-6/MANIFEST.md) | 1-6 REV8.0 패키지 파일 목록·권위 |
| [`bsh/scenario/1/1-7/README.md`](./bsh/scenario/1/1-7/README.md) | `bsh` Rope·Augment·Wind·Sentry 첫 복합 Stage(1-7) Blockout 후보·제작 규격, REV 8.0 |
| [`bsh/scenario/1/1-7/AREA-SPEC.json`](./bsh/scenario/1/1-7/AREA-SPEC.json) | 1-7 구현 계약(area-spec-v1), REV 8.0 |
| [`bsh/scenario/1/1-7/DIRECTION-SPEC.json`](./bsh/scenario/1/1-7/DIRECTION-SPEC.json) | 1-7 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/1/1-7/MAP-PREVIEW.html`](./bsh/scenario/1/1-7/MAP-PREVIEW.html) | 1-7 승인 Map 시각화 |
| [`bsh/scenario/1/1-7/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/1/1-7/STORY-DIRECTION-PREVIEW.html) | 1-7 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/1/1-7/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-7/PRODUCTION-ALIGNMENT.md) | 1-7 Runtime 좌표 대조·Wind/Sentry 중첩 구현 확인·Camera/Story 미구현 명시 계약 |
| [`bsh/scenario/1/1-7/RUNTIME-HANDOFF.md`](./bsh/scenario/1/1-7/RUNTIME-HANDOFF.md) | 1-7 구현 delta 인계 |
| [`bsh/scenario/1/1-7/VALIDATION.md`](./bsh/scenario/1/1-7/VALIDATION.md) | 1-7 acceptance checklist |
| [`bsh/scenario/1/1-7/ASSET-REQUIREMENTS.md`](./bsh/scenario/1/1-7/ASSET-REQUIREMENTS.md) | 1-7 art/audio/UI 요구사항 |
| [`bsh/scenario/1/1-7/MANIFEST.md`](./bsh/scenario/1/1-7/MANIFEST.md) | 1-7 REV8.0 패키지 파일 목록·권위 |
| [`bsh/scenario/1/1-8/README.md`](./bsh/scenario/1/1-8/README.md) | `bsh` Sector 1 일반 구간 최종 종합·Containment Gate·Boss 전환 후보 Stage(1-8) Blockout 제작 규격, REV 8.0 |
| [`bsh/scenario/1/1-8/AREA-SPEC.json`](./bsh/scenario/1/1-8/AREA-SPEC.json) | 1-8 구현 계약(area-spec-v1), REV 8.0 |
| [`bsh/scenario/1/1-8/DIRECTION-SPEC.json`](./bsh/scenario/1/1-8/DIRECTION-SPEC.json) | 1-8 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/1/1-8/MAP-PREVIEW.html`](./bsh/scenario/1/1-8/MAP-PREVIEW.html) | 1-8 승인 Map 시각화 |
| [`bsh/scenario/1/1-8/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/1/1-8/STORY-DIRECTION-PREVIEW.html) | 1-8 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/1/1-8/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/1/1-8/PRODUCTION-ALIGNMENT.md) | 1-8 Runtime 좌표 대조·두 Turret Crossfire 금지 구현 확인·nextAreaId 전환 소유권 감사·Camera/Story 미구현 명시 계약 |
| [`bsh/scenario/1/1-8/RUNTIME-HANDOFF.md`](./bsh/scenario/1/1-8/RUNTIME-HANDOFF.md) | 1-8 구현 delta 인계 |
| [`bsh/scenario/1/1-8/VALIDATION.md`](./bsh/scenario/1/1-8/VALIDATION.md) | 1-8 acceptance checklist |
| [`bsh/scenario/1/1-8/ASSET-REQUIREMENTS.md`](./bsh/scenario/1/1-8/ASSET-REQUIREMENTS.md) | 1-8 art/audio/UI 요구사항 |
| [`bsh/scenario/1/1-8/MANIFEST.md`](./bsh/scenario/1/1-8/MANIFEST.md) | 1-8 REV8.0 패키지 파일 목록·권위 |
| [`bsh/scenario/1/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md`](./bsh/scenario/1/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md) | `bsh` 1-5~1-8 Camera Zone·Story Trigger 붙여넣기용 구현 준비 자료(코드 반영은 별도 진행) |
| [`bsh/scenario/2/README.md`](./bsh/scenario/2/README.md) | `bsh` Sector 02 Worker District 마스터플랜(2-1~2-8 개요) |
| [`bsh/scenario/2/2-1/README.md`](./bsh/scenario/2/2-1/README.md) | `bsh` Worker District 첫 저압 전환 Stage(2-1) Blockout 후보·제작 규격, REV8.1 |
| [`bsh/scenario/2/2-1/AREA-SPEC.json`](./bsh/scenario/2/2-1/AREA-SPEC.json) | 2-1 구현 계약(area-spec-v1), REV8.1 — diagonal rowhouse cut-through Route·Recovery·Acceptance Tests |
| [`bsh/scenario/2/2-1/DIRECTION-SPEC.json`](./bsh/scenario/2/2-1/DIRECTION-SPEC.json) | 2-1 연출 계약(`direction-spec-v1`, 미검증 스키마) |
| [`bsh/scenario/2/2-1/MAP-PREVIEW.html`](./bsh/scenario/2/2-1/MAP-PREVIEW.html) | 2-1 승인 Map 시각화 |
| [`bsh/scenario/2/2-1/STORY-DIRECTION-PREVIEW.html`](./bsh/scenario/2/2-1/STORY-DIRECTION-PREVIEW.html) | 2-1 승인 심리/서사/분위기 시각화 |
| [`bsh/scenario/2/2-1/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/2/2-1/PRODUCTION-ALIGNMENT.md) | 2-1 Runtime 좌표·Camera·Story·Asset 인계 계약, REV8.1 구현 완료 |
| [`bsh/scenario/2/2-1/RUNTIME-HANDOFF.md`](./bsh/scenario/2/2-1/RUNTIME-HANDOFF.md) | 2-1 구현 delta 인계(REV8.0 초안 SUPERSEDED 안내 포함) |
| [`bsh/scenario/2/2-1/VALIDATION.md`](./bsh/scenario/2/2-1/VALIDATION.md) | 2-1 acceptance checklist |
| [`bsh/scenario/2/2-1/ASSET-REQUIREMENTS.md`](./bsh/scenario/2/2-1/ASSET-REQUIREMENTS.md) | 2-1 art/audio/UI 요구사항 |
| [`bsh/scenario/2/2-1/MANIFEST.md`](./bsh/scenario/2/2-1/MANIFEST.md) | 2-1 REV8.1 패키지 파일 목록·권위 |
| [`bsh/scenario/2/2-2/README.md`](./bsh/scenario/2/2-2/README.md) | `bsh` 첫 Patrol Drone·Moving Threat Stage(2-2) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-2/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/2/2-2/PRODUCTION-ALIGNMENT.md) | 2-2 Runtime 좌표 대조·Patrol Drone AI 구현 확인·P4 누락 명시 계약 |
| [`bsh/scenario/2/2-3/README.md`](./bsh/scenario/2/2-3/README.md) | `bsh` 첫 Rope Specialization 선택 Rest/Reward Stage(2-3) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-3/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/2/2-3/PRODUCTION-ALIGNMENT.md) | 2-3 Runtime 좌표 대조·interact-choice 완료 Gap 계약 |
| [`bsh/scenario/2/2-4/README.md`](./bsh/scenario/2/2-4/README.md) | `bsh` Sector 02 첫 본격 Multi-Route·Patrol Drone Stage(2-4) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-4/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/2/2-4/PRODUCTION-ALIGNMENT.md) | 2-4 Runtime 좌표 대조·Patrol Drone AI 구현 확인 계약 |
| [`bsh/scenario/2/2-5/README.md`](./bsh/scenario/2/2-5/README.md) | `bsh` Evacuation Story Pressure·Multi-Route Stage(2-5) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-5/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/2/2-5/PRODUCTION-ALIGNMENT.md) | 2-5 Runtime 좌표 대조·Upper Transit Gate 봉쇄 구현 확인 계약 |
| [`bsh/scenario/2/2-6/README.md`](./bsh/scenario/2/2-6/README.md) | `bsh` Enemy 없는 Relief·주거 규모 Reveal Stage(2-6) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-6/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/2/2-6/PRODUCTION-ALIGNMENT.md) | 2-6 Runtime 좌표 대조 계약 |
| [`bsh/scenario/2/2-7/README.md`](./bsh/scenario/2/2-7/README.md) | `bsh` 2 Patrol Drone 순차·Build Synthesis·TRANSFER SUSPENDED 공개 Stage(2-7) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-7/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/2/2-7/PRODUCTION-ALIGNMENT.md) | 2-7 Runtime 좌표 대조·두 Drone Crossfire 비겹침 구현 확인 계약 |
| [`bsh/scenario/2/2-8/README.md`](./bsh/scenario/2/2-8/README.md) | `bsh` Sector 02 Finale·Group A/B/C Transfer 결과 공개 Stage(2-8) Blockout 후보·제작 규격 |
| [`bsh/scenario/2/2-8/PRODUCTION-ALIGNMENT.md`](./bsh/scenario/2/2-8/PRODUCTION-ALIGNMENT.md) | 2-8 Runtime 좌표 대조·Story Reveal cueId 순서 확인·Post-Sector 전환 미확정 명시 계약 |
| [`bsh/scenario/2/STORY-IMPLEMENTATION-HANDOFF.md`](./bsh/scenario/2/STORY-IMPLEMENTATION-HANDOFF.md) | `bsh` Sector 02 Camera Zone 불필요 확인·Story Presentation 공백 3건 붙여넣기용 구현 준비 자료(코드 반영은 별도 진행) |
| [`bsh/scenario/3/README.md`](./bsh/scenario/3/README.md) | `bsh` Sector 03 Central Exchange Complex 마스터플랜 REV 2.0(공간 정체·Stage 명칭·Story 재작성 통합, 3-1~3-8 개요, 개별 Stage 문서 명칭 마이그레이션 대기 — Approved Blockout/Camera Shot 확정만 남음) |
| [`bsh/scenario/3/3-1/README.md`](./bsh/scenario/3/3-1/README.md) | `bsh` Worker→Commercial District 저압 전환 Stage(3-1) Blockout 후보·제작 규격 |
| [`bsh/scenario/3/3-2/README.md`](./bsh/scenario/3/3-2/README.md) | `bsh` 첫 Access Scan Field(Scanner) Stage(3-2) Blockout 후보·제작 규격, 구현 의존성 명세 포함 |
| [`bsh/scenario/3/3-3/README.md`](./bsh/scenario/3/3-3/README.md) | `bsh` Scanner+Patrol Drone 첫 결합 Stage(3-3) Blockout 후보·제작 규격, Runtime 교차검증 포함 |
| [`bsh/scenario/3/3-4/README.md`](./bsh/scenario/3/3-4/README.md) | `bsh` Public/Service 첫 Multi-Route 분기 Stage(3-4) Blockout 후보·제작 규격, Runtime 교차검증 포함 |
| [`bsh/scenario/3/3-5/README.md`](./bsh/scenario/3/3-5/README.md) | `bsh` Rest·Build Diagnostic Stage(3-5) Blockout 후보·제작 규격, Growth Gate HOLD 근거와 Runtime 교차검증 포함 |
| [`bsh/scenario/3/3-6/README.md`](./bsh/scenario/3/3-6/README.md) | `bsh` 첫 대형 Atrium Rope 표현·Security Timing Stage(3-6) Blockout 후보·제작 규격, Runtime 교차검증 포함 |
| [`bsh/scenario/3/3-7/README.md`](./bsh/scenario/3/3-7/README.md) | `bsh` Access Tier·Priority Route Story Pressure·3-Route 종합 Stage(3-7) Blockout 후보·제작 규격, Runtime 교차검증 포함 |
| [`bsh/scenario/3/3-8/README.md`](./bsh/scenario/3/3-8/README.md) | `bsh` Sector 03 일반 구간 Finale·2-Drone 병렬 Route·Evacuation/Access Archive 병치 Stage(3-8) Blockout 후보·제작 규격, Boss 전환 미확정 명시 포함 |
| [`bsh/scenario/3/INTEGRATION-CROSS-VALIDATION-AUDIT.md`](./bsh/scenario/3/INTEGRATION-CROSS-VALIDATION-AUDIT.md) | `bsh` Sector 03(3-1~3-8) Scenario/Runtime/Story/Multiplayer/Art 통합 교차검증 감사 — Document Integration Patch List(P0~P3) 포함 |
| [`bsh/scenario/3/ACCESS-SCAN-FIELD-RUNTIME-PROTOTYPE-SPEC.md`](./bsh/scenario/3/ACCESS-SCAN-FIELD-RUNTIME-PROTOTYPE-SPEC.md) | `bsh` Sector 03 핵심 의존성 Access Scan Field Runtime Prototype 구현 스펙 — Prediction Clock Parity 위험(delayed owner-motion) 포함 실제 코드 대조 완료 |
| [`bsh/scenario/3/ACCESS-SCAN-FIELD-CODEX-IMPLEMENTATION-HANDOFF.md`](./bsh/scenario/3/ACCESS-SCAN-FIELD-CODEX-IMPLEMENTATION-HANDOFF.md) | `bsh` 위 스펙을 Codex/개발 담당에게 바로 전달할 실행 지시서 — 우선순위(P0A~P6)·완료 조건·보고 형식·복붙용 지시문 포함 |
| [`bsh/scenario/4/README.md`](./bsh/scenario/4/README.md) | `bsh` Sector 04 Transit/Infrastructure 마스터플랜, REV 1.1 — 8/8 상세 Stage 완성·standalone catalog 구현 반영, Cutter Fire opt-in 모델 정합 |
| [`bsh/scenario/4/4-1/README.md`](./bsh/scenario/4/4-1/README.md) | `bsh` Sector 04 첫 Stage(4-1) Blockout 후보·제작 규격, REV 1.1 — Enemy/Threat 없는 순수 Speed Space Reveal. Flow Route `A3→A4` 408.9px는 Mandatory Safe Route가 M1/R3로 우회해 문제 없음을 재검증(FALSE ALARM), shipped catalog와 좌표 일치 확인 |
| [`bsh/scenario/4/4-2/README.md`](./bsh/scenario/4/4-2/README.md) | `bsh` 첫 Rope-Cut(Cutter Fire) Tutorial Stage(4-2) Blockout 후보·제작 규격, REV 1.2 — Hook Flight/Combat Rebalance 반영, Gate 좌표·Build metadata 정정 |
| [`bsh/scenario/4/4-3/README.md`](./bsh/scenario/4/4-3/README.md) | `bsh` 첫 Cutter+Transit Wake 결합 Stage(4-3) Blockout 후보·제작 규격, REV 1.2 — Wind Strength 360을 Sector04 고유 hypothesis로 재분류, 4-1 Drift false alarm 정리, Gate 좌표 정정 |
| [`bsh/scenario/4/4-4/README.md`](./bsh/scenario/4/4-4/README.md) | `bsh` Sector 04 Rest Stage(4-4) Blockout 후보·제작 규격, REV 1.1 — Enemy/Threat 없음, Lower Ascent Feeder 이상징후 첫 Setup(SEGMENTED, ISOLATED 아님), Gate 좌표 정정 |
| [`bsh/scenario/4/4-5/README.md`](./bsh/scenario/4/4-5/README.md) | `bsh` Sector 04 순수 Movement Joy Stage(4-5) Blockout 후보·제작 규격, REV 1.2 — Enemy 없음, Wake-assisted 상승, Wind Strength 재분류·4-1 Drift false alarm 정리 |
| [`bsh/scenario/4/4-6/README.md`](./bsh/scenario/4/4-6/README.md) | `bsh` Rope Line Geometry Combat Stage(4-6) Blockout 후보·제작 규격, REV 1.1 — Cutter Sentry+Patrol Drone 분리 배치, Shear 공격선 활용, Gate 좌표·4-1 Drift false alarm 정리 |
| [`bsh/scenario/4/4-7/README.md`](./bsh/scenario/4/4-7/README.md) | `bsh` Sector 04 Story Pressure Stage(4-7) Blockout 후보·제작 규격, REV 1.2 — Cutter+Wake Synthesis, `LOWER ASCENT FEEDER ISOLATED` 확정 Reveal(인과관계는 미확정 유지), Gate 좌표·4-1 Drift false alarm 정리 |
| [`bsh/scenario/4/4-8/README.md`](./bsh/scenario/4/4-8/README.md) | `bsh` Sector 04 General Finale(4-8) Blockout 후보·제작 규격, REV 1.2 — Cutter+Patrol+Wake Continuous Flow, Upper Trunk/Lower Feeder Status 병치, Wind Strength 재분류·D1 activation 좌표 정정 |
| [`bsh/scenario/4/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md`](./bsh/scenario/4/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md) | `bsh` Sector 04 Camera Zone/Story Presentation 점검·구현 인계 문서 — Camera Zone은 이미 구현 완료, Story ENTRY/POSITION/TRIGGER_CUE 바인딩 코드 반영 지점 정리 |
| [`bsh/scenario/4/INTEGRATION-CROSS-VALIDATION-AUDIT.md`](./bsh/scenario/4/INTEGRATION-CROSS-VALIDATION-AUDIT.md) | `bsh` Sector 04 Master·Stage·Runtime 교차검증 감사 원본 기록 + 재검증 정정 addendum(4-1 reach drift는 실제로 FALSE ALARM이었음을 확인) |
| [`bsh/scenario/5/README.md`](./bsh/scenario/5/README.md) | `bsh` Sector 05 Continuity Control 마스터플랜, REV 3.0 — Sealed Corporate Surface/Service Hardpoint, AEGIS/Jammer/Artillery/Cutter 4대 Special Security, Corporate Authorization 3/3 Story Ladder. 5-1/5-5만 REV 3.x 상세로 동기화, 나머지는 draft 또는 레거시 |
| [`bsh/scenario/5/5-1/README.md`](./bsh/scenario/5/5-1/README.md) | `bsh` Sector 05 Stage(5-1) CONTINUITY RECEPTION Blockout 후보·제작 규격, REV 3.1 — Enemy 없음, Sealed Corporate Surface/Service Hardpoint 공간 규칙 |
| [`bsh/scenario/5/5-1/AREA-SPEC.json`](./bsh/scenario/5/5-1/AREA-SPEC.json) | 5-1 구현 계약(area-spec-v1) — Local ID·Route·Recovery·Sealed Corporate Surface newSystems·Acceptance Tests |
| [`bsh/scenario/5/5-1/RUNTIME-HANDOFF.md`](./bsh/scenario/5/5-1/RUNTIME-HANDOFF.md) | 5-1 Runtime 구현 인계 — Sealed Corporate Surface preset, Service Hardpoint 계약, 필수 테스트 목록 |
| [`bsh/scenario/5/5-1/VALIDATION.md`](./bsh/scenario/5/5-1/VALIDATION.md) | 5-1 정적 검증 근거 — Launch sample별 Base Rope attach margin, 남은 Dynamic/Blocked 검증 항목 |
| [`bsh/scenario/5/5-2/README.md`](./bsh/scenario/5/5-2/README.md) | `bsh` Sparse Hardpoint + Patrol Entry Timing Stage(5-2) Blockout 후보·제작 규격, 좌표 검증 완료 |
| [`bsh/scenario/5/5-3/README.md`](./bsh/scenario/5/5-3/README.md) | `bsh` Cutter Recovery-Planning Stage(5-3) Blockout 후보·제작 규격 — Cutter Fire opt-in(`cutter-fire`) 모델 정합, 좌표 검증 완료 |
| [`bsh/scenario/5/5-4/README.md`](./bsh/scenario/5/5-4/README.md) | `bsh` Sector 05 Rest Stage(5-4) Blockout 후보·제작 규격 — Enemy 없음, `GRID CAPACITY CRITICAL DEFICIT` 첫 단서, 좌표 검증 완료 |
| [`bsh/scenario/5/5-5/README.md`](./bsh/scenario/5/5-5/README.md) | `bsh` Sector 05 Stage(5-5) PRIORITY ROUTING HALL Blockout 후보·제작 규격, REV 3.8 — Jammer+AEGIS 결합, `PRIORITY DIRECTIVE 2/3` |
| [`bsh/scenario/5/5-5/AREA-SPEC.json`](./bsh/scenario/5/5-5/AREA-SPEC.json) | 5-5 구현 계약(area-spec-v1) — Local ID·Route·Recovery·Jammer/AEGIS/Sentry newSystems·Acceptance Tests |
| [`bsh/scenario/5/5-5/RUNTIME-HANDOFF.md`](./bsh/scenario/5/5-5/RUNTIME-HANDOFF.md) | 5-5 Runtime 구현 인계 — Hardpoint Jammer 계약, Priority Directive 획득 흐름, 필수 테스트 목록 |
| [`bsh/scenario/5/5-5/VALIDATION.md`](./bsh/scenario/5/5-5/VALIDATION.md) | 5-5 정적 검증 근거 — Launch sample별 Base Rope attach margin, 남은 Dynamic/Blocked 검증 항목 |
| [`bsh/scenario/5/5-6/README.md`](./bsh/scenario/5/5-6/README.md) | `bsh` Body-shot vs Rope-cut Route Choice Stage(5-6) Blockout 후보·제작 규격 — Cutter Fire opt-in 모델 정합, `LOWER ASCENT ROUTING SUSPENSION AUTHORIZED` 첫 공개, 좌표 검증 완료 |
| [`bsh/scenario/5/5-7/README.md`](./bsh/scenario/5/5-7/README.md) | `bsh` Story Consequence Peak Stage(5-7) Blockout 후보·제작 규격 — `LOWER SECTORS EVACUATION STATUS SUSPENDED` 명시, Sector04 A4/5-3·5-6 Cutter wording alignment 항목 RESOLVED 반영, 좌표 검증 완료 |
| [`bsh/scenario/5/5-8/README.md`](./bsh/scenario/5/5-8/README.md) | `bsh` Sector 05 General Finale(5-8) Blockout 후보·제작 규격, REV 1.1 — 5-5와의 Geometry 반복 문제로 전면 재설계, WHO/WHY 조직 책임 확정·Rooftop Pad 03 탈출 목표, 좌표 검증 완료 |
| [`bsh/scenario/6/README.md`](./bsh/scenario/6/README.md) | `bsh` Sector 06 Rooftop/Evacuation 마스터플랜 — Open Sky/Structural Islands 공간 정체성, 기존 Wind·Sentry·Scanner·Patrol·Cutter 시스템 총복습(신규 시스템 없음), Rooftop Pad 03 도달·ACCESS DENIED·별도 Final Security Encounter 개념 |
| [`bsh/scenario/6/6-1/README.md`](./bsh/scenario/6/6-1/README.md) | `bsh` Sector 06 첫 Stage(6-1) Blockout 후보·제작 규격 — Enemy/Wind 없는 순수 Open Sky 공간 문법 도입, 좌표 검증 완료 |
| [`bsh/scenario/6/6-2/README.md`](./bsh/scenario/6/6-2/README.md) | `bsh` Known Wind Mastery Recall Stage(6-2) Blockout 후보·제작 규격 — 1-6 Fan A 현재 shipped 수치(continuous/500/falloff80) 재사용 확인, 좌표·Wind membership 검증 완료 |
| [`bsh/scenario/6/6-3/README.md`](./bsh/scenario/6/6-3/README.md) | `bsh` Standard Sentry Mastery Recall Stage(6-3) Blockout 후보·제작 규격 — Cover 없는 Open-Sky body-path 회피, 실제 1-3 Sentry 좌표·activation·rules와 `cover-ends-los`/`cutter-fire` 판정식 대조 완료, 좌표 검증 완료 |
| [`bsh/scenario/6/6-4/README.md`](./bsh/scenario/6/6-4/README.md) | `bsh` Sector 06 Rest/Goal Confirmation Stage(6-4) Blockout 후보·제작 규격 — Enemy·Wind·Scanner 없는 수평 Shelter 이동, Pad 03·Maintenance Shuttle 첫 직접 시각 확인, Safe/Flow 거리 검증 완료 |
| [`bsh/scenario/6/6-5/README.md`](./bsh/scenario/6/6-5/README.md) | `bsh` Access Scan Mastery Recall Stage(6-5) Blockout 후보·제작 규격 — Enemy 없는 controlled Hardpoint 3개 단일 timing band, 현재 Scanner phase 계약 대조 및 Safe/Flow 거리 검증 완료 |
| [`bsh/scenario/6/6-6/README.md`](./bsh/scenario/6/6-6/README.md) | `bsh` Patrol Mastery Recall Stage(6-6) Blockout 후보·제작 규격 — Open-Sky 대각선 Patrol 진입 시점이 정지 사격 원점을 결정, 현재 Patrol speed/wait 계약 대조 및 Safe/Flow 거리 검증 완료 |
| [`bsh/scenario/6/6-7/README.md`](./bsh/scenario/6/6-7/README.md) | `bsh` Final Cutter Mastery Recall Stage(6-7) Blockout 후보·제작 규격 — Open-Sky Rope Cut 뒤 하부 Catwalk recovery, Cutter opt-in 계약 대조 및 Safe/Flow·recovery 거리 검증 완료 |
| [`bsh/scenario/6/6-8/README.md`](./bsh/scenario/6/6-8/README.md) | `bsh` Sector 06 General Finale(6-8) Blockout 후보·제작 규격 — Enemy·Wind·Scanner·Cutter 없는 순방향 Rope continuity climax, Pad 03 도달·ACCESS DENIED·Final Security content boundary, Safe/Flow·recovery 거리 검증 완료 |
