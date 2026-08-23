import { ENEMY_TYPE } from "../game/EnemyType.js";
import {
    ARTILLERY_BEHAVIOR_STATE,
    ENEMY_BEHAVIOR_KIND,
    PURSUIT_BEHAVIOR_STATE,
    SHIELD_BEHAVIOR_STATE,
    SUPPORT_BEHAVIOR_STATE,
    SWARM_BEHAVIOR_STATE
} from "../game/combat/enemy-behavior/EnemyBehaviorDefinition.js";
import { ENEMY_ATTACK_STATE, ENEMY_RULE } from "../game/combat/enemy-weapon/EnemyWeaponDefinition.js";

const PRESENTATION = Object.freeze({
    IDLE: "idle",
    PATROL_MOVE: "patrol-move",
    PATROL_WAIT: "patrol-wait",
    KNOCKBACK: "knockback",
    ATTACK_ACQUIRE: "attack-acquire",
    ATTACK_TRACK: "attack-track",
    ATTACK_LOCK: "attack-lock",
    ATTACK_FIRE: "attack-fire",
    ATTACK_COOLDOWN: "attack-cooldown"
});
const ATTACK_PRESENTATION_BY_STATE = Object.freeze({
    [ENEMY_ATTACK_STATE.IDLE]: null,
    [ENEMY_ATTACK_STATE.ACQUIRE]: PRESENTATION.ATTACK_ACQUIRE,
    [ENEMY_ATTACK_STATE.TRACK]: PRESENTATION.ATTACK_TRACK,
    [ENEMY_ATTACK_STATE.LOCK]: PRESENTATION.ATTACK_LOCK,
    [ENEMY_ATTACK_STATE.FIRE]: PRESENTATION.ATTACK_FIRE,
    [ENEMY_ATTACK_STATE.COOLDOWN]: PRESENTATION.ATTACK_COOLDOWN
});
const BEHAVIOR_PRESENTATION_BY_STATE = Object.freeze({
    [ENEMY_BEHAVIOR_KIND.PURSUIT]: Object.freeze({
        [PURSUIT_BEHAVIOR_STATE.SEEK]: "pursuit-seek",
        [PURSUIT_BEHAVIOR_STATE.WINDUP]: "pursuit-windup",
        [PURSUIT_BEHAVIOR_STATE.DASH]: "pursuit-dash",
        [PURSUIT_BEHAVIOR_STATE.RECOVER]: "pursuit-recover"
    }),
    [ENEMY_BEHAVIOR_KIND.SHIELD]: Object.freeze({ [SHIELD_BEHAVIOR_STATE.GUARD]: "shield-guard" }),
    [ENEMY_BEHAVIOR_KIND.ARTILLERY]: Object.freeze({
        [ARTILLERY_BEHAVIOR_STATE.IDLE]: "artillery-idle",
        [ARTILLERY_BEHAVIOR_STATE.TELEGRAPH]: "artillery-telegraph",
        [ARTILLERY_BEHAVIOR_STATE.COOLDOWN]: "artillery-cooldown"
    }),
    [ENEMY_BEHAVIOR_KIND.SUPPORT]: Object.freeze({
        [SUPPORT_BEHAVIOR_STATE.IDLE]: "support-idle",
        [SUPPORT_BEHAVIOR_STATE.LINK]: "support-link"
    }),
    [ENEMY_BEHAVIOR_KIND.SWARM]: Object.freeze({
        [SWARM_BEHAVIOR_STATE.CHASE]: "swarm-chase",
        [SWARM_BEHAVIOR_STATE.RECOIL]: "swarm-recoil"
    })
});
const ACTIVE_BEHAVIOR_STATE = Object.freeze({
    "pursuit-windup": true,
    "pursuit-dash": true,
    "pursuit-recover": true,
    "artillery-telegraph": true,
    "artillery-cooldown": true,
    "support-link": true,
    "swarm-recoil": true
});
const COMMON_STATES = Object.freeze([
    PRESENTATION.IDLE,
    PRESENTATION.PATROL_MOVE,
    PRESENTATION.PATROL_WAIT,
    PRESENTATION.KNOCKBACK
]);
const ATTACK_STATES = Object.freeze(Object.values(ATTACK_PRESENTATION_BY_STATE).filter(Boolean));
const DRONE_ENEMY_TYPE = Object.freeze({
    [ENEMY_TYPE.PATROL_DRONE]: true,
    [ENEMY_TYPE.PATROL_DRONE_T1]: true,
    [ENEMY_TYPE.PURSUIT_DRONE_T1]: true,
    [ENEMY_TYPE.SHIELD_DRONE_T1]: true,
    [ENEMY_TYPE.ARTILLERY_DRONE_T1]: true,
    [ENEMY_TYPE.SUPPORT_DRONE_T1]: true,
    [ENEMY_TYPE.SWARM_DRONE_T1]: true
});
const SENSOR_COLOR_BY_CUTTER = Object.freeze({
    true: Object.freeze({ idle: "#4a2a08", cooldown: "#7c4a12", fire: "#ffb347", lock: "#ff7a00", default: "#e8590c" }),
    false: Object.freeze({ idle: "#3f1d2b", cooldown: "#7f1d1d", fire: "#ffb347", lock: "#ff5a36", default: "#dc263f" })
});

function definition({ behaviorKind = null, usesProjectileAttack = true, patrol = false, renderSize = null } = {}) {
    return Object.freeze({
        behaviorKind,
        usesProjectileAttack,
        renderSize: renderSize ? Object.freeze({ ...renderSize }) : null,
        states: Object.freeze([
            ...COMMON_STATES.filter(
                (state) => patrol || (state !== PRESENTATION.PATROL_MOVE && state !== PRESENTATION.PATROL_WAIT)
            ),
            ...(usesProjectileAttack ? ATTACK_STATES : []),
            ...(behaviorKind ? Object.values(BEHAVIOR_PRESENTATION_BY_STATE[behaviorKind]) : [])
        ])
    });
}

const SENTRY = definition();
const PATROL = definition({ patrol: true });
export const ENEMY_PRESENTATION_DEFINITIONS = Object.freeze({
    [ENEMY_TYPE.SENTRY]: SENTRY,
    [ENEMY_TYPE.SENTRY_T1]: SENTRY,
    [ENEMY_TYPE.PATROL_DRONE]: PATROL,
    [ENEMY_TYPE.PATROL_DRONE_T1]: PATROL,
    [ENEMY_TYPE.PURSUIT_DRONE_T1]: definition({ behaviorKind: ENEMY_BEHAVIOR_KIND.PURSUIT }),
    [ENEMY_TYPE.SHIELD_DRONE_T1]: definition({ behaviorKind: ENEMY_BEHAVIOR_KIND.SHIELD }),
    [ENEMY_TYPE.ARTILLERY_DRONE_T1]: definition({
        behaviorKind: ENEMY_BEHAVIOR_KIND.ARTILLERY,
        usesProjectileAttack: false
    }),
    [ENEMY_TYPE.HARDPOINT_JAMMER_V1]: definition({ usesProjectileAttack: false }),
    [ENEMY_TYPE.SUPPORT_DRONE_T1]: definition({
        behaviorKind: ENEMY_BEHAVIOR_KIND.SUPPORT,
        usesProjectileAttack: false
    }),
    [ENEMY_TYPE.SWARM_DRONE_T1]: definition({
        behaviorKind: ENEMY_BEHAVIOR_KIND.SWARM,
        usesProjectileAttack: false,
        renderSize: { width: 18, height: 18 }
    })
});

function line(enemy, direction, length, color, width) {
    if (!direction || !Number.isFinite(direction.x) || !Number.isFinite(direction.y)) return null;
    return Object.freeze({
        kind: "line",
        start: Object.freeze({ ...enemy.position }),
        end: Object.freeze({ x: enemy.position.x + direction.x * length, y: enemy.position.y + direction.y * length }),
        color,
        width
    });
}

function behaviorTelegraph(enemy, behavior, enemies) {
    const state = BEHAVIOR_PRESENTATION_BY_STATE[behavior?.kind]?.[behavior?.state];
    if (state === "pursuit-windup") return line(enemy, behavior.dashDirection, 180, "#fdba74", 2);
    if (state === "pursuit-dash") return line(enemy, behavior.dashDirection, 180, "#fb923c", 4);
    if (state === "shield-guard" && behavior.guardDirection) {
        const angle = Math.atan2(behavior.guardDirection.y, behavior.guardDirection.x);
        const halfAngle = Number.isFinite(behavior.guardHalfAngle) ? behavior.guardHalfAngle : Math.PI / 3;
        return Object.freeze({
            kind: "arc",
            center: Object.freeze({ ...enemy.position }),
            radius: (enemy.radius ?? 18) + 9,
            startAngle: angle - halfAngle,
            endAngle: angle + halfAngle,
            color: "#60a5fa",
            width: 4
        });
    }
    if (state === "artillery-telegraph" && behavior.targetPosition)
        return Object.freeze({
            kind: "area",
            center: Object.freeze({ ...behavior.targetPosition }),
            radius: behavior.strikeRadius ?? 72,
            color: "#f97316",
            width: 3
        });
    if (state === "support-link" && behavior.targetId) {
        const target = enemies.find(({ id }) => id === behavior.targetId);
        return target
            ? Object.freeze({
                  kind: "line",
                  start: Object.freeze({ ...enemy.position }),
                  end: Object.freeze({ ...target.position }),
                  color: "#4ade80",
                  width: 3
              })
            : null;
    }
    if (state === "swarm-recoil") return line(enemy, behavior.recoilDirection, 80, "#e879f9", 2);
    return null;
}

export function resolveUprightAimTransform(aimDirection) {
    const x = aimDirection?.x;
    const y = aimDirection?.y;
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.hypot(x, y) <= Number.EPSILON)
        return Object.freeze({ flipX: false, rotation: 0 });
    const angle = Math.atan2(y, x);
    return x < 0
        ? Object.freeze({ flipX: true, rotation: angle < 0 ? angle + Math.PI : angle - Math.PI })
        : Object.freeze({ flipX: false, rotation: angle });
}

export function enemyPresentationDefinition(enemyType) {
    return ENEMY_PRESENTATION_DEFINITIONS[enemyType] ?? SENTRY;
}

export function resolveEnemyPresentationState(enemy, enemies = []) {
    const enemyType = enemy?.enemyType ?? ENEMY_TYPE.SENTRY_T1;
    const declared = enemyPresentationDefinition(enemyType);
    const behavior = enemy?.behaviorState ?? enemy?.enemyBehaviorSnapshot?.() ?? null;
    const behaviorState = BEHAVIOR_PRESENTATION_BY_STATE[behavior?.kind]?.[behavior?.state] ?? null;
    const attackState = ATTACK_PRESENTATION_BY_STATE[enemy?.attackState] ?? null;
    const patrolState = !enemy?.patrol
        ? PRESENTATION.IDLE
        : enemy.patrol.waitRemaining > 0
          ? PRESENTATION.PATROL_WAIT
          : PRESENTATION.PATROL_MOVE;
    const baseState = behaviorState && !ACTIVE_BEHAVIOR_STATE[behaviorState] ? behaviorState : patrolState;
    const primaryState =
        enemy?.debugPresentationState ??
        (enemy?.knockbackState
            ? PRESENTATION.KNOCKBACK
            : behaviorState && ACTIVE_BEHAVIOR_STATE[behaviorState]
              ? behaviorState
              : (attackState ?? baseState));
    if (!declared.states.includes(primaryState))
        throw new Error(`enemy presentation state '${primaryState}' is not declared for '${enemyType}'`);
    const cutter = enemy?.rules?.includes(ENEMY_RULE.CUTTER_FIRE) === true;
    const locked = enemy?.attackState === ENEMY_ATTACK_STATE.LOCK;
    const aiming = (enemy?.attackState === ENEMY_ATTACK_STATE.TRACK || locked) && enemy?.aimDirection;
    const aimLine = aiming
        ? Object.freeze({
              end: Object.freeze({
                  x: enemy.position.x + enemy.aimDirection.x * 520,
                  y: enemy.position.y + enemy.aimDirection.y * 520
              }),
              color: cutter ? (locked ? "#ff8c1a" : "#b45309") : locked ? "#ff5a36" : "#8f2738",
              width: locked ? 3 : 1.5
          })
        : null;
    const sensorColors = SENSOR_COLOR_BY_CUTTER[cutter];
    const sensorColor = sensorColors[enemy?.attackState || ENEMY_ATTACK_STATE.IDLE] ?? sensorColors.default;
    const pursuitDirection =
        behavior?.kind === ENEMY_BEHAVIOR_KIND.PURSUIT &&
        (primaryState === "pursuit-windup" || primaryState === "pursuit-dash")
            ? behavior.dashDirection
            : null;
    const pursuitFacing = behavior?.kind === ENEMY_BEHAVIOR_KIND.PURSUIT ? behavior.dashDirection : null;
    const aimFacing = enemy?.aimDirection ?? null;
    const patrolTarget = enemy?.patrol?.points?.[enemy.patrol.targetIndex];
    const patrolFacingX = patrolTarget?.x - enemy?.position?.x;
    const patrolFacing =
        Number.isFinite(patrolFacingX) && Math.abs(patrolFacingX) > Number.EPSILON
            ? Object.freeze({ x: patrolFacingX, y: 0 })
            : null;
    const facingDirection =
        Number.isFinite(pursuitFacing?.x) && Math.abs(pursuitFacing.x) > Number.EPSILON
            ? pursuitFacing
            : Number.isFinite(aimFacing?.x) && Math.abs(aimFacing.x) > Number.EPSILON
              ? aimFacing
              : patrolFacing;
    const aimLayerDirection =
        [ENEMY_ATTACK_STATE.TRACK, ENEMY_ATTACK_STATE.LOCK, ENEMY_ATTACK_STATE.FIRE].includes(enemy?.attackState) &&
        enemy.aimDirection
            ? enemy.aimDirection
            : (enemy?.presentationAimDirection ?? enemy?.aimDirection ?? null);
    const guardLayerDirection =
        behavior?.kind === ENEMY_BEHAVIOR_KIND.SHIELD ? (behavior.guardDirection ?? null) : null;
    return Object.freeze({
        enemyType,
        primaryState,
        baseState,
        attackState,
        behaviorState,
        telegraph: behaviorTelegraph(enemy, behavior, enemies),
        aimLine,
        sensorColor,
        drone: Boolean(DRONE_ENEMY_TYPE[enemyType]),
        cutter,
        facingDirection,
        aimLayerDirection,
        guardLayerDirection,
        renderSize: declared.renderSize,
        pursuitTransform: pursuitDirection ? resolveUprightAimTransform(pursuitDirection) : null
    });
}
