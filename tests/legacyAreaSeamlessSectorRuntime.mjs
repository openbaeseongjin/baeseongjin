import assert from "node:assert/strict";
import { createAuthoredWorld, DEFAULT_AUTHORED_AREA_CATALOG } from "../src/game/world/AuthoredWorldFactory.js";
import { resolveObjectTriggerBounds } from "../src/game/world/areas/AreaDefinition.js";
import { PLAYER_CONFIG } from "../src/game/config.js";
import { SECTOR_02_AREA_CATALOG } from "../src/game/world/areas/sector02/Sector02AreaCatalog.js";
import {
    createLegacyAreaSeamlessSectorRuntimeWorld,
    SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT,
    SEAMLESS_SECTOR_RUNTIME_REVISION,
    SEAMLESS_SECTOR_RUNTIME_WIDTH
} from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

export function run() {
    assert.equal(
        createAuthoredWorld({ seed: 9182, floorY: 320 }).definitionId,
        DEFAULT_AUTHORED_AREA_CATALOG.id,
        "the new compiler must not switch the current default Runtime"
    );

    const world = createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 320 });
    assert.deepEqual(world, createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 320 }));
    assert.equal(world.definitionRevision, SEAMLESS_SECTOR_RUNTIME_REVISION);
    assert.equal(world.sectors.length, 3);
    assert.equal(world.landmarks.length, 24);
    assert.equal(world.landmarkAliases.length, 24);
    assert.equal(world.sectorEntries.length, 3);
    assert.equal(world.respawnAnchors.length, 24);
    assert.equal(world.connectors.length, 23);
    assert.equal(world.routeLocks.length, 23);
    assert.equal(world.sectorTransitions.length, 2);
    assert.equal(world.gates.length, 0);
    assert.equal(world.checkpoints.length, 0);
    assert.equal(world.areas.length, 0);
    assert.equal(world.accessModules.length, 9);
    assert.equal(world.objects.filter(({ kind }) => kind === "access-transit-lock").length, 2);

    for (const sector of world.sectors) {
        assert.equal(sector.width, SEAMLESS_SECTOR_RUNTIME_WIDTH);
        assert.equal(sector.bounds.width, SEAMLESS_SECTOR_RUNTIME_WIDTH);
        assert.ok(sector.bounds.height <= SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT);
        assert.ok(sector.bounds.height > sector.bounds.width);
        assert.ok(world.respawnAnchors.some(({ id }) => id === sector.respawnAnchorId));
        assert.equal(sector.accessModuleIds.length, 3, `${sector.id} must author exactly three Access Modules`);
        assert.equal(sector.accessModuleRequirement, 3);
        const sectorLandmarks = sector.landmarkIds.map((id) => world.landmarks.find((landmark) => landmark.id === id));
        assert.deepEqual(new Set(sectorLandmarks.map(({ origin }) => origin.x)), new Set([0]));
        for (let index = 1; index < sectorLandmarks.length; index += 1) {
            assert.equal(sectorLandmarks[index - 1].exit.y, sectorLandmarks[index].entry.y);
        }
        for (const landmarkId of sector.landmarkIds) {
            const landmark = world.landmarks.find(({ id }) => id === landmarkId);
            const anchor = world.respawnAnchors.find(({ id }) => id === landmark.respawnAnchorId);
            assert.ok(anchor, `landmark respawn anchor must exist: ${landmark.id}`);
            assert.equal(anchor.landmarkId, landmark.id);
            assert.deepEqual(anchor.position, landmark.entry);
            assert.deepEqual(anchor.triggerBounds, {
                x: landmark.entry.x - 38,
                y: landmark.entry.y - 78,
                width: 76,
                height: 82
            });
            assert.equal(anchor.level, landmark.order - 1);
            assert.ok(anchor.radius >= 64, `Stage save point must have a visible culling radius: ${landmark.id}`);
            assert.equal(anchor.label, `STAGE ${landmark.legacyStageAlias} SAVE`);
            if (landmark.id === sector.entryLandmarkId) assert.equal(anchor.id, sector.respawnAnchorId);
            assert.equal(landmark.bounds.width, SEAMLESS_SECTOR_RUNTIME_WIDTH);
            assert.ok(landmark.bounds.x >= sector.bounds.x);
            assert.ok(landmark.bounds.x + landmark.bounds.width <= sector.bounds.x + sector.bounds.width);
            const wingSurfaces = landmark.surfaceIds
                .map((id) => world.surfaces.find((surface) => surface.id === id))
                .filter(({ id }) => id.includes(":city-wing:"));
            assert.equal(wingSurfaces.length, 5);
            for (const wing of wingSurfaces) {
                assert.equal(wing.oneWay, true);
                assert.equal(wing.grappleable, true);
                assert.ok(wing.x >= sector.bounds.x);
                assert.ok(wing.x + wing.width <= sector.bounds.x + sector.bounds.width);
            }
        }
    }
    assert.equal(
        world.surfaces.some(({ kind }) => kind === "inter-floor-divider" || kind === "area-boundary-wall"),
        false
    );
    assert.equal(
        world.enemySpawns.some((spawn) => "areaId" in spawn),
        false
    );
    assert.equal(
        world.objects.some(({ kind }) => kind === "gate" || kind === "gate-panel"),
        false
    );
    assert.equal(
        world.objectives.some(({ sourceObjectId }) => sourceObjectId?.endsWith(":exit-panel")),
        false
    );

    const bossReadyWorld = createLegacyAreaSeamlessSectorRuntimeWorld({
        seed: 9182,
        floorY: 320,
        interSectorRiseById: { "sector-01:transition:sector-02": 960 }
    });
    const originalSector02Landmark = world.landmarks.find(({ id }) => id === "sector-02:landmark:01");
    const bossReadySector02Landmark = bossReadyWorld.landmarks.find(({ id }) => id === "sector-02:landmark:01");
    assert.deepEqual(bossReadySector02Landmark.localOrigin, originalSector02Landmark.localOrigin);
    assert.deepEqual(bossReadySector02Landmark.localBounds, originalSector02Landmark.localBounds);
    assert.equal(bossReadySector02Landmark.origin.y, originalSector02Landmark.origin.y - 960);
    assert.deepEqual(world.sectorTransitions[0], {
        id: "sector-01:transition:sector-02",
        sourceSectorId: "sector-01",
        targetSectorId: "sector-02",
        sourceExit: world.landmarks.find(({ id }) => id === "sector-01:landmark:08").exit,
        targetOrigin: { x: 0, y: originalSector02Landmark.entry.y },
        rise: 0
    });

    for (const connector of world.connectors) {
        const source = world.landmarks.find(({ id }) => id === connector.sourceLandmarkId);
        const target = world.landmarks.find(({ id }) => id === connector.targetLandmarkId);
        assert.deepEqual(connector.start, source.exit);
        assert.deepEqual(connector.end, target.entry);
        const surface = world.surfaces.find(({ id }) => id === connector.surfaceId);
        if (connector.start.y === connector.end.y) {
            const supportAt = (point) =>
                world.surfaces
                    .filter(
                        (candidate) =>
                            candidate.id !== surface?.id &&
                            candidate.requiredRouteId === undefined &&
                            candidate.blockedByRouteId === undefined &&
                            candidate.topY === point.y + 32 &&
                            candidate.x <= point.x &&
                            candidate.x + candidate.width >= point.x
                    )
                    .sort((left, right) => left.width - right.width)[0];
            const sourceSupport = supportAt(connector.start);
            const targetSupport = supportAt(connector.end);
            const leftSupport = sourceSupport.x < targetSupport.x ? sourceSupport : targetSupport;
            const rightSupport = leftSupport === sourceSupport ? targetSupport : sourceSupport;
            const gapStart = leftSupport.x + leftSupport.width;
            const gapWidth = rightSupport.x - gapStart;
            if (connector.sectorTransition) {
                // Sector-transition seams delegate gating entirely to the dedicated
                // access-transit-lock barrier (transitBarrierGeometry) - this connector's own
                // surface must stay an always-present, ungated bridge or it duplicates that barrier
                // (see LegacyAreaSeamlessSectorRuntime.js's connectorSurface() sectorTransition branch).
                assert.ok(surface, "a sector-transition connector must still get a bridge surface");
                assert.equal(surface.requiredRouteId, undefined);
                assert.equal(surface.blockedByRouteId, undefined);
                const transitLock = world.objects.find(
                    ({ kind, routeLockId }) => kind === "access-transit-lock" && routeLockId === connector.routeLockId
                );
                assert.ok(transitLock, "a sector-transition connector must have a matching access-transit-lock");
                const barrierSurfaces = transitLock.barrierSurfaceIds.map((id) =>
                    world.surfaces.find((candidate) => candidate.id === id)
                );
                assert.ok(barrierSurfaces.every(Boolean));
                assert.ok(barrierSurfaces.every((barrier) => barrier.blockedByRouteId === connector.routeLockId));
            } else if (gapWidth <= 0) {
                // Overlapping authored decks mean there is no gap to bridge, but the transition still
                // needs to be gated - otherwise a player can walk the shortcut created by the overlap
                // without ever satisfying the route's requiredObjectiveIds (see WorldGateGeometry.js's
                // blockedByRouteId: solid while locked, gone once unlocked - the inverse of a normal
                // "appears once unlocked" connector bridge, since here "absent" would not block anything).
                assert.ok(surface, "an overlapping transition must still get a gating barrier surface");
                assert.equal(surface.blockedByRouteId, connector.routeLockId);
                assert.equal(surface.requiredRouteId, undefined);
                assert.equal(surface.grappleable, false);
                assert.equal(surface.oneWay, false);
                const barrierX = (connector.start.x + connector.end.x) / 2;
                assert.ok(
                    surface.x <= barrierX && barrierX <= surface.x + surface.width,
                    "the barrier must sit between the two landmarks' exit/entry points"
                );
                assert.ok(
                    surface.y < connector.start.y && surface.y + surface.height > connector.start.y,
                    "the barrier must vertically cover the shared floor height it is blocking"
                );
            } else {
                assert.ok(surface);
                assert.equal(surface.oneWay, false);
                assert.equal(surface.x, gapStart);
                assert.equal(surface.width, gapWidth);
                assert.equal(surface.y, connector.start.y + 32);
                assert.equal(surface.height, 32);
                assert.ok(
                    surface.width < Math.abs(connector.end.x - connector.start.x),
                    "a route connector must fill only the authored deck gap instead of covering both Stage anchors"
                );
            }
        } else {
            assert.ok(surface);
            assert.equal(surface.oneWay, false);
            assert.ok(surface.height >= 32);
        }
        if (!connector.sectorTransition) {
            const boundaryY = connector.start.y + 32;
            const left = -SEAMLESS_SECTOR_RUNTIME_WIDTH * 0.5 + 96;
            const right = SEAMLESS_SECTOR_RUNTIME_WIDTH * 0.5 - 96;
            const intervals = world.surfaces
                .filter(
                    (candidate) =>
                        candidate.collision !== false &&
                        candidate.renderable !== false &&
                        candidate.topY === boundaryY &&
                        candidate.width > candidate.height
                )
                .map(({ x, width }) => [Math.max(left, x), Math.min(right, x + width)])
                .filter(([start, end]) => end > start)
                .sort((a, b) => a[0] - b[0]);
            const merged = [];
            for (const interval of intervals) {
                const previous = merged.at(-1);
                if (!previous || interval[0] > previous[1]) merged.push([...interval]);
                else previous[1] = Math.max(previous[1], interval[1]);
            }
            const gaps = [];
            let cursor = left;
            for (const [start, end] of merged) {
                if (start > cursor) gaps.push(start - cursor);
                cursor = Math.max(cursor, end);
            }
            if (cursor < right) gaps.push(right - cursor);
            assert.ok(
                gaps.some((width) => width >= PLAYER_CONFIG.radius * 2 + 16),
                `${connector.sourceLandmarkId} → ${connector.targetLandmarkId} must keep a downward backtracking opening`
            );
        }
    }

    const transferLock = world.routeLocks.find(({ targetLandmarkId }) => targetLandmarkId === "sector-03:landmark:01");
    assert.deepEqual(transferLock.requiredObjectiveIds, ["sector-02:landmark:08:objective:transfer-control-read"]);
    for (const lock of world.routeLocks.filter(({ sectorTransition }) => sectorTransition)) {
        assert.equal(lock.requiredAccessModuleCount, 3);
        const device = world.objects.find(
            ({ kind, routeLockId }) => kind === "access-transit-lock" && routeLockId === lock.id
        );
        assert.ok(device);
        assert.equal(device.barrierSegments.length, 2);
        assert.equal(device.barrierSurfaceIds.length, 2);
        for (const surfaceId of device.barrierSurfaceIds) {
            const barrier = world.surfaces.find(({ id }) => id === surfaceId);
            assert.equal(barrier.blockedByRouteId, lock.id);
            assert.equal(barrier.renderable, false);
            assert.equal(barrier.grappleable, false);
        }
    }

    const encounter = world.enemySpawns.find(({ slotId }) => slotId === "sector-02:landmark:02:slot:drone-1");
    const landmark = world.landmarks.find(({ id }) => id === "sector-02:landmark:02");
    const legacyDrone = SECTOR_02_AREA_CATALOG.areas[1].objects.find(({ id }) => id === "sector-02-02:drone-1");
    const legacyActivation = resolveObjectTriggerBounds(legacyDrone.position, legacyDrone.activationSpec);
    assert.ok(encounter);
    assert.equal(encounter.encounterId, "sector-02:landmark:02:encounter:drone-1");
    assert.deepEqual(encounter.enemySelection, { fixedEnemyType: "patrol-drone-t1" });
    assert.deepEqual(encounter.position, {
        x: landmark.origin.x + legacyDrone.position.x,
        y: landmark.origin.y + legacyDrone.position.y
    });
    assert.deepEqual(encounter.activation, {
        x: landmark.origin.x + legacyActivation.x,
        y: landmark.origin.y + legacyActivation.y,
        width: legacyActivation.width,
        height: legacyActivation.height
    });

    const pooledEncounter = world.enemySpawns.find(
        ({ slotId }) => slotId === "sector-03:landmark:08:slot:final-control-guard"
    );
    assert.ok(pooledEncounter);
    assert.deepEqual(pooledEncounter.enemySelection.allowedEnemyTypes, [
        "pursuit-drone-t1",
        "shield-drone-t1",
        "artillery-drone-t1",
        "support-drone-t1",
        "swarm-drone-t1"
    ]);
    assert.equal("areaId" in pooledEncounter, false);
}
