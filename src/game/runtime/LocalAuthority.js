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

    drainEvents() {
        return this.simulation.drainReplicationEvents();
    }
}
