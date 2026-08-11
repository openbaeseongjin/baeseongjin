import { pathToFileURL } from "node:url";
import { WebSocket } from "ws";
import { channelSocketUrl } from "../src/game/runtime/MultiplayerServerEndpoint.js";
import { RemoteGameAuthority } from "../src/game/runtime/RemoteGameAuthority.js";

const DEFAULT_PAGE_URL = "https://openbaeseongjin.github.io/baeseongjin/";

export function extractMultiplayerServer(html) {
    const tag = html.match(/<meta\s+[^>]*name=["']multiplayer-server["'][^>]*>/i)?.[0];
    const serverUrl = tag?.match(/content=["']([^"']+)["']/i)?.[1]?.trim();
    if (!serverUrl) throw new Error("페이지에서 multiplayer-server 설정을 찾을 수 없습니다.");
    return serverUrl;
}

export function extractPageVersion(html) {
    const tag = html.match(/<output\s+[^>]*id=["']app-version["'][^>]*>/i)?.[0];
    const version = tag?.match(/data-version=["']([^"']+)["']/i)?.[1]?.trim();
    if (!version) throw new Error("페이지에서 배포 버전을 찾을 수 없습니다.");
    return version;
}

function healthUrlFromServer(serverUrl) {
    const healthUrl = new URL(serverUrl);
    if (healthUrl.protocol === "ws:") healthUrl.protocol = "http:";
    if (healthUrl.protocol === "wss:") healthUrl.protocol = "https:";
    healthUrl.pathname = "/health";
    healthUrl.search = "";
    healthUrl.hash = "";
    return healthUrl;
}

export async function verifyServerVersion(serverUrl, pageVersion) {
    const response = await fetch(healthUrlFromServer(serverUrl), { cache: "no-store" });
    if (!response.ok) throw new Error(`게임 서버 상태 확인 실패: HTTP ${response.status}`);
    const health = await response.json();
    if (health.status !== "ok") throw new Error("게임 서버 상태가 정상이 아닙니다.");
    if (health.version !== pageVersion) {
        throw new Error(`배포 버전 불일치: Pages ${pageVersion}, game server ${health.version ?? "unknown"}`);
    }
    return health.version;
}

function argument(name) {
    return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function waitFor(predicate, message, timeoutMs = 5000) {
    const deadline = performance.now() + timeoutMs;
    while (performance.now() < deadline) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 25));
    }
    throw new Error(message);
}

async function closeAuthority(authority) {
    const socket = authority?.socket;
    if (!socket || socket.readyState === WebSocket.CLOSED) return;
    const closed = new Promise((resolve) => socket.addEventListener("close", resolve, { once: true }));
    authority.close();
    await closed;
}

function webSocketFromOrigin(origin) {
    return class OriginWebSocket extends WebSocket {
        constructor(url) {
            super(url, { origin });
        }
    };
}

export async function smokeMultiplayer({ pageUrl = DEFAULT_PAGE_URL } = {}) {
    const response = await fetch(pageUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`페이지 응답 실패: HTTP ${response.status}`);
    const html = await response.text();
    const serverUrl = extractMultiplayerServer(html);
    const pageVersion = extractPageVersion(html);
    const serverVersion = await verifyServerVersion(serverUrl, pageVersion);
    const origin = new URL(pageUrl).origin;
    const WebSocketImpl = webSocketFromOrigin(origin);
    const first = new RemoteGameAuthority({ url: channelSocketUrl(serverUrl, "new"), WebSocketImpl });
    let second = null;

    try {
        await first.connect();
        const channelId = first.channelId;
        second = new RemoteGameAuthority({ url: channelSocketUrl(serverUrl, channelId), WebSocketImpl });
        await second.connect();
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 2 && second.latestSnapshot?.state.players.length === 2,
            "두 클라이언트가 같은 2인 snapshot을 받지 못했습니다."
        );
        if (!first.latestSnapshot.state.metrics) throw new Error("권위 snapshot에 RunMetrics가 없습니다.");

        await closeAuthority(second);
        await waitFor(
            () => first.latestSnapshot?.state.players.length === 1,
            "퇴장 후 1인 snapshot을 받지 못했습니다."
        );
        await closeAuthority(first);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const removedRoom = new RemoteGameAuthority({
            url: channelSocketUrl(serverUrl, channelId),
            WebSocketImpl
        });
        try {
            await removedRoom.connect();
            removedRoom.close();
            throw new Error("마지막 플레이어 퇴장 후에도 채널이 남아 있습니다.");
        } catch (error) {
            if (!/찾을 수 없습니다|channel not found/i.test(error.message)) throw error;
        }

        return {
            pageUrl,
            serverUrl,
            pageVersion,
            serverVersion,
            origin,
            channelId,
            playersJoined: 2,
            emptyRoomRemoved: true
        };
    } finally {
        await closeAuthority(second);
        await closeAuthority(first);
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    smokeMultiplayer({ pageUrl: argument("page") ?? DEFAULT_PAGE_URL })
        .then((result) => console.log(`PASS public multiplayer smoke ${JSON.stringify(result)}`))
        .catch((error) => {
            console.error(`FAIL public multiplayer smoke: ${error.message}`);
            process.exitCode = 1;
        });
}
