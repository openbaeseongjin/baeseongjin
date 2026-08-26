export class LocalAuthority {
    constructor(simulation) {
        this.simulation = simulation;
        this.playerId = simulation.getPrimaryPlayerId();
    }

    step(dt, command) {
        this.simulation.step(dt, command);
    }

    snapshot() {
        return this.simulation.snapshot();
    }

    collisionDebugSnapshot() {
        return this.simulation.collisionDebugSnapshot();
    }

    applyFlightMotion(position) {
        this.simulation.applyOwnerMotion(this.playerId, {
            ...this.ownerState(),
            position,
            velocity: { x: 0, y: 0 },
            isGrounded: false
        });
    }

    ownerState() {
        return this.simulation.playerState(this.playerId);
    }

    submitImpactClaim(event) {
        return this.simulation.resolvePlayerImpactClaim(this.playerId, {
            impactId: event.projectileId,
            clientTick: event.clientTick,
            impactType: event.resolution,
            position: event.position,
            damage: event.parameters?.damage ?? 0,
            outcome: null
        });
    }

    applyDebugStartArea(areaId) {
        return this.simulation.debugTeleportPlayer(this.playerId, areaId);
    }

    spawnDebugTrainingDummy(options) {
        return this.simulation.spawnDebugTrainingDummy(options);
    }

    setDebugTrainingDummyPresentationControlled(controlled) {
        return this.simulation.setDebugTrainingDummyPresentationControlled(controlled);
    }

    debugTrainingDummySnapshot() {
        return this.simulation.debugTrainingDummySnapshot();
    }

    removeDebugTrainingDummy() {
        return this.simulation.removeDebugTrainingDummy();
    }

    drainEvents() {
        return this.simulation.drainReplicationEvents();
    }
}
