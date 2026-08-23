import {
    COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION,
    CompositeBossEncounterRuntime,
    compositeDistance,
    compositeInsideBounds,
    compositeLocalPoint,
    compositePoint,
    compositeWorldPoint,
    freezeComposite
} from "./CompositeBossEncounterRuntime.js";
import { KinematicPhysicsBody } from "../physics/KinematicPhysicsBody.js";
import { PHYSICS_ACTOR_KIND } from "../physics/PlayerPhysicsDefinition.js";
import { PolygonCollider } from "../physics/colliders/PolygonCollider.js";
import { segmentIntersectsSurface } from "../world/PolygonGeometry.js";
import { boss04GuardGeometry } from "./Boss04GuardGeometry.js";

export const RESIDENT_SECURITY_SYSTEM_STATE = Object.freeze({
    DORMANT: "dormant",
    CHASE: "chase",
    WARNING: "warning",
    ACTIVE: "active",
    RECOVERY: "recovery",
    RETURN: "return",
    DEAD: "dead",
    BEAM_WARNING: "beam-warning",
    BEAM_ACTIVE: "beam-active",
    BURST_WARNING: "burst-warning",
    BURST_ACTIVE: "burst-active",
    CORE_OPEN: "core-open",
    SHUTDOWN: "shutdown"
});

const TARGET = Object.freeze({
    GUARD_A_BODY: "boss-04:guard-a:body",
    GUARD_A_WEAKPOINT: "boss-04:guard-a:rear-thruster",
    GUARD_B_BODY: "boss-04:guard-b:body",
    GUARD_B_WEAKPOINT: "boss-04:guard-b:side-controller",
    CORE: "boss-04:security-hub:core"
});
const ROLE = Object.freeze({ GUARD_A: "guard-a", GUARD_B: "guard-b", HUB: "hub" });
const GUARD_KEY_BY_TARGET = Object.freeze({
    [TARGET.GUARD_A_BODY]: ROLE.GUARD_A,
    [TARGET.GUARD_A_WEAKPOINT]: ROLE.GUARD_A,
    [TARGET.GUARD_B_BODY]: ROLE.GUARD_B,
    [TARGET.GUARD_B_WEAKPOINT]: ROLE.GUARD_B
});
const WEAKPOINT_TARGET_BY_GUARD = Object.freeze({
    [ROLE.GUARD_A]: TARGET.GUARD_A_WEAKPOINT,
    [ROLE.GUARD_B]: TARGET.GUARD_B_WEAKPOINT
});
const BODY_TARGET_BY_GUARD = Object.freeze({
    [ROLE.GUARD_A]: TARGET.GUARD_A_BODY,
    [ROLE.GUARD_B]: TARGET.GUARD_B_BODY
});
const DEFAULT_CONFIG = Object.freeze({
    chaseSeconds: 1.2,
    chaseSpeed: 220,
    recoverySpeed: 110,
    returnSpeed: 180,
    activeSeconds: 0.35,
    guardAWarningSeconds: 0.6,
    guardARecoverySeconds: 1.8,
    guardAIntervalSeconds: 0.25,
    guardBWarningSeconds: 0.55,
    guardBRecoverySeconds: 1.5,
    beamWarningSeconds: 0.75,
    beamSeconds: 0.6,
    burstWarningSeconds: 0.55,
    burstSeconds: 0.35,
    coreSeconds: 2.2,
    guardDamage: 20,
    hubDamage: 25,
    weakpointRadius: 48,
    bodyRadius: 140,
    coreRadius: 80,
    burstRadius: 130
});
const BEAM_OFFSET_BY_DIRECTION = Object.freeze({
    left: Object.freeze({ x: -460, y: -40, width: 620, height: 130 }),
    right: Object.freeze({ x: -160, y: -40, width: 620, height: 130 }),
    upper: Object.freeze({ x: -320, y: -500, width: 640, height: 130 })
});
const BEAM_DIRECTION_ORDER = Object.freeze(["left", "right", "upper"]);
const OBJECT_KIND = Object.freeze({
    GUARD_A: "boss-guard-a",
    GUARD_B: "boss-guard-b",
    HUB: "boss-security-hub",
    WEAKPOINT: "boss-weakpoint",
    WARNING: "boss-landing-warning",
    BEAM: "boss-hub-beam",
    LINK: "boss-protection-link",
    GATE: "boss-protected-gate"
});

function positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function clampStep(position, target, speed, dt) {
    const distance = compositeDistance(position, target);
    if (distance < Number.EPSILON) return { ...position };
    const travel = Math.min(distance, speed * dt);
    return {
        x: position.x + ((target.x - position.x) / distance) * travel,
        y: position.y + ((target.y - position.y) / distance) * travel
    };
}

function freezeBounds(bounds) {
    return freezeComposite({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
}

export class ResidentialSecuritySystemRuntime extends CompositeBossEncounterRuntime {
    constructor(definition, snapshot = null) {
        super(definition);
        this.config = this.#configuration();
        this.scaledHealth = null;
        this.guard = Object.create(null);
        this.hub = null;
        this.hazardSequence = 0;
        this.lastBeamDirection = null;
        this.resetAttempt({ preserveCompleted: false });
        this.guardBodies = Object.freeze(
            [ROLE.GUARD_A, ROLE.GUARD_B].map(
                (role) =>
                    new KinematicPhysicsBody({
                        id: `boss-04:${role}:collision`,
                        actorKind: PHYSICS_ACTOR_KIND.BOSS,
                        position: this.guard[role].position,
                        collider: new PolygonCollider({ vertices: boss04GuardGeometry(role) }),
                        canGroundActors: true,
                        ropeable: true
                    })
            )
        );
        if (snapshot) this.restore(snapshot);
    }

    #configuration() {
        const byRole = Object.create(null);
        for (const mechanic of this.definition.arena.mechanics ?? []) {
            const role = mechanic.parameters?.role;
            if (role) byRole[role] = mechanic;
        }
        return freezeComposite({
            guardByRole: freezeComposite({
                [ROLE.GUARD_A]: freezeComposite({
                    homePosition: byRole[ROLE.GUARD_A]?.position,
                    territoryBounds: byRole[ROLE.GUARD_A]?.parameters?.territoryBounds ?? null
                }),
                [ROLE.GUARD_B]: freezeComposite({
                    homePosition: byRole[ROLE.GUARD_B]?.position,
                    territoryBounds: byRole[ROLE.GUARD_B]?.parameters?.territoryBounds ?? null
                })
            }),
            hubHomePosition: byRole[ROLE.HUB]?.position ?? this.definition.arena.boss.position,
            hubSize: freezeBounds(this.definition.arena.boss.collider),
            exitPosition: freezeComposite(this.definition.arena.exit),
            recoveryPoints: Object.freeze(
                (this.definition.arena.recoveryPoints ?? []).map((point) => freezeComposite(point))
            ),
            guardAWarningSeconds: positive(
                byRole[ROLE.GUARD_A]?.parameters?.telegraphSeconds,
                DEFAULT_CONFIG.guardAWarningSeconds
            ),
            guardAIntervalSeconds: positive(
                byRole[ROLE.GUARD_A]?.parameters?.burstIntervalSeconds,
                DEFAULT_CONFIG.guardAIntervalSeconds
            ),
            guardARecoverySeconds: positive(
                byRole[ROLE.GUARD_A]?.parameters?.recoverySeconds,
                DEFAULT_CONFIG.guardARecoverySeconds
            ),
            guardBWarningSeconds: positive(
                byRole[ROLE.GUARD_B]?.parameters?.telegraphSeconds,
                DEFAULT_CONFIG.guardBWarningSeconds
            ),
            guardBRecoverySeconds: positive(
                byRole[ROLE.GUARD_B]?.parameters?.recoverySeconds,
                DEFAULT_CONFIG.guardBRecoverySeconds
            ),
            beamWarningSeconds: positive(
                byRole[ROLE.HUB]?.parameters?.beamWarningSeconds,
                DEFAULT_CONFIG.beamWarningSeconds
            ),
            beamSeconds: positive(byRole[ROLE.HUB]?.parameters?.beamSeconds, DEFAULT_CONFIG.beamSeconds),
            burstWarningSeconds: positive(
                byRole[ROLE.HUB]?.parameters?.burstWarningSeconds,
                DEFAULT_CONFIG.burstWarningSeconds
            ),
            burstSeconds: positive(byRole[ROLE.HUB]?.parameters?.burstSeconds, DEFAULT_CONFIG.burstSeconds),
            coreSeconds: positive(byRole[ROLE.HUB]?.parameters?.coreSeconds, DEFAULT_CONFIG.coreSeconds),
            guardDamage: positive(byRole[ROLE.GUARD_A]?.parameters?.damage, DEFAULT_CONFIG.guardDamage),
            hubDamage: positive(byRole[ROLE.HUB]?.parameters?.damage, DEFAULT_CONFIG.hubDamage)
        });
    }

    maximumHealth() {
        return this.scaledHealth?.maxHealth ?? 0;
    }

    totalHealth() {
        return (
            (this.guard?.[ROLE.GUARD_A]?.health ?? 0) +
            (this.guard?.[ROLE.GUARD_B]?.health ?? 0) +
            (this.hub?.health ?? 0)
        );
    }

    resetAttempt({ preserveCompleted }) {
        const rosterCount = Math.max(1, this.scalingRoster.length || 1);
        this.scaledHealth = this.definition.scaledHealth(rosterCount);
        for (const [index, role] of [ROLE.GUARD_A, ROLE.GUARD_B].entries()) {
            const previous = this.guard[role];
            const completed = preserveCompleted && previous?.state === RESIDENT_SECURITY_SYSTEM_STATE.DEAD;
            this.guard[role] = {
                role,
                state: completed ? RESIDENT_SECURITY_SYSTEM_STATE.DEAD : RESIDENT_SECURITY_SYSTEM_STATE.DORMANT,
                health: completed ? 0 : this.scaledHealth.phaseHealths[index],
                maxHealth: this.scaledHealth.phaseHealths[index],
                position: { ...this.config.guardByRole[role].homePosition },
                timer: 0,
                attackPositions: [],
                attackIndex: 0,
                targetPlayerId: null
            };
        }
        this.hub = {
            state: RESIDENT_SECURITY_SYSTEM_STATE.DORMANT,
            health: this.scaledHealth.phaseHealths[2],
            maxHealth: this.scaledHealth.phaseHealths[2],
            position: { ...this.config.hubHomePosition },
            timer: 0,
            active: false,
            beamDirection: null,
            burstPositions: []
        };
        this.hazardSequence = 0;
        this.lastBeamDirection = null;
    }

    #localPlayers(context) {
        const offset = context.worldOffset ?? { x: 0, y: 0 };
        return (context.players ?? [])
            .filter(
                (player) => player?.lifeState !== "dead" && player?.lifeState !== "defeated" && player?.health !== 0
            )
            .map((player) => ({
                id: player.id ?? player.playerId,
                position: compositeLocalPoint(player.physics?.position ?? player.position, offset)
            }))
            .filter(
                ({ id, position }) =>
                    typeof id === "string" && Number.isFinite(position.x) && Number.isFinite(position.y)
            );
    }

    #zoneForRole(role) {
        const phaseIndex = role === ROLE.GUARD_A ? 0 : role === ROLE.GUARD_B ? 1 : 2;
        const phaseId = this.definition.phases[phaseIndex]?.id;
        return this.definition.arena.phaseZones?.find(({ phaseId: value }) => value === phaseId)?.bounds ?? null;
    }

    #chooseNearest(players, position) {
        return players.reduce(
            (nearest, player) =>
                !nearest || compositeDistance(player.position, position) < compositeDistance(nearest.position, position)
                    ? player
                    : nearest,
            null
        );
    }

    #wakeGuard(guard, playerId = null) {
        if (guard.state !== RESIDENT_SECURITY_SYSTEM_STATE.DORMANT) return false;
        guard.state = RESIDENT_SECURITY_SYSTEM_STATE.CHASE;
        guard.timer = DEFAULT_CONFIG.chaseSeconds;
        guard.targetPlayerId = playerId;
        this.emit("boss-guard-detected", { guardId: guard.role, playerId });
        return true;
    }

    #hasLineOfSight(guardPosition, playerPosition, context) {
        const offset = context.worldOffset ?? { x: 0, y: 0 };
        const start = compositeWorldPoint(guardPosition, offset);
        const end = compositeWorldPoint(playerPosition, offset);
        return !(context.surfaces ?? []).some(
            (surface) => surface.losOccluder === true && segmentIntersectsSurface(start, end, surface)
        );
    }

    #beginReturn(guard) {
        guard.state = RESIDENT_SECURITY_SYSTEM_STATE.RETURN;
        guard.timer = 0;
        guard.attackPositions = [];
        this.emit("boss-guard-returning", {
            guardId: guard.role,
            targetId: WEAKPOINT_TARGET_BY_GUARD[guard.role]
        });
        this.emit("boss-weakpoint-opened", {
            guardId: guard.role,
            targetId: WEAKPOINT_TARGET_BY_GUARD[guard.role]
        });
    }

    #candidatePositions(context, players, count) {
        const anchors = (context.anchors ?? []).map((anchor) =>
            compositeLocalPoint(anchor, context.worldOffset ?? { x: 0, y: 0 })
        );
        const player = this.#chooseNearest(players, { x: 2600, y: -1300 });
        if (!player) return [];
        const sorted = anchors
            .filter((anchor) => compositeDistance(anchor, player.position) <= 900)
            .sort(
                (left, right) => compositeDistance(left, player.position) - compositeDistance(right, player.position)
            );
        const candidates = sorted.slice(0, count).map((point) => ({ ...point }));
        return candidates.length > 0 ? candidates : [{ ...player.position }];
    }

    #beginGuardAttack(guard, context, players) {
        guard.state = RESIDENT_SECURITY_SYSTEM_STATE.WARNING;
        guard.attackPositions = this.#candidatePositions(context, players, guard.role === ROLE.GUARD_A ? 3 : 1);
        guard.attackIndex = 0;
        guard.timer = guard.role === ROLE.GUARD_A ? this.config.guardAWarningSeconds : this.config.guardBWarningSeconds;
        this.emit("boss-attack-telegraphed", { guardId: guard.role, positions: guard.attackPositions });
    }

    #advanceGuard(guard, dt, context, players) {
        if (
            guard.state === RESIDENT_SECURITY_SYSTEM_STATE.DEAD ||
            guard.state === RESIDENT_SECURITY_SYSTEM_STATE.DORMANT
        )
            return;
        if (guard.state === RESIDENT_SECURITY_SYSTEM_STATE.RETURN) {
            const home = this.config.guardByRole[guard.role].homePosition;
            guard.position = clampStep(guard.position, home, DEFAULT_CONFIG.returnSpeed, dt);
            if (compositeDistance(guard.position, home) <= 1) {
                guard.position = { ...home };
                guard.state = RESIDENT_SECURITY_SYSTEM_STATE.DORMANT;
                guard.timer = 0;
                guard.targetPlayerId = null;
                this.emit("boss-weakpoint-closed", { guardId: guard.role });
                this.emit("boss-guard-returned", { guardId: guard.role });
            }
            return;
        }
        const target = this.#chooseNearest(players, guard.position);
        const territory = this.config.guardByRole[guard.role].territoryBounds;
        if (
            target &&
            territory &&
            !compositeInsideBounds(target.position, territory) &&
            this.#hasLineOfSight(guard.position, target.position, context) === false &&
            guard.state !== RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE
        ) {
            this.#beginReturn(guard);
            return;
        }
        if (target && guard.state !== RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE) {
            const speed =
                guard.state === RESIDENT_SECURITY_SYSTEM_STATE.RECOVERY
                    ? DEFAULT_CONFIG.recoverySpeed
                    : DEFAULT_CONFIG.chaseSpeed;
            guard.position = clampStep(guard.position, target.position, speed, dt);
            guard.targetPlayerId = target.id;
        }
        guard.timer -= dt;
        if (guard.state === RESIDENT_SECURITY_SYSTEM_STATE.CHASE && guard.timer <= 0) {
            this.#beginGuardAttack(guard, context, players);
            return;
        }
        if (guard.state === RESIDENT_SECURITY_SYSTEM_STATE.WARNING && guard.timer <= 0) {
            guard.state = RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE;
            guard.timer =
                guard.role === ROLE.GUARD_A
                    ? Math.max(
                          DEFAULT_CONFIG.activeSeconds,
                          guard.attackPositions.length * this.config.guardAIntervalSeconds
                      )
                    : DEFAULT_CONFIG.activeSeconds;
            this.hazardSequence += 1;
            this.emit("boss-attack-started", { guardId: guard.role, sequence: this.hazardSequence });
            return;
        }
        if (guard.state === RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE && guard.timer <= 0) {
            guard.state = RESIDENT_SECURITY_SYSTEM_STATE.RECOVERY;
            guard.timer =
                guard.role === ROLE.GUARD_A ? this.config.guardARecoverySeconds : this.config.guardBRecoverySeconds;
            this.emit("boss-weakpoint-opened", {
                guardId: guard.role,
                targetId: WEAKPOINT_TARGET_BY_GUARD[guard.role]
            });
            return;
        }
        if (guard.state === RESIDENT_SECURITY_SYSTEM_STATE.RECOVERY && guard.timer <= 0) {
            guard.state = RESIDENT_SECURITY_SYSTEM_STATE.CHASE;
            guard.timer = DEFAULT_CONFIG.chaseSeconds;
            this.emit("boss-weakpoint-closed", { guardId: guard.role });
        }
    }

    #bothGuardsDead() {
        return [ROLE.GUARD_A, ROLE.GUARD_B].every(
            (role) => this.guard[role].state === RESIDENT_SECURITY_SYSTEM_STATE.DEAD
        );
    }

    #syncGuardBodies(dt) {
        for (const [index, role] of [ROLE.GUARD_A, ROLE.GUARD_B].entries()) {
            const body = this.guardBodies[index];
            body.setKinematicPosition(this.guard[role].position, dt);
            if (this.guard[role].state !== RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE) body.holdKinematicPosition();
        }
    }

    #beginHubBeam(context) {
        const anchors = (context.anchors ?? []).map((anchor) =>
            compositeLocalPoint(anchor, context.worldOffset ?? { x: 0, y: 0 })
        );
        const candidates = BEAM_DIRECTION_ORDER.filter((direction) => {
            const bounds = this.#beamBounds(direction);
            return anchors.some(
                (anchor) =>
                    compositeInsideBounds(anchor, this.#zoneForRole(ROLE.HUB)) && !compositeInsideBounds(anchor, bounds)
            );
        });
        const pool = candidates.length > 0 ? candidates : BEAM_DIRECTION_ORDER;
        const candidate = pool.find((direction) => direction !== this.lastBeamDirection) ?? pool[0];
        this.hub.beamDirection = candidate;
        this.hub.state = RESIDENT_SECURITY_SYSTEM_STATE.BEAM_WARNING;
        this.hub.timer = this.config.beamWarningSeconds;
        this.emit("boss-attack-telegraphed", { source: ROLE.HUB, kind: "directional-beam", direction: candidate });
    }

    #advanceHub(dt, context, players) {
        const zone = this.#zoneForRole(ROLE.HUB);
        const playerInside = players.some((player) => compositeInsideBounds(player.position, zone));
        if (!playerInside) {
            if (this.hub.active) this.emit("boss-hub-paused", {});
            this.hub.active = false;
            this.hub.state = RESIDENT_SECURITY_SYSTEM_STATE.DORMANT;
            this.hub.timer = 0;
            this.hub.burstPositions = [];
            return;
        }
        if (!this.hub.active) {
            this.hub.active = true;
            this.emit("boss-hub-activated", {});
            this.#beginHubBeam(context);
            return;
        }
        this.hub.timer -= dt;
        if (this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.BEAM_WARNING && this.hub.timer <= 0) {
            this.hub.state = RESIDENT_SECURITY_SYSTEM_STATE.BEAM_ACTIVE;
            this.hub.timer = this.config.beamSeconds;
            this.hazardSequence += 1;
            this.emit("boss-attack-started", {
                source: ROLE.HUB,
                kind: "directional-beam",
                sequence: this.hazardSequence
            });
            return;
        }
        if (this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.BEAM_ACTIVE && this.hub.timer <= 0) {
            this.hub.state = RESIDENT_SECURITY_SYSTEM_STATE.BURST_WARNING;
            this.hub.timer = this.config.burstWarningSeconds;
            const candidates = this.#candidatePositions(context, players, 3);
            this.hub.burstPositions =
                candidates.length >= 3 ? candidates.slice(0, 2) : candidates.length === 2 ? candidates.slice(0, 1) : [];
            this.emit("boss-attack-telegraphed", {
                source: ROLE.HUB,
                kind: "landing-burst",
                positions: this.hub.burstPositions
            });
            return;
        }
        if (this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.BURST_WARNING && this.hub.timer <= 0) {
            this.hub.state = RESIDENT_SECURITY_SYSTEM_STATE.BURST_ACTIVE;
            this.hub.timer = this.config.burstSeconds;
            this.hazardSequence += 1;
            this.emit("boss-attack-started", {
                source: ROLE.HUB,
                kind: "landing-burst",
                sequence: this.hazardSequence
            });
            return;
        }
        if (this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.BURST_ACTIVE && this.hub.timer <= 0) {
            this.lastBeamDirection = this.hub.beamDirection;
            if (this.#bothGuardsDead()) {
                this.hub.state = RESIDENT_SECURITY_SYSTEM_STATE.CORE_OPEN;
                this.hub.timer = this.config.coreSeconds;
                this.emit("boss-weakpoint-opened", { source: ROLE.HUB, targetId: TARGET.CORE });
            } else this.#beginHubBeam(context);
            return;
        }
        if (this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.CORE_OPEN && this.hub.timer <= 0) {
            this.emit("boss-weakpoint-closed", { source: ROLE.HUB, targetId: TARGET.CORE });
            this.#beginHubBeam(context);
        }
    }

    advance(dt, context = {}) {
        if (this.status !== "active" || !Number.isFinite(dt) || dt <= 0)
            return freezeComposite({ accepted: this.status === "active", changed: false });
        const players = this.#localPlayers(context);
        for (const role of [ROLE.GUARD_A, ROLE.GUARD_B]) {
            const guard = this.guard[role];
            const zone = this.#zoneForRole(role);
            const enteringPlayer = players.find((player) => compositeInsideBounds(player.position, zone));
            if (enteringPlayer) this.#wakeGuard(guard, enteringPlayer.id);
            this.#advanceGuard(guard, dt, context, players);
        }
        this.#advanceHub(dt, context, players);
        this.#syncGuardBodies(dt);
        return freezeComposite({ accepted: true, changed: true });
    }

    #damageTarget(targetId, baseDamage) {
        const guardRole = GUARD_KEY_BY_TARGET[targetId];
        const weakpoint = targetId === TARGET.GUARD_A_WEAKPOINT || targetId === TARGET.GUARD_B_WEAKPOINT;
        if (guardRole) {
            const guard = this.guard[guardRole];
            if (guard.state === RESIDENT_SECURITY_SYSTEM_STATE.DEAD)
                return freezeComposite({ accepted: true, changed: false, appliedDamage: 0, reason: "guard-destroyed" });
            this.#wakeGuard(guard);
            if (!weakpoint && guard.state === RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE) {
                return freezeComposite({
                    accepted: true,
                    changed: false,
                    appliedDamage: 0,
                    reason: "guard-active-invulnerable"
                });
            }
            if (
                weakpoint &&
                guard.state !== RESIDENT_SECURITY_SYSTEM_STATE.RECOVERY &&
                guard.state !== RESIDENT_SECURITY_SYSTEM_STATE.RETURN
            ) {
                return freezeComposite({
                    accepted: true,
                    changed: false,
                    appliedDamage: 0,
                    reason: "weakpoint-secured"
                });
            }
            const phaseIndex = guardRole === ROLE.GUARD_A ? 0 : 1;
            const normalDamage =
                baseDamage *
                (weakpoint ? this.definition.weakNormalDamageMultiplier : this.definition.closedBodyDamageMultiplier);
            const weakBonus = weakpoint
                ? this.scaledHealth.phaseHealths[phaseIndex] * this.definition.weakFixedPercent
                : 0;
            const appliedDamage = Math.min(guard.health, normalDamage + weakBonus);
            guard.health = Math.max(0, guard.health - appliedDamage);
            if (guard.health === 0) {
                guard.state = RESIDENT_SECURITY_SYSTEM_STATE.DEAD;
                guard.timer = 0;
                this.emit("boss-guard-destroyed", { guardId: guardRole, targetId });
                this.emit("boss-protection-link-lost", { guardId: guardRole });
            }
            return freezeComposite({
                accepted: true,
                changed: appliedDamage > 0,
                appliedDamage,
                normalDamage,
                weakBonus,
                weakpointHit: weakpoint,
                completed: false
            });
        }
        if (targetId !== TARGET.CORE)
            return freezeComposite({ accepted: false, changed: false, appliedDamage: 0, reason: "target-unknown" });
        if (this.hub.state !== RESIDENT_SECURITY_SYSTEM_STATE.CORE_OPEN)
            return freezeComposite({ accepted: true, changed: false, appliedDamage: 0, reason: "core-secured" });
        const appliedDamage = Math.min(
            this.hub.health,
            baseDamage * this.definition.weakNormalDamageMultiplier +
                this.scaledHealth.phaseHealths[2] * this.definition.weakFixedPercent
        );
        this.hub.health = Math.max(0, this.hub.health - appliedDamage);
        if (this.hub.health === 0) {
            this.status = "completed";
            this.hub.state = RESIDENT_SECURITY_SYSTEM_STATE.SHUTDOWN;
            this.emit("boss-encounter-completed", { targetId: TARGET.CORE, attempt: this.attempt });
        }
        return freezeComposite({
            accepted: true,
            changed: appliedDamage > 0,
            appliedDamage,
            normalDamage: baseDamage,
            weakBonus: appliedDamage - baseDamage,
            weakpointHit: true,
            completed: this.status === "completed"
        });
    }

    applyImpact({ impactId, sourcePlayerId = null, baseDamage, targetId = null }) {
        if (this.status !== "active")
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "encounter-not-active",
                appliedDamage: 0
            });
        if (sourcePlayerId && this.participants.get(sourcePlayerId) !== "active")
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "participant-not-active",
                appliedDamage: 0
            });
        if (!Number.isFinite(baseDamage) || baseDamage < 0 || typeof impactId !== "string")
            throw new Error("Boss04 impact is invalid");
        if (this.processedImpactIds.has(impactId))
            return freezeComposite({
                accepted: true,
                changed: false,
                reason: "impact-already-processed",
                appliedDamage: 0
            });
        this.processedImpactIds.add(impactId);
        const selectedTarget =
            targetId ??
            (this.guard[ROLE.GUARD_A].state !== RESIDENT_SECURITY_SYSTEM_STATE.DEAD
                ? TARGET.GUARD_A_BODY
                : this.guard[ROLE.GUARD_B].state !== RESIDENT_SECURITY_SYSTEM_STATE.DEAD
                  ? TARGET.GUARD_B_BODY
                  : TARGET.CORE);
        const outcome = this.#damageTarget(selectedTarget, baseDamage);
        if (outcome.appliedDamage > 0)
            this.emit("boss-damaged", {
                impactId,
                sourcePlayerId,
                targetId: selectedTarget,
                damage: outcome.appliedDamage,
                health: this.totalHealth()
            });
        return outcome;
    }

    applyDamage({ sourcePlayerId = null, damage, impactId = null, targetId = null }) {
        return this.applyImpact({
            impactId: impactId ?? `${this.definition.id}:impact:${this.eventSequence + 1}`,
            sourcePlayerId,
            baseDamage: damage,
            targetId
        });
    }

    impactTargetSnapshot(targetId, worldOffset) {
        const guardRole = GUARD_KEY_BY_TARGET[targetId];
        const weakpoint = targetId === TARGET.GUARD_A_WEAKPOINT || targetId === TARGET.GUARD_B_WEAKPOINT;
        if (guardRole) {
            const guard = this.guard[guardRole];
            const active =
                this.status === "active" &&
                guard.state !== RESIDENT_SECURITY_SYSTEM_STATE.DEAD &&
                (weakpoint
                    ? guard.state === RESIDENT_SECURITY_SYSTEM_STATE.RECOVERY ||
                      guard.state === RESIDENT_SECURITY_SYSTEM_STATE.RETURN
                    : guard.state !== RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE);
            const position = compositeWorldPoint(guard.position, worldOffset);
            return freezeComposite({
                id: targetId,
                impactTargetKind: "boss",
                active,
                position,
                radius: weakpoint ? DEFAULT_CONFIG.weakpointRadius : DEFAULT_CONFIG.bodyRadius,
                health: guard.health,
                maxHealth: guard.maxHealth,
                phase: guardRole === ROLE.GUARD_A ? 1 : 2,
                phaseCount: 3,
                weakpointExposed: weakpoint && active,
                normalDamageMultiplier: weakpoint
                    ? this.definition.weakNormalDamageMultiplier
                    : this.definition.closedBodyDamageMultiplier,
                weakpointDamageRatio: weakpoint ? this.definition.weakFixedPercent : 0
            });
        }
        if (targetId !== TARGET.CORE) return null;
        const active = this.status === "active" && this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.CORE_OPEN;
        return freezeComposite({
            id: targetId,
            impactTargetKind: "boss",
            active,
            position: compositeWorldPoint(this.hub.position, worldOffset),
            radius: DEFAULT_CONFIG.coreRadius,
            health: this.hub.health,
            maxHealth: this.hub.maxHealth,
            phase: 3,
            phaseCount: 3,
            weakpointExposed: active,
            normalDamageMultiplier: this.definition.weakNormalDamageMultiplier,
            weakpointDamageRatio: this.definition.weakFixedPercent
        });
    }

    presentationObjects(worldOffset = { x: 0, y: 0 }) {
        const objects = [];
        for (const [index, role] of [ROLE.GUARD_A, ROLE.GUARD_B].entries()) {
            const guard = this.guard[role];
            if (guard.state === RESIDENT_SECURITY_SYSTEM_STATE.DEAD) continue;
            objects.push({
                id: `boss-04:${role}`,
                kind: role === ROLE.GUARD_A ? OBJECT_KIND.GUARD_A : OBJECT_KIND.GUARD_B,
                variant: role,
                position: compositeWorldPoint(guard.position, worldOffset),
                geometry: this.guardBodies[index].collider.snapshot(),
                state: guard.state,
                active: true,
                physicsBody: true,
                ropeAttachable: this.guardBodies[index].isRopeableSurface()
            });
            const weakpoint =
                guard.state === RESIDENT_SECURITY_SYSTEM_STATE.RECOVERY ||
                guard.state === RESIDENT_SECURITY_SYSTEM_STATE.RETURN;
            objects.push({
                id: WEAKPOINT_TARGET_BY_GUARD[role],
                kind: OBJECT_KIND.WEAKPOINT,
                variant: role === ROLE.GUARD_A ? "rear-thruster" : "side-controller",
                position: compositeWorldPoint(guard.position, worldOffset),
                size: { width: 96, height: 96 },
                state: weakpoint ? "exposed" : "secured",
                active: true
            });
            if (
                guard.state === RESIDENT_SECURITY_SYSTEM_STATE.WARNING ||
                guard.state === RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE
            ) {
                for (const [index, point] of guard.attackPositions.entries())
                    objects.push({
                        id: `${role}:attack:${index}`,
                        kind: OBJECT_KIND.WARNING,
                        variant: role,
                        position: compositeWorldPoint(point, worldOffset),
                        size: { width: 240, height: 150 },
                        state: guard.state,
                        active: true
                    });
            }
        }
        const coreOpen = this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.CORE_OPEN;
        objects.push({
            id: "boss-04:security-hub",
            kind: OBJECT_KIND.HUB,
            variant: "security-hub",
            position: compositeWorldPoint(this.hub.position, worldOffset),
            size: { width: this.config.hubSize.width, height: this.config.hubSize.height },
            state: this.hub.state,
            active: true,
            ropeAttachable: true
        });
        objects.push({
            id: TARGET.CORE,
            kind: OBJECT_KIND.WEAKPOINT,
            variant: "central-security-core",
            position: compositeWorldPoint(this.hub.position, worldOffset),
            size: { width: 120, height: 120 },
            state: coreOpen ? "exposed" : "secured",
            active: true
        });
        for (const role of [ROLE.GUARD_A, ROLE.GUARD_B])
            objects.push({
                id: `boss-04:link:${role}`,
                kind: OBJECT_KIND.LINK,
                variant: role,
                position: compositeWorldPoint(
                    { x: this.hub.position.x + (role === ROLE.GUARD_A ? -150 : 150), y: this.hub.position.y - 170 },
                    worldOffset
                ),
                size: { width: 100, height: 22 },
                state: this.guard[role].state === RESIDENT_SECURITY_SYSTEM_STATE.DEAD ? "offline" : "online",
                active: true
            });
        if (
            this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.BEAM_WARNING ||
            this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.BEAM_ACTIVE
        ) {
            const bounds = this.#beamBounds(this.hub.beamDirection);
            objects.push({
                id: "boss-04:hub-beam",
                kind: OBJECT_KIND.BEAM,
                variant: this.hub.beamDirection,
                position: compositeWorldPoint(
                    { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 },
                    worldOffset
                ),
                size: { width: bounds.width, height: bounds.height },
                state: this.hub.state,
                active: true
            });
        }
        objects.push({
            id: "boss-04:protected-gate",
            kind: OBJECT_KIND.GATE,
            variant: "protected-gate",
            position: compositeWorldPoint(this.config.exitPosition, worldOffset),
            size: { width: 180, height: 300 },
            state: this.status === "completed" ? "open" : "locked",
            active: true
        });
        return Object.freeze(objects.map((object) => freezeComposite(object)));
    }

    #beamBounds(direction) {
        const offset = BEAM_OFFSET_BY_DIRECTION[direction] ?? BEAM_OFFSET_BY_DIRECTION.left;
        return {
            x: this.hub.position.x + offset.x,
            y: this.hub.position.y + offset.y,
            width: offset.width,
            height: offset.height
        };
    }

    activeHazards(worldOffset = { x: 0, y: 0 }) {
        const hazards = [];
        for (const role of [ROLE.GUARD_A, ROLE.GUARD_B]) {
            const guard = this.guard[role];
            if (guard.state !== RESIDENT_SECURITY_SYSTEM_STATE.ACTIVE) continue;
            for (const [index, point] of guard.attackPositions.entries())
                hazards.push({
                    id: `${this.definition.id}:${role}:${this.hazardSequence}:${index}`,
                    kind: role === ROLE.GUARD_A ? "guard-a-burst" : "guard-b-dash",
                    sequence: this.hazardSequence,
                    position: compositeWorldPoint(point, worldOffset),
                    radius: role === ROLE.GUARD_A ? DEFAULT_CONFIG.burstRadius : DEFAULT_CONFIG.bodyRadius,
                    damage: this.config.guardDamage
                });
        }
        if (this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.BEAM_ACTIVE) {
            const bounds = this.#beamBounds(this.hub.beamDirection);
            hazards.push({
                id: `${this.definition.id}:hub-beam:${this.hazardSequence}`,
                kind: "hub-beam",
                sequence: this.hazardSequence,
                bounds: freezeBounds({
                    x: bounds.x + worldOffset.x,
                    y: bounds.y + worldOffset.y,
                    width: bounds.width,
                    height: bounds.height
                }),
                damage: this.config.hubDamage
            });
        }
        if (this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.BURST_ACTIVE) {
            for (const [index, point] of this.hub.burstPositions.entries())
                hazards.push({
                    id: `${this.definition.id}:hub-burst:${this.hazardSequence}:${index}`,
                    kind: "hub-burst",
                    sequence: this.hazardSequence,
                    position: compositeWorldPoint(point, worldOffset),
                    radius: DEFAULT_CONFIG.burstRadius,
                    damage: this.config.hubDamage
                });
        }
        return Object.freeze(hazards.map((hazard) => freezeComposite(hazard)));
    }

    collisionActors(offset = { x: 0, y: 0 }) {
        return Object.freeze(
            this.guardBodies
                .filter(
                    (_, index) =>
                        this.guard[[ROLE.GUARD_A, ROLE.GUARD_B][index]].state !== RESIDENT_SECURITY_SYSTEM_STATE.DEAD
                )
                .map((body) => body.collisionActor(offset))
        );
    }

    ropeAttachmentActors() {
        return this.collisionActors();
    }

    respawnPosition(worldOffset = { x: 0, y: 0 }) {
        const index =
            this.guard[ROLE.GUARD_A].state !== RESIDENT_SECURITY_SYSTEM_STATE.DEAD
                ? 0
                : this.guard[ROLE.GUARD_B].state !== RESIDENT_SECURITY_SYSTEM_STATE.DEAD
                  ? 1
                  : 2;
        const local = this.config.recoveryPoints[index] ?? this.config.recoveryPoints.at(-1);
        return compositeWorldPoint(local, worldOffset);
    }

    snapshot() {
        const phase =
            this.hub.health <= 0
                ? 3
                : this.guard[ROLE.GUARD_A].state !== RESIDENT_SECURITY_SYSTEM_STATE.DEAD
                  ? 1
                  : this.guard[ROLE.GUARD_B].state !== RESIDENT_SECURITY_SYSTEM_STATE.DEAD
                    ? 2
                    : 3;
        const vulnerability =
            this.hub.state === RESIDENT_SECURITY_SYSTEM_STATE.CORE_OPEN
                ? TARGET.CORE
                : [ROLE.GUARD_A, ROLE.GUARD_B].find(
                        (role) =>
                            this.guard[role].state === RESIDENT_SECURITY_SYSTEM_STATE.RECOVERY ||
                            this.guard[role].state === RESIDENT_SECURITY_SYSTEM_STATE.RETURN
                    )
                  ? WEAKPOINT_TARGET_BY_GUARD[
                        [ROLE.GUARD_A, ROLE.GUARD_B].find(
                            (role) =>
                                this.guard[role].state === RESIDENT_SECURITY_SYSTEM_STATE.RECOVERY ||
                                this.guard[role].state === RESIDENT_SECURITY_SYSTEM_STATE.RETURN
                        )
                    ]
                  : null;
        return this.baseSnapshot({
            phase,
            currentTargetId: vulnerability,
            vulnerability: {
                active: Boolean(vulnerability),
                targetId: vulnerability,
                remainingSeconds:
                    vulnerability === TARGET.CORE
                        ? this.hub.timer
                        : vulnerability
                          ? this.guard[GUARD_KEY_BY_TARGET[vulnerability]].timer
                          : 0
            },
            mechanism: {
                state: this.hub.state,
                hazardSequence: this.hazardSequence,
                weakpointExposed: Boolean(vulnerability)
            },
            guardStates: freezeComposite(this.guard),
            hubState: freezeComposite(this.hub),
            protectionLinks: freezeComposite({
                a: this.guard[ROLE.GUARD_A].state === RESIDENT_SECURITY_SYSTEM_STATE.DEAD ? "offline" : "online",
                b: this.guard[ROLE.GUARD_B].state === RESIDENT_SECURITY_SYSTEM_STATE.DEAD ? "offline" : "online"
            })
        });
    }

    restore(snapshot) {
        this.restoreBase(snapshot);
        if (snapshot.snapshotRevision !== COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION)
            throw new Error("Boss04 snapshot revision mismatch");
        this.scaledHealth = this.definition.scaledHealth(Math.max(1, this.scalingRoster.length || 1));
        this.guard = Object.create(null);
        for (const role of [ROLE.GUARD_A, ROLE.GUARD_B]) {
            const source = snapshot.guardStates?.[role];
            if (!source) throw new Error("Boss04 guard snapshot missing");
            this.guard[role] = {
                ...source,
                position: compositePoint(source.position),
                attackPositions: (source.attackPositions ?? []).map((point) => compositePoint(point))
            };
        }
        this.hub = {
            ...snapshot.hubState,
            position: compositePoint(snapshot.hubState?.position),
            burstPositions: (snapshot.hubState?.burstPositions ?? []).map((point) => compositePoint(point))
        };
        this.hazardSequence = snapshot.mechanism?.hazardSequence ?? 0;
        this.lastBeamDirection = snapshot.hubState?.beamDirection ?? null;
        this.#syncGuardBodies(0);
        return this;
    }
}
