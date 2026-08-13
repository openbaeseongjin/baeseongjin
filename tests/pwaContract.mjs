import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function pngDimensions(path) {
    const bytes = readFileSync(path);
    assert.equal(bytes.subarray(1, 4).toString(), "PNG", `${path} must be a PNG image`);
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

export function run() {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    const packageLock = JSON.parse(readFileSync("package-lock.json", "utf8"));
    const manifest = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
    assert.equal(manifest.start_url, "./");
    assert.equal(manifest.scope, "./");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.orientation, "landscape");
    assert.ok(manifest.display_override.includes("fullscreen"));

    const expectedIcons = new Map([
        ["./assets/icons/app-icon-192.png", 192],
        ["./assets/icons/app-icon-512.png", 512]
    ]);
    for (const icon of manifest.icons) {
        const size = expectedIcons.get(icon.src);
        assert.ok(size, `unexpected manifest icon ${icon.src}`);
        assert.deepEqual(pngDimensions(icon.src.slice(2)), { width: size, height: size });
        assert.match(icon.purpose, /maskable/);
    }

    assert.deepEqual(pngDimensions("assets/icons/apple-touch-icon.png"), { width: 180, height: 180 });
    assert.deepEqual(pngDimensions("assets/icons/favicon-64.png"), { width: 64, height: 64 });
    const html = readFileSync("index.html", "utf8");
    const pageVersion = html.match(/id="app-version"[^>]*data-version="([^"]+)"/)?.[1];
    assert.equal(pageVersion, packageJson.version, "the visible page version must match package.json");
    assert.match(html, new RegExp(`>\\s*v${packageJson.version.replaceAll(".", "\\.")}\\s*</output\\s*>`));
    assert.equal(packageLock.version, packageJson.version, "the lockfile version must match package.json");
    assert.equal(
        packageLock.packages[""].version,
        packageJson.version,
        "the root lock package must match package.json"
    );
    assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
    assert.match(html, /rel="apple-touch-icon"/);
    const multiplayerServer = html.match(/<meta name="multiplayer-server" content="([^"]+)"/)?.[1];
    assert.match(multiplayerServer, /^https:\/\//, "the deployed client needs a secure game server endpoint");
    const worker = readFileSync("sw.js", "utf8");
    const workerVersion = worker.match(/const RELEASE_VERSION = "([^"]+)"/)?.[1];
    assert.equal(workerVersion, packageJson.version, "each release must update the worker and refresh open PWAs");
    assert.doesNotMatch(worker, /caches\./, "automatic updates must not introduce manual cache versioning");
    assert.match(worker, /cache:\s*"no-store"/, "same-origin game files must bypass the browser HTTP cache");
    assert.match(readFileSync("scripts/staticHandler.mjs", "utf8"), /application\/manifest\+json/);
    assert.match(readFileSync("scripts/staticHandler.mjs", "utf8"), /audio\/wav/);
    assert.match(readFileSync("scripts/staticHandler.mjs", "utf8"), /accept-ranges/);
    assert.match(readFileSync("scripts/serve.mjs", "utf8"), /createStaticRequestHandler/);
    assert.match(readFileSync("scripts/multiplayer-server.mjs", "utf8"), /createStaticRequestHandler/);
}
