# 5-2 PRODUCTION ALIGNMENT — REV1.0

Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`

## Legacy/current document state

The repository still contains an older 5-2 candidate:
`GLASS ATRIUM / PATROL TIMING`.

That older creative direction is superseded for current authoring by:
`CONTROL ATRIUM / FIRST AEGIS`.

## Runtime verified

- `shield-drone-t1` exists.
- `ShieldEnemyBehavior` turns guardDirection toward the nearest target.
- Default guardHalfAngle is `π/3`, producing ~120° total frontal guarded arc.
- Default guard tracking uses maximum angular acceleration `0.6 rad/s²`, maximum angular speed `0.55 rad/s`, damping `1.4`, and tracking response `0.9`; angular velocity is part of the behavior snapshot.
- Rope Impact checks `enemy.blocksImpactFrom(owner.physics.position)` before creating an impact.
- `shield-drone-t1` also uses projectile attack.

## Planning consequence

Do not implement AEGIS as a static shield prop.

The Stage must be tuned around:
- dynamic shield turn,
- visible partition flank,
- a readable side/rear window created by deliberately slow shield acceleration,
- optional immediate side/rear impact or bypass.

## Not required

No new enemy type.
No new Rope physics.
No Jammer.
No Cutter.
No Artillery.
No Pursuit.

## Release dependency

The exact ease of the side/rear window depends on live play against current shield turn speed.
Runtime playtest is mandatory before release.
