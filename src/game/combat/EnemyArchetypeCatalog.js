import { createEnemyObject } from "./EnemyObject.js";
import {
    ArtilleryEnemyBehavior,
    PursuitEnemyBehavior,
    ShieldEnemyBehavior,
    SupportEnemyBehavior,
    SwarmEnemyBehavior
} from "./EnemyBehaviors.js";
import { ENEMY_BEHAVIOR_STATES } from "./EnemyStateCatalog.js";
import { ENEMY_TYPE } from "../EnemyType.js";
import { ENEMY_BEHAVIOR_KIND } from "./enemy-behavior/EnemyBehaviorDefinition.js";

const DEFINITIONS = Object.freeze([
    Object.freeze({
        id: ENEMY_TYPE.PURSUIT_DRONE_T1,
        displayName: "추격 드론",
        behaviorKind: ENEMY_BEHAVIOR_KIND.PURSUIT,
        behaviorStates: ENEMY_BEHAVIOR_STATES[ENEMY_BEHAVIOR_KIND.PURSUIT],
        usesProjectileAttack: true,
        createBehavior: (state) => new PursuitEnemyBehavior(state)
    }),
    Object.freeze({
        id: ENEMY_TYPE.SHIELD_DRONE_T1,
        displayName: "방패 드론",
        behaviorKind: ENEMY_BEHAVIOR_KIND.SHIELD,
        behaviorStates: ENEMY_BEHAVIOR_STATES[ENEMY_BEHAVIOR_KIND.SHIELD],
        usesProjectileAttack: true,
        createBehavior: (state) => new ShieldEnemyBehavior(state)
    }),
    Object.freeze({
        id: ENEMY_TYPE.ARTILLERY_DRONE_T1,
        displayName: "포격 드론",
        behaviorKind: ENEMY_BEHAVIOR_KIND.ARTILLERY,
        behaviorStates: ENEMY_BEHAVIOR_STATES[ENEMY_BEHAVIOR_KIND.ARTILLERY],
        usesProjectileAttack: false,
        createBehavior: (state) => new ArtilleryEnemyBehavior(state)
    }),
    Object.freeze({
        id: ENEMY_TYPE.SUPPORT_DRONE_T1,
        displayName: "지원 드론",
        behaviorKind: ENEMY_BEHAVIOR_KIND.SUPPORT,
        behaviorStates: ENEMY_BEHAVIOR_STATES[ENEMY_BEHAVIOR_KIND.SUPPORT],
        usesProjectileAttack: false,
        createBehavior: (state) => new SupportEnemyBehavior(state)
    }),
    Object.freeze({
        id: ENEMY_TYPE.SWARM_DRONE_T1,
        displayName: "군집 드론",
        behaviorKind: ENEMY_BEHAVIOR_KIND.SWARM,
        behaviorStates: ENEMY_BEHAVIOR_STATES[ENEMY_BEHAVIOR_KIND.SWARM],
        usesProjectileAttack: false,
        resolveSwarmGroupId: swarmGroupId,
        createBehavior: (state) => new SwarmEnemyBehavior(state)
    })
]);

function swarmGroupId(properties) {
    if (properties.swarmGroupId) return properties.swarmGroupId;
    const activation = properties.activation;
    if (activation && [activation.x, activation.y, activation.width, activation.height].every(Number.isFinite)) {
        return `swarm-group:${activation.x}:${activation.y}:${activation.width}:${activation.height}`;
    }
    return properties.objectId ?? properties.id;
}

const DEFINITIONS_BY_ID = Object.freeze(
    Object.fromEntries(DEFINITIONS.map((definition) => [definition.id, definition]))
);
const LEGACY_DISPLAY_NAMES = Object.freeze({
    [ENEMY_TYPE.SENTRY]: "경계 포탑",
    [ENEMY_TYPE.SENTRY_T1]: "경계 포탑",
    [ENEMY_TYPE.PATROL_DRONE]: "순찰 드론",
    [ENEMY_TYPE.PATROL_DRONE_T1]: "순찰 드론"
});

export const ENEMY_ARCHETYPE_IDS = Object.freeze(DEFINITIONS.map(({ id }) => id));
export const ENEMY_TYPE_IDS = Object.freeze([ENEMY_TYPE.SENTRY_T1, ENEMY_TYPE.PATROL_DRONE_T1, ...ENEMY_ARCHETYPE_IDS]);

export function isCanonicalEnemyType(enemyType) {
    return ENEMY_TYPE_IDS.includes(enemyType);
}

export function isEnemyArchetype(enemyType) {
    return Object.hasOwn(DEFINITIONS_BY_ID, enemyType);
}

export function isKnownEnemyType(enemyType) {
    return (
        enemyType === undefined ||
        enemyType === null ||
        isEnemyArchetype(enemyType) ||
        Object.hasOwn(LEGACY_DISPLAY_NAMES, enemyType)
    );
}

export function enemyArchetypeDefinition(enemyType) {
    const definition = DEFINITIONS_BY_ID[enemyType];
    if (!definition) throw new Error(`unknown enemy archetype: ${enemyType}`);
    return definition;
}

export function enemyDisplayName(enemyType) {
    if (enemyType === undefined || enemyType === null) return "경계 포탑";
    return DEFINITIONS_BY_ID[enemyType]?.displayName ?? LEGACY_DISPLAY_NAMES[enemyType] ?? enemyType;
}

export function createEnemyArchetype({ enemyType, behaviorState = null, rules = [], ...properties }) {
    const definition = enemyArchetypeDefinition(enemyType);
    return createEnemyObject({
        ...properties,
        enemyType,
        displayName: definition.displayName,
        behavior: definition.createBehavior(behaviorState ?? {}),
        swarmGroupId: definition.resolveSwarmGroupId?.(properties) ?? properties.swarmGroupId ?? null,
        rules,
        usesProjectileAttack: definition.usesProjectileAttack
    });
}
