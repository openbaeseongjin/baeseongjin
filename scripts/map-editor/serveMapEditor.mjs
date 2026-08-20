import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMapEditorAuthoringServer } from "./MapEditorAuthoringServer.mjs";

const requestedPort = Number(process.argv.find((argument) => argument.startsWith("--port="))?.slice(7) ?? 4178);
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4178;
const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const authoringServer = await createMapEditorAuthoringServer({ projectRoot });

createServer(authoringServer.requestHandler).listen(port, "127.0.0.1", () => {
    console.log(`Map editor: http://127.0.0.1:${port}/map-editor/`);
});
