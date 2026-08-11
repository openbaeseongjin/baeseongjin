import assert from "node:assert/strict";
import { StartupUpdateLoadingScreen } from "../src/pwa/StartupUpdateLoadingScreen.js";

export function run() {
    const attributes = new Map();
    const root = {
        hidden: true,
        setAttribute: (name, value) => attributes.set(name, value)
    };
    const screen = new StartupUpdateLoadingScreen(root);

    screen.show();
    assert.equal(root.hidden, false);
    assert.equal(attributes.get("aria-busy"), "true");

    screen.hide();
    assert.equal(root.hidden, true);
    assert.equal(attributes.get("aria-busy"), "false");
}
