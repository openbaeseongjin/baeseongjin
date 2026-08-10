import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createGameServerRequestHandler } from "../scripts/gameServerHandler.mjs";

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
    const server = createServer(createGameServerRequestHandler());
    const origin = await listen(server);

    try {
        const health = await fetch(`${origin}/health`);
        assert.equal(health.status, 200);
        assert.equal(health.headers.get("cache-control"), "no-store");
        assert.deepEqual(await health.json(), { status: "ok" });

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
