import { Vector2 } from "../../game-kit/index.js";
import {
    updateAutomaticWeapon,
    updateEnemyProjectiles,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../combat/CombatSystems.js";
import { COMBAT_CONFIG, LIFE_CONFIG, PLAYER_CONFIG, ROPE_CONFIG, WORLD_CONFIG } from "../config.js";
import { enterDowned, isTeamDefeated, updateDownedPlayer } from "../life/PlayerLifeCycle.js";
import { PlayerPhysics } from "../physics/PlayerPhysics.js";
import { FixedLengthRope } from "../rope/FixedLengthRope.js";
import { evaluateSwingDrag, getSwingDragThreshold } from "../rope/SwingDrag.js";
import { WorldGenerator, closestPointOnSurface } from "../world/WorldGenerator.js";
import { EntityRegistry } from "./EntityRegistry.js";

export class GameSimulation {
    constructor() {
        this.world = new WorldGenerator(WORLD_CONFIG).generate();
        this.player = new PlayerPhysics(PLAYER_CONFIG);
        this.rope = new FixedLengthRope(ROPE_CONFIG);
        this.registry = new EntityRegistry();
        this.playerEntity = {
            id: this.registry.createId("player"),
            physics: this.player,
            weapon: {
                range: COMBAT_CONFIG.weaponRange,
                damage: COMBAT_CONFIG.weaponDamage,
                fireInterval: COMBAT_CONFIG.fireInterval,
                cooldown: 0
            },
            health: COMBAT_CONFIG.playerMaxHealth,
            maxHealth: COMBAT_CONFIG.playerMaxHealth,
            hitInvulnerabilityRemaining: 0,
            ropeDisabledRemaining: 0,
            lifeState: "active",
            downedRemaining: 0,
            reviveProgress: 0
        };
        this.players = [this.playerEntity];
        this.enemies = this.createEnemies();
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.aimWorld = { x: 0, y: 0 };
        this.attachmentCandidate = null;
        this.wasPointerDown = false;
        this.attachBufferRemaining = 0;
        this.eventFlash = { type: "ready", age: 10 };
        this.swingDrag = null;
        this.resets = 0;
        this.runState = "playing";
        this.defeatReason = null;
        this.restartRemaining = 0;
    }

    step(dt, command) {
        if (this.runState === "defeated") {
            this.restartRemaining = Math.max(0, this.restartRemaining - dt);
            this.eventFlash.age += dt;
            if (this.restartRemaining <= 0) this.resetRun();
            return;
        }
        const canControl = this.playerEntity.lifeState === "active";
        const effectiveCommand = canControl
            ? command
            : { horizontal: 0, vertical: 0, pointer: { x: 0, y: 0, down: false }, aimWorld: this.aimWorld };
        this.playerEntity.ropeDisabledRemaining = Math.max(0, this.playerEntity.ropeDisabledRemaining - dt);
        this.playerEntity.hitInvulnerabilityRemaining = Math.max(0, this.playerEntity.hitInvulnerabilityRemaining - dt);
        this.aimWorld = effectiveCommand.aimWorld;
        this.attachmentCandidate = canControl ? this.findAttachment(this.aimWorld) : null;
        if (effectiveCommand.pointer.down && !this.wasPointerDown) {
            this.attachBufferRemaining = ROPE_CONFIG.attachBufferSeconds;
        }
        if (
            effectiveCommand.pointer.down &&
            !this.rope.isAttached &&
            this.playerEntity.ropeDisabledRemaining <= 0 &&
            this.attachBufferRemaining > 0 &&
            this.attachmentCandidate
        ) {
            if (this.rope.attach(this.player.position, this.attachmentCandidate)) {
                this.eventFlash = { type: "attach", age: 0 };
                this.swingDrag = {
                    origin: { x: effectiveCommand.pointer.x, y: effectiveCommand.pointer.y },
                    direction: null,
                    progress: 0,
                    age: 0,
                    used: false
                };
                this.attachBufferRemaining = 0;
            }
        }
        if (effectiveCommand.pointer.down && this.rope.isAttached) {
            this.updateSwingDrag(effectiveCommand.pointer, effectiveCommand.viewport, dt);
        }
        if (!effectiveCommand.pointer.down && this.wasPointerDown && this.rope.isAttached) {
            this.rope.detach();
            this.eventFlash = { type: "release", age: 0 };
            this.swingDrag = null;
        }
        this.attachBufferRemaining = Math.max(0, this.attachBufferRemaining - dt);
        this.wasPointerDown = effectiveCommand.pointer.down;
        this.player.step(dt, effectiveCommand, this.world.surfaces, this.rope);
        updateAutomaticWeapon({
            owner: this.playerEntity,
            enemies: this.enemies,
            projectiles: this.projectiles,
            registry: this.registry,
            config: COMBAT_CONFIG,
            dt
        });
        updatePlayerProjectiles({ projectiles: this.projectiles, enemies: this.enemies, config: COMBAT_CONFIG, dt });
        updateEnemyWeapons({
            enemies: this.enemies,
            target: this.playerEntity,
            projectiles: this.enemyProjectiles,
            registry: this.registry,
            config: COMBAT_CONFIG,
            dt
        });
        updateEnemyProjectiles({
            projectiles: this.enemyProjectiles,
            target: this.playerEntity,
            rope: this.rope,
            config: COMBAT_CONFIG,
            dt
        });
        this.enemies = this.enemies.filter((enemy) => enemy.health > 0);
        if (this.playerEntity.health <= 0 && enterDowned(this.playerEntity, LIFE_CONFIG)) {
            this.rope.detach();
            this.swingDrag = null;
            this.eventFlash = { type: "downed", age: 0 };
        }
        updateDownedPlayer(this.playerEntity, dt);
        if (isTeamDefeated(this.players)) this.beginDefeat("health");
        this.eventFlash.age += dt;
        if (!this.player.position.isFinite() || this.player.position.y > WORLD_CONFIG.floorY + 780) {
            this.beginDefeat("fall");
        }
    }

    updateSwingDrag(pointer, viewport, dt) {
        if (!this.swingDrag || this.swingDrag.used || !this.rope.anchor) return;
        this.swingDrag.age += dt;
        const evaluation = evaluateSwingDrag({
            anchor: this.rope.anchor,
            playerPosition: this.player.position,
            drag: { x: pointer.x - this.swingDrag.origin.x, y: pointer.y - this.swingDrag.origin.y },
            threshold: getSwingDragThreshold(viewport, ROPE_CONFIG.swingDragThresholdViewportRatio)
        });
        if (!evaluation) return;
        this.swingDrag.direction = evaluation.direction;
        this.swingDrag.progress = evaluation.progress;
        if (!evaluation.triggered || this.swingDrag.age < ROPE_CONFIG.swingDragMinHoldSeconds) return;
        this.player.addImpulse(evaluation.direction, ROPE_CONFIG.swingImpulse);
        this.swingDrag.used = true;
        this.eventFlash = { type: "swing", age: 0 };
    }

    createEnemies() {
        return this.world.enemySpawns.map((spawn) => ({
            id: this.registry.createId("enemy"),
            position: new Vector2(spawn.x, spawn.y),
            level: spawn.level,
            radius: COMBAT_CONFIG.enemyRadius,
            health: COMBAT_CONFIG.enemyHealth,
            maxHealth: COMBAT_CONFIG.enemyHealth,
            fireCooldown: COMBAT_CONFIG.enemyFireInterval
        }));
    }

    findAttachment(aimPoint) {
        let best = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const surface of this.world.surfaces) {
            const point = closestPointOnSurface(aimPoint, surface);
            const playerDistance = this.player.position.distanceTo(point);
            if (playerDistance > ROPE_CONFIG.maxAttachDistance) continue;
            const aimDistance = Math.hypot(point.x - aimPoint.x, point.y - aimPoint.y);
            const score = aimDistance * 2 + playerDistance * 0.05;
            if (aimDistance <= 90 && score < bestScore) {
                best = point;
                bestScore = score;
            }
        }
        return best;
    }

    resetRun() {
        this.player.reset();
        this.rope.detach();
        this.attachBufferRemaining = 0;
        this.eventFlash = { type: "reset", age: 0 };
        this.swingDrag = null;
        this.playerEntity.health = this.playerEntity.maxHealth;
        this.playerEntity.weapon.cooldown = 0;
        this.playerEntity.hitInvulnerabilityRemaining = 0;
        this.playerEntity.ropeDisabledRemaining = 0;
        this.playerEntity.lifeState = "active";
        this.playerEntity.downedRemaining = 0;
        this.playerEntity.reviveProgress = 0;
        this.enemies = this.createEnemies();
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.runState = "playing";
        this.defeatReason = null;
        this.restartRemaining = 0;
        this.resets += 1;
    }

    beginDefeat(reason) {
        if (this.runState === "defeated") return;
        this.runState = "defeated";
        this.defeatReason = reason;
        this.restartRemaining = LIFE_CONFIG.defeatRestartDelay;
        this.rope.detach();
        this.swingDrag = null;
        this.eventFlash = { type: "defeat", age: 0 };
    }

    snapshot() {
        return {
            world: this.world,
            player: this.player,
            rope: this.rope,
            aimWorld: this.aimWorld,
            attachmentCandidate: this.attachmentCandidate,
            eventFlash: this.eventFlash,
            swingDrag: this.swingDrag,
            enemies: this.enemies,
            projectiles: this.projectiles,
            enemyProjectiles: this.enemyProjectiles,
            playerHealth: this.playerEntity.health,
            playerMaxHealth: this.playerEntity.maxHealth,
            ropeDisabledRemaining: this.playerEntity.ropeDisabledRemaining,
            playerLifeState: this.playerEntity.lifeState,
            runState: this.runState,
            defeatReason: this.defeatReason,
            restartRemaining: this.restartRemaining,
            resets: this.resets,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance
        };
    }
}
