import {
    CONTINUITY_WARDEN_LOCOMOTION_STATE as LOCOMOTION,
    CONTINUITY_WARDEN_PATTERN as PATTERN,
    CONTINUITY_WARDEN_REACTION_STATE as REACTION,
    CONTINUITY_WARDEN_STATE as STATE
} from "./ContinuityWardenDefinition.js";
import {
    CONTINUITY_WARDEN_STATE_LANE as LANE,
    ContinuityWardenStateDefinition,
    defineContinuityWardenStateCatalog
} from "./ContinuityWardenStatePool.js";

class WardenStateDefinition extends ContinuityWardenStateDefinition {
    constructor({ id, lane, canEnter = () => false, weight, enter, advance, exit }) {
        super({ id, lane, canEnter, weight, enter, advance, exit });
    }
}

class GroundedStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: LOCOMOTION.GROUNDED,
            lane: LANE.LOCOMOTION,
            canEnter: ({ runtime, spatial }) => runtime.canGround(spatial),
            enter: ({ runtime, spatial }) => runtime.enterGrounded(spatial),
            advance: ({ runtime, dt, context, spatial }) => runtime.advanceGrounded(dt, context, spatial)
        });
    }
}

class WalkStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: LOCOMOTION.WALK,
            lane: LANE.LOCOMOTION,
            canEnter: ({ runtime, spatial, target }) => runtime.canWalk(spatial, target),
            enter: ({ runtime, spatial, target }) => runtime.enterWalk(spatial, target),
            advance: ({ runtime, dt, context, spatial, target }) => runtime.advanceWalk(dt, context, spatial, target)
        });
    }
}

class JumpStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: LOCOMOTION.JUMP,
            lane: LANE.LOCOMOTION,
            canEnter: ({ runtime, spatial, target }) => runtime.canJump(spatial, target),
            enter: ({ runtime, spatial, target }) => runtime.enterJump(spatial, target),
            advance: ({ runtime, dt, context }) => runtime.advanceJump(dt, context)
        });
    }
}

class DescendStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: LOCOMOTION.DESCEND,
            lane: LANE.LOCOMOTION,
            canEnter: ({ runtime, spatial, target }) => runtime.canDescend(spatial, target),
            enter: ({ runtime, spatial, target }) => runtime.enterDescend(spatial, target),
            advance: ({ runtime, dt, context, spatial, target }) => runtime.advanceDescend(dt, context, spatial, target)
        });
    }
}

class FallStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: LOCOMOTION.FALL,
            lane: LANE.LOCOMOTION,
            canEnter: ({ runtime, spatial }) => runtime.canFall(spatial),
            enter: ({ runtime, spatial }) => runtime.enterFall(spatial),
            advance: ({ runtime, dt, context }) => runtime.advanceFall(dt, context)
        });
    }
}

class LandingStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: LOCOMOTION.LANDING,
            lane: LANE.LOCOMOTION,
            canEnter: ({ runtime, spatial }) => runtime.canLand(spatial),
            enter: ({ runtime, spatial }) => runtime.enterLanding(spatial),
            advance: ({ runtime, dt, context }) => runtime.advanceLocomotionLanding(dt, context)
        });
    }
}

class AttackStateDefinition extends WardenStateDefinition {
    constructor({ id, canEnter, enter, advance }) {
        super({
            id,
            lane: LANE.ATTACK,
            canEnter,
            weight: ({ runtime }) => runtime.patternWeight(id),
            enter,
            advance
        });
    }
}

class BatonStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.BATON,
            canEnter: ({ runtime, target }) => runtime.canBaton(target),
            enter: ({ runtime, target }) => runtime._beginBaton(target)
        });
    }
}

class BackSwingStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.BACK_SWING,
            canEnter: ({ runtime, target }) => runtime.canBackSwing(target),
            enter: ({ runtime, target }) => runtime._beginBackSwing(target),
            advance: ({ runtime }) => runtime._advanceSingleAttack()
        });
    }
}

class GroundDashStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.GROUND_DASH,
            canEnter: ({ runtime, spatial }) => runtime.canGroundDash(spatial),
            enter: ({ runtime, target }) => runtime._beginGroundDash(target)
        });
    }
}

class DiagonalDashStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.DIAGONAL_DASH,
            canEnter: ({ runtime }) => runtime.canDiagonalDash(),
            enter: ({ runtime, target, spatial }) => runtime._beginDiagonalDash(target, spatial)
        });
    }
}

class ChargeStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.CHARGE,
            canEnter: ({ runtime, spatial }) => runtime.canCharge(spatial),
            enter: ({ runtime, target }) => runtime._beginCharge(target),
            advance: ({ runtime, dt }) => runtime._advanceCharge(dt)
        });
    }
}

class MissileStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.MISSILE,
            canEnter: ({ runtime }) => runtime.canMissile(),
            enter: ({ runtime, target, spatial }) => runtime._beginJumpMissile(target, spatial)
        });
    }
}

class SummonStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.SUMMON,
            canEnter: ({ runtime, context }) => runtime.canSummon(context),
            enter: ({ runtime, target }) => runtime._beginSummon(target),
            advance: ({ runtime, dt, context }) => runtime._advanceSummon(dt, context)
        });
    }
}

class GuardStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.GUARD,
            canEnter: ({ runtime }) => runtime.canGuard(),
            enter: ({ runtime, target }) => runtime._beginGuard(target),
            advance: ({ runtime }) => runtime._advanceGuard()
        });
    }
}

class CounterStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.COUNTER,
            canEnter: ({ runtime }) => runtime.canCounter(),
            enter: ({ runtime, target }) => runtime._beginCounter(target)
        });
    }
}

class SecurityStateDefinition extends AttackStateDefinition {
    constructor() {
        super({
            id: PATTERN.SECURITY,
            canEnter: ({ runtime }) => runtime.canSecurity(),
            enter: ({ runtime }) => runtime._beginSecurity()
        });
    }
}

class NeutralStateDefinition extends WardenStateDefinition {
    constructor() {
        super({ id: STATE.NEUTRAL, lane: LANE.ACTIVE });
    }
}

class BatonOneStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.BATON_1,
            lane: LANE.ACTIVE,
            advance: ({ runtime, dt, context }) => runtime.advanceBatonState(dt, context, STATE.BATON_2)
        });
    }
}

class BatonTwoStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.BATON_2,
            lane: LANE.ACTIVE,
            advance: ({ runtime, dt, context }) => runtime.advanceBatonState(dt, context, STATE.OVERHEAD_SLAM)
        });
    }
}

class OverheadSlamStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.OVERHEAD_SLAM,
            lane: LANE.ACTIVE,
            advance: ({ runtime, dt, context }) => runtime.advanceBatonState(dt, context)
        });
    }
}

class GroundDashActiveStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.GROUND_DASH,
            lane: LANE.ACTIVE,
            advance: ({ runtime, dt }) => runtime._advanceMotionAttack(dt)
        });
    }
}

class DiagonalDashActiveStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.DIAGONAL_DASH,
            lane: LANE.ACTIVE,
            advance: ({ runtime, dt }) => runtime._advanceMotionAttack(dt)
        });
    }
}

class MissileJumpStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.JUMP,
            lane: LANE.ACTIVE,
            advance: ({ runtime, dt, context }) => runtime._advanceJumpMissile(dt, context)
        });
    }
}

class AttackLandingStateDefinition extends WardenStateDefinition {
    constructor() {
        super({ id: STATE.LANDING, lane: LANE.ACTIVE, advance: ({ runtime }) => runtime._advanceLanding() });
    }
}

class CounterReadyStateDefinition extends WardenStateDefinition {
    constructor() {
        super({ id: STATE.COUNTER_READY, lane: LANE.ACTIVE, advance: ({ runtime }) => runtime._advanceCounter() });
    }
}

class CounterBashStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.COUNTER_BASH,
            lane: LANE.ACTIVE,
            advance: ({ runtime }) => runtime._advanceSingleAttack()
        });
    }
}

class SecurityCommandStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.SECURITY_COMMAND,
            lane: LANE.ACTIVE,
            advance: ({ runtime }) => runtime.advanceSecurityCommand()
        });
    }
}

class SecurityActiveStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: STATE.SECURITY_ACTIVE,
            lane: LANE.ACTIVE,
            advance: ({ runtime }) => runtime.advanceSecurityActive()
        });
    }
}

class DamagedStateDefinition extends WardenStateDefinition {
    constructor() {
        super({
            id: REACTION.DAMAGED,
            lane: LANE.REACTION,
            enter: ({ runtime }) => runtime.enterDamagedReaction(),
            advance: ({ runtime, dt }) => runtime.advanceDamagedReaction(dt)
        });
    }
}

class DefeatedStateDefinition extends WardenStateDefinition {
    constructor() {
        super({ id: STATE.DEFEATED, lane: LANE.TERMINAL });
    }
}

export function createContinuityWardenStateCatalog() {
    return defineContinuityWardenStateCatalog([
        new GroundedStateDefinition(),
        new WalkStateDefinition(),
        new JumpStateDefinition(),
        new DescendStateDefinition(),
        new FallStateDefinition(),
        new LandingStateDefinition(),
        new BatonStateDefinition(),
        new BackSwingStateDefinition(),
        new GroundDashStateDefinition(),
        new DiagonalDashStateDefinition(),
        new ChargeStateDefinition(),
        new MissileStateDefinition(),
        new SummonStateDefinition(),
        new GuardStateDefinition(),
        new CounterStateDefinition(),
        new SecurityStateDefinition(),
        new NeutralStateDefinition(),
        new BatonOneStateDefinition(),
        new BatonTwoStateDefinition(),
        new OverheadSlamStateDefinition(),
        new GroundDashActiveStateDefinition(),
        new DiagonalDashActiveStateDefinition(),
        new MissileJumpStateDefinition(),
        new AttackLandingStateDefinition(),
        new CounterReadyStateDefinition(),
        new CounterBashStateDefinition(),
        new SecurityCommandStateDefinition(),
        new SecurityActiveStateDefinition(),
        new DamagedStateDefinition(),
        new DefeatedStateDefinition()
    ]);
}

export const CONTINUITY_WARDEN_LOCOMOTION_PRIORITY = Object.freeze([
    LOCOMOTION.LANDING,
    LOCOMOTION.FALL,
    LOCOMOTION.DESCEND,
    LOCOMOTION.JUMP,
    LOCOMOTION.WALK,
    LOCOMOTION.GROUNDED
]);
