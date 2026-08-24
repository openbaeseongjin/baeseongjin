export const SPELL_TARGET_POLICY_ID = Object.freeze({
    EXCLUDE_SOURCE: "exclude-source",
    INCLUDE_SOURCE: "include-source"
});

export class SpellTargetPolicyDefinition {
    constructor({ id, canHitSource }) {
        this.id = id;
        this.canHitSource = canHitSource;
    }

    allows(sourceId, targetId) {
        return this.canHitSource || sourceId !== targetId;
    }
}

export const SPELL_TARGET_POLICY = Object.freeze({
    [SPELL_TARGET_POLICY_ID.EXCLUDE_SOURCE]: Object.freeze(
        new SpellTargetPolicyDefinition({ id: SPELL_TARGET_POLICY_ID.EXCLUDE_SOURCE, canHitSource: false })
    ),
    [SPELL_TARGET_POLICY_ID.INCLUDE_SOURCE]: Object.freeze(
        new SpellTargetPolicyDefinition({ id: SPELL_TARGET_POLICY_ID.INCLUDE_SOURCE, canHitSource: true })
    )
});

export function spellTargetPolicy(id) {
    const policy = SPELL_TARGET_POLICY[id];
    if (!policy) throw new Error(`unknown spell target policy: ${id}`);
    return policy;
}
