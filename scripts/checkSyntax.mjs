import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { existsSync } from "node:fs";

const roots = ["src", "scripts", "tests"];
const files = [];
function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) collect(path);
        else if ([".js", ".mjs"].includes(extname(path))) files.push(path);
    }
}
for (const root of roots) collect(root);
if (existsSync("sw.js")) files.push("sw.js");
for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Syntax check passed: ${files.length} files`);
