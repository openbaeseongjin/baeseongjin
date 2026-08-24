import { deserializeCommandReceipt } from "../network/CommandReceipt.js";
import { createAugmentImpactReceipt } from "../network/AugmentImpactClaim.js";
import { createCheckpointClaimReceipt } from "../network/CheckpointClaim.js";
import { MULTIPLAYER_ERROR_CODE, MULTIPLAYER_MESSAGE_TYPE } from "../network/MultiplayerMessageDefinition.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { createOwnerMotionReceipt } from "../network/OwnerMotionState.js";
import {
    createPlayerImpactReceipt,
    createPlayerImpactStateDigest,
    PLAYER_IMPACT_SOURCE_KIND
} from "../network/PlayerImpactClaim.js";
import { createPlayerProjectileSpawnReceipt } from "../network/PlayerProjectileSpawnClaim.js";
import { createProjectileHitReceipt } from "../network/ProjectileHitClaim.js";
import { createRopeImpactReceipt } from "../network/RopeImpactClaim.js";
import { createSummitClaimReceipt } from "../network/SummitClaim.js";
import { RemoteCommandStream } from "./RemoteCommandStream.js";

const SESSION_ERROR = Object.freeze({
    [MULTIPLAYER_ERROR_CODE.CHANNEL_FULL]: (m) => `채널 ${m.channelId ?? ""}의 인원이 가득 찼습니다.`,
    [MULTIPLAYER_ERROR_CODE.CHANNEL_NOT_FOUND]: (m) => `채널 ${m.channelId ?? ""}을 찾을 수 없습니다.`
});

const SERVER_MESSAGE_HANDLER = Object.freeze({
    [MULTIPLAYER_MESSAGE_TYPE.ERROR]: (m, c) =>
        c.failSession(
            SESSION_ERROR[m.code]?.(m) ?? m.message ?? m.code ?? "멀티 서버 요청이 거부되었습니다.",
            1008,
            "server rejected session"
        ),
    [MULTIPLAYER_MESSAGE_TYPE.WELCOME]: (m, c) => {
        const a = c.authority;
        a.playerId = m.playerId;
        a.channelId = m.channelId;
        a.snapshotFlowControl = m.snapshotFlowControl === true;
        a.stream = new RemoteCommandStream({ playerId: a.playerId, inputLeadTicks: MULTIPLAYER_TIMING.inputLeadTicks });
        a.acceptSnapshot(m.snapshot);
        c.settle();
    },
    [MULTIPLAYER_MESSAGE_TYPE.SNAPSHOT]: (m, c) => c.authority.acceptSnapshot(m.payload),
    [MULTIPLAYER_MESSAGE_TYPE.RECEIPT]: (m, c) => {
        if (!c.authority.stream) return;
        const receipt = deserializeCommandReceipt(m.payload);
        c.authority.recordReceipt(receipt);
        c.authority.stream.acceptReceipt(receipt);
    },
    [MULTIPLAYER_MESSAGE_TYPE.AUGMENT_SELECTION_RECEIPT]: (m, c) =>
        c.authority.augmentSelectionReceipts.push(Object.freeze({ ...m.payload })),
    [MULTIPLAYER_MESSAGE_TYPE.HIT_CLAIM_RECEIPT]: (m, c) =>
        c.authority.recordHitClaimReceipt(createProjectileHitReceipt(m.payload)),
    [MULTIPLAYER_MESSAGE_TYPE.PROJECTILE_SPAWN_CLAIM_RECEIPT]: (m, c) => {
        const receipt = createPlayerProjectileSpawnReceipt(m.payload);
        c.authority.projectileSpawnClaimReceipts.push(receipt);
        c.authority.ownerRuntime?.recordProjectileSpawnReceipt(receipt);
    },
    [MULTIPLAYER_MESSAGE_TYPE.IMPACT_CLAIM_RECEIPT]: (m, c) => {
        const a = c.authority;
        const receipt = createPlayerImpactReceipt(m.payload);
        const pending = a.pendingImpactClaims.get(receipt.impactId);
        if (receipt.accepted && receipt.resolution === "recovery-required" && pending) {
            const recovery = a.ownerRuntime?.impactRecoveryState();
            if (!recovery) throw new Error("impact recovery requires an owner state");
            a.submitImpactClaim(pending.event, {
                ...pending.outcome,
                recoveryId: receipt.recoveryId,
                stateTick: recovery.stateTick,
                digest: createPlayerImpactStateDigest(recovery.state, {
                    impactType: pending.event.resolution,
                    respawned: pending.outcome.respawned
                }),
                state: recovery.state
            });
            return;
        }
        a.pendingImpactClaims.delete(receipt.impactId);
        if (!receipt.accepted && pending?.event.parameters?.sourceKind === PLAYER_IMPACT_SOURCE_KIND.HARDPOINT_JAMMER) {
            a.locallyPredictedJammerImpactIds.delete(receipt.impactId);
        }
        a.impactClaimReceipts.push(receipt);
        a.ownerRuntime?.recordImpactReceipt(receipt, a.latestSnapshot);
    },
    [MULTIPLAYER_MESSAGE_TYPE.ROPE_IMPACT_RECEIPT]: (m, c) => {
        const a = c.authority;
        const receipt = createRopeImpactReceipt(m.payload);
        a.ropeImpactReceipts.push(receipt);
        if (!receipt.accepted) {
            a.locallyPredictedRopeImpactIds.delete(receipt.predictionId);
            a.predictedRopeImpactResolutions.delete(receipt.predictionId);
        }
    },
    [MULTIPLAYER_MESSAGE_TYPE.AUGMENT_IMPACT_RECEIPT]: (m, c) => {
        const a = c.authority;
        const receipt = createAugmentImpactReceipt(m.payload);
        a.recordAugmentImpactReceipt(receipt);
    },
    [MULTIPLAYER_MESSAGE_TYPE.OWNER_MOTION_RECEIPT]: (m, c) =>
        c.authority.recordOwnerMotionReceipt(createOwnerMotionReceipt(m.payload)),
    [MULTIPLAYER_MESSAGE_TYPE.DEBUG_TELEPORT_RECEIPT]: (m, c) =>
        c.authority.debugTeleportReceipts.push(Object.freeze({ ...m.payload })),
    [MULTIPLAYER_MESSAGE_TYPE.CHECKPOINT_CLAIM_RECEIPT]: (m, c) =>
        c.authority.recordCheckpointClaimReceipt(createCheckpointClaimReceipt(m.payload)),
    [MULTIPLAYER_MESSAGE_TYPE.SUMMIT_CLAIM_RECEIPT]: (m, c) =>
        c.authority.recordSummitClaimReceipt(createSummitClaimReceipt(m.payload)),
    [MULTIPLAYER_MESSAGE_TYPE.PLAYER_LEFT]: () => {}
});

export function routeServerMessage(message, context) {
    const handler = SERVER_MESSAGE_HANDLER[message?.type];
    if (!handler) throw new Error(`unsupported server message: ${message?.type ?? "missing type"}`);
    return handler(message, context);
}
