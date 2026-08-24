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

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function nearlyEqual(left, right, tolerance = 0.001) {
    return Math.abs(left - right) <= tolerance;
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
    assert(nearlyEqual(harness.player(secondId).health, 450), "energy orb must damage the other Player once");
    assert(nearlyEqual(harness.player(firstId).health, 100), "default target policy must exclude the caster");

    harness.equipAugment(firstId, SPELL_ID.METEOR);
    harness.advanceTicks(130);
    harness.advanceTicks(
        150,
        new Map([
            [firstId, harness.spellCommand(firstId, SPELL_SLOT_ID.POWER_ATTACK, harness.player(secondId).position)]
        ])
    );
    assert(harness.player(secondId).health < 350, "meteor must apply high-power damage to the other Player");
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

    const victimPrediction = new TwoPlayerCombatSimulation({ worldSeed: 4 });
    const victimEvent = detectIncomingEnergyOrb(victimPrediction);
    const predictedVictimId = victimPrediction.playerIds[1];
    assert(
        victimPrediction.simulation.applyPredictedIncomingSpellImpact(predictedVictimId, victimEvent),
        "victim client must apply incoming spell damage before a receipt"
    );
    assert(
        nearlyEqual(victimPrediction.player(predictedVictimId).health, 450),
        "victim prediction must apply 50 damage"
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
        nearlyEqual(claimHarness.player(claimVictimId).health, 450),
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
        enemy.health = 40;
        enemy.maxHealth = 40;
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
