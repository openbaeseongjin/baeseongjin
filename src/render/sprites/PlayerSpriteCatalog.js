import { PlayerSpriteDefinition } from "./PlayerSpriteDefinition.js";

const FRAME_SIZE = Object.freeze({ width: 24, height: 24 });
const ATLAS_ID = "mock";
const frame = (column, row, durationSeconds) =>
    Object.freeze({
        atlasId: ATLAS_ID,
        x: column * FRAME_SIZE.width,
        y: row * FRAME_SIZE.height,
        ...FRAME_SIZE,
        durationSeconds
    });

export const DEFAULT_PLAYER_SPRITE_DEFINITION = new PlayerSpriteDefinition({
    id: "side-view-action-mock-v1",
    atlases: {
        [ATLAS_ID]: {
            source: new URL("../../../assets/sprites/player-action-mock.svg", import.meta.url).href,
            size: { width: 96, height: 96 },
            frameSize: FRAME_SIZE
        }
    },
    destinationSize: { width: 48, height: 48 },
    anchor: { x: 0.5, y: 0.625 },
    offset: { x: 0, y: 0 },
    states: {
        idle: { frames: [frame(0, 0, 0.36), frame(1, 0, 0.36)] },
        run: { frames: [frame(2, 0, 0.1), frame(3, 0, 0.1)] },
        jump: { loop: false, frames: [frame(0, 1, 1)], cue: { offset: { x: 0, y: -3 } } },
        fall: {
            loop: false,
            frames: [frame(1, 1, 1)],
            cue: { scale: { x: 1.08, y: 0.96 }, offset: { x: 0, y: -1 } }
        },
        rope: {
            frames: [frame(2, 1, 0.18), frame(3, 1, 0.18)],
            cue: { scale: { x: 0.96, y: 1.08 }, offset: { x: 0, y: -3 } }
        },
        hit: {
            loop: false,
            frames: [frame(0, 2, 0.08), frame(1, 2, 0.16)],
            cue: { scale: { x: 1.12, y: 0.9 }, offset: { x: -2, y: 1 }, opacity: 0.92 }
        },
        respawn: {
            loop: false,
            frames: [frame(2, 2, 0.15), frame(3, 2, 0.15), frame(0, 3, 0.15)],
            cue: { scale: { x: 1.08, y: 1.08 }, offset: { x: 0, y: -2 }, opacity: 0.96 }
        }
    }
});
