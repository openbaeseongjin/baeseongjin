# BOSS 06 — IMPLEMENTATION PREFLIGHT

> 목적: 다른 Boss 구현에서 발생한 `약점이 Boss 내부에 생성되어 타격 불가`, `Anchor/발판 배치 불량`, `공간이 좁아 이동 불가` 문제를 Boss06 구현 전에 차단한다.
> 기준 GitHub main: `20e6c22deb6e95d9a5a7e351a95874d931a0a845`

## 판정

**Boss06 설계는 진행 가능. 아래 HARD GATE를 Runtime/Map Editor에서 통과하기 전에는 MERGE READY로 올리지 않는다.**

## 1. 약점 문제 — 별도 Weakpoint를 만들지 않는다

Boss06는 Warden 몸 전체가 기본 피격 대상이다.

```text
impactTargetIds = ["boss-06:continuity-warden:body"]
```

HARD RULE:
- 별도 `rear-core`, `shield-core`, `weakpoint-circle` 금지
- body collision actor와 body ImpactTarget `position` 동일
- body ImpactTarget collider와 Warden physics collider 동일 geometry
- `GUARD` / `COUNTER`는 target on/off가 아니라 impact direction response
- GUARD/COUNTER 중에도 body target은 active
- Shield/Baton visual을 solid body collider에 포함하지 않음

필수 자동 테스트:
1. Neutral front → damage > 0
2. Neutral rear → damage > 0
3. Guard front → damage = 0
4. Guard rear → damage > 0
5. Counter front → damage = 0 + `counter-bash`
6. Counter rear → normal damage
7. Charge recovery front/rear → normal damage
8. 모든 combat state에서 body target position == body actor position
9. Boss06 ImpactTarget count == 1

이 계약이면 “약점이 몸 안에 숨어 타격이 안 되는” 실패 유형 자체가 없다.

## 2. Warden 물리 크기 상한

다른 대형 Boss collider를 재사용하지 않는다.

```text
Warden solid collision envelope <= 96px × 150px
```

이 값은 damage/timing 튜닝이 아니라 현재 Arena의 collision 안전 상한이다.

- Player actual radius: 15px
- Main→Ledge underside clear height: 234px
- Raised Ledge width: 280px
- Warden 96px width로 ledge center에 서면 좌우 margin ≈92px

금지:
- Boss04 `bodyRadius:140` 같은 대형 원형 collider 재사용
- Shield 포함 200px+ solid collider
- Baton reach를 body collider 크기로 구현

## 3. Warden은 발판/Anchor가 아니다

```text
canGroundActors = false
ropeAttachment = false
```

- Player가 Warden 위에 서는 동작 금지
- Warden 자체를 Rope로 잡는 동작 금지
- Shield/Baton/Thruster/Beam은 `activeHazards()` geometry
- Shield/Baton/Beam을 static collision surface로 추가하지 않음

## 4. Main Runway는 실제 Runtime에서 하나의 평면 Surface

이전 초안의 시각적 완만한 경사는 폐기한다. 현재 Boss surface compiler는 rectangular bounds를 실제 collision surface로 만든다.

실제 Main collision:

```text
x=1000
y=1900
width=3120
height=115
grappleable=false
```

**하나의 flat rectangle만 사용.**

이유:
- Ground 이동에 step 없음
- Baton 이동 막힘 없음
- Ground Thruster 턱 없음
- Charge가 별도 rectangle 경계에 충돌하지 않음

높이차는 Ledge L/R에서만 제공한다.

## 5. Raised Ledge 공간

- Ledge L/R width: 280px
- underside→Main clear height: 234px
- grappleable=false
- Warden diagonal dash의 짧은 landing만 담당
- landing x는 `halfBossWidth + safety` 안쪽으로 clamp

## 6. Upper Rope Anchor

U1~U8:
- `role:"swing-attack"`
- 최신 main이 24×24 real grapple-target으로 materialize
- 인접 최대 ≈363.46px
- 비인접 ≤400px shortcut = 0
- Main→U1/U8 실제 hand-offset 근사 ≈374px / 379px
- 최소 Anchor→solid clearance = 175px
- solid surface 내부 Anchor = 0

Boss06 실제 grappleable 집합은 정확히:

```text
U1 U2 U3 U4 U5 U6 U7 U8 RR1 RR3
```

Main/Ledge/Emitter/Gate/Boarding Deck/Warden은 grappleable=false.

## 7. Anchor가 보스/이펙트 뒤에 숨지 않게 한다

Boss Stage renderer는 presentation object 순서대로 그린다.

Boss06 custom presentation에서는 grapple-anchor marker를 Warden/Beam 뒤가 아니라 **마지막 쪽에 append**해 항상 전경에 보이게 한다.

Acceptance:
- Warden이 Ledge 위에 있어도 근처 Anchor marker 식별 가능
- HIGH/LOW Telegraph 중 다음 이동 Anchor 식별 가능
- Beam active 중에도 target marker를 읽을 수 있음

## 8. Recovery는 화면 표시와 실제 Grapple Target을 동일하게

Draft03에서는 R2 deep gantry를 제거한다.

### R1
- deck x=540..1000, y=2310
- RR1=(770,2000), `role:"swing-attack"`
- deck 양 끝 샘플 기준 RR1 최대 거리 ≈376px
- RR1→Main edge ≈251px

### R3
- deck x=3980..4300, y=2310
- RR3=(4220,2000), `role:"swing-attack"`
- deck 양 끝 샘플 기준 RR3 최대 거리 ≈368px
- RR3→Main edge ≈156px 이내

R1/R3까지 완전히 놓친 경우에만 custom `recoverPlayer()` fallback.

**프리뷰에만 있고 Runtime에는 없는 Return Anchor 금지.**

## 9. Emitter / Beam이 이동 공간을 먹지 않게 한다

Emitter:
```text
collision=false
grappleable=false
ropeOccluder=false
```

Beam:
- `activeHazards()` bounds only
- static collision surface 금지
- damage only

특히 오른쪽 Emitter가 시각적으로 180px fall lane 근처에 있으므로 collision=true가 되면 공간이 좁아진다. 반드시 non-collision.

## 10. Gate

- Main edge x=4120
- Gate x=4300
- combat 중 180px 실제 fall lane
- Gate는 Main Charge lane을 침범하지 않음

Victory:
- Gate collision 제거/open
- 180px Threshold Bridge 활성화
- Boarding Deck 연결

## 11. Entry

Boss entry spawn은 Main 위에 직접 둔다.

```text
entry approx x=1080, player center y=1885
Main top y=1900
```

지지면까지 15px이므로 spawn-in-void나 발판 내부 spawn을 피한다.

## 12. Camera / 실제 Gameplay View

HTML Preview만으로 PASS 처리 금지.

Map Editor Gameplay View에서 반드시:
- Neutral: Player + Warden + 가까운 Rope Anchor 2개 이상
- Guard: Shield 방향 + 후면 우회 Anchor 동시 표시
- Charge: Telegraph + Charge path + 회피 Anchor + Recovery 위치 동시 표시
- Security: Telegraph + Player + 다음 safe band 동시 표시

실제 game renderer / input / production compiler 결과를 최종 권위로 사용한다.

## 13. 저장 적용 전 Assertions

권장 자동 검증:

```text
assert mainCollisionSurfaces.length == 1
assert mainCollisionSurface is flat rectangle
assert actualGrappleIds == expectedGrappleIds
assert noSwingAnchorInsideCollisionSurface
assert allUpperAdjacentDistances <= 400
assert noUnplannedUpperShortcut <= 400
assert RR1/RR3 reachableFromSampledDeckPoints
assert wardenCollider.width <= 96
assert wardenCollider.height <= 150
assert warden.ropeAttachment == false
assert warden.canGroundActors == false
assert emitters.collision == false
assert gate does not overlap Main runway
assert bodyImpactTarget.position == wardenBody.position
assert boss06ImpactTargetCount == 1
```

## 14. 1인 / 4인 공간 검증

1인:
- Warden/Player 교차
- Guard flank
- Charge miss/punish
- Ledge landing
- R1/R3 recovery

4인:
- entry portal spacing 후 body overlap 없음
- Main에 4 Player + Warden이 있어도 끼임 없음
- R1/R3에 2명 이상 떨어져도 RR 사용 가능
- Warden target 변경 시 순간 teleport/비정상 회전 없음

## 15. 구현 중단 조건

아래 중 하나라도 발생하면 구현/merge 중단:
- dummy weakpoint가 Warden 내부에 생김
- body ImpactTarget 이외의 Boss06 target이 생김
- Warden collider >96×150인데 Arena 재검증 없음
- Main collision deck이 여러 높이 rectangle로 쪼개짐
- RR1/RR3가 actual swing-attack anchor가 아님
- Emitter/Beam이 solid collision
- Warden이 Rope attachment target
- 의도하지 않은 Grapple surface가 추가됨
- Gameplay View에서 회피 Anchor가 화면 밖으로 사라짐


# Player Damage Hard Gate

Boss06 구현은 `DAMAGE-LOOP-PREFLIGHT.md`를 추가 필수 Gate로 사용한다.

- Player damage = Rope Impact
- `rope attached + speed >=620 + body overlap`
- Warden body target exactly 1
- U1~U8 final coordinates는 `DAMAGE-CHECKS.json` 기준
- Warden의 모든 합법 Main center 위치는 nearest attack Anchor distance <= `380.43px`
- Guard/Counter는 `x=1250..3870` 안에서만 선택
- actual GameSimulation에서 HP 감소 확인 전 Damage Loop PASS 선언 금지
