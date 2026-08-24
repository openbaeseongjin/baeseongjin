import { ElectrifiedStatusEffect } from "./ElectrifiedStatusEffect.js";
import { FrozenStatusEffect } from "./FrozenStatusEffect.js";
import { IgnitedStatusEffect } from "./IgnitedStatusEffect.js";
import { HighVoltageStatusEffect } from "./HighVoltageStatusEffect.js";
import { STATUS_EFFECT_ID, STATUS_EFFECT_IDS } from "./StatusEffectDefinition.js";

const STATUS_EFFECT_FACTORY = Object.freeze({
    [STATUS_EFFECT_ID.ELECTRIFIED]: () => new ElectrifiedStatusEffect(),
    [STATUS_EFFECT_ID.HIGH_VOLTAGE]: () => new HighVoltageStatusEffect(),
    [STATUS_EFFECT_ID.IGNITED]: () => new IgnitedStatusEffect(),
    [STATUS_EFFECT_ID.FROZEN]: () => new FrozenStatusEffect()
});

export class CombatStatusEffectPool {
    constructor(effects = STATUS_EFFECT_IDS.map((id) => STATUS_EFFECT_FACTORY[id]())) {
        this.effects = Object.freeze([...effects]);
        this.effectsById = Object.freeze(Object.fromEntries(this.effects.map((effect) => [effect.id, effect])));
        if (Object.keys(this.effectsById).length !== this.effects.length) {
            throw new Error("status effect pool requires unique effect ids");
        }
    }

    effect(id) {
        return this.effectsById[id] ?? null;
    }

    apply(id, source = {}) {
        const effect = this.effect(id);
        if (!effect) throw new Error(`unsupported status effect: ${id}`);
        return effect.apply(source);
    }

    canAct() {
        return this.effects.every((effect) => effect.canAct());
    }

    advance(dt) {
        return Object.freeze(
            this.effects.flatMap((effect) =>
                effect.advance(dt).map((outcome) => Object.freeze({ effectId: effect.id, ...outcome }))
            )
        );
    }

    draw(renderState) {
        let emitted = 0;
        for (const effect of this.effects) emitted += effect.draw(renderState);
        return emitted;
    }

    snapshot() {
        return Object.freeze({ effects: Object.freeze(this.effects.map((effect) => effect.snapshot())) });
    }

    restore(snapshot = null) {
        const byId = Object.freeze(Object.fromEntries((snapshot?.effects ?? []).map((effect) => [effect.id, effect])));
        for (const effect of this.effects) effect.restore(byId[effect.id] ?? null);
        return this.snapshot();
    }

    reset() {
        for (const effect of this.effects) effect.reset();
        return this.snapshot();
    }
}
