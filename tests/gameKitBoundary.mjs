import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

export function run() {
    const files = [];
    const collect = (directory) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) collect(path);
            else if (extname(path) === ".js") files.push(path);
        }
    };
    collect("src/game-kit");
    assert.ok(files.length > 0);
    for (const file of files) {
        const source = readFileSync(file, "utf8");
        assert.equal(source.includes("Math.random"), false, `${file} must stay deterministic`);
        for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
            assert.ok(match[1].startsWith("."), `${file} may only use local imports`);
            assert.equal(match[1].includes("../game/"), false, `${file} must not import game rules`);
        }
    }
}
