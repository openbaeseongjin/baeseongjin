function eventPosition(event) {
    const position = event.position ?? event.parameters?.position;
    return position && Number.isFinite(position.x) && Number.isFinite(position.y) ? position : null;
}

function eventCausalId(prefix, event) {
    const id =
        event.predictionId ?? event.parameters?.predictionId ?? event.objectId ?? event.projectileId ?? event.eventId;
    return id ? `${prefix}:${id}` : null;
}

export class AudioEventBindings {
    constructor(host) {
        this.host = host;
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
            if (event.eventType === "spawn" || event.eventType === "predicted-spawn") {
                this.host.play("gameplay-weapon-fire", {
                    ...context,
                    emitterId: event.parameters?.ownerId ?? event.ownerId ?? "projectile",
                    causalId: eventCausalId("weapon-fire", event),
                    position: eventPosition(event) ?? context.listener
                });
                continue;
            }
            if (
                (event.eventType === "resolve" || event.eventType === "predicted-resolve") &&
                event.resolution === "player-hit"
            ) {
                this.host.play("gameplay-player-hit", {
                    ...context,
                    emitterId: event.targetId ?? event.parameters?.targetId ?? "player",
                    causalId: eventCausalId("player-hit", event),
                    position: eventPosition(event) ?? context.listener
                });
                continue;
            }
            if (event.eventType === "checkpoint-reached") {
                this.checkpointReached(event, context);
            }
        }
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
