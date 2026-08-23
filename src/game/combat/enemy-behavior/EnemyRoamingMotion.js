import { Vector2 } from "../../../game-kit/index.js";
import { clamp, directionBetween, moveInDirection, validateBehaviorDt } from "./EnemyBehaviorSupport.js";

const HASH_OFFSET = 2166136261;
const HASH_PRIME = 16777619;
const FULL_ROTATION = Math.PI * 2;

function initialPhase(id) {
    let hash = HASH_OFFSET;
    for (let index = 0; index < id.length; index += 1) {
        hash ^= id.charCodeAt(index);
        hash = Math.imul(hash, HASH_PRIME) >>> 0;
    }
    return (hash / 0xffffffff) * FULL_ROTATION;
}

function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y) ? value : null;
}

export class EnemyRoamingMotion {
    constructor({
        speed = 80,
        roamRadius = 100,
        preferredRange = 300,
        radialResponse = 1.5,
        orbitDirection = 1,
        homePosition = null,
        phase = null
    } = {}) {
        this.speed = speed;
        this.roamRadius = roamRadius;
        this.preferredRange = preferredRange;
        this.radialResponse = radialResponse;
        this.orbitDirection = orbitDirection < 0 ? -1 : 1;
        this.homePosition = finitePoint(homePosition) ? new Vector2(homePosition.x, homePosition.y) : null;
        this.phase = Number.isFinite(phase) ? phase : null;
    }

    advance(enemy, { focusPosition = null, dt = 0 } = {}) {
        validateBehaviorDt(dt);
        if (dt === 0) return false;
        this.homePosition ??= enemy.position.clone();
        this.phase ??= initialPhase(enemy.id);

        const focus = finitePoint(focusPosition);
        if (!focus) return this.#roamAroundHome(enemy, dt);

        const radial = new Vector2(enemy.position.x - focus.x, enemy.position.y - focus.y);
        const distance = radial.length();
        if (distance === 0) radial.set(Math.cos(this.phase), Math.sin(this.phase));
        else radial.scale(1 / distance);
        const tangent = new Vector2(-radial.y * this.orbitDirection, radial.x * this.orbitDirection);
        const rangeError = clamp((distance - this.preferredRange) / this.preferredRange, -1, 1);
        const direction = tangent.add(radial.scale(-rangeError * this.radialResponse)).normalize();
        this.phase = Math.atan2(radial.y, radial.x);
        return moveInDirection(enemy, direction, this.speed * dt, dt);
    }

    #roamAroundHome(enemy, dt) {
        this.phase = (this.phase + (this.speed / this.roamRadius) * dt * this.orbitDirection) % FULL_ROTATION;
        const target = new Vector2(
            this.homePosition.x + Math.cos(this.phase) * this.roamRadius,
            this.homePosition.y + Math.sin(this.phase) * this.roamRadius
        );
        return moveInDirection(
            enemy,
            directionBetween(enemy.predictedSurfacePosition(dt), target),
            this.speed * dt,
            dt
        );
    }

    snapshot() {
        return Object.freeze({
            homePosition: this.homePosition ? Object.freeze({ x: this.homePosition.x, y: this.homePosition.y }) : null,
            phase: this.phase,
            orbitDirection: this.orbitDirection
        });
    }

    restore(snapshot = {}) {
        this.homePosition = finitePoint(snapshot.homePosition)
            ? new Vector2(snapshot.homePosition.x, snapshot.homePosition.y)
            : null;
        this.phase = Number.isFinite(snapshot.phase) ? snapshot.phase : null;
        this.orbitDirection = snapshot.orbitDirection < 0 ? -1 : 1;
    }
}
