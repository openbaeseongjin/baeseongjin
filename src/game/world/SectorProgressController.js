import { pointInsideBounds } from "./WorldForceField.js";
import { playerOverlapsStageSavePoint } from "./StageSavePointGeometry.js";

function activePlayers(players) {
    return players.filter(({ lifeState }) => lifeState === "active");
}

function interactingPlayers(objective, world, progress, players, commandsByPlayerId) {
    if (objective.requiredObjectiveIds?.some((id) => !progress.isObjectiveComplete(id))) return [];
    const object = world.objects.find(({ id }) => id === objective.sourceObjectId);
    if (!object) return [];
    return activePlayers(players).filter((player) => {
        const command = commandsByPlayerId.get(player.id);
        return (
            command?.interact === true &&
            player.physics.position.distanceTo(object.position) <= object.interactionRadius
        );
    });
}

function completingPlayer(objective, world, progress, players, commandsByPlayerId) {
    if (objective.requiredObjectiveIds?.some((id) => !progress.isObjectiveComplete(id))) return null;
    if (objective.type === "reach") {
        return (
            activePlayers(players).find(({ physics }) => pointInsideBounds(physics.position, objective.bounds)) ?? null
        );
    }
    if (objective.type === "augment-calibration") {
        return completingCalibrationPlayer(objective, world, players);
    }
    if (objective.type !== "interact" && objective.type !== "interact-choice") return null;
    return interactingPlayers(objective, world, progress, players, commandsByPlayerId)[0] ?? null;
}

// Player-local: the shared objective only completes once every currently active, already-selected
// Player has individually verified their own calibration (see GameSimulation.js's
// #advanceCalibrationVerification). A leaver drops out of activePlayers() on their own, so they
// cannot deadlock the remaining roster; once true this stays true (completeObjective is one-way), so
// a late joiner cannot relock an already-open gate.
function completingCalibrationPlayer(objective, world, players) {
    const source = world.objects.find(({ id }) => id === objective.sourceObjectId);
    if (!source) return null;
    const eligible = activePlayers(players).filter(
        ({ foundation }) => foundation?.selectedAugmentIds?.length > 0
    );
    if (eligible.length === 0) return null;
    const allVerified = eligible.every((player) => player.calibrationVerifiedSourceIds?.includes(source.id));
    return allVerified ? eligible[0] : null;
}

function completionEvents({ result, objective, player, beforeRoutes, afterRoutes }) {
    if (!result.changed) return [];
    const events = [
        Object.freeze({
            type: "objective-completed",
            objectiveId: objective.id,
            landmarkId: objective.landmarkId,
            playerId: player.id,
            position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
        })
    ];
    for (const routeId of afterRoutes) {
        if (beforeRoutes.has(routeId)) continue;
        events.push(
            Object.freeze({
                type: "route-unlocked",
                routeId,
                landmarkId: objective.landmarkId,
                playerId: player.id,
                position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
            })
        );
    }
    return events;
}

function stageSavepointEvents(world, players, respawnAnchorIdByPlayerId) {
    const reachableAnchors = [...world.respawnAnchors].sort((left, right) => right.level - left.level);
    const events = [];
    for (const player of activePlayers(players)) {
        const anchor = reachableAnchors.find((candidate) => playerOverlapsStageSavePoint(player, candidate));
        const currentAnchor = world.respawnAnchors.find(({ id }) => id === respawnAnchorIdByPlayerId.get(player.id));
        if (!anchor || anchor.level <= (currentAnchor?.level ?? -1)) continue;
        events.push(
            Object.freeze({
                type: "stage-savepoint-reached",
                playerId: player.id,
                respawnAnchorId: anchor.id,
                landmarkId: anchor.landmarkId,
                stageAlias: anchor.legacyStageAlias,
                position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
            })
        );
    }
    return events;
}

export function advanceSectorProgress({
    world,
    progress,
    players,
    commandsByPlayerId,
    respawnAnchorIdByPlayerId = new Map(),
    dt = 0,
    resolveInteractChoice = true
}) {
    if (!progress) return Object.freeze([]);
    const events = [];
    const snapshot = progress.snapshot();
    if (snapshot.contentBoundaryReached) return Object.freeze(events);
    if (resolveInteractChoice) {
        for (const objective of world.objectives) {
            if (objective.type !== "interact-choice" || progress.isObjectiveComplete(objective.id)) continue;
            for (const player of interactingPlayers(objective, world, progress, players, commandsByPlayerId)) {
                events.push(
                    Object.freeze({
                        type: "objective-choice-requested",
                        objectiveId: objective.id,
                        sourceObjectId: objective.sourceObjectId,
                        landmarkId: objective.landmarkId,
                        playerId: player.id,
                        position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
                    })
                );
            }
        }
    }

    for (const objective of world.objectives) {
        if (progress.isObjectiveComplete(objective.id)) continue;
        if (objective.type === "interact-choice") continue;
        const sequence = progress.objectiveSequence(objective.id);
        if (sequence) {
            const beforeRoutes = new Set(progress.snapshot().unlockedRouteIds);
            const result = progress.advanceObjectiveSequence(objective.id, dt);
            if (!result.sequenceCompleted) continue;
            const player = players.find(({ id }) => id === result.playerId);
            if (!player) continue;
            events.push(
                ...completionEvents({
                    result,
                    objective,
                    player,
                    beforeRoutes,
                    afterRoutes: progress.snapshot().unlockedRouteIds
                })
            );
            continue;
        }
        const player = completingPlayer(objective, world, progress, players, commandsByPlayerId);
        if (!player) continue;
        if (objective.completionDelaySeconds) {
            const result = progress.startObjectiveSequence(objective.id, {
                playerId: player.id,
                durationSeconds: objective.completionDelaySeconds
            });
            if (result.changed) {
                events.push(
                    Object.freeze({
                        type: "objective-sequence-started",
                        objectiveId: objective.id,
                        landmarkId: objective.landmarkId,
                        playerId: player.id,
                        durationSeconds: objective.completionDelaySeconds,
                        position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
                    })
                );
            }
            continue;
        }
        const beforeRoutes = new Set(progress.snapshot().unlockedRouteIds);
        const result = progress.completeObjective(objective.id);
        events.push(
            ...completionEvents({
                result,
                objective,
                player,
                beforeRoutes,
                afterRoutes: progress.snapshot().unlockedRouteIds
            })
        );
    }

    events.push(...stageSavepointEvents(world, players, respawnAnchorIdByPlayerId));
    return Object.freeze(events);
}
