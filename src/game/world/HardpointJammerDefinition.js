import { ENEMY_TYPE } from "../EnemyType.js";

export const HARDPOINT_JAMMER_DEFINITION_KEY = Object.freeze({
    groupId: (sourceObjectId) => `${sourceObjectId}:field`
});

function candidateEnemyTypes(object) {
    return [
        object.enemyType,
        object.enemySelection?.fixedEnemyType,
        ...(object.enemySelection?.allowedEnemyTypes ?? [])
    ].filter((enemyType) => typeof enemyType === "string" && enemyType.length > 0);
}

export function deriveHardpointJammerGroups(objects, explicitGroups = []) {
    const byId = Object.create(null);
    for (const group of explicitGroups) byId[group.id] = Object.freeze({ ...group });
    for (const object of objects) {
        if (!candidateEnemyTypes(object).includes(ENEMY_TYPE.HARDPOINT_JAMMER_V1)) continue;
        const id = object.jammer?.groupId ?? HARDPOINT_JAMMER_DEFINITION_KEY.groupId(object.id);
        byId[id] ??= Object.freeze({ id, sourceObjectId: object.id });
    }
    return Object.freeze(Object.values(byId));
}
