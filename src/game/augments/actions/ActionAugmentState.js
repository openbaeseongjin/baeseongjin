import { Vector2 } from "../../../game-kit/index.js";
import {
    actionAugmentById,
    ACTION_AUGMENT_CATALOG,
    BASE_ACTION_IDS,
    SIGNATURE_ACTION_IDS,
    UNIVERSAL_MODIFIER_IDS
} from "./ActionAugmentCatalog.js";

const ACTION_STATE_CONFIG = Object.freeze({
    baseCharges: 1,
    ropeLinkWindowSeconds: 1,
    fastReuseCooldownMultiplier: 0.6,
    ropeLinkCooldownMultiplier: 0.5,
    postActionShieldRatio: 0.15,
    postActionShieldSeconds: 2
});

function finiteNonNegative(value, label) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a non-negative finite number`);
    return value;
}

function freezePoint(value) {
    return Object.freeze({ x: value.x, y: value.y });
}

function normalizeDirection(direction, label = "direction") {
    const x = direction?.x ?? 0;
    const y = direction?.y ?? 0;
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(`${label} must use finite x/y`);
    const vector = new Vector2(x, y);
    if (vector.length() <= 0.000001) throw new Error(`${label} must be non-zero`);
    return vector.normalize();
}

function loadActionCard(id, category) {
    const card = actionAugmentById(id);
    if (!card) throw new Error(`unknown action augment: ${id}`);
    if (card.category !== category) throw new Error(`${id} must be a ${category}`);
    return card;
}

function freezeLoadout({ baseActionId, signatureId = null, modifierIds = [] }) {
    if (!BASE_ACTION_IDS.includes(baseActionId)) throw new Error(`unknown base action: ${baseActionId}`);
    if (signatureId !== null) {
        const signature = loadActionCard(signatureId, "signature");
        if (!signature.compatibleBaseActionIds.includes(baseActionId)) {
            throw new Error(`${signatureId} is not compatible with ${baseActionId}`);
        }
    }
    const uniqueModifierIds = [...new Set(modifierIds)];
    if (uniqueModifierIds.length !== modifierIds.length) {
        throw new Error("modifierIds must not contain duplicates");
    }
    for (const modifierId of uniqueModifierIds) loadActionCard(modifierId, "universal-modifier");
    return Object.freeze({
        baseActionId,
        signatureId,
        modifierIds: Object.freeze(uniqueModifierIds)
    });
}

function freezeEvent(event) {
    return Object.freeze(event);
}

function effectDefinition(loadout) {
    return loadActionCard(loadout.baseActionId, "base-action").effect;
}

function signatureDefinition(loadout) {
    return loadout.signatureId ? loadActionCard(loadout.signatureId, "signature").effect : null;
}

function cloneActiveAction(activeAction) {
    if (!activeAction) return null;
    return {
        ...activeAction,
        direction: activeAction.direction ? { ...activeAction.direction } : null
    };
}

function clonePendingEffects(pendingEffects) {
    return pendingEffects.map((effect) => ({
        ...effect,
        start: effect.start ? Object.freeze({ ...effect.start }) : null,
        end: effect.end ? Object.freeze({ ...effect.end }) : null
    }));
}

export function createActionLoadout(options) {
    return freezeLoadout(options);
}

export function actionCatalogSnapshot() {
    return ACTION_AUGMENT_CATALOG;
}

export class ActionAugmentState {
    constructor({ baseActionId, signatureId = null, modifierIds = [], maxHealth = 100 } = {}) {
        this.loadout = freezeLoadout({ baseActionId, signatureId, modifierIds });
        finiteNonNegative(maxHealth, "maxHealth");
        if (maxHealth === 0) throw new Error("maxHealth must be positive");
        this.maxHealth = maxHealth;
        this.actionSequence = 0;
        this.chargesRemaining = this.maxCharges();
        this.rechargeRemaining = 0;
        this.rechargeDuration = 0;
        this.rechargeQueue = [];
        this.ropeLinkWindowRemaining = 0;
        this.shieldValue = 0;
        this.shieldRemaining = 0;
        this.activeAction = null;
        this.pendingEffects = [];
    }

    maxCharges() {
        return ACTION_STATE_CONFIG.baseCharges + (this.hasModifier("extra-charge") ? 1 : 0);
    }

    hasModifier(id) {
        return this.loadout.modifierIds.includes(id);
    }

    hasSignature(id) {
        return this.loadout.signatureId === id;
    }

    activeBaseAction() {
        return loadActionCard(this.loadout.baseActionId, "base-action");
    }

    movementModifiers() {
        if (this.activeAction?.baseActionId !== "slow-fall") {
            return Object.freeze({
                gravityScale: 1,
                preservesHorizontalControl: true,
                preservesRopeControl: true
            });
        }
        return Object.freeze({
            gravityScale: effectDefinition(this.loadout).gravityScale,
            preservesHorizontalControl: true,
            preservesRopeControl: true
        });
    }

    cooldownMultiplier({ consumeRopeLinkWindow = false } = {}) {
        let multiplier = 1;
        if (this.hasModifier("fast-reuse")) multiplier *= ACTION_STATE_CONFIG.fastReuseCooldownMultiplier;
        if (this.hasModifier("rope-link") && this.ropeLinkWindowRemaining > 0) {
            multiplier *= ACTION_STATE_CONFIG.ropeLinkCooldownMultiplier;
            if (consumeRopeLinkWindow) this.ropeLinkWindowRemaining = 0;
        }
        return multiplier;
    }

    onRopeReleased() {
        if (!this.hasModifier("rope-link")) return false;
        this.ropeLinkWindowRemaining = ACTION_STATE_CONFIG.ropeLinkWindowSeconds;
        return true;
    }

    setExplosiveTrailPath(activationId, start, end) {
        const effect = this.pendingEffects.find(
            (candidate) => candidate.effectType === "explosive-trail" && candidate.activationId === activationId
        );
        if (!effect) return false;
        effect.start = freezePoint(start);
        effect.end = freezePoint(end);
        return true;
    }

    beginAction({ direction = { x: 1, y: 0 }, airborne = false } = {}) {
        if (this.activeAction) return Object.freeze({ accepted: false, reason: "action-active" });
        if (this.chargesRemaining <= 0) return Object.freeze({ accepted: false, reason: "charge-depleted" });
        if (this.loadout.baseActionId === "slow-fall" && !airborne) {
            return Object.freeze({ accepted: false, reason: "not-airborne" });
        }
        const baseAction = this.activeBaseAction();
        const cooldownSeconds = baseAction.cooldownSeconds * this.cooldownMultiplier({ consumeRopeLinkWindow: true });
        const activationId = `action:${this.loadout.baseActionId}:${this.actionSequence}`;
        const activation = this.#createActivation({
            activationId,
            baseAction,
            direction: normalizeDirection(direction)
        });
        this.actionSequence += 1;
        this.chargesRemaining -= 1;
        if (this.loadout.baseActionId !== "slow-fall") this.#enqueueRecharge(cooldownSeconds);
        const events = [];
        if (activation.immediate) {
            events.push(...this.#applyActionEnd(activation, "resolved"));
        } else {
            this.activeAction = {
                activationId,
                baseActionId: this.loadout.baseActionId,
                signatureId: this.loadout.signatureId,
                durationRemaining: activation.durationSeconds,
                totalDuration: activation.durationSeconds,
                direction: activation.direction ?? null,
                guardConsumed: false,
                cooldownSeconds
            };
        }
        return Object.freeze({
            accepted: true,
            activation: Object.freeze(activation),
            cooldownSeconds,
            chargesRemaining: this.chargesRemaining,
            events: Object.freeze(events)
        });
    }

    cancelSlowFall(reason = "released") {
        if (this.activeAction?.baseActionId !== "slow-fall") return Object.freeze([]);
        const activation = this.#createActivation({
            activationId: this.activeAction.activationId,
            baseAction: this.activeBaseAction(),
            direction: normalizeDirection(this.activeAction.direction ?? { x: 1, y: 0 })
        });
        activation.cooldownSeconds = this.activeAction.cooldownSeconds;
        return Object.freeze(this.#applyActionEnd(activation, reason));
    }

    absorbIncomingDamage({ amount, type = "combat-hp", sourceKind = "contact", attackerId = null } = {}) {
        finiteNonNegative(amount, "damage amount");
        let remainingDamage = amount;
        const events = [];
        let blockedByGuard = false;
        if (
            remainingDamage > 0 &&
            type === "combat-hp" &&
            this.activeAction?.baseActionId === "instant-guard" &&
            this.activeAction.guardConsumed === false &&
            this.activeAction.durationRemaining > 0
        ) {
            this.activeAction.guardConsumed = true;
            blockedByGuard = true;
            remainingDamage = 0;
            if (this.hasSignature("damage-reflect")) {
                events.push(
                    freezeEvent({
                        eventType: "damage-reflected",
                        attackerId,
                        reflectedDamage: amount,
                        sourceKind,
                        causalLineRequired: sourceKind === "projectile"
                    })
                );
            }
        }
        let absorbedByShield = 0;
        if (remainingDamage > 0 && type === "combat-hp" && this.shieldRemaining > 0 && this.shieldValue > 0) {
            absorbedByShield = Math.min(this.shieldValue, remainingDamage);
            this.shieldValue -= absorbedByShield;
            remainingDamage -= absorbedByShield;
            if (this.shieldValue <= 0) {
                this.shieldValue = 0;
                this.shieldRemaining = 0;
            }
        }
        return Object.freeze({
            appliedDamage: remainingDamage,
            absorbedByShield,
            blockedByGuard,
            events: Object.freeze(events)
        });
    }

    advance(dt, { isGrounded = false, cancelSlowFall = false } = {}) {
        finiteNonNegative(dt, "dt");
        const events = [];
        this.ropeLinkWindowRemaining = Math.max(0, this.ropeLinkWindowRemaining - dt);
        if (this.shieldRemaining > 0) {
            this.shieldRemaining = Math.max(0, this.shieldRemaining - dt);
            if (this.shieldRemaining === 0) this.shieldValue = 0;
        }
        this.#advanceRecharge(dt);
        if (cancelSlowFall) events.push(...this.cancelSlowFall("released"));
        else if (this.activeAction?.baseActionId === "slow-fall" && isGrounded) {
            events.push(...this.cancelSlowFall("landed"));
        } else if (this.activeAction) {
            this.activeAction.durationRemaining = Math.max(0, this.activeAction.durationRemaining - dt);
            if (this.activeAction.durationRemaining === 0) {
                const activation = this.#createActivation({
                    activationId: this.activeAction.activationId,
                    baseAction: this.activeBaseAction(),
                    direction: normalizeDirection(this.activeAction.direction ?? { x: 1, y: 0 })
                });
                activation.cooldownSeconds = this.activeAction.cooldownSeconds;
                events.push(...this.#applyActionEnd(activation, "completed"));
            }
        }
        for (let index = this.pendingEffects.length - 1; index >= 0; index -= 1) {
            const effect = this.pendingEffects[index];
            effect.remainingSeconds = Math.max(0, effect.remainingSeconds - dt);
            if (effect.remainingSeconds === 0) {
                this.pendingEffects.splice(index, 1);
                if (effect.effectType === "explosive-trail") {
                    events.push(
                        freezeEvent({
                            eventType: "explosive-trail-detonated",
                            activationId: effect.activationId,
                            width: effect.width,
                            damage: effect.damage,
                            start: effect.start ? freezePoint(effect.start) : null,
                            end: effect.end ? freezePoint(effect.end) : null
                        })
                    );
                }
            }
        }
        return Object.freeze(events);
    }

    snapshot() {
        return Object.freeze({
            loadout: {
                baseActionId: this.loadout.baseActionId,
                signatureId: this.loadout.signatureId,
                modifierIds: [...this.loadout.modifierIds]
            },
            maxHealth: this.maxHealth,
            actionSequence: this.actionSequence,
            chargesRemaining: this.chargesRemaining,
            rechargeRemaining: this.rechargeRemaining,
            rechargeDuration: this.rechargeDuration,
            rechargeQueue: Object.freeze([...this.rechargeQueue]),
            ropeLinkWindowRemaining: this.ropeLinkWindowRemaining,
            shieldValue: this.shieldValue,
            shieldRemaining: this.shieldRemaining,
            activeAction: this.activeAction ? Object.freeze(cloneActiveAction(this.activeAction)) : null,
            pendingEffects: Object.freeze(
                clonePendingEffects(this.pendingEffects).map((effect) => Object.freeze(effect))
            )
        });
    }

    restore(snapshot) {
        this.loadout = freezeLoadout(snapshot?.loadout ?? this.loadout);
        finiteNonNegative(snapshot?.maxHealth ?? this.maxHealth, "maxHealth");
        this.maxHealth = snapshot.maxHealth ?? this.maxHealth;
        finiteNonNegative(snapshot?.actionSequence ?? 0, "actionSequence");
        finiteNonNegative(snapshot?.chargesRemaining ?? this.maxCharges(), "chargesRemaining");
        finiteNonNegative(snapshot?.rechargeRemaining ?? 0, "rechargeRemaining");
        finiteNonNegative(snapshot?.rechargeDuration ?? snapshot?.rechargeRemaining ?? 0, "rechargeDuration");
        finiteNonNegative(snapshot?.ropeLinkWindowRemaining ?? 0, "ropeLinkWindowRemaining");
        finiteNonNegative(snapshot?.shieldValue ?? 0, "shieldValue");
        finiteNonNegative(snapshot?.shieldRemaining ?? 0, "shieldRemaining");
        const rechargeQueue = [...(snapshot?.rechargeQueue ?? [])].map((value, index) =>
            finiteNonNegative(value, `rechargeQueue[${index}]`)
        );
        const activeAction = snapshot?.activeAction ? cloneActiveAction(snapshot.activeAction) : null;
        if (activeAction) {
            finiteNonNegative(activeAction.durationRemaining, "activeAction.durationRemaining");
            finiteNonNegative(activeAction.totalDuration, "activeAction.totalDuration");
        }
        const pendingEffects = [...(snapshot?.pendingEffects ?? [])].map((effect, index) => {
            finiteNonNegative(effect.remainingSeconds, `pendingEffects[${index}].remainingSeconds`);
            return {
                ...effect
            };
        });
        this.actionSequence = snapshot?.actionSequence ?? 0;
        this.chargesRemaining = Math.min(this.maxCharges(), snapshot?.chargesRemaining ?? this.maxCharges());
        this.rechargeRemaining = snapshot?.rechargeRemaining ?? 0;
        this.rechargeDuration = snapshot?.rechargeDuration ?? this.rechargeRemaining;
        this.rechargeQueue = rechargeQueue;
        this.ropeLinkWindowRemaining = snapshot?.ropeLinkWindowRemaining ?? 0;
        this.shieldValue = snapshot?.shieldValue ?? 0;
        this.shieldRemaining = snapshot?.shieldRemaining ?? 0;
        this.activeAction = activeAction;
        this.pendingEffects = pendingEffects;
        return this.snapshot();
    }

    #createActivation({ activationId, baseAction, direction }) {
        const signature = this.loadout.signatureId ? loadActionCard(this.loadout.signatureId, "signature") : null;
        const base = baseAction.effect;
        const shared = {
            activationId,
            baseActionId: baseAction.id,
            signatureId: signature?.id ?? null,
            modifierIds: [...this.loadout.modifierIds],
            direction: freezePoint(direction)
        };
        if (baseAction.id === "direction-dash") {
            return {
                ...shared,
                immediate: true,
                distance: base.distance,
                trailEffect:
                    signature?.id === "explosive-trail"
                        ? Object.freeze({
                              width: signature.effect.width,
                              delaySeconds: signature.effect.delaySeconds,
                              damage: signature.effect.damage
                          })
                        : null
            };
        }
        if (baseAction.id === "dash-strike") {
            return {
                ...shared,
                immediate: false,
                durationSeconds: base.hitWindowSeconds,
                impulse: base.impulse,
                damage: base.damage,
                knockbackDistance: base.knockbackDistance,
                reboundEffect: signature?.id === "collision-rebound" ? Object.freeze({ ...signature.effect }) : null
            };
        }
        if (baseAction.id === "instant-guard") {
            return {
                ...shared,
                immediate: false,
                durationSeconds: base.durationSeconds,
                reflectEffect: signature?.id === "damage-reflect" ? Object.freeze({ ...signature.effect }) : null
            };
        }
        if (baseAction.id === "push-away") {
            return {
                ...shared,
                immediate: true,
                radius: base.radius,
                damage: base.damage,
                knockbackDistance: base.knockbackDistance,
                bossKnockback: base.bossKnockback,
                wallImpactEffect: signature?.id === "wall-impact" ? Object.freeze({ ...signature.effect }) : null
            };
        }
        if (baseAction.id === "straight-shot") {
            return {
                ...shared,
                immediate: true,
                speed: base.speed,
                range: base.range,
                lifetimeSeconds: base.lifetimeSeconds,
                damage: base.damage,
                knockbackDistance: base.knockbackDistance,
                pierceEffect: signature?.id === "piercing-shot" ? Object.freeze({ ...signature.effect }) : null
            };
        }
        return {
            ...shared,
            immediate: false,
            durationSeconds: base.durationSeconds,
            gravityScale: base.gravityScale,
            endWaveEffect: signature?.id === "end-wave" ? Object.freeze({ ...signature.effect }) : null
        };
    }

    #enqueueRecharge(cooldownSeconds) {
        finiteNonNegative(cooldownSeconds, "cooldownSeconds");
        this.rechargeQueue.push(cooldownSeconds);
        if (this.rechargeRemaining === 0) {
            this.rechargeRemaining = this.rechargeQueue.shift() ?? 0;
            this.rechargeDuration = this.rechargeRemaining;
        }
    }

    #advanceRecharge(dt) {
        let remainingDt = dt;
        while (remainingDt > 0 && this.rechargeRemaining > 0) {
            const consumed = Math.min(remainingDt, this.rechargeRemaining);
            this.rechargeRemaining -= consumed;
            remainingDt -= consumed;
            if (this.rechargeRemaining > 0) break;
            this.chargesRemaining = Math.min(this.maxCharges(), this.chargesRemaining + 1);
            if (this.chargesRemaining < this.maxCharges() && this.rechargeQueue.length > 0) {
                this.rechargeRemaining = this.rechargeQueue.shift();
                this.rechargeDuration = this.rechargeRemaining;
            } else {
                this.rechargeRemaining = 0;
                this.rechargeDuration = 0;
                if (this.chargesRemaining === this.maxCharges()) this.rechargeQueue.length = 0;
            }
        }
    }

    #applyActionEnd(activation, reason) {
        const events = [freezeEvent({ eventType: "action-ended", activationId: activation.activationId, reason })];
        this.activeAction = null;
        if (activation.baseActionId === "slow-fall") this.#enqueueRecharge(activation.cooldownSeconds);
        if (activation.baseActionId === "direction-dash" && activation.trailEffect) {
            this.pendingEffects.push({
                effectType: "explosive-trail",
                activationId: activation.activationId,
                remainingSeconds: activation.trailEffect.delaySeconds,
                width: activation.trailEffect.width,
                damage: activation.trailEffect.damage,
                start: null,
                end: null
            });
        }
        if (activation.baseActionId === "slow-fall" && activation.endWaveEffect) {
            events.push(
                freezeEvent({
                    eventType: "slow-fall-end-wave",
                    activationId: activation.activationId,
                    radius: activation.endWaveEffect.radius,
                    damage: activation.endWaveEffect.damage,
                    reason
                })
            );
        }
        if (this.hasModifier("post-action-shield")) {
            this.shieldValue = this.maxHealth * ACTION_STATE_CONFIG.postActionShieldRatio;
            this.shieldRemaining = ACTION_STATE_CONFIG.postActionShieldSeconds;
            events.push(
                freezeEvent({
                    eventType: "post-action-shield-applied",
                    shieldValue: this.shieldValue,
                    durationSeconds: this.shieldRemaining
                })
            );
        }
        return events;
    }
}

function reflectVector(incomingVelocity, collisionNormal) {
    const velocity = new Vector2(incomingVelocity.x, incomingVelocity.y);
    const normal = normalizeDirection(collisionNormal, "collisionNormal");
    const dot = velocity.dot(normal);
    return velocity.subtract(normal.scale(2 * dot));
}

export function createActionResolutionTracker(activation) {
    const enemyReboundIds = new Set();
    const wallImpactTargetIds = new Set();
    const piercedTargetIds = new Set();
    const trailTargetIds = new Set();

    return Object.freeze({
        observeDashStrikeRebound({ targetId = null, targetKind = "wall", collisionNormal, incomingVelocity }) {
            if (activation.baseActionId !== "dash-strike" || activation.signatureId !== "collision-rebound") {
                return Object.freeze({ accepted: false, reason: "rebound-inactive" });
            }
            if (targetKind === "enemy") {
                if (!targetId) throw new Error("enemy rebounds require a targetId");
                if (enemyReboundIds.has(targetId)) return Object.freeze({ accepted: false, reason: "duplicate-enemy" });
                enemyReboundIds.add(targetId);
            }
            const reflectedVelocity = reflectVector(incomingVelocity, collisionNormal);
            return Object.freeze({
                accepted: true,
                reflectedVelocity: freezePoint(reflectedVelocity),
                preservesSpeed: true
            });
        },
        observeWallImpact({ targetId }) {
            if (activation.baseActionId !== "push-away" || activation.signatureId !== "wall-impact") {
                return Object.freeze({ accepted: false, reason: "wall-impact-inactive" });
            }
            if (!targetId) throw new Error("wall impact requires a targetId");
            if (wallImpactTargetIds.has(targetId))
                return Object.freeze({ accepted: false, reason: "duplicate-target" });
            wallImpactTargetIds.add(targetId);
            return Object.freeze({
                accepted: true,
                damage: 80
            });
        },
        observeProjectileHit({ targetId }) {
            if (activation.baseActionId !== "straight-shot" || activation.signatureId !== "piercing-shot") {
                return Object.freeze({ accepted: false, reason: "pierce-inactive" });
            }
            if (!targetId) throw new Error("pierce hit requires a targetId");
            if (piercedTargetIds.has(targetId)) return Object.freeze({ accepted: false, reason: "duplicate-target" });
            piercedTargetIds.add(targetId);
            return Object.freeze({
                accepted: true,
                preservesDamage: true,
                preservesSpeed: true
            });
        },
        observeExplosiveTrailHit({ targetId }) {
            if (activation.baseActionId !== "direction-dash" || activation.signatureId !== "explosive-trail") {
                return Object.freeze({ accepted: false, reason: "trail-inactive" });
            }
            if (!targetId) throw new Error("trail hit requires a targetId");
            if (trailTargetIds.has(targetId)) return Object.freeze({ accepted: false, reason: "duplicate-target" });
            trailTargetIds.add(targetId);
            return Object.freeze({
                accepted: true,
                damage: 80
            });
        }
    });
}

export { ACTION_STATE_CONFIG, SIGNATURE_ACTION_IDS, UNIVERSAL_MODIFIER_IDS };
