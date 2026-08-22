# 3-5 PRODUCTION ALIGNMENT — REV8.0

Baseline: `d39cbb49d3d8247caf2542393994704292dd5002`

Runtime cutover: canonical `AREA-SPEC.v2.json` generates `Sector03Stage05.generated.js`; the generated Stage uses `COMMERCIAL OPERATIONS HUB`, `3008×1408`, the approved commercial operations topology, Augment Offer #3, 2 enemy slots including Access B carrier, physical exit panel/gate, and `sector-03-06` next.

## Pre-cutover legacy baseline
- `sector-03-05`
- `COMMERCIAL SERVICE NODE / REST / AUGMENT SERVICE`
- current bounds `960×688`
- `service-calibration-frame` = `augment-node`
- `augment-selected` = `interact-choice`
- Entry Guard = Support Pool
- Exit Guard = Late Pool + Access Module B
- exactly 2 enemy slots
- Node ID + Access Summary story displays
- no Scanner / Patrol / Wind / Rope Cut
- Exit panel requires Final Deck + Augment Selected
- physical crossing → 3-6
- local Player Bark presentation capability now exists

## REV8.0 authored delta
- canonical name: `COMMERCIAL OPERATIONS HUB`
- bounds: `3008×1408`
- Sector identity corrected to CENTRAL EXCHANGE commercial back-of-house
- industrial REV1/REV2 concepts retired
- spatial layers:
  1. Tenant Delivery Passage
  2. Operations Control Balcony
  3. Atrium Signage Access Catwalk
  4. Tenant Transfer Deck
  5. Upper Retail Link
- direction: `↘ → ↑ → ↗ → ↘ → ↗`
- true safe Augment chamber remains the center of pacing
