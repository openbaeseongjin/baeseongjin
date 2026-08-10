import assert from "node:assert/strict";
import { GameModeMenu } from "../src/game/ui/GameModeMenu.js";

export function run() {
    const menu = Object.create(GameModeMenu.prototype);
    menu.channelInput = { value: "" };

    assert.equal(menu.rememberChannel("4821"), true);
    assert.equal(menu.channelInput.value, "4821");
    assert.equal(menu.rememberChannel("new"), false);
    assert.equal(menu.rememberChannel("12"), false);
    assert.equal(menu.channelInput.value, "4821", "invalid reconnect values must not erase the last channel");
}
