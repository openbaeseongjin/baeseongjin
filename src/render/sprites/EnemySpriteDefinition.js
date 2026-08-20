import { ENEMY_PRESENTATION_DEFINITIONS } from "../EnemyPresentationState.js";
import { SpriteAnimation } from "./SpriteAnimation.js";

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

function normalizeAtlases(atlases) {
    if (!atlases || Array.isArray(atlases) || typeof atlases !== "object" || !Object.keys(atlases).length) {
        throw new Error("EnemySpriteDefinition requires atlas definitions");
    }
    return Object.freeze(
        Object.fromEntries(
            Object.entries(atlases).map(([atlasId, spec]) => {
                if (!atlasId.trim()) throw new Error("enemy sprite atlas id must be non-empty");
                if (!spec || Array.isArray(spec) || typeof spec !== "object") {
                    throw new Error(`enemy sprite atlas '${atlasId}' must be an object`);
                }
                if (typeof spec.source !== "string" || !spec.source) {
                    throw new Error(`enemy sprite atlas '${atlasId}' requires an asset source`);
                }
                const size = positiveSize(spec.size, `enemy sprite atlas '${atlasId}' size`, { integer: true });
                const frameSize = positiveSize(spec.frameSize, `enemy sprite atlas '${atlasId}' frameSize`, {
                    integer: true
                });
                if (size.width % frameSize.width || size.height % frameSize.height) {
                    throw new Error(`enemy sprite atlas '${atlasId}' size must be divisible by frameSize`);
                }
                return [atlasId, Object.freeze({ id: atlasId, source: spec.source, size, frameSize })];
            })
        )
    );
}

function normalizeFrame(frame, atlases, enemyType, state) {
    if (!frame || Array.isArray(frame) || typeof frame !== "object") {
        throw new Error(`enemy sprite '${enemyType}' state '${state}' frame must be an object`);
    }
    if (!Object.hasOwn(atlases, frame.atlasId)) {
        throw new Error(`enemy sprite '${enemyType}' state '${state}' references unknown atlas '${frame.atlasId}'`);
    }
    const atlas = atlases[frame.atlasId];
    if (
        !Number.isInteger(frame.x) ||
        !Number.isInteger(frame.y) ||
        frame.x < 0 ||
        frame.y < 0 ||
        frame.width !== atlas.frameSize.width ||
        frame.height !== atlas.frameSize.height ||
        frame.x % atlas.frameSize.width !== 0 ||
        frame.y % atlas.frameSize.height !== 0 ||
        frame.x + frame.width > atlas.size.width ||
        frame.y + frame.height > atlas.size.height
    ) {
        throw new Error(`enemy sprite '${enemyType}' state '${state}' frame is outside the declared atlas grid`);
    }
    return Object.freeze({ ...frame });
}

function resolveClipState(state, stateSpecs, clips, enemyType, visited = new Set()) {
    if (clips[state]) return state;
    if (visited.has(state)) throw new Error(`enemy sprite '${enemyType}' fallback cycle includes '${state}'`);
    visited.add(state);
    const spec = stateSpecs[state];
    if (typeof spec.fallback !== "string" || !Object.hasOwn(stateSpecs, spec.fallback)) {
        throw new Error(`enemy sprite '${enemyType}' state '${state}' requires frames or a valid fallback`);
    }
    return resolveClipState(spec.fallback, stateSpecs, clips, enemyType, visited);
}

function normalizeAimLayer(value, atlases, enemyType) {
    if (value === undefined) return null;
    if (!value || Array.isArray(value) || typeof value !== "object") {
        throw new Error(`enemy sprite '${enemyType}' aimLayer must be an object`);
    }
    if (value.orientation !== "upright-aim") {
        throw new Error(`enemy sprite '${enemyType}' aimLayer.orientation must be 'upright-aim'`);
    }
    return Object.freeze({
        orientation: value.orientation,
        frame: normalizeFrame(value.frame, atlases, enemyType, "aimLayer")
    });
}

function normalizeEnemy(enemyType, spec, atlases) {
    if (!Object.hasOwn(ENEMY_PRESENTATION_DEFINITIONS, enemyType)) {
        throw new Error(`unknown enemy sprite type '${enemyType}'`);
    }
    if (!spec || Array.isArray(spec) || typeof spec !== "object") {
        throw new Error(`enemy sprite '${enemyType}' must be an object`);
    }
    const render = spec.render;
    if (!render || Array.isArray(render) || typeof render !== "object") {
        throw new Error(`enemy sprite '${enemyType}' requires render settings`);
    }
    if (render.facing !== "right") throw new Error(`enemy sprite '${enemyType}' render.facing must be 'right'`);
    if (typeof render.pixelSnap !== "boolean") {
        throw new Error(`enemy sprite '${enemyType}' render.pixelSnap must be a boolean`);
    }
    const states = spec.states;
    if (!states || Array.isArray(states) || typeof states !== "object") {
        throw new Error(`enemy sprite '${enemyType}' requires state definitions`);
    }
    const expectedStates = ENEMY_PRESENTATION_DEFINITIONS[enemyType].states;
    const missingStates = expectedStates.filter((state) => !Object.hasOwn(states, state));
    const unknownStates = Object.keys(states).filter((state) => !expectedStates.includes(state));
    if (missingStates.length)
        throw new Error(`enemy sprite '${enemyType}' is missing states: ${missingStates.join(", ")}`);
    if (unknownStates.length)
        throw new Error(`enemy sprite '${enemyType}' has unknown states: ${unknownStates.join(", ")}`);

    const stateSpecs = Object.freeze(
        Object.fromEntries(
            expectedStates.map((state) => {
                const stateSpec = states[state];
                if (!stateSpec || Array.isArray(stateSpec) || typeof stateSpec !== "object") {
                    throw new Error(`enemy sprite '${enemyType}' state '${state}' must be an object`);
                }
                if (stateSpec.frames !== undefined && stateSpec.fallback !== undefined) {
                    throw new Error(`enemy sprite '${enemyType}' state '${state}' cannot declare frames and fallback`);
                }
                if (stateSpec.frames !== undefined && !Array.isArray(stateSpec.frames)) {
                    throw new Error(`enemy sprite '${enemyType}' state '${state}' frames must be an array`);
                }
                return [
                    state,
                    Object.freeze({
                        frames:
                            stateSpec.frames === undefined
                                ? undefined
                                : Object.freeze(
                                      stateSpec.frames.map((frame) => normalizeFrame(frame, atlases, enemyType, state))
                                  ),
                        loop: stateSpec.loop,
                        fallback: stateSpec.fallback
                    })
                ];
            })
        )
    );
    const size = positiveSize(render.size, `enemy sprite '${enemyType}' render.size`);
    const anchor = finitePoint(render.anchor, `enemy sprite '${enemyType}' render.anchor`);
    const offset = finitePoint(render.offset, `enemy sprite '${enemyType}' render.offset`);
    const aimLayer = normalizeAimLayer(render.aimLayer, atlases, enemyType);
    const clips = {};
    for (const state of expectedStates) {
        const stateSpec = stateSpecs[state];
        if (stateSpec.frames === undefined) continue;
        clips[state] = new SpriteAnimation({
            id: `${enemyType}:${state}`,
            loop: stateSpec.loop ?? true,
            frames: stateSpec.frames
        });
    }
    const presentations = Object.freeze(
        Object.fromEntries(
            expectedStates.map((state) => {
                const clipState = resolveClipState(state, stateSpecs, clips, enemyType);
                return [
                    state,
                    Object.freeze({
                        enemyType,
                        state,
                        clipState,
                        clip: clips[clipState],
                        size,
                        anchor,
                        offset,
                        opacity: 1,
                        pixelSnap: render.pixelSnap,
                        aimLayer
                    })
                ];
            })
        )
    );
    return Object.freeze({
        enemyType,
        size,
        anchor,
        offset,
        pixelSnap: render.pixelSnap,
        aimLayer,
        states: stateSpecs,
        clips: Object.freeze({ ...clips }),
        presentations
    });
}

export class EnemySpriteDefinition {
    constructor({ id, atlases, aliases = {}, enemies } = {}) {
        if (typeof id !== "string" || !id.trim()) throw new Error("EnemySpriteDefinition requires a non-empty id");
        if (!enemies || Array.isArray(enemies) || typeof enemies !== "object" || !Object.keys(enemies).length) {
            throw new Error("EnemySpriteDefinition requires enemy definitions");
        }
        if (!aliases || Array.isArray(aliases) || typeof aliases !== "object") {
            throw new Error("enemy sprite aliases must be an object");
        }
        this.id = id;
        this.atlases = normalizeAtlases(atlases);
        this.enemies = Object.freeze(
            Object.fromEntries(
                Object.entries(enemies).map(([enemyType, spec]) => [
                    enemyType,
                    normalizeEnemy(enemyType, spec, this.atlases)
                ])
            )
        );
        this.aliases = Object.freeze(
            Object.fromEntries(
                Object.entries(aliases).map(([alias, target]) => {
                    if (!Object.hasOwn(ENEMY_PRESENTATION_DEFINITIONS, alias)) {
                        throw new Error(`unknown enemy sprite alias '${alias}'`);
                    }
                    if (Object.hasOwn(this.enemies, alias)) {
                        throw new Error(`enemy sprite alias '${alias}' conflicts with an enemy definition`);
                    }
                    if (typeof target !== "string" || !Object.hasOwn(this.enemies, target)) {
                        throw new Error(`enemy sprite alias '${alias}' references unknown target '${target}'`);
                    }
                    return [alias, target];
                })
            )
        );
        Object.freeze(this);
    }

    canonicalEnemyType(enemyType) {
        return this.aliases[enemyType] ?? enemyType;
    }

    supports(enemyType) {
        return Object.hasOwn(this.enemies, this.canonicalEnemyType(enemyType));
    }

    presentationFor(enemyType, state) {
        const canonicalEnemyType = this.canonicalEnemyType(enemyType);
        const enemy = this.enemies[canonicalEnemyType];
        if (!enemy) return null;
        const presentation = enemy.presentations[state];
        if (!presentation) throw new Error(`unknown enemy sprite state '${state}' for '${enemyType}'`);
        return presentation;
    }
}
