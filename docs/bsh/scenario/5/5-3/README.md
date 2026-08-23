# SECTOR 05-3 — SECURITY REVIEW GALLERY REV2.0

> Status: **RUNTIME GENERATED · PLAYTEST PENDING**<br>
> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>
> Source Area ID: `sector-05-03`<br>
> Signature: **CENTRAL SPINE → DUAL BYPASS → LATERAL TRANSFER → REVERSE RETURN → FINAL CLIMB**<br>
> Special Security: **HARDPOINT JAMMER ×2 · SHARED RUNTIME FIELD**<br>
> Max intended Rope relation: **349.86px < 400px**<br>
> Next: **5-4 CAPACITY ALLOCATION CORE**

## Core question

> 다음 두 Rope surface 중 하나가 감전되면 이미 읽어둔 Base-clear route로 전환하거나 위험을 감수할 수 있는가?

## Jammer contract

- Normal: CYAN
- Warning: AMBER
- Active Jam: VIOLET/MAGENTA
- Normal ropeable surfaces are queried automatically; no dedicated candidate Anchor list
- Current attached Rope is excluded from target selection and remains
- Already launched Hook continues flight; attaching while the target is Active triggers shock and cut
- Attaching to the Active target cuts the new Rope and starts Electrified
- Electrified: 2.5 damage every 0.05s for 0.5s, total 25
- Reapplication refreshes duration without stacking
- One shock-start network event; no per-pulse events
- One target per Jammer
- At least one Base-clear route always remains
- Jammer A/B never overlap

## Story

`SECURITY REVIEW GALLERY / ACCESS RESTRICTED`

then, after both Jam encounters:

`INCIDENT REVIEW ARCHIVE / RECORD SET AVAILABLE / ACCESS RESTRICTED`

Player:
`…기록까지 잠가놨네.`

Exit:
`CAPACITY ALLOCATION CORE / ACCESS AHEAD`
