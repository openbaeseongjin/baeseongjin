import { MULTIPLAYER_MESSAGE_TYPE } from "../game/network/MultiplayerMessageDefinition.js";

class SerializedClientMessageHandler {
    constructor({ receiveMethod, receiptType }) {
        this.receiveMethod = receiveMethod;
        this.receiptType = receiptType;
    }
    handle({ socket, room, playerId, message }) {
        if (typeof message.payload !== "string") throw new Error("client message payload must be serialized");
        const receipt = room.adapter[this.receiveMethod](playerId, message.payload);
        socket.send(JSON.stringify({ type: this.receiptType, payload: receipt }));
    }
}
class SnapshotAckHandler {
    handle({ server, socket, message }) {
        server.acknowledgeSnapshot(socket, message.snapshotSequence);
    }
}
function serialized(receiveMethod, receiptType) {
    return Object.freeze(new SerializedClientMessageHandler({ receiveMethod, receiptType }));
}

const CLIENT_MESSAGE_HANDLER = Object.freeze({
    [MULTIPLAYER_MESSAGE_TYPE.COMMAND]: serialized("receiveCommand", MULTIPLAYER_MESSAGE_TYPE.RECEIPT),
    [MULTIPLAYER_MESSAGE_TYPE.HIT_CLAIM]: serialized("receiveHitClaim", MULTIPLAYER_MESSAGE_TYPE.HIT_CLAIM_RECEIPT),
    [MULTIPLAYER_MESSAGE_TYPE.PROJECTILE_SPAWN_CLAIM]: serialized(
        "receiveProjectileSpawnClaim",
        MULTIPLAYER_MESSAGE_TYPE.PROJECTILE_SPAWN_CLAIM_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.IMPACT_CLAIM]: serialized(
        "receiveImpactClaim",
        MULTIPLAYER_MESSAGE_TYPE.IMPACT_CLAIM_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.FOUNDATION_SELECTION]: serialized(
        "receiveFoundationSelection",
        MULTIPLAYER_MESSAGE_TYPE.FOUNDATION_SELECTION_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.ROPE_IMPACT]: serialized(
        "receiveRopeImpact",
        MULTIPLAYER_MESSAGE_TYPE.ROPE_IMPACT_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.AUGMENT_OFFER]: serialized(
        "receiveAugmentOffer",
        MULTIPLAYER_MESSAGE_TYPE.AUGMENT_OFFER_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.AUGMENT_IMPACT]: serialized(
        "receiveAugmentImpact",
        MULTIPLAYER_MESSAGE_TYPE.AUGMENT_IMPACT_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.CHECKPOINT_CLAIM]: serialized(
        "receiveCheckpointClaim",
        MULTIPLAYER_MESSAGE_TYPE.CHECKPOINT_CLAIM_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.SUMMIT_CLAIM]: serialized(
        "receiveSummitClaim",
        MULTIPLAYER_MESSAGE_TYPE.SUMMIT_CLAIM_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.OWNER_MOTION]: serialized(
        "receiveOwnerMotion",
        MULTIPLAYER_MESSAGE_TYPE.OWNER_MOTION_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.DEBUG_TELEPORT]: serialized(
        "receiveDebugTeleport",
        MULTIPLAYER_MESSAGE_TYPE.DEBUG_TELEPORT_RECEIPT
    ),
    [MULTIPLAYER_MESSAGE_TYPE.SNAPSHOT_ACK]: Object.freeze(new SnapshotAckHandler())
});

export function routeClientMessage(context) {
    const handler = CLIENT_MESSAGE_HANDLER[context.message?.type];
    if (!handler) throw new Error("unsupported client message");
    handler.handle(context);
}
