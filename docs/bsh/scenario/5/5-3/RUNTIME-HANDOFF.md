# 5-3 RUNTIME HANDOFF — REV2.0

## Key dependency

`hardpoint-jammer-v1` is IMPLEMENTED; gameplay and two-client playtest remain pending.

Current contract uses normal ropeable collision surfaces from the shared spatial index. Enemy-slot identity automatically derives the Jam field; the Stage does not author candidate surface IDs.

Current target contract:
- likely next surface warning selected by Hook reach, movement alignment and distance
- current attachment, occluded surfaces and choices without a Base-clear alternative excluded
- already attached Rope remains excluded; an already launched Hook continues flight and uses the phase active at attachment
- attaching to the Active target starts one `jammer-shock`
- new Rope cuts immediately and shared Electrified status deals 2.5 every 0.05s for 0.5s, total 25
- reapplication refreshes duration without stacking; pulse damage has no per-pulse network event
- if Jammer dies/disables, active Jam clears deterministically
- shared authoritative Jam state in multiplayer

Do not move the Hardpoint or change Rope length. Jam activation alone does not cut a pre-existing Rope; only a new attachment to the Active target triggers shock and cut.

Implement two non-overlapping encounter bands from AREA-SPEC.
