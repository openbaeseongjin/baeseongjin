import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createStaticRequestHandler } from "./staticHandler.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const positionalPort = process.argv.find((argument) => /^\d+$/.test(argument));
const namedPort = process.argv.find((argument) => argument.startsWith("--port="))?.slice(7);
const requestedPort = Number(namedPort ?? positionalPort ?? process.env.BAESEONGJIN_PORT ?? 4173);
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4173;
createServer(createStaticRequestHandler(root)).listen(port, "127.0.0.1", () => {
    console.log(`Baeseongjin prototype: http://127.0.0.1:${port}`);
});
