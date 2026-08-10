export function setupServiceWorkerUpdater({
    window,
    navigator,
    scriptUrl,
    onError = (error) => console.error("Service worker update failed", error)
}) {
    const serviceWorker = navigator?.serviceWorker;
    if (!window || !serviceWorker) return () => {};

    let released = false;
    let refreshing = false;
    const hadControllerAtStartup = Boolean(serviceWorker.controller);

    const handleControllerChange = () => {
        if (released || refreshing || !hadControllerAtStartup) return;
        refreshing = true;
        window.location.reload();
    };

    const register = async () => {
        try {
            const registration = await serviceWorker.register(scriptUrl, { updateViaCache: "none" });
            if (!released) await registration.update();
        } catch (error) {
            if (!released) onError(error);
        }
    };

    serviceWorker.addEventListener("controllerchange", handleControllerChange);
    window.addEventListener("load", register, { once: true });

    return () => {
        released = true;
        window.removeEventListener("load", register);
        serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
}
