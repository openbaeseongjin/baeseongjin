// REFERENCE ONLY
// Existing BOSS_01_DEFINITION values stay authoritative.
// Add fields similar to this rather than replacing Runtime structure.

const REV2_1_EXTENSION = {
    arenaId: "boss-01:maintenance-lockdown",
    phaseTargets: [
        {
            phase: 1,
            id: "boss-01:target:clamp-drive",
            kind: "clamp-drive",
            assembly: { x: 430, y: -520, radius: 64 },
            weakPoint: { x: 452, y: -507, radius: 24, damageMultiplier: 1.5 }
        },
        {
            phase: 2,
            id: "boss-01:target:vent-bearing",
            kind: "vent-bearing",
            assembly: { x: -120, y: -1080, radius: 64 },
            weakPoint: { x: -142, y: -1100, radius: 22, damageMultiplier: 1.5 }
        },
        {
            phase: 3,
            id: "boss-01:target:gate-lock-pin",
            kind: "gate-lock-pin",
            assembly: { x: 80, y: -1500, radius: 64 },
            weakPoint: { x: 92, y: -1528, radius: 20, damageMultiplier: 1.5 }
        }
    ]
};

// Merge/freeze using repository conventions.
