import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import {
    findCloudflared,
    quickTunnelArgs,
    configuredTunnelPath,
    assertPortAvailable,
    waitForOutput,
    READY_PATTERN,
    PUBLIC_URL_PATTERN
} from "./cloudflareTunnel.mjs";

const DEFAULT_PORT = 4173;

export async function shareMultiplayer({ port = DEFAULT_PORT } = {}) {
    const configPath = configuredTunnelPath();
    if (configPath) {
        throw new Error(
            `기존 Cloudflare 설정을 감지해 중단했습니다: ${configPath}\n설정 파일을 변경하지 않고 별도 환경에서 실행하세요.`
        );
    }
    await assertPortAvailable(port);
    const cloudflared = findCloudflared();
    const server = spawn(process.execPath, ["scripts/multiplayer-server.mjs", `--port=${port}`], {
        cwd: new URL("..", import.meta.url),
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
    });
    let tunnel = null;
    const stop = () => {
        if (tunnel && !tunnel.killed) tunnel.kill();
        if (!server.killed) server.kill();
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    try {
        await waitForOutput(server, READY_PATTERN, 10_000, "멀티 서버");
        tunnel = spawn(cloudflared, quickTunnelArgs(port), {
            stdio: ["ignore", "pipe", "pipe"],
            windowsHide: true
        });
        const publicUrl = await waitForOutput(tunnel, PUBLIC_URL_PATTERN, 30_000, "Quick Tunnel");
        console.log(`\n공유 주소: ${publicUrl}`);
        console.log("종료하려면 Ctrl+C를 누르세요. 이 프로세스가 시작한 서버와 터널만 종료됩니다.");
        return { publicUrl, server, tunnel, stop };
    } catch (error) {
        stop();
        throw error;
    }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
    const portArgument = process.argv.find((argument) => argument.startsWith("--port="))?.slice(7);
    const port = Number(portArgument ?? DEFAULT_PORT);
    if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error("port must be between 1 and 65535");
    await shareMultiplayer({ port });
}
