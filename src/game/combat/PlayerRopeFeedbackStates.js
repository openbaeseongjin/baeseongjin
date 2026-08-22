import { PLAYER_FEEDBACK_RULE, ROPE_FEEDBACK_RULE } from "./PlayerRopeFeedbackDefinition.js";
import { PlayerRopeFeedbackRule } from "./PlayerRopeFeedbackRule.js";

class RopeLaunchFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(ROPE_FEEDBACK_RULE.LAUNCH);
    }
}

class RopeFlightFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(ROPE_FEEDBACK_RULE.FLIGHT);
    }
}

class RopeAttachFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(ROPE_FEEDBACK_RULE.ATTACH);
    }
}

class RopeDissipateFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(ROPE_FEEDBACK_RULE.DISSIPATE);
    }
}

class RopeReleaseFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(ROPE_FEEDBACK_RULE.RELEASE);
    }
}

class RopeLinkFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(ROPE_FEEDBACK_RULE.LINK);
    }
}

class PlayerSwingFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(PLAYER_FEEDBACK_RULE.SWING);
    }
}

class RopeTensionFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(ROPE_FEEDBACK_RULE.TENSION);
    }
}

class PlayerMotionFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(PLAYER_FEEDBACK_RULE.MOTION);
    }
}

class PlayerAccelerationFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(PLAYER_FEEDBACK_RULE.ACCELERATION);
    }
}

class PlayerActiveActionFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(PLAYER_FEEDBACK_RULE.ACTIVE_ACTION);
    }
}

class PlayerRemoteActionFeedbackState extends PlayerRopeFeedbackRule {
    constructor() {
        super(PLAYER_FEEDBACK_RULE.REMOTE_ACTION);
    }
}

export function createRopeFeedbackStates() {
    return Object.freeze([
        new RopeLaunchFeedbackState(),
        new RopeFlightFeedbackState(),
        new RopeAttachFeedbackState(),
        new RopeDissipateFeedbackState(),
        new RopeReleaseFeedbackState(),
        new RopeLinkFeedbackState(),
        new RopeTensionFeedbackState()
    ]);
}

export function createPlayerFeedbackStates() {
    return Object.freeze([
        new PlayerSwingFeedbackState(),
        new PlayerMotionFeedbackState(),
        new PlayerAccelerationFeedbackState(),
        new PlayerActiveActionFeedbackState(),
        new PlayerRemoteActionFeedbackState()
    ]);
}
