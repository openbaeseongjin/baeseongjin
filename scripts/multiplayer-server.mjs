import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";
import { createStaticRequestHandler } from "./staticHandler.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const positionalPort = process.argv.find((argument) => /^\d+$/.test(argument));
const namedPort = process.argv.find((argument) => argument.startsWith("--port="))?.slice(7);
const requestedPort = Number(namedPort ?? positionalPort ?? process.env.BAESEONGJIN_PORT ?? 4173);
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4173;
const server = createServer(createStaticRequestHandler(root));
const multiplayer = new MultiplayerGameServer(server);

server.listen(port, "127.0.0.1", () => {
    console.log(`Baeseongjin multiplayer: http://127.0.0.1:${port}`);
});

async function shutdown() {
    await multiplayer.close();
    server.close();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
