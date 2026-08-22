export const ENTRY_SUPPORT_GAP = 32;
const ENTRY_SUPPORT_SIZE = Object.freeze({ width: 192, height: 32 });

export class AreaEntryEditorDefinition {
    create({ areaId, position }) {
        const topY = position.y + ENTRY_SUPPORT_GAP;
        const halfWidth = ENTRY_SUPPORT_SIZE.width * 0.5;
        return {
            entry: { id: `${areaId}:entry`, x: position.x, y: position.y },
            supportSurface: {
                id: `${areaId}:entry-deck`,
                kind: "safe-deck",
                oneWay: true,
                grappleable: true,
                coordinateAnchor: "top-center",
                position: { x: position.x, y: topY },
                vertices: [
                    { x: position.x - halfWidth, y: topY },
                    { x: position.x + halfWidth, y: topY },
                    { x: position.x + halfWidth, y: topY + ENTRY_SUPPORT_SIZE.height },
                    { x: position.x - halfWidth, y: topY + ENTRY_SUPPORT_SIZE.height }
                ]
            }
        };
    }

    install(definition, position) {
        const current = AreaEntryEditorComponent.from(definition);
        const created = this.create({ areaId: definition.id, position });
        const removableIds = new Set([current?.supportSurface.id, created.supportSurface.id].filter(Boolean));
        definition.surfaces = definition.surfaces.filter(({ id }) => !removableIds.has(id));
        definition.entry = created.entry;
        definition.surfaces.push(created.supportSurface);
        return created;
    }
}

export const AREA_ENTRY_EDITOR_DEFINITION = Object.freeze(new AreaEntryEditorDefinition());

function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y);
}

function surfaceBounds(surface) {
    const vertices = surface?.vertices ?? [];
    if (vertices.length === 0) return null;
    const x = vertices.map((vertex) => vertex.x);
    const y = vertices.map((vertex) => vertex.y);
    return {
        minX: Math.min(...x),
        maxX: Math.max(...x),
        topY: Math.min(...y)
    };
}

function supportSurfaceForEntry(definition) {
    const entry = definition?.entry;
    if (!finitePoint(entry)) return null;
    return (
        (definition.surfaces ?? [])
            .map((surface, index) => ({ surface, index, bounds: surfaceBounds(surface) }))
            .filter(
                ({ bounds }) => bounds && entry.x >= bounds.minX && entry.x <= bounds.maxX && bounds.topY >= entry.y
            )
            .sort(
                (left, right) =>
                    Math.abs(left.bounds.topY - entry.y - ENTRY_SUPPORT_GAP) -
                        Math.abs(right.bounds.topY - entry.y - ENTRY_SUPPORT_GAP) || left.index - right.index
            )[0]?.surface ?? null
    );
}

function translatePoint(point, delta) {
    point.x += delta.x;
    point.y += delta.y;
}

function translateSurface(surface, delta) {
    if (finitePoint(surface.position)) translatePoint(surface.position, delta);
    for (const vertex of surface.vertices ?? []) translatePoint(vertex, delta);
}

function replaceById(entries, replacement) {
    const index = entries.findIndex(({ id }) => id === replacement.id);
    if (index >= 0) entries[index] = structuredClone(replacement);
}

export class AreaEntryEditorComponent {
    static from(definition) {
        const supportSurface = supportSurfaceForEntry(definition);
        return supportSurface ? new AreaEntryEditorComponent({ definition, supportSurface }) : null;
    }

    static fromSupport(definition, supportSurfaceId) {
        const supportSurface = definition?.surfaces?.find(({ id }) => id === supportSurfaceId);
        return supportSurface && finitePoint(definition.entry)
            ? new AreaEntryEditorComponent({ definition, supportSurface })
            : null;
    }

    constructor({ definition, supportSurface }) {
        this.definition = definition;
        this.supportSurface = supportSurface;
    }

    get id() {
        return this.definition.entry.id;
    }

    get point() {
        return this.definition.entry;
    }

    get supportTopY() {
        return surfaceBounds(this.supportSurface).topY;
    }

    ownsSurface(surfaceId) {
        return surfaceId === this.supportSurface.id;
    }

    isGrounded() {
        return this.supportTopY - this.point.y === ENTRY_SUPPORT_GAP;
    }

    translate(delta) {
        translatePoint(this.definition.entry, delta);
        translateSurface(this.supportSurface, delta);
    }

    synchronizeFrom(baseline) {
        const derivedDefinition = structuredClone(baseline.definition);
        const derived = AreaEntryEditorComponent.fromSupport(derivedDefinition, baseline.supportSurface.id);
        derived.translate({
            x: this.point.x - baseline.point.x,
            y: this.point.y - baseline.point.y
        });
        this.definition.entry = structuredClone(derived.definition.entry);
        replaceById(this.definition.surfaces, derived.supportSurface);
    }
}

export function synchronizeEntryEditorDefinition(baselineDefinition, candidateDefinition) {
    const next = structuredClone(candidateDefinition);
    const baseline = AreaEntryEditorComponent.from(baselineDefinition);
    const candidate = baseline ? AreaEntryEditorComponent.fromSupport(next, baseline.supportSurface.id) : null;
    if (baseline && candidate) candidate.synchronizeFrom(baseline);
    return next;
}
