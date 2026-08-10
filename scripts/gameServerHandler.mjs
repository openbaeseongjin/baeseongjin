const JSON_HEADERS = {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8"
};

export function createGameServerRequestHandler() {
    return (request, response) => {
        const method = request.method ?? "";
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

        if (pathname === "/health" && (method === "GET" || method === "HEAD")) {
            response.writeHead(200, JSON_HEADERS);
            response.end(method === "HEAD" ? undefined : JSON.stringify({ status: "ok" }));
            return;
        }

        response.writeHead(404, {
            "cache-control": "no-store",
            "content-type": "text/plain; charset=utf-8"
        });
        response.end("Not found");
    };
}
