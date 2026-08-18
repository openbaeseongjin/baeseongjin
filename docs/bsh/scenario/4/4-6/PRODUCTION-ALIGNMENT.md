# SECTOR 04-6 — PRODUCTION ALIGNMENT

Status: **MIGRATION REQUIRED**

Latest checked main: `90208deb1e1946538dd76c22e280fcf7677106bd` / `0.31.2`

- Base Rope reload is now `0.50s`; old 1.0s planning is stale.
- Cutter Rope-disabled remains a separate current Runtime penalty.
- Wide-city Runtime keeps vertical Stage stack plus lateral city wings.
- Current source 4-6 remains legacy `POWER RELAY SPAN`.
- Target is `PRIVATE SKYBRIDGE`: 2 Persistent Guards + 1 fixed Cutter, no Wind/Scanner/Moving Anchor/Treatment.
- `sector04-persistent-guard-v1` is genuinely NOT_IMPLEMENTED.
- `cutter-sentry-area-spec-v1` means the official AREA-SPEC authoring preset/registry is missing; current Sentry + `cutter-fire` mechanics already exist.
- Scenario Art HOLD until migration + graybox + multiplayer Cutter/Pursuit verification.
