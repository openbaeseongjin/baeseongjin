import {
    CompositeBossEncounterRuntime,
    compositeWorldPoint,
    freezeComposite
} from "./CompositeBossEncounterRuntime.js";
import { KinematicPhysicsBody } from "../physics/KinematicPhysicsBody.js";
import { PHYSICS_ACTOR_KIND } from "../physics/PlayerPhysicsDefinition.js";
import { PolygonCollider } from "../physics/colliders/PolygonCollider.js";
import { bossBodyPolygonVertices } from "./BossBodyPolygon.js";
import { CombatStatusEffectPool } from "../status-effects/CombatStatusEffectPool.js";
import { BossStatePool, BOSS_STATE_LANE } from "./BossStatePool.js";
import { createLowerSectorCommanderStateCatalog } from "./LowerSectorCommanderStateCatalog.js";
import { CommanderLocomotion } from "./CommanderLocomotion.js";
import {
    LOWER_SECTOR_COMMANDER_ACTION_PHASE as ACTION_PHASE,
    LOWER_SECTOR_COMMANDER_HAZARD as HAZARD,
    LOWER_SECTOR_COMMANDER_ID as ID,
    LOWER_SECTOR_COMMANDER_OBJECT_KIND as OBJECT_KIND,
    LOWER_SECTOR_COMMANDER_STATE as STATE
} from "./LowerSectorCommanderDefinition.js";

const PLAYER_RADIUS = 15;
const OPENING_DIALOGUE = Object.freeze([
    Object.freeze({ speakerId: "lower-sector-system", text: "LOWER-SECTOR TRANSFER / RETURN PROTOCOL ACTIVE" }),
    Object.freeze({ speakerId: "local-player", text: "…아직도 아래로 돌려보내고 있네." })
]);
const VICTORY_TEXT = "LOWER-SECTOR TRANSFER / RETURN PROTOCOL OFFLINE";
const VICTORY_SECONDS = 1.5;
const HAZARD_SEQUENCE_LIMIT = 64;

function positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function positiveArray(value, fallback) {
    return Array.isArray(value) && value.length === fallback.length && value.every((entry) => positive(entry, 0))
        ? Object.freeze([...value])
        : fallback;
}

function nearestTarget(players, position) {
    return (
        [...(players ?? [])]
            .filter(
                ({ id, position: target }) =>
                    typeof id === "string" && Number.isFinite(target?.x) && Number.isFinite(target?.y)
            )
            .sort((left, right) => {
                const leftDistance = Math.hypot(left.position.x - position.x, left.position.y - position.y);
                const rightDistance = Math.hypot(right.position.x - position.x, right.position.y - position.y);
                return leftDistance - rightDistance || left.id.localeCompare(right.id, "en");
            })[0] ?? null
    );
}

export class LowerSectorCommanderRuntime extends CompositeBossEncounterRuntime {
    constructor(definition, snapshot = null, { worldSeed = 1 } = {}) {
        super(definition);
        this.worldSeed = worldSeed;
        this.config = this.#configuration();
        this.stateCatalog = createLowerSectorCommanderStateCatalog();
        this.statePool = new BossStatePool({ catalog: this.stateCatalog, worldSeed, attempt: this.attempt });
        this.scaledHealth = null;
        this.health = 0;
        this.state = STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = 0;
        this.facing = 1;
        this.targetPlayerId = null;
        this.targetPosition = null;
        this.hazardSequence = 0;
        this.grabCooldownRemaining = 0;
        this.grabCapturedPlayerId = null;
        this.grabStage = "idle";
        this.chargeDistanceRemaining = 0;
        this.victoryRemaining = 0;
        this.statusEffects = new CombatStatusEffectPool();
        this.body = new KinematicPhysicsBody({
            id: ID.BODY,
            actorKind: PHYSICS_ACTOR_KIND.BOSS,
            position: definition.arena.boss.position,
            collider: new PolygonCollider({
                vertices: bossBodyPolygonVertices(definition.arena.boss.visualPresetId, {
                    width: this.config.bodyWidth,
                    height: this.config.bodyHeight
                })
            }),
            canGroundActors: false,
            ropeable: false
        });
        this.locomotion = new CommanderLocomotion({
            body: this.body,
            acceleration: this.config.acceleration,
            deceleration: this.config.deceleration,
            floorBounds: this.config.mainBounds,
            bodyWidth: this.config.bodyWidth
        });
        this.resetAttempt({ preserveCompleted: false });
        if (snapshot) this.restore(snapshot);
    }

    #configuration() {
        const parameters = this.definition.arena.mechanics?.[0]?.parameters ?? {};
        const main = this.definition.arena.surfaces.find(({ kind }) => kind === "commander-main-runway");
        return freezeComposite({
            mainBounds: main.bounds,
            bodyWidth: positive(this.definition.arena.boss.collider?.width, 128),
            bodyHeight: positive(this.definition.arena.boss.collider?.height, 192),
            acceleration: positive(parameters.acceleration, 600),
            deceleration: positive(parameters.deceleration, 900),
            walkSpeeds: positiveArray(parameters.walkSpeeds, Object.freeze([180, 220, 260])),
            intensityHealthRatios: positiveArray(parameters.intensityHealthRatios, Object.freeze([0.7, 0.35])),
            recoverySeconds: positiveArray(parameters.recoverySeconds, Object.freeze([1, 0.8, 0.6])),
            grabRange: positive(parameters.grabRange, 450),
            grabLeadSeconds: positive(parameters.grabLeadSeconds, 0.25),
            grabTelegraphSeconds: positive(parameters.grabTelegraphSeconds, 1.5),
            grabTimeoutSeconds: positive(parameters.grabTimeoutSeconds, 0.5),
            grabDamage: positive(parameters.grabDamage, 20),
            grabHoldSeconds: positive(parameters.grabHoldSeconds, 2),
            grabHammerDamage: positive(parameters.grabHammerDamage, 40),
            grabCooldownSeconds: positive(parameters.grabCooldownSeconds, 15),
            captureCliffMargin: positive(parameters.captureCliffMargin, 120),
            captureFrontGap: positive(parameters.captureFrontGap, 50),
            hammerRange: positive(parameters.hammerRange, 260),
            hammerHeight: positive(parameters.hammerHeight, 240),
            hammerTelegraphSeconds: positive(parameters.hammerTelegraphSeconds, 0.8),
            hammerActiveSeconds: positive(parameters.hammerActiveSeconds, 0.2),
            hammerDamage: positive(parameters.hammerDamage, 25),
            chargeDistance: positive(parameters.chargeDistance, 420),
            chargeSpeed: positive(parameters.chargeSpeed, 700),
            chargeTelegraphSeconds: positive(parameters.chargeTelegraphSeconds, 0.8),
            chargeActiveSeconds: positive(parameters.chargeActiveSeconds, 0.6),
            chargeDamage: positive(parameters.chargeDamage, 20),
            chargeKnockback: positive(parameters.chargeKnockback, 260)
        });
    }

    start({ participantIds }) {
        const outcome = super.start({ participantIds });
        if (outcome.accepted) this.emit("boss-dialogue", { channel: "player-bark", lines: OPENING_DIALOGUE });
        return outcome;
    }

    resetAttempt({ preserveCompleted }) {
        const completed = preserveCompleted && this.status === "completed";
        const rosterCount = Math.max(1, this.scalingRoster.length || 1);
        this.scaledHealth = this.definition.scaledHealth(rosterCount);
        this.health = completed ? 0 : this.scaledHealth.maxHealth;
        this.state = completed ? STATE.DEFEATED : STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = 0;
        this.targetPlayerId = null;
        this.targetPosition = null;
        this.hazardSequence = 0;
        this.grabCooldownRemaining = 0;
        this.grabCapturedPlayerId = null;
        this.grabStage = "idle";
        this.chargeDistanceRemaining = 0;
        this.victoryRemaining = completed ? 0 : this.victoryRemaining;
        this.statusEffects.reset();
        this.body?.setPhysicsPosition(this.definition.arena.boss.position);
        this.body?.setPhysicsVelocity({ x: 0, y: 0 });
        if (this.locomotion) this.locomotion.distance = 0;
        this.statePool?.resetAttempt({ attempt: this.attempt });
    }

    maximumHealth() {
        return this.scaledHealth?.maxHealth ?? 0;
    }

    totalHealth() {
        return this.health;
    }

    #intensityIndex() {
        const ratio = this.maximumHealth() > 0 ? this.health / this.maximumHealth() : 0;
        if (ratio > this.config.intensityHealthRatios[0]) return 0;
        if (ratio > this.config.intensityHealthRatios[1]) return 1;
        return 2;
    }

    #recoverySeconds() {
        return this.config.recoverySeconds[this.#intensityIndex()];
    }

    #walkSpeed() {
        return this.config.walkSpeeds[this.#intensityIndex()];
    }

    #bodyBoundaryDistance(target) {
        if (!target) return Number.POSITIVE_INFINITY;
        const edge = this.body.collider.outsidePointToward(this.body.position, target.position);
        return Math.hypot(target.position.x - edge.x, target.position.y - edge.y);
    }

    #faceTarget(target) {
        const delta = target.position.x - this.body.position.x;
        if (delta !== 0) this.facing = Math.sign(delta);
        this.targetPlayerId = target.id;
        this.targetPosition = { ...target.position };
    }

    #capturePosition(facing = this.facing) {
        const edge = this.body.collider.outsidePointToward(
            this.body.position,
            { x: this.body.position.x + facing, y: this.body.position.y },
            this.config.captureFrontGap + PLAYER_RADIUS
        );
        return { x: edge.x, y: this.config.mainBounds.y - PLAYER_RADIUS };
    }

    #safeCapturePosition(facing = this.facing) {
        const position = this.#capturePosition(facing);
        const minimumX = this.config.mainBounds.x + this.config.captureCliffMargin;
        const maximumX = this.config.mainBounds.x + this.config.mainBounds.width - this.config.captureCliffMargin;
        return position.x >= minimumX && position.x <= maximumX ? position : null;
    }

    canGrab(target) {
        const facing = target ? Math.sign(target.position.x - this.body.position.x) || this.facing : this.facing;
        return Boolean(
            target &&
            this.grabCooldownRemaining <= 0 &&
            this.#bodyBoundaryDistance(target) <= this.config.grabRange &&
            this.#safeCapturePosition(facing)
        );
    }

    canHammer(target) {
        return Boolean(target && this.#bodyBoundaryDistance(target) <= this.config.hammerRange);
    }

    canCharge(target) {
        const distance = this.#bodyBoundaryDistance(target);
        return Boolean(target && distance > this.config.hammerRange && distance <= this.config.chargeDistance);
    }

    #beginAttack(state, target, telegraphSeconds) {
        this.#faceTarget(target);
        this.state = state;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = telegraphSeconds;
        this.locomotion.stop();
        this.emit("boss-attack-telegraphed", { kind: state, targetPlayerId: target.id, direction: this.facing });
    }

    beginGrab(target) {
        this.#beginAttack(STATE.GRAB, target, this.config.grabLeadSeconds);
        this.grabStage = "lead";
    }

    beginHammer(target) {
        this.#beginAttack(STATE.HAMMER, target, this.config.hammerTelegraphSeconds);
    }

    beginCharge(target) {
        this.#beginAttack(STATE.CHARGE, target, this.config.chargeTelegraphSeconds);
        this.chargeDistanceRemaining = this.config.chargeDistance;
    }

    #activateHazard(kind, seconds) {
        this.actionPhase = ACTION_PHASE.ACTIVE;
        this.timer = seconds;
        this.hazardSequence += 1;
        this.emit("boss-attack-started", { kind, sequence: this.hazardSequence, targetPlayerId: this.targetPlayerId });
    }

    #finishAttack() {
        this.state = STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = this.#recoverySeconds();
        this.targetPlayerId = null;
        this.targetPosition = null;
        this.grabCapturedPlayerId = null;
        this.grabStage = "idle";
        this.chargeDistanceRemaining = 0;
        this.locomotion.stop();
    }

    advanceGrab(dt, target) {
        if (target?.id === this.targetPlayerId) this.targetPosition = { ...target.position };
        this.timer = Math.max(0, this.timer - dt);
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH && this.grabStage === "lead" && this.timer <= 0) {
            this.grabStage = "telegraph";
            this.timer = this.config.grabTelegraphSeconds;
            return;
        }
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH && this.grabStage === "telegraph" && this.timer <= 0) {
            this.grabStage = "search";
            this.#activateHazard(HAZARD.GRAB, this.config.grabTimeoutSeconds);
            return;
        }
        if (this.actionPhase !== ACTION_PHASE.ACTIVE || this.timer > 0) return;
        if (this.grabStage === "captured") {
            this.grabStage = "hammer";
            this.#activateHazard(HAZARD.HAMMER, this.config.hammerActiveSeconds);
            return;
        }
        if (this.grabStage === "hammer") {
            this.grabCooldownRemaining = this.config.grabCooldownSeconds;
            this.#finishAttack();
            return;
        }
        this.grabCooldownRemaining = this.config.grabCooldownSeconds;
        this.#finishAttack();
    }

    advanceHammer(dt) {
        this.timer = Math.max(0, this.timer - dt);
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH && this.timer <= 0) {
            this.#activateHazard(HAZARD.HAMMER, this.config.hammerActiveSeconds);
        } else if (this.actionPhase === ACTION_PHASE.ACTIVE && this.timer <= 0) this.#finishAttack();
    }

    advanceCharge(dt) {
        this.timer = Math.max(0, this.timer - dt);
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH && this.timer <= 0) {
            this.#activateHazard(HAZARD.CHARGE, this.config.chargeActiveSeconds);
            return;
        }
        if (this.actionPhase !== ACTION_PHASE.ACTIVE) return;
        const previousX = this.body.position.x;
        this.locomotion.moveAtVelocity(this.facing * this.config.chargeSpeed, dt);
        this.chargeDistanceRemaining -= Math.abs(this.body.position.x - previousX);
        if (this.timer <= 0 || this.chargeDistanceRemaining <= 0) this.#finishAttack();
    }

    cancelTargetCapture(playerId) {
        if (this.targetPlayerId !== playerId || this.state !== STATE.GRAB) return false;
        this.grabCooldownRemaining = this.config.grabCooldownSeconds;
        this.#finishAttack();
        return true;
    }

    #advanceNeutral(dt, target, { canSelectAttack = true } = {}) {
        if (this.timer > 0) {
            this.timer = Math.max(0, this.timer - dt);
            return;
        }
        const selection = canSelectAttack
            ? this.statePool.select({
                  lane: BOSS_STATE_LANE.ATTACK,
                  context: { runtime: this, target }
              })
            : null;
        if (selection) {
            this.statePool.enter(selection.id, { runtime: this, target });
            return;
        }
        if (target) {
            this.state = STATE.WALK;
            this.#faceTarget(target);
            this.locomotion.advanceToward(target.position.x, dt, this.#walkSpeed(), this.config.hammerRange * 0.8);
            return;
        }
        this.state = STATE.NEUTRAL;
        this.locomotion.stop();
    }

    #advanceVictory(dt) {
        this.victoryRemaining = Math.max(0, this.victoryRemaining - dt);
        if (this.victoryRemaining > 0) return;
        this.status = "completed";
        this.emit("boss-encounter-completed", { targetId: ID.BODY });
    }

    advance(dt, context = {}) {
        if (this.status !== "active") return freezeComposite({ accepted: false, changed: false });
        if (this.state === STATE.DEFEATED) {
            this.#advanceVictory(dt);
            return freezeComposite({ accepted: true, changed: true });
        }
        this.grabCooldownRemaining = Math.max(0, this.grabCooldownRemaining - dt);
        for (const outcome of this.statusEffects.advance(dt)) {
            if (outcome.type === "damage") this.health = Math.max(0, this.health - outcome.damage);
        }
        if (!this.statusEffects.canAct()) {
            if (this.state === STATE.GRAB) this.cancelTargetCapture(this.targetPlayerId);
            this.locomotion.stop();
            return freezeComposite({ accepted: true, changed: true });
        }
        const target = this.targetPlayerId
            ? (context.players?.find(({ id }) => id === this.targetPlayerId) ?? null)
            : context.canSelectTarget !== false
              ? nearestTarget(context.players, this.body.position)
              : null;
        if (this.stateCatalog[this.state]) this.statePool.advance(this.state, { runtime: this, dt, target });
        else this.#advanceNeutral(dt, target, { canSelectAttack: context.canSelectTarget !== false });
        return freezeComposite({ accepted: true, changed: true });
    }

    #hazardBounds(width, height) {
        const edge = this.body.collider.outsidePointToward(this.body.position, {
            x: this.body.position.x + this.facing,
            y: this.body.position.y
        });
        return freezeComposite({
            x: this.facing > 0 ? edge.x : edge.x - width,
            y: this.config.mainBounds.y - height,
            width,
            height
        });
    }

    activeHazards(worldOffset = { x: 0, y: 0 }) {
        if (this.status !== "active" || this.actionPhase !== ACTION_PHASE.ACTIVE) return Object.freeze([]);
        const common = {
            id: ID.ATTACK_HAZARD(this.hazardSequence),
            sequence: this.hazardSequence,
            direction: this.facing
        };
        if (this.state === STATE.GRAB && !this.grabCapturedPlayerId) {
            return Object.freeze([
                freezeComposite({
                    ...common,
                    kind: HAZARD.GRAB,
                    damage: this.config.grabDamage,
                    targetPlayerId: this.targetPlayerId,
                    position: compositeWorldPoint(this.body.position, worldOffset),
                    radius: this.config.grabRange,
                    capture: {
                        interactionId: ID.CAPTURE_INTERACTION(this.attempt, this.hazardSequence, this.targetPlayerId),
                        definitionId: ID.CAPTURE_DEFINITION,
                        sourceActorId: ID.BODY,
                        targetPosition: compositeWorldPoint(this.#capturePosition(), worldOffset)
                    }
                })
            ]);
        }
        if (this.state === STATE.GRAB && this.grabCapturedPlayerId && this.grabStage === "hammer") {
            return Object.freeze([
                freezeComposite({
                    ...common,
                    kind: HAZARD.HAMMER,
                    damage: this.config.grabHammerDamage,
                    targetPlayerId: this.grabCapturedPlayerId,
                    automaticTarget: true
                })
            ]);
        }
        if (this.state === STATE.HAMMER) {
            const localBounds = this.#hazardBounds(this.config.hammerRange, this.config.hammerHeight);
            return Object.freeze([
                freezeComposite({
                    ...common,
                    kind: HAZARD.HAMMER,
                    damage: this.config.hammerDamage,
                    bounds: {
                        ...localBounds,
                        x: localBounds.x + worldOffset.x,
                        y: localBounds.y + worldOffset.y
                    }
                })
            ]);
        }
        if (this.state === STATE.CHARGE) {
            return Object.freeze([
                freezeComposite({
                    ...common,
                    kind: HAZARD.CHARGE,
                    damage: this.config.chargeDamage,
                    knockback: this.config.chargeKnockback,
                    position: compositeWorldPoint(this.body.position, worldOffset),
                    collider: this.body.collider.snapshot()
                })
            ]);
        }
        return Object.freeze([]);
    }

    applyHazardContact({ contactId, playerId, damage }) {
        const outcome = super.applyHazardContact({ contactId, playerId, damage });
        if (!outcome.changed || this.state !== STATE.GRAB) return outcome;
        if (!this.grabCapturedPlayerId) {
            this.grabCapturedPlayerId = playerId;
            this.grabStage = "captured";
            this.timer = this.config.grabHoldSeconds;
            return outcome;
        }
        if (this.grabCapturedPlayerId === playerId) {
            this.grabCooldownRemaining = this.config.grabCooldownSeconds;
            this.#finishAttack();
        }
        return outcome;
    }

    captureInteraction(playerId, worldOffset = { x: 0, y: 0 }) {
        if (this.state !== STATE.GRAB || this.targetPlayerId !== playerId) return null;
        return freezeComposite({
            interactionId: ID.CAPTURE_INTERACTION(this.attempt, this.hazardSequence, playerId),
            definitionId: ID.CAPTURE_DEFINITION,
            sourceActorId: ID.BODY,
            targetActorId: playerId,
            targetPosition: compositeWorldPoint(this.#capturePosition(), worldOffset)
        });
    }

    hazardImpulse(kind) {
        return kind === HAZARD.CHARGE
            ? freezeComposite({ direction: { x: this.facing, y: 0 }, magnitude: this.config.chargeKnockback })
            : null;
    }

    applyImpact({ impactId, sourcePlayerId = null, baseDamage, targetId = null }) {
        if (this.status !== "active" || this.state === STATE.DEFEATED) {
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "encounter-not-active",
                appliedDamage: 0
            });
        }
        if (sourcePlayerId && this.participants.get(sourcePlayerId) !== "active") {
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "participant-not-active",
                appliedDamage: 0
            });
        }
        if (typeof impactId !== "string" || !Number.isFinite(baseDamage) || baseDamage < 0) {
            throw new Error("Boss03 impact is invalid");
        }
        if (this.processedImpactIds.has(impactId)) {
            return freezeComposite({
                accepted: true,
                changed: false,
                reason: "impact-already-processed",
                appliedDamage: 0
            });
        }
        this.processedImpactIds.add(impactId);
        if (targetId !== ID.BODY) {
            return freezeComposite({ accepted: true, changed: false, reason: "target-mismatch", appliedDamage: 0 });
        }
        const appliedDamage = Math.min(this.health, baseDamage);
        this.health -= appliedDamage;
        if (appliedDamage > 0)
            this.emit("boss-damaged", {
                impactId,
                sourcePlayerId,
                targetId,
                damage: appliedDamage,
                health: this.health
            });
        const completed = this.health <= 0;
        if (completed) {
            this.state = STATE.DEFEATED;
            this.actionPhase = ACTION_PHASE.RECOVERY;
            this.targetPlayerId = null;
            this.victoryRemaining = VICTORY_SECONDS;
            this.locomotion.stop();
            this.emit("boss-dialogue", {
                channel: "player-bark",
                lines: Object.freeze([Object.freeze({ speakerId: "lower-sector-system", text: VICTORY_TEXT })])
            });
        }
        return freezeComposite({
            accepted: true,
            changed: appliedDamage > 0,
            appliedDamage,
            normalDamage: appliedDamage,
            weakpointHit: false,
            completed: false,
            defeated: completed
        });
    }

    applyDamage({ sourcePlayerId = null, damage, impactId = null, targetId = ID.BODY }) {
        return this.applyImpact({
            impactId: impactId ?? `${this.definition.id}:impact:${this.eventSequence + 1}`,
            sourcePlayerId,
            baseDamage: damage,
            targetId
        });
    }

    impactTargetSnapshot(targetId, worldOffset = { x: 0, y: 0 }) {
        return freezeComposite({
            id: targetId,
            impactTargetKind: "boss",
            active: this.status === "active" && this.state !== STATE.DEFEATED && targetId === ID.BODY,
            position: compositeWorldPoint(this.body.position, worldOffset),
            health: this.health,
            maxHealth: this.maximumHealth(),
            phase: 1,
            phaseCount: 1,
            phaseFloor: 0,
            phaseMaxHealth: this.maximumHealth(),
            weakpointExposed: false,
            normalDamageMultiplier: 1,
            weakpointDamageRatio: 0,
            blocksFrontImpact: false,
            direction: this.facing,
            collider: this.body.collider.snapshot()
        });
    }

    collisionActors(worldOffset = { x: 0, y: 0 }) {
        if (this.state === STATE.DEFEATED) return Object.freeze([]);
        return Object.freeze([this.body.collisionActor(worldOffset)]);
    }

    ropeAttachmentActors() {
        return Object.freeze([]);
    }

    recoverPlayer() {
        return null;
    }

    respawnPosition(worldOffset = { x: 0, y: 0 }) {
        return compositeWorldPoint(this.definition.arena.entry, worldOffset);
    }

    victoryRecoveryPosition(worldOffset = { x: 0, y: 0 }) {
        return compositeWorldPoint(this.definition.arena.exit, worldOffset);
    }

    presentationObjects(worldOffset = { x: 0, y: 0 }) {
        const objects = [
            {
                id: ID.BODY,
                kind: OBJECT_KIND.BODY,
                variant: this.definition.arena.boss.visualPresetId,
                position: compositeWorldPoint(this.body.position, worldOffset),
                size: { width: this.config.bodyWidth, height: this.config.bodyHeight },
                state: this.state,
                actionState: this.actionPhase,
                remainingSeconds: this.timer,
                movementProgress: this.locomotion.distance,
                direction: this.facing,
                physicsBody: this.state !== STATE.DEFEATED,
                ropeAttachable: false,
                active: true,
                targetPlayerId: this.targetPlayerId,
                defeatProgress: this.state === STATE.DEFEATED ? 1 - this.victoryRemaining / VICTORY_SECONDS : 0
            }
        ];
        if (
            this.state === STATE.GRAB &&
            this.actionPhase === ACTION_PHASE.TELEGRAPH &&
            this.grabStage === "telegraph"
        ) {
            objects.push({
                id: `${ID.BODY}:grab-range`,
                kind: OBJECT_KIND.GRAB_RANGE,
                position: compositeWorldPoint(this.body.position, worldOffset),
                size: { width: this.config.grabRange * 2, height: this.config.grabRange * 2 },
                state: ACTION_PHASE.TELEGRAPH,
                targetPlayerId: this.targetPlayerId,
                targetPosition: this.targetPosition ? compositeWorldPoint(this.targetPosition, worldOffset) : null,
                active: true
            });
        }
        for (const hazard of this.activeHazards(worldOffset)) {
            const bounds =
                hazard.bounds ??
                (hazard.position && hazard.collider ? hazard.collider.boundsAt?.(hazard.position) : null);
            if (!bounds && !hazard.position) continue;
            objects.push({
                id: `${hazard.id}:presentation`,
                kind: OBJECT_KIND.HAZARD,
                variant: hazard.kind,
                position: bounds
                    ? { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 }
                    : hazard.position,
                size: bounds
                    ? { width: bounds.width, height: bounds.height }
                    : { width: this.config.bodyWidth, height: this.config.bodyHeight },
                state: ACTION_PHASE.ACTIVE,
                actionState: ACTION_PHASE.ACTIVE,
                direction: this.facing,
                damaging: true,
                active: true
            });
        }
        for (const surface of this.definition.arena.surfaces) {
            objects.push({
                id: ID.PRESENTATION_SURFACE(surface.id),
                kind: OBJECT_KIND.ARENA_SURFACE,
                variant: surface.kind,
                position: compositeWorldPoint(
                    {
                        x: surface.bounds.x + surface.bounds.width * 0.5,
                        y: surface.bounds.y + surface.bounds.height * 0.5
                    },
                    worldOffset
                ),
                size: { width: surface.bounds.width, height: surface.bounds.height },
                state: "active",
                active: true
            });
        }
        return Object.freeze(objects.map((object) => freezeComposite(object)));
    }

    snapshot() {
        return this.baseSnapshot({
            phase: 1,
            phaseHealths: this.scaledHealth.phaseHealths,
            phaseFloors: this.scaledHealth.phaseFloors,
            currentPhase: this.definition.phases[0],
            currentTargetId: ID.BODY,
            objectiveLabel: this.state === STATE.DEFEATED ? VICTORY_TEXT : this.definition.phases[0].hud?.objective,
            warningLabel: "",
            health: this.health,
            currentHealth: this.health,
            vulnerability: freezeComposite({ active: false, targetId: ID.BODY, remainingSeconds: 0 }),
            mechanism: freezeComposite({
                state: this.state,
                actionPhase: this.actionPhase,
                targetPlayerId: this.targetPlayerId,
                direction: this.facing,
                grabCooldownRemaining: this.grabCooldownRemaining
            }),
            state: this.state,
            actionPhase: this.actionPhase,
            timer: this.timer,
            healthValue: this.health,
            targetPlayerId: this.targetPlayerId,
            targetPosition: this.targetPosition,
            facing: this.facing,
            hazardSequence: this.hazardSequence,
            grabCooldownRemaining: this.grabCooldownRemaining,
            grabCapturedPlayerId: this.grabCapturedPlayerId,
            grabStage: this.grabStage,
            chargeDistanceRemaining: this.chargeDistanceRemaining,
            victoryRemaining: this.victoryRemaining,
            locomotion: this.locomotion.snapshot(),
            stateSelection: this.statePool.snapshot(),
            statusEffects: this.statusEffects.snapshot()
        });
    }

    restore(snapshot) {
        this.restoreBase(snapshot);
        this.scaledHealth = this.definition.scaledHealth(Math.max(1, this.scalingRoster.length || 1));
        this.health = snapshot.healthValue ?? snapshot.health;
        this.state = snapshot.state;
        this.actionPhase = snapshot.actionPhase;
        this.timer = snapshot.timer ?? 0;
        this.targetPlayerId = snapshot.targetPlayerId ?? null;
        this.targetPosition = snapshot.targetPosition ? { ...snapshot.targetPosition } : null;
        this.facing = snapshot.facing ?? 1;
        this.hazardSequence = snapshot.hazardSequence ?? 0;
        this.grabCooldownRemaining = snapshot.grabCooldownRemaining ?? 0;
        this.grabCapturedPlayerId = snapshot.grabCapturedPlayerId ?? null;
        this.grabStage = snapshot.grabStage ?? "idle";
        this.chargeDistanceRemaining = snapshot.chargeDistanceRemaining ?? 0;
        this.victoryRemaining = snapshot.victoryRemaining ?? 0;
        this.locomotion.restore(snapshot.locomotion);
        this.statePool.restore(snapshot.stateSelection);
        this.statusEffects.restore(snapshot.statusEffects);
        return this;
    }
}
