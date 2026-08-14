# SECTOR 01 — AUGMENT & STORY INTEGRATION

*FOUNDATION AUGMENT · STORY PROGRESSION · PRODUCTION CONTRACT · REV 1.0*

이 문서는 Sector 01의 맵, 시나리오, 이미지, Runtime을 수정할 때 증강이 기존 Rope와 충돌하지 않고 Story 진행 안에서 자연스럽게 등장하도록 만드는 공통 계약이다. 각 Stage README가 개별 공간을 정의하고, 이 문서는 Stage 사이의 누적 의미와 증강 호환성을 정의한다.

## 1. 핵심 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Foundation Augment 최초 선택 | `DECIDED` | 1-4 Maintenance Node에서 `Impulse Coil`, `Relay Link`, `Shear Current` 중 1개를 고정 목록으로 선택 |
| 1-1~1-3 증강 사용 | `REJECTED` | 기본 Rope 학습과 기준 측정을 위해 증강 효과·선택 UI를 노출하지 않음 |
| 새 전용 버튼·Rope Mode 전환 | `REJECTED` | 기존 Attach·Hold·Release 입력 안에서 효과가 발생해야 함 |
| 무증강 기본 경로 | `DECIDED` | 1-5~1-8도 기본 Rope로 통과할 수 있어야 하며 증강은 더 유리한 해석을 제공 |
| Foundation과 Artifact | `DECIDED` | 서로 다른 보상 계층으로 분리. Foundation은 Rope 정체성, Artifact는 Run 중 전투·빌드 변화 |
| 선택 지속성 | `DECIDED` | 1-4 이후 Sector 01 종료까지 개인별 선택 유지. 사망·Checkpoint로 임의 변경하지 않음 |
| Story 결과 분기 | `REJECTED` | 증강마다 결말을 갈라 콘텐츠를 3배로 만들지 않음. 경로·피드백만 달라지고 핵심 사건은 동일 |
| 세부 수치 | `PROTOTYPE` | 현재 코드값과 플레이테스트를 기준으로 후보를 만들고 Stage 통과율·조작 성공률로 조정 |

## 2. Story 안에서의 증강 정의

증강은 마법, 무작위 축복, 외부에서 갑자기 주어지는 초능력이 아니다. 사고 후 Player가 규정 밖 방식으로 Maintenance Rope를 사용하면서 축적된 Grapple Telemetry를 Maintenance Node가 읽고, 안전하게 적용할 수 있는 세 가지 비상 Firmware Profile로 재구성한 것이다.

따라서 선택 장면의 의미는 “새 능력을 받는다”가 아니라 다음과 같다.

> 시설이 Player의 비정상적인 Rope 운용을 진단하고, 그 움직임을 한 방향으로 전문화한다.

이 정의는 세 가지 효과를 만든다.

- 1-2의 연속 Attach는 `Relay Link`의 서사적 근거가 된다.
- 1-3의 위협 속 Release와 Rope 궤적은 `Impulse Coil`, `Shear Current`의 근거가 된다.
- 1-4의 선택지는 무작위가 아니라 앞 Stage에서 기록된 동일한 Telemetry를 해석한 세 가지 안전 Profile이 된다.

## 3. Stage별 누적 진행

| Stage | Story Beat | 증강 상태 | 맵·시스템 계약 |
| --- | --- | --- | --- |
| 1-1 SERVICE SHAFT | 사고 직후 하층 고립. Maintenance Rope가 유일한 수직 이동 수단임을 확인 | 비활성 | 기본 Attach·Swing·Release 기준선 확보. 미래 증강 없이 완전 통과 가능 |
| 1-2 DOUBLE ANCHOR SHAFT | 고장 난 Lift 대신 규정 밖 연속 Grapple로 상승. 시설이 Attach 간격과 공중 전환을 기록 | 비활성·Foreshadow | Relay 이전의 공중 Re-Attach 성공률 측정. 보정 효과나 선택 UI 금지 |
| 1-3 SECURITY CHECK | Security가 Player의 경로를 승인되지 않은 접근으로 판정하고 Sentry를 활성화 | 비활성·Telemetry 확정 | Red Telegraph→Evade→Release→Pass 학습. 출구 Override가 Rope 기록을 Maintenance Node로 전달 |
| 1-4 MAINTENANCE NODE | Node가 누적 Telemetry를 진단하고 세 가지 비상 Firmware Profile을 제시 | 최초 선택 | 3개 고정 선택, 무작위 없음. 선택 뒤 짧은 Calibration으로 입력 변화 확인 |
| 1-5 AUGMENT TEST BAY | 폐쇄 전 장비 시험장이 선택한 Profile의 실전 적합성을 검증 | 활성·첫 표현 | 하나의 공간과 하나의 Start/Exit. 기본 경로와 증강별 최적 경로를 함께 제공 |
| 1-6 COOLING SHAFT | 냉각 계통 이상으로 Wind가 발생하고 환경이 Rope 궤적을 바꿈 | 활성·환경 적용 | 모든 증강을 억지로 우대하지 않음. Wind는 공통 문제이고 증강은 선택적 해결 방식 |
| 1-7 PRESSURE BYPASS | 자동 우회가 끊겨 Player가 Rope·Sentry·Wind를 동시에 관리 | 활성·조합 검증 | 같은 목표를 Timing, Chaining, Geometry 중 선택한 강점으로 해결 |
| 1-8 CONTAINMENT GATE | 누적 보안 위반으로 Containment가 진입을 거부. 수동 Override 뒤 하층 Grid가 정지 | 활성·Sector 결산 | 증강별 접근과 피드백은 다르되 Gate 개방과 Worker District 공개는 동일 |

## 4. Foundation Augment 행동 계약

### IMPULSE COIL — Momentum / Timing

- `DECIDED`: Release Timing을 잘 맞췄을 때 기존 운동량을 더 유리하게 변환한다.
- `DECIDED`: 상시 이동속도 증가나 단순 Damage 배율로 만들지 않는다.
- `PROTOTYPE`: Attach 이후 충분한 Swing과 유효한 접선 방향 Release가 확인될 때만 짧은 Impulse 또는 속도 보존 보너스를 적용한다.
- `HYPOTHESIS`: 현재 기본 Rope의 `swingImpulse = 780`을 증강 전용으로 옮기는 안은 확정하지 않는다. 1-1과 1-2를 현재값, 중간값, 0으로 각각 검증해 기본 Rope의 재미와 통과 가능성을 먼저 확인한다.
- 저비용 원칙: Release Event에서 조건을 한 번 판정하고 별도 상시 스캔을 만들지 않는다.

### RELAY LINK — Chaining / Rhythm

- `DECIDED`: 성공적인 Release 뒤 다음 Attach 한 번의 연결 허용도를 높인다.
- `DECIDED`: 항상 켜진 Auto Aim이나 자동 Anchor 선택으로 만들지 않는다.
- `PROTOTYPE`: Release Window `0.50 / 0.65 / 0.80초`를 비교하고, Window 안의 다음 Attach에만 입력 Buffer와 Aim 허용도를 제한적으로 확장한다.
- 현재 기준값인 Attach Buffer `100ms`, Aim Tolerance `90`은 보존하고, 증강 후보값은 각각 `160ms`, `108`부터 테스트한다.
- 저비용 원칙: Release 때 만료 시각만 기록하고 다음 Attach 한 번에서 소비한다.

### SHEAR CURRENT — Geometry / Offense

- `DECIDED`: Release 순간 Anchor와 Player를 잇던 Rope Segment가 Enemy Body를 가로지르면 절단 피해를 준다.
- `DECIDED`: Projectile, Wall, 장식 Props를 동시에 절단하지 않는다.
- `DECIDED`: 같은 Release에서 같은 Enemy는 한 번만 판정한다.
- `PROTOTYPE`: 피해량과 Segment 허용 폭은 1-5와 1-7의 Sentry 생존 시간, Rope 위험도, 자동 사격과의 중첩을 보고 조정한다.
- 저비용 원칙: Release 순간의 Segment 교차만 계산하고 매 Frame Rope 충돌을 돌리지 않는다.

## 5. Stage 호환성 Matrix

| Stage | 기본 Rope | Impulse Coil | Relay Link | Shear Current |
| --- | --- | --- | --- | --- |
| 1-5 | 안전한 공통 경로 | 긴 Gap·높은 Landing 단축 | 연속 Anchor 경로 안정화 | Sentry를 가로지르는 공격적 궤적 |
| 1-6 | Wind 주기에 맞춘 정석 이동 | 맞바람 구간의 Release Timing 보상 | Wind 사이 Anchor 연결 회복 | 직접 우대하지 않아도 됨. 적이 있다면 선택적 궤적 이득만 제공 |
| 1-7 | Recovery를 쓰는 완전 통과 경로 | Pressure Cycle 사이 빠른 돌파 | 복수 Anchor를 잇는 안정적 우회 | Sentry와 Rope 각도를 동시에 푸는 고위험 단축 |
| 1-8 | Override까지 도달하는 공통 경로 | Gate 전 마지막 상승 단축 | 끊긴 Service Anchor 연결 | Containment Sentry를 통과하는 공격 경로 |

각 Stage는 세 증강을 위한 별도 방 세 개를 만들지 않는다. 하나의 공간에서 Anchor 배치, Timing, Enemy 위치가 서로 다른 장점을 만들게 한다. 특정 증강이 한 Stage에서 중립이어도 실패가 아니다. 모든 Stage에서 모든 선택지를 같은 강도로 보상하려 하면 공간이 인위적으로 보이고 제작량이 증가한다.

## 6. Artifact와의 분리·호환

| 계층 | 획득 시점 | 역할 | 초기 호환 규칙 |
| --- | --- | --- | --- |
| Foundation Augment | 1-4 Maintenance Node | Rope 행동의 장기 정체성 | 개인 상태로 저장·동기화, Sector 중 교체 없음 |
| Artifact | Checkpoint 또는 Run Reward | 자동 공격·전투 수치·조건부 Build 변화 | Foundation의 판정 Window와 Geometry를 직접 변경하지 않음 |

- `Power Core`, `Rapid Gear`는 초기에는 Shear 피해나 Relay Window를 증폭하지 않는다.
- `Rope Resonance`는 공통 `swing-complete` 또는 그에 준하는 단일 Event만 구독한다. Foundation 때문에 같은 Swing이 두 번 발동하면 FAIL이다.
- Shear 피해는 첫 Prototype에서 Artifact Damage 배율과 분리한다. 의도적인 Synergy는 기본 밸런스가 확보된 뒤 별도 결정한다.
- 1-4에서 Foundation을 선택한 직후 Artifact 선택을 연속으로 띄우지 않는다. 두 시스템의 의미를 한 화면에서 섞지 않는다.

## 7. Story·System Event 계약

1-2에서는 별도 Story Event를 새로 만들지 않고 기존 이동 Metric으로 공중 Re-Attach Telemetry를 축적한다. 이후 연결에는 현재 Area Catalog의 Stable ID를 우선한다.

| Stage | Stable Event | 의미 |
| --- | --- | --- |
| 1-3 | `employee-scan` | Player가 정상 정비 직원임을 먼저 확정 |
| 1-3 | `return-warning` | 승인 구역으로 돌아가라는 마지막 경고 |
| 1-3 | `unauthorized-transit` | Rope 이동이 규정 위반으로 전환되는 Story 분기점 |
| 1-3 | `turret-activate` | 보안 대응 시작. 별도 처형 명령은 아님 |
| 1-3 | `maintenance-override` | 정비 권한으로 Gate를 수동 개방 |
| 1-3 | `violation-logged` | 이동·보안 대응 기록을 남겨 1-4 진단의 근거 생성 |
| 1-4 | `grapple-detected` | Maintenance Node가 비정상 Rope 기록을 인식 |
| 1-4 | `telemetry-analyzed` | 동일한 기록에서 세 Profile을 계산 |
| 1-4 | `override-available` | 비상 Firmware 적용 권한 제시 |
| 1-4 | `augment-selected` | 개인별 Foundation 선택 확정 |
| 1-4 | `firmware-applied` | Calibration과 이후 Stage 적용 시작 |

1-8의 `containment-denied`, `lower-grid-shutdown`은 해당 Stage Runtime 정렬 때 Stable ID와 실제 Trigger를 함께 확정한다. 구현되지 않은 이름을 먼저 Runtime 계약으로 고정하지 않는다.

문구와 VFX는 개인 화면에 표시할 수 있지만 Gate, Objective, Sector 전환은 공용 상태로 한 번만 처리한다. Foundation 선택은 Player별 상태이므로 멀티플레이에서 Host 한 명의 선택을 다른 Player에게 복사하면 안 된다.

## 8. Runtime 구조와 저비용 원칙

- Player별 `foundationAugment`는 `none | impulse-coil | relay-link | shear-current` 중 하나만 가진다.
- 순간 상태는 `augmentRuntimeState`에 분리하고 Release·Attach 같은 기존 Rope Event에서만 갱신한다.
- Maintenance Node와 Checkpoint를 별도 특수 UI로 계속 복제하지 않고 `RewardSource`가 `augment` 또는 `artifact` 선택을 열도록 공통화한다.
- Foundation 선택, Calibration 완료, Gate 진행 상태를 네트워크에서 명시적으로 동기화한다.
- 화면 밖 Enemy, Lamp, Fan, 배경 Layer는 갱신하지 않는다.
- 증강 때문에 Physics Engine을 교체하거나 Rope Segment를 매 Frame 전수 충돌 검사하지 않는다.
- 기존 Rope 수학, Projectile, Sentry Telegraph, 공용 VFX Atlas를 재사용한다.

## 9. 검증 지표

| 구간 | 먼저 측정할 값 | 목적 |
| --- | --- | --- |
| 1-1 | 첫 Attach 성공률, Release 후 Landing률, Recovery 사용률 | 증강 없는 기본 Rope 품질 확인 |
| 1-2 | A→B·B→C·C→D 전환 성공률, 무착지 완주율 | Relay 후보가 해결해야 할 실제 마찰 확인 |
| 1-3 | Telegraph 인지→회피 성공률, 피격 위치, Rope 절단 빈도 | 전투가 Rope 학습을 가리는지 확인 |
| 1-5 | 증강별 경로 선택률, 완주 시간, 피해량, 기본 경로 사용률 | 선택지가 실제 플레이 방식을 바꾸는지 확인 |
| 1-6~1-8 | 증강별 사망 원인·완주 시간·Recovery 의존도 | 한 선택만 정답이 되는 Dominant Build 방지 |

수치는 레퍼런스 게임에서 그대로 복사하지 않는다. SANABI, Rusted Moss, Flinthook, Hades 등에서는 입력–결과 연결, Momentum 보존, 선택지의 행동 변화 같은 설계 원리를 추출하고, 실제 값은 현재 게임의 Rope 거리 `440px`, 중력 `1250`, 최대 수평 속도 `360`, 점프 속도 `440`, 공격 범위와 카메라 안에서 다시 측정한다.

## 10. 앞으로의 Stage 수정 체크리스트

각 Stage를 수정하거나 새 이미지를 만들 때 다음을 한 번에 갱신한다.

- 시나리오의 한 문장 역할과 앞·뒤 Stage의 Story 인과
- Approved Blockout과 Runtime 좌표
- Scenario Art Reference의 Gameplay 정보 위계
- 기본 Rope 통과 경로와 증강별 선택적 이점
- Foundation과 Artifact의 중복·이중 발동 여부
- Desktop·Mobile Camera에서 Telegraph, Anchor, Recovery 가독성
- 저비용 자산 재사용과 화면 밖 Update 제한
- `DECIDED / PROTOTYPE / HYPOTHESIS / REJECTED` 상태 표시

이 항목 중 하나가 바뀌면 관련 문서, 이미지, Runtime 중 하나만 단독으로 수정하지 않는다. 같은 변경 안에서 서로의 기준을 다시 맞춘다.
