import { readFile, writeFile } from "node:fs/promises";

const argumentsAfterScript = process.argv.slice(2);
const outputIndex = argumentsAfterScript.indexOf("-o");
const schemaIndex = argumentsAfterScript.indexOf("--output-schema");

if (
    !argumentsAfterScript.includes("--ephemeral") ||
    !argumentsAfterScript.includes("--ignore-user-config") ||
    argumentsAfterScript[argumentsAfterScript.indexOf("-s") + 1] !== "read-only" ||
    outputIndex < 0 ||
    schemaIndex < 0 ||
    argumentsAfterScript.at(-1) !== "-"
) {
    throw new Error(`unsafe or incomplete arguments: ${argumentsAfterScript.join(" ")}`);
}

const prompt = await new Promise((resolvePromise) => {
    let value = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
        value += chunk;
    });
    process.stdin.on("end", () => resolvePromise(value));
});

if (!prompt.includes("meeting-to-game-plan") || !prompt.includes("untrusted-data")) {
    if (!prompt.includes("repo-task-plan") || !prompt.includes("untrusted-data")) {
        throw new Error("prompt did not preserve the selected skill and trust boundary");
    }
}

JSON.parse(await readFile(argumentsAfterScript[schemaIndex + 1], "utf8"));
await writeFile(
    argumentsAfterScript[outputIndex + 1],
    JSON.stringify({
        status: "completed",
        summary: "fixture result",
        proposedChanges: ["one change"],
        verification: ["one check"],
        risks: []
    }),
    "utf8"
);
