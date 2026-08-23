export const AUTHORED_RUNTIME_SECTOR_RANGE = Object.freeze({ first: 1, last: 6 });

export const AUTHORED_RUNTIME_CONTENT_BOUNDARY_STAGE_IDS = Object.freeze(["3-8", "4-8", "5-8", "6-8"]);

const CONTENT_BOUNDARY_STAGE_ID_LOOKUP = Object.freeze(
    Object.fromEntries(AUTHORED_RUNTIME_CONTENT_BOUNDARY_STAGE_IDS.map((stageId) => [stageId, true]))
);

export function parseAuthoredStageId(stageId) {
    const match = /^(\d+)-(\d+)$/.exec(stageId ?? "");
    if (!match) return null;
    return Object.freeze({ sector: Number(match[1]), stage: Number(match[2]) });
}

export function authoredStageAreaId(stageId) {
    const identity = parseAuthoredStageId(stageId);
    if (!identity) return null;
    return `sector-${String(identity.sector).padStart(2, "0")}-${String(identity.stage).padStart(2, "0")}`;
}

export function authoredStageSectorId(stageId) {
    const identity = parseAuthoredStageId(stageId);
    return identity ? `sector-${String(identity.sector).padStart(2, "0")}` : null;
}

export function isAuthoredRuntimeContentBoundary(stageId) {
    return CONTENT_BOUNDARY_STAGE_ID_LOOKUP[stageId] === true;
}

export function expectedAuthoredRuntimeNextAreaId(stageId) {
    const identity = parseAuthoredStageId(stageId);
    if (!identity || identity.stage === 8 || isAuthoredRuntimeContentBoundary(stageId)) return null;
    return authoredStageAreaId(`${identity.sector}-${identity.stage + 1}`);
}

export function authoredRuntimePromotionBlockers(spec) {
    const stageId = spec?.stage?.id;
    const definition = spec?.definition ?? {};
    const gate = definition.gate;
    const expectedNextAreaId = expectedAuthoredRuntimeNextAreaId(stageId);
    const blockers = [];

    if (!Array.isArray(definition.surfaces) || definition.surfaces.length === 0) {
        blockers.push("terrain-not-authored");
    }
    const gateAuthored = Boolean(gate && typeof gate === "object" && !Array.isArray(gate));
    if (!gateAuthored) {
        blockers.push("gate-not-authored");
    }
    if (definition.nextAreaId !== expectedNextAreaId || (gateAuthored && gate.nextAreaId !== expectedNextAreaId)) {
        blockers.push(
            isAuthoredRuntimeContentBoundary(stageId) ? "content-boundary-next-area-invalid" : "next-area-not-authored"
        );
    }
    if (isAuthoredRuntimeContentBoundary(stageId) && (!gateAuthored || gate.completionMode !== "content-boundary")) {
        blockers.push("content-boundary-mode-missing");
    }
    return Object.freeze(blockers);
}
