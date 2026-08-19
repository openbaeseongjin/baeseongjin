function eventPosition(event) {
    const position = event.position ?? event.parameters?.position;
    return position && Number.isFinite(position.x) && Number.isFinite(position.y) ? position : null;
}

function eventCausalId(prefix, event) {
    const id =
        event.impactId ??
        event.predictionId ??
        event.parameters?.predictionId ??
        event.objectId ??
        event.projectileId ??
        event.eventId;
    return id ? `${prefix}:${id}` : null;
}

function projectileSpawnBinding(event, context) {
    if (event.eventType !== "spawn" && event.eventType !== "predicted-spawn") return null;
    return Object.freeze({
        cueId: "gameplay-weapon-fire",
        request: Object.freeze({
            ...context,
            emitterId: event.parameters?.ownerId ?? event.ownerId ?? "projectile",
            causalId: eventCausalId("weapon-fire", event),
            position: eventPosition(event) ?? context.listener
        })
    });
}

function actionStartBinding(event, context) {
    if (event.eventType !== "augment-action-started" && event.eventType !== "predicted-augment-action-started") {
        return null;
    }
    const activationId = event.activationId ?? event.parameters?.activationId;
    return Object.freeze({
        cueId: "gameplay-action-swing",
        request: Object.freeze({
            ...context,
            emitterId: event.playerId ?? event.ownerId ?? event.parameters?.playerId ?? "action",
            causalId: activationId ? `action-start:${activationId}` : eventCausalId("action-start", event),
            position: eventPosition(event) ?? context.listener
        })
    });
}

function playerHitBinding(event, context) {
    const isFallDamage =
        event.eventType === "player-fall-damaged" || event.eventType === "predicted-player-fall-damaged";
    if (
        !isFallDamage &&
        ((event.eventType !== "resolve" && event.eventType !== "predicted-resolve") ||
            event.resolution !== "player-hit")
    ) {
        return null;
    }
    return Object.freeze({
        cueId: "gameplay-player-hit",
        request: Object.freeze({
            ...context,
            emitterId: event.targetId ?? event.parameters?.targetId ?? "player",
            causalId: eventCausalId(isFallDamage ? "fall-damage" : "player-hit", event),
            position: eventPosition(event) ?? context.listener
        })
    });
}

function checkpointBinding(event, context) {
    if (event.eventType !== "checkpoint-reached" && event.eventType !== "stage-savepoint-reached") return null;
    if (event.playerId && context.localPlayerId && event.playerId !== context.localPlayerId) return null;
    const checkpointId = event.checkpointId ?? event.respawnAnchorId;
    return Object.freeze({
        cueId: "gameplay-checkpoint-reached",
        request: Object.freeze({
            ...context,
            emitterId: checkpointId,
            causalId: `checkpoint:${checkpointId}`,
            position: event.position
        })
    });
}

function authoredProgressBinding(event, context) {
    if (event.eventType === "gate-unlocked") {
        return Object.freeze({
            cueId: "ui-confirm",
            request: Object.freeze({
                ...context,
                emitterId: event.gateId,
                causalId: `gate-unlocked:${event.gateId}`
            })
        });
    }
    if (event.eventType !== "gate-crossed") return null;
    return Object.freeze({
        cueId: "gameplay-checkpoint-reached",
        request: Object.freeze({
            ...context,
            emitterId: event.gateId,
            causalId: `gate-crossed:${event.gateId}`,
            position: event.position ?? context.listener
        })
    });
}

export const DEFAULT_AUDIO_EVENT_HANDLERS = Object.freeze([
    actionStartBinding,
    projectileSpawnBinding,
    playerHitBinding,
    checkpointBinding,
    authoredProgressBinding
]);

export class AudioEventBindings {
    constructor(host, { eventHandlers = DEFAULT_AUDIO_EVENT_HANDLERS } = {}) {
        if (!host?.play) throw new Error("AudioEventBindings requires an audio host");
        if (!Array.isArray(eventHandlers) || eventHandlers.some((handler) => typeof handler !== "function")) {
            throw new Error("audio event handlers must be functions");
        }
        this.host = host;
        this.eventHandlers = Object.freeze([...eventHandlers]);
        this.scene = null;
    }

    uiConfirm() {
        return this.host.play("ui-confirm", { emitterId: "mode-menu" });
    }

    observeRope(beforeRope, afterRope, context) {
        if (beforeRope?.isAttached || !afterRope?.isAttached) return false;
        return this.host.play("gameplay-rope-attach", {
            ...context,
            emitterId: context.localPlayerId,
            causalId: `rope-attach:${context.localPlayerId}:${context.tick}:${afterRope.anchor?.x}:${afterRope.anchor?.y}`,
            position: afterRope.anchor ?? context.listener
        });
    }

    checkpointReached({ checkpointId, position }, context) {
        return this.host.play("gameplay-checkpoint-reached", {
            ...context,
            emitterId: checkpointId,
            causalId: `checkpoint:${checkpointId}`,
            position
        });
    }

    handleEvents(events, context) {
        for (const event of events) {
            for (const handler of this.eventHandlers) {
                const binding = handler(event, context);
                if (!binding) continue;
                if (
                    typeof binding.cueId !== "string" ||
                    !binding.cueId ||
                    !binding.request ||
                    typeof binding.request !== "object"
                ) {
                    throw new Error("audio event handlers must return a cueId and request");
                }
                this.host.play(binding.cueId, binding.request);
            }
        }
    }

    presentFrame({ events = [], context = null, ropeTransition = null, checkpoint = null, scene = null } = {}) {
        const presentationContext = context ?? scene;
        if (events.length > 0) this.handleEvents(events, presentationContext);
        if (ropeTransition) {
            this.observeRope(ropeTransition.before, ropeTransition.after, presentationContext);
        }
        if (checkpoint) this.checkpointReached(checkpoint, presentationContext);
        if (scene) this.syncScene(scene);
    }

    syncScene(scene) {
        this.scene = scene;
        if (!scene?.listener || !scene.visibleWorldBounds) return;
        const context = {
            listener: scene.listener,
            position: scene.listener,
            visibleWorldBounds: scene.visibleWorldBounds
        };
        this.host.startLoop("ambience-altitude-wind", "ambience:altitude-wind", context);
        this.host.startLoop(scene.runState === "completed" ? "bgm-run-complete" : "bgm-climb", "bgm:main", context);
    }

    resync() {
        if (this.scene) this.syncScene(this.scene);
    }

    stopScene() {
        this.scene = null;
        this.host.stopAll();
    }
}
