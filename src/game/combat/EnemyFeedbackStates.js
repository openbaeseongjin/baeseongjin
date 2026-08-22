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

class SwarmOrbitEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.SWARM_ORBIT);
    }
}

class SwarmDiveEnemyFeedbackState extends EnemyFeedbackState {
    constructor() {
        super(ENEMY_FEEDBACK.SWARM_DIVE);
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
        new SwarmOrbitEnemyFeedbackState(),
        new SwarmDiveEnemyFeedbackState(),
        new PursuitWindupEnemyFeedbackState(),
        new PursuitDashEnemyFeedbackState(),
        new ArtilleryTelegraphEnemyFeedbackState()
    ]);
}
