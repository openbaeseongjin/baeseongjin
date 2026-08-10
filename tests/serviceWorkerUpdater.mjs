import assert from "node:assert/strict";
import { setupServiceWorkerUpdater } from "../src/pwa/ServiceWorkerUpdater.js";

export async function run() {
    const windowListeners = new Map();
    const workerListeners = new Map();
    const registrationCalls = [];
    let updateCalls = 0;
    let reloadCalls = 0;
    const window = {
        location: { reload: () => (reloadCalls += 1) },
        addEventListener: (name, listener) => windowListeners.set(name, listener),
        removeEventListener: (name) => windowListeners.delete(name)
    };
    const serviceWorker = {
        controller: {},
        addEventListener: (name, listener) => workerListeners.set(name, listener),
        removeEventListener: (name) => workerListeners.delete(name),
        register: async (...args) => {
            registrationCalls.push(args);
            return { update: async () => (updateCalls += 1) };
        }
    };

    const release = setupServiceWorkerUpdater({
        window,
        navigator: { serviceWorker },
        scriptUrl: "/sw.js"
    });
    await windowListeners.get("load")();
    assert.deepEqual(registrationCalls, [["/sw.js", { updateViaCache: "none" }]]);
    assert.equal(updateCalls, 1);
    workerListeners.get("controllerchange")();
    workerListeners.get("controllerchange")();
    assert.equal(reloadCalls, 1, "one worker activation must trigger at most one reload");
    release();
    assert.equal(windowListeners.has("load"), false);
    assert.equal(workerListeners.has("controllerchange"), false);

    let firstInstallReloads = 0;
    const firstInstallWorkerListeners = new Map();
    const firstInstallWindowListeners = new Map();
    setupServiceWorkerUpdater({
        window: {
            location: { reload: () => (firstInstallReloads += 1) },
            addEventListener: (name, listener) => firstInstallWindowListeners.set(name, listener),
            removeEventListener() {}
        },
        navigator: {
            serviceWorker: {
                controller: null,
                addEventListener: (name, listener) => firstInstallWorkerListeners.set(name, listener),
                removeEventListener() {},
                register: async () => ({ update: async () => {} })
            }
        },
        scriptUrl: "/sw.js"
    });
    firstInstallWorkerListeners.get("controllerchange")();
    assert.equal(firstInstallReloads, 0, "initial installation must not reload an uncontrolled page");
}
