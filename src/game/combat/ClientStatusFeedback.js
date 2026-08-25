import {
    CLIENT_STATUS_FEEDBACK_CONFIG,
    CLIENT_STATUS_KEY,
    CLIENT_TRACKED_STATUS_TYPES,
    selectClientStatusFeedback
} from "./ClientStatusFeedbackDefinition.js";

export { selectClientStatusFeedback } from "./ClientStatusFeedbackDefinition.js";

export const CLIENT_STATUS_FEEDBACK_SECONDS = CLIENT_STATUS_FEEDBACK_CONFIG.LIFETIME_SECONDS;

export class ClientStatusFeedback {
    constructor({ viewerId }) {
        if (typeof viewerId !== "string" || viewerId.length === CLIENT_STATUS_FEEDBACK_CONFIG.EMPTY_VIEWER_ID_LENGTH) {
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
            if (!status || !CLIENT_TRACKED_STATUS_TYPES.includes(status.type)) continue;
            const id = CLIENT_STATUS_KEY.status(status);
            if (this.seenIds.has(id)) continue;
            this.seenIds.add(id);
            this.seenOrder.push(id);
            while (this.seenOrder.length > CLIENT_STATUS_FEEDBACK_CONFIG.MAX_SEEN_IDS) {
                this.seenIds.delete(this.seenOrder.shift());
            }
            this.current = Object.freeze({
                ...status,
                age: Math.max(
                    CLIENT_STATUS_FEEDBACK_CONFIG.INITIAL_AGE,
                    status.age ?? CLIENT_STATUS_FEEDBACK_CONFIG.INITIAL_AGE
                )
            });
        }
        return this.current;
    }

    update(dt) {
        if (!Number.isFinite(dt) || dt < CLIENT_STATUS_FEEDBACK_CONFIG.MINIMUM_DT)
            throw new Error("ClientStatusFeedback dt must be non-negative");
        if (!this.current) return;
        const age = this.current.age + dt;
        this.current = age < CLIENT_STATUS_FEEDBACK_SECONDS ? Object.freeze({ ...this.current, age }) : null;
    }

    snapshot() {
        return this.current;
    }
}
