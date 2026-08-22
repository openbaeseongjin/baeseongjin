import { ENEMY_FEEDBACK } from "./EnemyFeedbackDefinition.js";
import { EnemyFeedbackState } from "./EnemyFeedbackState.js";

class TrackEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.TRACK);
    }
}

class LockEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.LOCK);
    }
}

class ShieldGuardEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.SHIELD_GUARD);
    }
}

class SupportLinkEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.SUPPORT_LINK);
    }
}

class SwarmChaseEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.SWARM_CHASE);
    }
}

class SwarmRecoilEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.SWARM_RECOIL);
    }
}

class PursuitWindupEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.PURSUIT_WINDUP);
    }
}

class PursuitDashEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.PURSUIT_DASH);
    }
}

class ArtilleryTelegraphEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.ARTILLERY_TELEGRAPH);
    }
}

export function createEnemyFeedbackStates() {
    return Object.freeze([
        new TrackEnemyFeedbackState(),
        new LockEnemyFeedbackState(),
        new ShieldGuardEnemyFeedbackState(),
        new SupportLinkEnemyFeedbackState(),
        new SwarmChaseEnemyFeedbackState(),
        new SwarmRecoilEnemyFeedbackState(),
        new PursuitWindupEnemyFeedbackState(),
        new PursuitDashEnemyFeedbackState(),
        new ArtilleryTelegraphEnemyFeedbackState()
    ]);
}
