import { DEFAULT_ENEMY_TYPE_ID, ENEMY_TYPE, SWARM_MEMBER_COUNT } from "../../../EnemyType.js";

const DEFAULT_ACTIVATION_SIZE = Object.freeze({ width: 192, height: 192 });
const DEFAULT_RULES = Object.freeze(["kill-optional", "no-rope-cut", "activation-band-only"]);
const ADDITIONAL_FIELDS_BY_ENEMY_TYPE = Object.freeze({
    [ENEMY_TYPE.SWARM_DRONE_T1]: Object.freeze([
        Object.freeze({
            key: "swarmMemberCount",
            label: "군집 수",
            minimum: SWARM_MEMBER_COUNT.MINIMUM,
            maximum: SWARM_MEMBER_COUNT.MAXIMUM,
            defaultValue: SWARM_MEMBER_COUNT.DEFAULT,
            step: 1
        })
    ])
});

function candidateEnemyTypes(enemy) {
    return [
        enemy.enemyType,
        enemy.enemySelection?.fixedEnemyType,
        ...(enemy.enemySelection?.allowedEnemyTypes ?? [])
    ].filter((enemyType) => typeof enemyType === "string" && enemyType.length > 0);
}

export class AreaEnemyEditorDefinition {
    create({ id, position }) {
        return {
            id,
            kind: "sentry",
            presentationId: "world-object:sentry",
            position: { x: position.x, y: position.y },
            coordinateAnchor: "center",
            enemySelection: { allowedEnemyTypes: [DEFAULT_ENEMY_TYPE_ID] },
            activationSpec: {
                anchor: "center",
                offset: { x: 0, y: 0 },
                size: { ...DEFAULT_ACTIVATION_SIZE }
            },
            rules: [...DEFAULT_RULES]
        };
    }

    additionalFields(enemy) {
        const definitions = [];
        const seenKeys = Object.create(null);
        for (const enemyType of candidateEnemyTypes(enemy)) {
            for (const definition of ADDITIONAL_FIELDS_BY_ENEMY_TYPE[enemyType] ?? []) {
                if (seenKeys[definition.key]) continue;
                seenKeys[definition.key] = true;
                definitions.push(definition);
            }
        }
        return Object.freeze(definitions);
    }
}

export const AREA_ENEMY_EDITOR_DEFINITION = Object.freeze(new AreaEnemyEditorDefinition());
