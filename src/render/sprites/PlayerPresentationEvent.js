import {
    CLIENT_FEEDBACK_EVENT_TYPE,
    CLIENT_FEEDBACK_RESOLUTION
} from "../../game/combat/ClientFeedbackEventDefinition.js";

const PLAYER_PRESENTATION_SOURCE_TYPE = Object.freeze({
    CHECKPOINT_RESPAWN: "checkpoint-respawn"
});

const PLAYER_DAMAGE_RESOLUTION = Object.freeze({
    [CLIENT_FEEDBACK_RESOLUTION.PLAYER_HIT]: true,
    [CLIENT_FEEDBACK_RESOLUTION.PLATFORM_COLLISION_DAMAGE]: true
});

function playerTargetId(event) {
    return event.targetId ?? event.playerId ?? event.parameters?.targetId ?? null;
}

function eventCauseId(event) {
    return (
        event.impactId ??
        event.predictionId ??
        event.parameters?.predictionId ??
        event.parameters?.eventId ??
        event.objectId ??
        event.projectileId ??
        event.eventId ??
        null
    );
}

function impactCauseId(event, index) {
    return eventCauseId(event) ?? `${event.eventType}:${event.tick ?? index}`;
}

function respawnCauseId(event, playerId) {
    const causeId = event.causeId ?? eventCauseId(event);
    if (causeId) return `respawn:${playerId}:${causeId}`;
    const position = event.position ?? {};
    const x = Number.isFinite(position.x) ? position.x.toFixed(3) : "unknown";
    const y = Number.isFinite(position.y) ? position.y.toFixed(3) : "unknown";
    return `respawn:${playerId}:${event.reason ?? "unknown"}:${x}:${y}`;
}

class PlayerPresentationEventDefinition {
    matches(_event) {
        return false;
    }

    project(_event, _index) {
        return null;
    }

    hit(event, index) {
        const playerId = playerTargetId(event);
        return Object.freeze({ id: `hit:${playerId}:${impactCauseId(event, index)}`, playerId, type: "hit" });
    }

    respawn(event, playerId = playerTargetId(event)) {
        return Object.freeze({
            id: respawnCauseId(event, playerId),
            playerId,
            type: "respawn",
            deathPosition: event.deathPosition ?? event.position,
            respawnPosition: event.respawnPosition ?? event.position ?? null
        });
    }
}

class PlayerDamagePresentationEventDefinition extends PlayerPresentationEventDefinition {
    matches(event) {
        return PLAYER_DAMAGE_RESOLUTION[event.resolution] === true && playerTargetId(event) !== null;
    }

    project(event, index) {
        return event.respawned ? this.respawn(event) : this.hit(event, index);
    }
}

class PlayerRespawnPresentationEventDefinition extends PlayerPresentationEventDefinition {
    matches(event) {
        return event.eventType === CLIENT_FEEDBACK_EVENT_TYPE.PLAYER_RESPAWNED && typeof event.playerId === "string";
    }

    project(event) {
        return this.respawn(event, event.playerId);
    }
}

class CheckpointRespawnPresentationEventDefinition extends PlayerPresentationEventDefinition {
    matches(event) {
        return event.type === PLAYER_PRESENTATION_SOURCE_TYPE.CHECKPOINT_RESPAWN && typeof event.playerId === "string";
    }

    project(event) {
        return this.respawn(event, event.playerId);
    }
}

const PLAYER_PRESENTATION_EVENT_DEFINITIONS = Object.freeze([
    new PlayerDamagePresentationEventDefinition(),
    new PlayerRespawnPresentationEventDefinition(),
    new CheckpointRespawnPresentationEventDefinition()
]);

export function createPlayerPresentationEvents(events = []) {
    return Object.freeze(
        events.flatMap((event, index) => {
            if (!event) return [];
            const definition = PLAYER_PRESENTATION_EVENT_DEFINITIONS.find((candidate) => candidate.matches(event));
            const projected = definition?.project(event, index) ?? null;
            return projected ? [projected] : [];
        })
    );
}
