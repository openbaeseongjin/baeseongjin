export function getInstallGuidance({ standalone, userAgent }) {
    if (standalone) return Object.freeze({ mode: "installed", message: "" });
    if (!/Android/.test(userAgent)) return Object.freeze({ mode: "unsupported", message: "" });
    return Object.freeze({
        mode: "prompt",
        message: "앱으로 설치하면 브라우저 상단 영역 없이 더 넓게 플레이할 수 있습니다."
    });
}

export function setupInstallPrompt({ window, navigator, root }) {
    if (!root) return () => {};
    const installButton = root.querySelector("[data-install-action]");
    const dismissButton = root.querySelector("[data-install-dismiss]");
    const message = root.querySelector("[data-install-message]");
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
    const guidance = getInstallGuidance({
        standalone,
        userAgent: navigator.userAgent ?? ""
    });
    if (guidance.mode !== "prompt") return () => {};

    let deferredPrompt = null;
    message.textContent = guidance.message;

    const hide = () => {
        root.hidden = true;
    };
    const onBeforeInstall = (event) => {
        event.preventDefault();
        deferredPrompt = event;
        installButton.disabled = false;
        installButton.textContent = "앱 설치";
        root.hidden = false;
    };
    const onInstall = async () => {
        if (!deferredPrompt) return;
        const prompt = deferredPrompt;
        deferredPrompt = null;
        installButton.disabled = true;
        await prompt.prompt();
        hide();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", hide);
    installButton.addEventListener("click", onInstall);
    dismissButton.addEventListener("click", hide);
    return () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", hide);
        installButton.removeEventListener("click", onInstall);
        dismissButton.removeEventListener("click", hide);
    };
}
