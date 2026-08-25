import { ENEMY_TYPE } from "../EnemyType.js";
import { compositeWorldPoint, freezeComposite } from "./CompositeBossEncounterRuntime.js";

export const BOSS_ENEMY_SUMMON_EVENT = Object.freeze({
    ENEMY_SUMMONED: "boss-enemy-summoned"
});

export const BOSS_ENEMY_SUMMON_DEFAULT = Object.freeze({
    count: 2,
    cooldownSeconds: 15,
    skipAliveCount: 6,
    telegraphSeconds: 1,
    recoverySeconds: 0.9,
    warningSize: 110,
    enemyTypes: Object.freeze([
        ENEMY_TYPE.PATROL_DRONE_T1,
        ENEMY_TYPE.PURSUIT_DRONE_T1,
        ENEMY_TYPE.SHIELD_DRONE_T1,
        ENEMY_TYPE.ARTILLERY_DRONE_T1
    ])
});

export const BOSS_SUMMONED_ENEMY_ID = Object.freeze({
    prefix: (bossStageId) => `${bossStageId}:summoned-enemy:`,
    create: (bossStageId, attempt, sequence, index) =>
        `${BOSS_SUMMONED_ENEMY_ID.prefix(bossStageId)}${attempt}:${sequence}:${index}`,
    belongsTo: (bossStageId, enemyId) =>
        typeof enemyId === "string" && enemyId.startsWith(BOSS_SUMMONED_ENEMY_ID.prefix(bossStageId)),
    warning: (bossStageId, index) => `${bossStageId}:summon-warning:${index}`
});

function positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function positiveInteger(value, fallback) {
    return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function point(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} requires finite x and y`);
    }
    return freezeComposite({ x: value.x, y: value.y });
}

export class BossEnemySummonPattern {
    constructor({
        bossStageId,
        spawnPoints,
        count = BOSS_ENEMY_SUMMON_DEFAULT.count,
        cooldownSeconds = BOSS_ENEMY_SUMMON_DEFAULT.cooldownSeconds,
        skipAliveCount = BOSS_ENEMY_SUMMON_DEFAULT.skipAliveCount,
        telegraphSeconds = BOSS_ENEMY_SUMMON_DEFAULT.telegraphSeconds,
        recoverySeconds = BOSS_ENEMY_SUMMON_DEFAULT.recoverySeconds,
        warningSize = BOSS_ENEMY_SUMMON_DEFAULT.warningSize,
        enemyTypes = BOSS_ENEMY_SUMMON_DEFAULT.enemyTypes
    }) {
        if (typeof bossStageId !== "string" || bossStageId.length === 0) {
            throw new Error("BossEnemySummonPattern requires bossStageId");
        }
        if (!Array.isArray(spawnPoints) || spawnPoints.length === 0) {
            throw new Error("BossEnemySummonPattern requires spawnPoints");
        }
        if (!Array.isArray(enemyTypes) || enemyTypes.length === 0) {
            throw new Error("BossEnemySummonPattern requires enemyTypes");
        }
        this.definition = freezeComposite({
            bossStageId,
            spawnPoints: spawnPoints.map((entry, index) => point(entry, `Boss summon point ${index}`)),
            count: positiveInteger(count, BOSS_ENEMY_SUMMON_DEFAULT.count),
            cooldownSeconds: positive(cooldownSeconds, BOSS_ENEMY_SUMMON_DEFAULT.cooldownSeconds),
            skipAliveCount: positiveInteger(skipAliveCount, BOSS_ENEMY_SUMMON_DEFAULT.skipAliveCount),
            telegraphSeconds: positive(telegraphSeconds, BOSS_ENEMY_SUMMON_DEFAULT.telegraphSeconds),
            recoverySeconds: positive(recoverySeconds, BOSS_ENEMY_SUMMON_DEFAULT.recoverySeconds),
            warningSize: positive(warningSize, BOSS_ENEMY_SUMMON_DEFAULT.warningSize),
            enemyTypes: [...enemyTypes]
        });
        this.reset();
    }

    get count() {
        return this.definition.count;
    }

    get telegraphSeconds() {
        return this.definition.telegraphSeconds;
    }

    get recoverySeconds() {
        return this.definition.recoverySeconds;
    }

    reset() {
        this.sequence = 0;
        this.cooldownRemaining = 0;
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt <= 0) return this.cooldownRemaining;
        this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
        return this.cooldownRemaining;
    }

    canSummon(aliveCount = 0) {
        const count = Number.isSafeInteger(aliveCount) && aliveCount >= 0 ? aliveCount : 0;
        return this.cooldownRemaining <= 0 && count < this.definition.skipAliveCount;
    }

    summon({ attempt, worldOffset = { x: 0, y: 0 } }) {
        this.sequence += 1;
        this.cooldownRemaining = this.definition.cooldownSeconds;
        const requests = [];
        for (let index = 0; index < this.definition.count; index += 1) {
            const poolIndex = ((this.sequence - 1) * this.definition.count + index) % this.definition.enemyTypes.length;
            requests.push(
                freezeComposite({
                    bossStageId: this.definition.bossStageId,
                    enemyId: BOSS_SUMMONED_ENEMY_ID.create(this.definition.bossStageId, attempt, this.sequence, index),
                    enemyType: this.definition.enemyTypes[poolIndex],
                    position: compositeWorldPoint(
                        this.definition.spawnPoints[index % this.definition.spawnPoints.length],
                        worldOffset
                    ),
                    summonSequence: this.sequence,
                    summonIndex: index
                })
            );
        }
        return freezeComposite({ sequence: this.sequence, requests });
    }

    presentationWarnings({ kind, variant, state, worldOffset = { x: 0, y: 0 }, cameraPriority = null }) {
        return Object.freeze(
            this.definition.spawnPoints.map((spawnPoint, index) =>
                freezeComposite({
                    id: BOSS_SUMMONED_ENEMY_ID.warning(this.definition.bossStageId, index),
                    kind,
                    variant,
                    position: compositeWorldPoint(spawnPoint, worldOffset),
                    size: { width: this.definition.warningSize, height: this.definition.warningSize },
                    state,
                    damaging: false,
                    active: true,
                    ...(cameraPriority === null ? {} : { cameraPriority })
                })
            )
        );
    }

    snapshot() {
        return freezeComposite({ sequence: this.sequence, cooldownRemaining: this.cooldownRemaining });
    }

    restore(snapshot = null) {
        this.sequence = Number.isSafeInteger(snapshot?.sequence) && snapshot.sequence >= 0 ? snapshot.sequence : 0;
        this.cooldownRemaining =
            Number.isFinite(snapshot?.cooldownRemaining) && snapshot.cooldownRemaining >= 0
                ? snapshot.cooldownRemaining
                : 0;
        return this;
    }
}
