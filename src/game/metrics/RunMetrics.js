export class RunMetrics {
    constructor() {
        this.activeSeconds = 0;
        this.checkpointsReached = 0;
        this.enemyDefeats = 0;
        this.damageTaken = 0;
        this.ropeCuts = 0;
        this.defeats = 0;
        this.firstRewardSeconds = null;
    }

    recordActiveTime(dt) {
        this.activeSeconds += dt;
    }

    recordCheckpoint() {
        this.checkpointsReached += 1;
    }

    recordFirstReward() {
        if (this.firstRewardSeconds === null) this.firstRewardSeconds = this.activeSeconds;
    }

    recordCombat(playerEvents, enemyEvents) {
        this.enemyDefeats += playerEvents.hits.filter((event) => event.type === "enemy-defeated").length;
        this.damageTaken += enemyEvents.hits.reduce((total, event) => total + event.damage, 0);
        if (enemyEvents.ropeCutAt) this.ropeCuts += 1;
    }

    recordDefeat() {
        this.defeats += 1;
    }

    snapshot() {
        return Object.freeze({
            activeSeconds: this.activeSeconds,
            checkpointsReached: this.checkpointsReached,
            enemyDefeats: this.enemyDefeats,
            damageTaken: this.damageTaken,
            ropeCuts: this.ropeCuts,
            defeats: this.defeats,
            firstRewardSeconds: this.firstRewardSeconds
        });
    }
}
