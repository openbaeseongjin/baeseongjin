import { CombatSpellDefinition } from "../SpellDefinition.js";

class ProjectileSpellDefinition extends CombatSpellDefinition {
    cast(context) {
        context.spawnProjectile({
            spellId: this.id,
            targetPolicyId: this.spec.targetPolicyId,
            ...this.spec.projectile,
            direction: context.direction,
            position: context.player.physics.position
        });
        return true;
    }
}

class AreaSpellDefinition extends CombatSpellDefinition {
    cast(context) {
        context.spawnArea({
            spellId: this.id,
            targetPolicyId: this.spec.targetPolicyId,
            ...this.spec.area,
            direction: context.direction,
            position: context.player.physics.position
        });
        return true;
    }
}

class EffectSpellDefinition extends CombatSpellDefinition {
    cast(context) {
        context.activateSpellEffect(this.spec.effect);
        return true;
    }
}

class DashSpellDefinition extends CombatSpellDefinition {
    cast(context) {
        const current = context.player.physics.physicsStepVelocity();
        context.player.physics.applyImpulse({
            x: context.direction.x * this.spec.dash.speed - current.x,
            y: context.direction.y * this.spec.dash.speed - current.y
        });
        context.preserveMovementImpulse();
        return true;
    }
}

export class EnergyOrbSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class LongRangeOrbSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class OverchargedOrbSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class IgnitionOrbSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class ArcaneSlashSpell extends AreaSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class MobilitySurgeSpell extends EffectSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class LowGravitySpell extends EffectSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class CooldownResetSpell extends EffectSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class FreezeBoltSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class GatheringOrbSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class MeteorSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class FrostBurstSpell extends AreaSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class ShatterBombSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class ThermalLaserSpell extends AreaSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class ElectricOrbSpell extends ProjectileSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class PhysicsDashSpell extends DashSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class ChainDashSpell extends DashSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
export class ThrusterFlightSpell extends EffectSpellDefinition {
    cast(context) {
        return super.cast(context);
    }
}
