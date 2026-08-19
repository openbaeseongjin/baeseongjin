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
    if (objective.type === "augment-calibration") {
        return completingCalibrationPlayer(objective, world, players);
    }
    if (objective.type !== "interact" && objective.type !== "interact-choice") return null;
    return interactingPlayers(objective, world, progress, players, commandsByPlayerId)[0] ?? null;
}

// See SectorProgressController.js's identical helper for the full rationale (player-local
// verification, leaver/late-join semantics).
function completingCalibrationPlayer(objective, world, players) {
    const source = world.objects.find(({ id }) => id === objective.sourceObjectId);
    if (!source) return null;
    const eligible = activePlayers(players).filter(({ foundation }) => foundation?.selectedAugmentIds?.length > 0);
    if (eligible.length === 0) return null;
    const allVerified = eligible.every((player) => player.calibrationVerifiedSourceIds?.includes(source.id));
    return allVerified ? eligible[0] : null;
}

function appendCompletionEvents(events, { result, objectiveId, areaId, playerId, position }) {
    if (!result.changed) return;
    events.push(
        Object.freeze({
            type: "objective-completed",
            objectiveId,
            areaId,
            playerId,
            position: Object.freeze({ x: position.x, y: position.y })
        })
    );
    if (!result.gateUnlocked) return;
    events.push(
        Object.freeze({
            type: "gate-unlocked",
            gateId: result.gateId,
            areaId,
            playerId,
            position: Object.freeze({ x: position.x, y: position.y })
        })
    );
}

export function completeWorldProgressObjective({ progress, objectiveId, areaId, player }) {
    const events = [];
    const result = progress.completeObjective(objectiveId);
    appendCompletionEvents(events, {
        result,
        objectiveId,
        areaId,
        playerId: player.id,
        position: player.physics.position
    });
    return Object.freeze(events);
}

export function advanceWorldProgress({
    world,
    progress,
    players,
    commandsByPlayerId,
    dt = 0,
    resolveInteractChoice = true
}) {
    const progressSnapshot = progress?.snapshot();
    if (!progress || progressSnapshot.completed || progressSnapshot.contentBoundaryReached) return Object.freeze([]);
    const events = [];
    const currentArea = world.areas.find(({ id }) => id === progress.currentAreaId);
    if (!currentArea) throw new Error(`Missing assembled area '${progress.currentAreaId}'`);

    const objectiveAreaById = new Map();
    for (const area of world.areas) {
        for (const objectiveId of area.objectiveIds) objectiveAreaById.set(objectiveId, area);
    }

    for (const objective of world.objectives) {
        const objectiveArea = objectiveAreaById.get(objective.id) ?? currentArea;
        if (objective.type === "interact-choice") {
            // The personal Foundation chooser opens on the owning client; only the confirmed
            // selection claim reaches the authority. When the authority resolves choice
            // requests itself (single player), the node stays openable in any area a player
            // still occupies, because the shared frontier may have moved past it.
            if (resolveInteractChoice) {
                for (const player of interactingPlayers(objective, world, progress, players, commandsByPlayerId)) {
                    events.push(
                        Object.freeze({
                            type: "objective-choice-requested",
                            objectiveId: objective.id,
                            sourceObjectId: objective.sourceObjectId,
                            areaId: objectiveArea.id,
                            playerId: player.id,
                            position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
                        })
                    );
                }
            }
            continue;
        }
        if (!currentArea.objectiveIds.includes(objective.id)) continue;
        if (progress.isObjectiveComplete(objective.id)) continue;
        const sequence = progress.objectiveSequence(objective.id);
        if (sequence) {
            const result = progress.advanceObjectiveSequence(objective.id, dt);
            if (!result.sequenceCompleted) continue;
            appendCompletionEvents(events, {
                result,
                objectiveId: objective.id,
                areaId: currentArea.id,
                playerId: result.playerId,
                position: players.find(({ id }) => id === result.playerId)?.physics.position ?? currentArea.exit
            });
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
                        areaId: currentArea.id,
                        playerId: player.id,
                        durationSeconds: objective.completionDelaySeconds,
                        storySequenceId: objective.storySequenceId ?? null,
                        position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
                    })
                );
            }
            continue;
        }
        const result = progress.completeObjective(objective.id);
        appendCompletionEvents(events, {
            result,
            objectiveId: objective.id,
            areaId: currentArea.id,
            playerId: player.id,
            position: player.physics.position
        });
    }

    const gate = world.gates.find(({ id }) => id === currentArea.gateId);
    if (!progress.isGateUnlocked(gate.id)) return Object.freeze(events);
    const player = activePlayers(players).find(({ physics }) => pointInsideBounds(physics.position, gate.trigger));
    if (!player) return Object.freeze(events);
    const result = progress.crossGate(gate.id);
    if (!result.changed) return Object.freeze(events);
    events.push(
        Object.freeze({
            type: "gate-crossed",
            gateId: gate.id,
            areaId: currentArea.id,
            nextAreaId: gate.nextAreaId,
            playerId: player.id,
            position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
        })
    );
    return Object.freeze(events);
}
