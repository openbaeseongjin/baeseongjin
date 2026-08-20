import assert from "node:assert/strict";
import {
    DEFAULT_PLAYER_MESSAGE_DEFINITIONS,
    definePlayerMessage
} from "../src/game/presentation/PlayerMessageCatalog.js";
import { PlayerMessagePresentation } from "../src/game/presentation/PlayerMessagePresentation.js";

export function run() {
    assert.deepEqual(
        DEFAULT_PLAYER_MESSAGE_DEFINITIONS.map(({ messageId, text, audience }) => [messageId, text, audience]),
        [
            ["sector-01-01:first-reaction", "뭐야…?", "local-player"],
            ["sector-01-01:temporary-goal", "…일단 위로.", "local-player"],
            ["sector-01-02:lift-reaction", "…리프트도?", "local-player"]
        ]
    );

    const local = new PlayerMessagePresentation({ viewerId: "player-local" });
    assert.equal(
        local.update(0, {
            currentAreaId: "sector-01-01",
            storyPresentation: { id: "sector-01-01:lockdown" }
        }),
        null,
        "System Story must block the local Bark layer"
    );
    assert.deepEqual(local.update(1.8, { currentAreaId: "sector-01-01" }), {
        messageId: "sector-01-01:first-reaction",
        channel: "player-bark",
        audience: "local-player",
        speakerId: "player-local",
        text: "뭐야…?",
        durationSeconds: 1.8,
        revealCharactersPerSecond: 18,
        priority: 20,
        causalId: "sector-01-01:first-reaction",
        visibleText: "",
        revealComplete: false,
        age: 0
    });
    assert.deepEqual(
        local.update(0.12, { currentAreaId: "sector-01-01" }),
        {
            messageId: "sector-01-01:first-reaction",
            channel: "player-bark",
            audience: "local-player",
            speakerId: "player-local",
            text: "뭐야…?",
            durationSeconds: 1.8,
            revealCharactersPerSecond: 18,
            priority: 20,
            causalId: "sector-01-01:first-reaction",
            visibleText: "뭐야",
            revealComplete: false,
            age: 0.12
        },
        "the local presentation must reveal message characters from elapsed time"
    );
    local.update(1.8, { currentAreaId: "sector-01-01" });
    local.update(0, {
        currentAreaId: "sector-01-01",
        storyPresentation: { id: "sector-01-01:lockdown" }
    });
    assert.equal(
        local.update(1.8, { currentAreaId: "sector-01-01" }),
        null,
        "replayed Story must not repeat a deduped Bark"
    );

    const lift = new PlayerMessagePresentation({ viewerId: "lift-player" });
    lift.update(0, {
        currentAreaId: "sector-01-02",
        storyPresentation: { id: "sector-01-02:lift-offline" }
    });
    assert.equal(
        lift.update(1.6, {
            currentAreaId: "sector-01-02",
            storyPresentation: { id: "sector-01-02:manual-access" }
        }),
        null,
        "a queued Bark must wait while another System Story is visible"
    );
    assert.equal(lift.update(1.8, { currentAreaId: "sector-01-02" }).text, "…리프트도?");

    const crossing = new PlayerMessagePresentation({ viewerId: "crossing-player" });
    crossing.update(0, {
        currentAreaId: "sector-01-01",
        storyPresentation: { id: "sector-01-01:gate-open" }
    });
    crossing.update(0, {
        currentAreaId: "sector-01-02",
        storyPresentation: { id: "sector-01-02:lift-offline" }
    });
    assert.equal(
        crossing.update(0, { currentAreaId: "sector-01-02" }).text,
        "…일단 위로.",
        "a Bark caused in the previous Stage must survive a direct System Story transition"
    );
    crossing.update(1.8, { currentAreaId: "sector-01-02" });
    assert.equal(
        crossing.snapshot().text,
        "…리프트도?",
        "later causal messages must not overtake an older queued Bark"
    );

    const extensible = new PlayerMessagePresentation({ viewerId: "viewer", definitions: [] });
    const partyMessage = definePlayerMessage({
        messageId: "party-message-1",
        channel: "party-chat",
        audience: "party",
        speakerId: "player-2",
        text: "여기로 와",
        causalId: "party-event-1",
        revealCharactersPerSecond: 10,
        priority: 5
    });
    const queuedPartyMessage = extensible.update(0, { incomingMessages: [partyMessage] });
    assert.equal(queuedPartyMessage.channel, "party-chat");
    assert.equal(queuedPartyMessage.visibleText, "");
    assert.equal(extensible.update(0.12).visibleText, "여", "message data must control the typing speed");
    extensible.update(1.8);
    assert.equal(
        extensible.update(0, { incomingMessages: [partyMessage] }),
        null,
        "future party transport messages must share causal dedupe without becoming Bark data"
    );
    assert.throws(
        () => definePlayerMessage({ ...partyMessage, channel: "system-story" }),
        /unknown player message channel/
    );
    assert.throws(
        () => definePlayerMessage({ ...partyMessage, revealCharactersPerSecond: 0 }),
        /revealCharactersPerSecond must be positive/
    );
}
