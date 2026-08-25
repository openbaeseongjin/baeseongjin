import { graphemes } from "../../core/text/GraphemeText.js";
import { definePlayerMessage } from "./PlayerMessageCatalog.js";

const MAX_SEEN_CAUSAL_IDS = 2048;

export class PlayerMessagePresentation {
    constructor({ viewerId } = {}) {
        if (typeof viewerId !== "string" || viewerId.length === 0) throw new Error("viewerId must be non-empty");
        this.viewerId = viewerId;
        this.queue = [];
        this.current = null;
        this.currentAge = 0;
        this.seenCausalIds = new Set();
        this.seenCausalIdOrder = [];
        this.blocked = false;
    }

    enqueue(message) {
        const normalized = definePlayerMessage(message);
        if (this.seenCausalIds.has(normalized.causalId)) return false;
        this.seenCausalIds.add(normalized.causalId);
        this.seenCausalIdOrder.push(normalized.causalId);
        while (this.seenCausalIdOrder.length > MAX_SEEN_CAUSAL_IDS) {
            this.seenCausalIds.delete(this.seenCausalIdOrder.shift());
        }
        this.queue.push(normalized);
        return true;
    }

    update(dt, { storyPresentation = null, incomingMessages = [] } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("PlayerMessagePresentation dt must be non-negative");
        const prioritizedIncomingMessages = incomingMessages
            .map((message) => definePlayerMessage(message))
            .sort((left, right) => right.priority - left.priority);
        for (const message of prioritizedIncomingMessages) this.enqueue(message);

        this.blocked = storyPresentation !== null;
        if (this.blocked) return null;
        if (this.current) {
            this.currentAge += dt;
            if (this.currentAge >= this.current.durationSeconds) {
                this.current = null;
                this.currentAge = 0;
            }
        }
        if (!this.current && this.queue.length > 0) {
            this.current = this.queue.shift();
            this.currentAge = 0;
        }
        return this.snapshot();
    }

    snapshot() {
        if (this.blocked || !this.current) return null;
        const characters = graphemes(this.current.text);
        const visibleCharacterCount = Math.min(
            characters.length,
            Math.floor(this.currentAge * this.current.revealCharactersPerSecond)
        );
        return Object.freeze({
            ...this.current,
            visibleText: characters.slice(0, visibleCharacterCount).join(""),
            revealComplete: visibleCharacterCount === characters.length,
            age: this.currentAge
        });
    }
}
