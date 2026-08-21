# 4-3 VALIDATION — REV1.0

## 1. MAP SCALE
- [ ] bounds exactly `5376×2432`
- [ ] Entry `(-2432,-512)` and Exit `(+2060,-2060)` remain inside bounds
- [ ] width is used for objective read + relay run + return, not filler
- [ ] upper/lower circulation remain spatially distinct

## 2. MAP SIMILARITY
- [ ] not 4-1 Basin crossing
- [ ] not 4-2 crescent → interior cut-through
- [ ] not 3-8 Free-Weave
- [ ] not legacy 4-3 Freight Bypass
- [ ] max meaningful overlap ≤1

## 3. OBSTACLE / ROUTE FUNCTION
- [ ] Block C visible before service descent
- [ ] Block C Link OFFLINE visible before service descent
- [ ] Relay B-03 objective visible/readable before service descent
- [ ] lower deck exists because Relay B-03 is there
- [ ] return route exists because Shared Utility Riser B-C is the continuation
- [ ] no reasonless platform detour

## 4. STAGE LENGTH / PACING
- [ ] target read occurs before first mandatory drop
- [ ] Pursuit pressure begins after the Player can understand route objective
- [ ] Relay interaction is short enough not to become a stationary damage check
- [ ] post-reset return does not repeat the entire upper route
- [ ] first-play and mastered times measured in browser playtest before final tuning

## 5. CURRENT GITHUB RUNTIME
- [ ] latest main re-audited before code change
- [ ] config Hook Reach recalculated
- [ ] Pursuit behavior re-audited
- [ ] objective/interactable capability re-audited
- [ ] no unsupported `service-relay` AREA-SPEC preset fabricated
- [ ] canonical AREA-SPEC created only after runtime/schema mapping is real
- [ ] legacy Cutter/Transit Wake removed from new 4-3

## 6. LOCAL RELAY OBJECTIVE
- [ ] objective id unique
- [ ] real interaction/complete state exists
- [ ] one completion per intended Stage lifecycle
- [ ] normal local recovery/respawn does not create contradictory state
- [ ] completion never increments Sector04 Override count
- [ ] Pursuit death does not complete Relay
- [ ] Relay completion emits Direction state exactly once per intended lifecycle

## 7. PURSUIT
- [ ] exactly 1 Pursuit Drone
- [ ] no Patrol companion
- [ ] no Cutter / Scanner / Wind
- [ ] no kill gate
- [ ] enemy movement matches current direct pursuit behavior
- [ ] dash-direction changes emerge from actual windup/dash logic, not scripted teleport/pathfinding

## 8. STORY / DIRECTION
- [ ] NORMAL CIRCULATION is visible at entry
- [ ] LINK OFFLINE corresponds to real pre-reset state
- [ ] MANUAL RESET REQUIRED points to real Relay B-03
- [ ] TRACKING corresponds to real acquire state
- [ ] RESET COMPLETE corresponds to real objective completion
- [ ] LINK RESTORED corresponds to actual continuation state
- [ ] CONTACT LOST corresponds to real safe/end state
- [ ] no Sector05 continuity explanation

## 9. SECTOR PROGRESSION
- [ ] 4-3 has no Override source
- [ ] A remains 4-2
- [ ] B remains 4-5
- [ ] C remains 4-7
- [ ] requiredCount remains 2 of 3
- [ ] Relay B-03 does not count

## 10. ROPE
- [ ] current base reach = `400px` at audited baseline
- [ ] every approved mandatory relation ≤400px
- [ ] current design max = `396.02px` — PASS
- [ ] any implementation coordinate change triggers a fresh automated reach audit

## 11. PLAYER COMPREHENSION PLAYTEST
Ask a tester who has not read the docs:
1. “어디로 가야 한다고 이해했나?”
2. “왜 아래로 내려갔나?”
3. “Relay를 켜면 무엇이 바뀐다고 이해했나?”

PASS only if the tester identifies the Relay objective as the reason for descent without coaching.
