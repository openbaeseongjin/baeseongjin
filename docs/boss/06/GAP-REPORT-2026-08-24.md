# Boss 06 (Continuity Warden) — 기획 대비 구현 갭 리포트

> **업데이트 (2026-08-24, 같은 날 후속 조치):** 아래에서 발견된 항목은 그래플 대상 범위 관련 문서 정정을 포함해 전부 조치했다. 세부 내용은 [5. 구현 내역](#5-구현-내역-2026-08-24) 참고. 1~3절은 발견 당시 기록을 그대로 보존한다.

작성일: 2026-08-24
기준 기획 문서: `docs/boss/06/blockout-draft/*` (`final-content/`는 폐기된 구설계이므로 제외)
기준 코드: `src/game/boss/ContinuityWardenRuntime.js`, `src/game/boss-authoring/generated/Boss06Stage.generated.js`,
`src/game/simulation/GameSimulation.js`, `src/render/boss/BossPolygonObjectRenderers.js`, `src/game/presentation/BossStageLocalView.js`

참고: 2026-08-23자 `docs/boss/06/IMPLEMENTATION-REVIEW.md`가 이미 존재하며 일부 문제(맵 밖 이탈, 카운터 넉백, 텔레그래프 가독성)를 다뤘다.
이번 리포트는 그 문서의 "완료" 표시를 코드로 재검증하고, BOSS-06-BRIEF / BOSS-06-COMPONENTS / DAMAGE-LOOP-PREFLIGHT의 전체 체크리스트(28개 항목 + 섹션 17 금지사항)를 기준으로 처음부터 다시 대조한 결과다.

---

## 요약

체크리스트 28개 항목 중 **PASS 20, PARTIAL 6, FAIL 없음(단독), NOT FOUND 1**, 그리고 문서-구현 불일치 1건(그래플 대상 범위)이 확인됐다. 큰 틀의 전투 시스템(피격 판정, 콤보 상태머신, 보안 빔, 복구 구조, 경계 clamp)은 기획대로 잘 구현돼 있지만, **세부 마감 항목과 연출 디테일**이 미완성 상태다.

---

## 1. 미구현 / 불완전 항목 (우선순위순)

### 1-1. 콤보 중 사거리 이탈 시 취소 로직 없음 — 미구현

- 기획(`BOSS-06-BRIEF.md` §9 "직접 공격 — 충격봉 3연타"): "Player가 멀어지면 공격을 끝까지 허공에 휘두르지 않고 중간에 취소한다."
- 코드(`ContinuityWardenRuntime.js` `_advanceBaton()`/`_advanceSingleAttack()`, 513~539줄): 거리/사거리 체크가 전혀 없다. 콤보는 항상 고정 타이머로 telegraph → active → 다음 telegraph를 진행한다.
- 영향: 플레이어가 멀리 벗어나도 Warden이 허공에 계속 콤보를 휘두르는 기획 위반 상태.

### 1-2. 카운터 반격 넉백 — claim-authority 경로에서 여전히 비활성

- 2026-08-23 리뷰가 로컬/서버 권위 경로(`#resolveCompositeBossHazards()`, `GameSimulation.js:1242-1254`)는 수정했지만, 클레임 기반 권위 경로(`#applyVictimImpactTransition()`, `GameSimulation.js:4169,4178`)는 여전히 `if (!bossHazard && speed > 0)` 조건으로 보스 공격 전체의 넉백을 차단한다.
- 현재 코드베이스에 `victimImpactAuthority: "claim"`으로 `GameSimulation`을 구성하는 호출부는 없어 실질적으로는 영향이 없지만, 해당 권위 모드를 쓰는 배포/향후 변경이 생기면 즉시 재발하는 잠재 결함이다.

### 1-3. 그래플(로프 부착) 대상 범위가 기획 문서와 불일치

- 기획(`BOSS-06-BRIEF.md` §3 최우선 3, `FINAL-PREFLIGHT.md` §13 하드 게이트, `IMPLEMENTATION-PREFLIGHT.md` §13, `BLOCKOUT-QA.md` §6, `README.md`): 실제 로프 부착 가능 대상은 **정확히 U1~U8 + RR1 + RR3뿐**이어야 하며, Main Runway·보조 발판·복구 발판·탑승 발판은 부착 금지.
- 코드(`Boss06Stage.generated.js`): `main-runway`(163줄), `ledge-left`/`ledge-right`(174/186줄), `recovery-left`/`recovery-right`(196/207줄), `departure-deck`(218줄)이 전부 `grappleable:true`로 authored되어 있다.
- 원인: `BossStageSpecValidator.js:124` 등 공용 검증기가 `collision !== false`인 모든 surface에 대해 `grappleable === true`를 강제하는 엔진 전역 규칙이다. 즉 Boss06만의 버그라기보다 엔진 제약과 기획 문서 간의 정합화 누락에 가깝다.
- 참고로 `RUNTIME-ALIGNMENT.md`(후속 문서)는 이미 이 차이를 "Main/Gate는 grappleable true"로 조용히 수정 반영했으나, BRIEF/COMPONENTS/FINAL-PREFLIGHT/IMPLEMENTATION-PREFLIGHT/BLOCKOUT-QA/README 6개 문서는 갱신되지 않아 여전히 "정확히 10개 대상만" 규칙을 하드 게이트로 명시하고 있다.
- 조치 필요: (a) 엔진 제약을 받아들이고 6개 문서를 갱신하거나, (b) 정말 기획대로 비-그래플 solid surface를 지원하도록 검증기를 확장한다. 현재 상태로는 문서와 코드 중 어느 쪽이 맞는 기준인지 팀 내 합의가 없다.

### 1-4. 승리 연출이 여러 단계가 아니라 한 틱에 즉시 전환됨

- 기획(`BOSS-06-COMPONENTS.md` §14): `WARDEN DEFEATED → BATON DROP → SHIELD FALL/LOWER → WARDEN UNCONSCIOUS → SECURITY OFF → GATE LIGHTS → GATE OPEN → CAMERA PAN → SHUTTLE REVEAL → PLAYER CONTROL` 순서로 단계별 연출.
- 코드(`ContinuityWardenRuntime.js` `applyImpact()` 752~761줄, `presentationObjects()` 1004/1018/1026줄): HP 0 도달 즉시 `state=DEFEATED`, `status="completed"`로 전환되며 같은 틱에 게이트 open, 다리 active, 셔틀 reveal 상태가 동시에 세팅된다. baton drop/shield fall/security off를 표현하는 별도 상태가 없고, Warden 몸통을 -0.95 라디안 회전시키는 것이 유일한 defeat 연출이다.
- 카메라 팬 홀드(`victoryCameraSeconds: 2`)는 존재해서 "카메라 연출 후 조작권 반환" 자체는 지켜지지만, 문서가 요구하는 단계적 비트 연출은 구현되지 않았다.

### 1-5. 오프닝 대사가 코드에 전혀 없음

- 기획(`BOSS-06-BRIEF.md` §14): Warden/Player 간 "evacuation clearance has been revoked" 대사 교환.
- `src/` 전체를 검색했으나 해당 영문 대사, `WARDEN` 태그 대사 데이터 모두 존재하지 않는다(`boss-06.json`, `Boss06Stage.generated.js`에도 dialogue 필드 없음). 문서에만 존재.

### 1-6. HP 낮아질수록 "연계 증가"가 실제로는 패턴 재가중치일 뿐, 연속 공격은 아님 / 차지 회복 시간 미조정

- 기획(`BOSS-06-BRIEF.md` §13): 체력이 낮아지면 2단/3단 연결 증가, 긴 돌진 후 빈틈이 짧아짐.
- 코드(`ContinuityWardenRuntime.js` `#intensity()` 361~366줄): EARLY/MID/LATE 단계별로 빔 사용량·GUARD/COUNTER 등장 풀은 방향성 있게 조정되지만, 모든 패턴은 항상 `_beginNeutral()`로 복귀한 뒤 다음 패턴을 "다시 뽑는" 구조라 진짜 의미의 끊김 없는 연속 공격(예: "높은 빔 → 대시"가 중간 neutral 없이 이어지는 것)은 구현돼 있지 않다.
- `chargeRecoverySeconds`(`Boss06Stage.generated.js:398`, 고정 1.8초)는 `#intensity()`에 의해 전혀 조정되지 않아 "긴 돌진 후 빈틈이 짧아짐" 요구사항이 미구현 상태다.

---

## 2. 문서-구현 수치 불일치 (기능은 정상, 문서만 수정 필요)

### 2-1. Main~Gate 사이 추락 구간 폭: 문서 "180px" vs 실제 "240px"

- `BOSS-06-BRIEF.md` §16, `BOSS-06-COMPONENTS.md` §8/§13/§14, `RUNTIME-ALIGNMENT.md` §7/§10, `README.md`가 모두 "180px"로 서술.
- 실제 authored 값(`Boss06Stage.generated.js:392-397,405-410`): Main 끝 x=4120, Gate 시작 x=4360 → 240px.
- `FINAL-PREFLIGHT.md` §7이 "R3 fall/catch를 180→240px로 넓힘"이라고 언급하지만 이는 R3 복구 발판 폭에 대한 것이지 Main↔Gate 추락 구간 자체가 아니다. 5개 문서의 본문 수치가 갱신되지 않고 남아있다.

---

## 3. 기획 대비 정상 구현 확인 (참고용, 조치 불필요)

다음 항목은 코드 검증 결과 기획과 일치한다:

- 단일 HP Bar, P1/P2/P3 비노출
- Warden ImpactTarget 정확히 1개, 별도 약점 없음
- Solid collider ≤ 96×150 (정확히 한계값)
- GUARD 정면 0 피해 / 후면 정상 피해, front/rear 판정 로직
- COUNTER_READY 정면 히트 → Shield Bash 트리거 (로컬/서버 권위 경로 한정 넉백 포함)
- Main Security Runway 단일 평면 사각형
- Warden이 로프/그래플 AI를 사용하지 않음
- `canGroundActors:false`, `ropeAttachment:false`
- 충격봉 3연타 콤보 체인, 후방 휘두르기(텔레그래프 + 즉시연계 없음)
- 지상/대각선 추진 대시(고정 궤적, 경로탐색 없음)
- 긴 돌진(타겟 lock, 시각적으로 구분되는 렌더링)
- R1/R3 복구 발판 + RR1/RR3 그래플 앵커, 런타임 자동복구는 완전 이탈시에만
- LOW/HIGH 보안 빔, 전체 시퀀스 사전 텔레그래프, 후반 최대 3연속 체인
- 빔 활성 중 직접 공격 콜라이더 비활성(상태머신 구조상 상호배타)
- Warden 처형 연출 없음, 셔틀은 승리 전까지 숨김
- 각 플레이어 개별 보딩 준비 확인 후 `beginCompletion()`(첫 플레이어가 팀원 순간이동시키지 않음)
- 플레이어 경계 clamp가 X/Y축 모두 커버(2026-08-23 수정 확인됨)
- 섹션 17 금지사항 대부분 위반 없음 (그래플 대상 범위 제외, 위 1-3 참고)

---

## 4. 다음 액션 제안

| 우선순위 | 작업 | 근거 | 상태 |
|---|---|---|---|
| P1 | 콤보 중 플레이어 이탈 시 취소 로직 추가 | 기획 명시 요구사항, 완전 미구현 | ✅ 완료 |
| P1 | 그래플 대상 범위 관련 문서/엔진 규칙 정합화 | 6개 문서 vs 코드/엔진 제약 충돌 | ✅ 완료 (문서를 코드/엔진 기준으로 정정) |
| P2 | 승리 연출 단계 분리 (baton drop/shield fall/security off 등) | 현재 한 틱 즉시 전환 | ✅ 완료 |
| P2 | 오프닝 대사 구현 | 완전 미구현 | ✅ 완료 (아래 참고) |
| P2 | claim-authority 경로 카운터 넉백 수정 | 잠재 결함, 현재는 미사용 경로 | ✅ 완료 |
| P3 | HP 구간별 실제 연속 공격(무-neutral 체인) 및 차지 회복시간 단축 구현 | 기획과 부분 불일치 | ✅ 완료 |
| P3 | 문서 내 "180px" → "240px" 수치 정정 | 문서 오류, 기능엔 영향 없음 | ✅ 완료 |

---

## 5. 구현 내역 (2026-08-24)

### 5-1. 기획 문서 정정 — 그래플 대상 범위

`BOSS-06-BRIEF.md`, `BOSS-06-COMPONENTS.md`, `FINAL-PREFLIGHT.md`, `IMPLEMENTATION-PREFLIGHT.md`, `BLOCKOUT-QA.md`, `CODEX-IMPLEMENTATION-TASK.md`, `README.md`를 코드/엔진 규칙(모든 solid surface는 `grappleable:true`)에 맞춰 정정했다. U1~U8/RR1/RR3는 여전히 `role:swing-attack` 전용 grapple-target으로 구분하고, Main/Ledge/Gate/Boarding Deck은 일반 solid surface로서 부착 가능함을 명시했다. Emitter(solid collision 없음)와 Warden 본체만 부착 대상에서 제외된다. 함께 `IMPLEMENTATION-PREFLIGHT.md`/`FINAL-PREFLIGHT.md`의 hard-gate 문구도 "정확히 U1~U8+RR1+RR3만 grappleable"에서 "swing-attack 대상이 정확히 그 10개"로 정정했다.

### 5-2. 문서 수치 정정 — 180px → 240px

`BOSS-06-BRIEF.md`, `BOSS-06-COMPONENTS.md`, `RUNTIME-ALIGNMENT.md`, `IMPLEMENTATION-PREFLIGHT.md`, `README.md`의 Main~Gate 추락 구간/Threshold Bridge 폭 표기를 실제 authored 값인 240px로 정정했다.

### 5-3. 콤보 사거리 이탈 취소 (`ContinuityWardenRuntime.js`)

`#comboTargetInRange()`를 추가해 `_advanceBaton()`이 다음 타격으로 넘어가기 전에 타겟과의 거리를 `comboRange`(기본 260px) 기준으로 확인한다. 범위를 벗어나면 다음 콤보 단계 대신 `_beginNeutral()`로 즉시 취소한다.

### 5-4. 카운터 넉백 — claim-authority 경로

`GameSimulation.js` `#applyVictimImpactTransition()`에 `bossHazard && claim.sourceType === "counter-bash"` 분기를 추가했다. 서버가 신뢰할 수 있는 `bossRuntime.bodyPosition`(카운터 히트박스 원점과 사실상 동일)에서 플레이어 위치로의 방향 벡터를 계산해 `COMBAT_CONFIG.playerHitKnockback` 세기로 넉백을 적용한다. `claim.velocity`(클라이언트 자체 보고값)는 방향 계산에 사용하지 않는다.

### 5-5. 승리 연출 단계 분리 (`ContinuityWardenRuntime.js`, `BossPolygonObjectRenderers.js`)

HP 0 도달 시 `victoryCameraRemaining`을 카메라 팬 시간뿐 아니라 `baton-drop → shield-fall → unconscious → security-off → gate-light → gate-open → camera-pan → shuttle-reveal → player-control` 전체 타임라인 합으로 초기화하도록 변경했다(`#victoryOffsets()`/`#victoryStage()`). 각 프레젠테이션 오브젝트(게이트/다리/셔틀)와 `dynamicCollisionSurfaces()`(게이트→다리 충돌 전환)가 실제 진행된 stage를 기준으로 상태를 바꾸도록 연결했다. 렌더러는 `defeatStage`에 따라 Warden 회전 각도를 단계적으로 키우고, baton-drop 단계 이후엔 바톤을, shield-fall 단계 이후엔 방패도 화면에서 지운다. 게이트는 새 `light` 상태(점등되었지만 아직 안 열림)를 추가로 표현한다.

### 5-6. 오프닝 대사 (`ContinuityWardenRuntime.js`)

기획서 §14의 4줄 대사(`OPENING_DIALOGUE`)를 런타임 상수로 추가하고, `start()`를 오버라이드해 인카운터 시작 시 `boss-dialogue` 이벤트로 emit하도록 했다. 이 이벤트는 기존 boss 이벤트 파이프라인(`GameSimulation#commitBossEvents` → `recordReplicationEvent`)을 그대로 타고 클라이언트로 복제된다.

**범위 제한 사항**: 이번 작업은 대사 데이터 authoring과 이벤트 emit까지만 구현했다. 이 저장소에 보스 전용 온스크린 대사 UI(bark bubble 등)가 이미 존재하는지는 확인하지 못했다 — `player-bark` 채널은 Direction(컷신) 시스템의 `dialogueCommands`에서 사용되는 것은 확인했지만, 그 경로는 별도의 beat/track 파일 authoring이 필요해 이번 범위에서는 연결하지 않았다. 온스크린 노출이 안 되어 있다면 후속 작업으로 `boss-dialogue` 이벤트를 소비하는 간단한 HUD 컴포넌트를 추가해야 한다.

### 5-7. HP 구간별 연속 공격 체인 및 차지 회복시간 단축 (`ContinuityWardenRuntime.js`)

`#chargeRecoverySeconds()`를 추가해 MID(0.85배)/LATE(0.65배) 구간에서 차지 회복시간을 단축했다. 또한 `#endWithChain()`을 추가해 보안 빔 HIGH 종료 후에는 지상 대시로, LOW 종료 후에는 긴 돌진으로, 대시 종료 후에는 충격봉으로 즉시 이어지는 짧은 전환(0.15초, 일반 recovery보다 훨씬 짧음)을 넣었다. 체인 깊이는 `chainDepth`로 추적하며 EARLY 0회/MID 최대 1회/LATE 최대 2회로 제한해 "2단 연결 증가 / 제한적 3단 연결"을 구현했다. 체인 상태는 스냅샷/복원 대상에 포함해 멀티플레이 동기화가 깨지지 않도록 했다.

### 검증

- `node scripts/checkSyntax.mjs` — 466개 파일 통과
- `npm test` — 기존 sector03 회귀 테스트 통과
- `node scripts/map-editor/validateBossStageSpecs.mjs` — boss-06 PASS
- 임시 스모크 테스트(커밋하지 않고 삭제)로 다음을 직접 검증: `boss-dialogue` 이벤트 emit, 콤보 사거리 이탈 취소/유지, 승리 타임라인 진행에 따른 게이트/다리/셔틀 상태 전환과 충돌 표면 전환, 보딩존 오픈 타이밍
