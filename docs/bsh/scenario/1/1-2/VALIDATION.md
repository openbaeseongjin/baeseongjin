# 1-2 VALIDATION — REV8.0

## Scale
- [ ] Bounds = 1664×960.
- [ ] Map reads wider/lower than 1-1.
- [ ] Added width is occupied by machinery + airborne crossing, not empty travel.

## Geometry
- [ ] Entry = (+448,-32).
- [ ] A = (+224,-192).
- [ ] C = (-320,-560).
- [ ] Dead Lift collision = 448×320 at target span.
- [ ] Counterweight = 96×448.
- [ ] Service Slot between machinery inner edges = 400px.
- [ ] P1 / R2 / P2 / P3 match AREA-SPEC.
- [ ] Final Deck = (-352,-832), W384.
- [ ] Casing = ±816, 32×960.

## Hook Reach
- [ ] Current effective Hook Reach still equals 400px or package is re-audited.
- [ ] Entry→A comfortable.
- [ ] Static A→C unavailable.
- [ ] Dynamic release arc creates forgiving C window.
- [ ] C visible before Release.
- [ ] No frame-perfect attach.

## Failure
- [ ] A→C miss catches on left recovery.
- [ ] Low C reversal catches center/right.
- [ ] Retry target 3–5s.
- [ ] No full-stage fall required.

## Story
- [ ] LIFT CONTROL/OFFLINE exact.
- [ ] Manual access text exact.
- [ ] Manual access does not fire while waiting at entry.
- [ ] Final deck sequence exact:
  POWER REDUCTION/STAGE 2 → 1.2s → SECURITY ACCESS/CHECK.
- [ ] Replayed final-deck event does not duplicate.
- [ ] Only Player Bark is `…리프트도?` if bark system exists.

## Uniqueness
- [ ] Not an alternating-open-ledge map.
- [ ] Dead Lift is a blocker, not a grapple opportunity.
- [ ] Airborne Re-Attach is the only new Rope lesson.
- [ ] 1-3 Security conflict is not pre-consumed.

## Pacing
- [ ] First clear target 1:00–1:30.
- [ ] Mastered target 0:25–0:42.
- [ ] If retry dominates beyond 1:50, geometry is retuned before adding UI help.
