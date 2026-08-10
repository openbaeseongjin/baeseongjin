import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function pngDimensions(path) {
    const bytes = readFileSync(path);
    assert.equal(bytes.subarray(1, 4).toString(), "PNG", `${path} must be a PNG image`);
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

export function run() {
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
    assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
    assert.match(html, /rel="apple-touch-icon"/);
    const worker = readFileSync("sw.js", "utf8");
    assert.doesNotMatch(worker, /caches\./, "automatic updates must not introduce manual cache versioning");
    assert.match(worker, /cache:\s*"no-store"/, "same-origin game files must bypass the browser HTTP cache");
    assert.match(readFileSync("scripts/staticHandler.mjs", "utf8"), /application\/manifest\+json/);
    assert.match(readFileSync("scripts/serve.mjs", "utf8"), /createStaticRequestHandler/);
    assert.match(readFileSync("scripts/multiplayer-server.mjs", "utf8"), /createStaticRequestHandler/);
}
