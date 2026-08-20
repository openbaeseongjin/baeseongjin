import { DEFAULT_PLAYER_MESSAGE_DEFINITIONS, definePlayerMessage } from "./PlayerMessageCatalog.js";

const graphemeSegmenter =
    typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

function messageCharacters(text) {
    if (!graphemeSegmenter) return Array.from(text);
    return Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);
}

export class PlayerMessagePresentation {
    constructor({ viewerId, definitions = DEFAULT_PLAYER_MESSAGE_DEFINITIONS } = {}) {
        if (typeof viewerId !== "string" || viewerId.length === 0) throw new Error("viewerId must be non-empty");
        this.viewerId = viewerId;
        this.definitions = Object.freeze([...definitions]);
        this.definitionsByStoryId = new Map();
        for (const definition of this.definitions) {
            const storyId = definition.trigger?.kind === "after-story" ? definition.trigger.storyId : null;
            if (!storyId) continue;
            this.definitionsByStoryId.set(storyId, [...(this.definitionsByStoryId.get(storyId) ?? []), definition]);
        }
        this.queue = [];
        this.current = null;
        this.currentAge = 0;
        this.observedStory = false;
        this.lastStoryId = null;
        this.lastStoryAreaId = null;
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

    enqueueDefinition(definition) {
        return this.enqueue({
            ...definition,
            speakerId: definition.speakerId === "local-player" ? this.viewerId : definition.speakerId
        });
    }

    update(dt, { currentAreaId = null, storyPresentation = null, incomingMessages = [] } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("PlayerMessagePresentation dt must be non-negative");
        const storyId = storyPresentation?.id ?? null;
        if (this.observedStory && this.lastStoryId && storyId !== this.lastStoryId) {
            const definitions = [...(this.definitionsByStoryId.get(this.lastStoryId) ?? [])].sort(
                (left, right) => right.priority - left.priority
            );
            for (const definition of definitions) {
                if (definition.areaId === this.lastStoryAreaId) this.enqueueDefinition(definition);
            }
        }
        this.observedStory = true;
        if (storyId !== this.lastStoryId) this.lastStoryAreaId = currentAreaId;
        this.lastStoryId = storyId;
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
