import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";

export const SHARED_CLIENT_FEEDBACK_CAPABILITY = "shared-client-feedback";
export const PERSONAL_CLIENT_FEEDBACK_CAPABILITY = "personal-client-feedback";
export const CLIENT_STATUS_VISIBILITY_CAPABILITY = "client-status-visibility";
const feedbackDispatcher = new SimulationDispatcher();

const PERSONAL_STATUS_TYPES = new Set([
    "attach",
    "release",
    "swing",
    "rope-cut",
    "checkpoint-respawn",
    "sector-respawn",
    "stage-saved"
]);

const withSharedClientFeedback = createSimulationCapabilityMixin({
    id: SHARED_CLIENT_FEEDBACK_CAPABILITY,
    order: 10,
    apply({ appendShared }) {
        appendShared(this);
    }
});

const withPersonalClientFeedback = createSimulationCapabilityMixin({
    id: PERSONAL_CLIENT_FEEDBACK_CAPABILITY,
    order: 20,
    apply({ viewerId, appendPersonal }) {
        if (this.personalViewerId !== viewerId) return false;
        appendPersonal(this);
        return true;
    }
});

class ClientFeedbackEventObject extends withPersonalClientFeedback(withSharedClientFeedback(SimulationDrivenObject)) {
    constructor({ id, resolution, position, damage, sourcePlayerId, targetId }) {
        super({ id });
        this.type = resolution;
        this.position = Object.freeze({ x: position.x, y: position.y });
        this.damage = damage;
        this.sourcePlayerId = sourcePlayerId;
        this.targetId = targetId;
        this.personalViewerId =
            resolution === "player-hit" || resolution === "rope-cut" || resolution === "fall-damage"
                ? targetId
                : sourcePlayerId;
    }
}

const withClientStatusVisibility = createSimulationCapabilityMixin({
    id: CLIENT_STATUS_VISIBILITY_CAPABILITY,
    order: 10,
    apply({ viewerId }) {
        return !this.personalViewerId || this.personalViewerId === viewerId ? this.event : null;
    }
});

class ClientStatusEventObject extends withClientStatusVisibility(SimulationDrivenObject) {
    constructor(event) {
        super({ id: `client-status:${event.type}:${event.playerId ?? "shared"}` });
        this.event = event;
        this.personalViewerId = PERSONAL_STATUS_TYPES.has(event.type) ? (event.playerId ?? null) : null;
    }
}

function normalizeClientStatusEvent(event) {
    if (event?.eventType === "player-respawned") {
        if (event.statusType !== "checkpoint-respawn" && event.statusType !== "sector-respawn") return null;
        return Object.freeze({
            type: event.statusType,
            age: 0,
            playerId: event.playerId,
            reason: event.reason,
            causeId: event.causeId,
            deathPosition: event.deathPosition,
            position: event.position
        });
    }
    return typeof event?.type === "string" ? event : null;
}

export function createClientFeedbackEventObject(event, index = 0) {
    const parameters = event.parameters ?? {};
    return new ClientFeedbackEventObject({
        id: event.eventId ?? event.predictionId ?? event.projectileId ?? `client-feedback-${index}`,
        resolution: event.resolution,
        position: event.position,
        damage: event.damage ?? parameters.damage ?? 0,
        sourcePlayerId: event.sourcePlayerId ?? parameters.sourcePlayerId ?? null,
        targetId: event.targetId ?? parameters.targetId ?? null
    });
}

export function selectClientStatusFeedback(event, viewerId) {
    const normalized = normalizeClientStatusEvent(event);
    if (!normalized) return null;
    const statusEvent = new ClientStatusEventObject(normalized);
    const [outcome] = feedbackDispatcher.dispatch({
        objects: [statusEvent],
        capabilityId: CLIENT_STATUS_VISIBILITY_CAPABILITY,
        context: { viewerId }
    });
    return outcome?.result ?? null;
}
