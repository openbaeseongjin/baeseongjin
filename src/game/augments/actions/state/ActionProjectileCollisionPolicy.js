import { ACTION_STATE_CONFIG } from "../ActionAugmentDefinition.js";

class ActionProjectileCollisionPolicy {
    resolvedContacts() {
        throw new Error(`${this.constructor.name} must implement resolvedContacts()`);
    }

    terminatesAfterContacts() {
        throw new Error(`${this.constructor.name} must implement terminatesAfterContacts()`);
    }
}

class SingleHitProjectileCollisionPolicy extends ActionProjectileCollisionPolicy {
    resolvedContacts(contacts) {
        return contacts.slice(ACTION_STATE_CONFIG.ZERO, ACTION_STATE_CONFIG.UNIT);
    }

    terminatesAfterContacts(contacts) {
        return contacts.length > ACTION_STATE_CONFIG.ZERO;
    }
}

class PiercingProjectileCollisionPolicy extends ActionProjectileCollisionPolicy {
    resolvedContacts(contacts) {
        return contacts;
    }

    terminatesAfterContacts() {
        return false;
    }
}

const ACTION_PROJECTILE_COLLISION_POLICY_BY_PIERCING = Object.freeze({
    true: Object.freeze(new PiercingProjectileCollisionPolicy()),
    false: Object.freeze(new SingleHitProjectileCollisionPolicy())
});

export function actionProjectileCollisionPolicy(piercing) {
    return ACTION_PROJECTILE_COLLISION_POLICY_BY_PIERCING[Boolean(piercing)];
}
