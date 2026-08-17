import assert from "node:assert/strict";
import { isKnownEnemyType } from "../src/game/combat/EnemyArchetypeCatalog.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import {
    resolveEnemyEncounter,
    resolveEnemySlot,
    resolveSectorEnemyEncounters
} from "../src/game/world/EnemyEncounterSelection.js";
import {
    LEGACY_AREA_SECTOR_PREVIEW_CATALOG,
    resolveLegacyAreaSectorPreviewEnemyEncounters
} from "../src/game/world/sectors/LegacyAreaSectorPreviewCatalog.js";

const position = Object.freeze({ x: 120, y: -480 });
const activation = Object.freeze({ x: 0, y: -640, width: 480, height: 320 });

function authoredSlot(selection) {
    return Object.freeze({
        id: "sector-02:encounter-east:enemy-01",
        position,
        activation,
        ...selection
    });
}

export function run() {
    const fixed = resolveEnemySlot(authoredSlot({ fixedEnemyType: "shield-drone-t1" }), {
        runSeed: 41,
        worldRevision: "wide-sector-v1"
    });
    const fixedWithDifferentSeed = resolveEnemySlot(authoredSlot({ fixedEnemyType: "shield-drone-t1" }), {
        runSeed: 999,
        worldRevision: "wide-sector-v2"
    });

    assert.equal(fixed.enemyType, "shield-drone-t1");
    assert.equal(fixed.selectionKind, "fixed");
    assert.equal(fixedWithDifferentSeed.enemyType, fixed.enemyType, "a fixed slot must ignore run selection inputs");
    assert.equal(fixed.id, "sector-02:encounter-east:enemy-01");
    assert.deepEqual(fixed.position, position, "selection must not rewrite the authored position");
    assert.deepEqual(fixed.activation, activation, "selection must not rewrite the authored activation bounds");

    const pooledSlot = authoredSlot({
        allowedEnemyTypes: ["pursuit-drone-t1", "artillery-drone-t1", "swarm-drone-t1"]
    });
    const first = resolveEnemySlot(pooledSlot, { runSeed: 3141, worldRevision: "wide-sector-v1" });
    const replay = resolveEnemySlot(pooledSlot, { runSeed: 3141, worldRevision: "wide-sector-v1" });

    assert.equal(first.selectionKind, "pool");
    assert.ok(pooledSlot.allowedEnemyTypes.includes(first.enemyType));
    assert.deepEqual(replay, first, "the same slot, seed, and revision must replay the same enemy selection");
    assert.equal(first.id, pooledSlot.id);
    assert.deepEqual(first.position, position);
    assert.deepEqual(first.activation, activation);
    assert.ok(Object.isFrozen(first), "resolved slots must be immutable runtime definitions");
    assert.ok(Object.isFrozen(first.allowedEnemyTypes), "the normalized pool must not be mutable after assembly");

    assert.throws(
        () =>
            resolveEnemySlot(
                authoredSlot({
                    fixedEnemyType: "shield-drone-t1",
                    allowedEnemyTypes: ["pursuit-drone-t1"]
                }),
                { runSeed: 1, worldRevision: "wide-sector-v1" }
            ),
        /exactly one enemy selection source/,
        "a slot must not keep competing fixed and pool definitions"
    );
    assert.throws(
        () => resolveEnemySlot(authoredSlot({}), { runSeed: 1, worldRevision: "wide-sector-v1" }),
        /exactly one enemy selection source/
    );
    assert.throws(
        () =>
            resolveEnemySlot(authoredSlot({ allowedEnemyTypes: ["pursuit-drone-t1", "pursuit-drone-t1"] }), {
                runSeed: 1,
                worldRevision: "wide-sector-v1"
            }),
        /unique/
    );
    assert.throws(
        () => resolveEnemySlot(authoredSlot({ allowedEnemyTypes: [""] }), { runSeed: 1, worldRevision: "wide" }),
        /enemy type/
    );
    assert.throws(
        () =>
            resolveEnemySlot(authoredSlot({ allowedEnemyTypes: ["pursuit-drone-t1"] }), {
                runSeed: 0,
                worldRevision: "wide-sector-v1"
            }),
        /runSeed/
    );
    assert.throws(
        () => resolveEnemySlot({ ...pooledSlot, id: "" }, { runSeed: 1, worldRevision: "wide-sector-v1" }),
        /slot id/
    );

    const runtimeSlot = Object.freeze({
        encounterId: "sector-02:landmark:02:encounter:enemy-01",
        slotId: "sector-02:market-approach:enemy-01",
        position: Object.freeze({ x: 144, y: -512 }),
        activation,
        enemySelection: Object.freeze({
            allowedEnemyTypes: Object.freeze(["pursuit-drone-t1", "artillery-drone-t1"])
        }),
        legacyStageAlias: "2-2"
    });
    const simulation = new GameSimulation({ worldSeed: 2718 });
    assert.ok(simulation.enemies.every(({ displayName }) => /[가-힣]/.test(displayName)));
    simulation.world = Object.freeze({
        ...simulation.world,
        definitionRevision: "wide-sector-v1",
        enemySpawns: Object.freeze([runtimeSlot])
    });
    const replaySimulation = new GameSimulation({ worldSeed: 2718 });
    replaySimulation.world = simulation.world;
    const runtimeEnemy = simulation.createEnemies()[0];
    const replayEnemy = replaySimulation.createEnemies()[0];
    assert.ok(runtimeSlot.enemySelection.allowedEnemyTypes.includes(runtimeEnemy.enemyType));
    assert.equal(replayEnemy.enemyType, runtimeEnemy.enemyType);
    assert.equal(runtimeEnemy.position.x, runtimeSlot.position.x);
    assert.equal(runtimeEnemy.position.y, runtimeSlot.position.y);
    assert.deepEqual(runtimeEnemy.activation, activation);
    assert.equal(runtimeEnemy.areaId, null);
    assert.equal(runtimeEnemy.objectId, runtimeSlot.encounterId);
    assert.equal(runtimeEnemy.hasSimulationCapability("enemy-behavior"), true);

    simulation.world = Object.freeze({
        ...simulation.world,
        enemySpawns: Object.freeze([
            Object.freeze({
                ...runtimeSlot,
                enemySelection: Object.freeze({ fixedEnemyType: "shield-drone-t1" })
            })
        ])
    });
    assert.equal(simulation.createEnemies()[0].enemyType, "shield-drone-t1");

    simulation.world = Object.freeze({
        ...simulation.world,
        enemySpawns: Object.freeze([
            Object.freeze({
                ...runtimeSlot,
                enemySelection: Object.freeze({ allowedEnemyTypes: Object.freeze(["missing-drone"]) })
            })
        ])
    });
    assert.throws(() => simulation.createEnemies(), /unknown enemy type/);

    assert.throws(
        () => resolveEnemyEncounter({ ...runtimeSlot, areaId: "sector-02-02" }, { runSeed: 1, worldRevision: "wide" }),
        /must not use areaId/
    );

    const previewContext = {
        runSeed: 2718,
        worldRevision: LEGACY_AREA_SECTOR_PREVIEW_CATALOG.revision
    };
    const authoredEncounters = LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors.flatMap((sector) =>
        sector.landmarks.flatMap((landmark) => landmark.encounters)
    );
    const resolvedPreview = resolveSectorEnemyEncounters(LEGACY_AREA_SECTOR_PREVIEW_CATALOG, previewContext);
    const replayedPreview = resolveSectorEnemyEncounters(LEGACY_AREA_SECTOR_PREVIEW_CATALOG, previewContext);
    assert.deepEqual(
        resolveLegacyAreaSectorPreviewEnemyEncounters(previewContext),
        resolvedPreview,
        "the build/startup preview adapter must expose the canonical selector output without a second rule"
    );
    assert.equal(resolvedPreview.length, authoredEncounters.length);
    assert.deepEqual(replayedPreview, resolvedPreview);
    for (const resolved of resolvedPreview) {
        const source = authoredEncounters.find(({ slotId }) => slotId === resolved.slotId);
        assert.ok(source);
        assert.equal(resolved.encounterId, source.encounterId);
        assert.deepEqual(resolved.position, source.position);
        assert.deepEqual(resolved.activation, source.activation);
        assert.equal(resolved.legacyStageAlias, source.legacyStageAlias);
        assert.equal("areaId" in resolved, false);
        assert.equal(isKnownEnemyType(resolved.enemyType), true);
    }

    const nonEnemyEncounter = {
        sectors: [
            {
                landmarks: [
                    {
                        encounters: [
                            runtimeSlot,
                            {
                                encounterId: "sector-02:landmark:02:encounter:story-only",
                                slotId: "sector-02:landmark:02:slot:story-only",
                                position: { x: 0, y: 0 },
                                activation: null
                            }
                        ]
                    }
                ]
            }
        ]
    };
    assert.equal(resolveSectorEnemyEncounters(nonEnemyEncounter, previewContext).length, 1);
}
