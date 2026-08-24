# BOSS 06 — CONTINUITY WARDEN COMPONENTS

> **V2 SUPERSEDED:** 현재 구성은 [`../BOSS-06-V3-CONTRACT.md`](../BOSS-06-V3-CONTRACT.md)가 소유한다. 아래 U1~U8·평면 보행 계약은 구현 입력이 아니다.

> 상태: **BLOCKOUT DRAFT 02**
> 목적: 구현 이전에 Boss06가 필요로 하는 시각·전투·Arena 구성요소를 명확히 분리한다.

## 1. Boss Object — CONTINUITY WARDEN

시각 구성:

- human-scale body
- security helmet / visor
- industrial security harness
- left-arm Shield
- right-hand shock Baton
- short-range Thruster unit
- Pad Security control interface

금지:

- Rope/Grapple AI
- giant mecha transformation
- supernatural power
- CEO/corporate mastermind presentation

## 2. Boss Action States

전투 상태 후보:

- `neutral`
- `baton-1`
- `baton-2`
- `overhead-slam`
- `back-swing`
- `ground-thruster-dash`
- `diagonal-thruster-dash`
- `charge-telegraph`
- `charge-active`
- `charge-recovery`
- `guard`
- `counter-ready`
- `counter-bash`
- `security-command`
- `security-walk`
- `defeated`

실제 ID는 구현 시 기존 naming convention에 맞춰 결정한다.

## 3. Boss State Readability

Player는 텍스트 설명 없이 최소 다음 상태를 구분할 수 있어야 한다.

```text
NEUTRAL
ATTACK TELEGRAPH
ATTACK ACTIVE
RECOVERY
GUARD
COUNTER READY
SECURITY COMMAND
SECURITY ACTIVE
DEFEATED
```

특히 `GUARD`와 `COUNTER READY`는 실루엣이 달라야 한다.

- GUARD = Shield를 명확히 전방에 세움
- COUNTER = Shield를 숨기거나 낮추고 반격 준비 자세

## 4. Baton Components

### Baton Combo

- 1타: 짧은 정면 타격
- 2타: 방향 유지 연계
- 3타: Overhead Slam

3타는 1·2타보다 큰 실루엣과 바닥 impact cue 필요.

### Back Swing

- 후방 범위
- 느린 Telegraph
- flank 성공 이후 장기 체류만 방지

## 5. Shield Components

### Guard

- 정면 block arc
- front hit = blocked
- rear hit = normal damage

### Counter

- distinct ready state
- frontal valid hit triggers Shield Bash
- Player knockback / distance reset
- no hit → timeout → neutral

## 6. Thruster Components

### Ground Dash

- short horizontal authored motion
- active contact damage

### Diagonal Dash

- Main Runway ↔ Ledge L/R
- fixed short trajectories 우선
- pathfinding 금지
- active contact damage

Thruster trail은 실제 damage path와 일치해야 한다.

## 7. Charge Components

- pressure approach behavior
- direction-lock Telegraph
- long charge path
- active contact damage
- clear miss recovery

Charge와 Thruster를 시각적으로 구분한다.

```text
THRUSTER = short / quick reposition attack
CHARGE   = long / committed / punishable attack
```

## 8. Arena Objects

필수:

- Main Security Runway
- Upper Service Frame
- U1~U8 visible grapple hardpoints (`role: swing-attack`)
- Raised Ledge L
- Raised Ledge R
- Security Beam Emitter Left
- Security Beam Emitter Right
- Recovery Deck R1 — left primary outer catch
- Recovery Deck R3 — right primary outer catch
- R1/R3 miss — Runtime recovery fallback
- Return Hardpoint RR1/RR3 — actual `role:swing-attack`
- Departure Gate
- Departure / Boarding Deck
- Victory Threshold Bridge (combat 중 비활성 / victory 후 240px gap 연결)
- post-victory Maintenance Shuttle reveal object

## 9. Upper Hardpoint Route

Blockout coordinates:

| ID  |    x |    y |
| --- | ---: | ---: |
| U1  | 1550 | 1510 |
| U2  | 1840 | 1445 |
| U3  | 2130 | 1390 |
| U4  | 2420 | 1445 |
| U5  | 2710 | 1510 |
| U6  | 3000 | 1445 |
| U7  | 3290 | 1390 |
| U8  | 3580 | 1510 |

Base Reach 400px 기준 인접 거리는 약 295~314px. U1/U8은 Main floor edge-entry용으로 낮게 배치한다.

현재 좌표 초안에서 비인접 Hardpoint 사이 ≤400px shortcut은 없다.

주의:

> 최신 main은 `role: swing-attack` Boss anchor를 24×24 `grapple-target` surface로 자동 materialize한다. U1~~U8은 이 공용 계약을 사용한다. Main/Ledge/Gate는 엔진의 공용 지형 규칙에 따라 다른 solid surface와 마찬가지로 `grappleable:true`이며(Emitter는 solid collision이 없어 부착 대상이 아니다), final QA는 U1~~U8/RR1/RR3의 `swing-attack` 부착과 나머지 solid surface의 일반 부착을 모두 포함한다.

## 10. Security Beam Components

### LOW Beam

- 실제 standing Player body band와 overlap
- combat floor 전체 폭 cover
- upper route safe response

### HIGH Beam

- anchor line이 아니라 upper Rope Player movement envelope control
- Main standing band는 safe response

### Sequence Telegraph

UI/World cue에서 전체 순서 표시:

```text
LOW → HIGH
HIGH → LOW
LOW → HIGH → LOW
HIGH → LOW → HIGH
```

첫 Beam만 알려주고 다음 Beam을 숨기는 방식 금지.

## 11. Security + Warden Contract

Security Beam Active 중:

- Warden direct attack OFF
- Warden slow pursuit allowed
- direct attack collider OFF
- next chained attack starts after Security sequence ends

화면 복잡도와 single-hazard Runtime 제약을 고려해, 이 Blockout에서는 동시에 여러 독립 direct hazards를 겹치지 않는다.

## 12. Recovery

Recovery Deck은 visible / safe / non-offensive.

- R1/R3는 Main outer edge 아래의 primary catch
- R1/R3를 놓치면 숨은 발판 대신 Runtime recovery fallback을 사용
- solid Main floor 아래에 직접 drop-through하는 구조는 사용하지 않음
- Warden 접근/공격 없음
- Player가 Boss를 공격할 수 있는 유리한 sniper space가 되면 안 됨
- RR1/RR3는 실제 primary catch 복귀용 `swing-attack` Anchor이며 별도 RR2는 만들지 않는다.

## 13. Departure Gate

전투 중:

- closed
- Shuttle hidden
- objective direction을 보여주는 최종 배경 요소

승리 후:

- gate light activation
- gate opening
- camera pan
- Shuttle reveal
- Departure / Boarding Deck
- Victory Threshold Bridge (combat 중 비활성 / victory 후 240px gap 연결) 위 Player-controlled walk

## 14. Victory Presentation

순서:

```text
WARDEN DEFEATED
→ BATON DROP
→ SHIELD FALL/LOWER
→ WARDEN UNCONSCIOUS
→ SECURITY OFF
→ GATE LIGHTS
→ GATE OPEN
→ CAMERA PAN
→ SHUTTLE REVEAL
→ PLAYER CONTROL
```

Warden 처형 연출 없음.

## 15. Not Included

이 Blockout은 다음을 확정 구현하지 않는다.

- Boss06 runtime class/file 이름
- exact HP
- exact damage
- exact timing seconds
- exact dash/charge speed
- animation frame count
- final art asset
- final dialogue localization
- multiplayer authoritative implementation detail
- terminal boss integration code

## Physics / Hitbox Hard Guard

- Warden separate weakpoint: 없음
- body ImpactTarget: exactly 1
- solid collider envelope cap: 96×150
- `canGroundActors:false`
- `ropeAttachment:false`
- Shield/Baton/Beam: solid collision 금지
- Main collision surface: one flat rectangle
