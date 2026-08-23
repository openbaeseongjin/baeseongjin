import { BaseGameObjectManager } from "./BaseGameObjectManager.js";

const EMPTY_OBJECTS = Object.freeze([]);

function freezeGroups(groups) {
    for (const key of Object.keys(groups)) groups[key] = Object.freeze(groups[key]);
    return Object.freeze(groups);
}

function groupBy(objects, keyFor) {
    const groups = Object.create(null);
    for (const object of objects) {
        const key = keyFor(object);
        if (key === null || key === undefined) continue;
        const values = groups[key] ?? [];
        values.push(object);
        groups[key] = values;
    }
    return freezeGroups(groups);
}

export class WorldObjectManager extends BaseGameObjectManager {
    constructor(objects = []) {
        super("world-object", objects);
        this.byKind = groupBy(this.all, ({ kind }) => kind);
        this.byArea = groupBy(this.all, ({ areaId, landmarkId }) => landmarkId ?? areaId);
    }

    get mutable() {
        return false;
    }

    get allowsDuplicateIds() {
        return true;
    }

    ofKind(kind) {
        return this.byKind[kind] ?? EMPTY_OBJECTS;
    }

    forArea(areaId) {
        return this.byArea[areaId] ?? EMPTY_OBJECTS;
    }
}
