import { Vector2 } from "../../game-kit/index.js";
import {
    updateAutomaticWeapon,
    updateEnemyProjectiles,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../combat/CombatSystems.js";
import { COMBAT_CONFIG, PLAYER_CONFIG, ROPE_CONFIG, WORLD_CONFIG } from "../config.js";
import { PlayerPhysics } from "../physics/PlayerPhysics.js";
import { FixedLengthRope } from "../rope/FixedLengthRope.js";
import { evaluateSwingDrag } from "../rope/SwingDrag.js";
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
            ropeDisabledRemaining: 0
        };
        this.enemies = this.world.enemySpawns.map((spawn) => ({
            id: this.registry.createId("enemy"),
            position: new Vector2(spawn.x, spawn.y),
            level: spawn.level,
            radius: COMBAT_CONFIG.enemyRadius,
            health: COMBAT_CONFIG.enemyHealth,
            maxHealth: COMBAT_CONFIG.enemyHealth,
            fireCooldown: COMBAT_CONFIG.enemyFireInterval
        }));
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.aimWorld = { x: 0, y: 0 };
        this.attachmentCandidate = null;
        this.wasPointerDown = false;
        this.attachBufferRemaining = 0;
        this.eventFlash = { type: "ready", age: 10 };
        this.swingDrag = null;
        this.resets = 0;
    }

    step(dt, command) {
        this.playerEntity.ropeDisabledRemaining = Math.max(0, this.playerEntity.ropeDisabledRemaining - dt);
        this.playerEntity.hitInvulnerabilityRemaining = Math.max(0, this.playerEntity.hitInvulnerabilityRemaining - dt);
        this.aimWorld = command.aimWorld;
        this.attachmentCandidate = this.findAttachment(this.aimWorld);
        if (command.pointer.down && !this.wasPointerDown) this.attachBufferRemaining = ROPE_CONFIG.attachBufferSeconds;
        if (
            command.pointer.down &&
            !this.rope.isAttached &&
            this.playerEntity.ropeDisabledRemaining <= 0 &&
            this.attachBufferRemaining > 0 &&
            this.attachmentCandidate
        ) {
            if (this.rope.attach(this.player.position, this.attachmentCandidate)) {
                this.eventFlash = { type: "attach", age: 0 };
                this.swingDrag = {
                    origin: { x: command.pointer.x, y: command.pointer.y },
                    direction: null,
                    progress: 0,
                    age: 0,
                    used: false
                };
                this.attachBufferRemaining = 0;
            }
        }
        if (command.pointer.down && this.rope.isAttached) this.updateSwingDrag(command.pointer, dt);
        if (!command.pointer.down && this.wasPointerDown && this.rope.isAttached) {
            this.rope.detach();
            this.eventFlash = { type: "release", age: 0 };
            this.swingDrag = null;
        }
        this.attachBufferRemaining = Math.max(0, this.attachBufferRemaining - dt);
        this.wasPointerDown = command.pointer.down;
        this.player.step(dt, command, this.world.surfaces, this.rope);
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
        this.eventFlash.age += dt;
        if (!this.player.position.isFinite() || this.player.position.y > WORLD_CONFIG.floorY + 780) this.resetRun();
    }

    updateSwingDrag(pointer, dt) {
        if (!this.swingDrag || this.swingDrag.used || !this.rope.anchor) return;
        this.swingDrag.age += dt;
        const evaluation = evaluateSwingDrag({
            anchor: this.rope.anchor,
            playerPosition: this.player.position,
            drag: { x: pointer.x - this.swingDrag.origin.x, y: pointer.y - this.swingDrag.origin.y },
            threshold: ROPE_CONFIG.swingDragThreshold
        });
        if (!evaluation) return;
        this.swingDrag.direction = evaluation.direction;
        this.swingDrag.progress = evaluation.progress;
        if (!evaluation.triggered || this.swingDrag.age < ROPE_CONFIG.swingDragMinHoldSeconds) return;
        this.player.addImpulse(evaluation.direction, ROPE_CONFIG.swingImpulse);
        this.swingDrag.used = true;
        this.eventFlash = { type: "swing", age: 0 };
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
        this.playerEntity.hitInvulnerabilityRemaining = 0;
        this.playerEntity.ropeDisabledRemaining = 0;
        this.enemyProjectiles = [];
        this.resets += 1;
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
            resets: this.resets,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance
        };
    }
}
