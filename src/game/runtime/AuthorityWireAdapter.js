import { serializeCommandReceipt } from "../network/CommandReceipt.js";
import { deserializeArtifactSelectionClaim } from "../network/ArtifactSelectionClaim.js";
import { deserializePlayerCommandBatch } from "../network/PlayerCommandBatch.js";
import { deserializeProjectileHitClaim } from "../network/ProjectileHitClaim.js";
import { deserializePlayerImpactClaim } from "../network/PlayerImpactClaim.js";
import { deserializeOwnerMotionState } from "../network/OwnerMotionState.js";
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

    receiveImpactClaim(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitImpactClaim(authenticatedPlayerId, deserializePlayerImpactClaim(serializedClaim));
    }

    receiveArtifactSelection(authenticatedPlayerId, serializedClaim) {
        if (typeof serializedClaim !== "string") throw new Error("serializedClaim must be a string");
        return this.session.submitArtifactSelection(
            authenticatedPlayerId,
            deserializeArtifactSelectionClaim(serializedClaim)
        );
    }

    receiveOwnerMotion(authenticatedPlayerId, serializedState) {
        if (typeof serializedState !== "string") throw new Error("serializedState must be a string");
        return this.session.submitOwnerMotion(authenticatedPlayerId, deserializeOwnerMotionState(serializedState));
    }

    advance() {
        const snapshot = this.session.advance();
        return snapshot ? serializeWorldSnapshotEnvelope(snapshot) : null;
    }

    snapshot(options) {
        return serializeWorldSnapshotEnvelope(this.session.snapshot(options));
    }
}
