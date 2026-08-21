# 4-4 VALIDATION — REV1.0

## 1. MAP SCALE
- [ ] bounds exactly `5376×2240`
- [ ] footprint is occupied by three rising refuge compartments, not filler
- [ ] Amenity Access is visibly higher than Block C entry

## 2. MAP SIMILARITY
- [ ] not 4-1 Basin
- [ ] not 4-2 Courtyard crescent/interior cut
- [ ] not 4-3 Relay descent/return
- [ ] no Free-Weave multi-route field
- [ ] meaningful overlap score <=1

## 3. OBSTACLE FUNCTION
- [ ] Door A separates Chamber A floor from B
- [ ] Door B separates Chamber B floor from C
- [ ] floor is recovery, not progression shortcut
- [ ] MEP chain is the actual continuous route

## 4. UPWARD DIRECTION
- [ ] route has net upward progression from entry to exit
- [ ] M1/M2/M3 are progressively higher service commits
- [ ] camera shows next higher target before or during each commit
- [ ] no long flat traverse dominates the Stage memory

## 5. ROPE
- [ ] latest main Hook Reach re-audited
- [ ] approved preview max relation `390.61px` <= baseline 400px
- [ ] every implementation coordinate edit triggers fresh audit
- [ ] route remains clearable without relying on a new Augment

## 6. SECURITY
- [ ] Patrol ×2 exactly
- [ ] Patrol A = Chamber A recovery pressure
- [ ] Patrol B = Chamber B recovery pressure
- [ ] no Pursuit / Cutter / Scanner / Wind
- [ ] no kill gate

## 7. STORY / DIRECTION
- [ ] operational NORMAL/SEALED/OPEN text corresponds to actual state
- [ ] SYSTEM never explains social causality
- [ ] one core Bark only: `“…아래는 저 꼴인데.”`
- [ ] Bark fires after stable first ascent landing only
- [ ] no Bark while Rope attached/actively controlled
- [ ] no Bark during Patrol pressure
- [ ] no Sector05 capacity/priority/selection explanation

## 8. PROGRESSION
- [ ] 4-4 owns no Override
- [ ] A=4-2 / B=4-5 / C=4-7 unchanged
- [ ] 4-4 traversal never depends on A
- [ ] 4-4 completion never increments Sector04 quorum

## 9. CURRENT RUNTIME
- [ ] start implementation from latest main
- [ ] Surface Physics / grounded movement regression fix included
- [ ] current AREA-SPEC validator run after install
- [ ] Direction validator/checks run if available
- [ ] browser traversal playtest completed

## 10. FRESH-TESTER QUESTIONS
Ask without showing docs:
1. “전체적으로 어디를 향해 가는 Stage였나?”
2. “왜 바닥으로 다음 구획까지 못 갔나?”
3. “떨어졌을 때 무엇을 해야 했나?”
4. “이 공간에서 이상하다고 느낀 점은 무엇이었나?”

PASS if the tester identifies **upward Amenity progression + sealed floor compartments + overhead service route** without coaching.
