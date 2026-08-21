# 5-1 VALIDATION — REV8.0

## Static Geometry

- [x] Bounds = `4608×2432`
- [x] Safe authored relation maximum = `384.7px`
- [x] Flow authored relation maximum = `394.5px`
- [x] Both are ≤400px
- [x] Enemy count = 0
- [x] Scanner count = 0
- [x] Wind count = 0

## Required Runtime / Graybox Tests

- [ ] current Base Rope clears mandatory Safe route
- [ ] zero-impulse graybox methodology still passes
- [ ] Long Rope does not bypass first/middle teaching bands
- [ ] Core A/B/C/D broad faces reject attach
- [ ] all Service Hardpoints accept attach
- [ ] no invisible attach denial
- [ ] failure recovery returns within ~5 sec
- [ ] Stage does not feel like empty walking

## H4 Choice

- [ ] Safe and Flow start candidates visible together
- [ ] Safe route is easier to read but not uniquely required
- [ ] Flow route is faster/more expressive but Base-clear
- [ ] neither route is obviously dominant in all situations

## Story

- [ ] no opening Player Bark
- [ ] `CONTINUITY CONTROL / INCIDENT OPERATIONS ACTIVE`
- [ ] `CITY SYSTEM STATUS / DEGRADED`
- [ ] `CONTROL NETWORK / ONLINE`
- [ ] exact Bark: `…아래쪽은 끊겼는데, 여긴 사고 때도 돌아가고 있었네.`
- [ ] Bark happens after network state is readable
- [ ] no Capacity reveal
- [ ] no Priority Directive reveal
- [ ] no Suspension Authorization reveal
- [ ] no causal statement

## Camera

- [ ] Entry makes Player small against CORE A
- [ ] Gap 1 shows current + next meaningful Hardpoint
- [ ] Control Void communicates reverse direction
- [ ] Inspection shows Safe + Flow candidates
- [ ] Final Core communicates largest sealed mass
- [ ] normal gameplay never compresses whole Stage into one tiny view

## Direction Runtime

- [ ] `DIRECTION-SPEC.json` passes current schema
- [ ] required tracks compile
- [ ] required tracks reach implemented/verified
- [ ] no duplicate legacy Story/Bark
- [ ] no forced camera pan
- [ ] no control lock

## Boundary

- [ ] 5-2 is next planning target
- [ ] incoming Post-Sector04 transition is not invented
