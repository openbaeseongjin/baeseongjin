# 5-3 RUNTIME HANDOFF — REV2.0

## Key dependency

`hardpoint-jammer-v1` is NOT IMPLEMENTED.

Use the existing Rope candidate filter contract:
`canAttachToSurface(surface)`.

Target V1:
- selected Hardpoint warning
- selected Hardpoint active jam
- `canAttachToSurface(surface) = false` only for new candidate selection while active
- already attached Rope unchanged
- already launched Hook may resolve
- attached Hardpoint ineligible as a new Jam target
- if Jammer dies/disables, active Jam clears deterministically
- shared authoritative Jam state in multiplayer

Do not implement:
- Rope cut
- force release
- player damage
- Hardpoint movement
- Rope length changes

Implement two non-overlapping encounter bands from AREA-SPEC.
