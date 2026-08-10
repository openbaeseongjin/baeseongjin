import assert from "node:assert/strict";
import { getInstallGuidance, setupInstallPrompt } from "../src/pwa/InstallPrompt.js";

export async function run() {
    assert.equal(
        getInstallGuidance({ standalone: true, userAgent: "" }).mode,
        "installed",
        "installed apps must not show installation guidance"
    );
    const safari = getInstallGuidance({
        standalone: false,
        userAgent: "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1"
    });
    assert.equal(safari.mode, "unsupported");
    assert.equal(safari.message, "");

    const chromeUserAgent = "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36";
    const chrome = getInstallGuidance({
        standalone: false,
        userAgent: chromeUserAgent
    });
    assert.equal(chrome.mode, "prompt");
    assert.match(chrome.message, /상단 영역 없이/);

    const windowListeners = new Map();
    const buttonListeners = new Map();
    const installButton = {
        disabled: false,
        textContent: "앱 설치",
        addEventListener: (name, listener) => buttonListeners.set(`install:${name}`, listener),
        removeEventListener: (name) => buttonListeners.delete(`install:${name}`)
    };
    const dismissButton = {
        addEventListener: (name, listener) => buttonListeners.set(`dismiss:${name}`, listener),
        removeEventListener: (name) => buttonListeners.delete(`dismiss:${name}`)
    };
    const message = { textContent: "" };
    const root = {
        hidden: true,
        querySelector: (selector) =>
            ({
                "[data-install-action]": installButton,
                "[data-install-dismiss]": dismissButton,
                "[data-install-message]": message
            })[selector]
    };
    const window = {
        matchMedia: () => ({ matches: false }),
        addEventListener: (name, listener) => windowListeners.set(name, listener),
        removeEventListener: (name) => windowListeners.delete(name)
    };
    let promptCalls = 0;
    setupInstallPrompt({
        window,
        navigator: { userAgent: chromeUserAgent, standalone: false },
        root
    });
    assert.equal(root.hidden, true, "the guide must wait for Android installability confirmation");
    windowListeners.get("beforeinstallprompt")({
        preventDefault: () => {},
        prompt: async () => {
            promptCalls += 1;
        }
    });
    assert.equal(root.hidden, false);
    assert.equal(installButton.disabled, false);
    await buttonListeners.get("install:click")();
    assert.equal(promptCalls, 1);
    assert.equal(root.hidden, true);
}
