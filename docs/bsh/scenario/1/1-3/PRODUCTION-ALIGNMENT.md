# SECTOR 01-3 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · COMBAT HANDOFF · REV 1.0*

본 문서는 [1-3 시나리오](./README.md) REV 3.0을 현재 런타임으로 옮기는 제작 계약이다. 원문 수치는 플레이테스트 전 `BLOCKOUT HYPOTHESIS`이며, 아래 stable ID·상태·좌표 기준을 그래픽·오디오 담당자가 이어받는다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 960×1152 Geometry | `IMPLEMENTED` | P0→A→P1→B→C→D→P4 흐름과 Safe/Flow/Recovery 제공 |
| R1 Recovery | `IMPLEMENTED` | `x=-32~224`, `y=-576`, 256×16; 중심 `(96,-576)` |
| Sentry T1 | `IMPLEMENTED PROTOTYPE` | `idle → acquire → track → lock → fire → cooldown`; 수치는 공동 플레이로 조정 |
| Cover LOS | `IMPLEMENTED` | `kind=cover`가 조준선을 가리면 획득·사격 중지, `Y<-928`에서 Encounter 종료 |
| Standard Projectile | `IMPLEMENTED` | Player Hit만 처리하고 Rope를 자르지 않음 |
| Story Presentation | `IMPLEMENTED` | 개인 화면에 1회 표시, 이동 입력을 막지 않음 |
| Camera Zones | `IMPLEMENTED PROTOTYPE` | 로컬 플레이어 위치로 Shot 선택, desktop/mobile 공용 데이터 사용 |
| 기존 PNG 2개 | `RETIRED` | 이전 `COOLING SHAFT` 이미지라 1-3 구현·외주·검수 기준으로 사용 금지 |
| 정식 그래픽·오디오 | `PENDING` | stable state/cue ID를 유지한 채 runtime package와 binding만 교체 |

## 2. Runtime Geometry

좌표는 Stage Local World Unit이며 `X=-480~480`, `Y=0~-1152`다. Platform 좌표는 `top-center`, 바닥 설치 Panel·Gate는 `bottom-center`를 사용한다.

| ID | 중심/기준점 | 크기 | 역할 |
| --- | --- | --- | --- |
| P0 | `(-144,0)` | 544×32 | 시작·Scanner 접근 |
| P1 | `(240,-320)` | 224×32 | 마지막 안전 관찰대 |
| R1 | `(96,-576)` | 256×16 | B 실패 Recovery |
| Safe Ledge | `(-240,-640)` | 224×16 | 첫 플레이 Safe Route |
| Safe Cover | `(-112,-640)` bottom-center | 32×128 | C 접근 LOS 차단 |
| Upper Cover | `(-16,-832)` bottom-center | 96×128 | 상단 Relief 경계 |
| P4 | `(192,-1056)` | 320×32 | Final Safe Deck |
| A/B/C/D | `(64,-224)` / `(64,-480)` / `(-192,-736)` / `(96,-960)` | 24×24 | Grapple Landmark |
| Scanner | `(-96,-64)` | 96×128 trigger | 자동 직원 인증 |
| Sentry T1 | `(416,-640)` | 32×32 mock | 오른쪽 벽 장착 |
| Service Panel | `(208,-1056)` bottom-center | mock | `maintenance-override` |
| Security Gate | `(320,-1056)` bottom-center | mock | 실제 문 개구부만 포탈 |

Sentry activation band는 `x=-480~480`, `y=-928~-384`다. P1에서는 접힌 Turret을 먼저 보고, 위로 출발한 뒤에만 Acquire가 시작된다. Turret 파괴는 Gate 요구 조건이 아니다.

## 3. Sentry 상태·표현 계약

| 상태 | 초기 시간 | Gameplay | Mock 표현·교체 cue |
| --- | ---: | --- | --- |
| `idle` | - | 타깃 없음, 고정 Sentry는 정지 | 접힘, sensor off |
| `acquire` | 0.25초 | activation·LOS 안의 가장 가까운 플레이어를 한 cycle 타깃으로 고정 | 전개, sensor on, `sentry-acquire` |
| `track` | 0.80초 | 현재 위치를 따라 얇은 조준선 갱신 | dark-red aim line, `sentry-track` |
| `lock` | 0.20초 | 방향을 고정하고 이동한 타깃을 더 따라가지 않음 | bright aim line, `sentry-lock` |
| `fire` | 0.08초 mock flash | 고정 방향으로 표준 Projectile 한 발 생성 | orange muzzle, `sentry-fire` |
| `cooldown` | 1.40초 | 조준선 제거, 같은 유효 타깃 유지 후 Track 복귀 | dim sensor, `sentry-cooldown` |

Cover가 LOS를 끊거나 타깃이 activation band를 나가면 즉시 `idle`로 돌아간다. 상태·조준 방향은 서버가 진행하고 snapshot으로 공유한다. renderer는 이 값을 읽어 mock을 그릴 뿐 상태를 변경하지 않는다.

## 4. Camera Shot 계약

| SHOT | Player local Y | 반드시 읽힐 대상 | Desktop | Mobile | Player screen Y ratio |
| --- | --- | --- | ---: | ---: | ---: |
| Identification | `0~-224` | Player, Scanner, A, P1 일부 | 1.15 | 0.78 | 0.50 |
| Warning | `-224~-416` | Player, P1, B, 접힌 Turret | 1.00 | 0.72 | 0.60 |
| Turret Reveal | `-416~-544` | Player, B, Turret Housing | 0.95 | 0.70 | 0.68 |
| Route Choice | `-544~-800` | Turret, C, Safe Ledge, R1 | 0.88 | 0.66 | 0.62 |
| Relief | `-800~-944` | Cover, D, 상단 경로 | 1.00 | 0.72 | 0.60 |
| Exit | `-944~-1152` | D, P4, Panel, Gate | 1.15 | 0.78 | 0.68 |

수치보다 `Turret이 첫 Shot 전 화면에 보임`, `B→C에서 Safe/Flow/Recovery를 한 화면에 비교`, `Exit에서 위협이 화면 아래로 사라짐`이 우선한다.

## 5. Story Trigger 계약

| EVENT | 조건 | 개인 화면 표시 |
| --- | --- | --- |
| `employee-scan` | Scanner bounds 최초 통과 | `EMPLOYEE VERIFIED / VERTICAL MAINTENANCE` → `ASSIGNED SECTOR / LOWER MAINTENANCE` |
| `return-warning` | P1 범위 최초 진입 | `RETURN TO ASSIGNED SECTOR / FINAL WARNING` |
| `unauthorized-transit` | local Y `-384` 이상 상승 | `ROUTE VIOLATION / DETECTED` → `UNAUTHORIZED / VERTICAL TRANSIT` |
| `access-denied` | Exit Shot 최초 진입 | `ACCESS DENIED / RETURN TO ASSIGNED SECTOR` |
| `maintenance-override` | Panel Objective 완료 | `MAINTENANCE / OVERRIDE` |
| `violation-logged` | Gate unlock 사건 | `VIOLATION / LOGGED` |

모든 문구는 Run당 한 번만 표시하고 입력을 차단하지 않는다. Objective·Gate는 공용 진행이 소유하고 Presentation은 사건을 읽기만 한다.

## 6. Asset·Mock 인계

- 맵 definition에는 이미지·atlas·음원 경로를 넣지 않는다.
- 그래픽은 `world-object:sentry`, Scanner, Panel, Gate stable presentation을 정식 environment package로 교체한다.
- 오디오는 `sentry-acquire/track/lock/fire/cooldown`, `security-scanner`, `maintenance-override`, `violation-logged` cue binding을 교체한다.
- 교체 작업은 지형·activation·damage·LOS·완료 조건·네트워크 권위를 변경하지 않는다.
- 현재 mock의 붉은 sensor와 aim line은 상태 판독용이며 최종 미술 기준이 아니다.

## 7. Acceptance

- 첫 Shot 전 `acquire → track → lock`이 색뿐 아니라 조준선 유무·밝기로 구분된다.
- Lock 뒤 계속 움직이면 Projectile이 이전 방향으로 지나간다.
- Safe Cover 뒤와 `Y<-928` Relief 구간에서 새 Shot이 생성되지 않는다.
- 첫 피격은 one-shot이 아니고 Rope Cut·Stage 시작 reset을 만들지 않는다.
- Turret을 파괴하지 않아도 Panel 조작과 Gate 통과가 가능하다.
- Desktop·Mobile에서 Scanner, Turret, 다음 Anchor, Recovery, Gate가 해당 Shot에 보인다.
