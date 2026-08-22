import {
    createAuthoredSeamlessSectorRuntimeWorld,
    SEAMLESS_SECTOR_RUNTIME_REVISION
} from "./sectors/AuthoredSeamlessSectorRuntime.js";

export const DEFAULT_AUTHORED_WORLD_REVISION = SEAMLESS_SECTOR_RUNTIME_REVISION;

export function authoredWorldFactoryForRevision(revision) {
    return revision === SEAMLESS_SECTOR_RUNTIME_REVISION ? createAuthoredSeamlessSectorRuntimeWorld : null;
}

export function createSeamlessAuthoredWorld(options = {}) {
    return createAuthoredSeamlessSectorRuntimeWorld(options);
}
