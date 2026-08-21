# 5-2 VALIDATION — REV1.0

## Static geometry

- [x] Bounds = `4608×2624`
- [x] Max intended relation = `367.15px`
- [x] Max intended relation ≤400px
- [x] AEGIS count = 2
- [x] Jammer = 0
- [x] Cutter = 0
- [x] Artillery = 0
- [x] Pursuit = 0
- [x] Wind = 0
- [x] Scanner = 0

## Runtime / graybox

- [ ] current Base Rope clears full route
- [ ] non-grappleable partition faces reject attach
- [ ] Service Hardpoints remain readable
- [ ] first AEGIS can be bypassed without kill
- [ ] second AEGIS can be bypassed without kill
- [ ] AEGIS A and B never acquire simultaneously
- [ ] direct frontal Rope Impact is visibly blocked
- [ ] side/rear Rope Impact can land
- [ ] shield rotation is readable before contact
- [ ] failure recovery returns within ~5 sec

## Teaching quality

- [ ] P0 clearly shows shield direction and side Hardpoint route
- [ ] first lesson does not require prior knowledge of exact shield angle
- [ ] second partition reverses the flank direction
- [ ] second band feels like reinforcement, not duplicate geometry
- [ ] kill remains optional

## Story

- [ ] `CONTROL ATRIUM / CONTINUITY SECURITY ACTIVE`
- [ ] `UPPER CONTROL / POWERED`
- [ ] `CONTINUITY SECURITY / ACTIVE`
- [ ] `SECURITY REVIEW GALLERY / ACCESS RESTRICTED`
- [ ] no Player Bark
- [ ] no Capacity reveal
- [ ] no Priority reveal
- [ ] no Authorization reveal

## Release blocker

REDESIGN if current shield turn speed makes the authored flank window unreadable or practically impossible with Base movement.
