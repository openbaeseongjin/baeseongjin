const DIRECT_PLAYER_PURSUIT_TYPES = new Set(["pursuit-drone-t1", "swarm-drone-t1"]);

export function enemyImpactDisplacementEnabled(enemyType) {
    return DIRECT_PLAYER_PURSUIT_TYPES.has(enemyType);
}

export function enemyMobilityKind(enemyType) {
    return enemyImpactDisplacementEnabled(enemyType) ? "direct-player-pursuit" : "authored-position";
}
