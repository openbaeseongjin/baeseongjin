// REFERENCE SCAFFOLD
// Player별 target entry edge를 1회 Hit로 제한한다.

export class BossTargetContactState {
    constructor() {
        this.overlapByPlayerId = new Map();
    }

    reset() {
        this.overlapByPlayerId.clear();
    }

    entered(playerId, isOverlapping) {
        const wasOverlapping = this.overlapByPlayerId.get(playerId) === true;
        this.overlapByPlayerId.set(playerId, isOverlapping === true);
        return isOverlapping === true && !wasOverlapping;
    }

    clearPlayer(playerId) {
        this.overlapByPlayerId.delete(playerId);
    }
}
