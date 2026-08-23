export const ENEMY_BEHAVIOR_KIND = Object.freeze({
    PURSUIT: "pursuit",
    SHIELD: "shield",
    ARTILLERY: "artillery",
    JAMMER: "jammer",
    SUPPORT: "support",
    SWARM: "swarm"
});

export const PURSUIT_BEHAVIOR_STATE = Object.freeze({
    SEEK: "seek",
    WINDUP: "windup",
    DASH: "dash",
    RECOVER: "recover"
});
export const SHIELD_BEHAVIOR_STATE = Object.freeze({ GUARD: "guard" });
export const ARTILLERY_BEHAVIOR_STATE = Object.freeze({ IDLE: "idle", TELEGRAPH: "telegraph", COOLDOWN: "cooldown" });
export const JAMMER_BEHAVIOR_STATE = Object.freeze({ ROAM: "roam" });
export const SUPPORT_BEHAVIOR_STATE = Object.freeze({ IDLE: "idle", LINK: "link" });
export const SWARM_BEHAVIOR_STATE = Object.freeze({ CHASE: "chase", RECOIL: "recoil" });

export const ENEMY_BEHAVIOR_EVENT_TYPE = Object.freeze({
    PURSUIT_WINDUP: "pursuit-windup",
    PURSUIT_DASH_STARTED: "pursuit-dash-started",
    PURSUIT_RECOVERY_STARTED: "pursuit-recovery-started",
    ARTILLERY_TELEGRAPH: "artillery-telegraph",
    ARTILLERY_STRIKE: "artillery-strike",
    SUPPORT_LINK: "support-link",
    SUPPORT_LINK_ENDED: "support-link-ended",
    SWARM_CONTACT: "swarm-contact",
    SWARM_RECOIL_ENDED: "swarm-recoil-ended"
});

export const ENEMY_BEHAVIOR_REPLICATION_EVENT_TYPE = Object.freeze({ PLAYER_HIT: "enemy-behavior-player-hit" });

export const ENEMY_BEHAVIOR_CONFIG = Object.freeze({ ZERO: 0, UNIT: 1, MAXIMUM_TRANSITIONS_PER_STEP: 8 });
