import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createGameServerRequestHandler } from "../scripts/gameServerHandler.mjs";
import { extractPageVersion, verifyServerVersion } from "../scripts/smokeMultiplayer.mjs";

async function listen(server) {
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    assert.equal(typeof address, "object");
    return `http://127.0.0.1:${address.port}`;
}

export async function run() {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    assert.match(packageJson.scripts["start:game-server"], /--game-only/);
    assert.match(packageJson.scripts["start:game-server"], /--host=0\.0\.0\.0/);
    assert.match(packageJson.scripts["start:game-server"], /--port=4175/);
    assert.throws(() => createGameServerRequestHandler(), /version must be a non-empty string/);
    assert.equal(extractPageVersion('<output id="app-version" data-version="9.8.7">v9.8.7</output>'), "9.8.7");

    const server = createServer(createGameServerRequestHandler({ version: "9.8.7" }));
    const origin = await listen(server);

    try {
        const health = await fetch(`${origin}/health`);
        assert.equal(health.status, 200);
        assert.equal(health.headers.get("cache-control"), "no-store");
        assert.deepEqual(await health.json(), { status: "ok", version: "9.8.7" });
        assert.equal(await verifyServerVersion(origin, "9.8.7"), "9.8.7");
        await assert.rejects(() => verifyServerVersion(origin, "9.8.8"), /배포 버전 불일치/);

        const head = await fetch(`${origin}/health`, { method: "HEAD" });
        assert.equal(head.status, 200);
        assert.equal(await head.text(), "");

        const root = await fetch(`${origin}/`);
        assert.equal(root.status, 404, "the production game server must not expose index.html");
        assert.equal(await root.text(), "Not found");

        const post = await fetch(`${origin}/health`, { method: "POST" });
        assert.equal(post.status, 404);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    }
}
