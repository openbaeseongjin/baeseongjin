import assert from "node:assert/strict";
import { AudioEventBindings } from "../src/audio/AudioEventBindings.js";
import { ClientCombatFeedback } from "../src/game/combat/ClientCombatFeedback.js";
import { createPlayerPresentationEvents } from "../src/render/sprites/PlayerPresentationEvent.js";

export function run() {
    const fallEvent = Object.freeze({
        eventType: "predicted-player-fall-damaged",
        impactId: "player-1:fall-damage:42",
        targetId: "player-1",
        playerId: "player-1",
        position: Object.freeze({ x: 10, y: 20 }),
        damage: 50
    });
    const feedback = new ClientCombatFeedback({ viewerId: "player-1" });
    feedback.apply([fallEvent]);
    const feedbackState = feedback.snapshot();
    assert.ok(feedbackState.impact, "fall damage must immediately trigger personal hit feedback");
    assert.equal(
        feedbackState.combatEffects.find(({ type }) => type === "text")?.text,
        "-50",
        "fall damage must show the existing negative damage number"
    );
    assert.deepEqual(createPlayerPresentationEvents([fallEvent]), [
        { id: `hit:${fallEvent.impactId}`, playerId: "player-1", type: "hit" }
    ]);

    const played = [];
    const audio = new AudioEventBindings({
        play: (cueId, request) => played.push({ cueId, request }),
        startLoop: () => {},
        stopAll: () => {}
    });
    const context = {
        localPlayerId: "player-1",
        listener: { x: 0, y: 0 },
        visibleWorldBounds: { x: -100, y: -100, width: 200, height: 200 }
    };
    audio.presentFrame({ events: [fallEvent], context });
    audio.presentFrame({ events: [{ ...fallEvent, eventType: "player-fall-damaged" }], context });
    assert.deepEqual(
        played.map(({ cueId, request }) => ({ cueId, causalId: request.causalId })),
        [
            { cueId: "gameplay-player-hit", causalId: `fall-damage:${fallEvent.impactId}` },
            { cueId: "gameplay-player-hit", causalId: `fall-damage:${fallEvent.impactId}` }
        ],
        "predicted and confirmed fall feedback must share one audio causal id for host-level deduplication"
    );

    const ropeFeedback = new ClientCombatFeedback({ viewerId: "player-1" });
    ropeFeedback.apply([
        {
            eventType: "predicted-resolve",
            resolution: "enemy-hit",
            predictionId: "player-1:rope-impact:42:enemy-1",
            position: { x: 30, y: 40 },
            parameters: { sourceKind: "rope-impact", sourcePlayerId: "player-1", targetId: "enemy-1", damage: 25 }
        }
    ]);
    assert.equal(ropeFeedback.snapshot().combatEffects.find(({ type }) => type === "text")?.text, "25");
}
