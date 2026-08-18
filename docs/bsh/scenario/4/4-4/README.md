# SECTOR 04-4 — CARE PAVILION

*APPROVED BLOCKOUT PACKAGE · REV 2.4 — TREATMENT UNDER PURSUIT*

◀ PREV — `4-3 SKY GARDEN TERRACES` · NEXT — `4-5 AMENITY ATRIUM` ▶

`QUIET ≠ SAFE` · `PRIVATE CARE` · `3-GUARD SECURITY CONVERGENCE` · `CARE TREATMENT POD`

| 항목 | 기준 |
|---|---|
| Status | **DESIGN LOCKED · NOT IMPLEMENTED** |
| Snapshot | `b6e5b640f04135545341d3368a843b45c35fcedd` |
| Runtime Model | `seamless-sector-landmark-v1` |
| Current Runtime | Legacy `INFRASTRUCTURE SERVICE NODE / REST` — migration required |
| Guard A | Reception Ring |
| Guard B | Cross-Atrium X Loop |
| Guard C | Recovery Gallery Zigzag |
| Worst Case | 3 Persistent Pursuers |
| Treatment Pod | 3.0s channel / +40 HP / Player별 1회 |
| Damage Interrupt | YES |
| Alert Clear | NO |
| Safe Room | NO |
| Wind / Cutter / Scanner | NONE |
| Mandatory Kill / Heal / Augment | NONE |

---

## 1. 한 줄 정의

외부 Sky Garden을 지나 Private Care Pavilion에 진입한 Player가 조용한 Reception·Consultation·Recovery 공간을 관통하며 서로 다른 세 Security Patrol을 상대하고, 중반의 **Care Treatment Pod에서 멈춰 치료할지, Pursuer를 정리할지, 낮은 체력으로도 Momentum을 유지할지 선택한 뒤 Recovery Gallery를 통과해 상층 Amenity 영역으로 올라가는 Stage.**

---

## 2. Core Question

> **“경비가 계속 따라오는 상황에서, 지금 3초를 써서 치료할 가치가 있는가?”**

4-4의 의료시설은 배경이 아니라 실제 Gameplay 기능을 가진다.

```text
KILL
→ pressure 감소
→ 치료 안정성 상승

HEAL UNDER PURSUIT
→ HP 회복 가능
→ 3초 정지 위험

SKIP HEAL
→ 체력 위험 유지
→ Momentum 유지
```

---

## 3. 공간

실제 상층 주거의 Care sequence:

```text
RECEPTION
→ LOWER WAITING
→ CONSULTATION
→ CARE BRIDGE
→ TREATMENT DECK
→ RECOVERY GALLERY
→ PRIVATE ACCESS
```

Sector 02의 공동생활 인프라와 달리 **개별 Consultation / Treatment / Recovery가 생활권 안에 포함**된다는 차이를 보여준다.

---

## 4. Flow

```text
ENTRY
→ A1
→ LOWER WAITING
→ Guard A

→ A2
→ CONSULTATION
→ Guard B

→ A3
→ CARE BRIDGE

→ optional TREATMENT POD
→ A4
→ RECOVERY GALLERY

→ Guard C
→ A5
→ EXIT
→ 4-5
```

Treatment Pod는 optional이다.

Stage clear는 Pod 사용 여부와 무관해야 한다.

---

## 5. Base Rope

```text
Hook Speed 1200
Reach 400
Reload 1.0
Hand Offset ±12,-7
```

| Sample | Hand→Anchor | Margin to 400 | Flight |
|---|---:|---:|---:|
| L0 → A1 | 295.7px | 104.3px | 0.246s |
| L1 → A2 | 248.8px | 151.2px | 0.207s |
| L2 → A3 | 264.3px | 135.7px | 0.220s |
| L3 → A4 | 255.3px | 144.7px | 0.213s |
| L4 → A5 | 321.5px | 78.5px | 0.268s |

정적 attach는 PASS.

Dynamic Fixed-Length Swing, release, 1s reload, 3 Pursuer pressure는 Runtime graybox에서 검증한다.

---

## 6. Guard A — Reception Ring

4-point loop.

```text
(-400,-390)
(260,-390)
(260,-585)
(-400,-585)
```

발각 후 Persistent Pursuit.

살아 있으면 Treatment Deck까지 따라올 수 있다.

---

## 7. Guard B — Cross-Atrium X Loop

```text
(-300,-705)
(300,-865)
(-300,-865)
(300,-705)
```

Cross-Atrium을 X 형태로 횡단하는 loop.

Player Rope trajectory와 가장 자주 교차하는 중간 경비.

발각 후 Treatment Deck까지 추격 가능.

---

## 8. CARE TREATMENT POD

### DESIGN LOCKED behavior

```text
Interact
→ 3.0s continuous channel
→ success: +40 HP
→ cap at 100 HP
```

### Initial tuning

```text
healAmount      40
channelSeconds   3.0
usesPerPlayer    1
```

`40 / 3.0s`는 playtest tuning 가능하지만 아래 behavior는 고정한다.

### Channel interruption

Player가 채널 중 유효 HP damage를 받으면:

```text
TREATMENT INTERRUPTED
heal not applied
```

다시 시도할 수 있는지 여부는 **사용 성공 시에만 1회권 소모**하는 방향을 권장한다.

### Not a Safe Room

Pod는:

- Alert를 지우지 않는다.
- Guard를 멈추지 않는다.
- Guard를 despawn하지 않는다.
- 무적을 주지 않는다.
- 문을 잠그지 않는다.

A/B가 살아 있으면 실제로 Treatment Deck까지 들어올 수 있다.

### Multiplayer

```text
use state = PER PLAYER
```

Player A가 사용해도 Player B의 사용권은 남는다.

치료 중인 Player를 다른 Player가 Guard aggro/position으로 보호하는 협동도 허용한다.

---

## 9. Guard C — Recovery Gallery Zigzag

4-point pingpong:

```text
(360,-1110)
(80,-1210)
(340,-1320)
(20,-1450)
```

Treatment 이후의 마지막 moving security.

A/B를 살려두었다면:

```text
A + B + C
```

최대 3 Pursuers가 Exit band에 수렴할 수 있다.

---

## 10. 3 Pursuer Worst Case

4-4에서 처음 허용.

```text
EARLY
A only

MID
A + B possible

UPPER
A + B + C possible
```

처음부터 3기가 동시에 활성화되지는 않는다.

3기가 읽을 수 없는 탄막이 되면:

1. Guard C detection을 늦추거나
2. B/C activation overlap을 줄이거나
3. projectile engagement timing을 조정한다.

**경비를 강제로 죽이는 Gate로 해결하지 않는다.**

---

## 11. Recovery

- R1 Waiting Pod Ledge
- R2 Consult Room Lip
- R3 Care Service Ledge
- R4 Recovery Suite Lip

Recovery:

```text
does NOT clear Alert
does NOT refresh Treatment use
does NOT become shortcut
```

5초 이내 현 progression band 복귀 목표.

---

## 12. Story

4-4가 확인하는 것:

```text
PRIVATE CARE PAVILION
CONSULT / TREATMENT / RECOVERY
AUTOMATED CARE SERVICES ACTIVE
```

즉 상층 생활권에는 단순 주거뿐 아니라 전용 치료·회복 지원이 존재했다.

아직 공개하지 않는 것:

- Corporate가 누구를 우선했는지
- lower population과 특정 Group mapping
- deliberate abandonment
- named decision maker

---

## 13. Augment

Treatment Pod / Stage clear에 어떤 Augment도 필수 아님.

### Combat Build

Guard를 더 빠르게 정리 → Pod 사용 안정성 증가.

### Movement Build

Guard를 살려두고 Pod를 skip하거나, 짧은 window를 만들어 치료 위치까지 빨리 도달.

### Regression

Long Rope 480이 Guard C / final beat를 통째로 skip하면 FAIL.

Fast Recover / Release Propulsion / Dash / Slow Fall은 expression only.

---

## 14. AREA-SPEC REV1.1 / Treatment Pod authoring

최신 공식 AREA-SPEC은 지원되는 top-level field를 제한한다.

임의 `interactables` 필드를 추가하지 않는다.

따라서 Pod는:

```text
objective preset = care-treatment-pod-v1
runtimeDependencies.newSystems
```

로 선언하며, exact location/state/tuning authoring을 validator가 지원하도록 **명시적 schema/validator extension**이 필요하다.

현재 없는 기능을 이미 구현된 것처럼 쓰지 않는다.

---

## 15. Runtime Migration

Current source 4-4:

```text
INFRASTRUCTURE SERVICE NODE
REST
Enemy NONE
```

Target:

```text
CARE PAVILION

Guard A Ring
Guard B Cross
Guard C Zigzag

Persistent Pursuit
Care Treatment Pod

NO Wind
NO Cutter
NO Scanner
```

---

## 16. PASS

### Traversal
- Base Rope only clear
- Pod optional
- 3 Pursuer worst case에서 Pod skip 후 exit 가능

### Treatment
- 3.0s channel
- +40 cap100
- damage interrupts
- no Alert clear
- no invulnerability
- per-Player one successful use

### Security
- 3 distinct Patrol silhouettes
- A/B can enter Treatment Deck
- C opens after upper progression
- no kill gate

### Multiplayer
- Player별 사용 상태 authoritative
- one Player use does not consume teammate use

### Story
- Care privilege visible
- Corporate causality remains unrevealed
