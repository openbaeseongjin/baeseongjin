# 4-1 VALIDATION — REV1.0

## Map Scale
- [ ] bounds exactly `4992×2112`
- [ ] actual authored route uses ~89% of map width
- [ ] first camera communicates broad horizontal residential footprint
- [ ] extra width is traversed, not filler

## Map Similarity
- [ ] not 2-6 courtyard rim / reveal-turn / upper-rim structure
- [ ] high entry → descent → playable basin → far-side ascent is preserved
- [ ] max known meaningful overlap ≤1
- [ ] run cross-stage similarity audit again after any topology change

## Rope
- [ ] every mandatory relation ≤400px
- [ ] current authored max = `362.04px`
- [ ] Basin descent failure remains recoverable

## Obstacle Function
- [ ] Garden Basin is actual playable route
- [ ] no decorative central death void
- [ ] far-side façade recess changes movement
- [ ] gameplay map contains no non-functional background decoration

## Enemy
- [ ] exactly 1 Patrol
- [ ] loop path readable
- [ ] no Pursuit
- [ ] no Cutter / Rope Cut
- [ ] no Shield / Support / Artillery / Swarm
- [ ] no kill gate
- [ ] M0 / final Lobby receive no acquire pressure

## Story
- [ ] environment visually reads as maintained before text
- [ ] `UPPER RESIDENTIAL DISTRICT / ENVIRONMENTAL SERVICE / NORMAL`
- [ ] Bark exact: `…여긴 아직 다 돌아가고 있네.`
- [ ] `RESIDENTIAL SECURITY / ACTIVE`
- [ ] exit preview `RESIDENT COURTYARD / SECURITY CONTROL`
- [ ] no rich-class exposition
- [ ] no Group C / Priority causality
- [ ] no Override A reveal

## Progression
- [ ] no Resident Security Override in 4-1
- [ ] no new Augment source
- [ ] 4-2 remains owner of first Override source

## Direction Runtime
- [ ] DIRECTION-SPEC passes current validator/compiler
- [ ] no duplicate legacy Story/Bark
- [ ] all required tracks implemented/verified
- [ ] no world pause / control lock

## Boundary
- [x] Boss03 catalog intercepts 3-8→4-1 and defeat returns each Player to the authored 4-1 Entry
- [ ] new 4-1→4-2 handoff does not inherit legacy Transit narrative
