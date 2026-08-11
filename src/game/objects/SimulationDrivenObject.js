import { GameObject } from "./GameObject.js";

export class SimulationDrivenObject extends GameObject {
    get driveKind() {
        return "simulation";
    }
}
