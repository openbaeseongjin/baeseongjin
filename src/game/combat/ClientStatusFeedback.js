import { selectClientStatusFeedback } from "./ClientFeedbackEventObject.js";

export const CLIENT_STATUS_FEEDBACK_SECONDS = 2.2;
const MAX_SEEN_STATUS_IDS = 128;
const RESPAWN_STATUS_TYPES = new Set(["checkpoint-respawn", "sector-respawn"]);

function statusId(status) {
    const cause =
        status.causeId ??
        status.impactId ??
        status.eventId ??
        `${status.position?.x ?? "x"}:${status.position?.y ?? "y"}`;
    return `${status.type}:${status.playerId ?? "shared"}:${cause}`;
}

export class ClientStatusFeedback {
    constructor({ viewerId }) {
        if (typeof viewerId !== "string" || viewerId.length === 0) {
            throw new Error("ClientStatusFeedback requires a viewerId");
        }
        this.viewerId = viewerId;
        this.current = null;
        this.seenIds = new Set();
        this.seenOrder = [];
    }

    apply(events) {
        for (const event of events ?? []) {
            const status = selectClientStatusFeedback(event, this.viewerId);
            if (!status || !RESPAWN_STATUS_TYPES.has(status.type)) continue;
            const id = statusId(status);
            if (this.seenIds.has(id)) continue;
            this.seenIds.add(id);
            this.seenOrder.push(id);
            while (this.seenOrder.length > MAX_SEEN_STATUS_IDS) {
                this.seenIds.delete(this.seenOrder.shift());
            }
            this.current = Object.freeze({ ...status, age: Math.max(0, status.age ?? 0) });
        }
        return this.current;
    }

    update(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("ClientStatusFeedback dt must be non-negative");
        if (!this.current) return;
        const age = this.current.age + dt;
        this.current = age < CLIENT_STATUS_FEEDBACK_SECONDS ? Object.freeze({ ...this.current, age }) : null;
    }

    snapshot() {
        return this.current;
    }
}
