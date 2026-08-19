# SECTOR 01-3 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · COMBAT HANDOFF · REV 1.2*

본 문서는 [1-3 시나리오](./README.md) REV 3.0을 현재 런타임으로 옮기는 제작 계약이다. 원문 수치는 플레이테스트 전 `BLOCKOUT HYPOTHESIS`이며, 아래 stable ID·상태·좌표 기준을 그래픽·오디오 담당자가 이어받는다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-18

- 기존 Sentry T1 stable ID와 행동을 유지하면서 Stage-local 오른쪽 Annex `(1500,-640)`으로 옮겨 `sector-01:access-module:a`를 운반하는 Access Carrier A로 사용한다.
- 처치하면 Sector 공용 모듈 1개를 얻으며, 0.41.0의 3-of-3 계약에서 1-3·1-6·1-7 Carrier 세 기를 모두 요구하므로 이 개체는 Sector 경계 개방에 필수다.
- 0.42.0부터 위치 문자열과 720px 거리 제한을 제거한다. 화면 밖에서는 다음 미수집 Carrier를 safe-area edge arrow로, 화면 안에서는 Carrier 위 무문자 diamond marker로 안내한다.
- 기존 960px 보안 spine 좌표는 유지하고 Stage 폭을 3840px로 확장했다. Annex Bridge `(640,-576, 832×16)`, Arena `(1320,-640, 960×32)`, Access Anchor `(448,-480)`, `(896,-544)`가 Stage-local 좌표를 소유한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 3840×1152 Geometry | `IMPLEMENTED` | 기존 960px P0→A→P1→B→C→D→P4 spine과 오른쪽 Access Annex 제공 |
| R1 Recovery | `IMPLEMENTED` | `x=-32~224`, `y=-576`, 256×16; 중심 `(96,-576)` |
| Sentry T1 | `IMPLEMENTED PROTOTYPE` | `idle → acquire → track → lock → fire → cooldown`; 수치는 공동 플레이로 조정 |
| Cover LOS | `IMPLEMENTED` | `kind=cover`가 조준선을 가리면 획득·사격 중지, `Y<-928`에서 Encounter 종료 |
| Standard Projectile | `IMPLEMENTED` | Player Hit만 처리하고 Rope를 자르지 않음 |
| Story Presentation | `IMPLEMENTED` | 개인 화면에 1회 표시, 이동 입력을 막지 않음 |
| Camera Zones | `IMPLEMENTED PROTOTYPE` | 로컬 플레이어 위치로 Shot 선택, desktop/mobile 공용 데이터 사용 |
| 기존 PNG 2개 | `RETIRED` | 이전 `COOLING SHAFT` 이미지라 1-3 구현·외주·검수 기준으로 사용 금지 |
| `03_scenario_art_reference.png` | `RETIRED / ROPE-ROUTE MISMATCH` | live Rope와 전체 경로처럼 보이는 선이 함께 있어 이력 보존만 하고 제작 입력으로 사용 금지 |
| `04_approved_blockout.svg` | `APPROVED BLOCKOUT` | 현재 Runtime Geometry·Route·LOS·Scanner·Gate의 좌표 기준 |
| `05_scenario_art_reference.png` | `APPROVED ART REFERENCE` | Route Choice Camera의 B/C/D·Safe/Recovery·두 Cover·1-Sentry 구조와 Player→C live Rope 한 줄 기준 |
| 정식 그래픽·오디오 | `PENDING` | stable state/cue ID를 유지한 채 runtime package와 binding만 교체 |

## 2. 문서 이미지와 자료 우선순위

### Scenario Art Reference

![1-3 Scenario Art Reference](./images/05_scenario_art_reference.png)

`APPROVED ART REFERENCE`: Route Choice Camera, local Player Y `-800~-544`, Desktop Zoom `0.88`, Player screen Y ratio `0.62`를 사용한다. D는 위, C는 왼쪽 중단, B는 아래에 있고 Safe Ledge 오른쪽 끝에서 Safe Cover가 상승한다. R1은 아래 중단·오른쪽, Upper Cover는 위 중앙, Sentry T1은 오른쪽 벽에 있다. 약 48px Player는 C 오른쪽 아래에서 C에만 live Cyan Rope 한 줄을 연결하며, Sentry의 얇은 Red TRACK Telegraph 한 줄과 색·방향으로 분리된다. P0·P1·P4·A·Scanner·Panel·Gate·Projectile·경로선은 Camera 밖 또는 Shot 상태 밖으로 제외한다.

### Approved Blockout

![1-3 Approved Blockout](./images/04_approved_blockout.svg)

1. 학습 목표·금지 요소·Story 의미는 [시나리오 README](./README.md)가 결정한다.
2. 좌표·Stable ID·Sentry 상태는 현재 `Sector01AreaCatalog.js`와 이 Blockout이 함께 결정한다.
3. `05_scenario_art_reference.png`는 대표 Camera의 재질·조명·가독성 기준이며 전체 좌표와 Collision은 Blockout을 우선한다.
4. `01_swing_line.png`, `02_layout.png`, `03_scenario_art_reference.png`는 이력용이며 제작·외주·검수 자료로 전달하지 않는다.
5. Blockout과 Runtime이 다르면 같은 변경에서 둘을 함께 수정한다.
6. 정확한 생성 프롬프트·오브젝트 수·사후 검수는 [`images/README.md`](./images/README.md)를 따른다.

## 3. Runtime Geometry

좌표는 Stage Local World Unit이며 `X=-480~480`, `Y=0~-1152`다. Platform 좌표는 `top-center`, 바닥 설치 Panel·Gate는 `bottom-center`를 사용한다.

| ID | 중심/기준점 | 크기 | 역할 |
| --- | --- | --- | --- |
| P0 | `(-144,0)` | 544×32 | 시작·Scanner 접근 |
| P1 | `(240,-320)` | 224×32 | 마지막 안전 관찰대 |
| R1 | `(96,-576)` | 256×16 | B 실패 Recovery |
| Safe Ledge | `(-240,-640)` | 224×16 | 첫 플레이 Safe Route |
| Safe Cover | `(-112,-640)` bottom-center | 32×128 | C 접근 LOS 차단 |
| Upper Cover | `(-16,-832)` bottom-center | 96×128 | 상단 Relief 경계 |
| P4 | `(192,-1088)` | 320×32 | Final Safe Deck |
| A/B/C/D | `(64,-224)` / `(64,-480)` / `(-192,-736)` / `(96,-960)` | 24×24 | Grapple Landmark |
| Scanner | `(-96,-64)` | 96×128 trigger | 자동 직원 인증 |
| Access Carrier A | `(1500,-640)` | 32×32 mock | 오른쪽 Annex Arena, 기존 Sentry T1 행동 재사용 |
| Service Panel | `(208,-1088)` bottom-center | mock | `maintenance-override` |
| Security Gate | `(320,-1088)` bottom-center | mock | 실제 문 개구부만 포탈 |

Access Carrier activation band는 `x=650~1750`, `y=-928~-384`다. 본선 P1에서는 coarse signal만 보이며 오른쪽 Annex에 진입해야 Acquire가 시작된다. 이 Carrier 하나의 파괴는 필수가 아니지만 Sector 01 전체에서는 세 후보 중 두 기를 처치해야 한다.

## 4. Sentry 상태·표현 계약

| 상태 | 초기 시간 | Gameplay | Mock 표현·교체 cue |
| --- | ---: | --- | --- |
| `idle` | - | 타깃 없음, 고정 Sentry는 정지 | 접힘, sensor off |
| `acquire` | 0.25초 | activation·LOS 안의 가장 가까운 플레이어를 한 cycle 타깃으로 고정 | 전개, sensor on, `sentry-acquire` |
| `track` | 0.80초 | 현재 위치를 따라 얇은 조준선 갱신 | dark-red aim line, `sentry-track` |
| `lock` | 0.20초 | 방향을 고정하고 이동한 타깃을 더 따라가지 않음 | bright aim line, `sentry-lock` |
| `fire` | 0.08초 mock flash | 고정 방향으로 표준 Projectile 한 발 생성 | orange muzzle, `sentry-fire` |
| `cooldown` | 1.40초 | 조준선 제거, 같은 유효 타깃 유지 후 Track 복귀 | dim sensor, `sentry-cooldown` |

Cover가 LOS를 끊거나 타깃이 activation band를 나가면 즉시 `idle`로 돌아간다. 상태·조준 방향은 서버가 진행하고 snapshot으로 공유한다. renderer는 이 값을 읽어 mock을 그릴 뿐 상태를 변경하지 않는다.

## 5. Camera Shot 계약

| SHOT | Player local Y | 반드시 읽힐 대상 | Desktop | Mobile | Player screen Y ratio |
| --- | --- | --- | ---: | ---: | ---: |
| Identification | `0~-224` | Player, Scanner, A, P1 일부 | 1.15 | 0.78 | 0.50 |
| Warning | `-224~-416` | Player, P1, B, 접힌 Turret | 1.00 | 0.72 | 0.60 |
| Turret Reveal | `-416~-544` | Player, B, Turret Housing | 0.95 | 0.70 | 0.68 |
| Route Choice | `-544~-800` | Turret, C, Safe Ledge, R1 | 0.88 | 0.66 | 0.62 |
| Relief | `-800~-944` | Cover, D, 상단 경로 | 1.00 | 0.72 | 0.60 |
| Exit | `-944~-1152` | D, P4, Panel, Gate | 1.15 | 0.78 | 0.68 |

수치보다 `Turret이 첫 Shot 전 화면에 보임`, `B→C에서 Safe/Flow/Recovery를 한 화면에 비교`, `Exit에서 위협이 화면 아래로 사라짐`이 우선한다.

## 6. Story Trigger 계약

| EVENT | 조건 | 개인 화면 표시 |
| --- | --- | --- |
| `employee-scan` | Scanner bounds 최초 통과 | `EMPLOYEE VERIFIED / VERTICAL MAINTENANCE` → `ASSIGNED SECTOR / LOWER MAINTENANCE` |
| `return-warning` | P1 범위 최초 진입 | `RETURN TO ASSIGNED SECTOR / FINAL WARNING` |
| `unauthorized-transit` | local Y `-384` 이상 상승 | `ROUTE VIOLATION / DETECTED` → `UNAUTHORIZED / VERTICAL TRANSIT` |
| `access-denied` | Exit Shot 최초 진입 | `ACCESS DENIED / RETURN TO ASSIGNED SECTOR` |
| `maintenance-override` | Panel Objective 완료 | `MAINTENANCE / OVERRIDE` |
| `violation-logged` | Gate unlock 사건 | `VIOLATION / LOGGED` |

모든 문구는 Run당 한 번만 표시하고 입력을 차단하지 않는다. Objective·Gate는 공용 진행이 소유하고 Presentation은 사건을 읽기만 한다.

## 7. Asset·Mock 인계

- 맵 definition에는 이미지·atlas·음원 경로를 넣지 않는다.
- 그래픽은 `world-object:sentry`, Scanner, Panel, Gate stable presentation을 정식 environment package로 교체한다.
- 오디오는 `sentry-acquire/track/lock/fire/cooldown`, `security-scanner`, `maintenance-override`, `violation-logged` cue binding을 교체한다.
- 교체 작업은 지형·activation·damage·LOS·완료 조건·네트워크 권위를 변경하지 않는다.
- 현재 mock의 붉은 sensor와 aim line은 상태 판독용이며 최종 미술 기준이 아니다.
- `05_scenario_art_reference.png`를 통이미지 Runtime 배경으로 사용하지 않는다. 1-1·1-2와 같은 공용 Tile/Module Atlas를 조합한다.
- Sentry 주변의 배경 Red와 Cyan 장식은 줄이고 Scanner Frame, Cover, Panel, Gate는 기존 산업 모듈을 상태별로 재사용한다.

## 8. Acceptance

- 첫 Shot 전 `acquire → track → lock`이 색뿐 아니라 조준선 유무·밝기로 구분된다.
- Lock 뒤 계속 움직이면 Projectile이 이전 방향으로 지나간다.
- Safe Cover 뒤와 `Y<-928` Relief 구간에서 새 Shot이 생성되지 않는다.
- 첫 피격은 one-shot이 아니고 Rope Cut·Stage 시작 reset을 만들지 않는다.
- Turret을 파괴하지 않아도 Panel 조작과 Gate 통과가 가능하다.
- Desktop·Mobile에서 Scanner, Turret, 다음 Anchor, Recovery, Gate가 해당 Shot에 보인다.
- Runtime 좌표와 `04_approved_blockout.svg`의 P0·P1·R1·Safe Ledge·Cover·A/B/C/D·P4·Panel·Gate가 일치한다.
- Route Choice Shot에서 보이는 B/C/D·Safe Ledge·R1·Safe Cover·Upper Cover·Sentry의 수와 좌우·상하 관계가 `05_scenario_art_reference.png`와 일치한다.
- `03_scenario_art_reference.png`는 `RETIRED / ROPE-ROUTE MISMATCH` 이력으로만 보존하고 새 제작 입력으로 사용하지 않는다.

## 9. 증강·Story 연결

[Sector 01 증강·스토리 통합 기준](../AUGMENT-STORY-INTEGRATION.md)에 따라 1-3은 증강을 제공하지 않고, 1-4의 Firmware 선택이 필요한 Story 원인을 확정하는 Stage다.

- `foundationAugment = none`을 유지하며 Augment 효과, 선택 UI, 전용 VFX를 노출하지 않는다.
- 1-2의 Manual Grapple 이동은 `unauthorized-transit`에서 시설 규정 위반으로 해석된다.
- `maintenance-override`는 Gate를 열고, `violation-logged`는 Player의 Rope 운용과 보안 대응 기록이 1-4 Maintenance Node로 전달됐음을 의미한다.
- Impulse·Relay·Shear 중 어느 하나를 미리 추천하거나 Profile Icon을 배경에 배치하지 않는다. 세 선택지는 1-4에서 처음 동등하게 제시한다.
- Telegraph 인지율, Lock 뒤 회피율, B→C 연결 성공률, Safe/Flow/Recovery 사용률을 증강 전 기준값으로 저장한다.
- 이후 증강을 구현하더라도 1-3은 기본 Rope와 표준 Projectile만으로 완전히 통과 가능해야 한다.
- Sentry는 Shear Current의 선행 Tutorial이 아니다. 현재 Stage에서 Rope Segment 피해, 적 절단, Foundation Synergy를 암시하면 FAIL이다.
