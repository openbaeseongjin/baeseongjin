import {
    CompositeBossEncounterRuntime,
    compositeLocalPoint,
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
import { CommanderGrabHookFlight } from "./CommanderGrabHookFlight.js";
import { BOSS_ARENA_SUPPORT_KIND, BossArenaSpatialQuery } from "./BossArenaSpatialQuery.js";
import { KinematicJumpMotion } from "./KinematicJumpMotion.js";
import { BOSS_ENEMY_SUMMON_EVENT, BossEnemySummonPattern } from "./BossEnemySummonPattern.js";
import {
    LOWER_SECTOR_COMMANDER_ACTION_PHASE as ACTION_PHASE,
    LOWER_SECTOR_COMMANDER_BODY_GEOMETRY as BODY_GEOMETRY,
    LOWER_SECTOR_COMMANDER_CAPTURE_DEFINITION as CAPTURE_DEFINITION,
    LOWER_SECTOR_COMMANDER_HAZARD as HAZARD,
    LOWER_SECTOR_COMMANDER_GRAB_STAGE as GRAB_STAGE,
    LOWER_SECTOR_COMMANDER_GRAB_HOOK as GRAB_HOOK,
    LOWER_SECTOR_COMMANDER_ID as ID,
    LOWER_SECTOR_COMMANDER_OBJECT_KIND as OBJECT_KIND,
    LOWER_SECTOR_COMMANDER_SECTOR_ID as SECTOR_ID,
    LOWER_SECTOR_COMMANDER_STATE as STATE,
    LOWER_SECTOR_COMMANDER_SURFACE_KIND as SURFACE_KIND
} from "./LowerSectorCommanderDefinition.js";

const PLAYER_RADIUS = 15;
const OPENING_DIALOGUE = Object.freeze([
    Object.freeze({ speakerId: "lower-sector-system", text: "LOWER-SECTOR TRANSFER / RETURN PROTOCOL ACTIVE" }),
    Object.freeze({ speakerId: "local-player", text: "…아직도 아래로 돌려보내고 있네." })
]);
const VICTORY_TEXT = "LOWER-SECTOR TRANSFER / RETURN PROTOCOL OFFLINE";
const VICTORY_SECONDS = 1.5;
const HAZARD_SEQUENCE_LIMIT = 64;
const SUPPORT_KIND_BY_SURFACE_KIND = Object.freeze({
    [SURFACE_KIND.MAIN]: BOSS_ARENA_SUPPORT_KIND.GROUND,
    [SURFACE_KIND.LEDGE]: BOSS_ARENA_SUPPORT_KIND.PLATFORM
});

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
        this.summonPattern = new BossEnemySummonPattern({
            bossStageId: definition.id,
            sectorId: SECTOR_ID,
            ...this.config.summonPattern
        });
        this.stateCatalog = createLowerSectorCommanderStateCatalog();
        this.statePool = new BossStatePool({ catalog: this.stateCatalog, worldSeed, attempt: this.attempt });
        this.scaledHealth = null;
        this.state = STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = 0;
        this.facing = 1;
        this.targetPlayerId = null;
        this.targetPosition = null;
        this.hazardSequence = 0;
        this.grabCooldownRemaining = 0;
        this.grabCapturedPlayerId = null;
        this.grabStage = GRAB_STAGE.IDLE;
        this.chargeDistanceRemaining = 0;
        this.victoryRemaining = 0;
        this.statusEffects = new CombatStatusEffectPool();
        this.spatialQuery = new BossArenaSpatialQuery({
            surfaces: definition.arena.surfaces,
            supportKindBySurfaceKind: SUPPORT_KIND_BY_SURFACE_KIND,
            label: "Lower Sector Commander"
        });
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
        this.jumpMotion = new KinematicJumpMotion({
            position: definition.arena.boss.position,
            gravity: this.config.jumpGravity
        });
        this.grabHookFlight = new CommanderGrabHookFlight({ speed: GRAB_HOOK.SPEED, radius: GRAB_HOOK.RADIUS });
        this.resetAttempt({ preserveCompleted: false });
        if (snapshot) this.restore(snapshot);
    }

    #configuration() {
        const parameters = this.definition.arena.mechanics?.[0]?.parameters ?? {};
        const main = this.definition.arena.surfaces.find(({ kind }) => kind === SURFACE_KIND.MAIN);
        return freezeComposite({
            mainBounds: main.bounds,
            bodyWidth: positive(this.definition.arena.boss.collider?.width, 128),
            bodyHeight: positive(this.definition.arena.boss.collider?.height, 192),
            acceleration: positive(parameters.acceleration, 600),
            deceleration: positive(parameters.deceleration, 900),
            walkSpeeds: positiveArray(parameters.walkSpeeds, Object.freeze([180, 220, 260])),
            intensityHealthRatios: positiveArray(parameters.intensityHealthRatios, Object.freeze([0.7, 0.35])),
            recoverySeconds: positiveArray(parameters.recoverySeconds, Object.freeze([1, 0.8, 0.6])),
            grabRange: positive(parameters.grabRange, 800),
            grabLeadSeconds: positive(parameters.grabLeadSeconds, 0.25),
            grabTelegraphSeconds: positive(parameters.grabTelegraphSeconds, 1.5),
            grabTimeoutSeconds: positive(parameters.grabTimeoutSeconds, 0.5),
            grabDamage: positive(parameters.grabDamage, 20),
            grabHoldSeconds: CAPTURE_DEFINITION.holdSeconds,
            grabHammerDamage: positive(parameters.grabHammerDamage, 40),
            grabCooldownSeconds: positive(parameters.grabCooldownSeconds, 15),
            jumpGravity: positive(parameters.jumpGravity, 1500),
            jumpDurationSeconds: positive(parameters.jumpDurationSeconds, 0.95),
            jumpRecoverySeconds: positive(parameters.jumpRecoverySeconds, 0.3),
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
            chargeKnockback: positive(parameters.chargeKnockback, 260),
            summonPattern: freezeComposite({
                count: parameters.minionSummonCount,
                cooldownSeconds: parameters.minionSummonCooldownSeconds,
                skipAliveCount: parameters.minionSummonSkipAliveCount,
                telegraphSeconds: parameters.minionSummonTelegraphSeconds,
                recoverySeconds: parameters.minionSummonRecoverySeconds,
                warningSize: parameters.minionSummonWarningSize,
                spawnPoints: [
                    {
                        x: parameters.summonLeft?.x ?? main.bounds.x + main.bounds.width * 0.25,
                        y: parameters.summonLeft?.y ?? main.bounds.y - 80
                    },
                    {
                        x: parameters.summonRight?.x ?? main.bounds.x + main.bounds.width * 0.75,
                        y: parameters.summonRight?.y ?? main.bounds.y - 80
                    }
                ]
            })
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
        this.grabStage = GRAB_STAGE.IDLE;
        this.grabHookFlight?.reset();
        this.chargeDistanceRemaining = 0;
        this.summonPattern.reset();
        this.victoryRemaining = completed ? 0 : this.victoryRemaining;
        this.statusEffects.reset();
        this.body?.setPhysicsPosition(this.definition.arena.boss.position);
        this.body?.setPhysicsVelocity({ x: 0, y: 0 });
        this.jumpMotion?.cancel(this.definition.arena.boss.position);
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

    #grabDistance(target) {
        return target
            ? Math.hypot(target.position.x - this.body.position.x, target.position.y - this.body.position.y)
            : Infinity;
    }

    #grabTargetInsideRange(target) {
        return this.#grabDistance(target) <= this.config.grabRange;
    }

    #bodyFoot(position = this.body.position) {
        return { x: position.x, y: position.y + this.config.bodyHeight * 0.5 };
    }

    #targetSupport(target) {
        if (!target) return null;
        const foot = { x: target.position.x, y: target.position.y + PLAYER_RADIUS };
        return this.spatialQuery.currentSupport(foot, { tolerance: 24 }) ?? this.spatialQuery.supportBelow(foot);
    }

    #currentSupport() {
        return this.spatialQuery.currentSupport(this.#bodyFoot(), { tolerance: 2 });
    }

    #supportPosition(support, targetX) {
        const halfWidth = this.config.bodyWidth * 0.5;
        return {
            x: Math.max(support.minX + halfWidth, Math.min(support.maxX - halfWidth, targetX)),
            y: support.topY - this.config.bodyHeight * 0.5
        };
    }

    #nextJumpSupport(current, target) {
        if (!current || !target || current.id === target.id) return null;
        if (
            current.supportKind === BOSS_ARENA_SUPPORT_KIND.GROUND ||
            target.supportKind === BOSS_ARENA_SUPPORT_KIND.GROUND
        ) {
            return target;
        }
        const platforms = this.spatialQuery.supports
            .filter(({ supportKind }) => supportKind === BOSS_ARENA_SUPPORT_KIND.PLATFORM)
            .sort((left, right) => left.minX - right.minX);
        const currentIndex = platforms.findIndex(({ id }) => id === current.id);
        const targetIndex = platforms.findIndex(({ id }) => id === target.id);
        if (currentIndex < 0 || targetIndex < 0) return target;
        return platforms[currentIndex + Math.sign(targetIndex - currentIndex)] ?? target;
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
        return {
            x: edge.x,
            y: this.body.position.y - this.config.bodyHeight * BODY_GEOMETRY.EYE_HEIGHT_RATIO
        };
    }

    #grabHookStart() {
        return {
            x: this.body.position.x + this.facing * GRAB_HOOK.HAND_OFFSET_X,
            y: this.body.position.y + GRAB_HOOK.HAND_OFFSET_Y
        };
    }

    #beginGrabHookFlight() {
        if (!this.targetPosition) return this.grabHookFlight.reset();
        return this.grabHookFlight.begin({ start: this.#grabHookStart(), target: this.targetPosition });
    }

    #safeCapturePosition(facing = this.facing) {
        const support = this.#currentSupport();
        const position = this.#capturePosition(facing);
        const bounds = support?.bounds ?? this.config.mainBounds;
        const minimumX = bounds.x + this.config.captureCliffMargin;
        const maximumX = bounds.x + bounds.width - this.config.captureCliffMargin;
        return position.x >= minimumX && position.x <= maximumX ? position : null;
    }

    canGrab(target) {
        const facing = target ? Math.sign(target.position.x - this.body.position.x) || this.facing : this.facing;
        return Boolean(
            target &&
            this.grabCooldownRemaining <= 0 &&
            this.#grabTargetInsideRange(target) &&
            this.#safeCapturePosition(facing)
        );
    }

    canJump(target) {
        const current = this.#currentSupport();
        const destination = this.#targetSupport(target);
        return Boolean(target && current && destination && current.id !== destination.id && !this.jumpMotion.active);
    }

    canHammer(target) {
        return Boolean(target && this.#bodyBoundaryDistance(target) <= this.config.hammerRange);
    }

    canCharge(target) {
        const distance = this.#bodyBoundaryDistance(target);
        return Boolean(target && distance > this.config.hammerRange && distance <= this.config.chargeDistance);
    }

    canSummon(target, context = {}) {
        return Boolean(target && this.summonPattern.canSummon(context.bossSummonedEnemyCount));
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
        this.grabStage = GRAB_STAGE.LEAD;
        this.grabHookFlight.reset();
    }

    beginHammer(target) {
        this.#beginAttack(STATE.HAMMER, target, this.config.hammerTelegraphSeconds);
    }

    beginCharge(target) {
        this.#beginAttack(STATE.CHARGE, target, this.config.chargeTelegraphSeconds);
        this.chargeDistanceRemaining = this.config.chargeDistance;
    }

    beginSummon(target) {
        this.#beginAttack(STATE.SUMMON, target, this.summonPattern.telegraphSeconds);
    }

    advanceSummon(dt, target, context = {}) {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.timer = Math.max(0, this.timer - dt);
            if (this.timer > 0) return;
        }
        if (!this.canSummon(target, context)) {
            this.#finishAttack();
            return;
        }
        this.actionPhase = ACTION_PHASE.ACTIVE;
        const wave = this.summonPattern.summon({
            attempt: this.attempt,
            worldOffset: context.worldOffset ?? { x: 0, y: 0 }
        });
        this.emit("boss-attack-started", {
            kind: STATE.SUMMON,
            sequence: wave.sequence,
            summonCount: this.summonPattern.count
        });
        for (const request of wave.requests) this.emit(BOSS_ENEMY_SUMMON_EVENT.ENEMY_SUMMONED, request);
        this.#finishAttack();
        this.timer = this.summonPattern.recoverySeconds;
    }

    beginJump(target) {
        const destination = this.#nextJumpSupport(this.#currentSupport(), this.#targetSupport(target));
        if (!destination) return false;
        this.#faceTarget(target);
        this.state = STATE.JUMP;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = this.config.jumpDurationSeconds;
        this.locomotion.stop();
        this.jumpMotion.begin({
            position: this.body.position,
            target: this.#supportPosition(destination, target.position.x),
            durationSeconds: this.config.jumpDurationSeconds
        });
        return true;
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
        this.grabStage = GRAB_STAGE.IDLE;
        this.grabHookFlight.reset();
        this.chargeDistanceRemaining = 0;
        this.locomotion.stop();
    }

    advanceGrab(dt, target) {
        if (target?.id === this.targetPlayerId) this.targetPosition = { ...target.position };
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH && (!target || !this.#grabTargetInsideRange(target))) {
            this.cancelTargetCapture(this.targetPlayerId);
            return;
        }
        this.timer = Math.max(0, this.timer - dt);
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH && this.grabStage === GRAB_STAGE.LEAD && this.timer <= 0) {
            this.grabStage = GRAB_STAGE.TELEGRAPH;
            this.timer = this.config.grabTelegraphSeconds;
            return;
        }
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH && this.grabStage === GRAB_STAGE.TELEGRAPH && this.timer <= 0) {
            this.grabStage = GRAB_STAGE.SEARCH;
            this.#beginGrabHookFlight();
            this.#activateHazard(HAZARD.GRAB, this.config.grabTimeoutSeconds);
            return;
        }
        if (this.actionPhase === ACTION_PHASE.ACTIVE && this.grabStage === GRAB_STAGE.SEARCH && this.targetPosition) {
            this.grabHookFlight.advance(dt, this.targetPosition);
        }
        if (this.actionPhase !== ACTION_PHASE.ACTIVE || this.timer > 0) return;
        if (this.grabStage === GRAB_STAGE.CAPTURED) {
            this.grabStage = GRAB_STAGE.HAMMER;
            this.#activateHazard(HAZARD.GRAB_HAMMER, this.config.hammerActiveSeconds);
            return;
        }
        if (this.grabStage === GRAB_STAGE.HAMMER) {
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
        this.locomotion.moveAtVelocity(
            this.facing * this.config.chargeSpeed,
            dt,
            this.#currentSupport()?.bounds ?? this.config.mainBounds
        );
        this.chargeDistanceRemaining -= Math.abs(this.body.position.x - previousX);
        if (this.timer <= 0 || this.chargeDistanceRemaining <= 0) this.#finishAttack();
    }

    advanceJump(dt) {
        this.jumpMotion.advance(dt);
        this.body.setKinematicPosition(this.jumpMotion.position, dt);
        this.timer = Math.max(0, this.timer - dt);
        if (this.jumpMotion.active) return;
        this.body.holdKinematicPosition();
        this.state = STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = this.config.jumpRecoverySeconds;
        this.targetPlayerId = null;
        this.targetPosition = null;
    }

    cancelTargetCapture(playerId) {
        if (this.targetPlayerId !== playerId || this.state !== STATE.GRAB) return false;
        this.grabCooldownRemaining = this.config.grabCooldownSeconds;
        this.#finishAttack();
        return true;
    }

    #advanceNeutral(dt, target, context = {}, { canSelectAttack = true } = {}) {
        if (this.timer > 0) {
            this.timer = Math.max(0, this.timer - dt);
            return;
        }
        if (target && this.canJump(target)) {
            this.statePool.enter(STATE.JUMP, { runtime: this, target });
            return;
        }
        const selection = canSelectAttack
            ? this.statePool.select({
                  lane: BOSS_STATE_LANE.ATTACK,
                  context: { runtime: this, target, context }
              })
            : null;
        if (selection) {
            this.statePool.enter(selection.id, { runtime: this, target });
            return;
        }
        if (target) {
            this.state = STATE.WALK;
            this.#faceTarget(target);
            this.locomotion.advanceToward(
                target.position.x,
                dt,
                this.#walkSpeed(),
                this.config.hammerRange * 0.8,
                this.#currentSupport()?.bounds ?? this.config.mainBounds
            );
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
        this.summonPattern.advance(dt);
        for (const outcome of this.statusEffects.advance(dt)) {
            if (outcome.type === "damage") this.health = Math.max(0, this.health - outcome.damage);
        }
        if (!this.statusEffects.canAct()) {
            if (this.state === STATE.GRAB) this.cancelTargetCapture(this.targetPlayerId);
            this.locomotion.stop();
            return freezeComposite({ accepted: true, changed: true });
        }
        const worldOffset = context.worldOffset ?? { x: 0, y: 0 };
        const players = (context.players ?? []).map((player) => ({
            ...player,
            position: compositeLocalPoint(player.position, worldOffset)
        }));
        const target = this.targetPlayerId
            ? (players.find(({ id }) => id === this.targetPlayerId) ?? null)
            : context.canSelectTarget !== false
              ? nearestTarget(players, this.body.position)
              : null;
        if (this.stateCatalog[this.state]) this.statePool.advance(this.state, { runtime: this, dt, target, context });
        else this.#advanceNeutral(dt, target, context, { canSelectAttack: context.canSelectTarget !== false });
        return freezeComposite({ accepted: true, changed: true });
    }

    #hazardBounds(width, height) {
        const supportTopY = this.#currentSupport()?.topY ?? this.config.mainBounds.y;
        const edge = this.body.collider.outsidePointToward(this.body.position, {
            x: this.body.position.x + this.facing,
            y: this.body.position.y
        });
        return freezeComposite({
            x: this.facing > 0 ? edge.x : edge.x - width,
            y: supportTopY - height,
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
        if (this.state === STATE.GRAB && !this.grabCapturedPlayerId && this.grabHookFlight.active) {
            return Object.freeze([
                freezeComposite({
                    ...common,
                    kind: HAZARD.GRAB,
                    damage: this.config.grabDamage,
                    targetPlayerId: this.targetPlayerId,
                    position: compositeWorldPoint(this.grabHookFlight.position, worldOffset),
                    radius: this.grabHookFlight.radius,
                    capture: {
                        interactionId: ID.CAPTURE_INTERACTION(this.attempt, this.hazardSequence, this.targetPlayerId),
                        definitionId: ID.CAPTURE_DEFINITION,
                        sourceActorId: ID.BODY,
                        targetPosition: compositeWorldPoint(this.#capturePosition(), worldOffset)
                    }
                })
            ]);
        }
        if (this.state === STATE.GRAB && this.grabCapturedPlayerId && this.grabStage === GRAB_STAGE.HAMMER) {
            const localBounds = this.#hazardBounds(this.config.hammerRange, this.config.hammerHeight);
            return Object.freeze([
                freezeComposite({
                    ...common,
                    kind: HAZARD.GRAB_HAMMER,
                    damage: this.config.grabHammerDamage,
                    targetPlayerId: this.grabCapturedPlayerId,
                    automaticTarget: true,
                    bounds: {
                        ...localBounds,
                        x: localBounds.x + worldOffset.x,
                        y: localBounds.y + worldOffset.y
                    }
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

    overlapsHazardTarget({ hazard, targetPosition }) {
        if (hazard?.kind !== HAZARD.GRAB) return null;
        if (!Number.isFinite(hazard.position?.x) || !Number.isFinite(hazard.position?.y)) return false;
        if (!Number.isFinite(targetPosition?.x) || !Number.isFinite(targetPosition?.y)) return false;
        return (
            Math.hypot(targetPosition.x - hazard.position.x, targetPosition.y - hazard.position.y) <=
            hazard.radius + PLAYER_RADIUS
        );
    }

    applyHazardContact({ contactId, playerId, damage }) {
        const outcome = super.applyHazardContact({ contactId, playerId, damage });
        if (!outcome.changed || this.state !== STATE.GRAB) return outcome;
        if (!this.grabCapturedPlayerId) {
            this.grabCapturedPlayerId = playerId;
            this.grabStage = GRAB_STAGE.CAPTURED;
            this.grabHookFlight.reset();
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
            this.jumpMotion.cancel(this.body.position);
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
        const grabHookFlight = this.grabHookFlight.snapshot();
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
                jumpPhase: this.jumpMotion.phase,
                grabStage: this.grabStage,
                grabHookPosition: grabHookFlight.active
                    ? compositeWorldPoint(grabHookFlight.position, worldOffset)
                    : null,
                grabHookProgress: grabHookFlight.progress,
                direction: this.facing,
                physicsBody: this.state !== STATE.DEFEATED,
                ropeAttachable: false,
                active: true,
                targetPlayerId: this.targetPlayerId,
                targetPosition: this.targetPosition ? compositeWorldPoint(this.targetPosition, worldOffset) : null,
                defeatProgress: this.state === STATE.DEFEATED ? 1 - this.victoryRemaining / VICTORY_SECONDS : 0
            }
        ];
        if (
            this.state === STATE.GRAB &&
            this.actionPhase === ACTION_PHASE.TELEGRAPH &&
            this.grabStage === GRAB_STAGE.TELEGRAPH
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
        if (this.state === STATE.SUMMON && this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            objects.push(
                ...this.summonPattern.presentationWarnings({
                    kind: OBJECT_KIND.HAZARD,
                    variant: STATE.SUMMON,
                    state: ACTION_PHASE.TELEGRAPH,
                    worldOffset
                })
            );
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
                grabCooldownRemaining: this.grabCooldownRemaining,
                summonCooldownRemaining: this.summonPattern.cooldownRemaining
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
            grabHookFlight: this.grabHookFlight.snapshot(),
            chargeDistanceRemaining: this.chargeDistanceRemaining,
            summonPattern: this.summonPattern.snapshot(),
            victoryRemaining: this.victoryRemaining,
            locomotion: this.locomotion.snapshot(),
            jumpMotion: this.jumpMotion.snapshot(),
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
        this.grabStage = snapshot.grabStage ?? GRAB_STAGE.IDLE;
        this.grabHookFlight.restore(snapshot.grabHookFlight ?? null);
        this.chargeDistanceRemaining = snapshot.chargeDistanceRemaining ?? 0;
        this.summonPattern.restore(snapshot.summonPattern ?? null);
        this.victoryRemaining = snapshot.victoryRemaining ?? 0;
        this.locomotion.restore(snapshot.locomotion);
        if (snapshot.jumpMotion) this.jumpMotion.restore(snapshot.jumpMotion);
        else this.jumpMotion.cancel(this.body.position);
        this.statePool.restore(snapshot.stateSelection);
        this.statusEffects.restore(snapshot.statusEffects);
        return this;
    }
}
