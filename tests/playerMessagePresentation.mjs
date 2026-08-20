import assert from "node:assert/strict";
import {
    DEFAULT_PLAYER_MESSAGE_DEFINITIONS,
    definePlayerMessage
} from "../src/game/presentation/PlayerMessageCatalog.js";
import { PlayerMessagePresentation } from "../src/game/presentation/PlayerMessagePresentation.js";

export function run() {
    assert.deepEqual(DEFAULT_PLAYER_MESSAGE_DEFINITIONS, [], "Stage dialogue must come from DirectionDefinition data");

    const local = new PlayerMessagePresentation({ viewerId: "player-local" });
    const bark = definePlayerMessage({
        messageId: "test-bark",
        channel: "player-bark",
        audience: "local-player",
        speakerId: "player-local",
        text: "뭐야…?",
        causalId: "test-bark",
        durationSeconds: 1.8,
        revealCharactersPerSecond: 18,
        priority: 20
    });
    assert.equal(
        local.update(0, { storyPresentation: { id: "system-story" }, incomingMessages: [bark] }),
        null,
        "System Story must block the local Bark layer"
    );
    assert.deepEqual(local.update(0, {}), {
        ...bark,
        visibleText: "",
        revealComplete: false,
        age: 0
    });
    assert.equal(local.update(0.12).visibleText, "뭐야");
    local.update(1.8);
    assert.equal(local.update(0, { incomingMessages: [bark] }), null, "causal IDs must dedupe replayed messages");

    const extensible = new PlayerMessagePresentation({ viewerId: "viewer" });
    const low = definePlayerMessage({
        messageId: "party-low",
        channel: "party-chat",
        audience: "party",
        speakerId: "player-2",
        text: "천천히",
        causalId: "party-low",
        priority: 1
    });
    const high = definePlayerMessage({
        messageId: "party-high",
        channel: "party-chat",
        audience: "party",
        speakerId: "player-2",
        text: "여기로 와",
        causalId: "party-high",
        revealCharactersPerSecond: 10,
        priority: 5
    });
    assert.equal(extensible.update(0, { incomingMessages: [low, high] }).messageId, "party-high");
    assert.equal(extensible.update(0.12).visibleText, "여");
    assert.throws(() => definePlayerMessage({ ...high, channel: "system-story" }), /unknown player message channel/);
    assert.throws(
        () => definePlayerMessage({ ...high, revealCharactersPerSecond: 0 }),
        /revealCharactersPerSecond must be positive/
    );
}
