import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
    assertPortAvailable,
    configuredTunnelPath,
    parseQuickTunnelUrl,
    quickTunnelArgs
} from "../scripts/share-multiplayer.mjs";

export async function run() {
    assert.equal(
        parseQuickTunnelUrl("INF Your quick Tunnel has been created! https://rope-game.trycloudflare.com"),
        "https://rope-game.trycloudflare.com"
    );
    assert.equal(parseQuickTunnelUrl("no public address"), null);
    assert.deepEqual(quickTunnelArgs(4173), ["tunnel", "--url", "http://127.0.0.1:4173", "--no-autoupdate"]);

    const base = join(tmpdir(), `baeseongjin-cloudflared-${Date.now()}`);
    assert.equal(configuredTunnelPath(base), null);
    await mkdir(join(base, ".cloudflared"), { recursive: true });
    const config = join(base, ".cloudflared", "config.yml");
    await writeFile(config, "tunnel: existing\n");
    assert.equal(configuredTunnelPath(base), config);

    await assertPortAvailable(0);
}
