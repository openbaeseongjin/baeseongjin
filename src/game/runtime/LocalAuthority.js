import { createPlayerImpactClaim } from "../network/PlayerImpactClaim.js";

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
        const claim = createPlayerImpactClaim({
            projectileId: event.projectileId,
            clientTick: event.clientTick,
            impactType: event.resolution,
            position: event.position
        });
        return this.simulation.resolveEnemyProjectileClaim(this.playerId, claim);
    }

    drainEvents() {
        return this.simulation.drainReplicationEvents();
    }
}
