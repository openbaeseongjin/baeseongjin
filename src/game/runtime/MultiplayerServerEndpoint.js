const CHANNEL_PATTERN = /^\d{4}$/;

export function configuredMultiplayerServer(document = globalThis.document, location = globalThis.location) {
    const configured = document?.querySelector('meta[name="multiplayer-server"]')?.content?.trim();
    if (configured) return configured;
    if (location?.hostname && location.hostname !== "openbaeseongjin.github.io") {
        return `${location.protocol}//${location.host}`;
    }
    return null;
}

export function channelSocketUrl(serverUrl, channelId) {
    if (channelId !== "new" && !CHANNEL_PATTERN.test(channelId)) {
        throw new Error("채널 번호는 숫자 4자리여야 합니다.");
    }
    const url = new URL(serverUrl);
    if (url.protocol === "https:") url.protocol = "wss:";
    else if (url.protocol === "http:") url.protocol = "ws:";
    else if (url.protocol !== "wss:" && url.protocol !== "ws:") {
        throw new Error("게임 서버는 HTTPS 또는 WSS 주소여야 합니다.");
    }
    if (url.pathname === "/" || url.pathname === "") url.pathname = "/multiplayer";
    url.searchParams.set("channel", channelId);
    return url.href;
}

export function multiplayerHealthUrl(serverUrl) {
    const url = new URL(serverUrl);
    if (url.protocol === "wss:") url.protocol = "https:";
    else if (url.protocol === "ws:") url.protocol = "http:";
    else if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("게임 서버는 HTTPS 또는 WSS 주소여야 합니다.");
    }
    url.pathname = "/health";
    url.search = "";
    url.hash = "";
    return url.href;
}

export async function probeMultiplayerServer(
    serverUrl,
    { fetcher = globalThis.fetch, timeoutMs = 1500, AbortControllerImpl = globalThis.AbortController } = {}
) {
    if (!serverUrl || typeof fetcher !== "function") return false;
    const controller = typeof AbortControllerImpl === "function" ? new AbortControllerImpl() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
        const response = await fetcher(multiplayerHealthUrl(serverUrl), {
            method: "GET",
            cache: "no-store",
            ...(controller ? { signal: controller.signal } : {})
        });
        if (!response.ok) return false;
        const health = await response.json();
        return health?.status === "ok";
    } catch {
        return false;
    } finally {
        if (timer !== null) clearTimeout(timer);
    }
}
