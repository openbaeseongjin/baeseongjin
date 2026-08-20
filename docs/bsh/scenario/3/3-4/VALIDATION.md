# 3-4 VALIDATION — REV8.0

## Split
- [ ] both routes readable from safe split
- [ ] no choice UI
- [ ] no enemy/scanner pressure at split
- [ ] Player can backtrack before meaningful commit
- [ ] no casual mid-route switching after separation

## Public
- [ ] C1/C2 same Scanner Group
- [ ] wider/fewer Rope inputs than Service
- [ ] Patrol path readable
- [ ] no Service Guard
- [ ] PUBLIC ROUTE / AUTHORIZATION INVALID exact
- [ ] invalid status is not invisible collision lock

## Service
- [ ] no active Scanner
- [ ] more Rope inputs / narrower geometry
- [ ] Support Guard only
- [ ] Maintenance clearance exact copy
- [ ] LOCAL SERVICE ROUTE / AVAILABLE exact
- [ ] Bark only if Player Bark layer exists

## Merge / Common
- [ ] safe high merge
- [ ] independent multiplayer arrivals
- [ ] COMMERCIAL SERVICE NODE / UPPER LEVEL exact
- [ ] Late Guard only after merge
- [ ] Late Guard cannot pressure lower branches or merge

## Enemy
- [ ] exactly 3 slots
- [ ] Patrol public
- [ ] Support service
- [ ] Late common
- [ ] kills optional
- [ ] no Rope Cut

## Geometry
- [ ] bounds 3584×1664
- [ ] all mandatory links <=400
- [ ] both routes use distinct sides of footprint
- [ ] double-skin blocker prevents route leakage

## Similarity
- [ ] 3-3 switchback rhythm not repeated
- [ ] 2-4 overlap <=1
- [ ] 3-2 overlap <=1
- [ ] max meaningful overlap <=1

## Exit
- [ ] final frame safe
- [ ] panel interaction preserved
- [ ] physical crossing preserved
- [ ] next = 3-5
