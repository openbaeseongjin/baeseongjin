import { CLIENT_FEEDBACK_PRESET_ID } from "./ClientFeedbackEventDefinition.js";

export const PLAYER_LIFE_STATE = Object.freeze({ ACTIVE: "active" });

export const PLAYER_ROPE_AUGMENT_ID = Object.freeze({
    RELEASE_PROPULSION: "release-propulsion",
    ELECTRIFIED_ROPE: "electrified-rope"
});

export const PLAYER_ROPE_FEEDBACK_CONFIG = Object.freeze({
    ANGLE_FALLBACK: 0,
    ZERO_VECTOR: Object.freeze({ x: 0, y: 0 }),
    SUPPRESS_DETACH_SECONDS: 0.8,
    EMITTER_INTERVAL_SECONDS: 0.16,
    INITIAL_ELAPSED_SECONDS: 0,
    INITIAL_SEQUENCE: 0,
    SEQUENCE_INCREMENT: 1,
    EMITTER_DENSITY: 0.6,
    EMITTER_PRIORITY: 0,
    TRANSITION_INCREMENT: 1,
    POSITION_JUMP_DISTANCE: 160,
    FLIGHT_DENSITY: 0.42,
    BASE_RELEASE_DENSITY: 1,
    RELEASE_PROPULSION_DENSITY: 1.45,
    TENSION_START: 180,
    TENSION_RANGE: 820,
    TENSION_MAX_DENSITY: 0.8,
    MOTION_SPEED_THRESHOLD: 350,
    MOTION_BASE_DENSITY: 0.3,
    MOTION_MAX_DENSITY: 0.85,
    MOTION_DENSITY_RANGE: 900,
    SAMPLE_DT_MIN: 1 / 120,
    SAMPLE_DT_MAX: 0.12,
    SAMPLE_DT_DEFAULT: 1 / 60,
    ACCELERATION_MAX: 4200,
    ATTACHED_ACCELERATION_THRESHOLD: 2600,
    FREE_ACCELERATION_THRESHOLD: 1800,
    ATTACHED_SPEED_GAIN_THRESHOLD: 100,
    FREE_SPEED_GAIN_THRESHOLD: 55,
    POSITIVE_THRESHOLD: 0
});

const TRANSITION_EFFECT = Object.freeze({
    LAUNCH: "launch",
    ATTACH: "attach",
    PULSE: "pulse",
    DISSIPATE: "dissipate",
    RELEASE: "release",
    RELEASE_IMPULSE: "release-impulse",
    SWING: "swing",
    ACCELERATION: "acceleration"
});

export const PLAYER_ROPE_FEEDBACK_KEY = Object.freeze({
    motionSample: (tick) => `motion:${tick}`,
    frameSample: (position, velocity, player) =>
        `frame:${position.x}:${position.y}:${velocity.x}:${velocity.y}:${player.rope?.isAttached}:${player.launcher?.shot?.elapsed ?? "-"}`,
    transition: (playerId, sequence) => `${playerId}:${sequence}`,
    transitionEffect: (transitionId, effect) => `${transitionId}:${effect}`,
    acceleration: (transitionId, sampleId) => `${transitionId}:${TRANSITION_EFFECT.ACCELERATION}:${sampleId}`,
    ropeFlight: (playerId) => `rope-flight:${playerId}`,
    ropeTension: (playerId) => `rope-tension:${playerId}`,
    playerMotion: (playerId) => `player-motion:${playerId}`
});

export const PLAYER_ROPE_FEEDBACK = Object.freeze({
    LAUNCH: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_LAUNCH, key: TRANSITION_EFFECT.LAUNCH }),
    FLIGHT: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_FLIGHT }),
    ATTACH: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_ATTACH, key: TRANSITION_EFFECT.ATTACH }),
    PULSE: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_PULSE, key: TRANSITION_EFFECT.PULSE }),
    DISSIPATE: Object.freeze({
        presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_DISSIPATE,
        key: TRANSITION_EFFECT.DISSIPATE
    }),
    RELEASE: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_RELEASE, key: TRANSITION_EFFECT.RELEASE }),
    RELEASE_IMPULSE: Object.freeze({
        presetId: CLIENT_FEEDBACK_PRESET_ID.PLAYER_IMPULSE,
        key: TRANSITION_EFFECT.RELEASE_IMPULSE
    }),
    SWING: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.PLAYER_IMPULSE, key: TRANSITION_EFFECT.SWING }),
    TENSION: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_TENSION }),
    TENSION_ELECTRIC: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_TENSION_ELECTRIC }),
    MOTION: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.PLAYER_MOTION }),
    IMPULSE: Object.freeze({ presetId: CLIENT_FEEDBACK_PRESET_ID.PLAYER_IMPULSE })
});

export class PlayerRopeRuleDefinition {
    constructor({ order, predicate, present }) {
        if (!Number.isSafeInteger(order) || typeof predicate !== "function" || typeof present !== "function") {
            throw new Error("PlayerRopeRuleDefinition requires order, predicate and present");
        }
        this.order = order;
        this.predicate = predicate;
        this.present = present;
        Object.freeze(this);
    }
}

const FEEDBACK_ORDER = Object.freeze({
    ROPE_LAUNCH: 10,
    ROPE_FLIGHT: 20,
    ROPE_ATTACH: 30,
    ROPE_DISSIPATE: 40,
    ROPE_RELEASE: 50,
    PLAYER_SWING: 60,
    ROPE_TENSION: 70,
    PLAYER_MOTION: 80,
    PLAYER_ACCELERATION: 90
});

function directionTo(from, to) {
    if (!from || !to) return null;
    return { x: to.x - from.x, y: to.y - from.y };
}

function finiteVector(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y) ? value : null;
}

function attachmentPosition(player) {
    const rope = player.rope ?? {};
    if (!finiteVector(player.position) || !finiteVector(rope.attachmentOffset)) return player.position ?? null;
    const angle = Number.isFinite(player.angle) ? player.angle : PLAYER_ROPE_FEEDBACK_CONFIG.ANGLE_FALLBACK;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return {
        x: player.position.x + rope.attachmentOffset.x * cosine - rope.attachmentOffset.y * sine,
        y: player.position.y + rope.attachmentOffset.x * sine + rope.attachmentOffset.y * cosine
    };
}

function hookTip(shot) {
    if (!finiteVector(shot?.origin) || !finiteVector(shot?.direction) || !Number.isFinite(shot.traveled)) return null;
    return {
        x: shot.origin.x + shot.direction.x * shot.traveled,
        y: shot.origin.y + shot.direction.y * shot.traveled
    };
}

function hasAugment(player, id) {
    return (player.selectedAugmentIds ?? player.augmentRuntimeState?.selectedAugmentIds ?? []).includes(id);
}

function transitionId(frame) {
    return PLAYER_ROPE_FEEDBACK_KEY.transition(frame.player.id, frame.current.transition);
}

function transitionEffectId(frame, definition) {
    return PLAYER_ROPE_FEEDBACK_KEY.transitionEffect(transitionId(frame), definition.key);
}

function anchor(frame) {
    return finiteVector(frame.player.rope?.anchor);
}

function attachment(frame) {
    return attachmentPosition(frame.player);
}

function detachSuppressed(frame, context) {
    const distance = Math.hypot(
        frame.player.position.x - frame.previous.position.x,
        frame.player.position.y - frame.previous.position.y
    );
    return (
        context.lifecycle.detachSuppressed(frame.player.id) ||
        frame.player.lifeState !== PLAYER_LIFE_STATE.ACTIVE ||
        frame.previous.lifeState !== PLAYER_LIFE_STATE.ACTIVE ||
        distance > PLAYER_ROPE_FEEDBACK_CONFIG.POSITION_JUMP_DISTANCE
    );
}

function appendTransitionParticle(frame, context, definition, properties) {
    context.appendParticle({
        presetId: definition.presetId,
        identity: transitionEffectId(frame, definition),
        ...properties
    });
}

function releaseTransition(frame) {
    return frame.previous.pointerKnown && frame.current.pointerKnown
        ? frame.previous.pointerDown && !frame.current.pointerDown
        : true;
}

function releasePredicate(frame, context) {
    return (
        frame.previous?.attached &&
        !frame.current.attached &&
        releaseTransition(frame) &&
        !detachSuppressed(frame, context)
    );
}

function speed(frame) {
    return Math.hypot(frame.velocity.x, frame.velocity.y);
}

const RELEASE_DENSITY_BY_AUGMENT = Object.freeze({
    true: PLAYER_ROPE_FEEDBACK_CONFIG.RELEASE_PROPULSION_DENSITY,
    false: PLAYER_ROPE_FEEDBACK_CONFIG.BASE_RELEASE_DENSITY
});

const TENSION_FEEDBACK_BY_AUGMENT = Object.freeze({
    true: PLAYER_ROPE_FEEDBACK.TENSION_ELECTRIC,
    false: PLAYER_ROPE_FEEDBACK.TENSION
});

const IMPULSE_THRESHOLDS_BY_ATTACHMENT = Object.freeze({
    true: Object.freeze({
        acceleration: PLAYER_ROPE_FEEDBACK_CONFIG.ATTACHED_ACCELERATION_THRESHOLD,
        speedGain: PLAYER_ROPE_FEEDBACK_CONFIG.ATTACHED_SPEED_GAIN_THRESHOLD
    }),
    false: Object.freeze({
        acceleration: PLAYER_ROPE_FEEDBACK_CONFIG.FREE_ACCELERATION_THRESHOLD,
        speedGain: PLAYER_ROPE_FEEDBACK_CONFIG.FREE_SPEED_GAIN_THRESHOLD
    })
});

function tensionDensity(frame) {
    const tension = Number.isFinite(frame.player.rope?.tension)
        ? frame.player.rope.tension
        : PLAYER_ROPE_FEEDBACK_CONFIG.POSITIVE_THRESHOLD;
    return Math.max(
        PLAYER_ROPE_FEEDBACK_CONFIG.POSITIVE_THRESHOLD,
        Math.min(
            PLAYER_ROPE_FEEDBACK_CONFIG.TENSION_MAX_DENSITY,
            (tension - PLAYER_ROPE_FEEDBACK_CONFIG.TENSION_START) / PLAYER_ROPE_FEEDBACK_CONFIG.TENSION_RANGE
        )
    );
}

function safeDt(dt) {
    return Math.max(
        PLAYER_ROPE_FEEDBACK_CONFIG.SAMPLE_DT_MIN,
        Math.min(
            PLAYER_ROPE_FEEDBACK_CONFIG.SAMPLE_DT_MAX,
            Number.isFinite(dt) ? dt : PLAYER_ROPE_FEEDBACK_CONFIG.SAMPLE_DT_DEFAULT
        )
    );
}

function acceleration(frame) {
    const sampleSeconds = safeDt(frame.dt);
    return {
        x: (frame.velocity.x - frame.previous.velocity.x) / sampleSeconds,
        y: (frame.velocity.y - frame.previous.velocity.y) / sampleSeconds
    };
}

export const ROPE_FEEDBACK_RULE = Object.freeze({
    LAUNCH: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.ROPE_LAUNCH,
        predicate: (frame) => Boolean(frame.previous && !frame.previous.shot && frame.shot),
        present: (frame, context) =>
            appendTransitionParticle(frame, context, PLAYER_ROPE_FEEDBACK.LAUNCH, {
                position: frame.shot.origin,
                direction: frame.shot.direction
            })
    }),
    FLIGHT: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.ROPE_FLIGHT,
        predicate: (frame) => Boolean(frame.previous && frame.shot && hookTip(frame.shot)),
        present: (frame, context) =>
            context.emit(
                PLAYER_ROPE_FEEDBACK_KEY.ropeFlight(frame.player.id),
                PLAYER_ROPE_FEEDBACK.FLIGHT.presetId,
                hookTip(frame.shot),
                frame.shot.direction,
                { density: PLAYER_ROPE_FEEDBACK_CONFIG.FLIGHT_DENSITY }
            )
    }),
    ATTACH: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.ROPE_ATTACH,
        predicate: (frame) =>
            Boolean(
                frame.previous?.shot &&
                !frame.shot &&
                !frame.previous.attached &&
                frame.current.attached &&
                anchor(frame)
            ),
        present: (frame, context) => {
            const ropeAnchor = anchor(frame);
            const playerAttachment = attachment(frame);
            appendTransitionParticle(frame, context, PLAYER_ROPE_FEEDBACK.ATTACH, {
                position: ropeAnchor,
                direction: directionTo(ropeAnchor, playerAttachment)
            });
            appendTransitionParticle(frame, context, PLAYER_ROPE_FEEDBACK.PULSE, {
                position: ropeAnchor,
                targetPosition: playerAttachment,
                direction: directionTo(ropeAnchor, playerAttachment)
            });
        }
    }),
    DISSIPATE: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.ROPE_DISSIPATE,
        predicate: (frame, context) =>
            Boolean(
                frame.previous?.shot &&
                !frame.shot &&
                !frame.current.attached &&
                !detachSuppressed(frame, context) &&
                hookTip(frame.previous.shot)
            ),
        present: (frame, context) =>
            appendTransitionParticle(frame, context, PLAYER_ROPE_FEEDBACK.DISSIPATE, {
                position: hookTip(frame.previous.shot),
                direction: frame.previous.shot.direction
            })
    }),
    RELEASE: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.ROPE_RELEASE,
        predicate: releasePredicate,
        present: (frame, context) => {
            const density =
                RELEASE_DENSITY_BY_AUGMENT[hasAugment(frame.player, PLAYER_ROPE_AUGMENT_ID.RELEASE_PROPULSION)];
            appendTransitionParticle(frame, context, PLAYER_ROPE_FEEDBACK.RELEASE, {
                position: frame.player.position,
                direction: frame.velocity,
                density
            });
            appendTransitionParticle(frame, context, PLAYER_ROPE_FEEDBACK.RELEASE_IMPULSE, {
                position: frame.player.position,
                direction: frame.velocity,
                density
            });
        }
    }),
    TENSION: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.ROPE_TENSION,
        predicate: (frame) =>
            Boolean(
                frame.previous &&
                frame.current.attached &&
                anchor(frame) &&
                attachment(frame) &&
                tensionDensity(frame) > PLAYER_ROPE_FEEDBACK_CONFIG.POSITIVE_THRESHOLD
            ),
        present: (frame, context) => {
            const ropeAnchor = anchor(frame);
            const playerAttachment = attachment(frame);
            context.emit(
                PLAYER_ROPE_FEEDBACK_KEY.ropeTension(frame.player.id),
                TENSION_FEEDBACK_BY_AUGMENT[hasAugment(frame.player, PLAYER_ROPE_AUGMENT_ID.ELECTRIFIED_ROPE)].presetId,
                ropeAnchor,
                directionTo(ropeAnchor, playerAttachment),
                { targetPosition: playerAttachment, density: tensionDensity(frame) }
            );
        }
    })
});

export const PLAYER_FEEDBACK_RULE = Object.freeze({
    SWING: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.PLAYER_SWING,
        predicate: (frame) => Boolean(frame.previous && !frame.previous.swingUsed && frame.current.swingUsed),
        present: (frame, context) =>
            appendTransitionParticle(frame, context, PLAYER_ROPE_FEEDBACK.SWING, {
                position: frame.player.position,
                direction: frame.swing?.direction ?? frame.velocity
            })
    }),
    MOTION: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.PLAYER_MOTION,
        predicate: (frame) =>
            Boolean(frame.previous && speed(frame) > PLAYER_ROPE_FEEDBACK_CONFIG.MOTION_SPEED_THRESHOLD),
        present: (frame, context) =>
            context.emit(
                PLAYER_ROPE_FEEDBACK_KEY.playerMotion(frame.player.id),
                PLAYER_ROPE_FEEDBACK.MOTION.presetId,
                frame.player.position,
                { x: -frame.velocity.x, y: -frame.velocity.y },
                {
                    density: Math.min(
                        PLAYER_ROPE_FEEDBACK_CONFIG.MOTION_MAX_DENSITY,
                        PLAYER_ROPE_FEEDBACK_CONFIG.MOTION_BASE_DENSITY +
                            (speed(frame) - PLAYER_ROPE_FEEDBACK_CONFIG.MOTION_SPEED_THRESHOLD) /
                                PLAYER_ROPE_FEEDBACK_CONFIG.MOTION_DENSITY_RANGE
                    )
                }
            )
    }),
    ACCELERATION: new PlayerRopeRuleDefinition({
        order: FEEDBACK_ORDER.PLAYER_ACCELERATION,
        predicate: (frame) => {
            if (!frame.previous || frame.previous.sampleId === frame.current.sampleId) return false;
            const impulse = acceleration(frame);
            const magnitude = Math.min(PLAYER_ROPE_FEEDBACK_CONFIG.ACCELERATION_MAX, Math.hypot(impulse.x, impulse.y));
            const gain = speed(frame) - Math.hypot(frame.previous.velocity.x, frame.previous.velocity.y);
            const attached = frame.previous.attached && frame.current.attached;
            const thresholds = IMPULSE_THRESHOLDS_BY_ATTACHMENT[attached];
            return magnitude > thresholds.acceleration && gain > thresholds.speedGain && !frame.current.swingUsed;
        },
        present: (frame, context) =>
            context.appendParticle({
                presetId: PLAYER_ROPE_FEEDBACK.IMPULSE.presetId,
                position: frame.player.position,
                direction: acceleration(frame),
                identity: PLAYER_ROPE_FEEDBACK_KEY.acceleration(transitionId(frame), frame.current.sampleId)
            })
    })
});
