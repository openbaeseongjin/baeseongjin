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
