import { definePlayerMessage } from "./PlayerMessageCatalog.js";

const graphemeSegmenter =
    typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

function messageCharacters(text) {
    if (!graphemeSegmenter) return Array.from(text);
    return Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);
}

export class PlayerMessagePresentation {
    constructor({ viewerId } = {}) {
        if (typeof viewerId !== "string" || viewerId.length === 0) throw new Error("viewerId must be non-empty");
        this.viewerId = viewerId;
        this.queue = [];
        this.current = null;
        this.currentAge = 0;
        this.seenCausalIds = new Set();
        this.blocked = false;
    }

    enqueue(message) {
        const normalized = definePlayerMessage(message);
        if (this.seenCausalIds.has(normalized.causalId)) return false;
        this.seenCausalIds.add(normalized.causalId);
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
        const characters = messageCharacters(this.current.text);
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
