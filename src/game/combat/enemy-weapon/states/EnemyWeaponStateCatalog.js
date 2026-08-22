import { ENEMY_ATTACK_STATE } from "../EnemyWeaponDefinition.js";
import { AcquireEnemyWeaponState } from "./AcquireEnemyWeaponState.js";
import { CooldownEnemyWeaponState } from "./CooldownEnemyWeaponState.js";
import { FireEnemyWeaponState } from "./FireEnemyWeaponState.js";
import { IdleEnemyWeaponState } from "./IdleEnemyWeaponState.js";
import { LockEnemyWeaponState } from "./LockEnemyWeaponState.js";
import { TrackEnemyWeaponState } from "./TrackEnemyWeaponState.js";

export const ENEMY_WEAPON_STATE = Object.freeze({
    [ENEMY_ATTACK_STATE.IDLE]: Object.freeze(new IdleEnemyWeaponState()),
    [ENEMY_ATTACK_STATE.ACQUIRE]: Object.freeze(new AcquireEnemyWeaponState()),
    [ENEMY_ATTACK_STATE.TRACK]: Object.freeze(new TrackEnemyWeaponState()),
    [ENEMY_ATTACK_STATE.LOCK]: Object.freeze(new LockEnemyWeaponState()),
    [ENEMY_ATTACK_STATE.FIRE]: Object.freeze(new FireEnemyWeaponState()),
    [ENEMY_ATTACK_STATE.COOLDOWN]: Object.freeze(new CooldownEnemyWeaponState())
});

export function enemyWeaponStateById(id) {
    return ENEMY_WEAPON_STATE[id] ?? null;
}
