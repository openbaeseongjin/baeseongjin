import { readFileSync, writeFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { extractMultiplayerServer, smokeMultiplayer } from "./smokeMultiplayer.mjs";
import {
    PUBLIC_URL_PATTERN,
    READY_PATTERN,
    assertPortAvailable,
    configuredTunnelPath,
    findCloudflared,
    quickTunnelArgs,
    waitForOutput
} from "./cloudflareTunnel.mjs";

export const GAME_SERVER_SCRIPT = "scripts/multiplayer-server.mjs";
export const SERVER_HOST = "0.0.0.0";
export const SERVER_PORT = 4175;
export const DEFAULT_PAGE_URL = "https://openbaeseongjin.github.io/baeseongjin/";
export const PAGES_RETRY_ATTEMPTS = 30;
export const PAGES_RETRY_DELAY_MS = 5000;
export const HEALTH_RETRY_ATTEMPTS = 20;
export const HEALTH_RETRY_DELAY_MS = 500;

const MULTIPLAYER_META_PATTERN = /<meta\s+[^>]*name=["']multiplayer-server["'][^>]*>/i;
const MULTIPLAYER_CONTENT = /\s+content=["'][^"']*["']/i;

function defaultRepoRoot() {
    return resolve(fileURLToPath(new URL("..", import.meta.url)));
}

function readPackageVersion(root) {
    return JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).version;
}

function stderrLine(result) {
    return (
        String(result?.stderr ?? "")
            .trim()
            .split(/\r?\n/)
            .pop() || "git 오류"
    );
}

function abortError() {
    const error = new Error("Ctrl+C 또는 SIGTERM으로 중단되었습니다.");
    error.code = "ABORTED";
    return error;
}

function waitForDelay(delayMs, signal) {
    if (signal?.aborted) return Promise.reject(abortError());
    return new Promise((resolve, reject) => {
        const onAbort = () => {
            clearTimeout(timer);
            reject(abortError());
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, delayMs);
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}

export function publishServerArgs() {
    return [GAME_SERVER_SCRIPT, "--game-only", `--host=${SERVER_HOST}`, `--port=${SERVER_PORT}`];
}

export function publishTunnelUrl() {
    return `http://127.0.0.1:${SERVER_PORT}`;
}

export function replaceMultiplayerServerEndpoint(html, serverUrl) {
    if (!/^https:\/\//i.test(serverUrl)) {
        throw new Error("multiplayer-server 주소는 HTTPS 주소여야 합니다.");
    }
    const tag = html.match(MULTIPLAYER_META_PATTERN)?.[0];
    if (!tag) {
        throw new Error('index.html에서 name="multiplayer-server" 메타 태그를 찾을 수 없습니다.');
    }
    const newTag = tag.replace(MULTIPLAYER_CONTENT, ` content="${serverUrl}"`);
    if (newTag === tag) {
        throw new Error("multiplayer-server 메타 태그에서 content 값을 찾지 못했습니다.");
    }
    const start = html.indexOf(tag);
    return html.slice(0, start) + newTag + html.slice(start + tag.length);
}

export function buildCommitMessage({ publicUrl, version }) {
    return [
        "재시작 뒤 운영용 게임 서버와 새 Quick Tunnel 주소를 Pages 배포에 반영한다",
        "",
        "게임 전용 서버(scripts/multiplayer-server.mjs --game-only --host=0.0.0.0 --port=4175)를 실행해",
        "http://127.0.0.1:4175 앞에 Cloudflare Quick Tunnel을 열고 새 HTTPS 주소를 받았다. 커밋 전에",
        `그 공개 주소의 /health가 status ok이고 package.json 버전(${version})과 일치함을 확인했다.`,
        '루트 index.html의 meta[name="multiplayer-server"] 값만 새 HTTPS 주소로 교체해 main에 직접 배포한다.',
        "Quick Tunnel 주소는 프로세스를 다시 실행할 때마다 달라지므로 고정 운영 주소가 아니다.",
        "GitHub Pages 전파 대기와 공개 smoke 검증은 이 커밋 이후 단계에서 수행한다.",
        `(신규 주소: ${publicUrl})`,
        "",
        "Confidence: high",
        "Scope-risk: narrow",
        `Tested: tunnel /health before push (version ${version})`,
        "Not-tested: GitHub Pages propagation and public smoke after commit"
    ].join("\n");
}

export function buildDeployCommands() {
    return {
        add: ["add", "--", "index.html"],
        commit: (message) => ["commit", "-m", message],
        push: ["push", "origin", "main"]
    };
}

export function createGitExecutor({ spawnFn = spawnSync } = {}) {
    return {
        run(args, options = {}) {
            const result = spawnFn("git", args, { encoding: "utf8", windowsHide: true, ...options });
            if (result.error) {
                const error = new Error(`git ${args[0] ?? ""} 실행 실패: ${result.error.message}`);
                error.cause = result.error;
                throw error;
            }
            return result;
        }
    };
}

export async function checkPublishPreconditions({ git }) {
    if (!git) throw new Error("checkPublishPreconditions: git executor가 필요합니다.");
    const fail = (message) => {
        const error = new Error(`publish 전제 확인 실패: ${message}`);
        error.code = "PUBLISH_PRECONDITION_FAILED";
        throw error;
    };
    const runGit = (args) => {
        try {
            return git.run(args);
        } catch (error) {
            fail(`git ${args[0] ?? ""} 실행 실패: ${error.message}`);
        }
        throw new Error("unreachable");
    };

    if (runGit(["fetch", "origin"]).status !== 0) fail("git fetch origin이 실패했습니다.");
    const status = runGit(["status", "--porcelain"]);
    if (status.status !== 0) fail(`git status 확인 실패 (${stderrLine(status)})`);
    if (String(status.stdout ?? "").trim()) {
        fail("작업 트리가 완전히 깨끗하지 않습니다. 관련 없는 변경은 커밋하거나 push하지 않고 중단합니다.");
    }
    const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
    if (branch.status !== 0 || String(branch.stdout ?? "").trim() !== "main") {
        fail(`현재 브랜치가 main이 아닙니다: ${String(branch.stdout ?? "").trim() || "unknown"}`);
    }
    const origin = runGit(["remote", "get-url", "origin"]);
    if (origin.status !== 0 || !String(origin.stdout ?? "").trim()) fail("origin remote가 존재하지 않습니다.");
    const head = runGit(["rev-parse", "HEAD"]);
    const remote = runGit(["rev-parse", "origin/main"]);
    if (remote.status !== 0) fail(`origin/main을 확인할 수 없습니다 (${stderrLine(remote)})`);
    if (String(head.stdout ?? "").trim() !== String(remote.stdout ?? "").trim()) {
        fail("로컬 HEAD가 fetch 직후의 origin/main과 정확히 같지 않습니다.");
    }
}

function assertGitOk(result, message) {
    if (!result || result.status !== 0) {
        throw new Error(`${message}${result ? ` (${stderrLine(result)})` : ""}`);
    }
}

export async function deployEndpoint({
    git,
    publicUrl,
    version,
    path = "index.html",
    readFile = readFileSync,
    writeFile = writeFileSync,
    buildMessage = buildCommitMessage,
    commands = buildDeployCommands()
} = {}) {
    if (!git) throw new Error("deployEndpoint: git executor가 필요합니다.");
    const original = readFile(path, "utf8");
    const message = buildMessage({ publicUrl, version });
    writeFile(path, replaceMultiplayerServerEndpoint(original, publicUrl), "utf8");
    let committed = false;
    try {
        assertGitOk(git.run(commands.add), "index.html만 stage하지 못했습니다.");
        assertGitOk(git.run(commands.commit(message)), "Lore 커밋 생성에 실패했습니다.");
        committed = true;
        assertGitOk(git.run(commands.push), "git push origin main에 실패했습니다.");
    } catch (error) {
        const rollbackFailures = [];
        try {
            assertGitOk(
                git.run(committed ? ["reset", "--mixed", "HEAD~1"] : ["reset", "--", "index.html"]),
                committed
                    ? "push 실패 후 이 워크플로의 커밋 제거와 index 초기화에 실패했습니다."
                    : "커밋 실패 후 stage 초기화에 실패했습니다."
            );
        } catch (rollbackError) {
            rollbackFailures.push(rollbackError.message);
        }
        try {
            writeFile(path, original, "utf8");
        } catch (rollbackError) {
            rollbackFailures.push(rollbackError.message);
        }
        if (rollbackFailures.length > 0) {
            error.message += ` (롤백 실패: ${rollbackFailures.join("; ")})`;
        }
        throw error;
    }
    return { message };
}

export function healthUrlFromEndpoint(publicUrl) {
    const url = new URL(publicUrl);
    if (url.protocol === "wss:") url.protocol = "https:";
    if (url.protocol === "ws:") url.protocol = "http:";
    url.pathname = "/health";
    url.search = "";
    url.hash = "";
    return url.href;
}

export async function checkPublicHealth(
    healthUrl,
    expectedVersion,
    fetchFn = fetch,
    { attempts = HEALTH_RETRY_ATTEMPTS, delayMs = HEALTH_RETRY_DELAY_MS, signal } = {}
) {
    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        if (signal?.aborted) throw abortError();
        try {
            const response = await fetchFn(healthUrl, { cache: "no-store", signal });
            if (!response.ok) {
                lastError = new Error(`공개 게임 서버 /health 확인 실패: HTTP ${response.status}`);
            } else {
                const health = await response.json();
                if (health.status !== "ok") {
                    const error = new Error(`공개 게임 서버 상태가 정상이 아닙니다: ${JSON.stringify(health)}`);
                    error.retryable = false;
                    throw error;
                }
                if (expectedVersion != null && health.version !== expectedVersion) {
                    const error = new Error(
                        `공개 게임 서버 버전 불일치: 기대 ${expectedVersion}, 실제 ${health.version ?? "unknown"}`
                    );
                    error.retryable = false;
                    throw error;
                }
                return health;
            }
        } catch (error) {
            if (error.retryable === false) throw error;
            lastError = error;
        }
        if (attempt < attempts) await waitForDelay(delayMs, signal);
    }
    throw new Error(`공개 게임 서버 /health 확인에 실패했습니다. ${lastError?.message ?? ""}`);
}

export async function waitForPagesEndpoint({
    pageUrl = DEFAULT_PAGE_URL,
    expectedServerUrl,
    fetchFn = fetch,
    attempts = PAGES_RETRY_ATTEMPTS,
    delayMs = PAGES_RETRY_DELAY_MS,
    onAttempt,
    signal
} = {}) {
    if (!expectedServerUrl) throw new Error("waitForPagesEndpoint: expectedServerUrl가 필요합니다.");
    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        if (signal?.aborted) throw abortError();
        try {
            const response = await fetchFn(pageUrl, { cache: "no-store" });
            if (!response.ok) {
                lastError = new Error(`Pages 응답 실패: HTTP ${response.status}`);
            } else {
                const exposed = extractMultiplayerServer(await response.text());
                if (exposed === expectedServerUrl) return;
                lastError = new Error(`Pages가 아직 새 주소를 노출하지 않습니다. 현재 노출 주소: ${exposed}`);
            }
        } catch (error) {
            lastError = error;
        }
        onAttempt?.(attempt, lastError);
        if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error(`GitHub Pages가 새 엔드포인트를 노출할 때까지 대기하지 못했습니다. ${lastError?.message ?? ""}`);
}

export function publishApplication() {
    return {
        serverCommand: [process.execPath, ...publishServerArgs()],
        tunnelArgs: quickTunnelArgs(SERVER_PORT)
    };
}

export async function startPublishStack({
    spawnFn = spawn,
    repoRoot = defaultRepoRoot(),
    cloudflaredPath,
    signal
} = {}) {
    const configPath = configuredTunnelPath();
    if (configPath) {
        throw new Error(
            `기존 Cloudflare 설정을 감지해 중단했습니다: ${configPath}\n설정 파일을 변경하지 않고 별도 환경에서 실행하세요.`
        );
    }
    await assertPortAvailable(SERVER_PORT, SERVER_HOST);
    const cloudflared = cloudflaredPath ?? findCloudflared();
    const server = spawnFn(process.execPath, publishServerArgs(), {
        cwd: repoRoot,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
    });
    let tunnel = null;
    let stopped = false;
    const stop = () => {
        if (stopped) return;
        stopped = true;
        signal?.removeEventListener("abort", onAbort);
        if (tunnel && !tunnel.killed) tunnel.kill();
        if (!server.killed) server.kill();
    };
    const onAbort = () => stop();
    signal?.addEventListener("abort", onAbort);
    try {
        await waitForOutput(server, READY_PATTERN, 10_000, "게임 서버");
        tunnel = spawnFn(cloudflared, quickTunnelArgs(SERVER_PORT), {
            stdio: ["ignore", "pipe", "pipe"],
            windowsHide: true
        });
        const publicUrl = await waitForOutput(tunnel, PUBLIC_URL_PATTERN, 30_000, "Quick Tunnel");
        return { publicUrl, server, tunnel, stop };
    } catch (error) {
        stop();
        throw error;
    }
}

async function keepAlive(signal) {
    const timer = setInterval(() => {}, 60_000);
    await new Promise((resolve) => {
        signal.addEventListener(
            "abort",
            () => {
                clearInterval(timer);
                resolve();
            },
            { once: true }
        );
    });
}

export async function publishMultiplayer(options = {}) {
    const root = options.repoRoot ?? defaultRepoRoot();
    const {
        pageUrl = DEFAULT_PAGE_URL,
        version = readPackageVersion(root),
        git = createGitExecutor(),
        spawnFn = spawn,
        fetchFn = fetch,
        smokeFn = smokeMultiplayer,
        indexHtmlPath = resolve(root, "index.html"),
        onLog = (message) => console.log(message),
        startStack = startPublishStack,
        keepAliveFn = keepAlive,
        healthAttempts = HEALTH_RETRY_ATTEMPTS,
        healthDelayMs = HEALTH_RETRY_DELAY_MS
    } = options;

    const controller = new AbortController();
    const signal = controller.signal;
    const onSignal = () => controller.abort();
    process.on("SIGINT", onSignal);
    process.on("SIGTERM", onSignal);

    let stack = null;
    const outcome = { pageUrl, pushed: false, smoke: null, failure: null };
    try {
        await checkPublishPreconditions({ git });
        if (signal.aborted) throw abortError();
        stack = await startStack({ spawnFn, repoRoot: root, signal });
        if (signal.aborted) throw abortError();

        let health;
        try {
            health = await checkPublicHealth(healthUrlFromEndpoint(stack.publicUrl), version, fetchFn, {
                attempts: healthAttempts,
                delayMs: healthDelayMs,
                signal
            });
            if (signal.aborted) throw abortError();
        } catch (error) {
            stack.stop();
            throw error;
        }

        try {
            await deployEndpoint({ git, publicUrl: stack.publicUrl, version, path: indexHtmlPath });
            outcome.pushed = true;
        } catch (error) {
            stack.stop();
            throw error;
        }

        if (signal.aborted) {
            onLog("publish:multiplayer: Ctrl+C 또는 SIGTERM으로 중단되었습니다.");
            if (outcome.pushed) onLog("main 반영은 이미 push됐으며, 이 프로세스가 시작한 서버와 터널만 종료합니다.");
            process.exitCode = 0;
        } else {
            try {
                await waitForPagesEndpoint({ pageUrl, expectedServerUrl: stack.publicUrl, fetchFn, signal });
                outcome.smoke = await smokeFn({ pageUrl });
            } catch (error) {
                outcome.failure = error;
            }

            if (outcome.failure) {
                onLog("\npublish:multiplayer: push 후 Pages 검증 실패");
                onLog(`실패 원인: ${outcome.failure.message}`);
                onLog(
                    "배포는 이미 main에 반영됐으므로 서버와 터널을 중지하지 않습니다. 상태를 확인하거나 이 주소로 재검증하세요."
                );
                onLog(`Pages URL: ${pageUrl}`);
                onLog(`게임 서버 URL: ${stack.publicUrl}`);
                onLog(`배포된 게임 서버 버전: ${health.version}`);
                onLog("검증을 마친 뒤 Ctrl+C를 누르면 이 프로세스가 시작한 서버와 터널만 종료됩니다.");
                process.exitCode = 1;
            } else {
                onLog("\n=== publish:multiplayer 성공 ===");
                onLog(`Pages URL: ${pageUrl}`);
                onLog(`게임 서버 URL: ${stack.publicUrl}`);
                onLog(`게임 서버 버전: ${health.version}`);
                onLog(
                    "검증: Pages가 새 엔드포인트를 노출했고 smokeMultiplayer(채널 생성·2인 참가·퇴장·빈 방 제거)를 통과했습니다."
                );
                onLog(
                    "터널과 게임 서버를 계속 실행합니다. 종료하려면 Ctrl+C를 누르세요. 이 프로세스가 시작한 서버와 터널만 종료됩니다."
                );
                process.exitCode = 0;
            }

            if (!signal.aborted) await keepAliveFn(signal);
        }
    } catch (error) {
        stack?.stop();
        throw error;
    } finally {
        stack?.stop();
        process.removeListener("SIGINT", onSignal);
        process.removeListener("SIGTERM", onSignal);
    }

    return outcome;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
    publishMultiplayer().catch((error) => {
        console.error(`publish:multiplayer 실패: ${error.message}`);
        process.exitCode = 1;
    });
}
