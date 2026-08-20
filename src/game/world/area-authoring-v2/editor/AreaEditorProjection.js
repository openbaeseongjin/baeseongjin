function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y);
}

function centerOfVertices(vertices) {
    if (!Array.isArray(vertices) || vertices.length === 0) return null;
    const total = vertices.reduce((result, point) => ({ x: result.x + point.x, y: result.y + point.y }), {
        x: 0,
        y: 0
    });
    return { x: total.x / vertices.length, y: total.y / vertices.length };
}

function entity({ domain, id, kind, point, path, bounds = null, sourceId = null }) {
    return Object.freeze({
        domain,
        id,
        kind,
        point: Object.freeze({ ...point }),
        path,
        ...(bounds ? { bounds: Object.freeze({ ...bounds }) } : {}),
        ...(sourceId ? { sourceId } : {})
    });
}

function isEnemyObject(object) {
    return Boolean(object?.enemyType || object?.enemySelection || object?.kind === "sentry");
}

function addPointEntities(result, entries, domain, kind, path) {
    for (const [index, entry] of (entries ?? []).entries()) {
        if (!finitePoint(entry)) continue;
        result.push(entity({ domain, id: entry.id, kind, point: entry, path: `${path}/${index}` }));
    }
}

export function collectEditorEntities(spec) {
    const definition = spec?.definition ?? {};
    const result = [];
    if (definition.bounds) {
        result.push(
            entity({
                domain: "bounds",
                id: `${definition.id}:bounds`,
                kind: "bounds",
                point: { x: 0, y: -definition.bounds.height * 0.5 },
                bounds: {
                    x: -definition.bounds.width * 0.5,
                    y: -definition.bounds.height,
                    width: definition.bounds.width,
                    height: definition.bounds.height
                },
                path: "/definition/bounds"
            })
        );
    }
    if (finitePoint(definition.entry)) {
        result.push(
            entity({
                domain: "entry",
                id: definition.entry.id,
                kind: "entry",
                point: definition.entry,
                path: "/definition/entry"
            })
        );
    }
    for (const [index, surface] of (definition.surfaces ?? []).entries()) {
        const point = finitePoint(surface.position) ? surface.position : centerOfVertices(surface.vertices);
        if (!point) continue;
        result.push(
            entity({
                domain: "surfaces",
                id: surface.id,
                kind: "surface",
                point,
                path: `/definition/surfaces/${index}`
            })
        );
    }
    for (const [index, anchor] of (spec?.anchors ?? []).entries()) {
        if (!finitePoint(anchor.target) || !finitePoint(anchor.landmark)) continue;
        result.push(
            entity({
                domain: "anchors",
                id: anchor.landmark.id,
                kind: "anchor",
                point: anchor.landmark,
                path: `/anchors/${index}`,
                sourceId: anchor.target.id
            })
        );
    }
    addPointEntities(result, definition.recoveryPoints, "recoveryRoute", "recovery", "/definition/recoveryPoints");
    addPointEntities(result, definition.routePoints, "recoveryRoute", "route", "/definition/routePoints");
    for (const [index, object] of (definition.objects ?? []).entries()) {
        if (!finitePoint(object.position)) continue;
        if (isEnemyObject(object)) {
            result.push(
                entity({
                    domain: "enemySlots",
                    id: object.id,
                    kind: "enemy",
                    point: object.position,
                    path: `/definition/objects/${index}`
                })
            );
        }
        if (object.kind === "wind-source") {
            result.push(
                entity({
                    domain: "wind",
                    id: object.id,
                    kind: "wind-source",
                    point: object.position,
                    path: `/definition/objects/${index}`,
                    sourceId: object.windZoneId ?? null
                })
            );
        }
    }
    for (const [index, zone] of (definition.windZones ?? []).entries()) {
        if (!zone.bounds) continue;
        result.push(
            entity({
                domain: "wind",
                id: zone.id,
                kind: "wind-zone",
                point: {
                    x: zone.bounds.x + zone.bounds.width * 0.5,
                    y: zone.bounds.y + zone.bounds.height * 0.5
                },
                bounds: zone.bounds,
                path: `/definition/windZones/${index}`
            })
        );
    }
    for (const [index, zone] of (definition.cameraZones ?? []).entries()) {
        result.push(
            entity({
                domain: "camera",
                id: zone.id,
                kind: "camera-zone",
                point: { x: 0, y: (zone.minY + zone.maxY) * 0.5 },
                bounds: {
                    x: -definition.bounds.width * 0.5,
                    y: zone.minY,
                    width: definition.bounds.width,
                    height: zone.maxY - zone.minY
                },
                path: `/definition/cameraZones/${index}`
            })
        );
    }
    return Object.freeze(result);
}

export function worldToScreen(point, view) {
    if (!finitePoint(point) || !finitePoint(view) || !Number.isFinite(view.zoom) || view.zoom <= 0) {
        throw new TypeError("editor-projection-invalid-world-point");
    }
    return Object.freeze({ x: view.x + point.x * view.zoom, y: view.y - point.y * view.zoom });
}

export function screenToWorld(point, view) {
    if (!finitePoint(point) || !finitePoint(view) || !Number.isFinite(view.zoom) || view.zoom <= 0) {
        throw new TypeError("editor-projection-invalid-screen-point");
    }
    return Object.freeze({ x: (point.x - view.x) / view.zoom, y: (view.y - point.y) / view.zoom });
}

export function hitTestEditorEntity(entities, point, radius) {
    if (!Array.isArray(entities) || !finitePoint(point) || !Number.isFinite(radius) || radius < 0) {
        throw new TypeError("editor-hit-test-invalid");
    }
    const candidates = entities
        .map((entry, index) => ({
            entry,
            index,
            distance: Math.hypot(entry.point.x - point.x, entry.point.y - point.y)
        }))
        .filter(({ distance }) => distance <= radius)
        .sort((left, right) => left.distance - right.distance || left.index - right.index);
    return candidates[0]?.entry ?? null;
}

function translateSurface(surface, delta) {
    if (finitePoint(surface.position)) {
        surface.position.x += delta.x;
        surface.position.y += delta.y;
    }
    for (const vertex of surface.vertices ?? []) {
        vertex.x += delta.x;
        vertex.y += delta.y;
    }
}

export function translateEditorEntity(spec, selected, delta) {
    if (!selected || !finitePoint(delta)) throw new TypeError("editor-translate-invalid");
    const next = structuredClone(spec);
    const definition = next.definition;
    if (selected.domain === "anchors") {
        const anchor = next.anchors.find(({ landmark }) => landmark.id === selected.id);
        if (!anchor) throw new TypeError("editor-entity-not-found");
        for (const point of [anchor.landmark, anchor.target]) {
            point.x += delta.x;
            point.y += delta.y;
        }
        return next;
    }
    if (selected.domain === "entry") {
        definition.entry.x += delta.x;
        definition.entry.y += delta.y;
        return next;
    }
    if (selected.domain === "surfaces") {
        const surface = definition.surfaces.find(({ id }) => id === selected.id);
        if (!surface) throw new TypeError("editor-entity-not-found");
        translateSurface(surface, delta);
        return next;
    }
    if (selected.domain === "recoveryRoute") {
        const collections = [definition.recoveryPoints, definition.routePoints];
        const item = collections.flat().find(({ id }) => id === selected.id);
        if (!item) throw new TypeError("editor-entity-not-found");
        item.x += delta.x;
        item.y += delta.y;
        return next;
    }
    if (selected.domain === "enemySlots" || selected.kind === "wind-source") {
        const object = definition.objects.find(({ id }) => id === selected.id);
        if (!object) throw new TypeError("editor-entity-not-found");
        object.position.x += delta.x;
        object.position.y += delta.y;
        return next;
    }
    if (selected.kind === "wind-zone") {
        const zone = definition.windZones.find(({ id }) => id === selected.id);
        if (!zone) throw new TypeError("editor-entity-not-found");
        zone.bounds.x += delta.x;
        zone.bounds.y += delta.y;
        return next;
    }
    if (selected.domain === "camera") {
        const zone = definition.cameraZones.find(({ id }) => id === selected.id);
        if (!zone) throw new TypeError("editor-entity-not-found");
        zone.minY += delta.y;
        zone.maxY += delta.y;
        return next;
    }
    throw new TypeError("editor-entity-translation-forbidden");
}
