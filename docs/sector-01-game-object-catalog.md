# Sector 01 게임 오브젝트 카탈로그

작성일: 2026-08-14
상태: 시나리오 `1-1`~`1-8` mock 데이터와 runtime 진행 연결 완료
런타임 기준: `src/game/world/areas/sector01/Sector01AreaCatalog.js`

## 목적

메인 개발자가 시나리오 순서대로 mock gameplay를 연결할 때 사용한 안정적인 오브젝트 ID·상태·완료 사건·표현 cue를 그래픽·오디오·기획 담당자가 그대로 이어받게 한다. 이 목록의 오브젝트와 상태가 gameplay 계약이며, 정식 이미지·소리는 같은 ID의 mock 표현만 교체한다.

맵 데이터에는 PNG/WAV 경로, atlas frame, 구체 renderer나 mixer 분기를 넣지 않는다. 환경은 runtime environment catalog가 선택한 package로 collision surface 위에 그리며, 오디오는 `AudioEventBindings`가 gameplay event를 현재 audio pack의 cue ID로 바꾼다. 제작 리소스가 아직 없으면 두 catalog 모두 검증된 `default-mock` package를 사용한다. 따라서 담당자는 stable object/state/event ID를 유지한 채 package와 binding만 교체한다.

## 공용 오브젝트 상태 계약

| 종류 | 공용 상태 | gameplay 책임 | 그래픽·오디오 인계 |
| --- | --- | --- | --- |
| `grapple-landmark` | `available` | 경로 안내용 랜드마크. 전용 부착 목록이 아니며 기존의 모든 유효 지형 부착 규칙 유지 | Cyan target, attach/release cue |
| `terminal` | `idle → available → completed` | 근접 interaction으로 stable objective ID 완료 | 화면 문구, interaction/complete cue |
| `gate-panel` | `blocked → ready → opened` | authored 직사각형 interaction Polygon과 Player collider가 겹친 W 입력으로 Gate 활성화 | 문 옆 장착 패널, 잠금/준비/개방 상태색과 cue |
| `augment-node` | `idle → selecting → selected` | Foundation Augment 선택과 `augment-selected` 완료 사건 | 선택 UI, node animation, 선택별 cue |
| `gate` | `locked → unlocked → crossed` | 요구 objective 집계 뒤 해제, 플레이어가 직접 통과할 때 다음 영역 활성화 | 잠금/해제/통과 표현 |
| `sentry` | `idle → acquire → track → lock → fire → cooldown` | 기존 Sentry FSM 재사용. 지정 activation 영역과 no-rope-cut/no-crossfire 규칙 적용. 피해는 받지만 위치 넉백은 받지 않음 | telegraph, fire, cooldown cue |
| `wind-source` | `continuous` 또는 `lull → warning → active → decay` | player body에 deterministic force 적용. Anchor·Rope 고정점과 position을 직접 이동하지 않음 | Fan animation, particle direction, airflow loop |
| `recovery` | `available` | 같은 Grapple 재시도용 catch surface. 전체 맵 reset 금지 | 안전 발판과 복귀 방향 표시 |
| `checkpoint` | `inactive → active` | Sector 일반 구간 종료와 복구 지점. Gate·Augment 보상과 별도 | 활성화 연출과 checkpoint cue |
| `background-prop` | `decorative` | 충돌·damage·objective 없음 | 환경 밀도와 시나리오 cue만 표현 |

## 1-1 `SERVICE SHAFT`

시나리오: `docs/bsh/scenario/1/1-1/README.md`

| stable ID/묶음 | 종류 | 역할·상태 | 완료/표현 cue |
| --- | --- | --- | --- |
| `sector-01-01:anchor-a~c` | grapple landmark | A Attach, B Release Timing, C Open Swing | Cyan target, rope learning |
| `sector-01-01:p0~p4` | platform/safe deck | 시작·착지·Terminal 접근 spine | collision edge |
| `sector-01-01:recovery-r1~r3` | recovery | 실패한 A/B/C만 5초 안에 재시도 | recovery direction |
| `sector-01-01:ground-shutter` | sealed collision | 아래쪽 탈출 봉쇄 | `LOCKDOWN` |
| `sector-01-01:cable-overhang` | non-damage collision | 늦은 B release를 R2로 유도 | scrape/impact mock |
| `sector-01-01:cooling-fan` | background prop | Wind·damage 없는 비활성 Fan | inactive machinery loop |
| `sector-01-01:exit-panel` | gate panel | W 입력 tick에 `terminal-read` objective 완료·출구 개방 | Direction의 cascade failure·Rooftop Pad 03 문구는 별도 재생 |
| `sector-01-01:exit-gate` | gate | 같은 tick에 `SERVICE SHAFT 02` 개방, 문구 재생 중에도 통과 허용 | locked/unlocked/crossed |

금지: Turret, Wind, Augment, 필수 공중 ReAttach, instant death.

## 1-2 `DOUBLE ANCHOR SHAFT`

시나리오: `docs/bsh/scenario/1/1-2/README.md`

| stable ID/묶음 | 종류 | 역할·상태 | 완료/표현 cue |
| --- | --- | --- | --- |
| `sector-01-02:anchor-a~d` | grapple landmark | A 복습, B 첫 Airborne Handoff, C 방향 반전, D Flow 확인 | handoff cue |
| `sector-01-02:p1~p3` | recovery | 각 Handoff 실패의 3~5초 재시도 | safe route cue |
| `sector-01-02:crossbeam-x1` | non-damage geometry | 너무 낮은 B→C 궤적 차단. 로프 후보 제외 예정 | collision-only silhouette |
| `sector-01-02:maintenance-lift` | background prop | 자동 Lift 고장과 수동 상승 이유 전달 | lift offline, heavy cable ambience |
| `sector-01-02:exit-panel` | gate panel | Final Deck 도달 뒤 활성화, 조작 시 Gate 개방 | blocked/ready/opened |
| `sector-01-02:security-access-gate` | gate | Exit Panel 조작 뒤 1-3 활성화 | security access check |

금지: Enemy, damage hazard, Wind, Augment.

## 1-3 `SECURITY CHECK`

시나리오: `docs/bsh/scenario/1/1-3/README.md`

| stable ID/묶음 | 종류 | 역할·상태 | 완료/표현 cue |
| --- | --- | --- | --- |
| `sector-01-03:employee-scanner` | automatic trigger | 직원 인증과 첫 경고 | employee verified |
| `sector-01-03:anchor-a~d` | grapple landmark | 안전 복습 → 공격 중 이동 → Flow → Relief | 경로별 anchor cue |
| `sector-01-03:sentry-turret-01` | sentry | 첫 Security FSM. cover 뒤 LOS 종료 | acquire/track/lock/fire/cooldown |
| `sector-01-03:safe-ledge`, `safe-cover`, `upper-cover` | recovery/cover | Safe Route와 Encounter 종료 경계 | LOS blocked, relief |
| `sector-01-03:service-panel` | gate panel | `maintenance-override`로 출구 개방 | maintenance override, violation logged |
| `sector-01-03:security-gate` | gate | Panel 뒤 1-4 활성화 | access denied → open |

완료에 Turret 파괴를 요구하지 않는다. 표준 Projectile은 Player Hit만 처리하고 Rope를 자르지 않는다.

## 1-4 `MAINTENANCE NODE`

시나리오: `docs/bsh/scenario/1/1-4/README.md`

| stable ID/묶음 | 종류 | 역할·상태 | 완료/표현 cue |
| --- | --- | --- | --- |
| `sector-01-04:maintenance-node` | augment node | `impulse-coil`, `relay-link`, `shear-current` 중 Foundation 선택 | selecting/selected, firmware applied |
| `sector-01-04:anchor-a~c` | grapple landmark | 선택 직후 짧은 Calibration | 선택별 차이 cue |
| `sector-01-04:calibration-dummy` | non-hostile test target | Shear 효과 확인. 공격하지 않는 진단 장치 | hit feedback only |
| `sector-01-04:p1~p2` | recovery | 모든 선택과 기본 Rope로 통과 | safe calibration cue |
| `sector-01-04:exit-panel` | gate panel | Augment 선택 뒤 활성화, 조작 시 Gate 개방 | blocked/ready/opened |
| `sector-01-04:test-bay-gate` | gate | Exit Panel 조작 뒤 1-5 활성화 | `TEST BAY 05` |

금지: 실제 Enemy, damage hazard, Wind, reroll, shop.

## 1-5 `AUGMENT TEST BAY`

시나리오: `docs/bsh/scenario/1/1-5/README.md`

| stable ID/묶음 | 종류 | 역할·상태 | 완료/표현 cue |
| --- | --- | --- | --- |
| `sector-01-05:anchor-a~h` | grapple landmark | Load Gap → Relay Spine → Live Security spine | base/impulse/relay/shear route cue |
| `sector-01-05:recovery-r1~r3`, `safe-ledge`, `safe-cover` | recovery/cover | 세 Build 모두 이용 가능한 Safe Route | recovery/LOS cue |
| `sector-01-05:sentry-turret-01` | sentry | 1-3 FSM 재사용, Build별 다른 해석 | standard telegraph, no rope cut |
| `sector-01-05:exit-panel` | gate panel | Final Deck 도달 뒤 활성화, 조작 시 Gate 개방 | blocked/ready/opened |
| `sector-01-05:cooling-access-gate` | gate | Exit Panel 조작 뒤 1-6 활성화 | cooling access preview |

금지: Wind, moving platform, 새 Enemy, 두 번째 Turret, Laser, Rope Cutter, Boss, timed challenge.

## 1-6 `COOLING SHAFT`

시나리오: `docs/bsh/scenario/1/1-6/README.md`

| stable ID/묶음 | 종류 | 역할·상태 | 완료/표현 cue |
| --- | --- | --- | --- |
| `sector-01-06:anchor-a~f` | grapple landmark | 무풍 복습 → Fan A → 중립 Deck → Fan B → Exit | wind-assisted route cue |
| `sector-01-06:fan-a` | wind source | 약한 오른쪽→왼쪽 Continuous Wind | constant airflow |
| `sector-01-06:fan-b` | wind source | 왼쪽→오른쪽 Pulsed Wind | lull/warning/active/decay |
| `sector-01-06:central-cooling-core` | background prop | 두 Wind 학습 구간을 나누는 랜드마크 | cooling pressure cue |
| `sector-01-06:recovery-r1~r4`, `neutral-deck` | recovery/safe deck | Wind Shadow 또는 매우 약한 Wind에서 재시도 | control restored cue |
| `sector-01-06:exit-panel` | gate panel | Final Deck 도달 뒤 활성화, 조작 시 Gate 개방 | blocked/ready/opened |
| `sector-01-06:pressure-bypass-gate` | gate | Exit Panel 조작 뒤 1-7 활성화 | bypass required |

금지: Enemy, damage, Fan contact damage, instant kill, teleport/tween force.

## 1-7 `PRESSURE BYPASS`

시나리오: `docs/bsh/scenario/1/1-7/README.md`

| stable ID/묶음 | 종류 | 역할·상태 | 완료/표현 cue |
| --- | --- | --- | --- |
| `sector-01-07:anchor-a~g` | grapple landmark | 약풍 복습 → Security → Pressure Crossing → Relief | 조합 route cue |
| `sector-01-07:sentry-turret-01` | sentry | 1-3 FSM 재사용 | standard projectile, no rope cut |
| `sector-01-07:pressure-valve-core` | background prop | Stage 중심 압력 설비 | gauge/pressure ambience |
| `sector-01-07:main-pressure-vent` | wind source | 1-6 Fan B와 같은 Pulsed 언어 | lull/warning/active/decay |
| `sector-01-07:safe-shadow`, `safe-shadow-cover`, `recovery-r3` | safe/recovery | Turret LOS와 Vent Force를 함께 끊는 판단 공간 | danger→safe transition |
| `sector-01-07:manual-bypass-control` | gate panel | 위쪽 탈출 경로를 열고 `bypass-open` 완료 | manual pressure control |
| `sector-01-07:containment-route-gate` | gate | Bypass 뒤 1-8 활성화 | service route available |

새 기믹을 추가하지 않는다. Turret 파괴와 Rope Cut을 완료 조건으로 사용하지 않는다.

## 1-8 `CONTAINMENT GATE`

시나리오: `docs/bsh/scenario/1/1-8/README.md`

| stable ID/묶음 | 종류 | 역할·상태 | 완료/표현 cue |
| --- | --- | --- | --- |
| `sector-01-08:anchor-a~h` | grapple landmark | Rope Chain → T1 → Mid Relief → T2+Wind → Relief | finale route cue |
| `sector-01-08:sentry-turret-lower` | sentry | Wind 없는 Lower Security Phase | T1 only |
| `sector-01-08:sentry-turret-upper` | sentry | Final Pulsed Wind와 겹치는 Synthesis Phase | T2 only |
| `sector-01-08:final-vent` | wind source | 기존과 같은 Pulsed 상태 | no new timing language |
| `sector-01-08:mid-safe-deck`, `upper-catch`, `p8` | safe/recovery | T1 LOS 종료, T2 시작 전/후 relief | complete relief cue |
| `sector-01-08:containment-gate` | foreground prop | Sector 일반 구간의 가장 큰 Gate 표현 | final warning/locked |
| `sector-01-08:maintenance-override-panel` | gate panel | `maintenance-override`로 출구 개방 | override lock/confirm |
| `sector-01-08:sector-checkpoint` | checkpoint | Shutdown → Worker District Reveal 뒤 일반 구간 종료 | sector checkpoint active |

T1과 T2는 동시에 사격하지 않는다. 새 Enemy·Boss·Rope Cut·Instant Death Floor를 넣지 않으며, 이 Stage에서 보스전을 추정 구현하지 않는다.

## 담당자 인계 규칙

1. 메인 개발자는 맵을 시작할 때 이 문서와 runtime catalog의 stable ID를 함께 갱신한다.
2. 그래픽·오디오 담당자는 stable ID를 바꾸지 않고 `cueIds`와 상태별 표현을 교체한다.
3. gameplay 완료 조건은 `objectiveId`가 소유하며 sprite·audio manifest에 넣지 않는다.
4. 시나리오가 변경되면 `git status`와 `origin/main` diff로 확인한다. 좌표·mock cue 조정은 기존 계약 안에서 반영하고, 맵 순서·핵심 기믹·완료 조건·Gate 연결이 바뀌면 사용자 검토 전 구현 방향을 고정하지 않는다.
5. 맵 definition과 gameplay state에는 이미지·음원 경로를 기록하지 않는다. asset 선택은 environment/audio catalog 주입 경계에만 둔다.
6. 구현 완료 전 `AreaDefinitionValidator`가 ID·참조·bounds·Rope 경로·Gate 목표를 검사해야 한다.

## 구현 추적

| 범위 | 상태 |
| --- | --- |
| `1-1`~`1-8` local area data | 완료 |
| 한 월드 전역 좌표 조립 | 완료 |
| ID·참조·bounds·Rope 경로 validator | 완료 |
| 기존 physics/renderer에 authored world 주입 | 완료 |
| objective·Gate runtime | 완료 |
| Wind force·Sentry FSM/activation/LOS/no-crossfire | 완료 |
| 공용 simulation의 로컬·네트워크 snapshot/claim 수렴 | 완료 |
| 데스크톱·모바일 연속 플레이 | 대기 |
