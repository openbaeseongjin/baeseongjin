import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { WebSocket } from "ws";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { ClientCombatFeedback } from "../src/game/combat/ClientCombatFeedback.js";
import { CLIENT_FEEDBACK_PRESET_ID } from "../src/game/combat/ClientFeedbackEventDefinition.js";
import { PLATFORM_COLLISION_DAMAGE_EVENT_TYPE } from "../src/game/combat/PlatformCollisionDamage.js";
import {
    LOWER_SECTOR_COMMANDER_GRAB_STAGE,
    LOWER_SECTOR_COMMANDER_HAZARD,
    LOWER_SECTOR_COMMANDER_OBJECT_KIND
} from "../src/game/boss/LowerSectorCommanderDefinition.js";
import { RemoteGameAuthority } from "../src/game/runtime/RemoteGameAuthority.js";
import { channelSocketUrl } from "../src/game/runtime/MultiplayerServerEndpoint.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { CombatStatusEffectPool } from "../src/game/status-effects/CombatStatusEffectPool.js";
import { STATUS_EFFECT_ID } from "../src/game/status-effects/StatusEffectDefinition.js";
import { SPELL_ID, SPELL_SLOT_ID } from "../src/game/spells/SpellDefinition.js";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";
import { createGameServerRequestHandler } from "./gameServerHandler.mjs";
import {
    MULTIPLAYER_COMBAT_SIMULATION_ID,
    multiplayerCombatSimulationCoverageSnapshot
} from "./multiplayerCombatSimulationCoverage.mjs";

const TEST_ORIGIN = "https://openbaeseongjin.github.io";
const SERVER_READY_TIMEOUT_MS = 10_000;
const GAMEPLAY_TIMEOUT_MS = 5_000;
const POLL_INTERVAL_MS = 10;
const SERVER_OUTPUT_LIMIT = 8_000;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function appendOutput(current, chunk) {
    return `${current}${chunk}`.slice(-SERVER_OUTPUT_LIMIT);
}

function websocketFromOrigin(origin) {
    return class OriginWebSocket extends WebSocket {
        constructor(url) {
            super(url, { origin });
        }
    };
}

function serverExitError(runtime, context) {
    const exit = runtime.exit;
    const details = runtime.stderr.trim() || runtime.stdout.trim() || "서버 출력 없음";
    return new Error(
        `${context}: 실제 멀티 서버가 종료되었습니다 (code=${exit?.code ?? "running"}, signal=${exit?.signal ?? "none"}).\n${details}`
    );
}

function waitFor(predicate, message, runtime, timeoutMs = GAMEPLAY_TIMEOUT_MS) {
    const deadline = performance.now() + timeoutMs;
    return new Promise((resolve, reject) => {
        const poll = () => {
            if (runtime.exit) return reject(serverExitError(runtime, message));
            try {
                const value = predicate();
                if (value) return resolve(value);
            } catch (error) {
                return reject(error);
            }
            if (performance.now() >= deadline) return reject(new Error(message));
            setTimeout(poll, POLL_INTERVAL_MS);
        };
        poll();
    });
}

async function startServer() {
    const child = spawn(
        process.execPath,
        [
            "scripts/multiplayer-server.mjs",
            "--game-only",
            "--host=127.0.0.1",
            "--port=0",
            `--allowed-origins=${TEST_ORIGIN}`
        ],
        { cwd: new URL("..", import.meta.url), stdio: ["ignore", "pipe", "pipe"], windowsHide: true }
    );
    const runtime = { child, stdout: "", stderr: "", exit: null, serverUrl: null };
    child.stdout.on("data", (chunk) => {
        runtime.stdout = appendOutput(runtime.stdout, String(chunk));
        const port = runtime.stdout.match(/http:\/\/127\.0\.0\.1:(\d+)/)?.[1];
        if (port) runtime.serverUrl = `http://127.0.0.1:${port}`;
    });
    child.stderr.on("data", (chunk) => {
        runtime.stderr = appendOutput(runtime.stderr, String(chunk));
    });
    child.once("exit", (code, signal) => {
        runtime.exit = { code, signal };
    });
    await waitFor(() => runtime.serverUrl, "실제 멀티 서버가 준비되지 않았습니다", runtime, SERVER_READY_TIMEOUT_MS);
    return runtime;
}

async function stopServer(runtime) {
    if (!runtime || runtime.exit) return;
    const stopped = new Promise((resolve) => runtime.child.once("exit", resolve));
    runtime.child.kill();
    await stopped;
}

async function startInspectableServer(debugAugmentIds, { startAreaId = null } = {}) {
    const httpServer = createServer(createGameServerRequestHandler({ version: "wire-test" }));
    const multiplayer = new MultiplayerGameServer(httpServer, {
        allowedOrigins: [TEST_ORIGIN],
        channelNumber: () => 9001,
        worldSeed: () => 1,
        createSimulation: (options) =>
            createCurrentGameSimulation({ ...options, debugAugmentIds, ...(startAreaId ? { startAreaId } : {}) })
    });
    await new Promise((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(0, "127.0.0.1", resolve);
    });
    const address = httpServer.address();
    if (!address || typeof address !== "object") throw new Error("검사 가능한 멀티 서버 포트를 확인하지 못했습니다");
    return {
        exit: null,
        stdout: "",
        stderr: "",
        serverUrl: `http://127.0.0.1:${address.port}`,
        multiplayer,
        async stop() {
            await multiplayer.close();
            if (!httpServer.listening) return;
            await new Promise((resolve, reject) => {
                httpServer.close((error) => (error ? reject(error) : resolve()));
            });
        }
    };
}

async function closeAuthority(authority) {
    const socket = authority?.socket;
    if (!socket || socket.readyState === WebSocket.CLOSED) return;
    const closed = new Promise((resolve) => socket.addEventListener("close", resolve, { once: true }));
    authority.close();
    await closed;
}

function combatCommand(commandSequence, commandKey, aimWorld) {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact: false,
            interactSequence: 0,
            spellCommand: { commandSequence, commandKey },
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        aimWorld
    );
}

function movementCommand(horizontal, aimWorld) {
    return createPlayerCommand(
        {
            horizontal,
            vertical: 0,
            interact: false,
            interactSequence: 0,
            spellCommand: { commandSequence: 0, commandKey: null },
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        aimWorld
    );
}

function distance(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function health(serverUrl) {
    const response = await fetch(`${serverUrl}/health`, { cache: "no-store" });
    if (!response.ok) throw new Error(`멀티 서버 health 실패: HTTP ${response.status}`);
    const state = await response.json();
    assert(state.status === "ok", "멀티 서버 health가 ok가 아닙니다");
    return state;
}

function activeStatus(statusEffects, effectId) {
    return statusEffects?.effects?.find(({ id }) => id === effectId && statusEffects.effects) ?? null;
}

function particleEffects(events, viewerId) {
    const feedback = new ClientCombatFeedback({ viewerId });
    feedback.apply(events);
    return feedback.snapshot();
}

function statusParticleEmission(statusEffects, effectId) {
    const pool = new CombatStatusEffectPool();
    pool.restore(statusEffects);
    const requests = [];
    const emitted = pool.draw({
        position: { x: 0, y: 0 },
        radius: 18,
        velocity: { x: 0, y: 0 },
        angle: 0,
        particles: {
            appendStatusParticles(request) {
                requests.push(request);
                return request.spec.count;
            }
        }
    });
    const request = requests.find((entry) => entry.effectId === effectId);
    assert(request, `${effectId} 상태가 실제 status particle 요청을 만들지 않았습니다`);
    assert(emitted === request.spec.count, `${effectId} status particle 방출 수가 definition과 일치하지 않습니다`);
    return Object.freeze({ emitted, effectId: request.effectId, particleCount: request.spec.count });
}

async function simulateEnergyOrbWire() {
    const runtime = await startServer();
    const WebSocketImpl = websocketFromOrigin(TEST_ORIGIN);
    const first = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, "new"), WebSocketImpl });
    let second = null;
    try {
        const initialHealth = await health(runtime.serverUrl);
        await first.connect();
        second = new RemoteGameAuthority({
            url: channelSocketUrl(runtime.serverUrl, first.channelId),
            WebSocketImpl
        });
        await second.connect();
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 2 && second.latestSnapshot?.state.players.length === 2,
            "두 production WebSocket 클라이언트가 같은 2인 snapshot을 받지 못했습니다",
            runtime
        );

        const sourceId = first.playerId;
        const victimId = second.playerId;
        const victimBefore = second.ownerState();
        const cast = combatCommand(1, SPELL_SLOT_ID.BASIC_ATTACK, victimBefore.position);
        const predictedSource = first.advance(cast);
        assert(
            predictedSource?.augmentRuntimeState?.combat?.spellProjectiles.length === 1,
            "공격 owner의 실제 Spell runtime이 live projectile을 만들지 않았습니다"
        );
        const castEvents = first.drainPredictedEvents();
        const castFeedback = particleEffects(castEvents, sourceId);
        const castParticles = castFeedback.combatEffects.filter(
            ({ type, presetId }) => type === "particle" && presetId === CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT
        );
        assert(castParticles.length > 0, "Energy Orb cast event가 player-shot particle을 생성하지 않았습니다");
        assert(first.submit(cast), "공격 owner가 실제 command/owner-motion을 전송하지 못했습니다");

        const remoteProjectile = await waitFor(
            () => {
                const source = second.latestSnapshot?.state.players.find(({ id }) => id === sourceId);
                return source?.augmentRuntimeState?.combat?.spellProjectiles?.[0] ?? null;
            },
            "live Spell projectile이 production snapshot wire를 통과하지 못했습니다",
            runtime
        );

        const collision = second.resolveOwnerCollisions(
            second.latestSnapshot.state.players.filter(({ id }) => id !== victimId)
        );
        const impact = collision?.incomingSpellImpacts?.[0];
        assert(impact, "피해 클라이언트가 remote live projectile 적중을 판정하지 못했습니다");
        const impactEvents = second.drainPredictedEvents();
        const impactFeedback = particleEffects(impactEvents, victimId);
        const impactParticles = impactFeedback.combatEffects.filter(({ type }) => type === "particle");
        assert(impactParticles.length > 0, "Energy Orb impact event가 combat particle을 생성하지 않았습니다");
        const predictedVictimHealth = second.ownerState().health;
        assert(predictedVictimHealth < victimBefore.health, "피해 클라이언트 HP가 로컬에서 먼저 감소하지 않았습니다");
        assert(second.submitIncomingSpellImpact(impact), "피해 클라이언트가 impact claim을 전송하지 못했습니다");

        const receipt = await waitFor(
            () => second.drainAugmentImpactReceipts().find(({ eventId }) => eventId === impact.eventId) ?? null,
            "피해 클라이언트가 impact receipt를 받지 못했습니다",
            runtime
        );
        assert(receipt.accepted, `impact claim이 거부되었습니다: ${receipt.reason ?? "unknown"}`);
        const postImpactSnapshotSequence = second.latestSnapshot.snapshotSequence;
        await waitFor(
            () => {
                const sharedVictim = first.latestSnapshot?.state.players.find(({ id }) => id === victimId);
                return (
                    sharedVictim?.health === predictedVictimHealth &&
                    second.latestSnapshot?.snapshotSequence > postImpactSnapshotSequence
                );
            },
            "적중 뒤 서버·동료 상태 수렴과 후속 snapshot을 확인하지 못했습니다",
            runtime
        );
        const finalHealth = await health(runtime.serverUrl);
        assert(!runtime.exit, "적중 뒤 실제 멀티 서버가 생존하지 못했습니다");

        return Object.freeze({
            serverVersion: finalHealth.version,
            initialServerStatus: initialHealth.status,
            channelId: first.channelId,
            sourceId,
            victimId,
            projectileId: remoteProjectile.id,
            impactId: impact.eventId,
            victimHealthBefore: victimBefore.health,
            victimHealthAfter: predictedVictimHealth,
            receiptAccepted: receipt.accepted,
            castParticleCount: castParticles.length,
            impactParticleCount: impactParticles.length,
            serverAliveAfterImpact: true
        });
    } finally {
        await closeAuthority(second);
        await closeAuthority(first);
        await stopServer(runtime);
    }
}

async function simulateMeteorParticleWire() {
    const runtime = await startInspectableServer([SPELL_ID.METEOR]);
    const WebSocketImpl = websocketFromOrigin(TEST_ORIGIN);
    const first = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, "new"), WebSocketImpl });
    let second = null;
    try {
        await first.connect();
        second = new RemoteGameAuthority({
            url: channelSocketUrl(runtime.serverUrl, first.channelId),
            WebSocketImpl
        });
        await second.connect();
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 2 && second.latestSnapshot?.state.players.length === 2,
            "Meteor particle 시나리오의 두 클라이언트가 같은 2인 snapshot을 받지 못했습니다",
            runtime
        );

        const sourceId = first.playerId;
        const victimId = second.playerId;
        const room = runtime.multiplayer.rooms.get(first.channelId);
        const serverVictim = room?.simulation.players.find(({ id }) => id === victimId);
        const localVictim = second.ownerRuntime?.simulation.players.find(({ id }) => id === victimId);
        assert(serverVictim && localVictim, "Meteor 시나리오의 피해 Player runtime을 찾지 못했습니다");
        serverVictim.maxHealth = 500;
        serverVictim.health = 500;
        localVictim.maxHealth = 500;
        localVictim.health = 500;
        await waitFor(
            () => {
                const source = second.latestSnapshot?.state.players.find(({ id }) => id === sourceId);
                const victim = first.latestSnapshot?.state.players.find(({ id }) => id === victimId);
                return source?.selectedAugmentIds?.includes(SPELL_ID.METEOR) && victim?.health === 500;
            },
            "Meteor loadout과 피해 Player health 설정이 production snapshot에 수렴하지 않았습니다",
            runtime
        );

        const victimBefore = second.ownerState();
        const cast = combatCommand(1, SPELL_SLOT_ID.POWER_ATTACK, victimBefore.position);
        const predictedSource = first.advance(cast);
        assert(
            predictedSource?.augmentRuntimeState?.combat?.spellProjectiles[0]?.spellId === SPELL_ID.METEOR,
            "공격 owner의 실제 Spell runtime이 Meteor projectile을 만들지 않았습니다"
        );
        const castEvents = first.drainPredictedEvents();
        const castEvent = castEvents.find(
            ({ eventType, spellId }) => eventType === "predicted-spell-cast-started" && spellId === SPELL_ID.METEOR
        );
        assert(castEvent, "Meteor predicted cast feedback event가 생성되지 않았습니다");
        const castFeedback = particleEffects(castEvents, sourceId);
        const castParticles = castFeedback.combatEffects.filter(
            ({ type, presetId }) => type === "particle" && presetId === CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE
        );
        assert(castParticles.length > 0, "Meteor cast event가 artillery particle을 생성하지 않았습니다");
        assert(first.submit(cast), "Meteor owner가 실제 command/owner-motion을 전송하지 못했습니다");

        await waitFor(
            () => {
                const source = second.latestSnapshot?.state.players.find(({ id }) => id === sourceId);
                return source?.augmentRuntimeState?.combat?.spellProjectiles?.find(
                    ({ spellId }) => spellId === SPELL_ID.METEOR
                );
            },
            "Meteor live projectile이 production snapshot wire를 통과하지 못했습니다",
            runtime
        );
        const collision = second.resolveOwnerCollisions(
            second.latestSnapshot.state.players.filter(({ id }) => id !== victimId)
        );
        const impact = collision?.incomingSpellImpacts?.find(({ effectId }) => effectId === SPELL_ID.METEOR);
        assert(impact, "피해 클라이언트가 remote Meteor 적중을 판정하지 못했습니다");
        const impactEvents = second.drainPredictedEvents();
        const impactFeedback = particleEffects(impactEvents, victimId);
        const impactParticles = impactFeedback.combatEffects.filter(({ type }) => type === "particle");
        assert(impactParticles.length > 0, "Meteor impact feedback event가 combat particle을 생성하지 않았습니다");
        const localIgnited = activeStatus(second.ownerState().statusEffects, STATUS_EFFECT_ID.IGNITED);
        assert(localIgnited?.active, "Meteor 피해 뒤 피해자 로컬 Ignited 상태가 활성화되지 않았습니다");
        assert(localIgnited.sourceId === sourceId, "피해자 로컬 Ignited source Player가 일치하지 않습니다");
        const localStatusParticles = statusParticleEmission(
            second.ownerState().statusEffects,
            STATUS_EFFECT_ID.IGNITED
        );
        assert(second.submitIncomingSpellImpact(impact), "피해 클라이언트가 Meteor impact claim을 전송하지 못했습니다");

        const receipt = await waitFor(
            () => second.drainAugmentImpactReceipts().find(({ eventId }) => eventId === impact.eventId) ?? null,
            "Meteor impact receipt를 받지 못했습니다",
            runtime
        );
        assert(receipt.accepted, `Meteor impact claim이 거부되었습니다: ${receipt.reason ?? "unknown"}`);
        const postImpactSnapshotSequence = second.latestSnapshot.snapshotSequence;
        const sharedVictim = await waitFor(
            () => {
                const victim = first.latestSnapshot?.state.players.find(({ id }) => id === victimId);
                const ignited = activeStatus(victim?.statusEffects, STATUS_EFFECT_ID.IGNITED);
                return ignited?.active && second.latestSnapshot?.snapshotSequence > postImpactSnapshotSequence
                    ? victim
                    : null;
            },
            "Meteor 뒤 서버·동료 Ignited 상태와 후속 snapshot이 수렴하지 않았습니다",
            runtime
        );
        const sharedIgnited = activeStatus(sharedVictim.statusEffects, STATUS_EFFECT_ID.IGNITED);
        assert(sharedIgnited.sourceId === sourceId, "서버·동료 Ignited source Player가 일치하지 않습니다");
        const sharedStatusParticles = statusParticleEmission(sharedVictim.statusEffects, STATUS_EFFECT_ID.IGNITED);
        const finalHealth = await health(runtime.serverUrl);

        return Object.freeze({
            serverStatus: finalHealth.status,
            sourceId,
            victimId,
            impactId: impact.eventId,
            victimHealthBefore: victimBefore.health,
            victimHealthAfter: second.ownerState().health,
            receiptAccepted: receipt.accepted,
            ignitedLocal: localIgnited.active,
            ignitedShared: true,
            castParticleCount: castParticles.length,
            impactParticleCount: impactParticles.length,
            localStatusParticles,
            sharedStatusParticles,
            serverAliveAfterIgnitedImpact: true
        });
    } finally {
        await closeAuthority(second);
        await closeAuthority(first);
        await runtime.stop();
    }
}

async function simulateSessionLifecycleWire() {
    const runtime = await startInspectableServer([]);
    const WebSocketImpl = websocketFromOrigin(TEST_ORIGIN);
    const first = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, "new"), WebSocketImpl });
    let second = null;
    try {
        await first.connect();
        second = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, first.channelId), WebSocketImpl });
        await second.connect();
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 2,
            "2인 참가 snapshot을 받지 못했습니다",
            runtime
        );
        const channelId = first.channelId;
        await closeAuthority(second);
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 1 && runtime.multiplayer.rooms.has(channelId),
            "한 명 퇴장 뒤 1인 world가 유지되지 않았습니다",
            runtime
        );
        await closeAuthority(first);
        await waitFor(
            () => !runtime.multiplayer.rooms.has(channelId),
            "마지막 퇴장 뒤 빈 방이 삭제되지 않았습니다",
            runtime
        );
        return Object.freeze({ channelId, playersJoined: 2, playersAfterLeave: 1, emptyRoomRemoved: true });
    } finally {
        await closeAuthority(second);
        await closeAuthority(first);
        await runtime.stop();
    }
}

async function simulateOwnerMotionNeutralWorldWire() {
    const runtime = await startInspectableServer([]);
    const WebSocketImpl = websocketFromOrigin(TEST_ORIGIN);
    const first = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, "new"), WebSocketImpl });
    let second = null;
    try {
        await first.connect();
        second = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, first.channelId), WebSocketImpl });
        await second.connect();
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 2 && second.latestSnapshot?.state.players.length === 2,
            "이동 시나리오의 2인 snapshot을 받지 못했습니다",
            runtime
        );
        const sourceId = first.playerId;
        const teammateId = second.playerId;
        const sourceStart = first.ownerState().position;
        const command = movementCommand(1, { x: sourceStart.x + 400, y: sourceStart.y });
        for (let tick = 0; tick < 60; tick += 1) {
            first.advance(command);
            if (tick % 2 === 0) assert(first.submit(command), "이동 command를 전송하지 못했습니다");
            await delay(8);
        }
        const predictedSource = first.ownerState();
        assert(predictedSource.position.x > sourceStart.x, "owner가 일반 이동 입력에 반응하지 않았습니다");
        const sharedSource = await waitFor(
            () => {
                const source = second.latestSnapshot?.state.players.find(({ id }) => id === sourceId);
                return source && distance(source.position, predictedSource.position) <= 4 ? source : null;
            },
            "이동 owner 상태가 서버·동료 snapshot에 4px 이내로 수렴하지 않았습니다",
            runtime
        );
        const predictedTeammate = second.ownerState();
        assert(second.submitOwnerMotion(), "동료 owner-motion을 전송하지 못했습니다");
        const sharedTeammate = await waitFor(
            () => {
                const teammate = first.latestSnapshot?.state.players.find(({ id }) => id === teammateId);
                return teammate && distance(teammate.position, predictedTeammate.position) <= 4 ? teammate : null;
            },
            "동료가 자기 owner 위치로 독립 수렴하지 않았습니다",
            runtime
        );
        await waitFor(
            () =>
                first.latestSnapshot?.snapshotSequence === second.latestSnapshot?.snapshotSequence &&
                first.latestSnapshot.state.enemies.length > 0,
            "두 클라이언트가 Enemy를 포함한 같은 authority snapshot을 받지 못했습니다",
            runtime
        );
        assert(
            JSON.stringify(first.latestSnapshot.state.enemies) === JSON.stringify(second.latestSnapshot.state.enemies),
            "같은 authority snapshot의 Enemy 상태가 클라이언트별로 다릅니다"
        );
        const finalHealth = await health(runtime.serverUrl);
        return Object.freeze({
            serverStatus: finalHealth.status,
            sourceId,
            teammateId,
            sourceMovedX: predictedSource.position.x - sourceStart.x,
            convergenceDistance: distance(sharedSource.position, predictedSource.position),
            teammateConvergenceDistance: distance(sharedTeammate.position, predictedTeammate.position),
            enemyCount: first.latestSnapshot.state.enemies.length
        });
    } finally {
        await closeAuthority(second);
        await closeAuthority(first);
        await runtime.stop();
    }
}

async function simulateDeathRespawnWire() {
    const runtime = await startInspectableServer([]);
    const WebSocketImpl = websocketFromOrigin(TEST_ORIGIN);
    const first = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, "new"), WebSocketImpl });
    let second = null;
    try {
        await first.connect();
        second = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, first.channelId), WebSocketImpl });
        await second.connect();
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 2 && second.latestSnapshot?.state.players.length === 2,
            "사망 시나리오의 2인 snapshot을 받지 못했습니다",
            runtime
        );
        const sourceId = first.playerId;
        const victimId = second.playerId;
        const room = runtime.multiplayer.rooms.get(first.channelId);
        const serverVictim = room?.simulation.players.find(({ id }) => id === victimId);
        const localVictim = second.ownerRuntime?.simulation.players.find(({ id }) => id === victimId);
        assert(serverVictim && localVictim, "사망 시나리오의 피해 Player runtime을 찾지 못했습니다");
        serverVictim.health = 20;
        localVictim.health = 20;
        for (const victim of [serverVictim, localVictim]) {
            victim.experience.add(265);
            while (victim.experience.pendingRewardCount > 0) victim.experience.resolveNextReward();
        }
        const teammateBefore = first.ownerState();
        await waitFor(
            () => first.latestSnapshot?.state.players.find(({ id }) => id === victimId)?.health === 20,
            "피해 Player health 설정이 snapshot에 반영되지 않았습니다",
            runtime
        );
        const cast = combatCommand(1, SPELL_SLOT_ID.BASIC_ATTACK, second.ownerState().position);
        first.advance(cast);
        first.drainPredictedEvents();
        assert(first.submit(cast), "lethal Energy Orb command를 전송하지 못했습니다");
        await waitFor(
            () =>
                second.latestSnapshot?.state.players
                    .find(({ id }) => id === sourceId)
                    ?.augmentRuntimeState?.combat?.spellProjectiles?.some(
                        ({ spellId }) => spellId === SPELL_ID.ENERGY_ORB
                    ),
            "lethal Energy Orb가 production snapshot을 통과하지 못했습니다",
            runtime
        );
        const collision = second.resolveOwnerCollisions(
            second.latestSnapshot.state.players.filter(({ id }) => id !== victimId)
        );
        const impact = collision?.incomingSpellImpacts?.[0];
        assert(impact, "피해 클라이언트가 lethal Energy Orb를 판정하지 못했습니다");
        assert(
            second.ownerState().health === second.ownerState().maxHealth,
            "피해 Player가 로컬에서 즉시 부활하지 않았습니다"
        );
        assert(second.submitIncomingSpellImpact(impact), "lethal impact claim을 전송하지 못했습니다");
        const receipt = await waitFor(
            () => second.drainAugmentImpactReceipts().find(({ eventId }) => eventId === impact.eventId) ?? null,
            "lethal impact receipt를 받지 못했습니다",
            runtime
        );
        assert(receipt.accepted, `lethal impact claim이 거부되었습니다: ${receipt.reason ?? "unknown"}`);
        const sharedVictim = await waitFor(
            () => {
                const victim = first.latestSnapshot?.state.players.find(({ id }) => id === victimId);
                return victim?.health === victim?.maxHealth && victim.lifeState === "active" ? victim : null;
            },
            "피해 Player의 부활 상태가 서버·동료에 수렴하지 않았습니다",
            runtime
        );
        assert(
            sharedVictim.experience.totalExperience === 210,
            "사망 Player가 현재 레벨 요구 XP의 절반인 55를 잃지 않았습니다"
        );
        assert(
            sharedVictim.experience.level === 3 && sharedVictim.experience.resolvedRewardLevel === 4,
            "사망 뒤 현재 레벨은 내려가고 보상 완료 레벨은 유지되어야 합니다"
        );
        const teammateAfter = first.ownerState();
        assert(teammateAfter.health === teammateBefore.health, "동료 HP가 다른 Player 사망 때문에 바뀌었습니다");
        assert(
            distance(teammateAfter.position, teammateBefore.position) <= 4,
            "동료 위치가 다른 Player 부활 때문에 바뀌었습니다"
        );
        const finalHealth = await health(runtime.serverUrl);
        return Object.freeze({
            serverStatus: finalHealth.status,
            sourceId,
            victimId,
            receiptAccepted: receipt.accepted,
            victimHealthAfterRespawn: sharedVictim.health,
            victimLifeState: sharedVictim.lifeState,
            victimExperienceAfterDeath: sharedVictim.experience.totalExperience,
            victimRewardLevelPreserved: sharedVictim.experience.resolvedRewardLevel,
            teammatePreserved: true,
            serverAliveAfterRespawn: true
        });
    } finally {
        await closeAuthority(second);
        await closeAuthority(first);
        await runtime.stop();
    }
}

export async function simulateBoss03GrabSlamWire() {
    const runtime = await startInspectableServer([], { startAreaId: "3-8" });
    const WebSocketImpl = websocketFromOrigin(TEST_ORIGIN);
    const first = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, "new"), WebSocketImpl });
    let second = null;
    try {
        await first.connect();
        second = new RemoteGameAuthority({ url: channelSocketUrl(runtime.serverUrl, first.channelId), WebSocketImpl });
        await second.connect();
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 2 && second.latestSnapshot?.state.players.length === 2,
            "Boss03 wire 시나리오의 2인 snapshot을 받지 못했습니다",
            runtime
        );
        const room = runtime.multiplayer.rooms.get(first.channelId);
        const serverSimulation = room?.simulation;
        assert(serverSimulation, "Boss03 wire 시나리오의 서버 simulation을 찾지 못했습니다");
        const participantIds = [first.playerId, second.playerId];
        const started = serverSimulation.startBossEncounter(participantIds);
        assert(started.accepted, `Boss03 encounter를 시작하지 못했습니다: ${started.reason ?? "unknown"}`);
        const bossSnapshot = serverSimulation.bossStageSnapshot();
        const body = bossSnapshot.presentation.objects.find(
            ({ kind }) => kind === LOWER_SECTOR_COMMANDER_OBJECT_KIND.BODY
        );
        const floor = serverSimulation.world.surfaces.find(
            ({ bossStageId, kind }) => bossStageId === "boss-03" && kind === "commander-main-runway"
        );
        assert(body && floor, "Boss03 body 또는 main floor를 찾지 못했습니다");
        const floorY = Math.min(...floor.vertices.map(({ y }) => y));
        const victimPosition = Object.freeze({ x: body.position.x + 500, y: floorY - 15 });
        const teammatePosition = Object.freeze({ x: body.position.x - 500, y: floorY - 15 });
        serverSimulation.applyPortalTransition(
            second.playerId,
            victimPosition,
            serverSimulation.getTick(),
            "boss03-wire"
        );
        serverSimulation.applyPortalTransition(
            first.playerId,
            teammatePosition,
            serverSimulation.getTick(),
            "boss03-wire"
        );
        first.ownerRuntime.simulation.applyPortalTransition(
            first.playerId,
            teammatePosition,
            first.ownerRuntime.simulation.getTick(),
            "boss03-wire"
        );
        second.ownerRuntime.simulation.applyPortalTransition(
            second.playerId,
            victimPosition,
            second.ownerRuntime.simulation.getTick(),
            "boss03-wire"
        );
        first.submitOwnerMotion();
        second.submitOwnerMotion();
        serverSimulation.bossRuntime.beginGrab({ id: second.playerId, position: victimPosition });

        let hookSnapshotObserved = false;
        let hookSnapshotProgress = null;
        let minimumCapturedY = Number.POSITIVE_INFINITY;
        let localReboundVelocity = null;
        let peerReboundVelocity = null;
        let serverReboundVelocity = null;
        let platformDamagePredictionCount = 0;
        const expectedEyeY = body.position.y - 48;
        const deadline = performance.now() + 8_000;
        let sequence = 0;
        while (performance.now() < deadline) {
            sequence += 1;
            const firstCommand = movementCommand(0, first.ownerState().position);
            const secondCommand = movementCommand(0, second.ownerState().position);
            first.advance(firstCommand);
            second.advance(secondCommand);
            if (sequence % 2 === 0) {
                first.submit(firstCommand);
                second.submit(secondCommand);
            }
            const firstPredicted = first.drainPredictedEvents();
            const secondPredicted = second.drainPredictedEvents();
            for (const event of secondPredicted) {
                if (event.eventType === PLATFORM_COLLISION_DAMAGE_EVENT_TYPE.PREDICTED) {
                    platformDamagePredictionCount += 1;
                }
                if (event.parameters?.sourceKind === "boss-hazard") second.submitPredictedBossImpact(event);
            }
            for (const event of firstPredicted) {
                if (event.parameters?.sourceKind === "boss-hazard") first.submitPredictedBossImpact(event);
            }
            const sharedBoss = second.latestSnapshot?.state.bossStage;
            if (
                sharedBoss?.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.SEARCH &&
                sharedBoss.grabHookFlight?.active === true &&
                sharedBoss.grabHookFlight.progress > 0 &&
                sharedBoss.grabHookFlight.progress < 1
            ) {
                hookSnapshotObserved = true;
                hookSnapshotProgress = sharedBoss.grabHookFlight.progress;
            }
            const localVictim = second.ownerState();
            if (localVictim.health === 80) minimumCapturedY = Math.min(minimumCapturedY, localVictim.position.y);
            if (localVictim.health === 40 && localVictim.velocity.y < 0) {
                localReboundVelocity = localVictim.velocity.y;
            }
            const peerVictim = first.latestSnapshot?.state.players.find(({ id }) => id === second.playerId);
            if (peerVictim?.health === 40 && peerVictim.velocity.y < 0) peerReboundVelocity = peerVictim.velocity.y;
            const serverVictim = serverSimulation.players.find(({ id }) => id === second.playerId);
            if (serverVictim?.health === 40 && serverVictim.physics.physicsStepVelocity().y < 0) {
                serverReboundVelocity = serverVictim.physics.physicsStepVelocity().y;
            }
            if (
                hookSnapshotObserved &&
                Math.abs(minimumCapturedY - expectedEyeY) <= 0.2 &&
                localReboundVelocity !== null &&
                peerReboundVelocity !== null &&
                serverReboundVelocity !== null
            ) {
                break;
            }
            await delay(8);
        }
        const diagnostic = JSON.stringify({
            hookSnapshotObserved,
            hookSnapshotProgress,
            minimumCapturedY,
            expectedEyeY,
            localHealth: second.ownerState().health,
            localVelocity: second.ownerState().velocity,
            localReboundVelocity,
            peerReboundVelocity,
            serverReboundVelocity,
            platformDamagePredictionCount
        });
        assert(hookSnapshotObserved, "Boss03 hook tip 비행 snapshot이 두 클라이언트 wire를 통과하지 못했습니다");
        assert(
            Math.abs(minimumCapturedY - expectedEyeY) <= 0.2,
            "피해 클라이언트가 Boss03 눈높이 pull 위치에 수렴하지 못했습니다"
        );
        assert(localReboundVelocity < 0, `피해 클라이언트가 지형 충돌에서 위로 반동하지 않았습니다: ${diagnostic}`);
        assert(peerReboundVelocity < 0, `동료 snapshot에 Boss03 반동 속도가 수렴하지 않았습니다: ${diagnostic}`);
        assert(serverReboundVelocity < 0, `서버 snapshot에 Boss03 반동 속도가 수렴하지 않았습니다: ${diagnostic}`);
        assert(platformDamagePredictionCount === 0, "Boss03 slam 반동에 플랫폼 충돌 피해가 중복 발생했습니다");
        const finalHealth = await health(runtime.serverUrl);
        return Object.freeze({
            serverStatus: finalHealth.status,
            hookSnapshotObserved,
            hookSnapshotProgress,
            capturedEyeY: minimumCapturedY,
            localReboundVelocity,
            peerReboundVelocity,
            serverReboundVelocity,
            platformDamagePredictionCount,
            serverAliveAfterSlam: true
        });
    } finally {
        await closeAuthority(second);
        await closeAuthority(first);
        await runtime.stop();
    }
}

export async function simulateTwoPlayerCombatWire() {
    return Object.freeze({
        [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_SESSION_LIFECYCLE]: await simulateSessionLifecycleWire(),
        [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_OWNER_MOTION_NEUTRAL_WORLD]: await simulateOwnerMotionNeutralWorldWire(),
        [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_ENERGY_ORB_PLAYER_HIT]: await simulateEnergyOrbWire(),
        [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_METEOR_IGNITED_PRESENTATION]: await simulateMeteorParticleWire(),
        [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_DEATH_RESPAWN]: await simulateDeathRespawnWire(),
        [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_BOSS03_GRAB_SLAM]: await simulateBoss03GrabSlamWire()
    });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    if (process.argv.includes("--coverage")) {
        console.log(JSON.stringify(multiplayerCombatSimulationCoverageSnapshot(), null, 2));
    } else {
        simulateTwoPlayerCombatWire()
            .then((result) => console.log(`PASS two-player production wire combat ${JSON.stringify(result)}`))
            .catch((error) => {
                console.error(`FAIL two-player production wire combat: ${error.message}`);
                process.exitCode = 1;
            });
    }
}
