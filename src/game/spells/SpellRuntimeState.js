import { spellDefinition } from "./SpellCatalog.js";
import { SPELL_ID, SPELL_SLOT_ID, SPELL_SLOT_ORDER } from "./SpellDefinition.js";
import { SpellEffectState } from "./SpellEffectState.js";

const STARTING_SLOTS = Object.freeze({
    [SPELL_SLOT_ID.BASIC_ATTACK]: SPELL_ID.ENERGY_ORB,
    [SPELL_SLOT_ID.UTILITY]: null,
    [SPELL_SLOT_ID.POWER_ATTACK]: null,
    [SPELL_SLOT_ID.MOVEMENT]: SPELL_ID.PHYSICS_DASH
});

export class SpellRuntimeState {
    constructor() {
        this.effects = new SpellEffectState();
        this.reset();
    }
    equip(spellId) {
        const definition = spellDefinition(spellId);
        if (!definition) throw new Error(`unknown spell: ${spellId}`);
        this.slots[definition.spec.slotId] = spellId;
        if (definition.spec.maxCharges) this.charges[spellId] ??= definition.spec.maxCharges;
        return definition.spec.slotId;
    }
    spellAt(slotId) {
        return spellDefinition(this.slots[slotId]);
    }
    movementMultiplier() {
        return this.effects.movementMultiplier();
    }
    gravityScale() {
        return this.effects.gravityScale();
    }
    preserveMovementImpulse() {
        this.preserveMovementImpulsePending = true;
    }
    consumeMovementImpulsePreservation() {
        const pending = this.preserveMovementImpulsePending;
        this.preserveMovementImpulsePending = false;
        return pending;
    }
    resetOtherCooldowns() {
        for (const slotId of SPELL_SLOT_ORDER) if (slotId !== SPELL_SLOT_ID.UTILITY) this.cooldowns[slotId] = 0;
        for (const [id] of Object.entries(this.charges)) this.charges[id] = spellDefinition(id).spec.maxCharges;
    }
    activateEffect(effect) {
        if (effect.kind === "cooldown-reset") this.resetOtherCooldowns();
        else this.effects.activate(effect);
    }
    applyContinuousEffects(player, direction, dt) {
        return this.effects.applyFlight(player, direction, dt);
    }

    cast(command, context) {
        const sequence = command?.commandSequence ?? 0;
        if (!Number.isSafeInteger(sequence) || sequence <= this.lastCommandSequence) return null;
        this.lastCommandSequence = sequence;
        const slotId = command.commandKey;
        const definition = this.spellAt(slotId);
        if (!definition) return null;
        const maxCharges = definition.spec.maxCharges ?? 0;
        if (maxCharges > 0 ? (this.charges[definition.id] ?? maxCharges) <= 0 : this.cooldowns[slotId] > 0) return null;
        if (
            !definition.cast({
                ...context,
                activateSpellEffect: (effect) => this.activateEffect(effect),
                preserveMovementImpulse: () => this.preserveMovementImpulse()
            })
        )
            return null;
        if (maxCharges > 0) {
            this.charges[definition.id] = (this.charges[definition.id] ?? maxCharges) - 1;
            if (this.cooldowns[slotId] <= 0) this.cooldowns[slotId] = definition.spec.cooldownSeconds;
        } else this.cooldowns[slotId] = definition.spec.cooldownSeconds;
        return Object.freeze({ slotId, spellId: definition.id, cooldownSeconds: definition.spec.cooldownSeconds });
    }

    advance(dt) {
        for (const slotId of SPELL_SLOT_ORDER) {
            const definition = this.spellAt(slotId);
            if (definition?.spec.maxCharges) {
                const maxCharges = definition.spec.maxCharges;
                if ((this.charges[definition.id] ?? maxCharges) < maxCharges) {
                    this.cooldowns[slotId] = Math.max(0, this.cooldowns[slotId] - dt);
                    if (this.cooldowns[slotId] === 0) {
                        this.charges[definition.id] += 1;
                        if (this.charges[definition.id] < maxCharges)
                            this.cooldowns[slotId] = definition.spec.cooldownSeconds;
                    }
                } else this.cooldowns[slotId] = 0;
            } else this.cooldowns[slotId] = Math.max(0, this.cooldowns[slotId] - dt);
        }
        this.effects.advance(dt);
    }

    snapshot() {
        return Object.freeze({
            slots: Object.freeze({ ...this.slots }),
            cooldowns: Object.freeze({ ...this.cooldowns }),
            charges: Object.freeze({ ...this.charges }),
            lastCommandSequence: this.lastCommandSequence,
            effects: this.effects.snapshot(),
            preserveMovementImpulsePending: this.preserveMovementImpulsePending
        });
    }
    restore(snapshot = null) {
        if (!snapshot) return this.reset();
        this.slots = Object.fromEntries(
            SPELL_SLOT_ORDER.map((slotId) => {
                const spellId = snapshot.slots?.[slotId] ?? null;
                const definition = spellId === null ? null : spellDefinition(spellId);
                if (spellId !== null && (!definition || definition.spec.slotId !== slotId))
                    throw new Error(`invalid spell slot snapshot: ${slotId}`);
                return [slotId, spellId];
            })
        );
        this.cooldowns = Object.fromEntries(
            SPELL_SLOT_ORDER.map((slotId) => {
                const value = snapshot.cooldowns?.[slotId];
                if (!Number.isFinite(value) || value < 0) throw new Error(`invalid spell cooldown snapshot: ${slotId}`);
                return [slotId, value];
            })
        );
        this.charges = Object.fromEntries(
            Object.entries(snapshot.charges ?? {}).map(([spellId, value]) => {
                const maximum = spellDefinition(spellId)?.spec.maxCharges;
                if (!Number.isSafeInteger(value) || !Number.isSafeInteger(maximum) || value < 0 || value > maximum) {
                    throw new Error(`invalid spell charge snapshot: ${spellId}`);
                }
                return [spellId, value];
            })
        );
        this.lastCommandSequence = snapshot.lastCommandSequence;
        if (!Number.isSafeInteger(this.lastCommandSequence) || this.lastCommandSequence < 0)
            throw new Error("lastCommandSequence must be a non-negative integer");
        this.effects.restore(
            snapshot.effects ?? {
                mobilityRemaining: snapshot.mobilityBuffRemaining ?? 0,
                mobilityMultiplier: snapshot.mobilityBuffMultiplier ?? 1,
                lowGravityRemaining: 0,
                gravityScale: 1,
                flightRemaining: 0,
                flightAcceleration: 0,
                flightMaximumSpeed: 0
            }
        );
        this.preserveMovementImpulsePending = snapshot.preserveMovementImpulsePending === true;
        return this.snapshot();
    }
    reset() {
        this.slots = { ...STARTING_SLOTS };
        this.cooldowns = Object.fromEntries(SPELL_SLOT_ORDER.map((slotId) => [slotId, 0]));
        this.charges = {};
        this.lastCommandSequence = 0;
        this.effects.reset();
        this.preserveMovementImpulsePending = false;
        return this.snapshot();
    }
}
