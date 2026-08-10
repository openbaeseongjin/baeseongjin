const FIXED_DT = 1 / 120;

function length(vector) {
    return Math.hypot(vector.x, vector.y);
}

function advanceProjectile(projectile, dt, state) {
    if (projectile.objectType === "player-projectile") {
        const target = state?.enemies?.find(({ id }) => id === projectile.targetId);
        if (target) {
            const dx = target.position.x - projectile.position.x;
            const dy = target.position.y - projectile.position.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0) {
                projectile.velocity.x = (dx / distance) * projectile.speed;
                projectile.velocity.y = (dy / distance) * projectile.speed;
            }
        }
    }
    projectile.position.x += projectile.velocity.x * dt;
    projectile.position.y += projectile.velocity.y * dt;
}

export class PredictableProjectileStore {
    constructor({ fixedDt = FIXED_DT } = {}) {
        this.fixedDt = fixedDt;
        this.objects = new Map();
    }

    apply(events, serverTick, state) {
        for (const event of events) {
            if (event.protocolVersion !== 1) continue;
            if (event.eventType === "resolve") {
                this.objects.delete(event.objectId);
                continue;
            }
            if (event.eventType !== "spawn") continue;
            const projectile = {
                id: event.objectId,
                objectType: event.objectType,
                ownerId: event.parameters.ownerId,
                targetId: event.parameters.targetId,
                radius: event.parameters.radius,
                damage: event.parameters.damage,
                position: { ...event.position },
                velocity: { ...event.velocity },
                speed: event.parameters.speed ?? length(event.velocity)
            };
            const delayedTicks = Math.max(0, serverTick - event.tick);
            for (let tick = 0; tick < delayedTicks; tick += 1) advanceProjectile(projectile, this.fixedDt, state);
            this.objects.set(projectile.id, projectile);
        }
    }

    update(dt, state) {
        for (const projectile of this.objects.values()) advanceProjectile(projectile, dt, state);
    }

    snapshot() {
        const projectiles = [];
        const enemyProjectiles = [];
        for (const projectile of this.objects.values()) {
            const target = projectile.objectType === "enemy-projectile" ? enemyProjectiles : projectiles;
            target.push({ ...projectile, position: { ...projectile.position }, velocity: { ...projectile.velocity } });
        }
        return { projectiles, enemyProjectiles };
    }
}
