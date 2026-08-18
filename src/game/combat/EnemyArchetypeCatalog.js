import { EnemyObject } from "./EnemyObject.js";
import {
    ArtilleryEnemyBehavior,
    PursuitEnemyBehavior,
    ShieldEnemyBehavior,
    SupportEnemyBehavior,
    SwarmEnemyBehavior
} from "./EnemyBehaviors.js";
import { ENEMY_BEHAVIOR_STATES } from "./EnemyStateCatalog.js";

const DEFINITIONS = Object.freeze([
    Object.freeze({
        id: "pursuit-drone-t1",
        displayName: "추격 드론",
        behaviorKind: "pursuit",
        behaviorStates: ENEMY_BEHAVIOR_STATES.pursuit,
        usesProjectileAttack: true,
        createBehavior: (state) => new PursuitEnemyBehavior(state)
    }),
    Object.freeze({
        id: "shield-drone-t1",
        displayName: "방패 드론",
        behaviorKind: "shield",
        behaviorStates: ENEMY_BEHAVIOR_STATES.shield,
        usesProjectileAttack: true,
        createBehavior: (state) => new ShieldEnemyBehavior(state)
    }),
    Object.freeze({
        id: "artillery-drone-t1",
        displayName: "포격 드론",
        behaviorKind: "artillery",
        behaviorStates: ENEMY_BEHAVIOR_STATES.artillery,
        usesProjectileAttack: false,
        createBehavior: (state) => new ArtilleryEnemyBehavior(state)
    }),
    Object.freeze({
        id: "support-drone-t1",
        displayName: "지원 드론",
        behaviorKind: "support",
        behaviorStates: ENEMY_BEHAVIOR_STATES.support,
        usesProjectileAttack: false,
        createBehavior: (state) => new SupportEnemyBehavior(state)
    }),
    Object.freeze({
        id: "swarm-drone-t1",
        displayName: "군집 드론",
        behaviorKind: "swarm",
        behaviorStates: ENEMY_BEHAVIOR_STATES.swarm,
        usesProjectileAttack: true,
        createBehavior: (state) => new SwarmEnemyBehavior(state)
    })
]);

const DEFINITIONS_BY_ID = new Map(DEFINITIONS.map((definition) => [definition.id, definition]));
const LEGACY_DISPLAY_NAMES = new Map([
    ["sentry", "경계 포탑"],
    ["sentry-t1", "경계 포탑"],
    ["patrol-drone", "순찰 드론"],
    ["patrol-drone-t1", "순찰 드론"]
]);

export const ENEMY_ARCHETYPE_IDS = Object.freeze(DEFINITIONS.map(({ id }) => id));

export function isEnemyArchetype(enemyType) {
    return DEFINITIONS_BY_ID.has(enemyType);
}

export function isKnownEnemyType(enemyType) {
    return (
        enemyType === undefined ||
        enemyType === null ||
        isEnemyArchetype(enemyType) ||
        LEGACY_DISPLAY_NAMES.has(enemyType)
    );
}

export function enemyArchetypeDefinition(enemyType) {
    const definition = DEFINITIONS_BY_ID.get(enemyType);
    if (!definition) throw new Error(`unknown enemy archetype: ${enemyType}`);
    return definition;
}

export function enemyDisplayName(enemyType) {
    if (enemyType === undefined || enemyType === null) return "경계 포탑";
    return DEFINITIONS_BY_ID.get(enemyType)?.displayName ?? LEGACY_DISPLAY_NAMES.get(enemyType) ?? enemyType;
}

function mergeRules(rules = [], usesProjectileAttack) {
    return Object.freeze([
        ...new Set(
            usesProjectileAttack
                ? rules.filter((rule) => rule !== "no-projectile-attack")
                : [...rules, "no-projectile-attack"]
        )
    ]);
}

export function createEnemyArchetype({ enemyType, behaviorState = null, rules = [], ...properties }) {
    const definition = enemyArchetypeDefinition(enemyType);
    const swarmGroupId =
        enemyType === "swarm-drone-t1"
            ? (properties.swarmGroupId ?? properties.objectId ?? properties.id)
            : (properties.swarmGroupId ?? null);
    return new EnemyObject({
        ...properties,
        enemyType,
        displayName: definition.displayName,
        behavior: definition.createBehavior(behaviorState ?? {}),
        swarmGroupId,
        rules: mergeRules(rules, definition.usesProjectileAttack)
    });
}
