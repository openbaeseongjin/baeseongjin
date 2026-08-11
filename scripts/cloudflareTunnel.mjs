import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";

export const READY_PATTERN = /Baeseongjin multiplayer \((?:game-only|development)\):/;
export const PUBLIC_URL_PATTERN = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

export function parseQuickTunnelUrl(output) {
    return output.match(PUBLIC_URL_PATTERN)?.[0] ?? null;
}

export function quickTunnelArgs(port) {
    return ["tunnel", "--url", `http://127.0.0.1:${port}`, "--no-autoupdate"];
}

export function configuredTunnelPath(base = homedir()) {
    return (
        [join(base, ".cloudflared", "config.yml"), join(base, ".cloudflared", "config.yaml")].find(existsSync) ?? null
    );
}

export function findCloudflared() {
    if (process.env.CLOUDFLARED_PATH) return process.env.CLOUDFLARED_PATH;
    const locator = process.platform === "win32" ? "where.exe" : "which";
    const result = spawnSync(locator, ["cloudflared"], { encoding: "utf8", windowsHide: true });
    const candidate = result.stdout?.split(/\r?\n/).find(Boolean);
    if (result.status !== 0 || !candidate) {
        throw new Error("cloudflared를 찾지 못했습니다. 설치 후 PATH 또는 CLOUDFLARED_PATH를 설정하세요.");
    }
    return candidate.trim();
}

export function assertPortAvailable(port, host = "127.0.0.1") {
    return new Promise((resolve, reject) => {
        const probe = createServer();
        probe.once("error", (error) => {
            reject(
                error.code === "EADDRINUSE"
                    ? new Error(
                          `${port} 포트를 이미 다른 프로세스가 사용 중입니다. 다른 포트로 실행하거나 먼저 종료하세요.`
                      )
                    : error
            );
        });
        probe.listen(port, host, () => probe.close(resolve));
    });
}

export function waitForOutput(child, pattern, timeoutMs, label) {
    return new Promise((resolve, reject) => {
        let output = "";
        const timer = setTimeout(() => finish(new Error(`${label} 시작 시간이 초과되었습니다.`)), timeoutMs);
        const onData = (chunk) => {
            const text = chunk.toString();
            output += text;
            process.stdout.write(text);
            const match = output.match(pattern);
            if (match) finish(null, match[0]);
        };
        const onExit = (code) => finish(new Error(`${label} 프로세스가 종료되었습니다. (code ${code})`));
        const finish = (error, value) => {
            clearTimeout(timer);
            child.stdout?.off("data", onData);
            child.stderr?.off("data", onData);
            child.off("exit", onExit);
            child.stdout?.pipe(process.stdout);
            child.stderr?.pipe(process.stdout);
            if (error) reject(error);
            else resolve(value);
        };
        child.stdout?.on("data", onData);
        child.stderr?.on("data", onData);
        child.once("exit", onExit);
    });
}
