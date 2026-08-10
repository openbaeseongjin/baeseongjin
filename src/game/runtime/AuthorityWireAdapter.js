import { serializeCommandReceipt } from "../network/CommandReceipt.js";
import { deserializePlayerCommandBatch } from "../network/PlayerCommandBatch.js";
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

    advance() {
        const snapshot = this.session.advance();
        return snapshot ? serializeWorldSnapshotEnvelope(snapshot) : null;
    }

    snapshot() {
        return serializeWorldSnapshotEnvelope(this.session.snapshot());
    }
}
