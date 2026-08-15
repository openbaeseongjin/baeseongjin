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

export function advanceWorldProgress({ world, progress, players, commandsByPlayerId, dt = 0 }) {
    const progressSnapshot = progress?.snapshot();
    if (!progress || progressSnapshot.completed || progressSnapshot.contentBoundaryReached) return Object.freeze([]);
    const events = [];
    const currentArea = world.areas.find(({ id }) => id === progress.currentAreaId);
    if (!currentArea) throw new Error(`Missing assembled area '${progress.currentAreaId}'`);

    for (const objectiveId of currentArea.objectiveIds) {
        const objective = world.objectives.find(({ id }) => id === objectiveId);
        if (objective.type === "interact-choice") {
            for (const player of interactingPlayers(objective, world, progress, players, commandsByPlayerId)) {
                events.push(
                    Object.freeze({
                        type: "objective-choice-requested",
                        objectiveId,
                        sourceObjectId: objective.sourceObjectId,
                        areaId: currentArea.id,
                        playerId: player.id,
                        position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
                    })
                );
            }
            continue;
        }
        if (progress.isObjectiveComplete(objectiveId)) continue;
        const sequence = progress.objectiveSequence(objectiveId);
        if (sequence) {
            const result = progress.advanceObjectiveSequence(objectiveId, dt);
            if (!result.sequenceCompleted) continue;
            appendCompletionEvents(events, {
                result,
                objectiveId,
                areaId: currentArea.id,
                playerId: result.playerId,
                position: players.find(({ id }) => id === result.playerId)?.physics.position ?? currentArea.exit
            });
            continue;
        }
        const player = completingPlayer(objective, world, progress, players, commandsByPlayerId);
        if (!player) continue;
        if (objective.completionDelaySeconds) {
            const result = progress.startObjectiveSequence(objectiveId, {
                playerId: player.id,
                durationSeconds: objective.completionDelaySeconds
            });
            if (result.changed) {
                events.push(
                    Object.freeze({
                        type: "objective-sequence-started",
                        objectiveId,
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
        const result = progress.completeObjective(objectiveId);
        appendCompletionEvents(events, {
            result,
            objectiveId,
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
