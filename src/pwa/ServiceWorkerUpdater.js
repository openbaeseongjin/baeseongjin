export function setupServiceWorkerUpdater({
    window,
    navigator,
    scriptUrl,
    onError = (error) => console.error("Service worker update failed", error)
}) {
    const serviceWorker = navigator?.serviceWorker;
    if (!window || !serviceWorker) return { ready: Promise.resolve(), release: () => {} };

    let released = false;
    let refreshing = false;
    let ready = false;
    let updateDetected = false;
    let errorReported = false;
    let resolveReady;
    const readyPromise = new Promise((resolve) => (resolveReady = resolve));
    const hadControllerAtStartup = Boolean(serviceWorker.controller);

    const finish = () => {
        if (released || ready) return;
        ready = true;
        resolveReady();
    };

    const fail = (error) => {
        if (released || errorReported) return;
        errorReported = true;
        try {
            onError(error);
        } catch {
            // Startup must continue even when an application's error reporter fails.
        } finally {
            finish();
        }
    };

    const handleControllerChange = () => {
        if (released) return;
        if (!hadControllerAtStartup) {
            finish();
            return;
        }
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    };

    const observeRegistration = (registration) => {
        const observeWorker = (worker) => {
            if (!worker) return;
            updateDetected = true;
            if (worker.state === "redundant") {
                fail(new Error("Service worker update became redundant"));
                return;
            }
            if (worker.state === "activated") {
                if (!hadControllerAtStartup) finish();
                return;
            }
            worker.addEventListener("statechange", () => {
                if (worker.state === "redundant") fail(new Error("Service worker update became redundant"));
                else if (!hadControllerAtStartup && worker.state === "activated") finish();
            });
        };
        registration.addEventListener?.("updatefound", () => observeWorker(registration.installing));
        observeWorker(registration.installing);
    };

    const registerAndCheck = async () => {
        try {
            const registration = await serviceWorker.register(scriptUrl, { updateViaCache: "none" });
            if (released) return;
            observeRegistration(registration);
            await registration.update();
            if (
                !released &&
                !registration.installing &&
                !registration.waiting &&
                (!hadControllerAtStartup || !updateDetected)
            ) {
                finish();
            }
        } catch (error) {
            fail(error);
        }
    };

    serviceWorker.addEventListener("controllerchange", handleControllerChange);
    if (window.document?.readyState === "complete") registerAndCheck();
    else window.addEventListener("load", registerAndCheck, { once: true });

    const release = () => {
        released = true;
        window.removeEventListener("load", registerAndCheck);
        serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };

    return { ready: readyPromise, release };
}
