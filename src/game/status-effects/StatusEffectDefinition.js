export const STATUS_EFFECT_ID = Object.freeze({
    ELECTRIFIED: "electrified",
    IGNITED: "ignited",
    FROZEN: "frozen"
});

const FIRE_PALETTE = Object.freeze(["#fff4bd", "#ff983d", "#e83f18"]);
const ELECTRIC_PALETTE = Object.freeze(["#22d3ee", "#60a5fa", "#e0f2fe"]);
const FROST_PALETTE = Object.freeze(["#6f9fff", "#edf3ff"]);

export const STATUS_EFFECT_SPEC = Object.freeze({
    ELECTRIFIED: Object.freeze({
        id: STATUS_EFFECT_ID.ELECTRIFIED,
        durationSeconds: 0.5,
        pulseSeconds: 0.05,
        totalDamage: 25,
        particle: Object.freeze({
            palette: ELECTRIC_PALETTE,
            count: 4,
            size: 2,
            speed: 76,
            lifetime: 0.3,
            shape: "streak",
            motion: "orbit",
            glow: 0.18
        })
    }),
    IGNITED: Object.freeze({
        id: STATUS_EFFECT_ID.IGNITED,
        durationSeconds: 3,
        pulseSeconds: 0.5,
        totalDamage: 30,
        particle: Object.freeze({
            palette: FIRE_PALETTE,
            count: 6,
            size: 3,
            speed: 70,
            lifetime: 0.45,
            shape: "shard",
            motion: "drift",
            glow: 0.24,
            driftWidthRatio: 0.72,
            driftHeightRatio: 1.7
        })
    }),
    FROZEN: Object.freeze({
        id: STATUS_EFFECT_ID.FROZEN,
        durationSeconds: 1,
        particle: Object.freeze({
            palette: FROST_PALETTE,
            count: 7,
            size: 4.5,
            speed: 24,
            lifetime: 0.5,
            shape: "shard",
            motion: "orbit",
            glow: 0.16
        })
    })
});

export const STATUS_EFFECT_IDS = Object.freeze(Object.values(STATUS_EFFECT_ID));
