const BOSS_CAMERA_FOCUS_WEIGHT = 0.3;
const BOSS_VICTORY_CAMERA_FOCUS_WEIGHT = 0.85;

export const BOSS_CAMERA_ZOOM_RATIO = 0.55;

const BOSS_CAMERA_FOCUS_STATUS = Object.freeze({ active: true, completed: true });
const BOSS_CAMERA_FOCUS_KIND = Object.freeze({
    "boss-carriage": true,
    "boss-security-hub": true,
    "boss-continuity-core": true,
    "boss-exchange-maintenance-body": true,
    "boss-continuity-warden": true,
    "boss-victory-camera": true
});
const BOSS_CAMERA_VICTORY_KIND = "boss-victory-camera";

function insideBounds(position, bounds) {
    return Boolean(
        position &&
        bounds &&
        position.x >= bounds.x &&
        position.x <= bounds.x + bounds.width &&
        position.y >= bounds.y &&
        position.y <= bounds.y + bounds.height
    );
}

export function localBossStageSnapshot(snapshot, player) {
    return insideBounds(player?.position, snapshot?.arena?.bounds) ? snapshot : null;
}

export function bossCameraFocusPlayer(player, bossStage) {
    if (!BOSS_CAMERA_FOCUS_STATUS[bossStage?.status]) return player;
    const objects = bossStage.presentation?.objects ?? [];
    const focusObject =
        objects.find(({ kind }) => kind === BOSS_CAMERA_VICTORY_KIND) ??
        objects.find(({ kind }) => BOSS_CAMERA_FOCUS_KIND[kind] === true);
    if (!focusObject?.position) return player;
    const focusWeight =
        focusObject.kind === BOSS_CAMERA_VICTORY_KIND ? BOSS_VICTORY_CAMERA_FOCUS_WEIGHT : BOSS_CAMERA_FOCUS_WEIGHT;
    const focusY = focusObject.position.y - Math.max(0, focusObject.suspensionHeight ?? 0) * 0.5;
    return {
        ...player,
        position: {
            x: player.position.x * (1 - focusWeight) + focusObject.position.x * focusWeight,
            y: player.position.y * (1 - focusWeight) + focusY * focusWeight
        }
    };
}
