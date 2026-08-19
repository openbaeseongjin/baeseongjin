# 2-2 VALIDATION — REV8.0

## Scale / silhouette
- [ ] Bounds 1792×896.
- [ ] Main body is clearly horizontal.
- [ ] No full-width reversal.
- [ ] Does not read as tall vertical climb.

## Patrol
- [ ] Exactly one explicit Patrol Drone.
- [ ] Patrol start/end = -320↔+320 local planning relation.
- [ ] Speed 48.
- [ ] Wait 0.45.
- [ ] Pingpong.
- [ ] Kill optional.
- [ ] No Rope Cut.
- [ ] Target-lock cycle preserved.
- [ ] No unlimited chase behavior introduced.

## Observe first
- [ ] Player sees Drone move before unavoidable pressure.
- [ ] Full Patrol cycle not required.
- [ ] Observation Deck is safe.
- [ ] Default camera shows >=3 required observation items, or geometry adjusted.
- [ ] No Drone-follow cinematic pan.

## Main crossing
- [ ] Cover A real LOS blocker.
- [ ] Cover B real LOS blocker.
- [ ] Wait viable.
- [ ] Flow viable.
- [ ] Kill viable.
- [ ] Waiting is not always optimal.
- [ ] Killing is not always optimal.
- [ ] Main lesson is moving threat timing.

## Rope reach
- [ ] G1→G2 ~373px.
- [ ] G2→G3 320px.
- [ ] G3→G4 ~304px.
- [ ] G4→G5 ~307px.
- [ ] G5→Access Anchor ~222px.
- [ ] Mandatory catches <=400px.

## Recovery
- [ ] Main retry 2–6s.
- [ ] Ordinary miss does not reset Stage.
- [ ] Position/pressure loss precedes death.

## Access A
- [ ] Exactly one second enemy slot.
- [ ] accessModuleId = sector-02:access-module:a.
- [ ] No third enemy.
- [ ] No escort.
- [ ] Carrier activates after Access branch commit.
- [ ] No main Patrol/Carrier crossfire.
- [ ] Module can be skipped for local Stage exit.
- [ ] Sector 02 global 3-of-3 progression remains intact.
- [ ] Marker behavior preserved.

## Story
- [ ] `PATROL WALKWAY / SECURITY STILL ACTIVE`.
- [ ] `SECURITY PATROL / ACTIVE`.
- [ ] `RESIDENTIAL TRANSIT / RESTRICTED`.
- [ ] Bark only after physical movement + status if Bark layer exists.
- [ ] Bark is not System Toast.
- [ ] No Group C explanation.
- [ ] No motive/conspiracy claim.

## Exit
- [ ] Exit Deck safe.
- [ ] nextAreaId sector-02-03.
- [ ] Reach→panel chain works.
- [ ] No enemy after exit.

## Pacing
- [ ] Mainline first 1:20–1:55.
- [ ] Mainline mastered 0:40–1:00.
- [ ] Access first 1:55–2:35.
- [ ] Access mastered 1:05–1:25.
