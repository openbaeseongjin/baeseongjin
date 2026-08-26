import { circleBounds, isVisible } from "./RenderViewport.js";
import { CombatStatusEffectPool } from "../game/status-effects/CombatStatusEffectPool.js";

const HEALTH_SAFE = "#22c55e";
const HEALTH_DANGER = "#fb7185";
const TRACK = "rgba(15, 23, 42, 0.88)";
const EDGE = "rgba(226, 232, 240, 0.72)";
const STATUS_PARTICLE_PRESENTATION = Object.freeze({
    progressPhaseRatio: 0.5,
    indexAngleOffset: 1.618,
    opacityBase: 0.45,
    opacityWave: 0.5,
    sizeBaseRatio: 0.82,
    sizeStepRatio: 0.12
});

function clampRatio(value) {
    return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function colliderRadius(actor, fallback = 18) {
    const snapshot = typeof actor?.collider?.snapshot === "function" ? actor.collider.snapshot() : actor?.collider;
    return Number.isFinite(snapshot?.radius)
        ? snapshot.radius
        : Number.isFinite(actor?.radius)
          ? actor.radius
          : fallback;
}

export function resolveHealthStatus(health, maxHealth) {
    const maximum = Math.max(1, Number.isFinite(maxHealth) ? maxHealth : 1);
    const current = Math.max(0, Math.min(maximum, Number.isFinite(health) ? health : 0));
    return Object.freeze({ current, maximum, ratio: current / maximum });
}

export function drawStatusBar(context, { x, y, width, height, ratio, fill, label = null }) {
    context.fillStyle = TRACK;
    context.fillRect(x, y, width, height);
    context.fillStyle = fill;
    context.fillRect(x, y, width * clampRatio(ratio), height);
    context.strokeStyle = EDGE;
    context.lineWidth = 1;
    context.strokeRect(x, y, width, height);
    if (label) {
        context.fillStyle = "#f8fafc";
        context.font = "700 7px ui-monospace, monospace";
        context.textAlign = "right";
        context.textBaseline = "bottom";
        context.fillText(label, x + width, y - 1);
    }
}

function drawPlayerStatus(context, actor) {
    const radius = colliderRadius(actor);
    const width = 56;
    const height = 5;
    const x = actor.position.x - width * 0.5;
    const y = actor.position.y - radius - 23;
    const health = resolveHealthStatus(actor.health, actor.maxHealth);
    drawStatusBar(context, {
        x,
        y,
        width,
        height,
        ratio: health.ratio,
        fill: health.ratio > 0.35 ? HEALTH_SAFE : HEALTH_DANGER
    });
}

function drawEnemyStatus(context, enemy) {
    const radius = colliderRadius(enemy, 20);
    const width = 44;
    const height = 5;
    const x = enemy.position.x - width * 0.5;
    const y = enemy.position.y - radius - 18;
    const health = resolveHealthStatus(enemy.health, enemy.maxHealth);
    drawStatusBar(context, {
        x,
        y,
        width,
        height,
        ratio: health.ratio,
        fill: health.ratio > 0.35 ? HEALTH_SAFE : HEALTH_DANGER
    });
}

function scenePlayers(scene) {
    const localActor = scene.player
        ? {
              ...scene.player,
              health: scene.playerHealth,
              maxHealth: scene.playerMaxHealth
          }
        : null;
    return [localActor, ...(scene.otherPlayers ?? [])].filter(Boolean);
}

function drawStatusParticle(context, particle) {
    context.save();
    context.globalAlpha = particle.opacity;
    context.fillStyle = particle.color;
    context.globalCompositeOperation = particle.glow > 0 ? "lighter" : "source-over";
    if (particle.glow > 0) {
        context.shadowColor = particle.color;
        context.shadowBlur = particle.glow * 12;
    }
    context.translate(particle.position.x, particle.position.y);
    context.rotate(particle.rotation);
    if (particle.shape === "streak") {
        context.fillRect(-particle.size * 2.4, -particle.size * 0.35, particle.size * 4.8, particle.size * 0.7);
    } else if (particle.shape === "dot") {
        context.beginPath();
        context.arc(0, 0, particle.size, 0, Math.PI * 2);
        context.fill();
    } else {
        context.beginPath();
        context.moveTo(0, -particle.size * 1.45);
        context.lineTo(particle.size * 0.72, 0);
        context.lineTo(0, particle.size * 1.45);
        context.lineTo(-particle.size * 0.72, 0);
        context.closePath();
        context.fill();
    }
    context.restore();
}

function sceneBoss(scene) {
    const boss = scene.bossStage ?? null;
    return boss?.body && boss?.statusEffects
        ? { ...boss.body, statusEffects: boss.statusEffects, health: boss.health, maxHealth: boss.maxHealth }
        : null;
}

class StatusParticleSink {
    constructor(context, time) {
        this.context = context;
        this.time = time;
    }

    appendStatusParticles({ effectId, spec, position, radius, remainingSeconds, durationSeconds }) {
        if (!spec) return 0;
        const progress = 1 - remainingSeconds / durationSeconds;
        for (let index = 0; index < spec.count; index += 1) {
            const phase =
                (this.time / spec.lifetime +
                    index / spec.count +
                    progress * STATUS_PARTICLE_PRESENTATION.progressPhaseRatio) %
                1;
            const angle = phase * Math.PI * 2 + index * STATUS_PARTICLE_PRESENTATION.indexAngleOffset;
            const distance = radius + spec.size * 2 + (index % 3) * spec.size;
            const particlePosition = STATUS_PARTICLE_POSITION[spec.motion]?.({
                angle,
                distance,
                index,
                phase,
                position,
                radius,
                spec
            });
            if (!particlePosition) throw new Error(`unsupported status particle motion: ${spec.motion}`);
            drawStatusParticle(this.context, {
                effectId,
                shape: spec.shape,
                color: spec.palette[index % spec.palette.length],
                glow: spec.glow ?? 0,
                opacity:
                    STATUS_PARTICLE_PRESENTATION.opacityBase +
                    Math.sin(phase * Math.PI) * STATUS_PARTICLE_PRESENTATION.opacityWave,
                size:
                    spec.size *
                    (STATUS_PARTICLE_PRESENTATION.sizeBaseRatio +
                        (index % 3) * STATUS_PARTICLE_PRESENTATION.sizeStepRatio),
                rotation: angle + Math.PI * 0.5,
                position: particlePosition
            });
        }
        return spec.count;
    }
}

const STATUS_PARTICLE_POSITION = Object.freeze({
    orbit: ({ angle, distance, position }) => ({
        x: position.x + Math.cos(angle) * distance,
        y: position.y + Math.sin(angle) * distance
    }),
    drift: ({ angle, phase, position, radius, spec }) => ({
        x: position.x + Math.sin(angle) * radius * spec.driftWidthRatio,
        y:
            position.y +
            radius * spec.driftWidthRatio -
            phase * (radius * spec.driftHeightRatio + spec.speed * spec.lifetime)
    })
});

function drawActorStatusEffects(context, actor, presentationTimeSeconds) {
    if (!actor.statusEffects?.effects?.some(({ active }) => active)) return 0;
    const pool = new CombatStatusEffectPool();
    pool.restore(actor.statusEffects);
    return pool.draw({
        position: actor.position,
        radius: colliderRadius(actor),
        velocity: actor.velocity,
        angle: actor.angle ?? 0,
        particles: new StatusParticleSink(context, presentationTimeSeconds)
    });
}

export class ActorStatusRenderer {
    draw({ context, scene, viewport, renderStats, presentationTimeSeconds = 0 }) {
        const players = scenePlayers(scene);
        let drawnPlayers = 0;
        for (const player of players) {
            const radius = colliderRadius(player) + 36;
            if (viewport && !isVisible(viewport, circleBounds(player.position, radius))) continue;
            drawActorStatusEffects(context, player, presentationTimeSeconds);
            drawPlayerStatus(context, player);
            drawnPlayers += 1;
        }
        const enemies = scene.enemies ?? [];
        let drawnEnemies = 0;
        for (const enemy of enemies) {
            const radius = colliderRadius(enemy, 20) + 28;
            if (viewport && !isVisible(viewport, circleBounds(enemy.position, radius))) continue;
            drawActorStatusEffects(context, enemy, presentationTimeSeconds);
            drawEnemyStatus(context, enemy);
            drawnEnemies += 1;
        }
        renderStats?.recordCollection("playerStatusBars", players.length, drawnPlayers);
        renderStats?.recordCollection("enemyStatusBars", enemies.length, drawnEnemies);
        const boss = sceneBoss(scene);
        if (boss && (!viewport || isVisible(viewport, circleBounds(boss.position, colliderRadius(boss) + 28)))) {
            drawActorStatusEffects(context, boss, presentationTimeSeconds);
        }
    }
}

export const ACTOR_STATUS_COLORS = Object.freeze({
    healthSafe: HEALTH_SAFE,
    healthDanger: HEALTH_DANGER
});
