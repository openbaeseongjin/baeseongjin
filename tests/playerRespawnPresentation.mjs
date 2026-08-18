import assert from "node:assert/strict";
import { MultiplayerGameApp } from "../src/game/MultiplayerGameApp.js";
import {
    PlayerRespawnPresentation,
    viewportSafeDeathPosition
} from "../src/game/presentation/PlayerRespawnPresentation.js";

function renderer() {
    return {
        profile: "test",
        cssWidth: 200,
        cssHeight: 100,
        screenToWorld: () => ({ x: 0, y: 0 }),
        draw: () => ({})
    };
}

export function run() {
    const camera = { x: 10, y: 20, zoom: 2, initialized: true };
    assert.deepEqual(
        viewportSafeDeathPosition(
            { x: 60, y: Number.POSITIVE_INFINITY },
            {
                camera,
                cssWidth: 200,
                cssHeight: 100,
                spriteSize: { width: 48, height: 48 }
            }
        ),
        { x: 60, y: 46 },
        "a fall below the screen must present death at the bottom safe edge"
    );

    const presentation = new PlayerRespawnPresentation({
        playerId: "local-player",
        deathDurationSeconds: 0.7,
        spriteSize: { width: 48, height: 48 }
    });
    const event = {
        id: "respawn:local-player:cause-1",
        playerId: "local-player",
        type: "respawn",
        deathPosition: { x: 60, y: Number.POSITIVE_INFINITY }
    };
    const [prepared] = presentation.prepare([event], { camera, cssWidth: 200, cssHeight: 100 });
    assert.deepEqual(prepared.deathPosition, { x: 60, y: 46 });
    camera.x = 999;
    assert.equal(presentation.advance(0.3, camera).holding, true);
    assert.equal(camera.x, 10, "the captured camera transform must win during death");
    presentation.prepare([event], { camera, cssWidth: 200, cssHeight: 100 });
    assert.equal(presentation.advance(0.3, camera).holding, true, "a duplicate cause must not restart the hold");
    assert.deepEqual(presentation.advance(0.4, camera), {
        holding: false,
        released: true,
        deathPosition: null
    });
    assert.equal(camera.initialized, false, "death completion must request one checkpoint camera cut");

    const multiplayer = new MultiplayerGameApp({
        canvas: {},
        renderer: renderer(),
        authority: { playerId: "local-player" }
    });
    multiplayer.camera = { x: 40, y: 50, zoom: 1, initialized: true };
    multiplayer.queuePlayerPresentationEvents([
        {
            eventType: "player-respawned",
            playerId: "remote-player",
            causeId: "remote-cause",
            deathPosition: { x: 10, y: 10 },
            position: { x: 100, y: 100 }
        }
    ]);
    const remotePhase = multiplayer.respawnPresentation.advance(0.1, multiplayer.camera);
    assert.equal(remotePhase.holding, false, "a remote death must not hold the local camera");

    multiplayer.queuePlayerPresentationEvents([
        {
            eventType: "player-respawned",
            playerId: "local-player",
            causeId: "local-cause",
            deathPosition: { x: 50, y: 60 },
            position: { x: 100, y: 100 }
        }
    ]);
    assert.equal(
        multiplayer.respawnPresentation.advance(0.1, multiplayer.camera).holding,
        true,
        "the multiplayer owner must use the same local death hold policy"
    );
}
