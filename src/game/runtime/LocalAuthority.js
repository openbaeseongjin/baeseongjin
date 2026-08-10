export class LocalAuthority {
    constructor(simulation) {
        this.simulation = simulation;
    }

    step(dt, command) {
        this.simulation.step(dt, command);
    }

    snapshot() {
        return this.simulation.snapshot();
    }

    drainEvents() {
        return this.simulation.drainReplicationEvents();
    }
}
