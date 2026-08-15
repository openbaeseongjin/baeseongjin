export class RunMetrics {
    constructor() {
        this.activeSeconds = 0;
        this.checkpointsReached = 0;
        this.enemyDefeats = 0;
        this.damageTaken = 0;
        this.ropeCuts = 0;
        this.defeats = 0;
        this.firstFoundationSeconds = null;
        this.currentAreaId = null;
        this.areaActiveSeconds = new Map();
        this.areaClearSeconds = new Map();
    }

    recordActiveTime(dt) {
        this.activeSeconds += dt;
    }

    recordCheckpoint() {
        this.checkpointsReached += 1;
    }

    recordAreaTime(areaId, dt) {
        if (typeof areaId !== "string" || !Number.isFinite(dt) || dt < 0) return;
        this.currentAreaId = areaId;
        this.areaActiveSeconds.set(areaId, (this.areaActiveSeconds.get(areaId) ?? 0) + dt);
    }

    recordAreaClear(areaId) {
        if (typeof areaId !== "string" || this.areaClearSeconds.has(areaId)) return;
        this.areaClearSeconds.set(areaId, this.areaActiveSeconds.get(areaId) ?? 0);
    }

    recordFirstFoundation() {
        if (this.firstFoundationSeconds === null) this.firstFoundationSeconds = this.activeSeconds;
    }

    recordEnemyOutcomes(playerEvents) {
        this.enemyDefeats += playerEvents.hits.filter((event) => event.type === "enemy-defeated").length;
    }

    recordPlayerImpact(impactType, damage = 0) {
        if (impactType === "player-hit") this.damageTaken += damage;
        if (impactType === "rope-cut") this.ropeCuts += 1;
    }

    recordDefeat() {
        this.defeats += 1;
    }

    snapshot() {
        const currentAreaSeconds = this.currentAreaId ? (this.areaActiveSeconds.get(this.currentAreaId) ?? 0) : 0;
        return Object.freeze({
            activeSeconds: this.activeSeconds,
            checkpointsReached: this.checkpointsReached,
            enemyDefeats: this.enemyDefeats,
            damageTaken: this.damageTaken,
            ropeCuts: this.ropeCuts,
            defeats: this.defeats,
            firstFoundationSeconds: this.firstFoundationSeconds,
            areaTiming: Object.freeze({
                currentAreaId: this.currentAreaId,
                currentAreaSeconds,
                clearSeconds: Object.freeze(Object.fromEntries(this.areaClearSeconds))
            })
        });
    }
}
