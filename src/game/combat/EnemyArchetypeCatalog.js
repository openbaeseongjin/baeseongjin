import { createEnemyObject } from "./EnemyObject.js";
import {
    ArtilleryEnemyBehavior,
    JammerEnemyBehavior,
    PursuitEnemyBehavior,
    ShieldEnemyBehavior,
    SupportEnemyBehavior,
    SwarmEnemyBehavior
} from "./EnemyBehaviors.js";
import { ENEMY_BEHAVIOR_STATES } from "./EnemyStateCatalog.js";
import { AUTHORABLE_ENEMY_TYPE_IDS, ENEMY_TYPE, SWARM_MEMBER_COUNT } from "../EnemyType.js";
import { ENEMY_BEHAVIOR_KIND } from "./enemy-behavior/EnemyBehaviorDefinition.js";

const SWARM_MEMBER_RADIUS = 7;
const SWARM_MEMBER_HEALTH = 10;
const SWARM_MEMBER_SPACING = 18;

function swarmMemberOffsets(count) {
    const columns = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / columns);
    const offsets = [];
    for (let row = 0; row < rows; row += 1) {
        const rowCount = Math.min(columns, count - row * columns);
        for (let column = 0; column < rowCount; column += 1) {
            offsets.push(
                Object.freeze({
                    x: (column - (rowCount - 1) * 0.5) * SWARM_MEMBER_SPACING,
                    y: (row - (rows - 1) * 0.5) * SWARM_MEMBER_SPACING
                })
            );
        }
    }
    return Object.freeze(offsets);
}

function swarmMemberObjectId(objectId, index) {
    return index === 0 ? objectId : `${objectId}:swarm-member:${index + 1}`;
}

function expandSwarmSpawn(properties) {
    const objectId = properties.objectId ?? properties.encounterId ?? properties.slotId;
    const groupId = properties.swarmGroupId ?? properties.slotId ?? objectId;
    const memberCount = properties.swarmMemberCount ?? SWARM_MEMBER_COUNT.DEFAULT;
    return Object.freeze(
        swarmMemberOffsets(memberCount).map((offset, index) =>
            Object.freeze({
                ...properties,
                objectId: swarmMemberObjectId(objectId, index),
                swarmGroupId: groupId,
                position: Object.freeze({
                    x: properties.position.x + offset.x,
                    y: properties.position.y + offset.y
                }),
                radius: SWARM_MEMBER_RADIUS,
                health: SWARM_MEMBER_HEALTH,
                maxHealth: SWARM_MEMBER_HEALTH
            })
        )
    );
}

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
        id: ENEMY_TYPE.HARDPOINT_JAMMER_V1,
        displayName: "하드포인트 재머",
        behaviorKind: ENEMY_BEHAVIOR_KIND.JAMMER,
        behaviorStates: ENEMY_BEHAVIOR_STATES[ENEMY_BEHAVIOR_KIND.JAMMER],
        usesProjectileAttack: false,
        createBehavior: (state) => new JammerEnemyBehavior(state)
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
        radius: SWARM_MEMBER_RADIUS,
        maxHealth: SWARM_MEMBER_HEALTH,
        expandSpawn: expandSwarmSpawn,
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
export const ENEMY_TYPE_IDS = AUTHORABLE_ENEMY_TYPE_IDS;

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

export function enemySpawnMembers(properties) {
    const definition = DEFINITIONS_BY_ID[properties.enemyType];
    return definition?.expandSpawn?.(properties) ?? Object.freeze([Object.freeze({ ...properties })]);
}

export function enemyInitialRadius(enemyType, fallback) {
    return DEFINITIONS_BY_ID[enemyType]?.radius ?? fallback;
}

export function enemyInitialHealth(enemyType, fallback) {
    return DEFINITIONS_BY_ID[enemyType]?.maxHealth ?? fallback;
}

export function createEnemyArchetype({ enemyType, behaviorState = null, rules = [], ...properties }) {
    const definition = enemyArchetypeDefinition(enemyType);
    return createEnemyObject({
        ...properties,
        enemyType,
        displayName: definition.displayName,
        behavior: definition.createBehavior(behaviorState ?? {}),
        weaponRange: definition.weaponRange ?? properties.weaponRange ?? null,
        swarmGroupId: definition.resolveSwarmGroupId?.(properties) ?? properties.swarmGroupId ?? null,
        radius: definition.radius ?? properties.radius,
        rules,
        usesProjectileAttack: definition.usesProjectileAttack
    });
}
