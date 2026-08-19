import assert from "node:assert/strict";
import {
    ACTION_AUGMENT_CATALOG,
    BASE_ACTION_IDS,
    SIGNATURE_ACTION_IDS,
    UNIVERSAL_MODIFIER_IDS,
    actionAugmentById
} from "../src/game/augments/actions/ActionAugmentCatalog.js";
import {
    ActionAugmentState,
    createActionLoadout,
    createActionResolutionTracker
} from "../src/game/augments/actions/ActionAugmentState.js";
import { selectNearestActionTarget } from "../src/game/augments/actions/ActionTargeting.js";
import { AugmentCombatRuntime } from "../src/game/augments/AugmentCombatRuntime.js";
import { FoundationAugmentState } from "../src/game/augments/FoundationAugmentState.js";
import { foundationAugmentById } from "../src/game/augments/FoundationAugmentCatalog.js";

function direction(x, y) {
    return { x, y };
}

export function run() {
    assert.equal(ACTION_AUGMENT_CATALOG.length, 17);
    assert.deepEqual(BASE_ACTION_IDS, [
        "default-punch",
        "direction-dash",
        "dash-strike",
        "instant-guard",
        "push-away",
        "straight-shot",
        "slow-fall"
    ]);
    assert.equal(SIGNATURE_ACTION_IDS.length, 6);
    assert.equal(UNIVERSAL_MODIFIER_IDS.length, 4);
    assert.equal(actionAugmentById("end-wave").displayName, "종료 파동");
    assert.equal(actionAugmentById("direction-dash").displayName, "점멸");
    assert.equal(actionAugmentById("default-punch").displayName, "주먹");
    assert.equal(foundationAugmentById("default-punch"), null, "the built-in punch must not enter Augment offers");
    assert.throws(
        () => createActionLoadout({ baseActionId: "direction-dash", signatureId: "wall-impact" }),
        /not compatible/
    );

    const punch = new ActionAugmentState({ baseActionId: "default-punch" });
    const punchStart = punch.beginAction({ direction: direction(1, 0) });
    assert.equal(punchStart.accepted, true);
    assert.equal(punchStart.cooldownSeconds, 0.5);
    assert.deepEqual(
        {
            baseActionId: punchStart.activation.baseActionId,
            immediate: punchStart.activation.immediate,
            range: punchStart.activation.range,
            damageMultiplier: punchStart.activation.damageMultiplier,
            knockbackDistance: punchStart.activation.knockbackDistance,
            knockbackSeconds: punchStart.activation.knockbackSeconds
        },
        {
            baseActionId: "default-punch",
            immediate: true,
            range: 55,
            damageMultiplier: 0.4,
            knockbackDistance: 50,
            knockbackSeconds: 0.25
        }
    );
    assert.equal(punch.chargesRemaining, 0);
    assert.equal(punch.rechargeRemaining, 0.5);
    assert.ok(punchStart.events.some(({ eventType }) => eventType === "action-ended"));
    punch.advance(0.25);
    assert.equal(punch.rechargeRemaining, 0.25);
    punch.advance(0.25);
    assert.equal(punch.chargesRemaining, 1);
    assert.equal(
        selectNearestActionTarget({
            playerPosition: { x: 0, y: 0 },
            range: punchStart.activation.range,
            enemies: [
                { id: "far", health: 100, position: { x: 80, y: 0 } },
                { id: "near", health: 100, position: { x: 54, y: 0 } }
            ]
        }).id,
        "near"
    );
    const migratedPunchRuntime = new AugmentCombatRuntime();
    migratedPunchRuntime.restore({ punchCooldownRemaining: 0.25 }, new FoundationAugmentState(), 100);
    assert.equal(migratedPunchRuntime.actionState.loadout.baseActionId, "default-punch");
    assert.equal(migratedPunchRuntime.actionState.chargesRemaining, 0);
    assert.equal(migratedPunchRuntime.actionState.rechargeRemaining, 0.25);
    assert.equal(migratedPunchRuntime.actionState.rechargeDuration, 0.5);
    assert.equal("punchCooldownRemaining" in migratedPunchRuntime.snapshot(), false);

    const dash = new ActionAugmentState({
        baseActionId: "direction-dash",
        signatureId: "explosive-trail",
        modifierIds: ["fast-reuse", "rope-link", "post-action-shield"]
    });
    assert.equal(dash.onRopeReleased(), true);
    const dashStart = dash.beginAction({ direction: direction(3, 4) });
    assert.equal(dashStart.accepted, true);
    assert.equal(dashStart.cooldownSeconds, 1.5);
    assert.equal(dashStart.activation.distance, 150);
    assert.equal(dashStart.activation.immediate, true);
    assert.equal("durationSeconds" in dashStart.activation, false);
    assert.equal(dash.activeAction, null);
    assert.equal(dash.chargesRemaining, 0);
    assert.ok(dashStart.events.some(({ eventType }) => eventType === "action-ended"));
    assert.ok(dashStart.events.some(({ eventType }) => eventType === "post-action-shield-applied"));
    assert.equal(dash.shieldValue, 15);
    assert.equal(
        dash.setExplosiveTrailPath(dashStart.activation.activationId, { x: 10, y: 20 }, { x: 100, y: 20 }),
        true
    );
    const trail = dash.advance(0.5);
    assert.deepEqual(
        trail.find(({ eventType }) => eventType === "explosive-trail-detonated"),
        {
            eventType: "explosive-trail-detonated",
            activationId: dashStart.activation.activationId,
            width: 60,
            damage: 80,
            start: { x: 10, y: 20 },
            end: { x: 100, y: 20 }
        }
    );
    dash.advance(1);
    assert.equal(dash.chargesRemaining, 1, "the dash charge must return after its effective recharge");

    const plainBlink = new ActionAugmentState({ baseActionId: "direction-dash", modifierIds: [] });
    assert.equal(plainBlink.beginAction({ direction: direction(1, 0) }).accepted, true);
    assert.equal(plainBlink.pendingEffects.length, 0, "blink without its Signature leaves no trail state");

    const charges = new ActionAugmentState({
        baseActionId: "straight-shot",
        signatureId: "piercing-shot",
        modifierIds: ["extra-charge"]
    });
    assert.equal(charges.maxCharges(), 2);
    assert.equal(charges.beginAction({ direction: direction(1, 0) }).accepted, true);
    assert.equal(charges.beginAction({ direction: direction(1, 0) }).accepted, true);
    assert.deepEqual(charges.beginAction({ direction: direction(1, 0) }), {
        accepted: false,
        reason: "charge-depleted"
    });
    charges.advance(2.5);
    assert.equal(charges.chargesRemaining, 1, "charges must refill sequentially");
    charges.advance(2.5);
    assert.equal(charges.chargesRemaining, 2, "the second queued charge must refill after the first");

    const guard = new ActionAugmentState({
        baseActionId: "instant-guard",
        signatureId: "damage-reflect",
        modifierIds: []
    });
    const guardStart = guard.beginAction({ direction: direction(1, 0) });
    assert.equal(guardStart.accepted, true);
    const blocked = guard.absorbIncomingDamage({
        amount: 32,
        type: "combat-hp",
        sourceKind: "projectile",
        attackerId: "enemy-shot"
    });
    assert.equal(blocked.appliedDamage, 0);
    assert.equal(blocked.blockedByGuard, true);
    assert.deepEqual(blocked.events[0], {
        eventType: "damage-reflected",
        attackerId: "enemy-shot",
        reflectedDamage: 32,
        sourceKind: "projectile",
        causalLineRequired: true
    });
    const secondHit = guard.absorbIncomingDamage({ amount: 10, type: "combat-hp", sourceKind: "contact" });
    assert.equal(secondHit.appliedDamage, 10, "only the first combat hp hit should be nullified");
    const ropeCut = guard.absorbIncomingDamage({ amount: 7, type: "rope-cut", sourceKind: "hazard" });
    assert.equal(ropeCut.appliedDamage, 7, "rope cut damage must bypass guard");

    const slowFall = new ActionAugmentState({
        baseActionId: "slow-fall",
        signatureId: "end-wave",
        modifierIds: []
    });
    assert.deepEqual(slowFall.beginAction({ direction: direction(0, -1) }), {
        accepted: false,
        reason: "not-airborne"
    });
    const slowStart = slowFall.beginAction({ direction: direction(0, -1), airborne: true });
    assert.equal(slowStart.activation.gravityScale, 0.25);
    assert.equal(slowFall.rechargeRemaining, 0, "slow-fall cooldown starts only when the hold ends");
    assert.equal(slowFall.movementModifiers().gravityScale, 0.25);
    const landingEvents = slowFall.advance(0.6, { isGrounded: true });
    assert.ok(landingEvents.some(({ eventType }) => eventType === "slow-fall-end-wave"));
    assert.equal(slowFall.rechargeRemaining, 5);
    assert.equal(slowFall.movementModifiers().gravityScale, 1);

    const strike = new ActionAugmentState({
        baseActionId: "dash-strike",
        signatureId: "collision-rebound",
        modifierIds: []
    });
    const strikeStart = strike.beginAction({ direction: direction(1, 0) });
    assert.equal(strikeStart.activation.impulse, 500);
    const strikeTracker = createActionResolutionTracker(strikeStart.activation);
    const rebound = strikeTracker.observeDashStrikeRebound({
        targetId: "enemy-a",
        targetKind: "enemy",
        collisionNormal: direction(-1, 0),
        incomingVelocity: direction(120, 40)
    });
    assert.equal(rebound.accepted, true);
    assert.equal(Math.hypot(rebound.reflectedVelocity.x, rebound.reflectedVelocity.y), Math.hypot(120, 40));
    assert.deepEqual(
        strikeTracker.observeDashStrikeRebound({
            targetId: "enemy-a",
            targetKind: "enemy",
            collisionNormal: direction(-1, 0),
            incomingVelocity: direction(120, 40)
        }),
        { accepted: false, reason: "duplicate-enemy" }
    );
    assert.equal(
        strikeTracker.observeDashStrikeRebound({
            targetKind: "wall",
            collisionNormal: direction(0, 1),
            incomingVelocity: direction(120, -40)
        }).accepted,
        true
    );

    const push = new ActionAugmentState({
        baseActionId: "push-away",
        signatureId: "wall-impact",
        modifierIds: []
    });
    const pushStart = push.beginAction({ direction: direction(1, 0) });
    assert.equal(pushStart.activation.radius, 140);
    assert.equal(
        pushStart.events.some(({ eventType }) => eventType === "action-ended"),
        true
    );
    const pushTracker = createActionResolutionTracker(pushStart.activation);
    assert.deepEqual(pushTracker.observeWallImpact({ targetId: "enemy-a" }), { accepted: true, damage: 80 });
    assert.deepEqual(pushTracker.observeWallImpact({ targetId: "enemy-a" }), {
        accepted: false,
        reason: "duplicate-target"
    });

    const shot = new ActionAugmentState({
        baseActionId: "straight-shot",
        signatureId: "piercing-shot",
        modifierIds: []
    });
    const shotStart = shot.beginAction({ direction: direction(1, 0) });
    assert.equal(shotStart.activation.speed, 2000);
    assert.equal(shotStart.activation.range, 3000);
    assert.equal(shotStart.activation.lifetimeSeconds, 1.5);
    const shotTracker = createActionResolutionTracker(shotStart.activation);
    assert.deepEqual(shotTracker.observeProjectileHit({ targetId: "enemy-a" }), {
        accepted: true,
        preservesDamage: true,
        preservesSpeed: true
    });
    assert.deepEqual(shotTracker.observeProjectileHit({ targetId: "enemy-a" }), {
        accepted: false,
        reason: "duplicate-target"
    });

    const restored = new ActionAugmentState({
        baseActionId: "direction-dash",
        signatureId: "explosive-trail",
        modifierIds: ["post-action-shield"]
    });
    restored.restore(dash.snapshot());
    assert.equal(restored.loadout.baseActionId, "direction-dash");
    assert.equal(restored.shieldValue, 15);
    assert.equal(restored.chargesRemaining, 1);

    const pendingBlink = new ActionAugmentState({
        baseActionId: "direction-dash",
        signatureId: "explosive-trail",
        modifierIds: []
    });
    const pendingStart = pendingBlink.beginAction({ direction: direction(1, 0) });
    pendingBlink.setExplosiveTrailPath(pendingStart.activation.activationId, { x: 5, y: 6 }, { x: 55, y: 6 });
    const restoredPendingBlink = new ActionAugmentState({
        baseActionId: "direction-dash",
        signatureId: "explosive-trail",
        modifierIds: []
    });
    restoredPendingBlink.restore(pendingBlink.snapshot());
    assert.deepEqual(
        restoredPendingBlink.advance(0.5).find(({ eventType }) => eventType === "explosive-trail-detonated"),
        {
            eventType: "explosive-trail-detonated",
            activationId: pendingStart.activation.activationId,
            width: 60,
            damage: 80,
            start: { x: 5, y: 6 },
            end: { x: 55, y: 6 }
        },
        "snapshot restore preserves an immediate blink trail path"
    );
}
