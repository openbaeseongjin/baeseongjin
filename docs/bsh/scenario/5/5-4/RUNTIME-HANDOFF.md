# 5-4 RUNTIME HANDOFF — REV2.0

Checked main: `3c9f661bba58af6f7351e00754c12aef86575a12`.

Reuse current `artillery-drone-t1`.

Current behavior basis:
- locks target position once
- telegraph ~0.65s
- strike radius ~72px
- damage 20
- cooldown ~1.4s
- strike resolves at stored position

Do not redesign Artillery into continuous tracking.

Implementation priorities:
1. preserve Island gaps / Rope traversal
2. ensure next island / next Hardpoint is visible before landing
3. keep Artillery A and B activation bands non-overlapping
4. no kill requirement
5. no Jammer/AEGIS/Cutter/Pursuit
6. Capacity Record triggers only after both Artillery bands are clear
7. preserve approved MAP and STORY previews
