import { Vector2 } from "../../../game-kit/index.js";
import { selectNearestPlayer } from "../CombatTargeting.js";
import { ENEMY_BEHAVIOR_KIND, SWARM_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";

const ZERO = 0;
const UNIT = 1;

function vectorSnapshot(vector) {
    return Object.freeze({ x: vector?.x ?? ZERO, y: vector?.y ?? ZERO });
}

function memberSnapshot(enemy) {
    const behavior = enemy.enemyBehaviorSnapshot?.() ?? null;
    const recoilDirection =
        behavior?.kind === ENEMY_BEHAVIOR_KIND.SWARM && behavior.state === SWARM_BEHAVIOR_STATE.RECOIL
            ? behavior.recoilDirection
            : null;
    return Object.freeze({
        id: enemy.id,
        position: vectorSnapshot(enemy.position),
        velocity: vectorSnapshot(enemy.velocity),
        recoilDirection: recoilDirection ? vectorSnapshot(recoilDirection) : null
    });
}

function averageVector(vectors) {
    const average = new Vector2();
    for (const vector of vectors) average.add(vector);
    return vectors.length > ZERO ? average.scale(UNIT / vectors.length) : average;
}

function normalizedDirection(from, to) {
    return new Vector2(to.x - from.x, to.y - from.y).normalize();
}

function addWeighted(target, direction, weight) {
    if (direction.length() > ZERO && weight > ZERO) target.add(direction.clone().normalize().scale(weight));
    return target;
}

function limitedTurn(currentVelocity, desiredDirection, maximumRadians) {
    const current = new Vector2(currentVelocity.x, currentVelocity.y);
    if (current.length() === ZERO || desiredDirection.length() === ZERO || maximumRadians <= ZERO) {
        return desiredDirection.normalize();
    }
    current.normalize();
    const desired = desiredDirection.clone().normalize();
    const angle = Math.acos(Math.max(-UNIT, Math.min(UNIT, current.dot(desired))));
    if (angle <= maximumRadians) return desired;
    const cross = current.x * desired.y - current.y * desired.x;
    const signedAngle = cross < ZERO ? -maximumRadians : maximumRadians;
    const cosine = Math.cos(signedAngle);
    const sine = Math.sin(signedAngle);
    return new Vector2(current.x * cosine - current.y * sine, current.x * sine + current.y * cosine).normalize();
}

export class SwarmFlock {
    #membersById;

    constructor({ id, members, targets }) {
        this.id = id;
        this.members = Object.freeze(
            [...members].sort((left, right) => left.id.localeCompare(right.id)).map((member) => memberSnapshot(member))
        );
        this.targets = Object.freeze([...targets]);
        this.#membersById = new Map(this.members.map((member) => [member.id, member]));
        this.center = averageVector(this.members.map(({ position }) => new Vector2(position.x, position.y)));
        this.averageVelocity = averageVector(this.members.map(({ velocity }) => new Vector2(velocity.x, velocity.y)));
        this.maneuverDirection = averageVector(
            this.members
                .filter(({ recoilDirection }) => recoilDirection !== null)
                .map(({ recoilDirection }) => new Vector2(recoilDirection.x, recoilDirection.y))
        ).normalize();
    }

    targetWithin(range) {
        return selectNearestPlayer(this.center, this.targets, range);
    }

    chaseDirection(
        memberId,
        target,
        {
            neighborRadius,
            separationDistance,
            separationWeight,
            alignmentWeight,
            cohesionWeight,
            targetWeight,
            maneuverWeight,
            maximumTurnRadians
        }
    ) {
        const member = this.#membersById.get(memberId);
        if (!member || !target) return new Vector2();
        const memberPosition = new Vector2(member.position.x, member.position.y);
        const separation = new Vector2();
        const neighborVelocities = [];
        for (const neighbor of this.members) {
            if (neighbor.id === member.id) continue;
            const distance = memberPosition.distanceTo(neighbor.position);
            if (distance > neighborRadius) continue;
            neighborVelocities.push(new Vector2(neighbor.velocity.x, neighbor.velocity.y));
            if (distance >= separationDistance) continue;
            const away = normalizedDirection(neighbor.position, member.position);
            if (away.length() === ZERO) away.x = member.id.localeCompare(neighbor.id) < ZERO ? -UNIT : UNIT;
            separation.add(away.scale(UNIT - distance / separationDistance));
        }
        const alignment = (
            neighborVelocities.length > ZERO ? averageVector(neighborVelocities) : this.averageVelocity.clone()
        ).normalize();
        const cohesion = normalizedDirection(member.position, this.center);
        const targetAttraction = normalizedDirection(this.center, target.physics.position);
        const desired = new Vector2();
        addWeighted(desired, separation, separationWeight);
        addWeighted(desired, alignment, alignmentWeight);
        addWeighted(desired, cohesion, cohesionWeight);
        addWeighted(desired, targetAttraction, targetWeight);
        addWeighted(desired, this.maneuverDirection, maneuverWeight);
        return limitedTurn(member.velocity, desired, maximumTurnRadians);
    }
}

export class SwarmFlockRegistry {
    #flocksById;

    constructor(enemies, targets) {
        const membersByGroupId = new Map();
        for (const enemy of enemies) {
            if (enemy.health <= ZERO || typeof enemy.swarmGroupId !== "string" || enemy.swarmGroupId.length === ZERO) {
                continue;
            }
            const members = membersByGroupId.get(enemy.swarmGroupId) ?? [];
            members.push(enemy);
            membersByGroupId.set(enemy.swarmGroupId, members);
        }
        this.#flocksById = new Map(
            [...membersByGroupId.entries()]
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([id, members]) => [id, new SwarmFlock({ id, members, targets })])
        );
    }

    get(groupId) {
        return this.#flocksById.get(groupId) ?? null;
    }
}
