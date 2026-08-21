# SECTOR 04-7 — VALIDATION

## Package-level checks completed

- Approved MAP SHA-256 locked: `808a571482a628e3768318cf59ab302fe552cb537d008197842975b03f93a247`
- Approved STORY SHA-256 locked: `7a7852f8d37430cdd3a4817be524bf9c3bd01ff2aa09be483116898a90f8002c`
- Mainline max link: `394.46 px < 400`
- Override C branch max link: `357.77 px < 400`
- MAP and Story approved files are copied byte-identically into this package.

## Runtime acceptance gates

### Geometry
- [ ] overall progression continuously gains height
- [ ] M0 is reachable with no >400px mandatory relation
- [ ] both Outer Bypass and Inner Spur merge at M1
- [ ] Override C booth is reachable without killing the Sentry
- [ ] final deck is reachable with C uncollected
- [ ] recovery returns to recent progress, not a death void

### Security
- [ ] Pursuit active only before M0
- [ ] Pursuit target clears at M0
- [ ] late Sentry active only on Inner Spur
- [ ] no Pursuit + Sentry simultaneous pressure
- [ ] no rope cutting from either authored threat
- [ ] no kill gate

### Override
- [ ] C interaction persists as actual progression state
- [ ] C is not a local exit dependency
- [ ] skipping C does not alter static 4-7 geometry
- [ ] no fake acquisition via presentation-only toast

### Story
- [ ] S0 reveal is not blocked by dialogue
- [ ] S1 fact appears before Pursuit activation
- [ ] no dialogue during Pursuit/Inner Spur combat
- [ ] final facts occur in order: Security Active → Protected Ascent Available
- [ ] Bark occurs only after both facts and at a stable point
- [ ] no Sector05 causal explanation
- [ ] no Group C causal claim

### Downstream
- [ ] 4-8 source is not creatively redesigned by this package
- [ ] `nextAreaId` continuity is preserved only as a seam

## Required repository verification after implementation

Run the repository's current:
- `npm run check`
- relevant area catalog validator/tests
- combat/enemy tests
- story/direction tests
- any persistence/progression tests added for Override C

Also perform a browser playthrough:
1. C skipped
2. C acquired without killing static Sentry if possible
3. Pursuit failure → recovery
4. Inner Spur failure → recovery
5. final Bark timing
6. 4-7 → current 4-8 seam smoke test
