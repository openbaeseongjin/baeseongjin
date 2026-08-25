import { BOSS_STATE_LANE, BossStateDefinition, defineBossStateCatalog } from "./BossStatePool.js";
import { LOWER_SECTOR_COMMANDER_STATE as STATE } from "./LowerSectorCommanderDefinition.js";

class CommanderAttackState extends BossStateDefinition {
    constructor({ id, canEnter, enter, advance }) {
        super({ id, lane: BOSS_STATE_LANE.ATTACK, canEnter, enter, advance });
    }
}

class GrabState extends CommanderAttackState {
    constructor() {
        super({
            id: STATE.GRAB,
            canEnter: ({ runtime, target }) => runtime.canGrab(target),
            enter: ({ runtime, target }) => runtime.beginGrab(target),
            advance: ({ runtime, dt, target }) => runtime.advanceGrab(dt, target)
        });
    }
}

class HammerState extends CommanderAttackState {
    constructor() {
        super({
            id: STATE.HAMMER,
            canEnter: ({ runtime, target }) => runtime.canHammer(target),
            enter: ({ runtime, target }) => runtime.beginHammer(target),
            advance: ({ runtime, dt }) => runtime.advanceHammer(dt)
        });
    }
}

class ChargeState extends CommanderAttackState {
    constructor() {
        super({
            id: STATE.CHARGE,
            canEnter: ({ runtime, target }) => runtime.canCharge(target),
            enter: ({ runtime, target }) => runtime.beginCharge(target),
            advance: ({ runtime, dt }) => runtime.advanceCharge(dt)
        });
    }
}

export function createLowerSectorCommanderStateCatalog() {
    return defineBossStateCatalog([new GrabState(), new HammerState(), new ChargeState()]);
}
