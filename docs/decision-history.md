# 결정 기록 전체 이력

이 문서는 더 이상 활성 인계에 둘 필요는 없지만 프로젝트의 방향과 이유를 보존해야 하는 결정을 기록한다. 현재 작업에 직접 영향을 주는 결정은 루트 `SESSION-HANDOFF.md`에 둔다.

## 기록 형식

```markdown
## [L1 또는 L2] YYYY-MM-DD — 결정 제목

- 맥락: 결정이 필요했던 이유
- 결정: 선택한 방향
- 영향: 변경된 시스템이나 후속 제약
- 대체: 대체된 결정 또는 `없음`
```

## 현재 이력

## [L1] 2026-08-17 — 960초 Timer와 다음 Gate 자동 합류를 일반 구간 기준으로 사용한다

- 맥락: 하층 정체를 억제하면서 0초 뒤에도 협동 진행을 이어 갈 첫 Timer prototype이 필요했다.
- 결정: `960초`, 내부 Gate당 `+45초`, cap `960초`, 상승 붕괴 `80px/s`를 사용하고 먼저 잡힌 Player는 관전 뒤 다음 Gate에서 합류시킨다.
- 영향: 긴 Sector 예산과 Stage/Gate portal을 전제로 Timer·붕괴·개인 합류가 하나의 계약으로 묶였다.
- 대체: 일반 구간은 `60초`, 진행 보상 `+10초`, cap `60초`, `CONTAINMENT PURGE FIELD` `240px/s`를 사용한다. Purge 접촉은 lethal이고 전멸은 current Sector만 reset하며 증강과 이전 Sector 진행을 보존한다. Boss 진입에서는 일반 Timer·Purge·잔여 시간을 종료하고 별도 Boss 계약을 시작한다. seamless Sector에서 정확한 `+10초` trigger, Field origin과 개인 사망 복귀는 후속 결정 전 HOLD다.
- 검증 상태: 현재 계약은 `docs/sector-timer-and-boss-flow.md`가 소유하며 Runtime은 아직 미구현이다.

## [L2] 2026-08-18 — 계획·완료 대화까지 GitHub 작업 조정 대상으로 삼는다

- 맥락: 병렬 작업 충돌을 넓게 예방하려고 계획 단계, 예정 파일, 열린 Issue·PR과 완료된 대화까지 범위 카드·ACK·반복 재확인 대상으로 포함했다.
- 결정: Issue 생성 뒤부터 세 시점에 조정을 반복하고 관련 가능성이 있는 대화끼리 계획과 예정 범위를 교환한다.
- 영향: 사용자가 이미 분배한 개발 계획을 에이전트가 다시 조정하고, 구현을 마친 대화가 후속 메시지로 재활성화되는 오버헤드가 생겼다.
- 대체: `$coordinate-github-tasks`는 두 활성 대화가 실제로 동시에 구현 소스를 수정해 같은 checkout·hunk·public contract에서 충돌할 때만 사용한다. 계획 분배는 사용자가 소유하며 새 구현은 새 대화에서 시작한다.
- 검증 상태: 스킬, `$github-task-flow`, 개발 규칙과 인계 문서에 동일한 진입 게이트를 적용하고 회귀 테스트로 고정한다.

## [L2] 2026-08-17 — 1-1 P0는 256px 충돌을 유지하고 시각 기초만 아래로 잇는다

- 맥락: 새 Sector 01 깊이 배경 적용 뒤 1-1의 얇은 P0가 공중에 떠 보였지만 기존 승인 Blockout의 Collision을 먼저 보존하려 했다.
- 결정: P0의 `256×32` one-way Collision은 유지하고 같은 폭의 `terrain:ground-foundation` 시각 기초만 640px 아래로 이어 그린다.
- 영향: 발판 바로 아래는 지지됐지만 좌우 바닥이 비어 있어 최하층 전체가 하나의 꽉 찬 바닥으로 읽히지 않았다.
- 대체: 사용자의 최신 요청에 따라 P0 Collision과 기초 표현을 모두 좌우 authored 경계벽 사이 `X=-448~448`, 폭 896px로 확장한다. Spawn·Anchor·상부 발판·Recovery 위치는 유지한다.
- 검증 상태: `areaDefinitionValidator`, `authoredWorldAssembler`, `environmentRendering`과 데스크톱·모바일 C01 실제 화면으로 대체 계약을 확인한다.

## [L1] 2026-08-17 — 기본 자동 사격을 전투 보조 수단으로 사용한다

- 맥락: 초기 전투 프로토타입은 플레이어가 이동만 해도 사거리 안의 최근접 적에게 자동으로 탄환을 발사했다.
- 결정: 자동 무기를 기본 전투 보조 수단으로 항상 활성화하고, 로프는 주로 이동과 생존을 담당하게 했다.
- 영향: 이동 숙련과 무관하게 적 피해가 자동 발생해 로프 액션을 잘했을 때 얻는 직접 전투 보상이 약했다.
- 대체: 기본 자동 사격은 비활성화하고 시스템만 보존한다. 기본 적 피해는 로프 부착 중 최소 속도를 넘긴 새 몸체 충돌로 발생하며, 현재 기준은 `SESSION-HANDOFF.md`와 `docs/game-hackathon-planning.md`를 따른다.
- 검증 상태: 기본 플레이의 무발사, 명시 opt-in 자동 무기 회귀, 싱글·멀티 로프 충돌 claim을 자동 테스트한다.

## [L2] 2026-08-17 — 부착 로프를 접지 여부보다 먼저 애니메이션으로 표시한다

- 맥락: 최초 플레이어 표현 resolver는 로프가 부착돼 있으면 접지·수직 이동보다 먼저 `rope`를 선택하고, 로프 없는 상승은 정지된 `jump` clip만 표시했다.
- 결정: 부착 상태 자체를 매달림 자세의 충분조건으로 사용하고 상승·하강은 각각 고정 `jump`·`fall` 모션으로 구분했다.
- 영향: 플레이어가 발판에 닿은 채 로프를 유지하면 매달린 자세가 나타났고, 로프 없는 상승 구간도 소닉형 회전감 없이 정지 자세로 보였다.
- 대체: `rope`는 공중 부착 상태에서만 표시한다. 로프 없는 상승은 `jump` clip에 초당 2회전의 renderer 전용 회전을 합성하고 하강은 기존 `fall`을 유지한다. 현재 기준은 `SESSION-HANDOFF.md`와 `docs/architecture.md`의 **렌더링 프로필 경계**를 따른다.
- 검증 상태: `tests/renderingSystem.mjs`가 지상 부착, 공중 부착, 상승 회전 합성, 하강 무회전을 구분한다.

## [L2] 2026-08-16 — 로프 스카프를 두 단계 위아래 펄럭임으로 표현한다

- 맥락: 한 손 로프 자세에서 몸을 흔들지 않고도 이동감을 주기 위해 머리카락 끝과 길어진 스카프만 움직이는 두 프레임 루프를 사용했다.
- 결정: 몸·양손·다리를 고정하고 스카프 꼬리가 위·아래 두 실루엣을 번갈아 표시하게 했다.
- 영향: 몸 비율은 안정됐지만 실제 로프 이동의 관성보다 제자리에서 깃발이 위아래로 펄럭이는 모습에 가까웠다.
- 대체: `스카프는 항상 이동 반대쪽으로 뻗고 네 단계의 얕은 파동이 목에서 꼬리 끝으로 전달된다` — 뒤쪽 흐름을 유지하면서 저해상도에서도 천의 관성이 읽히도록 대체했다.
- 검증 상태: `assets/artwork/characters/player-main/source/validate_player_main.py`가 네 프레임의 고정 몸체 0픽셀 차이, 스카프 가로·세로 비율, 뒤쪽 길이와 인접 파동 차이를 검증한다.

## [L1] 2026-08-15 — Checkpoint Artifact 시스템을 제거하고 Foundation을 유일한 런 성장으로 둔다

- 맥락: Checkpoint 기반 Artifact(동력핵·연사 톱니·로프 공명기)는 Sector 1-4 Foundation 선택과 개념·획득 흐름이 겹쳐 하나의 런이 두 보상 계층을 동시에 설명했다. Artifact의 런타임·네트워크 claim·HUD·문서·테스트가 Foundation과 역할을 중복해 유지 비용이 컸다.
- 결정: Artifact Catalog·Inventory·선택·사망 손실·HUD·`artifact-selection` claim·`rope-swing` 강화 claim을 제거한다. Checkpoint는 진행 저장과 개인 부활만 소유하며 보상 선택을 열지 않는다. 1-4 Foundation 선택·개인별 상태·효과·네트워크 동기화·HUD는 유지하고, 2-3 Specialization은 Artifact가 아니라 Foundation choice primitive를 재사용한다. `RunMetrics.firstRewardSeconds`는 `firstFoundationSeconds`로 대체한다.
- 영향: 런 성장 경로가 Foundation 한 갈래로 정리되고, Grapple은 즉시 부착 대신 발사 후 비행해 부착하는 프로토타입(속도 1400px/s × 수명 2/7초 = 400px, 재발사 0.20초)으로 바뀐다. Sentry 계열은 HP 100·인식 760px·탄속 520px/s·재사격 1.0초로 조정한다.
- 대체: 이전 Artifact 유지·손실·Checkpoint 보상·로프 공명 강화 결정 전체를 대체한다.
- 검증 상태: #489에서 Artifact 제거, Grapple 발사, Sentry 조정과 함께 반영했다.

## [L2] 2026-08-14 — 절차 월드 시드 sweep을 기본 제품 검증으로 사용한다

- 맥락: 첫 로프 프로토타입은 완전 절차 생성된 48단계 경로였으므로 고정 회귀 시드와 1,000개 연속 시드의 상승·로프 사거리 통과성을 배포 전에 검사했다.
- 결정: `npm run validate:world`와 기본 gameplay suite가 절차 생성 경로와 summit 완료 계약을 계속 검증한다.
- 영향: 저작 영역이 기본 런이 된 뒤에도 현재 시나리오와 무관한 실패가 필수 검증을 막고, 기본 suite가 두 제품 구조를 동시에 설명했다.
- 대체: 기본 `npm test`는 현재 저작 area catalog·Gate 진행·content boundary를 검증한다. 절차 48단계 생성·1,000시드 sweep·summit 완료 테스트는 기본 검증에서 제외하되 seed·revision의 멀티 결정성 계약은 유지한다.
- 검증 상태: #442에서 기본 runner·문서·검증 명령을 함께 현행화한다.

## [L2] 2026-08-14 — 영역감을 위해 Gate 뒤 지형을 그대로 통과한다

- 맥락: 저작 영역을 하나의 연속 월드로 조립하면서 별도 scene 전환 없이 방·Shaft·Atrium의 연결감을 유지하려 했다.
- 결정: 열린 Gate는 공용 진행 상태만 다음 영역으로 바꾸고 플레이어 위치와 일시 물리 상태는 그대로 두며, 텔레포트를 사용하지 않는다.
- 영향: Gate 뒤 지형을 물리적으로 계속 이동해야 했고 로프·속도·회전 상태도 영역 경계를 넘었다.
- 대체: 열린 문을 같은 월드 안의 지속 단방향 포탈로 바꾼다. 첫 진입자가 공용 진행을 한 번 전진시키고 자기만 이동하며, 뒤의 플레이어는 같은 문에 직접 들어온 시점에 각각 이동한다. 진입자별로 로프·이동·회전·접지·입력 버퍼·일시 전투 상태를 초기화하되 진행 상태는 유지한다. 현재 기준은 `docs/sector-01-world-structure-plan.md`와 `docs/multiplayer-synchronization.md`를 따른다.
- 검증 상태: #432의 싱글·멀티 회귀와 원격 불연속 보간 검증으로 대체 계약을 확인한다.

## [L1] 2026-08-14 — 완전 절차 생성되는 48단계 대형 월드를 목표 제품 구조로 사용한다

- 맥락: 첫 프로토타입에서 로프 사거리·수직 상승·결정성과 멀티플레이 월드 재현을 빠르게 검증해야 했다.
- 결정: 같은 시드가 같은 48단계 수직 경로와 적 배치를 만드는 하나의 절차 생성 월드를 목표 제품 구조로 두고, 고정 월드는 초기 범위에서 제외했다.
- 영향: `WorldGenerator`, 시드/revision 동기화, 1,000개 시드 상승 경로 validator와 8레벨 간격 체크포인트를 먼저 구현했다.
- 대체: 한 런은 하나의 붕괴 도시 월드에서 계속되지만, 48개 맵은 별도 월드가 아니라 저자가 정한 입구·완료 조건·명시적 출구를 가진 진행 영역으로 사용한다. 현재 절차 생성 월드는 코어 검증과 마이그레이션의 구현 기준선으로 유지하며, 영역 내부 랜덤 변형 범위는 별도 기획으로 확정한다. 현재 기준은 `docs/game-hackathon-planning.md`와 `docs/sector-01-world-structure-plan.md`를 따른다.
- 검증 상태: 제품 결정과 구현 계획은 문서에 반영했으며 저작 영역 조립·Gate 진행·타이머 동작은 아직 구현하지 않았다.

## [L2] 2026-08-13 — 초기 프로토타입은 Canvas 플랫 도형을 기본으로 사용한다

- 맥락: 로프 궤적, 충돌과 전투 피드백을 먼저 검증해야 했고 정식 픽셀 자산과 애니메이션은 준비되지 않았다.
- 결정: HTML Canvas의 단순한 실루엣과 색으로 플레이어, 적, 지형과 VFX를 표현했다.
- 영향: 에셋 제작을 기다리지 않고 전체 게임 흐름을 구현했으며 현재도 `?renderer=polygon` fallback으로 사용할 수 있다.
- 대체: 정식 표현은 `docs/pixel-graphics-design-guide.md`의 혼합 도트 방향과 제작 규격으로 대체했다. Canvas 플랫 도형은 기본 디자인이 아니라 개발·실패 복구용 fallback으로 유지한다.
- 검증 상태: 기본 `sprite`와 `?renderer=polygon`이 같은 게임 상태를 그리는 렌더링 회귀 테스트로 두 경로를 유지한다.

## [L1] 2026-08-13 — Sector 01-3 SECURITY CHECK를 개념 중심 REV 2.0으로 구성한다

- 맥락: Cooling Shaft를 폐기한 뒤 첫 Sentry의 Red Telegraph와 Rope 회피라는 핵심 학습을 빠르게 정의해야 했다.
- 결정: Identification·Normal Ascent·Turret Reveal·Route Choice·Final Ascent의 5개 Zone과 Safe/Flow/Recovery Route, LOS 차단 후 Gate Override를 사용한다.
- 영향: 첫 Enemy를 1-3으로 고정하고 Rope Cut과 새 이동·환경 규칙을 제외했지만, Stage Bounds·좌표·Turret Timing·Asset 규격은 구현 가설로 남았다.
- 대체: `Sector 01-3 SECURITY CHECK` REV 3.0 — 960×1152 Blockout, Scanner S1, Anchor A–D, Turret T1, Safe Ledge·Recovery R1·Cover Wall C1, 명시적 Sentry FSM과 Story Trigger를 가진 제작 후보로 구체화했다.
- 검증 상태: 새 문서의 모든 수치는 Blockout Hypothesis이며 First Shot·Telegraph·LOS·Auto Weapon·Hit/Rope 상호작용 플레이테스트는 아직 진행하지 않았다.

## [L1] 2026-08-13 — Sector 01-2를 Anchor A–C 중심의 연속 Grapple 구간으로 구성한다

- 맥락: 초기 1-2 문서는 좌우 교차 Anchor A/B/C와 Landing을 통해 첫 연속 Grapple과 방향 전환을 설명했다.
- 결정: 약 1~2분의 Vertical Utility Shaft에서 세 Anchor를 연결하고, Recovery Platform을 통해 초보 경로를 제공한다.
- 영향: 기존 문서와 `01_swing_line.png`, `02_level_layout.png`가 Anchor A–C 기준으로 제작되었다.
- 대체: `Sector 01-2 DOUBLE ANCHOR SHAFT` REV 3.0 — 960×1088 Blockout에서 A=복습·B=첫 Airborne Handoff·C=방향 반전·D=Flow Test, P1/P2/P3 Recovery와 Crossbeam X1을 사용하는 Rope Input/Momentum Benchmark Stage로 대체했다.
- 검증 상태: 새 문서와 좌표는 Blockout Candidate이며, Anchor A–D Flow Route·`swingImpulse = 0`·Attach Forgiveness·Momentum 로그 플레이테스트는 아직 진행하지 않았다.

## [L1] 2026-08-13 — Sector 01-1에 첫 Sentry Turret과 Anchor 2개를 배치한다

- 맥락: 첫 오프닝 문서에서 두 번의 Rope 성공 뒤 Sentry Turret을 보여주고 이동 압박까지 한 레벨에서 가르치려 했다.
- 결정: Anchor A/B로 기본 상승을 학습한 뒤 첫 Turret을 통과하고 Service Terminal에서 Gate를 연다.
- 영향: 기존 REV 1.0 문서와 레이아웃 이미지에 Anchor 2개, Turret 1개와 Cooling Fan 배경을 포함했다.
- 대체: `Sector 01-1 SERVICE SHAFT` REV 3.0 — 첫 Enemy를 1-3으로 미루고, A=Attach·B=Release Timing·C=Swing Enjoyment와 R1/R2/R3 Recovery를 가진 32px Grid Authored Stage로 대체했다.
- 검증 상태: 새 문서와 제작 규격은 확정 후보이며 Blockout·No-Impulse 테스트와 플레이테스트는 아직 진행하지 않았다.

## [L1] 2026-08-13 — Sector 01-3을 Cooling Shaft 횡풍 튜토리얼로 구성한다

- 맥락: 1-2의 연속 Grapple 다음 단계로 환경 외력에 따라 달라지는 Swing 궤적과 타이밍을 가르치려 했다.
- 결정: 대형 Cooling Fan 두 개의 약한 횡풍과 주기적 강풍을 사용하고 적은 배치하지 않는다.
- 영향: Anchor A–C, Fan A/B, Recovery Platform과 Cooling Shaft 배경을 중심으로 1-3 문서와 레퍼런스 이미지를 구성했다.
- 대체: `Sector 01-3 SECURITY CHECK` — 새로운 이동·환경 규칙 대신 첫 Sentry Turret의 Red Telegraph와 Rope 회피를 가르친다. Cooling Shaft와 Wind 학습은 Build Expression 뒤의 `Sector 01-6 COOLING SHAFT` REV 3.0으로 이동했다.
- 검증 상태: 대체 방향은 유지되며 현재 상세 기준은 `docs/bsh/scenario/1/1-3/README.md` REV 3.0이다. Blockout과 플레이테스트는 아직 진행하지 않았다.
## [L2] 2026-08-12 — 플레이어와 환경별 최상위 runtime 폴더를 사용한다

- 맥락: 첫 player·environment manifest를 각각 도입하면서 `assets/sprites/`와 `assets/environment/`가 독립된 작업·runtime 경로를 함께 맡았다.
- 결정: 그래픽 담당자와 개발자가 각 자산 종류의 최상위 폴더에서 직접 작업했다.
- 영향: player와 environment 두 종류에서는 단순했지만 몹·장애물·효과·UI가 늘어날 때 납품 위치와 runtime 위치가 계속 달라질 구조였다.
- 대체: `assets/artwork/<category>/<asset-id>/`에 모든 제작·납품을 모으고, 검증된 게임 입력만 `assets/runtime/<category>/<asset-id>/`에서 ID로 참조하는 구조로 대체했다.
- 검증 상태: `RuntimeAssetCatalog` 경로 회귀 테스트, player·environment validator와 로컬 HTTP 자산 응답으로 새 구조를 확인한다.

## [L2] 2026-08-10 — 동료 구조와 팀 전멸 대기 대신 플레이어별 즉시 부활을 사용한다

- 맥락: 사망 뒤 무엇을 해야 부활하는지 안내되지 않아 플레이어가 게임이 멈췄거나 부활하지 않는다고 받아들였다.
- 결정: 체력 소진과 낙사를 같은 체크포인트 부활 경로로 합치고, 사망한 플레이어만 즉시 최대 체력으로 되돌린다.
- 영향: 동료와 공용 월드는 계속 진행하며 사망한 플레이어에게만 최근 아티팩트 약 1/3 손실을 적용한다. 다운·구조 상호작용·팀 전멸 상태는 사용하지 않는다.
- 대체: `다운된 동료를 72px 안에서 2.5초간 상호작용해 부활시키고 전원 다운 시 일괄 복귀한다` — 발견 가능성이 낮고 사망 직후의 원인·다음 행동을 이해하기 어려워 대체했다.
- 검증 상태: `tests/gameSimulation.mjs`와 `tests/authorityServerSession.mjs`가 체력 소진·낙사·동시 사망의 플레이어별 즉시 부활과 독립 손실을 검증한다.

## [L2] 2026-08-10 — 탄성 로프와 자동 회수로 진자 운동을 시작한다

- 맥락: 해제 타이밍만으로 진자 운동을 만들기 위해 부착 직후 로프가 늘어난 상태에서 자동으로 당겨지는 방식을 검토했다.
- 결정: 자연 길이 78%, 초당 70px 자동 회수, 스프링 강도 46과 A/D 수평 힘을 사용하는 탄성 로프로 시작했다.
- 영향: 로프가 사용자 방향 입력 없이도 운동량을 만들고 스프링처럼 당겨지는 감각이 강했다.
- 대체: `고정 길이 로프에서 접선 충격과 중력으로 회전한다` — 사용자가 정한 접선 방향과 해제 타이밍이 운동을 주도하도록 변경했다.
- 검증 상태: 대체 완료. 현재 게임플레이 메인 시나리오가 `FixedLengthRope`, 방사 속도 제거와 접선 드래그를 함께 검증한다.

## [L2] 2026-08-10 — 고정 픽셀 드래그 임계값과 초기 스윙 수치를 사용한다

- 맥락: 첫 PC 프로토타입에서 접선 드래그 발동 조건과 액션 강도를 빠르게 검증해야 했다.
- 결정: 44px 또는 80px 고정 드래그와 460·620 등 초기 임펄스 후보를 사용했다.
- 영향: 화면 크기에 따라 모바일 발동 난이도가 달라지고 문서마다 수치가 어긋났다.
- 대체: `화면 짧은 변 비율로 접선 드래그를 판정한다` — 현재는 짧은 변의 11%, 0.08초 최소 홀드, 임펄스 780을 단일 설정에서 사용한다.
- 검증 상태: 대체 완료. `tests/gameplayScenario.mjs`와 `tests/clientDeliveryScenario.mjs`가 스윙 드래그·시뮬레이션·모바일 입력 계약을 함께 검증한다.
