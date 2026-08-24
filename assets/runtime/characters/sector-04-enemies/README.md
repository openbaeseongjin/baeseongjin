# Sector 04 enemy Runtime package

- Package ID: `sector-04-enemies`
- Source: [`assets/artwork/characters/sector-04-enemy-family-material-variant/`](../../../artwork/characters/sector-04-enemy-family-material-variant/)
- Tool chain: user-supplied overgrown concept reference plus deterministic Pillow normalization
- Provenance: repository-owned approved Sector 01 assets; no external artwork
- Runtime selection: only enemies whose authored `sectorId` resolves to `sector-04`

This package preserves the Sector 01 public enemy manifest contract: eight RGBA PNG atlases, seven enemy definitions, the existing `32x32` cells, state and frame order, timing, render sizes and anchors. Neutral exterior metal receives the user-approved abandoned Sector 04 treatment: charcoal recesses, oxidized gray plate, worn pale alloy, rust spotting, muted moss and visible hanging vines. Existing opaque pixels are preserved while binary-alpha vine pixels extend only into the unchanged cell padding; atlas dimensions and layout remain unchanged across every frame.

Shield blue, Support green, Swarm purple, Patrol red/orange, Artillery orange/red and the Sentry/Pursuit sensor, exhaust and warning colors remain exact source RGB values. The vine masks never replace role colors, cores, sensors, exhausts, warning panels or attack telegraphs. Body-relative attachment points and fixed strand shapes are resolved consistently per frame to prevent atlas-coordinate swimming or color jitter.

The package does not change enemy types, gameplay, AI, collision, damage, networking, animation timing or other sectors. Missing sector packages or unsupported types continue to use the existing Sector 01 and built-in fallbacks.

## Validation

- Authoring export to Runtime PNG hash identity: `PASS` — all eight Runtime atlases are byte-identical to the approved authoring exports.
- Runtime manifest validator: `PASS` — 8 atlases, 7 enemies and 48 states.
- Fixed selection: `PASS` — Sector 01~03 remain unchanged and Sector 04 resolves to `sector-04-enemies`.
- World-output vine survival: `PASS` — each visible body frame retains vine pixels at its exact `56x56`, `60x60` or `18x18` game render size.
- Manual browser review: `PASS` — Stage 4-6 Gameplay View에서 추격 드론의 몸체 밖 덩굴과 역할 강조색을 데스크톱 1280×720 및 모바일 844×390으로 확인했으며 browser warning/error는 0건이었다. 전체 7종·48상태는 실제 출력 크기 시트와 atlas validator로 확인했다.
