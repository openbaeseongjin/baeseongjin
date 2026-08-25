import { PLAYER_IMPACT_TYPE } from "../network/PlayerImpactClaim.js";

export class RunMetrics {
    constructor({ progressKind = "area" } = {}) {
        this.progressKind = progressKind;
        this.activeSeconds = 0;
        this.checkpointsReached = 0;
        this.enemyDefeats = 0;
        this.damageTaken = 0;
        this.ropeCuts = 0;
        this.defeats = 0;
        this.firstAugmentSeconds = null;
        this.currentProgressId = null;
        this.progressActiveSeconds = new Map();
        this.progressClearSeconds = new Map();
    }

    recordActiveTime(dt) {
        this.activeSeconds += dt;
    }

    recordCheckpoint() {
        this.checkpointsReached += 1;
    }

    recordProgressTime(progressId, dt) {
        if (typeof progressId !== "string" || !Number.isFinite(dt) || dt < 0) return;
        this.currentProgressId = progressId;
        this.progressActiveSeconds.set(progressId, (this.progressActiveSeconds.get(progressId) ?? 0) + dt);
    }

    recordProgressClear(progressId) {
        if (typeof progressId !== "string" || this.progressClearSeconds.has(progressId)) return;
        this.progressClearSeconds.set(progressId, this.progressActiveSeconds.get(progressId) ?? 0);
    }

    recordAreaTime(areaId, dt) {
        this.recordProgressTime(areaId, dt);
    }

    recordAreaClear(areaId) {
        this.recordProgressClear(areaId);
    }

    recordFirstAugment() {
        if (this.firstAugmentSeconds === null) this.firstAugmentSeconds = this.activeSeconds;
    }

    recordPlayerImpact(impactType, damage = 0) {
        if ([PLAYER_IMPACT_TYPE.PLAYER_HIT, PLAYER_IMPACT_TYPE.PLATFORM_COLLISION_DAMAGE].includes(impactType))
            this.damageTaken += damage;
        if ([PLAYER_IMPACT_TYPE.ROPE_CUT, PLAYER_IMPACT_TYPE.JAMMER_SHOCK].includes(impactType)) this.ropeCuts += 1;
    }

    recordDefeat() {
        this.defeats += 1;
    }

    snapshot() {
        const currentProgressSeconds = this.currentProgressId
            ? (this.progressActiveSeconds.get(this.currentProgressId) ?? 0)
            : 0;
        const progressTiming = Object.freeze({
            currentProgressId: this.currentProgressId,
            currentProgressSeconds,
            clearSeconds: Object.freeze(Object.fromEntries(this.progressClearSeconds))
        });
        const snapshot = {
            activeSeconds: this.activeSeconds,
            checkpointsReached: this.checkpointsReached,
            enemyDefeats: this.enemyDefeats,
            damageTaken: this.damageTaken,
            ropeCuts: this.ropeCuts,
            defeats: this.defeats,
            firstAugmentSeconds: this.firstAugmentSeconds,
            progressKind: this.progressKind,
            progressTiming
        };
        if (this.progressKind === "sector") {
            snapshot.landmarkTiming = Object.freeze({
                currentLandmarkId: this.currentProgressId,
                currentLandmarkSeconds: currentProgressSeconds,
                clearSeconds: progressTiming.clearSeconds
            });
        } else {
            snapshot.areaTiming = Object.freeze({
                currentAreaId: this.currentProgressId,
                currentAreaSeconds: currentProgressSeconds,
                clearSeconds: progressTiming.clearSeconds
            });
        }
        return Object.freeze(snapshot);
    }
}
