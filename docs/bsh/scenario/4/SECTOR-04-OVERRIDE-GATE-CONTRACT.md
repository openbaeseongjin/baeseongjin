# SECTOR 04 — RESIDENT SECURITY OVERRIDE CONTRACT

Planning authority:

- Override A: earlier Sector04 source
- Override B: earlier Sector04 source
- Override C: 4-7 Refuge Terrace
- Sector04 finale intent: later 4-8 checks **2 of 3**

## 4-7 contract

Override C:
- optional
- persistent progression value
- not required for 4-7 local exit
- does not open a local shortcut/door as an immediate reward
- can be skipped if player does not want the additional Inner Security Spur risk

## Implementation boundary

This 4-7 package may add/reuse the persistent state needed to store C.

It must **not** independently finalize 4-8 quorum behavior or rewrite 4-8 topology/story.

If current main has no compatible override state, implement a minimal general state model such as:

`sector-04:resident-security-override:a|b|c`

Do not hardcode “C means gate open” inside 4-7.
