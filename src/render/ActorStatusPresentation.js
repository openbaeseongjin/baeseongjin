import { circleBounds, isVisible } from "./RenderViewport.js";

const HEALTH_SAFE = "#22c55e";
const HEALTH_DANGER = "#fb7185";
const ACTION_READY = "#67e8f9";
const TRACK = "rgba(15, 23, 42, 0.88)";
const EDGE = "rgba(226, 232, 240, 0.72)";

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

export function resolveActionCooldownStatus(actionState) {
    const modifierIds = actionState?.loadout?.modifierIds ?? [];
    const maximum = modifierIds.includes("extra-charge") ? 2 : 1;
    const charges = Math.max(0, Math.min(maximum, actionState?.chargesRemaining ?? maximum));
    const remaining = Math.max(0, actionState?.rechargeRemaining ?? 0);
    const duration = Math.max(0, actionState?.rechargeDuration ?? remaining);
    const ratio = duration > 0 ? clampRatio(1 - remaining / duration) : 1;
    return Object.freeze({ charges, maximum, remaining, duration, ratio });
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
    const cooldown = resolveActionCooldownStatus(actor.actionState);
    drawStatusBar(context, {
        x,
        y,
        width,
        height,
        ratio: health.ratio,
        fill: health.ratio > 0.35 ? HEALTH_SAFE : HEALTH_DANGER
    });
    drawStatusBar(context, {
        x,
        y: y + height + 2,
        width,
        height,
        ratio: cooldown.ratio,
        fill: ACTION_READY,
        label: `${cooldown.charges}/${cooldown.maximum}`
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

export class ActorStatusRenderer {
    draw({ context, scene, viewport, renderStats }) {
        const localActor = scene.player
            ? {
                  ...scene.player,
                  health: scene.playerHealth,
                  maxHealth: scene.playerMaxHealth,
                  actionState: scene.actionState
              }
            : null;
        const players = [localActor, ...(scene.otherPlayers ?? [])].filter(Boolean);
        let drawnPlayers = 0;
        for (const player of players) {
            const radius = colliderRadius(player) + 36;
            if (viewport && !isVisible(viewport, circleBounds(player.position, radius))) continue;
            drawPlayerStatus(context, player);
            drawnPlayers += 1;
        }
        const enemies = scene.enemies ?? [];
        let drawnEnemies = 0;
        for (const enemy of enemies) {
            const radius = colliderRadius(enemy, 20) + 28;
            if (viewport && !isVisible(viewport, circleBounds(enemy.position, radius))) continue;
            drawEnemyStatus(context, enemy);
            drawnEnemies += 1;
        }
        renderStats?.recordCollection("playerStatusBars", players.length, drawnPlayers);
        renderStats?.recordCollection("enemyStatusBars", enemies.length, drawnEnemies);
    }
}

export const ACTOR_STATUS_COLORS = Object.freeze({
    healthSafe: HEALTH_SAFE,
    healthDanger: HEALTH_DANGER,
    actionReady: ACTION_READY
});
