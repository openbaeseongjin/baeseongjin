import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStaticRequestHandler } from "../scripts/staticHandler.mjs";

function responseRecorder() {
    let resolveFinished;
    const finished = new Promise((resolvePromise) => (resolveFinished = resolvePromise));
    return {
        status: null,
        headers: null,
        chunks: [],
        finished,
        writeHead(status, headers) {
            this.status = status;
            this.headers = headers;
            return this;
        },
        write(chunk) {
            this.chunks.push(Buffer.from(chunk));
            return true;
        },
        end(chunk) {
            if (chunk) this.chunks.push(Buffer.from(chunk));
            resolveFinished();
            return this;
        },
        on() {
            return this;
        },
        once() {
            return this;
        },
        emit() {
            return true;
        },
        removeListener() {
            return this;
        }
    };
}

export async function run() {
    const root = mkdtempSync(join(tmpdir(), "baeseongjin-static-"));
    writeFileSync(
        join(root, "index.html"),
        '<html><head><meta name="multiplayer-server" content="https://deployed.example" />\n<meta charset="utf-8"></head><body>ok</body></html>',
        "utf8"
    );
    writeFileSync(join(root, "data.txt"), "plain", "utf8");
    mkdirSync(join(root, "nested"));
    writeFileSync(join(root, "nested", "index.html"), "<html>nested</html>", "utf8");

    const handler = createStaticRequestHandler(root);

    const index = responseRecorder();
    await handler({ method: "GET", url: "/" }, index);
    assert.equal(index.status, 200);
    const body = Buffer.concat(index.chunks).toString("utf8");
    assert.equal(body.includes("multiplayer-server"), false, "dev index.html must not expose the production endpoint");
    assert.equal(body.includes("meta charset"), true, "other head content must remain");
    assert.equal(
        Number(index.headers["content-length"]),
        Buffer.byteLength(body),
        "content-length must match the stripped body"
    );

    const head = responseRecorder();
    await handler({ method: "HEAD", url: "/" }, head);
    assert.equal(head.status, 200);
    assert.deepEqual(head.chunks, []);

    const plain = responseRecorder();
    await handler({ method: "GET", url: "/data.txt" }, plain);
    await plain.finished;
    assert.equal(plain.status, 200);
    assert.equal(Buffer.concat(plain.chunks).toString("utf8"), "plain");

    const nested = responseRecorder();
    await handler({ method: "GET", url: "/nested/index.html" }, nested);
    await nested.finished;
    assert.equal(Buffer.concat(nested.chunks).toString("utf8"), "<html>nested</html>");

    const missing = responseRecorder();
    await handler({ method: "GET", url: "/missing.html" }, missing);
    assert.equal(missing.status, 404);

    const traversal = responseRecorder();
    await handler({ method: "GET", url: "/..%2Fpackage.json" }, traversal);
    assert.equal(traversal.status, 403, "path traversal must not resolve outside the root");
}
