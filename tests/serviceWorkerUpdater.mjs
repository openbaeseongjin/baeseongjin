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

    const updater = setupServiceWorkerUpdater({
        window,
        navigator: { serviceWorker },
        scriptUrl: "/sw.js"
    });
    await windowListeners.get("load")();
    await updater.ready;
    assert.deepEqual(registrationCalls, [["/sw.js", { updateViaCache: "none" }]]);
    assert.equal(updateCalls, 1);
    workerListeners.get("controllerchange")();
    workerListeners.get("controllerchange")();
    assert.equal(reloadCalls, 1, "one worker activation must trigger at most one reload");
    updater.release();
    assert.equal(windowListeners.has("load"), false);
    assert.equal(workerListeners.has("controllerchange"), false);

    let firstInstallReloads = 0;
    const firstInstallWorkerListeners = new Map();
    const firstInstallWindowListeners = new Map();
    const firstInstallUpdater = setupServiceWorkerUpdater({
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
    await firstInstallWindowListeners.get("load")();
    firstInstallWorkerListeners.get("controllerchange")();
    await firstInstallUpdater.ready;
    assert.equal(firstInstallReloads, 0, "initial installation must not reload an uncontrolled page");

    const waitingWindowListeners = new Map();
    const waitingWorkerListeners = new Map();
    let waitingReloads = 0;
    const waitingRegistration = { waiting: {}, update: async () => {} };
    const waitingUpdater = setupServiceWorkerUpdater({
        window: {
            location: { reload: () => (waitingReloads += 1) },
            addEventListener: (name, listener) => waitingWindowListeners.set(name, listener),
            removeEventListener() {}
        },
        navigator: {
            serviceWorker: {
                controller: {},
                addEventListener: (name, listener) => waitingWorkerListeners.set(name, listener),
                removeEventListener() {},
                register: async () => waitingRegistration
            }
        },
        scriptUrl: "/sw.js"
    });
    await waitingWindowListeners.get("load")();
    let completedEarly = false;
    waitingUpdater.ready.then(() => (completedEarly = true));
    await Promise.resolve();
    assert.equal(completedEarly, false, "a waiting worker must keep the startup screen visible until activation");
    waitingWorkerListeners.get("controllerchange")();
    assert.equal(waitingReloads, 1, "a waiting worker activation must reload the current page once");

    const activeUpdateWindowListeners = new Map();
    const activeUpdateWorkerListeners = new Map();
    const registrationListeners = new Map();
    const updatedWorkerListeners = new Map();
    let activeUpdateReloads = 0;
    const updatedWorker = {
        state: "installing",
        addEventListener: (name, listener) => updatedWorkerListeners.set(name, listener)
    };
    const activeUpdateRegistration = {
        installing: null,
        addEventListener: (name, listener) => registrationListeners.set(name, listener),
        update: async () => {
            activeUpdateRegistration.installing = updatedWorker;
            registrationListeners.get("updatefound")();
            updatedWorker.state = "activated";
            updatedWorkerListeners.get("statechange")();
            activeUpdateRegistration.installing = null;
        }
    };
    const activeUpdateUpdater = setupServiceWorkerUpdater({
        window: {
            location: { reload: () => (activeUpdateReloads += 1) },
            addEventListener: (name, listener) => activeUpdateWindowListeners.set(name, listener),
            removeEventListener() {}
        },
        navigator: {
            serviceWorker: {
                controller: {},
                addEventListener: (name, listener) => activeUpdateWorkerListeners.set(name, listener),
                removeEventListener() {},
                register: async () => activeUpdateRegistration
            }
        },
        scriptUrl: "/sw.js"
    });
    await activeUpdateWindowListeners.get("load")();
    let activatedUpdateCompletedEarly = false;
    activeUpdateUpdater.ready.then(() => (activatedUpdateCompletedEarly = true));
    await Promise.resolve();
    assert.equal(
        activatedUpdateCompletedEarly,
        false,
        "an activated update with an existing controller must wait for controllerchange reload"
    );
    activeUpdateWorkerListeners.get("controllerchange")();
    assert.equal(activeUpdateReloads, 1, "the activated update must reload the controlled page once");

    const redundantWindowListeners = new Map();
    const redundantWorkerListeners = new Map();
    const redundantRegistrationListeners = new Map();
    const redundantStateListeners = new Map();
    let redundantErrorReports = 0;
    const redundantWorker = {
        state: "installing",
        addEventListener: (name, listener) => redundantStateListeners.set(name, listener)
    };
    const redundantRegistration = {
        installing: null,
        addEventListener: (name, listener) => redundantRegistrationListeners.set(name, listener),
        update: async () => {
            redundantRegistration.installing = redundantWorker;
            redundantRegistrationListeners.get("updatefound")();
            redundantWorker.state = "redundant";
            redundantStateListeners.get("statechange")();
            redundantRegistration.installing = null;
        }
    };
    const redundantUpdater = setupServiceWorkerUpdater({
        window: {
            location: { reload() {} },
            addEventListener: (name, listener) => redundantWindowListeners.set(name, listener),
            removeEventListener() {}
        },
        navigator: {
            serviceWorker: {
                controller: {},
                addEventListener: (name, listener) => redundantWorkerListeners.set(name, listener),
                removeEventListener() {},
                register: async () => redundantRegistration
            }
        },
        scriptUrl: "/sw.js",
        onError: () => {
            redundantErrorReports += 1;
            throw new Error("error reporter failure");
        }
    });
    await redundantWindowListeners.get("load")();
    await redundantUpdater.ready;
    assert.equal(redundantErrorReports, 1, "a redundant worker must be reported once");
}
