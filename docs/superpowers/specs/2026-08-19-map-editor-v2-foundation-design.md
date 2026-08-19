# Map Editor V2 Authoring Foundation Design

## Status and purpose

This design implements the first, non-visual milestone of the integrated map editor. It replaces duplicated hand-authored map data with a controlled `AREA-SPEC v2 → generated Runtime JS Catalog` path while preserving the current browser runtime contract.

The milestone migrates only Stage `1-1` and Stage `1-7`. It establishes the repeatable migration path for all 48 stages; it does not build the visual editor yet.

## Product contract

- The long-term canonical authoring source is `AREA-SPEC v2`. Every stage will be explicitly migrated; no runtime source is inferred from a generated file merely existing.
- The editor will eventually load a stage and visually edit Bounds/Entry, terrain surfaces, paired Anchor landmark plus 24×24 attachment target, Recovery/Route, existing Enemy slot activation and allowed enemies, Wind source/zone/cycle, and Camera zones.
- Objective, Progression, Story, Scanner, and the hand-written Behavior Registry are visible but read-only in the editor. Their static data remains represented in v2; only behavior algorithms live in the Registry and are referenced by stable ID.
- Editing owns only an in-memory Draft. `Apply` must save v2 JSON, regenerate JS, and pass validation before it starts a new single-player preview of the selected stage. A running game and multiplayer session are never hot-swapped.

## First-milestone scope

The implementation adds the v2 schema and validator, deterministic generator, cutover manifest and composer, behavior-reference registry, two migrated specs, generated JS, and parity tests for `1-1` and `1-7`.

It does not add editor UI, bulk-migrate the remaining 46 stages, change gameplay rules, load JSON in the browser, hot-swap a world, or alter multiplayer authority.

## Ownership and data flow

```text
AREA-SPEC.json (schemaVersion: 2) ─┐
AREA-CATALOG.json (source manifest) ─┼─> Node validation and generation
hand-written Behavior Registry ─────┘             │
                                                   ├─> generated Stage JS and static source index
legacy Stage provider ─────────────────────────────┤
                                                   └─> thin Sector Catalog facade
                                                            │
                                                            v
                                                  existing defineAreaCatalog Runtime contract
```

`AREA-SPEC.json` is upgraded in place to `schemaVersion: 2` when a stage is migrated. Existing v1 specs remain v1 until their own migration. A migrated v2 spec is derived from the live legacy area definition, not from a narrative document, so the legacy definition can serve as the independent semantic-parity baseline.

The generator is a Node build-time tool. It emits deterministic, checked-in JS only below `src/game/world/areas/generated/`; those files carry a generated header and are overwritten as a complete set. Runtime ES modules use generated static imports and never parse authoring JSON.

## V2 stage contract

A v2 spec has a stable `stageId`, Runtime `areaId`, sector identity, bounds and entry, plus data sections for surfaces, anchors, recovery/route, encounter slots, wind, camera, objectives, progression, story, scanner, and behavior references.

Every editable entity has a stable local ID. An Anchor is one semantic object containing both its visible landmark data and its 24×24 grapple target; independent landmark/target editing is not valid. Read-only sections remain schema-validated and are emitted unchanged, but the future editor exposes no mutating controls for them.

`behaviorRefs` contains only registered stable IDs and explicit data arguments. It cannot contain executable source, module paths, callbacks, or arbitrary imports. The hand-written `AreaBehaviorRegistry` owns the stable-ID-to-runtime-factory mapping. Generator and validator reject an unknown reference before any output is written.

## Cutover contract

`docs/bsh/scenario/AREA-CATALOG.json` is the explicit v2 cutover manifest. For every Stage participating in a composed Runtime catalog it records its stable Stage ID, Runtime Area ID, sector, `source: "legacy" | "generated"`, and the authoritative source path. The initial manifest covers all eight Stage entries of Sector 01, with `1-1` and `1-7` generated and the other six legacy.

The manifest is the only source selector. Its build-time validation requires every expected Sector Stage exactly once, one valid source, a matching identity triple, a valid source path, and a generated output module for generated entries. It rejects duplicate, missing, unknown, or field-overlay source selection.

The existing Sector 01 definitions move behind a legacy Stage provider. `Sector01AreaCatalog` becomes a thin facade that composes the legacy provider and generated Stage index according to the generated manifest selection. A selected generated Stage replaces the complete legacy Stage definition; its legacy object is excluded rather than merged. The facade still exports the exact `defineAreaCatalog` shape used by the current seamless-sector Runtime.

## Generation and validation

The generator is deterministic: the same validated v2 spec, manifest, registry version, and generator version must produce byte-identical output. Generation is all-or-nothing for the selected output set: validation failures do not overwrite generated files.

The command surface is:

- `npm run validate:area-specs` validates v1 and v2 files according to their declared schema version, and validates the cutover manifest for composed catalogs.
- `npm run generate:area-catalogs` validates first and writes only generated output paths.
- `npm run generate:area-catalogs -- --check` regenerates in memory and fails if any checked-in generated file is absent or stale.
- `npm run check` includes v2 validation and stale-generation checking before the existing scenario-integration check.

The existing `AreaDefinition` helpers and `AreaDefinitionValidator` remain the Runtime public contract. Generated modules use those helpers; the v2 validator catches authoring errors earlier, while the existing Runtime validator continues to guard the emitted catalog.

## Parity and safety tests

`1-1` and `1-7` receive a semantic-parity fixture that imports the isolated legacy Stage definition and its generated counterpart. The comparison canonicalizes ordering and asserts equal Runtime-relevant area identity, bounds, entry, surfaces and properties, grapple targets and landmark objects, recovery/route, encounter slots and activation bounds, wind, camera, objectives, progression, story, scanner, and behavior references after registry resolution.

Focused tests also cover invalid v2 IDs and geometry, malformed paired Anchors, read-only mutation policy metadata, unknown behavior references, non-deterministic or stale output, and every manifest failure mode. Integration tests ensure the composed Sector 01 catalog has one `1-1` and one `1-7`, no duplicate area IDs, and continues to compile through the seamless-sector Runtime.

Only the final candidate runs the full required suite once under the verification ledger: `npm test`, `npm run check`, and `npm run format:check`. This milestone has no Canvas behavior change, so browser verification becomes required only when the later editor UI is introduced.

## Migration and rollback

Migration is Stage-by-Stage and atomic. A completed Stage can use generated output immediately while unmigrated stages keep their legacy JS. A failure before merge rolls the manifest entry back to `legacy`; no field-level fallback, exception override, or hand edit inside `generated/` is allowed.

The next Stage migration repeats the same sequence: derive v2 from the live legacy definition, establish semantic parity, generate, switch the manifest entry, and verify the composed Runtime. The manifest grows with Runtime catalog coverage, and the intended end state is all 48 stages represented by v2 sources.

## Completion criteria

- `1-1` and `1-7` are v2 canonical specs and generated, atomically selected Runtime stages.
- Sector 01 uses the explicit manifest and exposes its unchanged catalog API to the seamless Runtime.
- Generated output is deterministic, complete, and never hand-authored.
- Registry references are stable, validated, and the only route for hand-written behavior.
- Semantic parity and required validation suites pass, and scenario-integration status records the actual migration evidence without claiming UI or full-48 completion.
