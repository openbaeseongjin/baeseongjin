import { EXIT_PANEL_INTERACTION_SPEC } from "../../areas/AreaDefinition.js";

const EXIT_DECK_ID = Object.freeze({
    candidates: (areaId) => Object.freeze([`${areaId}:exit-deck`, "exit-deck"])
});
const EXIT_ROUTE_SUFFIXES = Object.freeze([":route-exit", ":route-final-deck", ":route-checkpoint"]);
const EXIT_DECK_SIZE = Object.freeze({ width: 320, height: 32 });
const EXIT_OFFSETS = Object.freeze({ doorFromCenterX: 128, panelFromDoorX: -112, routeFromDoorX: -64 });
const EXIT_ID = Object.freeze({
    gate: (areaId) => `${areaId}:gate`,
    panel: (areaId) => `${areaId}:exit-panel`,
    panelObjective: (areaId) => `${areaId}:exit-panel-engaged`
});

export class AreaExitEditorDefinition {
    create({ definition, position }) {
        const areaId = definition.id;
        const nextAreaId = definition.nextAreaId ?? null;
        const gateId = EXIT_ID.gate(areaId);
        const panelId = EXIT_ID.panel(areaId);
        const doorX = position.x + EXIT_OFFSETS.doorFromCenterX;
        const exitY = position.y - EXIT_DECK_SIZE.height;
        const existingObjective = definition.objectives?.find(({ sourceObjectId }) => sourceObjectId === panelId);
        const panelObjective = {
            id: existingObjective?.id ?? EXIT_ID.panelObjective(areaId),
            sourceObjectId: panelId,
            type: "interact"
        };
        return {
            exit: { id: `${areaId}:exit`, x: doorX, y: exitY },
            deck: {
                id: `${areaId}:exit-deck`,
                kind: "safe-deck",
                oneWay: true,
                grappleable: true,
                coordinateAnchor: "top-center",
                position: { x: position.x, y: position.y },
                vertices: [
                    { x: position.x - EXIT_DECK_SIZE.width * 0.5, y: position.y },
                    { x: position.x + EXIT_DECK_SIZE.width * 0.5, y: position.y },
                    {
                        x: position.x + EXIT_DECK_SIZE.width * 0.5,
                        y: position.y + EXIT_DECK_SIZE.height
                    },
                    {
                        x: position.x - EXIT_DECK_SIZE.width * 0.5,
                        y: position.y + EXIT_DECK_SIZE.height
                    }
                ]
            },
            gate: {
                id: gateId,
                nextAreaId,
                requiredObjectiveIds: [panelObjective.id],
                trigger:
                    nextAreaId === null
                        ? { x: doorX - 48, y: position.y - 128, width: 96, height: 160 }
                        : { x: doorX - 26, y: position.y - 62, width: 52, height: 62 },
                ...(nextAreaId === null ? { completionMode: "content-boundary" } : {})
            },
            objects: [
                {
                    id: panelId,
                    kind: "gate-panel",
                    presentationId: "world-object:gate-panel",
                    position: { x: doorX + EXIT_OFFSETS.panelFromDoorX, y: position.y },
                    coordinateAnchor: "bottom-center",
                    interactionSpec: EXIT_PANEL_INTERACTION_SPEC,
                    objectiveId: panelObjective.id,
                    gateId
                },
                {
                    id: `${areaId}:exit-gate`,
                    kind: "gate",
                    presentationId: "world-object:gate",
                    position: { x: doorX, y: position.y },
                    coordinateAnchor: "bottom-center",
                    gateId
                }
            ],
            objective: panelObjective,
            routePoint: {
                id: `${areaId}:route-exit`,
                x: doorX + EXIT_OFFSETS.routeFromDoorX,
                y: exitY
            }
        };
    }

    install(definition, position) {
        const current = AreaExitEditorComponent.from(definition);
        const created = this.create({ definition, position });
        const deckIds = EXIT_DECK_ID.candidates(definition.id);
        const gateIds = new Set([definition.gate?.id, created.gate.id].filter(Boolean));
        definition.surfaces = definition.surfaces.filter(({ id }) => id !== current?.deck?.id && !deckIds.includes(id));
        definition.routePoints = definition.routePoints.filter(
            ({ id }) =>
                id !== current?.routePoint?.id &&
                !EXIT_ROUTE_SUFFIXES.some((suffix) => id.toLocaleLowerCase("en-US").endsWith(suffix))
        );
        definition.objects = definition.objects.filter(({ gateId }) => !gateIds.has(gateId));
        definition.objectives = definition.objectives.filter(
            ({ id, sourceObjectId }) =>
                id !== created.objective.id && sourceObjectId !== created.objective.sourceObjectId
        );
        definition.exit = created.exit;
        definition.gate = created.gate;
        definition.surfaces.push(created.deck);
        definition.objects.push(...created.objects);
        definition.objectives.push(created.objective);
        definition.routePoints.push(created.routePoint);
        return created;
    }
}

export const AREA_EXIT_EDITOR_DEFINITION = Object.freeze(new AreaExitEditorDefinition());

function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y);
}

function translatePoint(point, delta) {
    point.x += delta.x;
    point.y += delta.y;
}

function translateSurface(surface, delta) {
    if (!surface) return;
    if (finitePoint(surface.position)) translatePoint(surface.position, delta);
    for (const vertex of surface.vertices ?? []) translatePoint(vertex, delta);
}

function finiteBounds(value) {
    return (
        Number.isFinite(value?.x) &&
        Number.isFinite(value?.y) &&
        Number.isFinite(value?.width) &&
        Number.isFinite(value?.height)
    );
}

function deckForExit(definition) {
    const deckIds = EXIT_DECK_ID.candidates(definition.id);
    const declaredDeck = definition.surfaces?.find(({ id }) => deckIds.includes(id));
    if (declaredDeck) return Object.freeze({ deck: declaredDeck, usesDeckHandle: finitePoint(declaredDeck.position) });
    return Object.freeze({ deck: null, usesDeckHandle: false });
}

function routePointForExit(definition) {
    const points = definition.routePoints ?? [];
    return (
        points.find(({ id }) => EXIT_ROUTE_SUFFIXES.some((suffix) => id.toLocaleLowerCase("en-US").endsWith(suffix))) ??
        points.find((point) => point.x === definition.exit.x && point.y === definition.exit.y) ??
        null
    );
}

function replaceById(entries, replacement) {
    const index = entries.findIndex(({ id }) => id === replacement.id);
    if (index >= 0) entries[index] = structuredClone(replacement);
}

export class AreaExitEditorComponent {
    static from(definition) {
        if (!definition?.id || !finitePoint(definition.exit) || !finiteBounds(definition.gate?.trigger)) return null;
        const { deck, usesDeckHandle } = deckForExit(definition);
        const routePoint = routePointForExit(definition);
        return new AreaExitEditorComponent({ definition, deck, routePoint, usesDeckHandle });
    }

    constructor({ definition, deck, routePoint, usesDeckHandle }) {
        this.definition = definition;
        this.deck = deck;
        this.routePoint = routePoint;
        this.usesDeckHandle = usesDeckHandle;
    }

    get id() {
        return this.definition.exit.id;
    }

    get point() {
        return this.usesDeckHandle ? this.deck.position : this.definition.exit;
    }

    ownsSurface(surfaceId) {
        return surfaceId === this.deck?.id;
    }

    ownsRoutePoint(routePointId) {
        return routePointId === this.routePoint?.id;
    }

    gateObjects() {
        return (this.definition.objects ?? []).filter(({ gateId }) => gateId === this.definition.gate.id);
    }

    translate(delta) {
        translateSurface(this.deck, delta);
        translatePoint(this.definition.exit, delta);
        translatePoint(this.definition.gate.trigger, delta);
        if (this.routePoint) translatePoint(this.routePoint, delta);
        for (const object of this.gateObjects()) translatePoint(object.position, delta);
    }

    ownsSameLayout(other) {
        return (
            other instanceof AreaExitEditorComponent &&
            this.id === other.id &&
            this.deck?.id === other.deck?.id &&
            this.routePoint?.id === other.routePoint?.id
        );
    }

    synchronizeFrom(baseline) {
        const derivedDefinition = structuredClone(baseline.definition);
        const derived = AreaExitEditorComponent.from(derivedDefinition);
        derived.translate({
            x: this.point.x - baseline.point.x,
            y: this.point.y - baseline.point.y
        });
        if (derived.deck) replaceById(this.definition.surfaces, derived.deck);
        this.definition.exit = structuredClone(derived.definition.exit);
        this.definition.gate.trigger = structuredClone(derived.definition.gate.trigger);
        if (derived.routePoint) replaceById(this.definition.routePoints, derived.routePoint);
        for (const object of derived.gateObjects()) replaceById(this.definition.objects, object);
    }
}

export function synchronizeExitEditorDefinition(baselineDefinition, candidateDefinition) {
    const next = structuredClone(candidateDefinition);
    const baseline = AreaExitEditorComponent.from(baselineDefinition);
    const candidate = AreaExitEditorComponent.from(next);
    if (baseline?.ownsSameLayout(candidate)) {
        candidate.synchronizeFrom(baseline);
    }
    return next;
}
