# 1-4 VALIDATION — REV8.1

## Scale / space
- [ ] Bounds = 1152×832.
- [ ] Stage reads as a compact lab, not a shaft.
- [ ] Entry is on right; Exit is upper-left.
- [ ] Added space is used by safe chamber + calibration, not empty traversal.

## Residual guard / safety
- [ ] Exactly one 1-4 enemy slot.
- [ ] No kill prerequisite.
- [ ] Service Baffle is STATIC.
- [ ] Service Baffle never moves.
- [ ] Baffle blocks LOS/projectiles into chooser.
- [ ] Node Chamber contains no hostile enemy.
- [ ] Calibration chamber remains safe while world continues.

## Augment choice
- [ ] Generic compatible 3-card Runtime preserved.
- [ ] Fixed Impulse/Relay/Shear offer is absent.
- [ ] Source ID remains correct.
- [ ] World does not pause during chooser.
- [ ] No invulnerability is added merely for chooser.

## Calibration objective
- [ ] `augment-calibrated` exists.
- [ ] Exit requires calibration.
- [ ] Selection alone cannot open Exit.
- [ ] Inventory ownership alone cannot pass.
- [ ] Actual canonical selected-card effect must be used.
- [ ] Failure resets instrument in about 1–2s.
- [ ] No calibration profile is frame-perfect.
- [ ] No calibration profile requires a kill/death.

## Profile coverage
- [ ] fast-launch
- [ ] long-rope
- [ ] fast-recover
- [ ] release-propulsion
- [ ] electrified-rope
- [ ] collision-explosion
- [ ] direction-dash
- [ ] dash-strike
- [ ] instant-guard
- [ ] push-away
- [ ] straight-shot
- [ ] slow-fall

## Instant Guard safety
- [ ] Calibration pulse cannot kill Player.
- [ ] Pass is tied to actual guard prevention.
- [ ] Miss allows immediate safe retry.

## Multiplayer
- [ ] Player-local selected profile.
- [ ] Shared geometry never swaps by card.
- [ ] Different players can run different tests.
- [ ] One player's pass does not cross-complete another.
- [ ] Leaver removed from requirement.
- [ ] Open route is not relocked by late join.

## Story
- [ ] Existing entry/scan/selection Story exact.
- [ ] No Story Toast over chooser.
- [ ] CALIBRATION PROFILE / LOADED after selection.
- [ ] CALIBRATION / VERIFIED only after gameplay success.
- [ ] Bark occurs only after verification if bark layer exists.

## Pacing
- [ ] First clear target 1:10–1:50.
- [ ] Mastered 0:40–1:00.
- [ ] Understood micro-test generally 5–15s.
