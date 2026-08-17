import { Vector2 } from "../../game-kit/index.js";
import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";
import { selectNearestPlayer } from "./CombatTargeting.js";

export const ENEMY_BEHAVIOR_CAPABILITY = "enemy-behavior";

const simulationDispatcher = new SimulationDispatcher();
const VALID_PURSUIT_STATES = new Set(["seek", "windup", "dash", "recover"]);
const VALID_ARTILLERY_STATES = new Set(["idle", "telegraph", "cooldown"]);
const VALID_SWARM_STATES = new Set(["orbit", "dive", "recover"]);

function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

function consumeTimer(component, dt) {
    const consumed = Math.min(Math.max(0, dt), component.remainingSeconds);
    component.remainingSeconds = Math.max(0, component.remainingSeconds - consumed);
    return consumed;
}

function eligibleTargets(enemy, targets, range = Number.POSITIVE_INFINITY) {
    const insideActivation = enemy.activation
        ? targets.filter(
              ({ physics }) =>
                  physics.position.x >= enemy.activation.x &&
                  physics.position.x <= enemy.activation.x + enemy.activation.width &&
                  physics.position.y >= enemy.activation.y &&
                  physics.position.y <= enemy.activation.y + enemy.activation.height
          )
        : targets;
    return insideActivation.filter(
        (target) =>
            target.health > 0 &&
            target.lifeState === "active" &&
            enemy.position.distanceTo(target.physics.position) <= range
    );
}

function nearestTarget(enemy, targets, range) {
    return selectNearestPlayer(enemy.position, eligibleTargets(enemy, targets, range), range);
}

function clampToActivation(position, activation) {
    if (!activation) return;
    position.set(
        clamp(position.x, activation.x, activation.x + activation.width),
        clamp(position.y, activation.y, activation.y + activation.height)
    );
}

function directionBetween(from, to) {
    return new Vector2(to.x - from.x, to.y - from.y).normalize();
}

function moveInDirection(enemy, direction, distance) {
    if (!Number.isFinite(distance) || distance <= 0 || direction.length() === 0) return false;
    enemy.position.add(direction.clone().scale(distance));
    clampToActivation(enemy.position, enemy.activation);
    return true;
}

function frozenDirection(direction) {
    return Object.freeze({ x: direction.x, y: direction.y });
}

export class PursuitEnemyBehavior {
    constructor({
        state = "seek",
        remainingSeconds = 0,
        targetId = null,
        dashDirection = null,
        moveSpeed = 160,
        dashSpeed = 640,
        triggerDistance = 96,
        acquireRange = 640,
        windupSeconds = 0.25,
        dashSeconds = 0.2,
        recoverySeconds = 0.5
    } = {}) {
        this.kind = "pursuit";
        this.state = VALID_PURSUIT_STATES.has(state) ? state : "seek";
        this.remainingSeconds = Math.max(0, remainingSeconds);
        this.targetId = targetId;
        this.dashDirection = dashDirection ? new Vector2(dashDirection.x, dashDirection.y).normalize() : new Vector2();
        this.moveSpeed = moveSpeed;
        this.dashSpeed = dashSpeed;
        this.triggerDistance = triggerDistance;
        this.acquireRange = acquireRange;
        this.windupSeconds = windupSeconds;
        this.dashSeconds = dashSeconds;
        this.recoverySeconds = recoverySeconds;
    }

    advance(enemy, { targets = [], dt = 0 } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("enemy behavior dt must be finite and non-negative");
        let remainingDt = dt;
        let outcome = null;
        for (let transitions = 0; transitions < 8; transitions += 1) {
            if (this.state === "seek") {
                const target = nearestTarget(enemy, targets, this.acquireRange);
                if (!target) {
                    this.targetId = null;
                    return outcome;
                }
                this.targetId = target.id;
                const direction = directionBetween(enemy.position, target.physics.position);
                const distance = enemy.position.distanceTo(target.physics.position);
                if (distance <= this.triggerDistance) {
                    this.state = "windup";
                    this.remainingSeconds = this.windupSeconds;
                    this.dashDirection = direction;
                    outcome = Object.freeze({ type: "pursuit-windup", targetId: target.id });
                    if (remainingDt <= 0) return outcome;
                    continue;
                }
                moveInDirection(
                    enemy,
                    direction,
                    Math.min(distance - this.triggerDistance, this.moveSpeed * remainingDt)
                );
                return outcome;
            }
            if (this.state === "windup") {
                const consumed = consumeTimer(this, remainingDt);
                remainingDt -= consumed;
                if (this.remainingSeconds > 0) return outcome;
                this.state = "dash";
                this.remainingSeconds = this.dashSeconds;
                outcome = Object.freeze({
                    type: "pursuit-dash-started",
                    targetId: this.targetId,
                    direction: frozenDirection(this.dashDirection)
                });
                if (remainingDt <= 0) return outcome;
                continue;
            }
            if (this.state === "dash") {
                const consumed = consumeTimer(this, remainingDt);
                remainingDt -= consumed;
                moveInDirection(enemy, this.dashDirection, this.dashSpeed * consumed);
                if (this.remainingSeconds > 0) return outcome;
                this.state = "recover";
                this.remainingSeconds = this.recoverySeconds;
                outcome = Object.freeze({ type: "pursuit-recovery-started" });
                if (remainingDt <= 0) return outcome;
                continue;
            }
            const consumed = consumeTimer(this, remainingDt);
            remainingDt -= consumed;
            if (this.remainingSeconds > 0) return outcome;
            this.state = "seek";
            this.targetId = null;
            if (remainingDt <= 0) return outcome;
        }
        return outcome;
    }

    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: this.state,
            remainingSeconds: this.remainingSeconds,
            targetId: this.targetId,
            dashDirection: frozenDirection(this.dashDirection)
        });
    }
}

export class ShieldEnemyBehavior {
    constructor({ guardDirection = { x: 1, y: 0 }, turnSpeed = Math.PI * 1.5, guardHalfAngle = Math.PI / 3 } = {}) {
        this.kind = "shield";
        this.guardDirection = new Vector2(guardDirection.x, guardDirection.y).normalize();
        if (this.guardDirection.length() === 0) this.guardDirection.set(1, 0);
        this.turnSpeed = turnSpeed;
        this.guardHalfAngle = guardHalfAngle;
    }

    advance(enemy, { targets = [], dt = 0 } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("enemy behavior dt must be finite and non-negative");
        const target = nearestTarget(enemy, targets, Number.POSITIVE_INFINITY);
        if (!target) return null;
        const desired = directionBetween(enemy.position, target.physics.position);
        const currentAngle = Math.atan2(this.guardDirection.y, this.guardDirection.x);
        const desiredAngle = Math.atan2(desired.y, desired.x);
        const delta = Math.atan2(Math.sin(desiredAngle - currentAngle), Math.cos(desiredAngle - currentAngle));
        const nextAngle = currentAngle + clamp(delta, -this.turnSpeed * dt, this.turnSpeed * dt);
        this.guardDirection.set(Math.cos(nextAngle), Math.sin(nextAngle));
        return null;
    }

    blocksImpactFrom(enemy, sourcePosition) {
        if (!sourcePosition || !Number.isFinite(sourcePosition.x) || !Number.isFinite(sourcePosition.y)) return false;
        const sourceDirection = directionBetween(enemy.position, sourcePosition);
        if (sourceDirection.length() === 0) return false;
        return this.guardDirection.dot(sourceDirection) >= Math.cos(this.guardHalfAngle);
    }

    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: "guard",
            guardDirection: frozenDirection(this.guardDirection),
            guardHalfAngle: this.guardHalfAngle
        });
    }
}

export class ArtilleryEnemyBehavior {
    constructor({
        state = "idle",
        remainingSeconds = 0,
        targetPosition = null,
        targetId = null,
        telegraphSeconds = 0.65,
        cooldownSeconds = 1.4,
        strikeRadius = 72,
        damage = 20,
        acquireRange = 760
    } = {}) {
        this.kind = "artillery";
        this.state = VALID_ARTILLERY_STATES.has(state) ? state : "idle";
        this.remainingSeconds = Math.max(0, remainingSeconds);
        this.targetPosition = targetPosition ? { x: targetPosition.x, y: targetPosition.y } : null;
        this.targetId = targetId;
        this.telegraphSeconds = telegraphSeconds;
        this.cooldownSeconds = cooldownSeconds;
        this.strikeRadius = strikeRadius;
        this.damage = damage;
        this.acquireRange = acquireRange;
    }

    advance(enemy, { targets = [], dt = 0 } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("enemy behavior dt must be finite and non-negative");
        if (this.state === "idle") {
            const target = nearestTarget(enemy, targets, this.acquireRange);
            if (!target) return null;
            this.state = "telegraph";
            this.remainingSeconds = this.telegraphSeconds;
            this.targetId = target.id;
            this.targetPosition = { x: target.physics.position.x, y: target.physics.position.y };
            return Object.freeze({
                type: "artillery-telegraph",
                targetId: target.id,
                position: Object.freeze({ ...this.targetPosition }),
                radius: this.strikeRadius
            });
        }
        if (this.state === "telegraph") {
            consumeTimer(this, dt);
            if (this.remainingSeconds > 0) return null;
            const outcome = Object.freeze({
                type: "artillery-strike",
                targetId: this.targetId,
                position: Object.freeze({ ...this.targetPosition }),
                radius: this.strikeRadius,
                damage: this.damage
            });
            this.state = "cooldown";
            this.remainingSeconds = this.cooldownSeconds;
            return outcome;
        }
        consumeTimer(this, dt);
        if (this.remainingSeconds <= 0) {
            this.state = "idle";
            this.targetId = null;
            this.targetPosition = null;
        }
        return null;
    }

    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: this.state,
            remainingSeconds: this.remainingSeconds,
            targetId: this.targetId,
            targetPosition: this.targetPosition ? Object.freeze({ ...this.targetPosition }) : null,
            strikeRadius: this.strikeRadius
        });
    }
}

export class SupportEnemyBehavior {
    constructor({ targetId = null, range = 320, healingPerSecond = 18 } = {}) {
        this.kind = "support";
        this.targetId = targetId;
        this.range = range;
        this.healingPerSecond = healingPerSecond;
    }

    advance(enemy, { enemies = [], dt = 0 } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("enemy behavior dt must be finite and non-negative");
        const wounded = enemies
            .filter(
                (candidate) =>
                    candidate !== enemy &&
                    candidate.health > 0 &&
                    candidate.health < candidate.maxHealth &&
                    enemy.position.distanceTo(candidate.position) <= this.range
            )
            .sort((left, right) => {
                const ratioDifference = left.health / left.maxHealth - right.health / right.maxHealth;
                const distanceDifference =
                    enemy.position.distanceTo(left.position) - enemy.position.distanceTo(right.position);
                return ratioDifference || distanceDifference || left.id.localeCompare(right.id);
            })[0];
        if (!wounded) {
            const endedTargetId = this.targetId;
            this.targetId = null;
            return endedTargetId ? Object.freeze({ type: "support-link-ended", targetId: endedTargetId }) : null;
        }
        this.targetId = wounded.id;
        const previousHealth = wounded.health;
        wounded.health = Math.min(wounded.maxHealth, wounded.health + this.healingPerSecond * dt);
        return Object.freeze({
            type: "support-link",
            targetId: wounded.id,
            healing: wounded.health - previousHealth
        });
    }

    snapshot() {
        return Object.freeze({ kind: this.kind, state: this.targetId ? "link" : "idle", targetId: this.targetId });
    }
}

export class SwarmEnemyBehavior {
    constructor({
        state = "orbit",
        remainingSeconds = 0,
        diveDirection = null,
        diveSpeed = 520,
        diveSeconds = 0.24,
        recoverySeconds = 0.65,
        acquireRange = 560
    } = {}) {
        this.kind = "swarm";
        this.state = VALID_SWARM_STATES.has(state) ? state : "orbit";
        this.remainingSeconds = Math.max(0, remainingSeconds);
        this.diveDirection = diveDirection ? new Vector2(diveDirection.x, diveDirection.y).normalize() : new Vector2();
        this.diveSpeed = diveSpeed;
        this.diveSeconds = diveSeconds;
        this.recoverySeconds = recoverySeconds;
        this.acquireRange = acquireRange;
    }

    advance(enemy, { enemies = [], targets = [], dt = 0 } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("enemy behavior dt must be finite and non-negative");
        if (this.state === "orbit") {
            const target = nearestTarget(enemy, targets, this.acquireRange);
            if (!target) return null;
            const group = enemies
                .filter(
                    (candidate) =>
                        candidate.enemyType === enemy.enemyType && candidate.swarmGroupId === enemy.swarmGroupId
                )
                .sort((left, right) => left.id.localeCompare(right.id));
            const hasDiver = group.some(
                (candidate) => candidate !== enemy && candidate.enemyBehaviorSnapshot()?.state === "dive"
            );
            const firstReady = group.find((candidate) => candidate.enemyBehaviorSnapshot()?.state === "orbit");
            if (hasDiver || firstReady !== enemy) return null;
            this.state = "dive";
            this.remainingSeconds = this.diveSeconds;
            this.diveDirection = directionBetween(enemy.position, target.physics.position);
            return Object.freeze({ type: "swarm-dive-started", targetId: target.id });
        }
        if (this.state === "dive") {
            const consumed = consumeTimer(this, dt);
            moveInDirection(enemy, this.diveDirection, this.diveSpeed * consumed);
            if (this.remainingSeconds <= 0) {
                this.state = "recover";
                this.remainingSeconds = this.recoverySeconds;
                return Object.freeze({ type: "swarm-recovery-started" });
            }
            return null;
        }
        consumeTimer(this, dt);
        if (this.remainingSeconds <= 0) this.state = "orbit";
        return null;
    }

    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: this.state,
            remainingSeconds: this.remainingSeconds,
            diveDirection: frozenDirection(this.diveDirection)
        });
    }
}

export function advanceEnemyBehaviors({ enemies, targets, dt }) {
    if (!Array.isArray(enemies)) throw new Error("enemies must be an array");
    if (!Array.isArray(targets)) throw new Error("targets must be an array");
    if (!Number.isFinite(dt) || dt < 0) throw new Error("enemy behavior dt must be finite and non-negative");
    return Object.freeze(
        simulationDispatcher
            .dispatch({
                objects: enemies,
                capabilityId: ENEMY_BEHAVIOR_CAPABILITY,
                context: { enemies, targets, dt }
            })
            .filter(({ result }) => result !== null)
            .map(({ object, result }) => Object.freeze({ enemyId: object.id, outcome: result }))
    );
}
