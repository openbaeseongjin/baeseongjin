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

export function isTeamDefeated(players) {
    return players.every((player) => player.lifeState !== "active");
}
