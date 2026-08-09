import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const positionalPort = process.argv.find((argument) => /^\d+$/.test(argument));
const namedPort = process.argv.find((argument) => argument.startsWith("--port="))?.slice(7);
const requestedPort = Number(namedPort ?? positionalPort ?? process.env.BAESEONGJIN_PORT ?? 4173);
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4173;
const mime = new Map([
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".mjs", "text/javascript; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".svg", "image/svg+xml"]
]);

createServer(async (request, response) => {
    if (!new Set(["GET", "HEAD"]).has(request.method ?? "")) {
        response.writeHead(405, { allow: "GET, HEAD" }).end("Method not allowed");
        return;
    }
    try {
        const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
        const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
        const filePath = resolve(root, relativePath);
        if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
            response.writeHead(403).end("Forbidden");
            return;
        }
        const fileStat = await stat(filePath);
        if (!fileStat.isFile()) throw new Error("Not a file");
        response.writeHead(200, { "content-type": mime.get(extname(filePath)) ?? "application/octet-stream" });
        if (request.method === "HEAD") response.end();
        else response.end(await readFile(filePath));
    } catch {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
    }
}).listen(port, "127.0.0.1", () => {
    console.log(`Baeseongjin prototype: http://127.0.0.1:${port}`);
});
