import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { SPELL_ID, SPELL_SLOT_ID } from "../src/game/spells/SpellDefinition.js";
import { STATUS_EFFECT_ID } from "../src/game/status-effects/StatusEffectDefinition.js";
import { TwoPlayerCombatSimulation } from "../src/game/simulation/TwoPlayerCombatSimulation.js";
import { IncomingSpellImpactDetector } from "../src/game/spells/IncomingSpellImpactDetector.js";
import {
    createAugmentImpactClaim,
    deserializeAugmentImpactClaim,
    serializeAugmentImpactClaim
} from "../src/game/network/AugmentImpactClaim.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { AUGMENT_ID } from "../src/game/augments/AugmentCatalog.js";
import { enemyImpactDisplacementEnabled } from "../src/game/combat/EnemyMobility.js";
import { ENEMY_TYPE } from "../src/game/EnemyType.js";
import { createEnemyObject } from "../src/game/combat/EnemyObject.js";

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function nearlyEqual(left, right, tolerance = 0.001) {
    return Math.abs(left - right) <= tolerance;
}

function jumpCommand(position) {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: -1,
            interact: false,
            interactSequence: 0,
            spellCommand: { commandSequence: 0, commandKey: null },
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        position
    );
}

function detectIncomingEnergyOrb(harness) {
    const [sourceId, victimId] = harness.playerIds;
    const source = harness.player(sourceId);
    harness.simulation.objects.enemies.clear();
    harness.setPlayerHealth(victimId, 500, 500);
    harness.placePlayer(victimId, { x: source.position.x + 1000, y: source.position.y });
    harness.advanceTicks(
        1,
        new Map([
            [sourceId, harness.spellCommand(sourceId, SPELL_SLOT_ID.BASIC_ATTACK, harness.player(victimId).position)]
        ])
    );
    const projectile = harness.simulation.playerState(sourceId).augmentRuntimeState.combat.spellProjectiles[0];
    assert(projectile, "real source spell state must contain the energy orb");
    harness.placePlayer(victimId, projectile.position);
    const detector = new IncomingSpellImpactDetector();
    const events = detector.observe(
        { ...harness.simulation.ownerPredictionState(victimId), id: victimId, tick: harness.simulation.getTick() },
        [harness.simulation.playerState(sourceId)]
    );
    assert(events.length === 1, "victim detector must produce one incoming spell impact");
    return events[0];
}

export function simulateTwoPlayerCombat() {
    const harness = new TwoPlayerCombatSimulation();
    const [firstId, secondId] = harness.playerIds;
    const first = harness.player(firstId);
    harness.simulation.objects.enemies.clear();
    harness.setPlayerHealth(secondId, 500, 500);
    harness.placePlayer(firstId, { x: first.position.x, y: first.position.y });
    harness.placePlayer(secondId, { x: first.position.x + 120, y: first.position.y });

    harness.advanceTicks(
        40,
        new Map([
            [firstId, harness.spellCommand(firstId, SPELL_SLOT_ID.BASIC_ATTACK, harness.player(secondId).position)]
        ])
    );
    assert(nearlyEqual(harness.player(secondId).health, 480), "energy orb must damage the other Player once");
    assert(nearlyEqual(harness.player(firstId).health, 100), "default target policy must exclude the caster");

    harness.equipAugment(firstId, SPELL_ID.METEOR);
    harness.advanceTicks(130);
    harness.advanceTicks(
        150,
        new Map([
            [firstId, harness.spellCommand(firstId, SPELL_SLOT_ID.POWER_ATTACK, harness.player(secondId).position)]
        ])
    );
    assert(harness.player(secondId).health < 430, "meteor must apply high-power damage to the other Player");
    assert(
        harness.player(secondId).statusEffects.effect(STATUS_EFFECT_ID.IGNITED).active,
        "meteor must apply ignition"
    );

    harness.applyStatus(secondId, STATUS_EFFECT_ID.FROZEN, firstId);
    const dashCooldownBefore = harness.player(secondId).augmentCombat.spellState.cooldowns[SPELL_SLOT_ID.MOVEMENT];
    harness.advanceTicks(
        1,
        new Map([[secondId, harness.spellCommand(secondId, SPELL_SLOT_ID.MOVEMENT, { x: 1000, y: 0 })]])
    );
    assert(
        harness.player(secondId).augmentCombat.spellState.cooldowns[SPELL_SLOT_ID.MOVEMENT] === dashCooldownBefore,
        "frozen Player input must not cast a spell"
    );
    assert(harness.player(secondId).velocity.isFinite(), "frozen Player physics must continue with finite velocity");

    const dashHarness = new TwoPlayerCombatSimulation({ worldSeed: 3 });
    const dashPlayerId = dashHarness.playerIds[0];
    dashHarness.simulation.objects.enemies.clear();
    dashHarness.placePlayer(dashPlayerId, { x: 0, y: -900 });
    dashHarness.placePlayer(dashHarness.playerIds[1], { x: 3000, y: -900 });
    dashHarness.advanceTicks(
        2,
        new Map([[dashPlayerId, dashHarness.spellCommand(dashPlayerId, SPELL_SLOT_ID.MOVEMENT, { x: 1000, y: -900 })]])
    );
    assert(
        dashHarness.player(dashPlayerId).velocity.x >
            dashHarness.player(dashPlayerId).physics.config.maxHorizontalSpeed,
        "physical dash impulse must survive the next movement-physics clamp"
    );

    const spellPoolHarness = new TwoPlayerCombatSimulation({ worldSeed: 31 });
    const spellPoolPlayerId = spellPoolHarness.playerIds[0];
    const spellPoolPlayer = spellPoolHarness.player(spellPoolPlayerId);
    spellPoolHarness.placePlayer(spellPoolHarness.playerIds[1], { x: 4000, y: -900 });
    const slashEnemies = spellPoolHarness.simulation.createEnemies().slice(0, 2);
    for (const [index, enemy] of slashEnemies.entries()) {
        enemy.setPhysicsPosition({ x: spellPoolPlayer.position.x + 100 + index * 40, y: spellPoolPlayer.position.y });
        enemy.health = 100;
        enemy.maxHealth = 100;
    }
    spellPoolHarness.replaceEnemies(slashEnemies);
    spellPoolHarness.equipAugment(spellPoolPlayerId, SPELL_ID.ARCANE_SLASH);
    spellPoolHarness.advanceTicks(
        1,
        new Map([
            [
                spellPoolPlayerId,
                spellPoolHarness.spellCommand(spellPoolPlayerId, SPELL_SLOT_ID.BASIC_ATTACK, {
                    x: spellPoolPlayer.position.x + 500,
                    y: spellPoolPlayer.position.y
                })
            ]
        ])
    );
    assert(
        slashEnemies.every(({ health }) => nearlyEqual(health, 65)),
        "arcane slash must damage every target in its cone once"
    );

    spellPoolHarness.equipAugment(spellPoolPlayerId, SPELL_ID.FROST_BURST);
    spellPoolHarness.advanceTicks(
        1,
        new Map([
            [
                spellPoolPlayerId,
                spellPoolHarness.spellCommand(spellPoolPlayerId, SPELL_SLOT_ID.POWER_ATTACK, spellPoolPlayer.position)
            ]
        ])
    );
    assert(
        slashEnemies.every(({ health }) => nearlyEqual(health, 25)),
        "frost burst must apply area damage once"
    );
    assert(
        slashEnemies.every((enemy) => enemy.statusEffects.effect(STATUS_EFFECT_ID.FROZEN).active),
        "frost burst must freeze every area target"
    );

    const electricHarness = new TwoPlayerCombatSimulation({ worldSeed: 32 });
    const electricPlayerId = electricHarness.playerIds[0];
    const electricPlayer = electricHarness.player(electricPlayerId);
    electricHarness.placePlayer(electricHarness.playerIds[1], { x: 4000, y: -900 });
    const electricEnemy = electricHarness.simulation.createEnemies()[0];
    electricEnemy.setPhysicsPosition({ x: electricPlayer.position.x + 100, y: electricPlayer.position.y + 100 });
    electricEnemy.health = 200;
    electricEnemy.maxHealth = 200;
    electricHarness.replaceEnemies([electricEnemy]);
    electricHarness.equipAugment(electricPlayerId, SPELL_ID.ELECTRIC_ORB);
    electricHarness.advanceTicks(
        1,
        new Map([
            [
                electricPlayerId,
                electricHarness.spellCommand(electricPlayerId, SPELL_SLOT_ID.POWER_ATTACK, {
                    x: electricPlayer.position.x + 1000,
                    y: electricPlayer.position.y
                })
            ]
        ])
    );
    assert(
        electricEnemy.statusEffects.effect(STATUS_EFFECT_ID.HIGH_VOLTAGE).active,
        "electric orb aura must apply high voltage without body contact"
    );
    const electricDetector = new IncomingSpellImpactDetector();
    const electricProjection = {
        id: "electric-victim-projection",
        tick: electricHarness.simulation.getTick(),
        position: { x: electricPlayer.position.x + 120, y: electricPlayer.position.y + 80 },
        radius: 18,
        collider: { radius: 18 },
        health: 500
    };
    const electricRemoteImpacts = electricDetector.observe(electricProjection, [
        electricHarness.simulation.playerState(electricPlayerId)
    ]);
    assert(
        electricRemoteImpacts.some(
            ({ effectId, statusEffectId }) =>
                effectId === "electric-orb-aura" && statusEffectId === STATUS_EFFECT_ID.HIGH_VOLTAGE
        ),
        "remote victim detector must resolve the replicated electric aura instead of body contact"
    );
    electricHarness.advanceTicks(180);
    assert(nearlyEqual(electricEnemy.health, 125), "high voltage must deal 75 status damage without direct damage");

    const chainDashHarness = new TwoPlayerCombatSimulation({ worldSeed: 33 });
    const chainDashPlayerId = chainDashHarness.playerIds[0];
    chainDashHarness.simulation.objects.enemies.clear();
    chainDashHarness.placePlayer(chainDashHarness.playerIds[1], { x: 4000, y: -900 });
    chainDashHarness.equipAugment(chainDashPlayerId, SPELL_ID.CHAIN_DASH);
    chainDashHarness.advanceTicks(
        1,
        new Map([
            [
                chainDashPlayerId,
                chainDashHarness.spellCommand(chainDashPlayerId, SPELL_SLOT_ID.MOVEMENT, { x: 1000, y: -900 })
            ]
        ])
    );
    chainDashHarness.advanceTicks(
        1,
        new Map([
            [
                chainDashPlayerId,
                chainDashHarness.spellCommand(chainDashPlayerId, SPELL_SLOT_ID.MOVEMENT, { x: -1000, y: -900 })
            ]
        ])
    );
    assert(
        chainDashHarness.player(chainDashPlayerId).augmentCombat.spellState.charges[SPELL_ID.CHAIN_DASH] === 0,
        "chain dash must consume two independently available charges"
    );

    const dynamicEnemy = createEnemyObject({
        id: "dynamic-impulse-enemy",
        position: { x: 0, y: 0 },
        level: 1,
        enemyType: ENEMY_TYPE.PURSUIT_DRONE_T1,
        radius: 18,
        health: 100,
        maxHealth: 100,
        experienceReward: 25,
        fireCooldown: 0
    });
    const dynamicVelocityBefore = dynamicEnemy.physicsStepVelocity().x;
    assert(
        dynamicEnemy.applyExternalImpulse({ direction: { x: 1, y: 0 }, impulse: 600 }),
        "dynamic enemy must accept common external impulse"
    );
    assert(
        nearlyEqual(dynamicEnemy.physicsStepVelocity().x - dynamicVelocityBefore, 600),
        "dynamic enemy impulse must accumulate in physics acceleration"
    );
    assert(
        !enemyImpactDisplacementEnabled(ENEMY_TYPE.SENTRY_T1),
        "fixed sentry definition must reject external impulse"
    );

    const deathExperience = chainDashHarness.player(chainDashPlayerId).experience;
    deathExperience.add(265);
    while (deathExperience.pendingRewardCount > 0) deathExperience.resolveNextReward();
    const rewardedLevel = deathExperience.resolvedRewardLevel;
    const deathLoss = deathExperience.loseForDeath();
    assert(
        deathLoss.amount === 55 && deathExperience.level < rewardedLevel,
        "death must lose half of the current level requirement"
    );
    deathExperience.add(deathLoss.amount);
    assert(
        deathExperience.pendingRewardCount === 0,
        "reaching a previously rewarded level must not reopen an augment reward"
    );

    const passiveHarness = new TwoPlayerCombatSimulation({ worldSeed: 34 });
    const passivePlayerId = passiveHarness.playerIds[0];
    const passivePlayer = passiveHarness.player(passivePlayerId);
    passiveHarness.placePlayer(passiveHarness.playerIds[1], { x: 4000, y: -900 });
    passiveHarness.equipAugment(passivePlayerId, AUGMENT_ID.ROPE_REGENERATION);
    passivePlayer.health = 90;
    assert(
        passivePlayer.ropeObject.rope.attach(passivePlayer.position, {
            x: passivePlayer.position.x + 100,
            y: passivePlayer.position.y - 20
        }),
        "rope regeneration scenario must attach the rope"
    );
    passiveHarness.advanceTicks(120);
    assert(nearlyEqual(passivePlayer.health, 92), "attached rope must regenerate exactly two health per second");
    passiveHarness.equipAugment(passivePlayerId, AUGMENT_ID.DOUBLE_JUMP);
    passivePlayer.physics.isGrounded = true;
    passiveHarness.advanceTicks(1);
    passivePlayer.ropeObject.rope.detach();
    passivePlayer.physics.isGrounded = false;
    passivePlayer.augmentCombat.passiveState.jumpPressed = false;
    passiveHarness.advanceTicks(1, new Map([[passivePlayerId, jumpCommand(passivePlayer.position)]]));
    assert(
        passivePlayer.physics.physicsStepVelocity().y < 0 &&
            passivePlayer.augmentCombat.passiveState.airJumpsRemaining === 0,
        "double jump must consume one air jump through the common impulse path"
    );

    const victimPrediction = new TwoPlayerCombatSimulation({ worldSeed: 4 });
    const victimEvent = detectIncomingEnergyOrb(victimPrediction);
    const predictedVictimId = victimPrediction.playerIds[1];
    assert(
        victimPrediction.simulation.applyPredictedIncomingSpellImpact(predictedVictimId, victimEvent),
        "victim client must apply incoming spell damage before a receipt"
    );
    assert(
        nearlyEqual(victimPrediction.player(predictedVictimId).health, 480),
        "victim prediction must apply 20 damage"
    );

    const claimHarness = new TwoPlayerCombatSimulation({ worldSeed: 5 });
    const claimEvent = detectIncomingEnergyOrb(claimHarness);
    const claimVictimId = claimHarness.playerIds[1];
    const claim = deserializeAugmentImpactClaim(
        serializeAugmentImpactClaim(
            createAugmentImpactClaim({
                ...claimEvent,
                authorityTick: claimHarness.simulation.getTick(),
                knockback: claimEvent.knockback
                    ? {
                          ...claimEvent.knockback,
                          duration: claimEvent.knockback.durationSeconds
                      }
                    : undefined
            })
        )
    );
    const serverSession = new AuthorityServerSession({ simulation: claimHarness.simulation });
    const firstReceipt = serverSession.submitAugmentImpact(claimVictimId, claim);
    const duplicateReceipt = serverSession.submitAugmentImpact(claimVictimId, claim);
    assert(firstReceipt.accepted, "server must accept an authenticated victim spell claim");
    assert(firstReceipt === duplicateReceipt, "duplicate victim claim must return the same receipt once");
    assert(
        nearlyEqual(claimHarness.player(claimVictimId).health, 480),
        "server must commit victim-claimed damage once"
    );

    const areaHarness = new TwoPlayerCombatSimulation({ worldSeed: 6 });
    const areaSourceId = areaHarness.playerIds[0];
    const areaSource = areaHarness.player(areaSourceId);
    areaHarness.simulation.objects.enemies.clear();
    areaHarness.placePlayer(areaHarness.playerIds[1], { x: 4000, y: -900 });
    areaHarness.equipAugment(areaSourceId, SPELL_ID.METEOR);
    areaHarness.advanceTicks(
        1,
        new Map([
            [
                areaSourceId,
                areaHarness.spellCommand(areaSourceId, SPELL_SLOT_ID.POWER_ATTACK, {
                    x: areaSource.position.x,
                    y: areaSource.position.y + 1000
                })
            ]
        ])
    );
    const areaDetector = new IncomingSpellImpactDetector();
    const areaTarget = {
        id: "victim-projection",
        tick: areaHarness.simulation.getTick(),
        position: { x: areaSource.position.x + 80, y: areaSource.position.y },
        radius: 18,
        collider: { radius: 18 },
        health: 500
    };
    areaDetector.observe(areaTarget, [areaHarness.simulation.playerState(areaSourceId)], {
        targets: [areaTarget],
        surfaces: areaHarness.simulation.activeCollisionSurfaces
    });
    const areaImpacts = [];
    for (let snapshotIndex = 0; snapshotIndex < 5; snapshotIndex += 1) {
        areaHarness.advanceTicks(6);
        areaImpacts.push(
            ...areaDetector.observe(
                { ...areaTarget, tick: areaHarness.simulation.getTick() },
                [areaHarness.simulation.playerState(areaSourceId)],
                { targets: [areaTarget], surfaces: areaHarness.simulation.activeCollisionSurfaces }
            )
        );
    }
    assert(
        areaImpacts.some(({ effectId }) => effectId === "meteor-splash"),
        "victim detector must reuse the real projectile explosion when a remote meteor ends on terrain"
    );

    const replica = harness.convergedReplica();
    for (const source of replica.source.players) {
        const restored = replica.replica.find(({ id }) => id === source.id);
        assert(restored, `replica missing ${source.id}`);
        assert(nearlyEqual(restored.health, source.health), `${source.id} health did not converge`);
        assert(
            isDeepStrictEqual(restored.statusEffects, source.statusEffects),
            `${source.id} status effects did not converge`
        );
        assert(
            isDeepStrictEqual(restored.augmentRuntimeState, source.augmentRuntimeState),
            `${source.id} spell/experience state did not converge`
        );
    }

    const progression = new TwoPlayerCombatSimulation({ worldSeed: 2 });
    const progressionPlayerId = progression.playerIds[0];
    progression.placePlayer(progression.playerIds[1], { x: 4000, y: 4000 });
    const spawn = progression.player(progressionPlayerId).position;
    for (const [index, enemy] of progression.simulation.createEnemies().slice(0, 2).entries()) {
        enemy.setPhysicsPosition({ x: spawn.x + 110, y: spawn.y });
        enemy.health = 20;
        enemy.maxHealth = 20;
        progression.replaceEnemies([enemy]);
        progression.advanceTicks(
            40,
            new Map([
                [
                    progressionPlayerId,
                    progression.spellCommand(progressionPlayerId, SPELL_SLOT_ID.BASIC_ATTACK, enemy.position)
                ]
            ])
        );
        assert(enemy.health <= 0, `enemy ${index + 1} must be defeated by the real spell projectile`);
        progression.advanceTicks(120);
    }
    progression.advanceTicks(1);
    const experienceState = progression.player(progressionPlayerId).experience.snapshot();
    assert(experienceState.totalExperience >= 50, "two enemy defeats must award last-hit experience");
    const reward = progression.simulation.getAugmentReward(progressionPlayerId);
    assert(reward?.choices?.[0]?.id === SPELL_ID.METEOR, "first XP reward must unlock meteor");
    const selected = progression.simulation.resolveAugmentSelection(progressionPlayerId, {
        sourceId: reward.sourceId,
        augmentId: reward.choices[0].id
    });
    assert(selected.accepted, "official XP reward selection must be accepted");
    assert(
        progression.player(progressionPlayerId).augmentCombat.spellState.slots[SPELL_SLOT_ID.POWER_ATTACK] ===
            SPELL_ID.METEOR,
        "accepted XP reward must auto-equip meteor"
    );

    return Object.freeze({
        tick: replica.source.tick,
        firstHealth: harness.player(firstId).health,
        secondHealth: harness.player(secondId).health,
        secondStatuses: harness.player(secondId).statusEffects.snapshot(),
        convergedPlayers: replica.replica.length,
        experience: progression.player(progressionPlayerId).experience.snapshot(),
        unlockedSpell:
            progression.player(progressionPlayerId).augmentCombat.spellState.slots[SPELL_SLOT_ID.POWER_ATTACK]
    });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        console.log(`PASS two-player combat simulation ${JSON.stringify(simulateTwoPlayerCombat())}`);
    } catch (error) {
        console.error(`FAIL two-player combat simulation: ${error.message}`);
        process.exitCode = 1;
    }
}
