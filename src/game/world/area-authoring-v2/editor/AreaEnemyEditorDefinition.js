import { DEFAULT_ENEMY_TYPE_ID } from "../../../EnemyType.js";

const DEFAULT_ACTIVATION_SIZE = Object.freeze({ width: 192, height: 192 });
const DEFAULT_RULES = Object.freeze(["kill-optional", "no-rope-cut", "activation-band-only"]);

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
}

export const AREA_ENEMY_EDITOR_DEFINITION = Object.freeze(new AreaEnemyEditorDefinition());
