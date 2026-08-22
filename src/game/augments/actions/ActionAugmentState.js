import { Vector2 } from "../../../game-kit/index.js";
import {
    actionAugmentById,
    ACTION_AUGMENT_CATALOG,
    BASE_ACTION_IDS,
    SIGNATURE_ACTION_IDS,
    UNIVERSAL_MODIFIER_IDS
} from "./ActionAugmentCatalog.js";
import {
    ACTION_AUGMENT_CATEGORY,
    ACTION_DAMAGE_TYPE,
    ACTION_END_REASON,
    ACTION_EVENT_TYPE,
    ACTION_KEY,
    ACTION_MODIFIER_ID,
    ACTION_REJECTION_REASON,
    ACTION_SOURCE_KIND,
    ACTION_STATE_CONFIG
} from "./ActionAugmentDefinition.js";
import { actionDefinitionById } from "./definitions/ActionDefinitionCatalog.js";
import { actionSignatureById } from "./signatures/ActionSignatureCatalog.js";
import { ActionPendingEffectState } from "./state/ActionPendingEffectState.js";
import { ActionShieldState } from "./state/ActionShieldState.js";

function finiteNonNegative(value, label) {
    if (!Number.isFinite(value) || value < ACTION_STATE_CONFIG.ZERO) {
        throw new Error(`${label} must be a non-negative finite number`);
    }
    return value;
}

function normalizeDirection(direction, label = "direction") {
    const x = direction?.x ?? ACTION_STATE_CONFIG.ZERO;
    const y = direction?.y ?? ACTION_STATE_CONFIG.ZERO;
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(`${label} must use finite x/y`);
    const vector = new Vector2(x, y);
    if (vector.length() <= ACTION_STATE_CONFIG.DIRECTION_EPSILON) throw new Error(`${label} must be non-zero`);
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
        const signature = loadActionCard(signatureId, ACTION_AUGMENT_CATEGORY.SIGNATURE);
        if (!signature.compatibleBaseActionIds.includes(baseActionId)) {
            throw new Error(`${signatureId} is not compatible with ${baseActionId}`);
        }
    }
    const uniqueModifierIds = [];
    const modifierIdsById = Object.create(null);
    for (const modifierId of modifierIds) {
        if (modifierIdsById[modifierId]) throw new Error("modifierIds must not contain duplicates");
        modifierIdsById[modifierId] = true;
        uniqueModifierIds.push(modifierId);
        loadActionCard(modifierId, ACTION_AUGMENT_CATEGORY.UNIVERSAL_MODIFIER);
    }
    return Object.freeze({
        baseActionId,
        signatureId,
        modifierIds: Object.freeze(uniqueModifierIds)
    });
}

function cloneActiveAction(activeAction) {
    if (!activeAction) return null;
    return {
        ...activeAction,
        direction: activeAction.direction ? { ...activeAction.direction } : null
    };
}

export function createActionLoadout(options) {
    return freezeLoadout(options);
}

export function actionCatalogSnapshot() {
    return ACTION_AUGMENT_CATALOG;
}

export class ActionAugmentState {
    constructor({
        baseActionId,
        signatureId = null,
        modifierIds = [],
        maxHealth = ACTION_STATE_CONFIG.DEFAULT_MAX_HEALTH
    } = {}) {
        this.loadout = freezeLoadout({ baseActionId, signatureId, modifierIds });
        finiteNonNegative(maxHealth, "maxHealth");
        if (maxHealth === ACTION_STATE_CONFIG.ZERO) throw new Error("maxHealth must be positive");
        this.maxHealth = maxHealth;
        this.actionSequence = ACTION_STATE_CONFIG.ZERO;
        this.chargesRemaining = this.maxCharges();
        this.rechargeRemaining = ACTION_STATE_CONFIG.ZERO;
        this.rechargeDuration = ACTION_STATE_CONFIG.ZERO;
        this.rechargeQueue = [];
        this.ropeLinkWindowRemaining = ACTION_STATE_CONFIG.ZERO;
        this.shieldState = new ActionShieldState(maxHealth);
        this.activeAction = null;
        this.pendingEffectState = new ActionPendingEffectState();
    }

    maxCharges() {
        return (
            ACTION_STATE_CONFIG.BASE_CHARGES +
            (this.hasModifier(ACTION_MODIFIER_ID.EXTRA_CHARGE)
                ? ACTION_STATE_CONFIG.EXTRA_CHARGES
                : ACTION_STATE_CONFIG.ZERO)
        );
    }

    hasModifier(id) {
        return this.loadout.modifierIds.includes(id);
    }

    hasSignature(id) {
        return this.loadout.signatureId === id;
    }

    activeBaseAction() {
        return loadActionCard(this.loadout.baseActionId, ACTION_AUGMENT_CATEGORY.BASE_ACTION);
    }

    activeDefinition() {
        return actionDefinitionById(this.loadout.baseActionId);
    }

    activeSignatureDefinition() {
        return actionSignatureById(this.loadout.signatureId);
    }

    movementModifiers() {
        return this.activeDefinition().movementModifiers({
            activeAction: this.activeAction,
            effect: this.activeBaseAction().effect
        });
    }

    commandModifiers(actionDown) {
        return this.activeDefinition().commandModifiers({
            activeAction: this.activeAction,
            actionDown,
            effect: this.activeBaseAction().effect
        });
    }

    cooldownMultiplier({ consumeRopeLinkWindow = false } = {}) {
        let multiplier = ACTION_STATE_CONFIG.UNIT;
        if (this.hasModifier(ACTION_MODIFIER_ID.FAST_REUSE)) {
            multiplier *= ACTION_STATE_CONFIG.FAST_REUSE_COOLDOWN_MULTIPLIER;
        }
        if (this.hasModifier(ACTION_MODIFIER_ID.ROPE_LINK) && this.ropeLinkWindowRemaining > ACTION_STATE_CONFIG.ZERO) {
            multiplier *= ACTION_STATE_CONFIG.ROPE_LINK_COOLDOWN_MULTIPLIER;
            if (consumeRopeLinkWindow) this.ropeLinkWindowRemaining = ACTION_STATE_CONFIG.ZERO;
        }
        return multiplier;
    }

    onRopeReleased() {
        if (!this.hasModifier(ACTION_MODIFIER_ID.ROPE_LINK)) return false;
        this.ropeLinkWindowRemaining = ACTION_STATE_CONFIG.ROPE_LINK_WINDOW_SECONDS;
        return true;
    }

    setExplosiveTrailPath(activationId, start, end) {
        return this.pendingEffectState.setPath(activationId, start, end);
    }

    beginAction({ direction = { x: ACTION_STATE_CONFIG.UNIT, y: ACTION_STATE_CONFIG.ZERO }, airborne = false } = {}) {
        if (this.activeAction) {
            return Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.ACTION_ACTIVE });
        }
        if (this.chargesRemaining <= ACTION_STATE_CONFIG.ZERO) {
            return Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.CHARGE_DEPLETED });
        }
        const definition = this.activeDefinition();
        const canBegin = definition.canBegin({ airborne });
        if (!canBegin.accepted) return canBegin;
        const baseAction = this.activeBaseAction();
        const cooldownSeconds = baseAction.cooldownSeconds * this.cooldownMultiplier({ consumeRopeLinkWindow: true });
        const activationId = ACTION_KEY.activation(this.loadout.baseActionId, this.actionSequence);
        const activation = definition.createActivation({
            shared: {
                activationId,
                baseActionId: baseAction.id,
                signatureId: this.loadout.signatureId,
                modifierIds: [...this.loadout.modifierIds],
                direction: Object.freeze({ ...normalizeDirection(direction) })
            },
            effect: baseAction.effect,
            signature: this.activeSignatureDefinition()
        });
        this.actionSequence += ACTION_STATE_CONFIG.UNIT;
        this.chargesRemaining -= ACTION_STATE_CONFIG.UNIT;
        if (definition.rechargeOnBegin) this.#enqueueRecharge(cooldownSeconds);
        const events = [];
        if (activation.immediate) {
            events.push(...this.#applyActionEnd(activation, ACTION_END_REASON.RESOLVED));
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

    executeActivation(activation, context) {
        return actionDefinitionById(activation.baseActionId).execute(activation, context);
    }

    advanceActiveRuntime(activeAction, context) {
        const definition = actionDefinitionById(activeAction?.baseActionId);
        if (!definition?.advanceRuntime) return;
        definition.advanceRuntime(activeAction, {
            ...context,
            effect: this.activeBaseAction().effect,
            signature: actionSignatureById(activeAction.signatureId)
        });
    }

    cancelSlowFall(reason = ACTION_END_REASON.RELEASED) {
        const definition = actionDefinitionById(this.activeAction?.baseActionId);
        if (!definition?.cancelsOnRelease) return Object.freeze([]);
        return Object.freeze(this.#endActiveAction(reason));
    }

    absorbIncomingDamage({
        amount,
        type = ACTION_DAMAGE_TYPE.COMBAT_HP,
        sourceKind = ACTION_SOURCE_KIND.CONTACT,
        attackerId = null
    } = {}) {
        finiteNonNegative(amount, "damage amount");
        let remainingDamage = amount;
        const events = [];
        let blockedByGuard = false;
        const definition = actionDefinitionById(this.activeAction?.baseActionId);
        const guardResult = definition?.absorbIncomingDamage?.(
            this.activeAction,
            { amount, remainingDamage, type, sourceKind, attackerId },
            actionSignatureById(this.activeAction?.signatureId)
        );
        if (guardResult) {
            remainingDamage = guardResult.remainingDamage;
            blockedByGuard = guardResult.blockedByGuard;
            events.push(...guardResult.events);
        }
        const shieldResult = this.shieldState.absorb(remainingDamage, type);
        remainingDamage = shieldResult.remainingDamage;
        return Object.freeze({
            appliedDamage: remainingDamage,
            absorbedByShield: shieldResult.absorbedDamage,
            blockedByGuard,
            events: Object.freeze(events)
        });
    }

    advance(dt, { isGrounded = false, cancelSlowFall = false } = {}) {
        finiteNonNegative(dt, "dt");
        const events = [];
        this.ropeLinkWindowRemaining = Math.max(ACTION_STATE_CONFIG.ZERO, this.ropeLinkWindowRemaining - dt);
        this.shieldState.advance(dt);
        this.#advanceRecharge(dt);
        if (this.activeAction) {
            const definition = actionDefinitionById(this.activeAction.baseActionId);
            let reason = definition.activeEndReason({
                cancelRequested: cancelSlowFall,
                isGrounded,
                durationRemaining: this.activeAction.durationRemaining
            });
            if (!reason) {
                this.activeAction.durationRemaining = Math.max(
                    ACTION_STATE_CONFIG.ZERO,
                    this.activeAction.durationRemaining - dt
                );
                reason = definition.activeEndReason({
                    cancelRequested: false,
                    isGrounded: false,
                    durationRemaining: this.activeAction.durationRemaining
                });
            }
            if (reason) events.push(...this.#endActiveAction(reason));
        }
        events.push(...this.pendingEffectState.advance(dt));
        return Object.freeze(events);
    }

    snapshot() {
        const shield = this.shieldState.snapshot();
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
            shieldValue: shield.value,
            shieldRemaining: shield.remaining,
            activeAction: this.activeAction ? Object.freeze(cloneActiveAction(this.activeAction)) : null,
            pendingEffects: this.pendingEffectState.snapshot()
        });
    }

    restore(snapshot) {
        this.loadout = freezeLoadout(snapshot?.loadout ?? this.loadout);
        finiteNonNegative(snapshot?.maxHealth ?? this.maxHealth, "maxHealth");
        this.maxHealth = snapshot.maxHealth ?? this.maxHealth;
        this.shieldState.setMaxHealth(this.maxHealth);
        finiteNonNegative(snapshot?.actionSequence ?? ACTION_STATE_CONFIG.ZERO, "actionSequence");
        finiteNonNegative(snapshot?.chargesRemaining ?? this.maxCharges(), "chargesRemaining");
        finiteNonNegative(snapshot?.rechargeRemaining ?? ACTION_STATE_CONFIG.ZERO, "rechargeRemaining");
        finiteNonNegative(
            snapshot?.rechargeDuration ?? snapshot?.rechargeRemaining ?? ACTION_STATE_CONFIG.ZERO,
            "rechargeDuration"
        );
        finiteNonNegative(snapshot?.ropeLinkWindowRemaining ?? ACTION_STATE_CONFIG.ZERO, "ropeLinkWindowRemaining");
        finiteNonNegative(snapshot?.shieldValue ?? ACTION_STATE_CONFIG.ZERO, "shieldValue");
        finiteNonNegative(snapshot?.shieldRemaining ?? ACTION_STATE_CONFIG.ZERO, "shieldRemaining");
        const rechargeQueue = [...(snapshot?.rechargeQueue ?? [])].map((value, index) =>
            finiteNonNegative(value, `rechargeQueue[${index}]`)
        );
        const activeAction = snapshot?.activeAction ? cloneActiveAction(snapshot.activeAction) : null;
        if (activeAction) {
            finiteNonNegative(activeAction.durationRemaining, "activeAction.durationRemaining");
            finiteNonNegative(activeAction.totalDuration, "activeAction.totalDuration");
        }
        this.actionSequence = snapshot?.actionSequence ?? ACTION_STATE_CONFIG.ZERO;
        this.chargesRemaining = Math.min(this.maxCharges(), snapshot?.chargesRemaining ?? this.maxCharges());
        this.rechargeRemaining = snapshot?.rechargeRemaining ?? ACTION_STATE_CONFIG.ZERO;
        this.rechargeDuration = snapshot?.rechargeDuration ?? this.rechargeRemaining;
        this.rechargeQueue = rechargeQueue;
        this.ropeLinkWindowRemaining = snapshot?.ropeLinkWindowRemaining ?? ACTION_STATE_CONFIG.ZERO;
        this.shieldState.restore({
            value: snapshot?.shieldValue ?? ACTION_STATE_CONFIG.ZERO,
            remaining: snapshot?.shieldRemaining ?? ACTION_STATE_CONFIG.ZERO
        });
        this.activeAction = activeAction;
        this.pendingEffectState.restore(snapshot?.pendingEffects ?? [], finiteNonNegative);
        return this.snapshot();
    }

    #endActiveAction(reason) {
        const activation = this.#recreateActiveActivation();
        activation.cooldownSeconds = this.activeAction.cooldownSeconds;
        return this.#applyActionEnd(activation, reason);
    }

    #recreateActiveActivation() {
        const definition = this.activeDefinition();
        const baseAction = this.activeBaseAction();
        return definition.createActivation({
            shared: {
                activationId: this.activeAction.activationId,
                baseActionId: baseAction.id,
                signatureId: this.loadout.signatureId,
                modifierIds: [...this.loadout.modifierIds],
                direction: Object.freeze({
                    ...normalizeDirection(
                        this.activeAction.direction ?? {
                            x: ACTION_STATE_CONFIG.UNIT,
                            y: ACTION_STATE_CONFIG.ZERO
                        }
                    )
                })
            },
            effect: baseAction.effect,
            signature: this.activeSignatureDefinition()
        });
    }

    #enqueueRecharge(cooldownSeconds) {
        finiteNonNegative(cooldownSeconds, "cooldownSeconds");
        this.rechargeQueue.push(cooldownSeconds);
        if (this.rechargeRemaining === ACTION_STATE_CONFIG.ZERO) {
            this.rechargeRemaining = this.rechargeQueue.shift() ?? ACTION_STATE_CONFIG.ZERO;
            this.rechargeDuration = this.rechargeRemaining;
        }
    }

    #advanceRecharge(dt) {
        let remainingDt = dt;
        while (remainingDt > ACTION_STATE_CONFIG.ZERO && this.rechargeRemaining > ACTION_STATE_CONFIG.ZERO) {
            const consumed = Math.min(remainingDt, this.rechargeRemaining);
            this.rechargeRemaining -= consumed;
            remainingDt -= consumed;
            if (this.rechargeRemaining > ACTION_STATE_CONFIG.ZERO) break;
            this.chargesRemaining = Math.min(this.maxCharges(), this.chargesRemaining + ACTION_STATE_CONFIG.UNIT);
            if (this.chargesRemaining < this.maxCharges() && this.rechargeQueue.length > ACTION_STATE_CONFIG.ZERO) {
                this.rechargeRemaining = this.rechargeQueue.shift();
                this.rechargeDuration = this.rechargeRemaining;
            } else {
                this.rechargeRemaining = ACTION_STATE_CONFIG.ZERO;
                this.rechargeDuration = ACTION_STATE_CONFIG.ZERO;
                if (this.chargesRemaining === this.maxCharges()) {
                    this.rechargeQueue.length = ACTION_STATE_CONFIG.ZERO;
                }
            }
        }
    }

    #applyActionEnd(activation, reason) {
        const events = [
            Object.freeze({ eventType: ACTION_EVENT_TYPE.ENDED, activationId: activation.activationId, reason })
        ];
        this.activeAction = null;
        const definition = actionDefinitionById(activation.baseActionId);
        if (definition.rechargeOnEnd) this.#enqueueRecharge(activation.cooldownSeconds);
        const signature = actionSignatureById(activation.signatureId);
        if (signature?.onActionEnd) {
            events.push(...signature.onActionEnd({ activation, reason, pendingEffects: this.pendingEffectState }));
        }
        if (this.hasModifier(ACTION_MODIFIER_ID.POST_ACTION_SHIELD)) {
            const shield = this.shieldState.apply();
            events.push(
                Object.freeze({
                    eventType: ACTION_EVENT_TYPE.POST_ACTION_SHIELD_APPLIED,
                    shieldValue: shield.shieldValue,
                    durationSeconds: shield.durationSeconds
                })
            );
        }
        return events;
    }
}

function compatibleSignatureForActivation(activation) {
    const signatureCard = actionAugmentById(activation.signatureId);
    return signatureCard?.compatibleBaseActionIds.includes(activation.baseActionId)
        ? actionSignatureById(activation.signatureId)
        : null;
}

export function createActionResolutionTracker(activation) {
    const tracker = compatibleSignatureForActivation(activation)?.createResolutionTracker?.() ?? null;
    return Object.freeze({
        observeDashStrikeRebound(details) {
            return (
                tracker?.observeDashStrikeRebound?.(details) ??
                Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.REBOUND_INACTIVE })
            );
        },
        observeWallImpact(details) {
            return (
                tracker?.observeWallImpact?.(details) ??
                Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.WALL_IMPACT_INACTIVE })
            );
        },
        observeProjectileHit(details) {
            return (
                tracker?.observeProjectileHit?.(details) ??
                Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.PIERCE_INACTIVE })
            );
        },
        observeExplosiveTrailHit(details) {
            return (
                tracker?.observeExplosiveTrailHit?.(details) ??
                Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.TRAIL_INACTIVE })
            );
        }
    });
}

export { ACTION_STATE_CONFIG, SIGNATURE_ACTION_IDS, UNIVERSAL_MODIFIER_IDS };
