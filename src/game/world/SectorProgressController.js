import { pointInsideBounds } from "./WorldForceField.js";

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
    if (objective.type !== "interact" && objective.type !== "interact-choice") return null;
    return interactingPlayers(objective, world, progress, players, commandsByPlayerId)[0] ?? null;
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

function entryBounds(position, size = 128) {
    return Object.freeze({
        x: position.x - size * 0.5,
        y: position.y - size * 0.5,
        width: size,
        height: size
    });
}

export function advanceSectorProgress({
    world,
    progress,
    players,
    commandsByPlayerId,
    dt = 0,
    resolveInteractChoice = true
}) {
    if (!progress) return Object.freeze([]);
    const events = [];
    const snapshot = progress.snapshot();
    if (snapshot.contentBoundaryReached) return Object.freeze(events);
    const landmark = world.landmarks.find(({ id }) => id === snapshot.currentLandmarkId);
    if (!landmark) throw new Error(`Missing current landmark '${snapshot.currentLandmarkId}'`);

    for (const objectiveId of landmark.objectiveIds) {
        const objective = world.objectives.find(({ id }) => id === objectiveId);
        if (!objective || progress.isObjectiveComplete(objective.id)) continue;
        if (objective.type === "interact-choice") {
            if (!resolveInteractChoice) continue;
            for (const player of interactingPlayers(objective, world, progress, players, commandsByPlayerId)) {
                events.push(
                    Object.freeze({
                        type: "objective-choice-requested",
                        objectiveId: objective.id,
                        sourceObjectId: objective.sourceObjectId,
                        landmarkId: landmark.id,
                        playerId: player.id,
                        position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
                    })
                );
            }
            continue;
        }
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
                        landmarkId: landmark.id,
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

    const current = progress.snapshot();
    const route = world.routeLocks.find(({ sourceLandmarkId }) => sourceLandmarkId === current.currentLandmarkId);
    if (!route || !progress.isRouteUnlocked(route.id)) return Object.freeze(events);
    const target = world.landmarks.find(({ id }) => id === route.targetLandmarkId);
    const player = activePlayers(players).find(({ physics }) =>
        pointInsideBounds(physics.position, entryBounds(target.entry))
    );
    if (!player) return Object.freeze(events);
    const result = progress.visitLandmark(target.id);
    if (!result.changed) return Object.freeze(events);
    events.push(
        Object.freeze({
            type: "landmark-entered",
            landmarkId: target.id,
            previousLandmarkId: route.sourceLandmarkId,
            sectorId: target.sectorId,
            playerId: player.id,
            position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
        })
    );
    if (result.sectorChanged) {
        events.push(
            Object.freeze({
                type: "sector-entered",
                sectorId: target.sectorId,
                previousSectorId: result.previousSectorId,
                respawnAnchorId: result.respawnAnchorId,
                playerId: player.id,
                position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
            })
        );
    }
    return Object.freeze(events);
}
