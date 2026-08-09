import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

export async function run() {
    const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
    const packageLock = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"));
    const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
    const deployedVersion = indexHtml.match(/id="app-version" data-version="([0-9]+\.[0-9]+\.[0-9]+)"/)?.[1];

    assert.ok(deployedVersion, "index.html must declare a semantic deployment version");
    assert.equal(packageJson.version, deployedVersion, "package version must match the deployed version");
    assert.equal(packageLock.version, deployedVersion, "lockfile version must match the deployed version");
    assert.equal(
        packageLock.packages[""].version,
        deployedVersion,
        "lockfile root package must match the deployed version"
    );
    assert.match(indexHtml, new RegExp(`id="app-version"[^>]*>v${deployedVersion}</output>`));
    assert.match(indexHtml, /<script type="module" src="\.\/src\/main\.js"><\/script>/);
    assert.doesNotMatch(indexHtml, /main\.js\?v=/, "modules must not use a partial manual cache version");
}
