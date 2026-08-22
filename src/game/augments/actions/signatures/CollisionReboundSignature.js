import {
    ACTION_REJECTION_REASON,
    ACTION_RUNTIME_CONFIG,
    ACTION_SIGNATURE_ID,
    ACTION_STATE_CONFIG,
    ACTION_TARGET_KIND
} from "../ActionAugmentDefinition.js";
import { directionBetween, reflectVelocity } from "../ActionRuntimeSupport.js";
import { ActionSignatureDefinition } from "./ActionSignatureDefinition.js";

export class CollisionReboundSignature extends ActionSignatureDefinition {
    constructor(effect) {
        super(ACTION_SIGNATURE_ID.COLLISION_REBOUND);
        this.effect = effect;
    }

    decorateActivation(activation) {
        return { ...activation, reboundEffect: Object.freeze({ ...this.effect }) };
    }

    get allowsDistinctEnemyDamage() {
        return true;
    }

    createResolutionTracker() {
        const enemyIds = new Set();
        return Object.freeze({
            observeDashStrikeRebound: ({
                targetId = null,
                targetKind = ACTION_TARGET_KIND.WALL,
                collisionNormal,
                incomingVelocity
            }) => {
                if (targetKind === ACTION_TARGET_KIND.ENEMY) {
                    if (!targetId) throw new Error("enemy rebounds require a targetId");
                    if (enemyIds.has(targetId)) {
                        return Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.DUPLICATE_ENEMY });
                    }
                    enemyIds.add(targetId);
                }
                return Object.freeze({
                    accepted: true,
                    reflectedVelocity: Object.freeze({ ...reflectVelocity(incomingVelocity, collisionNormal) }),
                    preservesSpeed: true
                });
            }
        });
    }

    reflectFromEnemy({ player, enemy }) {
        const normal = directionBetween(enemy.position, player.physics.position);
        const velocity = player.physics.physicsStepVelocity();
        const reflected = reflectVelocity(velocity, normal);
        const speed = velocity.length();
        const reflectedSpeed = reflected.length();
        if (speed > ACTION_STATE_CONFIG.ZERO && reflectedSpeed > ACTION_STATE_CONFIG.ZERO) {
            reflected.scale(speed / reflectedSpeed);
        }
        player.physics.applyImpulse({ x: reflected.x - velocity.x, y: reflected.y - velocity.y });
    }

    reflectFromSurfaces({ player }) {
        if (player.physics.lastSurfaceCollisionNormals.length === ACTION_STATE_CONFIG.ZERO) return;
        const incoming = player.physics.lastSurfaceCollisionIncomingVelocity;
        let reflectedX = incoming.x;
        let reflectedY = incoming.y;
        for (const normal of player.physics.lastSurfaceCollisionNormals) {
            const dot = reflectedX * normal.x + reflectedY * normal.y;
            if (dot >= ACTION_STATE_CONFIG.ZERO) continue;
            reflectedX -= ACTION_RUNTIME_CONFIG.VECTOR_REFLECTION_SCALE * dot * normal.x;
            reflectedY -= ACTION_RUNTIME_CONFIG.VECTOR_REFLECTION_SCALE * dot * normal.y;
        }
        const velocity = player.physics.physicsStepVelocity();
        player.physics.applyImpulse({ x: reflectedX - velocity.x, y: reflectedY - velocity.y });
    }
}
