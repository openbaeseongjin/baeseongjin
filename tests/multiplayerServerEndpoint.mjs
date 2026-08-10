import assert from "node:assert/strict";
import { channelSocketUrl, configuredMultiplayerServer } from "../src/game/runtime/MultiplayerServerEndpoint.js";

export function run() {
    const configuredDocument = { querySelector: () => ({ content: "https://game.example.com" }) };
    assert.equal(configuredMultiplayerServer(configuredDocument), "https://game.example.com");
    assert.equal(
        configuredMultiplayerServer(
            { querySelector: () => ({ content: "" }) },
            {
                hostname: "127.0.0.1",
                protocol: "http:",
                host: "127.0.0.1:4173"
            }
        ),
        "http://127.0.0.1:4173"
    );
    assert.equal(
        channelSocketUrl("https://game.example.com", "4821"),
        "wss://game.example.com/multiplayer?channel=4821"
    );
    assert.equal(
        channelSocketUrl("ws://127.0.0.1:4173/multiplayer", "new"),
        "ws://127.0.0.1:4173/multiplayer?channel=new"
    );
    assert.throws(() => channelSocketUrl("https://game.example.com", "12"), /숫자 4자리/);
}
