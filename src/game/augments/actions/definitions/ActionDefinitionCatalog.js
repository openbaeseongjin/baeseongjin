import { BASE_ACTION_ID } from "../ActionAugmentDefinition.js";
import { DashStrikeAction } from "./DashStrikeAction.js";
import { DefaultPunchAction } from "./DefaultPunchAction.js";
import { DirectionDashAction } from "./DirectionDashAction.js";
import { InstantGuardAction } from "./InstantGuardAction.js";
import { PushAwayAction } from "./PushAwayAction.js";
import { SlowFallAction } from "./SlowFallAction.js";
import { StraightShotAction } from "./StraightShotAction.js";

export const ACTION_DEFINITION = Object.freeze({
    [BASE_ACTION_ID.DEFAULT_PUNCH]: Object.freeze(new DefaultPunchAction()),
    [BASE_ACTION_ID.DIRECTION_DASH]: Object.freeze(new DirectionDashAction()),
    [BASE_ACTION_ID.DASH_STRIKE]: Object.freeze(new DashStrikeAction()),
    [BASE_ACTION_ID.INSTANT_GUARD]: Object.freeze(new InstantGuardAction()),
    [BASE_ACTION_ID.PUSH_AWAY]: Object.freeze(new PushAwayAction()),
    [BASE_ACTION_ID.STRAIGHT_SHOT]: Object.freeze(new StraightShotAction()),
    [BASE_ACTION_ID.SLOW_FALL]: Object.freeze(new SlowFallAction())
});

export function actionDefinitionById(id) {
    return ACTION_DEFINITION[id] ?? null;
}
