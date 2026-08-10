export function enterDowned(player, config) {
    if (player.lifeState !== "active") return false;
    player.health = 0;
    player.lifeState = "downed";
    player.downedRemaining = config.downedDuration;
    player.reviveProgress = 0;
    return true;
}

export function updateDownedPlayer(player, dt) {
    if (player.lifeState !== "downed") return;
    player.downedRemaining = Math.max(0, player.downedRemaining - dt);
    if (player.downedRemaining === 0) player.lifeState = "eliminated";
}

export function revivePlayer(player, config) {
    if (player.lifeState !== "downed" || player.downedRemaining <= 0) return false;
    player.lifeState = "active";
    player.health = Math.max(1, Math.round(player.maxHealth * config.reviveHealthFraction));
    player.downedRemaining = 0;
    player.reviveProgress = 0;
    return true;
}

export function updateReviveInteraction(reviver, target, dt, config) {
    if (target.lifeState !== "downed" || target.downedRemaining <= 0) {
        target.reviveProgress = 0;
        return Object.freeze({ status: "unavailable", progress: 0 });
    }
    const reviverPosition = reviver.physics?.position;
    const targetPosition = target.physics?.position;
    const distance =
        reviverPosition && targetPosition
            ? Math.hypot(targetPosition.x - reviverPosition.x, targetPosition.y - reviverPosition.y)
            : Number.POSITIVE_INFINITY;
    if (reviver.lifeState !== "active" || distance > config.reviveRange) {
        target.reviveProgress = 0;
        return Object.freeze({ status: "interrupted", progress: 0, distance });
    }
    target.reviveProgress = Math.min(config.reviveDuration, target.reviveProgress + dt);
    if (target.reviveProgress >= config.reviveDuration) {
        revivePlayer(target, config);
        return Object.freeze({ status: "revived", progress: 1, distance });
    }
    return Object.freeze({ status: "progress", progress: target.reviveProgress / config.reviveDuration, distance });
}

export function isTeamDefeated(players) {
    return players.every((player) => player.lifeState !== "active");
}
