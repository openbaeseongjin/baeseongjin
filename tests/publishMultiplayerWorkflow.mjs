import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    buildCommitMessage,
    buildDeployCommands,
    checkPublicHealth,
    checkPublishPreconditions,
    createGitExecutor,
    deployEndpoint,
    healthUrlFromEndpoint,
    publishApplication,
    publishMultiplayer,
    publishServerArgs,
    replaceMultiplayerServerEndpoint,
    waitForPagesEndpoint
} from "../scripts/publish-multiplayer.mjs";
import { quickTunnelArgs } from "../scripts/cloudflareTunnel.mjs";

const NEW_URL = "https://ab-cd-ef-new.trycloudflare.com";
const NEW_META = `<meta name="multiplayer-server" content="${NEW_URL}" />`;

function makeGit({ behaviors }) {
    const calls = [];
    const run = (args) => {
        calls.push([...args]);
        const behavior = behaviors[args.join(" ")] ?? behaviors.default;
        if (typeof behavior === "function") return behavior(args);
        return behavior ?? { status: 0, stdout: "", stderr: "" };
    };
    return { run, calls };
}

function cleanPreconditionBehaviors() {
    return {
        "fetch origin": { status: 0, stdout: "", stderr: "" },
        "status --porcelain": { status: 0, stdout: "", stderr: "" },
        "rev-parse --abbrev-ref HEAD": { status: 0, stdout: "main\n", stderr: "" },
        "remote get-url origin": {
            status: 0,
            stdout: "https://github.com/openbaeseongjin/baeseongjin.git\n",
            stderr: ""
        },
        "rev-parse HEAD": { status: 0, stdout: "abc123\n", stderr: "" },
        "rev-parse origin/main": { status: 0, stdout: "abc123\n", stderr: "" }
    };
}

function rejectsMatching(fn, pattern, label = "") {
    return assert.rejects(async () => fn(), pattern);
}

function runGit(dir, ...args) {
    const result = spawnSync("git", args, { cwd: dir, encoding: "utf8", windowsHide: true });
    if (result.status !== 0) {
        throw new Error(
            `git ${args.join(" ")} 실패: ${String(result.stderr ?? "").trim() || String(result.stdout ?? "").trim() || "git 오류"}`
        );
    }
    return String(result.stdout ?? "").trim();
}

function initGitRepo(dir, indexPath, html) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(indexPath, html, "utf8");
    runGit(dir, "init");
    runGit(dir, "config", "user.email", "test@example.com");
    runGit(dir, "config", "user.name", "Repository Test");
    runGit(dir, "branch", "-M", "main");
    runGit(dir, "add", "--", ".");
    runGit(dir, "commit", "-m", "base commit");
}

function makeBareRemote(dir, name = "origin.git") {
    runGit(dir, "init", "--bare", name);
    return join(dir, name);
}

function recordedGitExec(dir) {
    const calls = [];
    const exec = createGitExecutor();
    return {
        calls,
        run(args, options = {}) {
            calls.push([...args]);
            return exec.run(args, { cwd: dir, ...options });
        }
    };
}

export async function run() {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    assert.equal(packageJson.scripts["publish:multiplayer"], "node scripts/publish-multiplayer.mjs");
    assert.equal(packageJson.scripts["share:multiplayer"], "node scripts/share-multiplayer.mjs");

    const args = publishServerArgs();
    assert.deepEqual(args, ["scripts/multiplayer-server.mjs", "--game-only", "--host=0.0.0.0", "--port=4175"]);
    assert.deepEqual(quickTunnelArgs(4175), ["tunnel", "--url", "http://127.0.0.1:4175", "--no-autoupdate"]);
    const application = publishApplication();
    assert.deepEqual(application.serverCommand, [process.execPath, ...args]);
    assert.deepEqual(application.tunnelArgs, ["tunnel", "--url", "http://127.0.0.1:4175", "--no-autoupdate"]);

    const commands = buildDeployCommands();
    assert.deepEqual(commands.add, ["add", "--", "index.html"]);
    assert.deepEqual(commands.push, ["push", "origin", "main"]);
    assert.equal(commands.push.includes("--force"), false);

    const fixture =
        '<!doctype html>\n<html lang="ko"><head>\n<meta name="multiplayer-server" content="https://old.example.org" />\n<meta name="viewport" content="width=device-width" />\n</head></html>';
    const updated = replaceMultiplayerServerEndpoint(fixture, NEW_URL);
    assert.match(updated, new RegExp(NEW_META.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(updated.includes('content="https://old.example.org"'), false);
    assert.equal(
        updated,
        fixture.replace("https://old.example.org", NEW_URL),
        "only the multiplayer-server content value must change"
    );
    await rejectsMatching(
        () => replaceMultiplayerServerEndpoint(fixture, "http://plain.example.com"),
        /HTTPS/,
        "non-HTTPS endpoint is rejected"
    );
    await rejectsMatching(
        () => replaceMultiplayerServerEndpoint("<html></html>", NEW_URL),
        /메타 태그를 찾을 수 없습니다/,
        "missing meta tag is rejected"
    );

    const message = buildCommitMessage({ publicUrl: NEW_URL, version: "1.2.3" });
    assert.match(message, /재시작 뒤 운영용 게임 서버/);
    assert.match(message, /status ok/);
    assert.match(message, /Tested: tunnel \/health before push/);
    assert.match(message, /Not-tested: GitHub Pages propagation and public smoke after commit/);
    assert.match(message, /Confidence: high/);
    assert.match(message, /Scope-risk: narrow/);

    const happyPrecondition = makeGit({ behaviors: cleanPreconditionBehaviors() });
    await checkPublishPreconditions({ git: happyPrecondition });
    assert.deepEqual(happyPrecondition.calls[0], ["fetch", "origin"], "fetch must run before any status/ref check");

    const dirtyGit = makeGit({
        behaviors: {
            ...cleanPreconditionBehaviors(),
            "status --porcelain": { status: 0, stdout: " M index.html\n", stderr: "" }
        }
    });
    await rejectsMatching(() => checkPublishPreconditions({ git: dirtyGit }), /작업 트리가 완전히 깨끗하지 않습니다/);
    assert.deepEqual(dirtyGit.calls.length, 2, "a dirty worktree stops before any ref/remote lookup");

    const wrongBranchGit = makeGit({
        behaviors: {
            ...cleanPreconditionBehaviors(),
            "rev-parse --abbrev-ref HEAD": { status: 0, stdout: "feature/share\n", stderr: "" }
        }
    });
    await rejectsMatching(() => checkPublishPreconditions({ git: wrongBranchGit }), /브랜치가 main이 아닙니다/);

    const missingOriginGit = makeGit({
        behaviors: {
            ...cleanPreconditionBehaviors(),
            "remote get-url origin": { status: 1, stdout: "", stderr: "fatal: no such remote" }
        }
    });
    await rejectsMatching(
        () => checkPublishPreconditions({ git: missingOriginGit }),
        /origin remote가 존재하지 않습니다/
    );

    const divergedGit = makeGit({
        behaviors: {
            ...cleanPreconditionBehaviors(),
            "rev-parse origin/main": { status: 0, stdout: "def456\n", stderr: "" }
        }
    });
    await rejectsMatching(() => checkPublishPreconditions({ git: divergedGit }), /정확히 같지 않습니다/);

    const failedFetchGit = makeGit({
        behaviors: { "fetch origin": { status: 128, stdout: "", stderr: "no network" } }
    });
    await rejectsMatching(() => checkPublishPreconditions({ git: failedFetchGit }), /fetch origin이 실패/);

    const originalHtml = fixture;
    const tmp = mkdtempSync(join(tmpdir(), "publish-multiplayer-"));
    try {
        const indexPath = join(tmp, "index.html");
        writeFileSync(indexPath, originalHtml, "utf8");
        const okGit = makeGit({ behaviors: { default: { status: 0, stdout: "", stderr: "" } } });
        const result = await deployEndpoint({
            git: okGit,
            publicUrl: NEW_URL,
            version: "1.2.3",
            path: indexPath
        });
        const deployed = readFileSync(indexPath, "utf8");
        assert.match(deployed, new RegExp(NEW_META.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
        assert.ok(
            result.message.includes("Tested: tunnel /health before push"),
            "commit message records the pre-push health check"
        );
        assert.deepEqual(okGit.calls[0], ["add", "--", "index.html"], "only index.html is staged");
        assert.deepEqual(okGit.calls[1][0], "commit", "a commit is created for the endpoint change");
        assert.deepEqual(okGit.calls[2], ["push", "origin", "main"], "push targets origin main without force");
    } finally {
        rmSync(tmp, { recursive: true, force: true });
    }

    const gitTmp = mkdtempSync(join(tmpdir(), "publish-git-"));
    try {
        const successOrigin = makeBareRemote(gitTmp, "origin-success.git");
        const successWork = join(gitTmp, "work-success");
        const successIndex = join(successWork, "index.html");
        initGitRepo(successWork, successIndex, originalHtml);
        runGit(successWork, "remote", "add", "origin", successOrigin);
        runGit(successWork, "push", "-u", "origin", "main");
        const successGit = recordedGitExec(successWork);
        await deployEndpoint({ git: successGit, publicUrl: NEW_URL, version: "1.2.3", path: successIndex });
        assert.equal(readFileSync(successIndex, "utf8").includes(NEW_URL), true, "success push keeps the new endpoint");
        assert.equal(runGit(successWork, "status", "--porcelain"), "", "success push leaves a clean worktree");
        assert.match(runGit(successWork, "log", "-1", "--format=%s"), /재시작 뒤 운영용 게임 서버/);
        assert.equal(runGit(successWork, "rev-parse", "origin/main"), runGit(successWork, "rev-parse", "HEAD"));

        const failOrigin = makeBareRemote(gitTmp, "origin-fail.git");
        const failWork = join(gitTmp, "work-fail");
        const failIndex = join(failWork, "index.html");
        initGitRepo(failWork, failIndex, originalHtml);
        runGit(failWork, "remote", "add", "origin", failOrigin);
        runGit(failWork, "push", "-u", "origin", "main");
        const baseSha = runGit(failWork, "rev-parse", "HEAD");
        runGit(failWork, "checkout", "-b", "remote-ahead");
        writeFileSync(join(failWork, "ahead.txt"), "ahead", "utf8");
        runGit(failWork, "add", "--", "ahead.txt");
        runGit(failWork, "commit", "-m", "advance remote");
        runGit(failWork, "push", "origin", "HEAD:main");
        runGit(failWork, "checkout", "main");
        runGit(failWork, "branch", "-D", "remote-ahead");
        assert.notEqual(runGit(failWork, "rev-parse", "origin/main"), baseSha, "remote is ahead of local main");

        const failGit = recordedGitExec(failWork);
        await rejectsMatching(
            () => deployEndpoint({ git: failGit, publicUrl: NEW_URL, version: "1.2.3", path: failIndex }),
            /push origin main에 실패/,
            "a rejected push surfaces the failure"
        );
        assert.deepEqual(
            failGit.calls.at(-1),
            ["reset", "--mixed", "HEAD~1"],
            "rollback removes only the unpushed commit and resets the index"
        );
        assert.equal(runGit(failWork, "rev-parse", "HEAD"), baseSha, "rollback restores the previous commit");
        assert.equal(runGit(failWork, "status", "--porcelain"), "", "rollback leaves a clean worktree");
        assert.equal(runGit(failWork, "diff", "--cached", "--exit-code"), "", "rollback resets the index to HEAD");
        assert.equal(readFileSync(failIndex, "utf8"), originalHtml, "rollback restores the original index.html");

        const preWork = join(gitTmp, "work-precommit");
        const preIndex = join(preWork, "index.html");
        initGitRepo(preWork, preIndex, originalHtml);
        runGit(preWork, "remote", "add", "origin", makeBareRemote(gitTmp, "origin-precommit.git"));
        runGit(preWork, "push", "-u", "origin", "main");
        const preBaseSha = runGit(preWork, "rev-parse", "HEAD");
        const preGit = recordedGitExec(preWork);
        const failingCommit = {
            add: ["add", "--", "index.html"],
            commit: () => ["commit", "no-such-path", "-m", "x"],
            push: ["push", "origin", "main"]
        };
        await rejectsMatching(
            () =>
                deployEndpoint({
                    git: preGit,
                    publicUrl: NEW_URL,
                    version: "1.2.3",
                    path: preIndex,
                    commands: failingCommit
                }),
            /Lore 커밋 생성에 실패/,
            "a failing commit surfaces the failure"
        );
        assert.deepEqual(
            preGit.calls.at(-1),
            ["reset", "--", "index.html"],
            "pre-commit failure unstages only index.html"
        );
        assert.equal(runGit(preWork, "rev-parse", "HEAD"), preBaseSha, "pre-commit rollback keeps HEAD unchanged");
        assert.equal(runGit(preWork, "status", "--porcelain"), "", "pre-commit rollback leaves a clean worktree");
        assert.equal(readFileSync(preIndex, "utf8"), originalHtml, "pre-commit rollback restores index.html");
    } finally {
        rmSync(gitTmp, { recursive: true, force: true });
    }

    assert.equal(healthUrlFromEndpoint("https://abc.trycloudflare.com"), "https://abc.trycloudflare.com/health");
    let askedUrl;
    const healthy = await checkPublicHealth("https://abc.trycloudflare.com/health", "1.2.3", async (url) => {
        askedUrl = url;
        return { ok: true, json: async () => ({ status: "ok", version: "1.2.3" }) };
    });
    assert.deepEqual(healthy, { status: "ok", version: "1.2.3" });
    assert.equal(askedUrl, "https://abc.trycloudflare.com/health");
    await rejectsMatching(
        () =>
            checkPublicHealth("https://abc.trycloudflare.com/health", "9.9.9", async () => ({
                ok: true,
                json: async () => ({ status: "ok", version: "1.2.3" })
            })),
        /버전 불일치/,
        "health version mismatch fails closed"
    );
    await rejectsMatching(
        () =>
            checkPublicHealth(
                "https://abc.trycloudflare.com/health",
                "1.2.3",
                async () => ({
                    ok: false,
                    status: 503
                }),
                { attempts: 1 }
            ),
        /HTTP 503/,
        "unhealthy HTTP status fails closed"
    );

    let transientAttempts = 0;
    const recovered = await checkPublicHealth(
        "https://abc.trycloudflare.com/health",
        "1.2.3",
        async () => {
            transientAttempts += 1;
            if (transientAttempts === 1) throw new Error("tunnel not ready yet");
            return { ok: true, json: async () => ({ status: "ok", version: "1.2.3" }) };
        },
        { attempts: 3, delayMs: 1 }
    );
    assert.deepEqual(recovered, { status: "ok", version: "1.2.3" }, "transient health failure retries to success");
    assert.equal(transientAttempts, 2, "a transient health failure is retried then succeeds");

    let exhaustedAttempts = 0;
    await rejectsMatching(
        () =>
            checkPublicHealth(
                "https://abc.trycloudflare.com/health",
                "1.2.3",
                async () => {
                    exhaustedAttempts += 1;
                    throw new Error("tunnel stayed down");
                },
                { attempts: 2, delayMs: 1 }
            ),
        /tunnel stayed down/,
        "exhausted health retries fail closed"
    );
    assert.equal(exhaustedAttempts, 2, "health retries exhaust their bounded attempts");

    const pageHtml = (url) =>
        `<!doctype html>\n<html><head><meta name="multiplayer-server" content="${url}" /></head><body>v1</body></html>`;
    let pageCalls = 0;
    await waitForPagesEndpoint({
        pageUrl: "https://openbaeseongjin.github.io/baeseongjin/",
        expectedServerUrl: NEW_URL,
        attempts: 4,
        delayMs: 1,
        fetchFn: async () => {
            pageCalls += 1;
            return {
                ok: true,
                text: async () => pageHtml(pageCalls === 1 ? "https://stale.trycloudflare.com" : NEW_URL)
            };
        }
    });
    assert.equal(pageCalls, 2, "the pages gate succeeds once the new endpoint is exposed");
    await rejectsMatching(
        () =>
            waitForPagesEndpoint({
                pageUrl: "https://openbaeseongjin.github.io/baeseongjin/",
                expectedServerUrl: NEW_URL,
                attempts: 2,
                delayMs: 1,
                fetchFn: async () => ({ ok: true, text: async () => pageHtml("https://stale.trycloudflare.com") })
            }),
        /대기하지 못했습니다/,
        "the pages gate fails closed while the endpoint is stale"
    );

    const signalTmp = mkdtempSync(join(tmpdir(), "publish-signal-"));
    try {
        const indexPath = join(signalTmp, "index.html");
        writeFileSync(indexPath, fixture, "utf8");
        const git = makeGit({
            behaviors: {
                ...cleanPreconditionBehaviors(),
                default: { status: 0, stdout: "", stderr: "" }
            }
        });
        let stopCalls = 0;
        const stack = {
            publicUrl: NEW_URL,
            stop() {
                stopCalls += 1;
            }
        };
        let abortedWhileAlive = false;
        const keepAliveFn = (signal) =>
            new Promise((resolve) => {
                const onAbort = () => {
                    abortedWhileAlive = true;
                    resolve();
                };
                setImmediate(() => {
                    process.emit("SIGINT");
                    if (signal.aborted) onAbort();
                    else signal.addEventListener("abort", onAbort, { once: true });
                });
            });
        await publishMultiplayer({
            version: "1.2.3",
            git,
            indexHtmlPath: indexPath,
            startStack: async () => stack,
            fetchFn: async (url) => {
                if (url.includes("/health")) {
                    return { ok: true, json: async () => ({ status: "ok", version: "1.2.3" }) };
                }
                return { ok: true, text: async () => pageHtml(NEW_URL) };
            },
            smokeFn: async () => ({ smoke: true }),
            keepAliveFn,
            onLog: () => {}
        });
        assert.ok(abortedWhileAlive, "signal handlers stay effective until keep-alive ends");
        assert.equal(stopCalls, 1, "stack.stop runs exactly once in the final cleanup");
        assert.equal(process.listenerCount("SIGINT"), 0, "SIGINT handler is removed in the final cleanup");
        assert.equal(process.listenerCount("SIGTERM"), 0, "SIGTERM handler is removed in the final cleanup");
        assert.equal(
            readFileSync(indexPath, "utf8").includes(NEW_URL),
            true,
            "the endpoint was deployed before keep-alive"
        );
    } finally {
        rmSync(signalTmp, { recursive: true, force: true });
    }
}
