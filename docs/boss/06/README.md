# Boss 06 — CONTINUITY WARDEN

상태: **HUMAN-BOSS REDESIGN / DAMAGE PREFLIGHT PASS / RUNTIME IMPLEMENTATION NEXT / RUNTIME NOT IMPLEMENTED**

이 문서는 기존 `PAD 03 Containment Clamp Security System` 기획을 대체하기 위한 Boss06 인간형 최종 보스 재설계 Blockout이다.

- source ZIP SHA-256: `72be0adfc27e3f714024c6d0f6f331652b2d3d50c288fb32adc2f83b299edd4d`
- imported Blockout Markdown은 저장소의 `git diff --check` 규칙에 맞춰 줄끝 공백만 정규화했으며, 정규화 전 원본 파일 SHA-256은 package manifest와 대조했다.
- 이 변경은 authoring·Blockout·정적 preview 인계다. terminal Boss transition, Warden Runtime, boarding과 ending은 별도 구현 작업에서만 반영한다.

## 현재 기준

- GitHub main 확인 기준: `20e6c22deb6e95d9a5a7e351a95874d931a0a845`
- 6-8 현행: `ROOFTOP PAD 03`, `nextAreaId: null`, `pad-access-console` 완료 후 `content-boundary`
- Base Rope Reach: `400px`
- 기존 Boss06 Clamp / Structural Island / Departure Tower 설계: **SUPERSEDED FOR REDESIGN**

## 핵심 정의

> **CONTINUITY WARDEN = Pad 03의 탈출 권한과 보안 시스템을 현장에서 집행하는 인간형 최종 보스.**

Warden은 Rope를 사용하지 않는다. Shield, Baton, Thruster Dash와 Pad Security Beam Gate를 이용해 공간을 통제하고, Player는 Rope를 이용해 정면 통제를 우회한다.

## 전투 계약

- 하나의 visible HP Bar
- Player에게 보이는 P1/P2/P3 없음
- 내부 authoring은 단일 combat segment로 처리 가능
- 평상시 Warden body damage 허용
- `GUARD` 중 정면 공격 완전 방어 / 후면 정상 피해
- `COUNTER READY` 중 정면 공격은 Shield Bash로 반격
- 직접전 : Pad Security ≈ 50 : 50
- HP가 낮아져도 신규 기술 추가 없음
- 후반 난도 = 패턴 연결 증가 + Security 사용 증가

## Arena

`PAD 03 SECURITY COURT`

- 수평 중심 + Raised Ledge에서만 약한 높이차
- 하나의 flat rectangular Main Security Runway collision surface
- 완만한 파형 Upper `swing-attack` Hardpoint U1~U8
- Warden 전용 Raised Ledge 좌/우 2개
- Open Sky
- R1/R3 actual catch + actual swing-attack return anchors; deeper miss uses Runtime fallback
- 오른쪽 Main edge와 Gate 사이 180px 실제 fall lane
- Victory 시 180px threshold bridge가 열려 Boarding Deck과 연결
- Shuttle은 전투 중 숨김
- Warden 패배 후 Gate light → Gate open → camera pan → Shuttle 최초 Reveal

## 최신 main 재사용점

최신 main에는 이미 Boss `swing-attack` anchor materialization, custom Encounter Runtime factory, `CompositeBossEncounterRuntime`, `activeHazards()`, `recoverPlayer()`, `impactTargetSnapshot()` 경로가 존재한다.

Boss06는 이를 우선 재사용하고, 별도의 Rope AI나 새 범용 hazard framework를 만들지 않는다.

## 문서

- [`BOSS-06-BRIEF.md`](./blockout-draft/BOSS-06-BRIEF.md)
- [`BOSS-06-COMPONENTS.md`](./blockout-draft/BOSS-06-COMPONENTS.md)
- [`MAP-PREVIEW.html`](./blockout-draft/MAP-PREVIEW.html)
- [`BLOCKOUT-QA.md`](./blockout-draft/BLOCKOUT-QA.md)
- [`RUNTIME-ALIGNMENT.md`](./blockout-draft/RUNTIME-ALIGNMENT.md)
- [`VALIDATION.md`](./blockout-draft/VALIDATION.md)

## Runtime 주의

이 패키지는 **기획/Blockout 인계**다. Boss06 Runtime 구현 완료를 주장하지 않는다.

남은 핵심 구현:
- post-6-8 terminal Boss transition
- `continuity-warden` custom encounter runtime
- frontal Guard/Counter를 위한 impact position 전달
- Warden visual preset / renderer
- terminal victory → Gate/Bridge/Shuttle → Boarding → `beginCompletion()`
- multiplayer targeting / boarding completion 정책

## 이전 초안 correction

Draft01 QA에서 발견된 다음 문제를 이전 초안에서 수정했다.

- Preview sequence button ID mismatch
- solid floor 아래 접근 불가 Recovery
- standing Player를 못 막던 LOW band
- anchor line만 막던 HIGH band
- Beam 좌우 safe pocket
- Gate 뒤 Boarding floor 부재
- Guard/Charge Warden duplicate presentation
- Main↔Upper entry reach QA 누락
- 오른쪽 Recovery fall lane과 Gate threshold 충돌


## Implementation Preflight

구현 전에 [`IMPLEMENTATION-PREFLIGHT.md`](./blockout-draft/IMPLEMENTATION-PREFLIGHT.md)를 필수 Gate로 사용한다.

핵심:
- dummy weakpoint 금지
- body ImpactTarget exactly 1
- Warden solid collider <=96×150
- Main collision deck exactly 1
- RR1/RR3 actual swing-attack anchors
- Emitter/Beam solid collision 금지
- Gameplay View 필수

- [`FINAL-PREFLIGHT.md`](./blockout-draft/FINAL-PREFLIGHT.md)
- [`CODEX-IMPLEMENTATION-TASK.md`](./blockout-draft/CODEX-IMPLEMENTATION-TASK.md)

- [`DAMAGE-LOOP-PREFLIGHT.md`](./blockout-draft/DAMAGE-LOOP-PREFLIGHT.md)
- [`DAMAGE-CHECKS.json`](./blockout-draft/DAMAGE-CHECKS.json)
