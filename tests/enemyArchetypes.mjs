import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import {
    ENEMY_ARCHETYPE_IDS,
    createEnemyArchetype,
    enemyArchetypeDefinition
} from "../src/game/combat/EnemyArchetypeCatalog.js";
import { advanceEnemyBehaviors } from "../src/game/combat/EnemyBehaviors.js";
import { updateEnemyWeapons } from "../src/game/combat/CombatSystems.js";
import { RopeImpactAttack } from "../src/game/combat/RopeImpactAttack.js";
import { COMBAT_CONFIG } from "../src/game/config.js";
import { CircleCollider } from "../src/game/physics/colliders/CircleCollider.js";
import { EntityRegistry } from "../src/game/simulation/EntityRegistry.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { enemyBehaviorTelegraph, isDroneEnemy } from "../src/render/EnemyTelegraphPresentation.js";

function activeTarget(id, x, y) {
    return {
        id,
        physics: { position: new Vector2(x, y) },
        health: 100,
        lifeState: "active"
    };
}

function enemy(enemyType, id, x = 0, properties = {}) {
    return createEnemyArchetype({
        enemyType,
        id,
        position: new Vector2(x, 0),
        level: 1,
        activation: { x: -400, y: -200, width: 800, height: 400 },
        radius: 18,
        health: 100,
        maxHealth: 100,
        fireCooldown: 0,
        ...properties
    });
}

export function run() {
    assert.equal(new Set(ENEMY_ARCHETYPE_IDS).size, ENEMY_ARCHETYPE_IDS.length, "archetype ids must be unique");
    for (const id of ENEMY_ARCHETYPE_IDS) {
        assert.match(enemyArchetypeDefinition(id).displayName, /[가-힣]/, "player-facing enemy names must be Korean");
        assert.equal(isDroneEnemy({ enemyType: id }), true);
    }
    assert.equal(isDroneEnemy({ enemyType: "sentry-t1" }), false);
    assert.throws(() => enemyArchetypeDefinition("missing-drone"), /unknown enemy archetype/);

    const target = activeTarget("player-a", 160, 0);
    const pursuer = enemy("pursuit-drone-t1", "pursuer");
    const initialDistance = pursuer.position.distanceTo(target.physics.position);
    advanceEnemyBehaviors({ enemies: [pursuer], targets: [target], dt: 0.25 });
    assert.ok(
        pursuer.position.distanceTo(target.physics.position) < initialDistance,
        "the pursuit archetype must react to a player position instead of following an authored patrol route"
    );
    target.physics.position.set(pursuer.position.x + 40, pursuer.position.y);
    advanceEnemyBehaviors({ enemies: [pursuer], targets: [target], dt: 0 });
    assert.equal(pursuer.enemyBehaviorSnapshot().state, "windup", "pursuit must telegraph before its dash");
    assert.equal(enemyBehaviorTelegraph(pursuer).kind, "line");
    pursuer.behavior.remainingSeconds = 0;
    advanceEnemyBehaviors({ enemies: [pursuer], targets: [target], dt: 0 });
    assert.equal(pursuer.enemyBehaviorSnapshot().state, "dash", "pursuit must enter a committed dash state");
    pursuer.behavior.remainingSeconds = 0;
    advanceEnemyBehaviors({ enemies: [pursuer], targets: [target], dt: 0 });
    assert.equal(pursuer.enemyBehaviorSnapshot().state, "recover", "pursuit must expose post-dash recovery");

    const shield = enemy("shield-drone-t1", "shield");
    advanceEnemyBehaviors({ enemies: [shield], targets: [activeTarget("front", 200, 0)], dt: 1 });
    assert.equal(shield.blocksImpactFrom(new Vector2(200, 0)), true, "front impacts must meet the guard");
    assert.equal(shield.blocksImpactFrom(new Vector2(-200, 0)), false, "rear impacts must bypass the guard");
    assert.equal(enemyBehaviorTelegraph(shield).kind, "arc");
    const ropeImpact = new RopeImpactAttack({ minimumSpeed: 100, damage: 25 });
    const impactOwner = {
        id: "impact-owner",
        physics: {
            position: new Vector2(20, 0),
            velocity: new Vector2(-200, 0),
            collider: new CircleCollider({ radius: 15 })
        },
        ropeObject: { rope: { isAttached: true } }
    };
    assert.deepEqual(
        ropeImpact.advance(impactOwner, [shield], 1),
        [],
        "a frontal rope impact must be blocked before a prediction or claim is created"
    );
    ropeImpact.reset();
    impactOwner.physics.position.set(-20, 0);
    impactOwner.physics.velocity.set(200, 0);
    assert.equal(ropeImpact.advance(impactOwner, [shield], 2).length, 1, "a rear rope impact must remain eligible");

    const artillery = enemy("artillery-drone-t1", "artillery");
    advanceEnemyBehaviors({ enemies: [artillery], targets: [target], dt: 0 });
    assert.equal(artillery.enemyBehaviorSnapshot().state, "telegraph");
    assert.deepEqual(artillery.enemyBehaviorSnapshot().targetPosition, {
        x: target.physics.position.x,
        y: target.physics.position.y
    });
    assert.equal(enemyBehaviorTelegraph(artillery).kind, "area");
    artillery.behavior.remainingSeconds = 0;
    const strike = advanceEnemyBehaviors({ enemies: [artillery], targets: [target], dt: 0 });
    assert.equal(strike[0].outcome.type, "artillery-strike");

    const wounded = enemy("pursuit-drone-t1", "wounded", 80, { health: 40 });
    const support = enemy("support-drone-t1", "support");
    advanceEnemyBehaviors({ enemies: [support, wounded], targets: [], dt: 0.5 });
    assert.equal(support.enemyBehaviorSnapshot().targetId, wounded.id);
    assert.equal(enemyBehaviorTelegraph(support, [support, wounded]).kind, "line");
    assert.ok(wounded.health > 40 && wounded.health <= wounded.maxHealth, "support must help a wounded ally");
    wounded.health = 0;
    advanceEnemyBehaviors({ enemies: [support], targets: [], dt: 0.1 });
    assert.equal(support.enemyBehaviorSnapshot().targetId, null, "support links must clear with a missing target");

    const swarmA = enemy("swarm-drone-t1", "swarm-a", -20, { swarmGroupId: "swarm-1" });
    const swarmB = enemy("swarm-drone-t1", "swarm-b", 20, { swarmGroupId: "swarm-1" });
    advanceEnemyBehaviors({ enemies: [swarmB, swarmA], targets: [target], dt: 0 });
    const swarmStates = [swarmA, swarmB].map((value) => value.enemyBehaviorSnapshot().state);
    assert.equal(
        swarmStates.filter((state) => state === "dive").length,
        1,
        "a swarm group must schedule one deterministic dive instead of dogpiling simultaneously"
    );
    assert.equal(swarmA.enemyBehaviorSnapshot().state, "dive", "stable entity id must break a ready-swarm tie");
    assert.equal(enemyBehaviorTelegraph(swarmA).kind, "line");
    for (let step = 0; step < 480; step += 1) {
        advanceEnemyBehaviors({ enemies: [swarmA, swarmB], targets: [target], dt: 1 / 120 });
        for (const member of [swarmA, swarmB]) {
            assert.ok(Number.isFinite(member.position.x) && Number.isFinite(member.position.y));
            assert.ok(["orbit", "dive", "recover"].includes(member.enemyBehaviorSnapshot().state));
        }
    }

    for (const enemyType of ENEMY_ARCHETYPE_IDS) {
        const instance = enemy(enemyType, `probe-${enemyType}`);
        const definition = enemyArchetypeDefinition(enemyType);
        assert.equal(instance.displayName, definition.displayName);
        assert.equal(instance.hasSimulationCapability("enemy-behavior"), true);
        assert.equal(instance.rules.includes("no-projectile-attack"), !definition.usesProjectileAttack);
        const restored = enemy(enemyType, `restored-${enemyType}`, 0, {
            behaviorState: instance.enemyBehaviorSnapshot()
        });
        assert.deepEqual(
            restored.enemyBehaviorSnapshot(),
            instance.enemyBehaviorSnapshot(),
            "behavior state must survive a snapshot reconstruction boundary"
        );

        const projectiles = [];
        const registry = new EntityRegistry();
        for (const dt of [
            0,
            COMBAT_CONFIG.enemyAcquireSeconds,
            COMBAT_CONFIG.enemyTrackSeconds,
            COMBAT_CONFIG.enemyLockSeconds
        ]) {
            updateEnemyWeapons({
                enemies: [instance],
                targets: [activeTarget(`target-${enemyType}`, 100, 0)],
                projectiles,
                registry,
                config: COMBAT_CONFIG,
                dt
            });
        }
        assert.equal(
            projectiles.length > 0,
            definition.usesProjectileAttack,
            "archetype definitions must explicitly opt into the shared projectile attack"
        );
    }

    const simulation = new GameSimulation();
    const artilleryRuntime = enemy("artillery-drone-t1", "artillery-runtime", 0);
    simulation.enemies = [artilleryRuntime];
    simulation.players[0].physics.position.set(120, 0);
    const serverStepOptions = {
        advanceInputDrivenObjects: false,
        recoverPlayerFalls: false,
        resolveCheckpointProgress: false,
        resolveSummitProgress: false,
        resolvePlayerProjectileHits: false,
        spawnPlayerProjectiles: false,
        recoverPlayerDeaths: false,
        resolveInteractChoice: false
    };
    simulation.stepPlayers(1 / 120, new Map(), serverStepOptions);
    artilleryRuntime.behavior.remainingSeconds = 0;
    simulation.stepPlayers(1 / 120, new Map(), serverStepOptions);
    assert.equal(simulation.enemyProjectiles.length, 1, "an artillery strike must use the neutral projectile path");
    assert.equal(simulation.enemyProjectiles[0].targetId, simulation.players[0].id);
    assert.equal(
        simulation.enemyProjectiles[0].velocity.length(),
        0,
        "the strike zone must remain at its telegraphed point"
    );

    const replicatedState = simulation.enemyStates()[0];
    assert.equal(replicatedState.displayName, "포격 드론");
    assert.equal(replicatedState.behaviorState.kind, "artillery");
    const prediction = new GameSimulation();
    prediction.preparePrediction([replicatedState]);
    assert.equal(prediction.enemies[0].hasSimulationCapability("enemy-behavior"), true);
    assert.deepEqual(prediction.enemies[0].enemyBehaviorSnapshot(), replicatedState.behaviorState);
}
