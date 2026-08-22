# SECTOR 01 — MAINTENANCE

> **CURRENT RUNTIME OVERRIDE — 0.32.0:** 1-1·1-2는 비전투를 유지하고 1-3 이후 authored slot 합계 16기를 사용한다. 1-3·1-6·1-7 Access 구역은 Carrier 포함 3기이며 정확한 pool/보존 계약은 [`../../../enemy-density-composition.md`](../../../enemy-density-composition.md)를 따른다.

*SHARED BACKGROUND ART REFERENCE · REV 1.1*

![Sector 01 Maintenance 배경 레퍼런스](./images/sector-01-background-reference.png)

> 맵·시나리오·이미지·Runtime 수정 시 [Scenario Art 생성 규격](../SCENARIO-ART-GENERATION-STANDARD.md)과 [Sector 01 증강·스토리 통합 기준](./AUGMENT-STORY-INTEGRATION.md)을 함께 적용한다.

## 적용 범위

이 이미지는 `1-1`부터 `1-8`까지 이어지는 Sector 01 일반 구간의 공용 배경 아트 레퍼런스다. 전체 구간이 하나의 거대한 지하 정비 시설 안에 있다는 인상, 색과 조명, 공간의 깊이, 구조물 밀도를 정하는 기준으로 사용한다.

## MAP-PREVIEW 핵심 흐름 권위

- 각 Stage `MAP-PREVIEW.html`의 첫 `class="route"` 또는 `class="flow"` SVG path endpoint 순서가 Sector 01 authored core의 핵심 이동 흐름이다.
- Runtime `routePoints`와 seamless compiled `world.route`는 이 경로를 중간 지점까지 그대로 보존한다. Collision·Enemy·Wind는 AREA-SPEC/Area Catalog가 소유하고 HTML을 Runtime collision이나 통이미지 배경으로 사용하지 않는다.
- 4,800px Sector city wing은 outside-core 공간으로 유지하되 MAP-PREVIEW의 교차·Annex·drop/relaunch·cross-flow·S-curve·counterflow 경로를 대체하지 않는다.

이미지 속 플랫폼이나 배관 위치를 그대로 레벨 지형으로 복제하지 않는다. 실제 이동 경로, 충돌, Anchor, Enemy, Wind, Recovery 배치는 각 Stage README의 Blockout 규격을 우선한다.

## 핵심 시각 방향

- Navy·Charcoal을 바탕으로 거대한 배관, 환풍기, 철골, Catwalk, 케이블이 겹친 산업 정비 시설을 만든다.
- 가까운 구조물은 거의 검은 실루엣, 플레이 공간은 어두운 청회색, 먼 구조물은 푸른 안개로 분리해 전경·중경·원경의 깊이를 만든다.
- 중앙에는 로프 궤적과 수직 상승을 읽을 수 있는 큰 여백을 남기고, 화면 가장자리의 무거운 구조물이 공간을 감싸게 한다.
- Cyan 설비등은 먼 깊이와 기술 설비를 암시하는 보조광으로 제한한다.
- Orange 경고등은 시설의 위험과 작동 지점을 표시하되 드물게 사용한다.
- 반복되는 대형 Fan과 Pipe는 Sector 01의 시각적 랜드마크로 사용한다.

## 게임플레이 가독성 규칙

- Player 실루엣과 Scarf, Cyan Rope·Anchor, Collision Edge, Red/Orange Telegraph는 항상 배경보다 먼저 읽혀야 한다.
- 배경의 Cyan은 Rope·Anchor보다 어둡고 채도가 낮아야 한다.
- 배경의 Orange/Red 점광원은 Sentry Telegraph나 Projectile의 진행 방향과 겹치지 않게 배치한다.
- 전경 구조물은 화면을 프레이밍할 수 있지만 Player, Anchor 후보, Recovery 발판을 가리면 안 된다.
- Fan, Valve, Cable 같은 장식이 상호작용 가능한 오브젝트처럼 보일 경우 Animation·Light·Collision 언어로 명확히 구분한다.
- Parallax는 깊이를 강화하는 수준으로 제한하고 Rope 조준과 빠른 수직 이동 중 목표 위치가 흔들려 보이지 않게 한다.

## Stage 문서

| Stage | 이름 | 핵심 역할 |
| --- | --- | --- |
| [1-1](./1-1/README.md) · [제작 정렬](./1-1/PRODUCTION-ALIGNMENT.md) | SERVICE SHAFT | 기본 Rope 오프닝 · 구조 정합 C04 Art Reference · 승인 Blockout |
| [1-2](./1-2/README.md) · [제작 정렬](./1-2/PRODUCTION-ALIGNMENT.md) | DOUBLE ANCHOR SHAFT | Airborne Re-Attach · 구조 정합 C02 Art Reference · 승인 Blockout |
| [1-3](./1-3/README.md) · [제작 정렬](./1-3/PRODUCTION-ALIGNMENT.md) | SECURITY CHECK | Sentry Telegraph·LOS · 구조 정합 Route Choice Art Reference · 승인 Blockout |
| [1-4](./1-4/README.md) · [제작 정렬](./1-4/PRODUCTION-ALIGNMENT.md) | MAINTENANCE NODE | 첫 Foundation 선택 · 구조 정합 Node Art Reference · 구현 정렬 |
| [1-5](./1-5/README.md) · [제작 정렬](./1-5/PRODUCTION-ALIGNMENT.md) | AUGMENT TEST BAY | Build Expression · Camera 구현 · 핵심 Story binding 구현 |
| [1-6](./1-6/README.md) · [제작 정렬](./1-6/PRODUCTION-ALIGNMENT.md) | COOLING SHAFT | Wind Shadow·Grounded 감쇠·Falloff·Camera 구현 · 핵심 Story binding 구현 |
| [1-7](./1-7/README.md) · [제작 정렬](./1-7/PRODUCTION-ALIGNMENT.md) | PRESSURE BYPASS | Rope·Build·Wind·Sentry 조합 · Camera와 핵심 Story binding 구현 |
| [1-8](./1-8/README.md) · [제작 정렬](./1-8/PRODUCTION-ALIGNMENT.md) | CONTAINMENT GATE | 일반 구간 최종 종합·Camera와 핵심 Story binding 구현 · Shutdown/정식 Prop 미구현 |

1-1/1-2는 `DIRECTION-SPEC.json`을 공용 compiler가 실행 definition으로 변환하고 coverage validator가 구현 상태를 산출한다. 1-3~1-8의 Camera Zone과 핵심 Story binding은 아직 [Camera/Story Implementation Handoff](./CAMERA-STORY-IMPLEMENTATION-HANDOFF.md)와 legacy `AuthoredStoryPresentation` 경로를 사용하며, 후속 migration 전까지 Area의 `storyTriggers`는 기획 인벤토리일 뿐 구현 완료 근거가 아니다.

1-1~1-3은 증강 없는 기본 Rope와 Telemetry 축적 구간, 1-4는 첫 Foundation Augment 선택, 1-5~1-8은 같은 공간을 선택한 증강에 따라 다르게 해석하는 검증 구간이다. Checkpoint는 진행 저장과 개인 부활만 소유하며 Foundation 선택은 authored Node에서 연다.

0.45.0부터 1-1/1-2의 System Story와 Player Bark는 별도 Stage 문자열 catalog가 아니라 Direction compiler가 같은 Beat 원본에서 인과 순서대로 만든다. 세 Bark는 각 플레이어 자기 화면의 캐릭터 머리 위에서 타이핑되며, message queue는 future party-chat audience를 수용하지만 현재 Sector 문구를 네트워크로 복제하지 않는다.

## 맵 에디터 전 Stage 정합 감사 — 2026-08-22

**결론: map-editable 범위에서 불일치는 발견되지 않아 저장 적용을 실행하지 않았다.** Sector 01의 여덟 Stage는 모두 `AREA-SPEC.v2.json`을 canonical 원본으로, `AREA-CATALOG.json`의 명시적 `source: "generated"` 선택을 통해 generated Runtime으로 사용한다. 각 Stage는 legacy와 generated를 섞지 않고 하나의 source만 사용한다.

| Stage | 지형 | Anchor | 복구/경로 | 적 슬롯 | 바람원/구역 | Camera Zone | 에디터·생성 Runtime 판정 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1-1 | 11 | 2 | 10 | 0 | 0 | 5 | 일치 |
| 1-2 | 10 | 2 | 9 | 0 | 0 | 5 | 일치 |
| 1-3 | 14 | 4 | 9 | 3 | 0 | 6 | 일치 |
| 1-4 | 10 | 0 | 7 | 1 | 0 | 4 | 일치 |
| 1-5 | 9 | 8 | 18 | 2 | 0 | 5 | 일치 |
| 1-6 | 11 | 8 | 15 | 3 | 4 | 6 | 일치 |
| 1-7 | 10 | 11 | 19 | 3 | 3 | 8 | 일치 |
| 1-8 | 10 | 9 | 20 | 4 | 2 | 9 | 일치 |

- Map Editor에서 모든 Stage의 `저장됨 / 검증 통과`와 오류 0을 직접 확인했다. `바람원/구역`은 source와 zone을 합산한 editor 레이어 수다.
- v2 원본을 `createAreaDefinitionFromV2`로 다시 compile한 결과와 `Sector01Stage01~08.generated.js`를 키 순서와 무관하게 비교해 Area definition 의미 동등성을 확인했다.
- 새 로컬 싱글플레이 Preview는 1-6 desktop 및 1-7 `390×844` mobile에서 정상 시작했다. 이는 초기 render·camera framing smoke이며, 전체 경로 traversal, 1-3 Cover LOS, 모든 Camera Zone 전환과 Wind 체감은 별도 수동 gameplay 검증으로 남긴다.
- 목표·진행·Story·Scanner·수기 Behavior Registry는 editor의 읽기 전용 영역이므로 이 감사에서 편집하거나 구현 완료로 승격하지 않았다. 1-8의 Shutdown/정식 Prop 미구현 상태도 바꾸지 않는다.
- **병행 개발 보호:** 이 감사와 후속 통합은 main 개발자의 seamless facade·진행·멀티플레이 공개 계약과 분리된 source-isolated branch/worktree에서 수행한다. 맵 원본 수정이 필요할 때에도 Draft → Validate → Apply를 거쳐 해당 Stage의 v2 JSON과 generated JS만 원자적으로 갱신한다.

## 자산 상태

- 제공 이미지 크기: `1672 × 941 px`
- 저장 위치: `docs/bsh/scenario/1/images/sector-01-background-reference.png`
- 현재 용도: 기획·아트 방향을 맞추기 위한 문서용 레퍼런스
- 런타임 적용: 원본 출처, 사용권, 최종 제작 규격을 확인한 뒤 별도 환경 자산으로 전환한다.

Stage별 Scenario Art는 생성 직전에 해당 Stage Runtime과 Camera Zone을 다시 확인하고 보이는 발판·장애물의 구조 가이드를 먼저 만든다. 현재 1-1 C04 `05`, 1-2 C02 `06`, 1-3 Route Choice `05`, 1-4 Node `03` 이미지는 구조 관계까지 검수한 `APPROVED ART REFERENCE`다. 1-3의 이전 `03`은 `RETIRED / ROPE-ROUTE MISMATCH`로 이력만 보존한다. 1-5~1-8은 Approved Blockout 확정이 먼저다.

