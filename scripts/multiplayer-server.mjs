import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";
import { createGameServerRequestHandler } from "./gameServerHandler.mjs";
import { createStaticRequestHandler } from "./staticHandler.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const positionalPort = process.argv.find((argument) => /^\d+$/.test(argument));
const namedPort = process.argv.find((argument) => argument.startsWith("--port="))?.slice(7);
const requestedPort = Number(namedPort ?? positionalPort ?? process.env.BAESEONGJIN_PORT ?? 4173);
const port = Number.isInteger(requestedPort) && requestedPort >= 0 ? requestedPort : 4173;
const namedHost = process.argv.find((argument) => argument.startsWith("--host="))?.slice(7);
const host = namedHost ?? process.env.BAESEONGJIN_HOST ?? "127.0.0.1";
const gameOnly = process.argv.includes("--game-only") || process.env.BAESEONGJIN_GAME_ONLY === "1";
const allowedOriginsArgument = process.argv
    .find((argument) => argument.startsWith("--allowed-origins="))
    ?.slice("--allowed-origins=".length);
const requestHandler = gameOnly ? createGameServerRequestHandler() : createStaticRequestHandler(root);
const server = createServer(requestHandler);
const multiplayer = new MultiplayerGameServer(server, {
    allowedOrigins: (allowedOriginsArgument ?? process.env.BAESEONGJIN_ALLOWED_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
});

server.listen(port, host, () => {
    const address = server.address();
    const boundPort = typeof address === "object" && address ? address.port : port;
    console.log(`Baeseongjin multiplayer (${gameOnly ? "game-only" : "development"}): http://${host}:${boundPort}`);
});

let shutdownPromise;
async function shutdown() {
    shutdownPromise ??= (async () => {
        await multiplayer.close();
        if (!server.listening) return;
        await new Promise((resolveClose, rejectClose) => {
            server.close((error) => (error ? rejectClose(error) : resolveClose()));
        });
    })();
    return shutdownPromise;
}

function handleSignal() {
    shutdown().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

process.once("SIGINT", handleSignal);
process.once("SIGTERM", handleSignal);
