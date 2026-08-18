# SECTOR 04-8 — UPPER RESIDENTIAL THRESHOLD

*APPROVED BLOCKOUT PACKAGE · REV 2.8 — SEQUENTIAL SECURITY FINALE*

◀ PREV — `4-7 REFUGE TERRACE` · NEXT — `POST-SECTOR 04 BOSS / TRANSITION SLOT — TBD` ▶

| 항목 | 확정 |
|---|---|
| Status | **DESIGN LOCKED · NOT IMPLEMENTED** |
| Snapshot | `1cb2d48870352dc71637cfc7ad553d655e0a94d4` |
| Runtime Version | `0.32.0` |
| Runtime Model | `seamless-sector-landmark-v1` |
| Stage Role | Sector04 Pure Security Finale + Access Payoff |
| Guards | A horizontal / B opposite horizontal / C vertical sweep |
| Worst Case | 3 Persistent Pursuers |
| Wind / Cutter / Scanner | NONE |
| Moving Anchor / Treatment | NONE |
| Resident Override Source | NONE — this Stage is the quorum check |
| Sector04 Access | **ANY 2 OF 3** from 4-2 / 4-5 / 4-7 |
| Post-Sector | content boundary; direct 5-1 wiring forbidden |

## 1. 한 줄 정의

4-7의 난류를 빠져나온 Player가 Corporate control layer 바로 아래의 Upper Residential Egress를 오르며, 세 개의 순차 Patrol band가 발각 후 Persistent Pursuit로 누적되는 가운데 별도 환경 gimmick 없이 Rope line reading과 momentum management만으로 Sector04를 마무리하고, 앞서 확보한 `RESIDENT SECURITY OVERRIDE`가 2/3 이상이면 Post-Sector04 transition route를 준비시키는 Stage.

## 2. 왜 마지막에 새 기믹을 넣지 않는가

Sector04는 이미:

```text
4-3 Crosswind
4-4 Treatment decision
4-5 Moving Anchor Drone
4-6 Cutter
4-7 Counter-Gust Turbulence
```

를 가르쳤다.

4-8은 새 시스템이 아니라:

```text
READ PATROL
→ COMMIT ROPE
→ DETECTED?
→ KILL OR OUTRUN
→ PURSUIT STACKS
→ KEEP ASCENDING
```

을 가장 깨끗하게 시험한다.

## 3. Flow

```text
ENTRY / REFUGE EGRESS
→ A1
→ LOWER CREDENTIAL PROMENADE
→ Guard A

→ A2
→ MID SECURITY GALLERY
→ Guard B

→ A3
→ THRESHOLD CORE

→ A4
→ UPPER CONTROL APPROACH
→ Guard C

→ A5
→ SECTOR TRANSIT LOCK
```

## 4. Guard choreography

### A — Lower Band

```text
(-460,-500) ↔ (300,-500)
speed target 62
```

### B — Mid Band

```text
(360,-840) ↔ (-260,-840)
speed target 70
```

A와 반대 출발 방향으로 읽기 리듬을 바꾼다.

### C — Vertical Threshold Sweep

```text
(300,-1190) ↕ (300,-1460)
speed target 74
```

마지막은 수평 Patrol이 아니라 수직/상하 Sweep으로 silhouette를 바꾼다.

`AREA-SPEC.json`은 현재 official validator가 아는 `patrol-drone-t1` preset과 start/end만 사용한다. Persistent Alert 전환은 별도 Runtime dependency다.

## 5. Persistent Pursuit

Target behavior:

```text
PATROL
→ DETECT
→ ALERT LATCHED
→ PERSISTENT PURSUIT
→ KILLED / VALID STAGE RESET
```

현재 stock Pursuit behavior와 동일하다고 주장하지 않는다.

`sector04-persistent-pursuit-latch-v1 = NOT_IMPLEMENTED`.

Recovery ledge는 Alert를 지우지 않는다.

## 6. Base Rope

Latest snapshot:

```text
Hook Speed 1200
Flight     1/3s
Reach      400
Reload     0.50s
```

| Link | Distance | Margin | Flight |
|---|---:|---:|---:|
| entry → a1 | 301.2px | 98.8px | 0.251s |
| lower → a2 | 330.9px | 69.1px | 0.276s |
| mid → a3 | 336.0px | 64.0px | 0.280s |
| core → a4 | 339.7px | 60.3px | 0.283s |
| upper → a5 | 198.7px | 201.3px | 0.166s |

Static planning samples all PASS.

## 7. Long Rope 480

| Earlier body → next-band Anchor | Distance | Direct within 480 |
|---|---:|---|
| entry → a2 | 944.7px | NO |
| lower → a3 | 515.2px | NO |
| mid → a4 | 522.3px | NO |
| core → a5 | 633.6px | NO |

Dynamic graybox is still required, but the current static layout does not let Long Rope delete the next full security band.

## 8. Sector04 Resident Security Override — FINAL PLACEMENT

### Relay A — 4-2 RESIDENTIAL COURTYARD

```text
COURTYARD RESIDENT ACCESS RELAY
terminal candidate position: (-165,-730)
host deck: decision-deck
```

Role: early proof tutorial.

### Relay B — 4-5 AMENITY ATRIUM

```text
AMENITY NETWORK SECURITY RELAY
terminal candidate position: (-200,-1420)
host deck: upper-gallery
```

Role: mid proof. Mandatory Static Route can reach it. Moving Anchor Drone is never required.

### Relay C — 4-7 REFUGE TERRACE

```text
REFUGE SECURITY OVERRIDE RELAY
relay ledge top: y -1285
terminal candidate position: (420,-1325)
```

Role: late high-pressure proof under Patrol/Pursuit + deterministic turbulence.

### Quorum

```text
AVAILABLE 3
REQUIRED  2
```

Third proof remains optional completion.

## 9. Why these three

The three proofs describe different privilege layers:

```text
HOME
4-2

AMENITY
4-5

REFUGE
4-7
```

Excluded:

- 4-1: pursuit/world introduction should stay clean.
- 4-3: shared Wind/Guard Drift lesson already dense.
- 4-4: Treatment Pod owns the stop/interact decision.
- 4-6: Cutter + Pursuit already owns kill/commit/reposition.
- 4-8: payoff/check, not a fourth source.

## 10. Access acquisition verb

Do not make a Guard drop the proof.

Target:

```text
REACH RELAY
→ INTERACT
→ SHARED RESIDENT OVERRIDE
→ KEEP MOVING
```

No mandatory kill.

No mandatory Augment.

No automatic Alert clear.

Initial implementation should use a normal interact, not invent a damage-interrupt hold channel.

## 11. 4-8 Transit Lock

Concept:

```text
4-8 FINAL OBJECTIVE COMPLETE
+
RESIDENT OVERRIDE >= 2
=
POST-SECTOR04 TRANSITION ROUTE READY
```

The current 4-8 AREA-SPEC stays:

```json
"targetStageAlias": null
```

because the actual post-Sector Boss/Transition landmark is not authored yet.

The Access requirement belongs to the future Sector transition route, not a fake Stage door.

## 12. Current Runtime boundary

VERIFIED current architecture already has:

- shared `SectorProgressState`
- access module collection
- per-Sector access requirement
- route unlock check using required Access count
- reconnect/snapshot state
- Sector transition route locks

But current seamless compiler only assigns `requiredAccessModuleCount: 2` to the Sector01 transition, and the default compiled catalogs currently cover Sector01~03.

Therefore:

```text
resident-security-override-quorum-v1
=
NOT IMPLEMENTED
```

This should generalize the existing system, not add a second currency.

## 13. Multiplayer

Default target follows Sector01 precedent:

```text
shared team progress
individual death preserves
late join / reconnect sync
party wipe resets current Sector state
```

A Player collecting Relay B must update the same shared count seen by teammates.

## 14. Story

Allowed:

```text
UPPER RESIDENTIAL EGRESS
RESIDENT SECURITY NETWORK
OVERRIDE QUORUM
CORPORATE CONTROL BOUNDARY AHEAD
```

Meaning:

> Upper Residential was tied to an active credential/security layer, and the next ascent crosses into a different control domain.

Not revealed here:

- exact Corporate decision maker
- lower-sector deliberate deprioritization details
- named responsibility chain

Sector05 owns that reveal.

## 15. Excluded

```text
NO WIND
NO CUTTER
NO SCANNER
NO MOVING ANCHOR
NO TREATMENT POD
NO AUGMENT NODE
NO 4TH GUARD
NO 4TH OVERRIDE
NO DIRECT 5-1 WIRING
```

## 16. Final acceptance

- Base Rope-only clear.
- `swingImpulse=0` graybox clear.
- A/B/C first detection bands staged.
- Worst case 3 Pursuers.
- Kill-none clear remains possible.
- Long Rope does not erase B/C bands.
- 4-2/4-5/4-7 are the three Sector04 proof sources.
- 4-8 provides quorum payoff, not proof source.
- 2/3 + final objective prepares Sector boundary route.
- Content boundary remains until post-Sector transition is authored.
