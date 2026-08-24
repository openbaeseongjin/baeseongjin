# Boss06 CONTINUITY WARDEN — 구현 지시서

> **V2 SUPERSEDED:** 현재 작업 지시는 [`../BOSS-06-V3-CONTRACT.md`](../BOSS-06-V3-CONTRACT.md)로 대체됐다.

> 기준 main: `20e6c22deb6e95d9a5a7e351a95874d931a0a845`
> 설계 권위: `docs/boss/06/blockout-draft/BOSS-06-BRIEF.md`
> 구현 안전 Gate: `IMPLEMENTATION-PREFLIGHT.md`, `FINAL-PREFLIGHT.md`

## 목표

`6-8 ROOFTOP PAD 03` 이후 `CONTINUITY WARDEN` 인간형 최종 보스전을 실제 Runtime에 구현한다.

## 작업 순서

### 최우선 1 — Terminal Boss 연결

- 6-8 `content-boundary` 완료 후 Boss06 entry
- regular 6-9 추가 금지
- Boss defeat 후 arena 유지
- Gate/Bridge/Shuttle/Boarding
- Boarding 완료 시 기존 `beginCompletion()` 사용

### 최우선 2 — Boss06 Spec / Runtime 골격

- `continuity-warden` mechanic/runtime 등록
- `CompositeBossEncounterRuntime` 재사용
- visible HP 하나
- 별도 weakpoint 0
- body ImpactTarget exactly 1

### 최우선 3 — Physics

- Main collision flat rectangle 1개
- Warden solid body <=96×150
- Warden `canGroundActors:false`
- Warden `ropeAttachment:false`
- U1~U8 + RR1/RR3 = actual swing-attack anchors
- 그 외 Boss06 solid surface(Main/Ledge/Gate/Boarding)는 공용 지형 규칙에 따라 grappleable true; Emitter/Warden만 grappleable 대상 아님

### 최우선 4 — 피격 / Guard / Counter

- common Boss impact path에서 impact/source position을 Warden runtime에 전달
- facing + impact position으로 front/rear 분류
- Guard front=0, rear=normal
- Counter front=Bash, rear=normal

### 최우선 5 — 기본 공격

- Baton 3타, 3타 Overhead
- Back Swing
- Ground/Diagonal Thruster Dash
- Charge + Recovery
- Dash/Charge candidate가 solid와 겹치거나 Arena 밖이면 행동 선택/진행 취소

### 중요 — Security

- LOW/HIGH
- sequential 2, late 3
- first Telegraph에서 full order 공개
- Security active 중 direct attack 금지
- Beam은 `activeHazards()` damage bounds, solid collision 아님

### 중요 — multiplayer

- direct target: Main combat zone nearest active player
- Recovery player direct target 제외
- Charge: Telegraph 시 target/direction lock, commit 후 retarget 없음
- 1P와 4P test

### 중요 — Presentation

- Warden visual silhouette가 96×150 hit envelope와 크게 다르지 않게 유지
- Anchor marker는 Warden/Beam보다 foreground
- camera focus에 Warden 포함
- Guard/Charge/Security readability shot 검증

## 필수 자동 테스트

1. ImpactTarget count = 1
2. separate weakpoint = 0
3. body target/body actor position equality
4. Guard front/rear
5. Counter front/rear
6. Main surface count = 1
7. expected Grapple target set exact equality
8. Anchor-vs-solid overlap = 0
9. adjacent Rope links <=400
10. non-adjacent accidental shortcut <=400 = 0
11. jump-apex LOW escape coverage spans usable Main x
12. RR1/RR3 sampled reach <=400
13. Warden collider <=96×150
14. Warden cannot ground Player / cannot be Rope target
15. Dash/Charge body/hazard remains inside combat bounds
16. blocked Dash/Reposition never penetrates solid
17. 4P entry bodies inside Main
18. Security and direct melee are not damaging simultaneously
19. victory Gate collision removed + bridge enabled
20. Boarding triggers run completion

## 검증 명령

기존 저장소 기준:

- `npm run check`
- `npm run format:check`
- `npm run check:scenario-integration`
- 관련 Boss validator/tests
- `git diff --check`

그리고 Map Editor Gameplay View로:

- Neutral
- Guard
- Charge
- LOW
- HIGH
- 3연속 Security
- Victory/Boarding

을 직접 확인한다.

## 완료 보고에 반드시 포함

- 수정 파일 목록
- 새/확장 Runtime 계약 목록
- 자동 테스트 결과
- 1P/4P Gameplay View 결과
- 의도한 Grapple target 실제 목록
- Warden body target/collider 실제 수치
- 알려진 미해결 사항

## 최우선 추가 — Player → Boss 실제 피해 루프

`DAMAGE-LOOP-PREFLIGHT.md`와 `DAMAGE-CHECKS.json`을 구현 권위로 사용한다.

반드시 실제 GameSimulation에서 검증:

```text
attach U anchor
→ trigger Swing Drag
→ rope remains attached
→ hit Warden body at >=620
→ boss HP decreases
```

Test matrix:

- Warden x: left / quarter / center / three-quarter / right
- Neutral: 양쪽 진입
- Guard: front block / rear damage
- Counter: front Bash / rear damage
- Charge miss: arena edge rear punish
- Warden Ledge: adjacent anchor impact

Guard/Counter selection:
`wardenCenterX < 1250 || > 3870` 이면 해당 상태 선택 금지.

단순 `ImpactTarget.applyImpact()` unit test만으로 완료 처리하지 말고,
**실제 RopeImpactAttack → ImpactTarget → Boss HP 감소 통합 테스트**를 넣는다.
