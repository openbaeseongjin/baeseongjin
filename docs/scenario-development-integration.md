# 시나리오 기획·개발 통합 현황

이 문서는 [`bsh/scenario/`](./bsh/scenario/)의 기획 범위와 현재 Runtime 연결 상태를 한 체크포인트에서 비교하는 기준 문서다. Stage 문서가 존재한다는 사실을 구현 완료로 해석하지 않으며, 마지막으로 어디까지 확인했는지와 다음 구현을 막는 결정을 함께 남긴다.

<!-- scenario-integration-checkpoint:v1
scenario-source-sha256: 30dced6a8298cc387a2cd8779c9a5319021ef315ff8c8f98338eae38529ec130
authored-area-sha256: 020acd7ebf190ab63958c9c3ae17a32a0328caff6697c6b5805b9d992d5d8d2c
stage-count: 25
stage-coverage: 1-1,1-2,1-3,1-4,1-5,1-6,1-7,1-8,2-1,2-2,2-3,2-4,2-5,2-6,2-7,2-8,3-1,3-2,3-3,3-4,3-5,3-6,3-7,3-8,4-1
reviewed-upstream: decc0f6edfb9cf9dd8c22718115385de7e67668d
-->

## 상태를 읽는 법

기획과 Runtime은 서로 다른 축으로 기록한다.

| 축 | 상태 | 의미 |
| --- | --- | --- |
| 기획 | `OUTLINE` | Sector Master에 개요만 있고 상세 Stage 계약은 없음 |
| 기획 | `AUTHORED` | 상세 Stage README가 존재함 |
| 기획 | `CROSS-REVIEWED` | Master·Stage·현재 Runtime 경계를 함께 비교함 |
| Runtime | `NOT CONNECTED` | 현재 authored area catalog에 없음 |
| Runtime | `GRAYBOX READY` | 새 시스템 없이 geometry부터 만들 수 있으나 catalog에는 아직 없음 |
| Runtime | `MOCK INTEGRATED` | 현재 authored catalog와 공용 진행 흐름에 연결됨 |
| Runtime | `PLAYTEST VERIFIED` | 요구된 실제 브라우저·기기 플레이 증거까지 확보됨 |

`BLOCKED`는 위 상태와 별개다. 예를 들어 Stage가 `AUTHORED`여도 선행 Boss 전환이나 새 시스템 결정이 없으면 연결은 차단된다.

## 2026-08-15 확인 체크포인트

- 확인 기준 upstream: `decc0f6edfb9cf9dd8c22718115385de7e67668d` (`origin/main`, #493 Rope Shot 비행·연결 표현 병합 뒤 clean base)
- 상세 Stage 문서: **25개**, `1-1`부터 `3-8`까지와 `4-1`
- 현재 authored Runtime: **16개**, `1-1 → 2-8`
- 직접 대조한 기준: Sector 03 Master REV 1.2와 3-1~3-8, Sector 04 Master REV 1.0과 4-1, `CurrentAuthoredAreaCatalog.js`, Sector 01 그래플 표면·랜드마크 1:1 계약, 1-1 C04·1-2 C02 Approved Blockout·Area Catalog·Scenario Art 구조 관계, 구현 로드맵과 세션 핸드오프
- 자동 확인 범위: `docs/bsh/scenario/**/*.md`, `src/game/world/areas/**/*.js`, 상세 Stage README 목록
- 확인하지 못한 항목: Sector 03·04 Runtime과 실제 플레이테스트. 두 Sector는 현재 catalog에 없으므로 완료로 표시하지 않는다.
- **checkpoint marker 갱신 대기**: 위 "최근 반영된 시나리오 변화" 7번 수정으로 `docs/bsh/scenario/**/*.md`의 실제 source가 checkpoint 기록 시점과 달라졌다. 이 세션 환경에는 Node.js가 없어 `npm run check:scenario-integration -- --print`로 새 `scenario-source-sha256`를 직접 계산하지 못했다. Node가 있는 환경에서 위 명령으로 실제 값을 확인한 뒤 marker의 `scenario-source-sha256`을 갱신할 것 — 손으로 값을 지어내지 않는다.

| 범위 | 기획 현황 | Runtime 현황 | 다음 경계 |
| --- | --- | --- | --- |
| Sector 01 / 1-1~1-8 | 8개 상세 Stage, `CROSS-REVIEWED` | 8개 `MOCK INTEGRATED`; 1-4 Foundation 선택·효과·개인별 멀티는 #480에서 검증; 102개 그래플 표면·랜드마크 1:1 가시성은 #487에서 검증 | 1-1 C04·1-2 C02 Scenario Art 구조 정합 완료; 1-4·1-3 재생성과 실제 Build 플레이 수치 검증 필요 |
| Sector 02 / 2-1~2-8 | 8개 상세 Stage, `CROSS-REVIEWED` | 8개 `MOCK INTEGRATED` | 2-3 Specialization의 실제 이름·효과·수치·pool과 Sector 02 Boss→3-1 전환 미정 |
| Sector 03 / 3-1~3-8 | 8개 상세 Stage와 Master REV 1.2, `CROSS-REVIEWED` | 전부 `NOT CONNECTED`; 3-1 순수 geometry는 `GRAYBOX READY` | Access Scan Field, Sector 03 catalog·Camera Zone·Stable ID·Story trigger, Sector 종료 전환 필요 |
| Sector 04 / 4-1 | Master와 4-1 상세 Stage, `CROSS-REVIEWED` | `NOT CONNECTED`; 4-1 순수 geometry는 `GRAYBOX READY` | Post-Sector 03 Boss→4-1 진입을 확정하기 전 global order·entry wiring 금지 |
| Sector 04 / 4-2~4-8 | Master의 `OUTLINE`만 존재 | `NOT CONNECTED` | 상세 Stage 계약 필요 |
| Sector 05~06 | 상세 Stage 없음 | `NOT CONNECTED` | NPC 역할·대화 계약과 엔딩·최종 전환 계약 필요 |

## 최근 반영된 시나리오 변화

1. Sector 03은 3-1~3-8 상세 문서와 통합 Master까지 확장됐다. 3-2 이후 핵심은 Access Scan Field에 의존하지만 Runtime prototype과 Sector 03 authored catalog는 아직 없다.
2. Sector 04는 Transit / Infrastructure Master와 4-1 `TRANSIT INTAKE`가 추가됐다. 4-1은 Enemy·Scanner·Wind·Cutter·Moving Platform 없이 Rope momentum만 검증하므로 geometry 후보는 준비됐지만, Sector 03 종료 전환은 미정이다.
3. #480은 1-4 Foundation 선택·세 효과·개인별 멀티·Story/UI·프로토콜을 구현했다. Foundation ID와 Specialization ID의 의미 체계는 계속 분리한다.
4. #478은 1-1 C04와 1-2 C02에서 보이는 발판·Anchor의 좌우·상하 관계와 상대 폭을 Approved Blockout·Area Catalog에 맞춘 구조 가이드로 다시 생성했다. 이전 구조 불일치 이미지는 `RETIRED / STRUCTURE MISMATCH`로 보존하고 새 이미지를 현재 승인 기준으로 전환했다. Runtime Geometry와 Collision은 변경하지 않았으며, 남은 Scenario Art 권장 순서는 1-4 → 1-3이다.
5. #487은 1-3·1-4·1-6·1-7·1-8에서 누락된 그래플 랜드마크 28개를 기존 target 좌표에 연결했다. 현재 102개 비렌더 그래플 표면은 모두 같은 ID·좌표 anchor의 보이는 object와 1:1이며, 누락·고아·좌표 불일치는 catalog validator와 authored world 회귀가 거부한다. Rope 후보 사거리·점수 계약은 변경하지 않았다.
6. #489는 기존 글로벌 Artifact 시스템(ArtifactCatalog·Inventory·선택·network claim)을 은퇴하고 authored Foundation 선택을 유일한 특화 방향으로 확정했다. Checkpoint는 보상 선택을 열지 않는다. Rope 부착은 속도 1400px/s × 수명 2/7초에서 파생한 400px 도달의 보이는 Hook 투사체로 바뀌었고 `swingImpulse = 780`은 유지한다. Sentry 첫 수치는 체력 100·인식 거리 760·적 탄속 520·재사격 1.0초이며 authored activation/LOS가 인식을 계속 가린다. 시나리오 문서의 Rope 최대 부착/사거리 표현은 440에서 400으로 정렬했다.
7. `2/2-2`·`2/2-4`·`2/2-5`·`2/2-7`·`2/2-8`·`3/3-3`·`3/3-4`·`3/3-6`·`3/3-7`·`3/3-8`의 `README.md`가 #489 이전 Sentry 수치(Health 30·Attack Range 520·Fire Interval 1.4 sec·Projectile Speed 260)를 그대로 인용하고 있어 `src/game/config.js`의 `COMBAT_CONFIG`(Health 100·Attack Range 760·Fire Interval 1.0 sec·Projectile Speed 520) 기준으로 정정했다(2-8과 3-6은 각각 두 곳씩 중복 인용돼 있었음). Rope 부착 440→400 표현은 이번 정밀 재검색에서 corpus 전체에 stale citation이 없음을 확인했다.

## 열린 기획·구현 게이트

1. Sector 02 Boss와 `2-8 → 3-1` 전환 위치·흐름
2. Access Scan Field의 Runtime 상태 머신, 결정적 멀티 phase와 Rope attach filter 확장
3. Sector 03 authored catalog, Camera Zone, Stable ID, Story trigger와 3-1~3-8 연결
4. Post-Sector 03 Boss와 `3-8 → 4-1` 전환
5. 2-3 Specialization의 실제 이름·효과·수치·선택 pool
6. Sector 04의 4-2~4-8 상세 Stage 계약
7. NPC 역할·배치·대화 흐름과 Sector 06 엔딩·최종 완료 계약
8. 미래 authored Stage 공간 계획은 Hook 비행·빗맞음·재발사 telegraph와 원격 가시성을 반영해야 한다. 400px 도달은 속도×수명 파생 하나만 쓰고 별도 사거리 상수를 두지 않는다.
9. authored Sentry activation band와 Cover LOS는 인식 거리 760과 무관하게 encounter 제약으로 유지한다. 긴 인식 거리가 activation·LOS를 우회하지 않는다.

이 항목은 문서가 추가됐다는 이유만으로 닫지 않는다. 사용자 결정, 구현 diff와 검증 증거 중 해당 게이트를 실제로 해소한 근거가 있어야 한다.

## 지속 통합 절차

1. 작업 시작 시 이 문서와 관련 Sector·Stage README, 구현을 시작한 Stage의 `PRODUCTION-ALIGNMENT.md`를 읽는다.
2. `npm run check:scenario-integration`으로 기록한 source와 현재 source가 같은지 확인한다. 불일치하면 `npm run check:scenario-integration -- --print`로 실제 값을 확인한다.
3. 시나리오 변경을 현재 Runtime과 대조해 최근 변경, 영향을 받는 영역, 열린 게이트와 검증 증거를 이 문서에 갱신한다. hash만 새 값으로 바꿔 검사를 우회하지 않는다.
4. 좌표·문구·cue처럼 기존 계약 안에서 흡수할 변경과, 맵 순서·핵심 기믹·완료 조건·Gate 연결·asset 경계처럼 사용자 검토가 필요한 변경을 분리한다.
5. 구현을 시작하면 Stage `PRODUCTION-ALIGNMENT.md`에 정확한 좌표·Camera·Stable ID·상태·사건·asset 인계 차이를 기록하고 gameplay→mock 표현→검증 순서로 연결한다.
6. `MOCK INTEGRATED`는 catalog·진행·테스트가 연결된 증거가 있을 때만, `PLAYTEST VERIFIED`는 요구된 실제 브라우저·기기 결과를 남겼을 때만 사용한다.
7. 같은 작업에서 이 문서, [`implementation-roadmap.md`](./implementation-roadmap.md)와 [`../SESSION-HANDOFF.md`](../SESSION-HANDOFF.md)의 현재 요약을 맞춘 뒤 전체 검사를 통과시킨다.

fingerprint는 의미 검토를 대신하지 않는다. 변경 누락을 발견하는 경보다. `reviewed-upstream`은 마지막 대조 기준 SHA를 보존하는 사람이 읽는 증거이며, 검사기는 source fingerprint와 Stage 목록의 일치 여부를 자동 검증한다.
