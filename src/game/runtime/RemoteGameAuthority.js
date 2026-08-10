import { deserializeCommandReceipt } from "../network/CommandReceipt.js";
import { serializePlayerCommandBatch } from "../network/PlayerCommandBatch.js";
import { deserializeWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { LocalPlayerPredictor } from "./LocalPlayerPredictor.js";
import { RemoteCommandStream } from "./RemoteCommandStream.js";
import { RemoteWorldStateBuffer } from "./RemoteWorldStateBuffer.js";

export function multiplayerUrl(location = globalThis.location) {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${location.host}/multiplayer`;
}

export class RemoteGameAuthority {
    constructor({ url = multiplayerUrl(), WebSocketImpl = globalThis.WebSocket, now = () => performance.now() } = {}) {
        if (!WebSocketImpl) throw new Error("WebSocket is unavailable");
        this.url = url;
        this.WebSocketImpl = WebSocketImpl;
        this.now = now;
        this.socket = null;
        this.playerId = null;
        this.stream = null;
        this.predictor = null;
        this.buffer = new RemoteWorldStateBuffer();
        this.latestSnapshot = null;
        this.snapshotReceivedAt = 0;
        this.closed = false;
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
                if (!settled) fail(event.reason || "멀티 서버 연결이 종료되었습니다.");
            });
            socket.addEventListener("message", (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "error") {
                        fail(
                            message.code === "room-full" ? "멀티 방이 가득 찼습니다." : message.message || message.code
                        );
                        return;
                    }
                    if (message.type === "welcome") {
                        this.playerId = message.playerId;
                        this.stream = new RemoteCommandStream({ playerId: this.playerId, inputLeadTicks: 4 });
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
                        this.reconcile();
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
        this.latestSnapshot = snapshot;
        this.snapshotReceivedAt = this.now();
        this.buffer.push(snapshot);
        this.reconcile();
    }

    reconcile() {
        if (!this.latestSnapshot) return null;
        return this.predictor.reconcile(this.latestSnapshot, this.stream.pendingBatches());
    }

    submit(command) {
        if (!this.latestSnapshot || this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        const elapsedTicks = Math.max(0, Math.floor(((this.now() - this.snapshotReceivedAt) * 120) / 1000));
        const batch = this.stream.createBatch(this.latestSnapshot.serverTick + elapsedTicks, command);
        this.socket.send(JSON.stringify({ type: "command", payload: serializePlayerCommandBatch(batch) }));
        this.reconcile();
        return true;
    }

    snapshot(alpha = 1) {
        return {
            state: this.buffer.sample(alpha),
            predicted: this.predictor?.state() ?? null,
            connected: !this.closed
        };
    }

    drainEvents() {
        return this.buffer.drainEvents();
    }

    close() {
        this.closed = true;
        this.socket?.close(1000, "client shutdown");
    }
}
