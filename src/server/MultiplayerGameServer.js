import { WebSocket, WebSocketServer } from "ws";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { AuthorityServerSession } from "../game/runtime/AuthorityServerSession.js";
import { AuthorityWireAdapter } from "../game/runtime/AuthorityWireAdapter.js";
import { GameSimulation } from "../game/simulation/GameSimulation.js";

export class MultiplayerGameServer {
    constructor(httpServer, { path = "/multiplayer", maxPlayers = 2 } = {}) {
        if (!httpServer) throw new Error("httpServer is required");
        this.httpServer = httpServer;
        this.path = path;
        this.maxPlayers = maxPlayers;
        this.webSocketServer = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
        this.connections = new Map();
        this.interval = null;
        this.stopped = false;
        this.generation = 0;
        this.handleUpgrade = (request, socket, head) => {
            if (new URL(request.url ?? "/", "http://localhost").pathname !== this.path) return;
            this.webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
                this.webSocketServer.emit("connection", webSocket, request);
            });
        };
        this.httpServer.on("upgrade", this.handleUpgrade);
        this.webSocketServer.on("connection", (socket) => this.accept(socket));
        this.createRoom();
    }

    createRoom() {
        this.generation += 1;
        this.simulation = new GameSimulation();
        this.session = new AuthorityServerSession({ simulation: this.simulation });
        this.adapter = new AuthorityWireAdapter(this.session);
        this.runner = new FixedStepRunner({
            step: () => {
                const snapshot = this.adapter.advance();
                if (snapshot) this.broadcast({ type: "snapshot", payload: snapshot });
            },
            render: () => {}
        });
    }

    accept(socket) {
        if (this.connections.size >= this.maxPlayers) {
            socket.send(JSON.stringify({ type: "error", code: "room-full" }));
            socket.close(1013, "room full");
            return;
        }
        const player =
            this.connections.size === 0
                ? this.simulation.playerEntity
                : this.simulation.addPlayer({ x: 160 + this.connections.size * 40, y: 500 }).entity;
        const generation = this.generation;
        this.connections.set(socket, player.id);
        socket.on("message", (data, binary) => this.receive(socket, data, binary));
        socket.on("close", () => this.leave(socket, generation));
        socket.on("error", () => this.leave(socket, generation));
        socket.send(
            JSON.stringify({
                type: "welcome",
                playerId: player.id,
                snapshot: this.adapter.snapshot()
            })
        );
        this.broadcast({ type: "snapshot", payload: this.adapter.snapshot() });
        this.startClock();
    }

    receive(socket, data, binary) {
        try {
            if (binary) throw new Error("binary messages are unsupported");
            const message = JSON.parse(data.toString());
            if (message?.type !== "command" || typeof message.payload !== "string") {
                throw new Error("unsupported client message");
            }
            const receipt = this.adapter.receiveCommand(this.connections.get(socket), message.payload);
            socket.send(JSON.stringify({ type: "receipt", payload: receipt }));
        } catch (error) {
            socket.send(JSON.stringify({ type: "error", code: "invalid-message", message: error.message }));
            socket.close(1008, "invalid message");
        }
    }

    startClock() {
        if (this.interval !== null) return;
        this.runner.reset(performance.now());
        this.interval = setInterval(() => this.runner.frame(performance.now()), 4);
    }

    stopClock() {
        if (this.interval !== null) clearInterval(this.interval);
        this.interval = null;
    }

    broadcast(message) {
        const serialized = JSON.stringify(message);
        for (const socket of this.connections.keys()) {
            if (socket.readyState === WebSocket.OPEN) socket.send(serialized);
        }
    }

    leave(socket, generation) {
        if (this.stopped || generation !== this.generation) return;
        const playerId = this.connections.get(socket);
        if (!playerId) return;
        this.connections.delete(socket);
        this.session.removePlayer(playerId);
        if (this.connections.size > 0) {
            this.broadcast({ type: "player-left", playerId });
            this.broadcast({ type: "snapshot", payload: this.adapter.snapshot() });
            return;
        }
        this.stopClock();
        this.createRoom();
    }

    async close() {
        this.stopped = true;
        this.generation += 1;
        this.stopClock();
        this.httpServer.off("upgrade", this.handleUpgrade);
        for (const socket of this.connections.keys()) socket.close(1001, "server shutdown");
        this.connections.clear();
        await new Promise((resolve) => this.webSocketServer.close(resolve));
    }
}
