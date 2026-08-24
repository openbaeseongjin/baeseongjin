import { SPELL_RUNTIME_SPEC } from "./SpellRuntimeDefinition.js";

class SpellProjectileCollisionPolicy {
    resolvedContacts() {
        throw new Error(`${this.constructor.name} must implement resolvedContacts()`);
    }

    terminatesAfterContacts() {
        throw new Error(`${this.constructor.name} must implement terminatesAfterContacts()`);
    }
}

class SingleHitSpellProjectileCollisionPolicy extends SpellProjectileCollisionPolicy {
    resolvedContacts(contacts) {
        return contacts.slice(SPELL_RUNTIME_SPEC.ZERO, SPELL_RUNTIME_SPEC.UNIT);
    }

    terminatesAfterContacts(contacts) {
        return contacts.length > SPELL_RUNTIME_SPEC.ZERO;
    }
}

class PiercingSpellProjectileCollisionPolicy extends SpellProjectileCollisionPolicy {
    resolvedContacts(contacts) {
        return contacts;
    }

    terminatesAfterContacts() {
        return false;
    }
}

const SPELL_PROJECTILE_COLLISION_POLICY_BY_PIERCING = Object.freeze({
    true: Object.freeze(new PiercingSpellProjectileCollisionPolicy()),
    false: Object.freeze(new SingleHitSpellProjectileCollisionPolicy())
});

export function spellProjectileCollisionPolicy(piercing) {
    return SPELL_PROJECTILE_COLLISION_POLICY_BY_PIERCING[Boolean(piercing)];
}
