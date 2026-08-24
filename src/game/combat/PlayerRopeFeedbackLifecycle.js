import { PLAYER_ROPE_FEEDBACK_CONFIG, PLAYER_ROPE_FEEDBACK_KEY } from "./PlayerRopeFeedbackDefinition.js";

function finiteVector(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y) ? value : null;
}

function sampleId(player) {
    if (Number.isSafeInteger(player.ownerMotionTick))
        return PLAYER_ROPE_FEEDBACK_KEY.motionSample(player.ownerMotionTick);
    return PLAYER_ROPE_FEEDBACK_KEY.frameSample(player.position ?? {}, player.velocity ?? {}, player);
}

export class PlayerRopeFeedbackLifecycle {
    constructor({ config = PLAYER_ROPE_FEEDBACK_CONFIG } = {}) {
        this.config = config;
        this.previousByPlayerId = new Map();
        this.suppressedDetachRemainingByPlayerId = new Map();
    }

    sample(player, dt) {
        if (!player?.id || !finiteVector(player.position)) return null;
        const previous = this.previousByPlayerId.get(player.id) ?? null;
        const velocity = finiteVector(player.velocity) ?? this.config.ZERO_VECTOR;
        const shot = player.launcher?.shot ?? null;
        const swing = player.control?.swingDrag ?? player.swingDrag ?? null;
        const current = {
            sampleId: sampleId(player),
            velocity: { ...velocity },
            position: { ...player.position },
            lifeState: player.lifeState,
            attached: player.rope?.isAttached === true,
            shot: shot ? { ...shot, origin: { ...shot.origin }, direction: { ...shot.direction } } : null,
            swingUsed: swing?.used === true,
            pointerKnown: typeof player.control?.lastPointer?.down === "boolean",
            pointerDown: player.control?.lastPointer?.down === true,
            transition: (previous?.transition ?? this.config.INITIAL_SEQUENCE) + this.config.TRANSITION_INCREMENT
        };
        this.previousByPlayerId.set(player.id, current);
        return { player, dt, previous, current, velocity, shot, swing };
    }

    suppressDetach(playerId, seconds = this.config.SUPPRESS_DETACH_SECONDS) {
        if (playerId) this.suppressedDetachRemainingByPlayerId.set(playerId, seconds);
    }

    detachSuppressed(playerId) {
        return this.suppressedDetachRemainingByPlayerId.has(playerId);
    }

    update(dt) {
        for (const [playerId, remaining] of this.suppressedDetachRemainingByPlayerId) {
            const next = remaining - dt;
            if (next <= this.config.POSITIVE_THRESHOLD) this.suppressedDetachRemainingByPlayerId.delete(playerId);
            else this.suppressedDetachRemainingByPlayerId.set(playerId, next);
        }
    }

    removeMissing(players) {
        const activeIds = new Set(players.map(({ id }) => id));
        for (const playerId of this.previousByPlayerId.keys())
            if (!activeIds.has(playerId)) this.previousByPlayerId.delete(playerId);
        for (const playerId of this.suppressedDetachRemainingByPlayerId.keys())
            if (!activeIds.has(playerId)) this.suppressedDetachRemainingByPlayerId.delete(playerId);
    }
}
