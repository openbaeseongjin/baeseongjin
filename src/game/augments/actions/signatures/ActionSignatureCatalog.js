import { actionAugmentById } from "../ActionAugmentCatalog.js";
import { ACTION_EVENT_TYPE, ACTION_SIGNATURE_ID } from "../ActionAugmentDefinition.js";
import { CollisionReboundSignature } from "./CollisionReboundSignature.js";
import { DamageReflectSignature } from "./DamageReflectSignature.js";
import { EndWaveSignature } from "./EndWaveSignature.js";
import { ExplosiveTrailSignature } from "./ExplosiveTrailSignature.js";
import { PiercingShotSignature } from "./PiercingShotSignature.js";
import { WallImpactSignature } from "./WallImpactSignature.js";

function signatureEffect(id) {
    return actionAugmentById(id).effect;
}

export const ACTION_SIGNATURE_DEFINITION = Object.freeze({
    [ACTION_SIGNATURE_ID.EXPLOSIVE_TRAIL]: Object.freeze(
        new ExplosiveTrailSignature(signatureEffect(ACTION_SIGNATURE_ID.EXPLOSIVE_TRAIL))
    ),
    [ACTION_SIGNATURE_ID.COLLISION_REBOUND]: Object.freeze(
        new CollisionReboundSignature(signatureEffect(ACTION_SIGNATURE_ID.COLLISION_REBOUND))
    ),
    [ACTION_SIGNATURE_ID.DAMAGE_REFLECT]: Object.freeze(
        new DamageReflectSignature(signatureEffect(ACTION_SIGNATURE_ID.DAMAGE_REFLECT))
    ),
    [ACTION_SIGNATURE_ID.WALL_IMPACT]: Object.freeze(
        new WallImpactSignature(signatureEffect(ACTION_SIGNATURE_ID.WALL_IMPACT))
    ),
    [ACTION_SIGNATURE_ID.PIERCING_SHOT]: Object.freeze(
        new PiercingShotSignature(signatureEffect(ACTION_SIGNATURE_ID.PIERCING_SHOT))
    ),
    [ACTION_SIGNATURE_ID.END_WAVE]: Object.freeze(new EndWaveSignature(signatureEffect(ACTION_SIGNATURE_ID.END_WAVE)))
});

export const ACTION_SIGNATURE_BY_EVENT_TYPE = Object.freeze({
    [ACTION_EVENT_TYPE.EXPLOSIVE_TRAIL_DETONATED]: ACTION_SIGNATURE_DEFINITION[ACTION_SIGNATURE_ID.EXPLOSIVE_TRAIL],
    [ACTION_EVENT_TYPE.SLOW_FALL_END_WAVE]: ACTION_SIGNATURE_DEFINITION[ACTION_SIGNATURE_ID.END_WAVE]
});

export function actionSignatureById(id) {
    return id ? (ACTION_SIGNATURE_DEFINITION[id] ?? null) : null;
}
