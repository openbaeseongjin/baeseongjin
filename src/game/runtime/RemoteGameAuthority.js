import { deserializeCommandReceipt } from "../network/CommandReceipt.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { serializePlayerCommandBatch } from "../network/PlayerCommandBatch.js";
import { deserializeWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { LocalPlayerPredictor } from "./LocalPlayerPredictor.js";
import { RemoteCommandStream } from "./RemoteCommandStream.js";
import { RemoteWorldStateBuffer } from "./RemoteWorldStateBuffer.js";

export class RemoteGameAuthority {
    constructor({ url, WebSocketImpl = globalThis.WebSocket, now = () => performance.now() } = {}) {
        if (!WebSocketImpl) throw new Error("WebSocket is unavailable");
        if (typeof url !== "string" || url.length === 0) throw new Error("멀티 초대 링크가 필요합니다.");
        this.url = url;
        this.WebSocketImpl = WebSocketImpl;
        this.now = now;
        this.socket = null;
        this.playerId = null;
        this.channelId = null;
        this.stream = null;
        this.predictor = null;
        this.buffer = new RemoteWorldStateBuffer();
        this.latestSnapshot = null;
        this.snapshotReceivedAt = 0;
        this.closed = false;
        this.closeReason = null;
        this.intentionalClose = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            const socket = new this.WebSocketImpl(this.url);
            this.socket = socket;
            let settled = false;
            const fail = (message) => {
                if (settled) return;
                settled = true;
                reject(new Error(message));
            };
            socket.addEventListener("error", () => fail("멀티 서버에 연결할 수 없습니다."));
            socket.addEventListener("close", (event) => {
                this.closed = true;
                if (!this.intentionalClose) this.closeReason = event.reason || "멀티 서버 연결이 종료되었습니다.";
                if (!settled) fail(event.reason || "멀티 서버 연결이 종료되었습니다.");
            });
            socket.addEventListener("message", (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "error") {
                        const errors = {
                            "channel-full": `채널 ${message.channelId ?? ""}의 인원이 가득 찼습니다.`,
                            "channel-not-found": `채널 ${message.channelId ?? ""}을 찾을 수 없습니다.`
                        };
                        fail(errors[message.code] ?? message.message ?? message.code);
                        return;
                    }
                    if (message.type === "welcome") {
                        this.playerId = message.playerId;
                        this.channelId = message.channelId;
                        this.stream = new RemoteCommandStream({
                            playerId: this.playerId,
                            inputLeadTicks: MULTIPLAYER_TIMING.inputLeadTicks
                        });
                        this.predictor = new LocalPlayerPredictor({ playerId: this.playerId });
                        this.acceptSnapshot(message.snapshot);
                        if (!settled) {
                            settled = true;
                            resolve(this);
                        }
                    } else if (message.type === "snapshot") {
                        this.acceptSnapshot(message.payload);
                    } else if (message.type === "receipt" && this.stream) {
                        this.stream.acceptReceipt(deserializeCommandReceipt(message.payload));
                    }
                } catch (error) {
                    fail(`서버 메시지를 처리하지 못했습니다: ${error.message}`);
                }
            });
        });
    }

    acceptSnapshot(serialized) {
        const snapshot = deserializeWorldSnapshotEnvelope(serialized);
        if (!this.stream.acceptSnapshot(snapshot)) return;
        const receivedAt = this.now();
        this.latestSnapshot = snapshot;
        this.snapshotReceivedAt = receivedAt;
        this.buffer.push(snapshot, receivedAt);
        this.reconcile();
    }

    reconcile() {
        if (!this.latestSnapshot) return null;
        return this.predictor.reconcile(this.latestSnapshot, this.stream.pendingBatches());
    }

    submit(command) {
        if (!this.latestSnapshot || this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        const predictedTick = this.predictor.state().tick;
        const batch = this.stream.createBatchAtTick(predictedTick, command);
        if (!batch) return false;
        this.socket.send(JSON.stringify({ type: "command", payload: serializePlayerCommandBatch(batch) }));
        return true;
    }

    advance(command) {
        return this.predictor?.advance(command) ?? null;
    }

    snapshot() {
        return {
            state: this.buffer.sample({ now: this.now(), localPlayerId: this.playerId }),
            predicted: this.predictor?.presentationState() ?? null,
            connected: !this.closed
        };
    }

    drainEvents() {
        return this.buffer.drainEvents();
    }

    close() {
        this.intentionalClose = true;
        this.closed = true;
        this.closeReason = null;
        if (this.socket?.readyState === this.WebSocketImpl.OPEN) this.socket.close(1000, "client shutdown");
    }
}
