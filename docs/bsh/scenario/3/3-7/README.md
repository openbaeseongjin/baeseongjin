# SECTOR 03-7 — TRANSFER MEZZANINE

*DESIGN SPEC · REV 2.0 — PRE-IMPLEMENTATION*

◀ PREV — [SECTOR 03-6 / PREMIUM ATRIUM](../3-6/README.md) · NEXT — [SECTOR 03-8 / UPPER EXCHANGE GATE](../3-8/README.md) ▶

`SECTOR 03 CENTRAL EXCHANGE COMPLEX` · `STAGE 07` · `TRANSFER STORY PRESSURE` · `KNOWN-SYSTEM SYNTHESIS`

## 0. Status / Source Priority

### VERIFIED

- Reviewed against GitHub `main` HEAD `862a71b14b01d0927e509fca3ffcc138f5034a4f`.
- Sector 03 Master REV 2.0 canonical identity is `CENTRAL EXCHANGE COMPLEX`.
- Canonical 3-7 name is `TRANSFER MEZZANINE`.
- `AccessScanField` exists. Its world-facing meaning is **SMART MAINTENANCE SAFETY SYSTEM**, not citizen/transit permission control.
- `Patrol Drone T1`, `exitBlock()`, authored Story displays, default Sector 03 camera, local-area assembly, and Scanner shared simulation phase already exist.
- Repository search found no native `AREA-SPEC.json` / `area-spec-v1` template. This package therefore uses the planner-supplied `area-spec-v1` contract. The checked-in [`AREA-SPEC.json`](./AREA-SPEC.json) alongside this README has since been adapted to this repo's actual schema — see [`AREA-SPEC-AUTHORING-STANDARD.md`](../../AREA-SPEC-AUTHORING-STANDARD.md).

### DESIGN LOCKED

- One continuous Mandatory route. No `OUTER / PRIORITY / SERVICE` three-route menu.
- Smart Maintenance Scanner: 2 controlled mounts, 1 shared group.
- Patrol Drone T1: 1 unit, kill optional.
- `PRIORITY` is an **incident-time transfer-operation record**, not the Scanner's function and not a special corridor the Player is denied access to.
- No Group A/B/C ↔ Tier/Class mapping.
- No new gameplay system and no Fragile/breakable dependency in 3-7.

### PRE-IMPLEMENTATION BOUNDARY

Current shipped `sector-03-07` still contains older `PRIORITY CONCOURSE / ACCESS TIER REVEAL` authoring. This document supersedes its **design intent** but does not claim Runtime alignment. Do not create or mark `PRODUCTION-ALIGNMENT.md` complete until the implementation commit is reviewed.

---

## 1. Why This Stage Exists

3-6 is the large movement peak. 3-7 compresses the space and increases information density without becoming a Rest Stage.

```text
3-6 GRAND CENTRAL ATRIUM
OPEN / LARGE / FAST
↓
3-7 TRANSFER MEZZANINE
DENSER / DIRECTED / STORY PRESSURE
↓
3-8 UPPER EXCHANGE GATE
FREE-WEAVE FINALE
```

The Player should realize that the upper level is a city-transfer layer where emergency boarding / transfer records accumulated during the Cascade.

---

## 2. Previous / Next Connection

### 3-6 → 3-7

Current-session 3-6 design ends on the far upper Atrium balcony. 3-7 begins immediately on the connected transfer mezzanine.

```text
GRAND ATRIUM
→ UPPER BALCONY
→ TRANSFER MEZZANINE
```

No Rest Room and no narrative cut.

### 3-7 → 3-8

3-7 ends at the `UPPER EXCHANGE GATE` approach.

3-7 may establish that transfer requests were processed under different operational controls. It must **not** complete the 3-8 evacuation-record ↔ upper-transfer-record juxtaposition.

---

## 3. Core Questions

Gameplay:

> **"이미 아는 Mount 주기와 Drone 압력 속에서 착지를 줄이고 하나의 환승층 Flow를 얼마나 매끄럽게 이어갈 수 있는가?"**

Story:

> **"사고 당시 Transfer 요청은 모두 같은 조건으로 처리된 것이 아니었나?"**

The Stage creates suspicion, not causal certainty.

---

## 4. Player Experience

Emotional sequence:

```text
ARRIVAL
"환승층이네."
↓
SYSTEM READING
"정비 마운트와 Drone은 여기서도 각자 작동한다."
↓
TRANSFER RECORD
"사고 당시 이동 요청에 우선순위가 따로 있었어."
↓
QUESTION
"2-8의 A/B/C 상태와는 어떤 관계지?"
```

Do not answer the final question in 3-7.

---

## 5. Space Concept

**UPPER TRANSFER MEZZANINE**

A continuous upper transfer floor containing:

- shuttle / platform direction boards
- waiting zones
- service-mount frames
- boarding connections
- emergency transfer panels
- maintenance rails

The geometry must read as **one physical mezzanine with changing pressure**, not several artificial corridors.

---

## 6. Gameplay Flow

```text
ENTRY BALCONY
→ C1 SMART MAINTENANCE MOUNT
→ CONSERVATIVE LANDING
→ SAFE OBSERVATION DECK
→ C2 + PATROL PRESSURE
→ PERMANENT CONTINUATION FRAME
→ TRANSFER CONTROL DIRECTORY
→ FINAL STRUCTURAL ATTACH
→ UPPER EXCHANGE GATE
```

### A — C1 Reminder

Low pressure. Scanner only. Do not repeat the full tutorial.

### B — Observation Deck

Outside Drone new-target activation. The Player can read C2, Drone position, post-C2 Permanent target, and Recovery.

### C — Main Commit

C2 is the only Mandatory Scanner commit inside the Drone band. The Player transfers from C2 to a Permanent frame. Neither Scanner nor Drone is strengthened.

### D — Transfer Directory

A fully safe upper Story deck. No new Drone acquisition.

### E — Exit

One clean Permanent attach to the standard Exit Block. No extra encounter.

---

## 7. Mandatory / Skilled Route

### Mandatory

- Base Rope clear.
- `swingImpulse = 0` blockout validation required.
- C1 and C2 mandatory.
- Drone kill never required.
- Safe observation before the C2 + Drone band.
- Main failure recovers locally rather than restarting the Stage.

Exact IDs and coordinates: [`AREA-SPEC.json`](./AREA-SPEC.json).

### Skilled / Flow

Skilled play reduces landings, not corridors.

Primary expression:

```text
P1 → C1 → M1
(skip conservative P2 landing)
→ C2 near AVAILABLE/WARNING boundary
→ G3 without intermediate landing
```

### Forbidden Bypasses

- No always-grappleable parent behind C1/C2.
- Observation deck cannot reach G3 directly.
- Recovery deck cannot reach G3 directly.
- C2 remains the Mandatory middle commit.

---

## 8. Failure / Recovery

Main failure zone: `C2 → G3`.

```text
FLOW LOSS
→ R1 RECOVERY
→ RE-READ C2
→ RETRY
```

Target: retry-ready within 4 seconds, excluding intentional Scanner waiting.

R1 must:
- be outside Drone new-acquire bounds;
- reach C2;
- not reach G3.

No dedicated death-floor requirement for the core blockout.

---

## 9. Scanner Intent

Runtime: existing `AccessScanField`.

World-facing meaning:

> **SMART MAINTENANCE SAFETY SYSTEM**

Rules remain Runtime-owned:

```text
AVAILABLE / WARNING → new attach allowed
LOCKED / RESET      → new attach denied
existing Rope       → stays attached
```

Do not add damage, knockback, Rope cut, forced detach, faster variants, or per-player phase.

C1 and C2 share one deterministic Scanner group.

---

## 10. Patrol Drone Intent

Reuse current `Patrol Drone T1` baseline.

- one Drone only;
- kill optional;
- no new AI;
- no Stage-wide chase;
- no Rope cut;
- Observation / Recovery / Story decks outside new-target activation.

The Stage must not depend on Player weapons. Current `COMBAT_CONFIG.automaticWeaponEnabled` is false.

---

## 11. Story Role

Late safe directory may present:

```text
EMERGENCY TRANSFER CONTROL

SERVICE CLASS CONTROL
ENABLED

ACCESS TIER CONTROL
ENABLED

PRIORITY ROUTE
ACTIVE
```

This confirms only that multiple transfer-operation controls existed and a Priority Route was active during incident handling.

### Forbidden Story Conclusions

Do not state or imply:

```text
GROUP A = Priority
GROUP B = Premium
GROUP C = Standard
```

Do not say Group C was suspended because of Priority traffic.
Do not identify who received priority.
Do not identify a decision maker or assign blame.

3-8 owns the stronger record juxtaposition.

---

## 12. Environmental Storytelling

Early:
- transfer direction boards
- shuttle / platform wayfinding

Mid:
- maintenance frames
- boarding status equipment

Late:
- emergency transfer control directory
- upper exchange direction
- empty waiting zones

Contrast:

```text
TRANSFER SYSTEMS PRESENT / PARTLY ACTIVE
PEOPLE ABSENT
```

No NPC required.

---

## 13. Build Expression

Foundation + First Specialization may alter expression but never progression requirements.

Allowed:
- momentum reduces landing count;
- re-attach expression smooths C1→C2 flow;
- combat-oriented build may engage Drone optionally.

Forbidden:
- build-specific Mandatory route;
- Scanner immunity;
- Scanner destruction;
- build-gated Story.

---

## 14. Camera

Use default Sector 03 camera.

```text
mode = default
customZones = []
```

Observation-deck framing must show:
- C2
- Scanner cue
- Drone patrol
- G3
- R1

Do not invent zoom values.

---

## 15. Visual / Sound

Visual:
- polished gray / graphite transfer structure
- warm-white public lighting
- muted gold / amber wayfinding
- cyan Rope / gameplay anchor language
- current Smart Mount telegraph shapes

Avoid office aesthetics, train-collision gimmicks, Sector 01 repetition, and damaging-laser Scanner language.

Audio priority:
1. Drone acquire / lock / existing attack feedback
2. Scanner WARNING / LOCK
3. transfer ambience
4. building mechanics

Story directory is read during safe gameplay, not a cinematic.

---

## 16. Multiplayer

Use existing Runtime ownership.

- Scanner phase shared / deterministic.
- Enemy authority remains Runtime-owned.
- Gate uses existing `exitBlock` progression.
- No new destructible/shared Stage state.
- Recovery does not alter Scanner phase.
- No new late-join restore contract.

---

## 17. Forbidden

- three-route Outer/Priority/Service layout
- Scanner as social/transit permission control
- Priority-route access-denial puzzle
- new Rope mode / input / augment
- second Drone / Drone T2 / faster Drone
- moving platform / train collision / shutter / wind / turret
- Scanner damage / knockback / Rope cut / forced detach
- kill gate
- build-locked route
- Group↔Tier mapping
- direct Group C causality
- 3-8 story climax inside 3-7

---

## 18. Playtest Questions

1. Does 3-7 feel denser than 3-6 without feeling like a Rest Stage?
2. Is C2 + Drone readable from M1?
3. Can skilled players reduce landings without bypassing C2?
4. Does the transfer directory create curiosity rather than a text dump?
5. Is `PRIORITY` understood as transfer-operation history, not Scanner authorization?
6. Does the Stage feel like one mezzanine rather than artificial route options?
7. Is 3-8 visible / anticipated before the exit?

---

## 19. PASS Criteria

Gameplay:
- Mandatory route Base-Rope clear.
- All Mandatory authored links below current Hook Reach.
- C1/C2 only Mandatory controlled targets.
- C2 cannot be bypassed from M1 or R1.
- existing Rope persists through Scanner LOCKED.
- Drone kill unnecessary.
- M1/R1/M2 outside new-target acquisition.
- local recovery is quick.

Story:
- canonical name `TRANSFER MEZZANINE`.
- Scanner presented as Smart Maintenance Safety.
- Service Class / Access Tier / Priority Route existence may be shown.
- no Group mapping or direct causality.
- 3-8 retains climax ownership.

Production:
- implementation follows [`AREA-SPEC.json`](./AREA-SPEC.json).
- `runtimeDependencies.newSystems` stays empty.
- no `PRODUCTION-ALIGNMENT.md` completion before Runtime review.
