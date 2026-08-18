import assert from "node:assert/strict";
import { createElectricArcPath } from "../src/render/effects/ElectricArc.js";
import {
    CollisionExplosionState,
    resolveCollisionExplosion
} from "../src/game/augments/rope/CollisionExplosionState.js";
import {
    ElectrifiedRopeContactState,
    ropeTouchesEnemy
} from "../src/game/augments/rope/ElectrifiedRopeContactState.js";
import {
    applyReleasePropulsion,
    createModifiedRopeProfile,
    createRopeAugmentTuning,
    ROPE_AUGMENT_PERCENTAGES,
    selectDefaultPunchTarget
} from "../src/game/augments/rope/RopeAugmentTuning.js";

function enemy({ id, x, y, radius = 18, health = 100, isBoss = false } = {}) {
    return Object.freeze({
        id,
        position: Object.freeze({ x, y }),
        radius,
        health,
        isBoss
    });
}

const HORIZONTAL_SEGMENT = Object.freeze([
    Object.freeze({
        start: Object.freeze({ x: 0, y: 0 }),
        end: Object.freeze({ x: 100, y: 0 })
    })
]);

export function run() {
    const arc = createElectricArcPath({ x: 0, y: 0 }, { x: 200, y: 0 }, { time: 0.25 });
    assert.deepEqual(arc[0], { x: 0, y: 0 });
    assert.deepEqual(arc.at(-1), { x: 200, y: 0 });
    assert.deepEqual(createElectricArcPath({ x: 0, y: 0 }, { x: 200, y: 0 }, { time: 0.25 }), arc);
    const tuning = createRopeAugmentTuning({ impactDamage: 25 });
    assert.equal(tuning.baseRope.hookSpeed, 1200);
    assert.equal(tuning.baseRope.reach, 400);
    assert.equal(tuning.baseRope.hookFlightSeconds, 400 / 1200);
    assert.equal(tuning.baseRope.hookReloadSeconds, 1);
    assert.equal(tuning.commonRope.fastLaunch.hookSpeed, 1800);
    assert.equal(tuning.commonRope.fastLaunch.reach, 400);
    assert.equal(tuning.commonRope.fastLaunch.hookFlightSeconds, 400 / 1800);
    assert.equal(tuning.commonRope.longRope.reach, 480);
    assert.equal(tuning.commonRope.longRope.hookFlightSeconds, 480 / 1200);
    assert.equal(tuning.commonRope.fastRecover.hookReloadSeconds, 0.5);
    assert.equal(tuning.commonRope.releasePropulsion.velocityMultiplier, 1.25);
    assert.equal(tuning.commonRope.electrifiedRope.contactBandPadding, 10);
    assert.equal(tuning.commonRope.electrifiedRope.damagePerSecond, 20);
    assert.equal(tuning.commonRope.electrifiedRope.damagePerPulse, 2);
    assert.equal(tuning.commonRope.collisionExplosion.directDamage, 25);
    assert.equal(tuning.commonRope.collisionExplosion.splashDamage, 12.5);
    assert.equal(tuning.defaultPunch.range, 55);
    assert.equal(tuning.defaultPunch.damage, 10);
    assert.equal(tuning.defaultPunch.knockbackDistance, 50);
    assert.equal(tuning.defaultPunch.cooldownSeconds, 0.5);

    const modifiedProfile = createModifiedRopeProfile(tuning.baseRope, {
        speedPercent: ROPE_AUGMENT_PERCENTAGES.fastLaunchSpeed,
        reachPercent: ROPE_AUGMENT_PERCENTAGES.longRopeReach,
        reloadReductionPercent: ROPE_AUGMENT_PERCENTAGES.fastRecoverReloadReduction
    });
    assert.equal(modifiedProfile.hookSpeed, 1800);
    assert.equal(modifiedProfile.reach, 480);
    assert.equal(modifiedProfile.hookReloadSeconds, 0.5);
    assert.equal(modifiedProfile.hookFlightSeconds, 480 / 1800);

    assert.deepEqual(applyReleasePropulsion({ x: 80, y: -40 }), { x: 100, y: -50 });
    assert.equal(
        selectDefaultPunchTarget({
            playerPosition: { x: 0, y: 0 },
            enemies: [enemy({ id: "far", x: 80, y: 0 }), enemy({ id: "near", x: 54, y: 0 })]
        }).id,
        "near"
    );
    assert.equal(
        selectDefaultPunchTarget({
            playerPosition: { x: 0, y: 0 },
            enemies: [enemy({ id: "outside", x: 56, y: 0 })]
        }),
        null
    );

    assert.equal(ropeTouchesEnemy({ segments: HORIZONTAL_SEGMENT, enemy: enemy({ id: "touch", x: 50, y: 27 }) }), true);
    assert.equal(ropeTouchesEnemy({ segments: HORIZONTAL_SEGMENT, enemy: enemy({ id: "miss", x: 50, y: 29 }) }), false);

    const electrified = new ElectrifiedRopeContactState({ impactDamage: 25 });
    const contactEnemy = enemy({ id: "contact", x: 50, y: 0, health: 2 });
    const contactPulses0 = electrified.observe({
        dt: 0.04,
        segments: HORIZONTAL_SEGMENT,
        enemies: [contactEnemy],
        sourcePlayerId: "p1",
        clientTick: 10
    });
    assert.equal(contactPulses0.length, 0, "sub-pulse contact must not burst on entry");
    const contactPulses1 = electrified.observe({
        dt: 0.03,
        segments: HORIZONTAL_SEGMENT,
        enemies: [contactEnemy],
        sourcePlayerId: "p1",
        clientTick: 11
    });
    assert.equal(contactPulses1.length, 0, "short-contact accumulation must wait for a full 0.10s pulse");
    const contactPulses2 = electrified.observe({
        dt: 0.03,
        segments: HORIZONTAL_SEGMENT,
        enemies: [contactEnemy],
        sourcePlayerId: "p1",
        clientTick: 12
    });
    assert.equal(contactPulses2.length, 1);
    assert.equal(contactPulses2[0].damage, 2);
    assert.equal(contactPulses2[0].predictedResolution, "enemy-defeated");

    const multiContact = electrified.observe({
        dt: 0.1,
        segments: HORIZONTAL_SEGMENT,
        enemies: [enemy({ id: "left", x: 20, y: 0 }), enemy({ id: "right", x: 80, y: 0 })],
        sourcePlayerId: "p1",
        clientTick: 13
    });
    assert.deepEqual(
        multiContact.map(({ targetId, damage }) => ({ targetId, damage })),
        [
            { targetId: "left", damage: 2 },
            { targetId: "right", damage: 2 }
        ]
    );

    const explosionState = new CollisionExplosionState({ minimumSpeed: 620, impactDamage: 25 });
    const explosionEnemies = [
        enemy({ id: "primary", x: 50, y: 0, health: 20 }),
        enemy({ id: "nearby", x: 90, y: 40, health: 100 }),
        enemy({ id: "boss", x: 120, y: 55, health: 100, isBoss: true }),
        enemy({ id: "outside", x: 200, y: 0, health: 100 })
    ];
    const firstExplosion = explosionState.observe({
        ropeAttached: true,
        speed: 700,
        segments: HORIZONTAL_SEGMENT,
        playerPosition: { x: 0, y: 0 },
        enemies: explosionEnemies,
        sourcePlayerId: "p1",
        clientTick: 21
    });
    assert.deepEqual(
        firstExplosion.map(({ targetId, damage, knockback }) => ({
            targetId,
            damage,
            knockback: knockback ? { distance: knockback.distance, durationSeconds: knockback.durationSeconds } : null
        })),
        [
            { targetId: "primary", damage: 25, knockback: { distance: 100, durationSeconds: 0.25 } },
            { targetId: "nearby", damage: 12.5, knockback: { distance: 100, durationSeconds: 0.25 } },
            { targetId: "boss", damage: 12.5, knockback: null }
        ]
    );
    assert.equal(
        firstExplosion.some((entry) => entry.targetId === "outside"),
        false,
        "targets beyond the 120px blast radius must be excluded"
    );

    const heldContact = explosionState.observe({
        ropeAttached: true,
        speed: 700,
        segments: HORIZONTAL_SEGMENT,
        playerPosition: { x: 0, y: 0 },
        enemies: explosionEnemies,
        sourcePlayerId: "p1",
        clientTick: 22
    });
    assert.equal(heldContact.length, 0, "held overlap must not retrigger before separation");

    explosionState.observe({
        ropeAttached: false,
        speed: 100,
        segments: [],
        playerPosition: { x: 0, y: 0 },
        enemies: explosionEnemies,
        sourcePlayerId: "p1",
        clientTick: 23
    });
    const slowRecontact = explosionState.observe({
        ropeAttached: true,
        speed: 500,
        segments: HORIZONTAL_SEGMENT,
        playerPosition: { x: 0, y: 0 },
        enemies: explosionEnemies,
        sourcePlayerId: "p1",
        clientTick: 24
    });
    assert.equal(slowRecontact.length, 0, "recontact below minimum speed must stay disarmed");
    explosionState.observe({
        ropeAttached: false,
        speed: 100,
        segments: [],
        playerPosition: { x: 0, y: 0 },
        enemies: explosionEnemies,
        sourcePlayerId: "p1",
        clientTick: 25
    });
    const fastRecontact = explosionState.observe({
        ropeAttached: true,
        speed: 700,
        segments: HORIZONTAL_SEGMENT,
        playerPosition: { x: 0, y: 0 },
        enemies: explosionEnemies,
        sourcePlayerId: "p1",
        clientTick: 26
    });
    assert.equal(fastRecontact.length, 3, "separation plus high-speed recontact must rearm the explosion");

    const directExplosion = resolveCollisionExplosion({
        sourcePlayerId: "p1",
        clientTick: 40,
        primaryTarget: enemy({ id: "direct", x: 60, y: 0, health: 25 }),
        playerPosition: { x: 0, y: 0 },
        enemies: [enemy({ id: "direct", x: 60, y: 0, health: 25 })],
        impactDamage: 25
    });
    assert.equal(directExplosion.length, 1);
    assert.equal(directExplosion[0].knockback.direction.x, 1);
    assert.equal(directExplosion[0].predictedResolution, "enemy-defeated");
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\\\/g, "/")}`) {
    run();
    console.log("PASS ropeAugmentModules");
}
