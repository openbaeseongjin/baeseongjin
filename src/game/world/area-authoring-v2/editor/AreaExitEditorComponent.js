const EXIT_DECK_ID = Object.freeze({
    candidates: (areaId) => Object.freeze([`${areaId}:exit-deck`, "exit-deck"])
});
const EXIT_ROUTE_SUFFIXES = Object.freeze([":route-exit", ":route-final-deck", ":route-checkpoint"]);

function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y);
}

function translatePoint(point, delta) {
    point.x += delta.x;
    point.y += delta.y;
}

function translateSurface(surface, delta) {
    if (finitePoint(surface.position)) translatePoint(surface.position, delta);
    for (const vertex of surface.vertices ?? []) translatePoint(vertex, delta);
}

function routePointForExit(definition) {
    const points = definition.routePoints ?? [];
    return (
        points.find(({ id }) => EXIT_ROUTE_SUFFIXES.some((suffix) => id.toLocaleLowerCase("en-US").endsWith(suffix))) ??
        null
    );
}

function replaceById(entries, replacement) {
    const index = entries.findIndex(({ id }) => id === replacement.id);
    if (index >= 0) entries[index] = structuredClone(replacement);
}

export class AreaExitEditorComponent {
    static from(definition) {
        if (!definition?.id || !definition.exit || !definition.gate) return null;
        const deckIds = EXIT_DECK_ID.candidates(definition.id);
        const deck = definition.surfaces?.find(({ id }) => deckIds.includes(id));
        const routePoint = routePointForExit(definition);
        if (!deck || !finitePoint(deck.position) || !routePoint) return null;
        return new AreaExitEditorComponent({ definition, deck, routePoint });
    }

    constructor({ definition, deck, routePoint }) {
        this.definition = definition;
        this.deck = deck;
        this.routePoint = routePoint;
    }

    get id() {
        return this.definition.exit.id;
    }

    get point() {
        return this.deck.position;
    }

    ownsSurface(surfaceId) {
        return surfaceId === this.deck.id;
    }

    ownsRoutePoint(routePointId) {
        return routePointId === this.routePoint.id;
    }

    gateObjects() {
        return (this.definition.objects ?? []).filter(({ gateId }) => gateId === this.definition.gate.id);
    }

    translate(delta) {
        translateSurface(this.deck, delta);
        translatePoint(this.definition.exit, delta);
        translatePoint(this.definition.gate.trigger, delta);
        translatePoint(this.routePoint, delta);
        for (const object of this.gateObjects()) translatePoint(object.position, delta);
    }

    synchronizeFrom(baseline) {
        const derivedDefinition = structuredClone(baseline.definition);
        const derived = AreaExitEditorComponent.from(derivedDefinition);
        derived.translate({
            x: this.point.x - baseline.point.x,
            y: this.point.y - baseline.point.y
        });
        replaceById(this.definition.surfaces, derived.deck);
        this.definition.exit = structuredClone(derived.definition.exit);
        this.definition.gate.trigger = structuredClone(derived.definition.gate.trigger);
        replaceById(this.definition.routePoints, derived.routePoint);
        for (const object of derived.gateObjects()) replaceById(this.definition.objects, object);
    }
}

export function synchronizeExitEditorDefinition(baselineDefinition, candidateDefinition) {
    const next = structuredClone(candidateDefinition);
    const baseline = AreaExitEditorComponent.from(baselineDefinition);
    const candidate = AreaExitEditorComponent.from(next);
    if (baseline && candidate) candidate.synchronizeFrom(baseline);
    return next;
}
