import { GameObject, requireObjectId } from "./GameObject.js";

export class SimulationDrivenObject extends GameObject {
    #simulationCapabilities = new Map();

    get driveKind() {
        return "simulation";
    }

    registerSimulationCapability({ id, order = 0, apply }) {
        requireObjectId(id, "simulation capability id");
        if (!Number.isFinite(order)) throw new Error("simulation capability order must be finite");
        if (typeof apply !== "function") throw new Error("simulation capability apply must be a function");
        if (this.#simulationCapabilities.has(id)) throw new Error(`duplicate simulation capability: ${id}`);
        this.#simulationCapabilities.set(id, Object.freeze({ id, order, apply }));
    }

    hasSimulationCapability(id) {
        return this.#simulationCapabilities.has(id);
    }

    simulationCapabilities() {
        return Object.freeze([...this.#simulationCapabilities.values()]);
    }
}
