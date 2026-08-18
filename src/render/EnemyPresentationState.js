const ATTACK_PRESENTATION_STATES = Object.freeze([
    "attack-acquire",
    "attack-track",
    "attack-lock",
    "attack-fire",
    "attack-cooldown"
]);
const COMMON_PRESENTATION_STATES = Object.freeze(["idle", "patrol-move", "patrol-wait", "knockback"]);
const BEHAVIOR_PRESENTATION_STATES = Object.freeze({
    pursuit: Object.freeze(["pursuit-seek", "pursuit-windup", "pursuit-dash", "pursuit-recover"]),
    shield: Object.freeze(["shield-guard"]),
    artillery: Object.freeze(["artillery-idle", "artillery-telegraph", "artillery-cooldown"]),
    support: Object.freeze(["support-idle", "support-link"]),
    swarm: Object.freeze(["swarm-orbit", "swarm-dive", "swarm-recover"])
});
const ACTIVE_BEHAVIOR_STATES = new Set([
    "pursuit-windup",
    "pursuit-dash",
    "pursuit-recover",
    "artillery-telegraph",
    "artillery-cooldown",
    "support-link",
    "swarm-dive",
    "swarm-recover"
]);

function definition({ behaviorKind = null, usesProjectileAttack = true, patrol = false } = {}) {
    return Object.freeze({
        behaviorKind,
        usesProjectileAttack,
        states: Object.freeze(
            [
                ...COMMON_PRESENTATION_STATES.filter((state) => patrol || !state.startsWith("patrol-")),
                ...(usesProjectileAttack ? ATTACK_PRESENTATION_STATES : []),
                ...(behaviorKind ? BEHAVIOR_PRESENTATION_STATES[behaviorKind] : [])
            ].filter((state, index, values) => values.indexOf(state) === index)
        )
    });
}

const SENTRY_DEFINITION = definition();
const PATROL_DEFINITION = definition({ patrol: true });

export const ENEMY_PRESENTATION_DEFINITIONS = Object.freeze({
    sentry: SENTRY_DEFINITION,
    "sentry-t1": SENTRY_DEFINITION,
    "patrol-drone": PATROL_DEFINITION,
    "patrol-drone-t1": PATROL_DEFINITION,
    "pursuit-drone-t1": definition({ behaviorKind: "pursuit" }),
    "shield-drone-t1": definition({ behaviorKind: "shield" }),
    "artillery-drone-t1": definition({ behaviorKind: "artillery", usesProjectileAttack: false }),
    "support-drone-t1": definition({ behaviorKind: "support", usesProjectileAttack: false }),
    "swarm-drone-t1": definition({ behaviorKind: "swarm" })
});

export function enemyPresentationDefinition(enemyType) {
    return ENEMY_PRESENTATION_DEFINITIONS[enemyType] ?? SENTRY_DEFINITION;
}

function patrolPresentationState(enemy) {
    if (!enemy?.patrol) return "idle";
    return enemy.patrol.waitRemaining > 0 ? "patrol-wait" : "patrol-move";
}

export function resolveEnemyPresentationState(enemy) {
    const definition = enemyPresentationDefinition(enemy?.enemyType);
    const behavior = enemy?.behaviorState ?? enemy?.enemyBehaviorSnapshot?.() ?? null;
    const behaviorState = behavior?.kind && behavior?.state ? `${behavior.kind}-${behavior.state}` : null;
    const attackState = enemy?.attackState && enemy.attackState !== "idle" ? `attack-${enemy.attackState}` : null;
    const baseState =
        behaviorState && !ACTIVE_BEHAVIOR_STATES.has(behaviorState) ? behaviorState : patrolPresentationState(enemy);
    const primaryState = enemy?.knockbackState
        ? "knockback"
        : behaviorState && ACTIVE_BEHAVIOR_STATES.has(behaviorState)
          ? behaviorState
          : (attackState ?? baseState);
    if (!definition.states.includes(primaryState)) {
        throw new Error(
            `enemy presentation state '${primaryState}' is not declared for '${enemy?.enemyType ?? "sentry-t1"}'`
        );
    }
    return Object.freeze({
        enemyType: enemy?.enemyType ?? "sentry-t1",
        primaryState,
        baseState,
        attackState,
        behaviorState
    });
}
