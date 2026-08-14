import { pointInsideBounds } from "./WorldForceField.js";

function activePlayers(players) {
    return players.filter(({ lifeState }) => lifeState === "active");
}

function completingPlayer(objective, world, players, commandsByPlayerId) {
    if (objective.type === "reach") {
        return (
            activePlayers(players).find(({ physics }) => pointInsideBounds(physics.position, objective.bounds)) ?? null
        );
    }
    if (objective.type !== "interact") return null;
    const object = world.objects.find(({ id }) => id === objective.sourceObjectId);
    if (!object) return null;
    return (
        activePlayers(players).find((player) => {
            const command = commandsByPlayerId.get(player.id);
            return (
                command?.interact === true &&
                player.physics.position.distanceTo(object.position) <= object.interactionRadius
            );
        }) ?? null
    );
}

export function advanceWorldProgress({ world, progress, players, commandsByPlayerId }) {
    const progressSnapshot = progress?.snapshot();
    if (!progress || progressSnapshot.completed || progressSnapshot.contentBoundaryReached) return Object.freeze([]);
    const events = [];
    const currentArea = world.areas.find(({ id }) => id === progress.currentAreaId);
    if (!currentArea) throw new Error(`Missing assembled area '${progress.currentAreaId}'`);

    for (const objectiveId of currentArea.objectiveIds) {
        if (progress.isObjectiveComplete(objectiveId)) continue;
        const objective = world.objectives.find(({ id }) => id === objectiveId);
        const player = completingPlayer(objective, world, players, commandsByPlayerId);
        if (!player) continue;
        const result = progress.completeObjective(objectiveId);
        if (!result.changed) continue;
        events.push(
            Object.freeze({
                type: "objective-completed",
                objectiveId,
                areaId: currentArea.id,
                playerId: player.id,
                position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
            })
        );
        if (result.gateUnlocked) {
            events.push(
                Object.freeze({
                    type: "gate-unlocked",
                    gateId: result.gateId,
                    areaId: currentArea.id,
                    playerId: player.id,
                    position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
                })
            );
        }
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
