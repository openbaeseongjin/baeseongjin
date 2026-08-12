import { SpriteAnimation } from "./SpriteAnimation.js";

export const PLAYER_SPRITE_STATES = Object.freeze(["idle", "run", "jump", "fall", "rope", "hit", "respawn"]);

function positiveSize(value, label, { integer = false } = {}) {
    if (!value || !Number.isFinite(value.width) || !Number.isFinite(value.height)) {
        throw new Error(`${label} requires finite width and height`);
    }
    if (
        value.width <= 0 ||
        value.height <= 0 ||
        (integer && (!Number.isInteger(value.width) || !Number.isInteger(value.height)))
    ) {
        throw new Error(`${label} requires positive${integer ? " integer" : ""} width and height`);
    }
    return Object.freeze({ width: value.width, height: value.height });
}

function finitePoint(value, label, fallback = { x: 0, y: 0 }) {
    const point = value ?? fallback;
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new Error(`${label} requires finite x and y`);
    }
    return Object.freeze({ x: point.x, y: point.y });
}

function normalizeCue(cue = {}, defaultPixelSnap = true) {
    if (!cue || Array.isArray(cue) || typeof cue !== "object") {
        throw new Error("player sprite cue must be an object");
    }
    const scale = finitePoint(cue.scale, "player sprite cue scale", { x: 1, y: 1 });
    if (scale.x <= 0 || scale.y <= 0) throw new Error("player sprite cue scale must be positive");
    const opacity = cue.opacity ?? 1;
    if (!Number.isFinite(opacity) || opacity <= 0 || opacity > 1) {
        throw new Error("player sprite cue opacity must be greater than zero and at most one");
    }
    if (cue.pixelSnap !== undefined && typeof cue.pixelSnap !== "boolean") {
        throw new Error("player sprite cue pixelSnap must be a boolean");
    }
    return Object.freeze({
        scale,
        offset: finitePoint(cue.offset, "player sprite cue offset"),
        opacity,
        pixelSnap: cue.pixelSnap ?? defaultPixelSnap
    });
}

function normalizeAtlases(atlases) {
    if (!atlases || Array.isArray(atlases) || typeof atlases !== "object" || !Object.keys(atlases).length) {
        throw new Error("PlayerSpriteDefinition requires atlas definitions");
    }
    return Object.freeze(
        Object.fromEntries(
            Object.entries(atlases).map(([atlasId, spec]) => {
                if (!atlasId.trim()) throw new Error("player sprite atlas id must be non-empty");
                if (!spec || Array.isArray(spec) || typeof spec !== "object") {
                    throw new Error(`player sprite atlas '${atlasId}' must be an object`);
                }
                if (typeof spec.source !== "string" || !spec.source) {
                    throw new Error(`player sprite atlas '${atlasId}' requires an asset source`);
                }
                const size = positiveSize(spec.size, `player sprite atlas '${atlasId}' size`, { integer: true });
                const frameSize = positiveSize(spec.frameSize, `player sprite atlas '${atlasId}' frameSize`, {
                    integer: true
                });
                if (size.width % frameSize.width || size.height % frameSize.height) {
                    throw new Error(`player sprite atlas '${atlasId}' size must be divisible by frameSize`);
                }
                return [atlasId, Object.freeze({ id: atlasId, source: spec.source, size, frameSize })];
            })
        )
    );
}

function validateFrameBounds(frame, atlases, state) {
    if (!Object.hasOwn(atlases, frame.atlasId)) {
        throw new Error(`player sprite state '${state}' references unknown atlas '${frame.atlasId}'`);
    }
    const atlas = atlases[frame.atlasId];
    const { size: atlasSize, frameSize } = atlas;
    if (
        frame.x < 0 ||
        frame.y < 0 ||
        frame.width !== frameSize.width ||
        frame.height !== frameSize.height ||
        frame.x % frameSize.width !== 0 ||
        frame.y % frameSize.height !== 0 ||
        frame.x + frame.width > atlasSize.width ||
        frame.y + frame.height > atlasSize.height
    ) {
        throw new Error(`player sprite state '${state}' contains a frame outside the declared atlas grid`);
    }
}

function resolveClipState(state, stateSpecs, clips, visited = new Set()) {
    if (clips[state]) return state;
    if (visited.has(state)) throw new Error(`player sprite fallback cycle includes '${state}'`);
    visited.add(state);
    const fallback = stateSpecs[state]?.fallback;
    if (typeof fallback !== "string" || !PLAYER_SPRITE_STATES.includes(fallback)) {
        throw new Error(`player sprite state '${state}' requires frames or an explicit fallback`);
    }
    return resolveClipState(fallback, stateSpecs, clips, visited);
}

export class PlayerSpriteDefinition {
    constructor({ id, atlases, destinationSize, anchor, offset, pixelSnap = true, states } = {}) {
        if (typeof id !== "string" || !id.trim()) throw new Error("PlayerSpriteDefinition requires a non-empty id");
        if (!states || Array.isArray(states) || typeof states !== "object") {
            throw new Error("PlayerSpriteDefinition requires state definitions");
        }
        if (typeof pixelSnap !== "boolean") throw new Error("player sprite pixelSnap must be a boolean");
        const unknownStates = Object.keys(states).filter((state) => !PLAYER_SPRITE_STATES.includes(state));
        if (unknownStates.length) throw new Error(`unknown player sprite states: ${unknownStates.join(", ")}`);

        this.id = id;
        this.atlases = normalizeAtlases(atlases);
        this.destinationSize = positiveSize(destinationSize, "player sprite destinationSize");
        this.anchor = finitePoint(anchor, "player sprite anchor");
        this.offset = finitePoint(offset, "player sprite offset");
        this.pixelSnap = pixelSnap;

        const stateSpecs = Object.fromEntries(
            PLAYER_SPRITE_STATES.map((state) => {
                const spec = states[state];
                if (!spec || Array.isArray(spec) || typeof spec !== "object") {
                    throw new Error(`player sprite state '${state}' requires a definition`);
                }
                if (spec.fallback !== undefined && spec.frames !== undefined) {
                    throw new Error(`player sprite state '${state}' cannot declare both frames and fallback`);
                }
                const normalized = { cue: normalizeCue(spec.cue, this.pixelSnap) };
                if (spec.frames !== undefined) {
                    if (!Array.isArray(spec.frames)) {
                        throw new Error(`player sprite state '${state}' frames must be an array`);
                    }
                    normalized.frames = Object.freeze(spec.frames.map((item) => Object.freeze({ ...item })));
                    if (spec.loop !== undefined) normalized.loop = spec.loop;
                } else {
                    normalized.fallback = spec.fallback;
                }
                return [state, Object.freeze(normalized)];
            })
        );
        const clips = {};
        for (const state of PLAYER_SPRITE_STATES) {
            const spec = stateSpecs[state];
            if (spec.frames === undefined) continue;
            const clip = new SpriteAnimation({ id: state, loop: spec.loop ?? true, frames: spec.frames });
            for (const frame of clip.frames) validateFrameBounds(frame, this.atlases, state);
            clips[state] = clip;
        }

        const presentations = {};
        for (const state of PLAYER_SPRITE_STATES) {
            const clipState = resolveClipState(state, stateSpecs, clips);
            const cue = stateSpecs[state].cue;
            presentations[state] = Object.freeze({
                state,
                clipState,
                clip: clips[clipState],
                size: Object.freeze({
                    width: this.destinationSize.width * cue.scale.x,
                    height: this.destinationSize.height * cue.scale.y
                }),
                anchor: this.anchor,
                offset: Object.freeze({ x: this.offset.x + cue.offset.x, y: this.offset.y + cue.offset.y }),
                opacity: cue.opacity,
                pixelSnap: cue.pixelSnap
            });
        }
        this.clips = Object.freeze({ ...clips });
        this.states = Object.freeze(stateSpecs);
        this.presentations = Object.freeze(presentations);
        Object.freeze(this);
    }

    presentationFor(state) {
        const presentation = this.presentations[state];
        if (!presentation) throw new Error(`unknown player sprite state '${state}'`);
        return presentation;
    }
}
