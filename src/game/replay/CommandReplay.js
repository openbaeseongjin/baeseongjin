function cloneCommand(command) {
    return Object.freeze({
        horizontal: command.horizontal,
        vertical: command.vertical,
        pointer: Object.freeze({ ...command.pointer }),
        viewport: Object.freeze({ ...command.viewport }),
        aimWorld: Object.freeze({ ...command.aimWorld })
    });
}

export class CommandRecorder {
    constructor() {
        this.recordedFrames = [];
    }

    record(dt, command) {
        if (!Number.isFinite(dt) || dt <= 0) throw new Error("CommandRecorder requires a positive finite dt");
        this.recordedFrames.push(Object.freeze({ dt, command: cloneCommand(command) }));
    }

    snapshot() {
        return Object.freeze([...this.recordedFrames]);
    }
}

export function replayCommands(authority, frames) {
    for (const frame of frames) authority.step(frame.dt, frame.command);
    return authority.snapshot();
}

export function createDeterminismDigest(state) {
    return Object.freeze({
        player: Object.freeze({
            position: Object.freeze({ x: state.player.position.x, y: state.player.position.y }),
            velocity: Object.freeze({ x: state.player.velocity.x, y: state.player.velocity.y })
        }),
        health: state.playerHealth,
        lifeState: state.playerLifeState,
        runState: state.runState,
        activeCheckpointId: state.activeCheckpoint?.id ?? null,
        foundationAugment: state.foundationAugment,
        augmentRuntimeState: Object.freeze({ ...state.augmentRuntimeState }),
        enemies: Object.freeze(
            state.enemies
                .map((enemy) =>
                    Object.freeze({
                        id: enemy.id,
                        health: enemy.health,
                        x: enemy.position.x,
                        y: enemy.position.y
                    })
                )
                .sort((left, right) => left.id.localeCompare(right.id))
        ),
        metrics: state.metrics
    });
}
