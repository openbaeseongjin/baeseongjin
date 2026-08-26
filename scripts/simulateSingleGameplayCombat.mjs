import { pathToFileURL } from "node:url";
import { InputSampler } from "../src/core/input/InputSampler.js";
import { SPELL_SLOT_COMMAND } from "../src/core/input/SpellSlotCommandInput.js";
import { createProjectileObject } from "../src/game/combat/ProjectileObject.js";
import { PROJECTILE_MOTION_KIND, PROJECTILE_TYPE } from "../src/game/combat/ProjectileDefinition.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import * as GameAppModule from "../src/game/GameApp.js";
import { LocalAuthority } from "../src/game/runtime/LocalAuthority.js";
import { PredictableProjectileStore } from "../src/game/runtime/PredictableProjectileStore.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { SPELL_ID } from "../src/game/spells/SpellDefinition.js";

const FIXED_DT = 1 / 120;
const MISSILE_DAMAGE = 20;
const PLAYER_START_HEALTH = 100;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function fakeInputSurface() {
    const document = Object.freeze({
        hidden: false,
        addEventListener() {},
        removeEventListener() {}
    });
    const target = {
        document,
        innerWidth: 1280,
        innerHeight: 720,
        addEventListener() {},
        removeEventListener() {}
    };
    const surface = {
        clientWidth: 1280,
        clientHeight: 720,
        addEventListener() {},
        removeEventListener() {},
        getBoundingClientRect: () => ({ left: 0, top: 0 })
    };
    return { target, surface };
}

function idleInput(position) {
    return Object.freeze({
        horizontal: 0,
        vertical: 0,
        interact: false,
        interactSequence: 0,
        spellCommand: Object.freeze({ commandSequence: 0, commandKey: null }),
        pointer: Object.freeze({ x: position.x, y: position.y, down: false }),
        viewport: Object.freeze({ width: 1280, height: 720 })
    });
}

function simulateOneShotPowerInput() {
    const { target, surface } = fakeInputSurface();
    const sampler = new InputSampler(target, surface);
    sampler.onPointerDown({ pointerType: "mouse", button: 0, clientX: 10, clientY: 10 });
    sampler.onKeyDown({ code: "KeyR", preventDefault() {} });
    sampler.onKeyUp({ code: "KeyR" });
    sampler.onPointerUp({ pointerType: "mouse", button: 0 });
    const issued = sampler.snapshot();
    const following = sampler.snapshot();
    assert(
        issued.spellCommand.commandKey === SPELL_SLOT_COMMAND.POWER_ATTACK,
        "R key must issue one power-attack command"
    );
    assert(following.spellCommand.commandKey === null, "consumed R input must not remain armed for a later cooldown");

    const simulation = new GameSimulation({
        worldSeed: 61,
        playerId: "single-input-player",
        debugAugmentIds: [SPELL_ID.ELECTRIC_ORB]
    });
    simulation.objects.enemies.clear();
    const authority = new LocalAuthority(simulation);
    const aim = { x: simulation.players[0].physics.position.x + 1000, y: simulation.players[0].physics.position.y };
    let castCount = 0;
    for (let tick = 0; tick < 1200; tick += 1) {
        const input = tick === 0 ? issued : sampler.snapshot();
        authority.step(FIXED_DT, createPlayerCommand(input, aim));
        castCount += authority
            .drainEvents()
            .filter(
                ({ eventType, spellId }) => eventType === "spell-cast-started" && spellId === SPELL_ID.ELECTRIC_ORB
            ).length;
    }
    assert(castCount === 1, `one R input must cast Electric Orb once across multiple cooldowns, received ${castCount}`);
    return Object.freeze({ castCount, commandSequence: issued.spellCommand.commandSequence });
}

function simulateGameAppMissileImpact() {
    const simulation = new GameSimulation({ worldSeed: 62, playerId: "single-missile-player" });
    simulation.objects.enemies.clear();
    const player = simulation.players[0];
    player.physics.setPhysicsPosition({ x: 500, y: 500 });
    player.health = PLAYER_START_HEALTH;
    const missile = createProjectileObject({
        id: "game-app-guided-missile",
        objectType: PROJECTILE_TYPE.ENEMY,
        motionKind: PROJECTILE_MOTION_KIND.HOMING,
        ownerId: "boss-06:missile-owner",
        targetId: player.id,
        position: { x: 350, y: 500 },
        velocity: { x: 480, y: 0 },
        speed: 480,
        damage: MISSILE_DAMAGE,
        radius: 26,
        lifetimeSeconds: 5,
        turnRateRadiansPerSecond: 1.75,
        visualPresetId: "boss-homing-missile"
    });
    simulation.objects.enemyProjectiles.add(missile);
    simulation.recordProjectileSpawn(missile);
    const authority = new LocalAuthority(simulation);
    const projectiles = new PredictableProjectileStore();
    const createCollisionState =
        GameAppModule.singlePlayerProjectileSimulationState ??
        ((state, owner) => ({
            enemies: state.enemies,
            bossStage: state.bossStage ?? state.bossRuntime ?? null,
            localPlayer: owner
        }));
    let impact = null;
    let receipt = null;
    for (let tick = 0; tick < 240 && !impact; tick += 1) {
        const before = authority.ownerState().position;
        authority.step(FIXED_DT, createPlayerCommand(idleInput(before), before));
        const state = authority.snapshot();
        projectiles.apply(authority.drainEvents(), state.tick, state);
        impact =
            projectiles.update(FIXED_DT, createCollisionState(state, authority.ownerState()), state.tick)[0] ?? null;
        if (impact) receipt = authority.submitImpactClaim(impact);
    }
    const collider = missile.renderSnapshot().collider;
    assert(impact?.resolution === "player-hit", "GameApp projectile state must detect the guided missile hit");
    assert(receipt?.accepted === true, "local authority must accept the guided missile impact");
    assert(player.health === PLAYER_START_HEALTH - MISSILE_DAMAGE, "guided missile must apply 20 Player damage");
    assert(collider.type === "polygon" && collider.vertices.length === 4, "guided missile must use a Rect collider");
    return Object.freeze({ impactTick: impact.clientTick, playerHealth: player.health, colliderType: collider.type });
}

export function simulateSingleGameplayCombat() {
    return Object.freeze({
        electricOrbInput: simulateOneShotPowerInput(),
        guidedMissile: simulateGameAppMissileImpact()
    });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        console.log(`PASS single gameplay combat ${JSON.stringify(simulateSingleGameplayCombat())}`);
    } catch (error) {
        console.error(`FAIL single gameplay combat: ${error.message}`);
        process.exitCode = 1;
    }
}
