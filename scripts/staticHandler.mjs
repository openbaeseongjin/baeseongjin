import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const mime = new Map([
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".mjs", "text/javascript; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".webmanifest", "application/manifest+json; charset=utf-8"],
    [".svg", "image/svg+xml"],
    [".png", "image/png"]
]);

export function createStaticRequestHandler(root) {
    const resolvedRoot = resolve(root);
    return async (request, response) => {
        if (!new Set(["GET", "HEAD"]).has(request.method ?? "")) {
            response.writeHead(405, { allow: "GET, HEAD" }).end("Method not allowed");
            return;
        }
        try {
            const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
            const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
            const filePath = resolve(resolvedRoot, relativePath);
            if (filePath !== resolvedRoot && !filePath.startsWith(`${resolvedRoot}${sep}`)) {
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
    };
}
