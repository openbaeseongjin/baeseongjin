const BOSS_CAMERA_FOCUS_WEIGHT = 0.3;
const BOSS_VICTORY_CAMERA_FOCUS_WEIGHT = 0.85;

export const BOSS_CAMERA_ZOOM_RATIO = 0.55;

const BOSS_CAMERA_FOCUS_STATUS = Object.freeze({ active: true, completed: true });
const BOSS_CAMERA_FOCUS_KIND = Object.freeze({
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

function finitePosition(position) {
    return Number.isFinite(position?.x) && Number.isFinite(position?.y);
}

function distanceBetween(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

function focusPriority(object, player) {
    if (object.active === false || !finitePosition(object.position)) return Number.NEGATIVE_INFINITY;
    if (object.kind === BOSS_CAMERA_VICTORY_KIND) return Number.POSITIVE_INFINITY;
    if (Number.isFinite(object.cameraPriority)) return object.cameraPriority;
    return BOSS_CAMERA_FOCUS_KIND[object.kind] === true ? 0 : Number.NEGATIVE_INFINITY;
}

function focusObjectForPlayer(player, bossStage) {
    let selected = null;
    let selectedPriority = Number.NEGATIVE_INFINITY;
    let selectedTargetsPlayer = false;
    let selectedDistance = Number.POSITIVE_INFINITY;
    for (const object of bossStage?.presentation?.objects ?? []) {
        const priority = focusPriority(object, player);
        if (priority === Number.NEGATIVE_INFINITY) continue;
        const targetsPlayer = object.targetPlayerId === player.id;
        const distance = distanceBetween(object.position, player.position);
        if (
            priority > selectedPriority ||
            (priority === selectedPriority && Number(targetsPlayer) > Number(selectedTargetsPlayer)) ||
            (priority === selectedPriority && targetsPlayer === selectedTargetsPlayer && distance < selectedDistance)
        ) {
            selected = object;
            selectedPriority = priority;
            selectedTargetsPlayer = targetsPlayer;
            selectedDistance = distance;
        }
    }
    return selected;
}

export function localBossStageSnapshot(snapshot, player) {
    return insideBounds(player?.position, snapshot?.arena?.bounds) ? snapshot : null;
}

export function bossCameraFocusPlayer(player, bossStage) {
    if (!BOSS_CAMERA_FOCUS_STATUS[bossStage?.status]) return player;
    const focusObject = focusObjectForPlayer(player, bossStage);
    if (bossStage.status === "completed" && focusObject?.kind !== BOSS_CAMERA_VICTORY_KIND) return player;
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
