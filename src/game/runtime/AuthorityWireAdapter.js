import { serializeCommandReceipt } from "../network/CommandReceipt.js";
import { deserializeAugmentImpactClaim } from "../network/AugmentImpactClaim.js";
import { deserializeAugmentOfferClaim } from "../network/AugmentOfferClaim.js";
import { deserializeCheckpointClaim } from "../network/CheckpointClaim.js";
import { deserializeFoundationSelectionClaim } from "../network/FoundationSelectionClaim.js";
import { deserializePlayerCommandBatch } from "../network/PlayerCommandBatch.js";
import { deserializeProjectileHitClaim } from "../network/ProjectileHitClaim.js";
import { deserializePlayerImpactClaim } from "../network/PlayerImpactClaim.js";
import { deserializePlayerProjectileSpawnClaim } from "../network/PlayerProjectileSpawnClaim.js";
import { deserializeOwnerMotionState } from "../network/OwnerMotionState.js";
import { deserializeRopeImpactClaim } from "../network/RopeImpactClaim.js";
import { deserializeSummitClaim } from "../network/SummitClaim.js";
import { serializeWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";

export class AuthorityWireAdapter {
    constructor(session) {
        if (!session) throw new Error("session is required");
        this.session = session;
    }

    receiveCommand(authenticatedPlayerId, serializedBatch) {
        if (typeof serializedBatch !== "string") throw new Error("serializedBatch must be a string");
        const batch = deserializePlayerCommandBatch(serializedBatch);
        return serializeCommandReceipt(this.session.submit(authenticatedPlayerId, batch));
    }

    receiveHitClaim(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitHitClaim(authenticatedPlayerId, deserializeProjectileHitClaim(serializedClaim));
    }

    receiveProjectileSpawnClaim(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitProjectileSpawnClaim(
            authenticatedPlayerId,
            deserializePlayerProjectileSpawnClaim(serializedClaim)
        );
    }

    receiveImpactClaim(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitImpactClaim(authenticatedPlayerId, deserializePlayerImpactClaim(serializedClaim));
    }

    receiveFoundationSelection(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitFoundationSelection(
            authenticatedPlayerId,
            deserializeFoundationSelectionClaim(serializedClaim)
        );
    }

    receiveRopeImpact(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitRopeImpact(authenticatedPlayerId, deserializeRopeImpactClaim(serializedClaim));
    }

    receiveAugmentOffer(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitAugmentOffer(authenticatedPlayerId, deserializeAugmentOfferClaim(serializedClaim));
    }

    receiveAugmentImpact(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitAugmentImpact(authenticatedPlayerId, deserializeAugmentImpactClaim(serializedClaim));
    }

    receiveCheckpointClaim(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitCheckpointClaim(authenticatedPlayerId, deserializeCheckpointClaim(serializedClaim));
    }

    receiveSummitClaim(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitSummitClaim(authenticatedPlayerId, deserializeSummitClaim(serializedClaim));
    }

    receiveOwnerMotion(authenticatedPlayerId, serializedState) {
        if (typeof serializedState !== "string") throw new Error("serializedState must be a string");
        return this.session.submitOwnerMotion(authenticatedPlayerId, deserializeOwnerMotionState(serializedState));
    }

    receiveDebugTeleport(authenticatedPlayerId, serializedRequest) {
        if (typeof serializedRequest !== "string") throw new Error("serializedRequest must be a string");
        let request;
        try {
            request = JSON.parse(serializedRequest);
        } catch {
            throw new Error("invalid debug teleport request");
        }
        if (!request || typeof request.areaId !== "string") {
            throw new Error("debug teleport request requires areaId");
        }
        return this.session.debugTeleport(authenticatedPlayerId, request.areaId);
    }

    advance() {
        const snapshot = this.session.advance();
        return snapshot ? serializeWorldSnapshotEnvelope(snapshot) : null;
    }

    snapshot(options) {
        return serializeWorldSnapshotEnvelope(this.session.snapshot(options));
    }
}
