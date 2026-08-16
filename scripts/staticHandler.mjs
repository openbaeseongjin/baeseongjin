import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const MULTIPLAYER_META_PATTERN = /<meta\s+[^>]*name=["']multiplayer-server["'][^>]*>\s*/i;

const mime = new Map([
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".mjs", "text/javascript; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".webmanifest", "application/manifest+json; charset=utf-8"],
    [".svg", "image/svg+xml"],
    [".png", "image/png"],
    [".wav", "audio/wav"],
    [".ogg", "audio/ogg"],
    [".mp3", "audio/mpeg"],
    [".webm", "audio/webm"]
]);

function requestedRange(rangeHeader, size) {
    if (!rangeHeader) return null;
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (!match || (!match[1] && !match[2])) return false;
    let start;
    let end;
    if (!match[1]) {
        const suffixLength = Number(match[2]);
        if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return false;
        start = Math.max(0, size - suffixLength);
        end = size - 1;
    } else {
        start = Number(match[1]);
        end = match[2] ? Number(match[2]) : size - 1;
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
        return false;
    }
    return Object.freeze({ start, end: Math.min(end, size - 1) });
}

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
            // Dev pages must not advertise the production game server: the client falls back to
            // the serving origin and uses the integrated development WebSocket server instead.
            let content = null;
            if (relativePath === "index.html") {
                const html = await readFile(filePath, "utf8");
                content = Buffer.from(html.replace(MULTIPLAYER_META_PATTERN, ""), "utf8");
            }
            const fileStat = content ? null : await stat(filePath);
            if (fileStat && !fileStat.isFile()) throw new Error("Not a file");
            const size = content ? content.length : fileStat.size;
            const range = requestedRange(request.headers?.range, size);
            if (range === false) {
                response.writeHead(416, { "content-range": `bytes */${size}` }).end();
                return;
            }
            const start = range?.start ?? 0;
            const end = range?.end ?? size - 1;
            response.writeHead(range ? 206 : 200, {
                "accept-ranges": "bytes",
                "cache-control": "no-store",
                "content-length": end - start + 1,
                "content-type": mime.get(extname(filePath)) ?? "application/octet-stream",
                ...(range ? { "content-range": `bytes ${start}-${end}/${size}` } : {})
            });
            if (request.method === "HEAD" || size === 0) response.end();
            else if (content) response.end(content.subarray(start, end + 1));
            else createReadStream(filePath, { start, end }).pipe(response);
        } catch {
            response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
        }
    };
}
