# 4-2 PRODUCTION ALIGNMENT — REV1.0

Baseline: `4551798860193a16e53814aae5c3a42022b4e1cf`

## Current Runtime — VERIFIED

Legacy `sector-04-02`:
- `CUTTER LINE`
- `FIRST ROPE INTERRUPTION`
- `1280×1312`
- Cutter Sentry

New 4-2:
- `RESIDENT COURTYARD`
- `4480×2112`
- Pursuit ×1
- Resident Security Override A

Therefore this is a **major re-author**.

## Pursuit capability — VERIFIED

Current Pursuit behavior supports:
- activation-constrained eligible targets
- moveSpeed 160
- acquireRange 640
- triggerDistance 96
- windup 0.25s
- dashSpeed 640
- dashSeconds 0.2
- recoverySeconds 0.5

4-2 uses existing behavior only.
No new enemy AI required.

## Progression gap

Sector01~03 current seamless Runtime uses Access Module **3-of-3**.
Sector04 new design requires Resident Security Override **2-of-3**.

This is **NOT IMPLEMENTED** and must not be faked as 3-of-3.

4-2:
- owns Source A
- local exit does not require A
- A persists as shared Sector progression
- 4-8 owns quorum check

See `../SECTOR-PROGRESSION-KEY-CONTRACT.md`.
