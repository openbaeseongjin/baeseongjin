import { Vector2 } from "../src/game-kit/index.js";
import { SWARM_BEHAVIOR_STATE } from "../src/game/combat/enemy-behavior/EnemyBehaviorDefinition.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";

const DIAGNOSTIC = Object.freeze({
    worldSeed: 1,
    startAreaId: "sector-03-04",
    groupId: "sector-03:landmark:04:slot:upper-arcade-guard",
    initialTarget: Object.freeze({ x: 500, y: -19090 }),
    recoveryTarget: Object.freeze({ x: 1000, y: -19090 }),
    fixedDt: 1 / 120,
    maximumTicks: 1200,
    recoveryTicks: 120,
    expectedMemberCount: 10,
    minimumDeepOverlapDistance: 12,
    minimumAverageAlignment: 0.85,
    maximumRecoveryP90Radius: 96,
    diagnosticHealth: 10000
});

const STEP_OPTIONS = Object.freeze({
    recoverPlayerFalls: false,
    resolveCheckpointProgress: false,
    resolveSummitProgress: false,
    resolvePlayerProjectileHits: false,
    spawnPlayerProjectiles: false,
    recoverPlayerDeaths: false,
    advanceInputDrivenObjects: false,
    resolveInteractChoice: false
});

function requireCondition(condition, message) {
    if (!condition) throw new Error(message);
}

function movePlayer(simulation, playerId, position) {
    const state = simulation.playerState(playerId);
    simulation.applyOwnerMotion(playerId, {
        ...state,
        position,
        velocity: { x: 0, y: 0 }
    });
}

function groupSnapshot(simulation) {
    return simulation.snapshot().enemies.filter(({ swarmGroupId }) => swarmGroupId === DIAGNOSTIC.groupId);
}

function groupMetrics(group) {
    const center = group.reduce((sum, member) => sum.add(member.position), new Vector2()).scale(1 / group.length);
    const centerDistances = group
        .map(({ position }) => Math.hypot(position.x - center.x, position.y - center.y))
        .sort((left, right) => left - right);
    const averageVelocity = group.reduce((sum, member) => sum.add(member.velocity), new Vector2()).normalize();
    const alignment =
        group.reduce((sum, member) => {
            const velocity = new Vector2(member.velocity.x, member.velocity.y);
            return sum + (velocity.length() > 0 ? velocity.normalize().dot(averageVelocity) : 1);
        }, 0) / group.length;
    let minimumMemberDistance = Number.POSITIVE_INFINITY;
    for (let left = 0; left < group.length; left += 1) {
        for (let right = left + 1; right < group.length; right += 1) {
            minimumMemberDistance = Math.min(
                minimumMemberDistance,
                Math.hypot(
                    group[left].position.x - group[right].position.x,
                    group[left].position.y - group[right].position.y
                )
            );
        }
    }
    return Object.freeze({
        alignment,
        minimumMemberDistance,
        p90Radius: centerDistances[Math.ceil(centerDistances.length * 0.9) - 1]
    });
}

function positionDigest(group) {
    return group
        .map(({ id, position, velocity }) =>
            [id, position.x, position.y, velocity.x, velocity.y]
                .map((value) => (Number.isFinite(value) ? value.toFixed(6) : value))
                .join(":")
        )
        .join("|");
}

function runDiagnostic() {
    const simulation = createCurrentGameSimulation({
        worldSeed: DIAGNOSTIC.worldSeed,
        startAreaId: DIAGNOSTIC.startAreaId
    });
    const playerId = simulation.getPrimaryPlayerId();
    const initialPlayer = simulation.playerState(playerId);
    simulation.restoreOwnerPrediction(playerId, {
        ...initialPlayer,
        health: DIAGNOSTIC.diagnosticHealth,
        maxHealth: DIAGNOSTIC.diagnosticHealth
    });
    movePlayer(simulation, playerId, DIAGNOSTIC.initialTarget);

    let tick = 0;
    let recoilObserved = false;
    let recoveryTicks = 0;
    let alignmentTotal = 0;
    let alignmentSamples = 0;
    let minimumMemberDistance = Number.POSITIVE_INFINITY;
    while (tick < DIAGNOSTIC.maximumTicks && recoveryTicks < DIAGNOSTIC.recoveryTicks) {
        tick += 1;
        simulation.stepCommandBatch(DIAGNOSTIC.fixedDt, { tick, commands: [] }, STEP_OPTIONS);
        const group = groupSnapshot(simulation);
        requireCondition(group.length === DIAGNOSTIC.expectedMemberCount, `swarm member count changed at tick ${tick}`);
        requireCondition(
            group.every(({ position, velocity }) =>
                [position.x, position.y, velocity.x, velocity.y].every(Number.isFinite)
            ),
            `swarm produced non-finite motion at tick ${tick}`
        );
        const recoiling = group.some(({ behaviorState }) => behaviorState.state === SWARM_BEHAVIOR_STATE.RECOIL);
        if (recoiling && !recoilObserved) {
            recoilObserved = true;
            movePlayer(simulation, playerId, DIAGNOSTIC.recoveryTarget);
        }
        recoveryTicks = recoilObserved && !recoiling ? recoveryTicks + 1 : 0;
        const metrics = groupMetrics(group);
        alignmentTotal += metrics.alignment;
        alignmentSamples += 1;
        minimumMemberDistance = Math.min(minimumMemberDistance, metrics.minimumMemberDistance);
    }

    const group = groupSnapshot(simulation);
    const recoveryMetrics = groupMetrics(group);
    const result = Object.freeze({
        tick,
        memberCount: group.length,
        awakened: group.every(({ awakened }) => awakened),
        recoilObserved,
        recoveryTicks,
        minimumMemberDistance,
        averageAlignment: alignmentTotal / alignmentSamples,
        recoveryP90Radius: recoveryMetrics.p90Radius,
        digest: positionDigest(group)
    });
    requireCondition(result.awakened, "swarm did not awaken in the authored activation band");
    requireCondition(result.recoilObserved, "swarm contact recoil was not observed");
    requireCondition(result.recoveryTicks === DIAGNOSTIC.recoveryTicks, "swarm did not complete regrouping window");
    requireCondition(
        result.minimumMemberDistance >= DIAGNOSTIC.minimumDeepOverlapDistance,
        `swarm members deeply overlapped: ${result.minimumMemberDistance}`
    );
    requireCondition(
        result.averageAlignment >= DIAGNOSTIC.minimumAverageAlignment,
        `swarm alignment fell below threshold: ${result.averageAlignment}`
    );
    requireCondition(
        result.recoveryP90Radius <= DIAGNOSTIC.maximumRecoveryP90Radius,
        `swarm did not regroup inside the expected radius: ${result.recoveryP90Radius}`
    );
    return result;
}

const first = runDiagnostic();
const second = runDiagnostic();
requireCondition(first.digest === second.digest, "same seed and input produced different swarm trajectories");
console.log(
    JSON.stringify(
        {
            worldSeed: DIAGNOSTIC.worldSeed,
            startAreaId: DIAGNOSTIC.startAreaId,
            memberCount: first.memberCount,
            recoilObserved: first.recoilObserved,
            minimumMemberDistance: first.minimumMemberDistance,
            averageAlignment: first.averageAlignment,
            recoveryP90Radius: first.recoveryP90Radius,
            deterministic: true
        },
        null,
        2
    )
);
