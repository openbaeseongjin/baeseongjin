# 4-2 RUNTIME HANDOFF — REV1.0

Baseline: `4551798860193a16e53814aae5c3a42022b4e1cf`

## Mandatory preflight

Re-read latest:
- Sector04AreaCatalog
- PursuitEnemyBehavior
- SectorProgressState / Controller
- current Access Module 3-of-3 implementation
- Direction Runtime compiler/validator
- latest 4-1 implementation status
- Sector04 progression contract

## Geometry

Replace legacy Cutter Line design with:
`4480×2112 RESIDENT COURTYARD`

Do not preserve Transit/Cutter identity.

## Enemy

Exactly one Pursuit Drone.

Use one bounded Courtyard activation territory.
It must:
- acquire during exposed crescent
- move within territory
- fail to acquire / continue chase inside Arcade safe side
- never pressure Override Vestibule

No second enemy.

## Override A

Implement:
`sector-04:resident-security-override:a`

Shared Sector state.

Acquiring A:
- increments unique source state once
- persists through death/respawn/reconnect according to Sector progression authority
- must not be duplicated by multiple Players
- should present acquisition to party/shared-world as appropriate

4-2 local exit:
**MUST NOT require A.**

## Sector04 quorum

Required sources:
A=4-2
B=4-5
C=4-7

Required count:
2

Quorum owner:
4-8

Do not implement Sector04 as 3-of-3 just because Sector01~03 use 3-of-3.

## Direction

Use DIRECTION-SPEC through current Direction Runtime.
Required Story:
- RESIDENT COURTYARD / SECURITY CONTROL ACTIVE
- RESIDENTIAL SECURITY / TRACKING
- SECURITY CONTACT / LOST
- RESIDENT SECURITY OVERRIDE / SOURCE A
- ... / ACQUIRED
- RESIDENTIAL SKYBRIDGE / SECURITY PATROL

## Release block

No release until:
- bounded Pursuit verified
- local exit without A verified
- A acquisition persistence verified
- duplicate acquisition prevented
- Direction coverage required tracks verified
