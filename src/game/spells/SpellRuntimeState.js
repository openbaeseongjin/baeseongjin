import { spellDefinition } from "./SpellCatalog.js";
import { SPELL_ID, SPELL_SLOT_ID, SPELL_SLOT_ORDER } from "./SpellDefinition.js";

const STARTING_SLOTS = Object.freeze({
    [SPELL_SLOT_ID.BASIC_ATTACK]: SPELL_ID.ENERGY_ORB,
    [SPELL_SLOT_ID.UTILITY]: null,
    [SPELL_SLOT_ID.POWER_ATTACK]: null,
    [SPELL_SLOT_ID.MOVEMENT]: SPELL_ID.PHYSICS_DASH
});

export class SpellRuntimeState {
    constructor() {
        this.slots = { ...STARTING_SLOTS };
        this.cooldowns = Object.fromEntries(SPELL_SLOT_ORDER.map((slotId) => [slotId, 0]));
        this.lastCommandSequence = 0;
        this.mobilityBuffRemaining = 0;
        this.mobilityBuffMultiplier = 1;
        this.preserveMovementImpulsePending = false;
    }

    equip(spellId) {
        const definition = spellDefinition(spellId);
        if (!definition) throw new Error(`unknown spell: ${spellId}`);
        this.slots[definition.spec.slotId] = spellId;
        return definition.spec.slotId;
    }

    spellAt(slotId) {
        return spellDefinition(this.slots[slotId]);
    }

    movementMultiplier() {
        return this.mobilityBuffRemaining > 0 ? this.mobilityBuffMultiplier : 1;
    }

    activateMobilityBuff({ durationSeconds, multiplier }) {
        this.mobilityBuffRemaining = durationSeconds;
        this.mobilityBuffMultiplier = multiplier;
    }

    preserveMovementImpulse() {
        this.preserveMovementImpulsePending = true;
    }

    consumeMovementImpulsePreservation() {
        const pending = this.preserveMovementImpulsePending;
        this.preserveMovementImpulsePending = false;
        return pending;
    }

    cast(command, context) {
        const sequence = command?.commandSequence ?? 0;
        if (!Number.isSafeInteger(sequence) || sequence <= this.lastCommandSequence) return null;
        this.lastCommandSequence = sequence;
        const slotId = command.commandKey;
        const definition = this.spellAt(slotId);
        if (!definition || this.cooldowns[slotId] > 0) return null;
        if (
            !definition.cast({
                ...context,
                activateMobilityBuff: (effect) => this.activateMobilityBuff(effect),
                preserveMovementImpulse: () => this.preserveMovementImpulse()
            })
        ) {
            return null;
        }
        this.cooldowns[slotId] = definition.spec.cooldownSeconds;
        return Object.freeze({ slotId, spellId: definition.id, cooldownSeconds: definition.spec.cooldownSeconds });
    }

    advance(dt) {
        for (const slotId of SPELL_SLOT_ORDER) this.cooldowns[slotId] = Math.max(0, this.cooldowns[slotId] - dt);
        this.mobilityBuffRemaining = Math.max(0, this.mobilityBuffRemaining - dt);
        if (this.mobilityBuffRemaining === 0) this.mobilityBuffMultiplier = 1;
    }

    snapshot() {
        return Object.freeze({
            slots: Object.freeze({ ...this.slots }),
            cooldowns: Object.freeze({ ...this.cooldowns }),
            lastCommandSequence: this.lastCommandSequence,
            mobilityBuffRemaining: this.mobilityBuffRemaining,
            mobilityBuffMultiplier: this.mobilityBuffMultiplier,
            preserveMovementImpulsePending: this.preserveMovementImpulsePending
        });
    }

    restore(snapshot = null) {
        if (!snapshot) return this.reset();
        this.slots = Object.fromEntries(
            SPELL_SLOT_ORDER.map((slotId) => {
                const spellId = snapshot.slots?.[slotId];
                const definition = spellId === null ? null : spellDefinition(spellId);
                if (spellId !== null && (!definition || definition.spec.slotId !== slotId)) {
                    throw new Error(`invalid spell slot snapshot: ${slotId}`);
                }
                return [slotId, spellId];
            })
        );
        this.cooldowns = Object.fromEntries(
            SPELL_SLOT_ORDER.map((slotId) => {
                const remaining = snapshot.cooldowns?.[slotId];
                if (!Number.isFinite(remaining) || remaining < 0) {
                    throw new Error(`invalid spell cooldown snapshot: ${slotId}`);
                }
                return [slotId, remaining];
            })
        );
        if (!Number.isSafeInteger(snapshot.lastCommandSequence) || snapshot.lastCommandSequence < 0) {
            throw new Error("lastCommandSequence must be a non-negative integer");
        }
        if (!Number.isFinite(snapshot.mobilityBuffRemaining) || snapshot.mobilityBuffRemaining < 0) {
            throw new Error("mobilityBuffRemaining must be non-negative");
        }
        if (!Number.isFinite(snapshot.mobilityBuffMultiplier) || snapshot.mobilityBuffMultiplier < 1) {
            throw new Error("mobilityBuffMultiplier must be at least one");
        }
        this.lastCommandSequence = snapshot.lastCommandSequence;
        this.mobilityBuffRemaining = snapshot.mobilityBuffRemaining;
        this.mobilityBuffMultiplier = this.mobilityBuffRemaining > 0 ? snapshot.mobilityBuffMultiplier : 1;
        this.preserveMovementImpulsePending = snapshot.preserveMovementImpulsePending === true;
        return this.snapshot();
    }

    reset() {
        this.slots = { ...STARTING_SLOTS };
        this.cooldowns = Object.fromEntries(SPELL_SLOT_ORDER.map((slotId) => [slotId, 0]));
        this.lastCommandSequence = 0;
        this.mobilityBuffRemaining = 0;
        this.mobilityBuffMultiplier = 1;
        this.preserveMovementImpulsePending = false;
        return this.snapshot();
    }
}
