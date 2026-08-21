# SECTOR 04-8 — VALIDATION

## Package checks completed

- MAP SHA-256: `938fb1c3f7915b9ba213fda260dd430573a2d09e954e339259b622c136e14a52`
- STORY SHA-256: `f844a680dc8bdddca7fc74c00d68f5a0cd6cbc4c14e9ada57d38309a42d6eff6`
- approved previews copied byte-identically
- max mandatory Rope relation: `386.26px < 400px`

## Runtime gates

### Quorum truth table
- [ ] none → FAIL
- [ ] A only → FAIL
- [ ] B only → FAIL
- [ ] C only → FAIL
- [ ] A+B → PASS
- [ ] A+C → PASS
- [ ] B+C → PASS
- [ ] A+B+C → PASS

### Fail path
- [ ] protected ascent remains closed
- [ ] player can safely return
- [ ] no damage/death punishment
- [ ] no substitute credential
- [ ] no forced “correct” missing override
- [ ] return cannot softlock

### Success geometry
- [ ] first phase gains height toward east service face
- [ ] center crossover reverses direction
- [ ] west lower gallery gains height
- [ ] Mid Interlock is full-safe
- [ ] upper phase reverses east again
- [ ] final return reverses west
- [ ] route never collapses into one long diagonal
- [ ] all mandatory intended links <=400px

### Pressure
- [ ] enemies empty
- [ ] wind empty
- [ ] scanner empty
- [ ] moving platforms empty
- [ ] no kill requirement

### Story
- [ ] quorum facts before gate response
- [ ] no player dialogue during Rope traversal
- [ ] final facts occur in order
- [ ] final Bark fires once only
- [ ] Bark waits for stable/full-safe state
- [ ] no Sector05 causal reveal

### Completion
- [ ] final deck marks stage-local completion
- [ ] no Sector05 direct wiring added
- [ ] no Boss Entry inferred
- [ ] no General Timer stop inferred
- [ ] no Boss Timer start inferred

## Required repository verification

Run current repository:
- `npm run check`
- area/catalog validators
- state/persistence tests
- direction/story tests
- timer/boss tests if touched

Browser playthrough:
1. each single-override fail state
2. each two-override pass state
3. all-three pass state
4. under-quorum return/backtrack
5. success switchback route
6. final Bark timing
7. final content-boundary behavior
