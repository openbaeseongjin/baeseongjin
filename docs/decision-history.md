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

## [L2] 2026-08-13 — 초기 프로토타입은 Canvas 플랫 도형을 기본으로 사용한다

- 맥락: 로프 궤적, 충돌과 전투 피드백을 먼저 검증해야 했고 정식 픽셀 자산과 애니메이션은 준비되지 않았다.
- 결정: HTML Canvas의 단순한 실루엣과 색으로 플레이어, 적, 지형과 VFX를 표현했다.
- 영향: 에셋 제작을 기다리지 않고 전체 게임 흐름을 구현했으며 현재도 `?renderer=polygon` fallback으로 사용할 수 있다.
- 대체: 정식 표현은 `docs/pixel-graphics-design-guide.md`의 혼합 도트 방향과 제작 규격으로 대체했다. Canvas 플랫 도형은 기본 디자인이 아니라 개발·실패 복구용 fallback으로 유지한다.
- 검증 상태: 기본 `sprite`와 `?renderer=polygon`이 같은 게임 상태를 그리는 렌더링 회귀 테스트로 두 경로를 유지한다.

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
- 대체: `Sector 01-3 SECURITY CHECK` — 새로운 이동·환경 규칙 대신 첫 Sentry Turret의 Red Telegraph와 Rope 회피를 가르치고, Safe/Flow/Recovery 경로와 LOS 차단 해소 구간을 사용하는 Authored Stage로 대체했다.
- 검증 상태: 새 기준은 `docs/bsh/scenario/1-3/README.md` REV 2.0이며 Blockout과 플레이테스트는 아직 진행하지 않았다.

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
