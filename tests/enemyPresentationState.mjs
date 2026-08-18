import assert from "node:assert/strict";
import { ENEMY_ARCHETYPE_IDS, enemyArchetypeDefinition } from "../src/game/combat/EnemyArchetypeCatalog.js";
import {
    ENEMY_PRESENTATION_DEFINITIONS,
    enemyPresentationDefinition,
    resolveEnemyPresentationState
} from "../src/render/EnemyPresentationState.js";
import { SpriteEnemyRenderer } from "../src/render/sprites/SpriteActorRenderers.js";

function snapshot(enemyType, overrides = {}) {
    return {
        enemyType,
        attackState: "idle",
        behaviorState: null,
        knockbackState: null,
        patrol: null,
        ...overrides
    };
}

export function run() {
    for (const enemyType of ENEMY_ARCHETYPE_IDS) {
        const archetype = enemyArchetypeDefinition(enemyType);
        const presentation = enemyPresentationDefinition(enemyType);
        assert.equal(presentation.behaviorKind, archetype.behaviorKind);
        assert.equal(presentation.usesProjectileAttack, archetype.usesProjectileAttack);
        for (const state of archetype.behaviorStates) {
            const resolved = resolveEnemyPresentationState(
                snapshot(enemyType, { behaviorState: { kind: archetype.behaviorKind, state } })
            );
            assert.equal(resolved.behaviorState, `${archetype.behaviorKind}-${state}`);
            assert.ok(presentation.states.includes(resolved.primaryState));
        }
        if (archetype.usesProjectileAttack) {
            for (const state of ["acquire", "track", "lock", "fire", "cooldown"]) {
                const resolved = resolveEnemyPresentationState(snapshot(enemyType, { attackState: state }));
                assert.equal(resolved.primaryState, `attack-${state}`);
            }
        }
    }

    assert.equal(
        resolveEnemyPresentationState(
            snapshot("pursuit-drone-t1", {
                attackState: "fire",
                behaviorState: { kind: "pursuit", state: "dash" },
                knockbackState: { remainingSeconds: 0.1 }
            })
        ).primaryState,
        "knockback",
        "knockback must win over simultaneous behavior and attack axes"
    );
    assert.equal(
        resolveEnemyPresentationState(
            snapshot("shield-drone-t1", {
                attackState: "fire",
                behaviorState: { kind: "shield", state: "guard" }
            })
        ).primaryState,
        "attack-fire",
        "an active attack must override a persistent stance"
    );
    assert.equal(
        resolveEnemyPresentationState(snapshot("patrol-drone-t1", { patrol: { waitRemaining: 0.2 } })).primaryState,
        "patrol-wait"
    );
    assert.equal(
        resolveEnemyPresentationState(snapshot("patrol-drone-t1", { patrol: { waitRemaining: 0 } })).primaryState,
        "patrol-move"
    );
    assert.throws(
        () =>
            resolveEnemyPresentationState(
                snapshot("pursuit-drone-t1", { behaviorState: { kind: "pursuit", state: "missing" } })
            ),
        /not declared/,
        "unknown gameplay states must fail at the presentation boundary"
    );
    assert.equal(Object.isFrozen(ENEMY_PRESENTATION_DEFINITIONS), true);

    let resolvedPresentation = null;
    const renderer = new SpriteEnemyRenderer({
        presentationResolver: resolveEnemyPresentationState,
        spriteResolver: (presentation) => {
            resolvedPresentation = presentation;
            return { rows: ["a"] };
        }
    });
    const context = {
        save() {},
        restore() {},
        fillRect() {},
        strokeRect() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        arc() {},
        fill() {}
    };
    renderer.draw({
        context,
        scene: {
            enemies: [
                {
                    ...snapshot("sentry-t1"),
                    position: { x: 0, y: 0 },
                    radius: 18,
                    health: 100,
                    maxHealth: 100,
                    rules: []
                }
            ]
        }
    });
    assert.equal(resolvedPresentation.primaryState, "idle", "sprite selection must consume the shared resolver result");
}
