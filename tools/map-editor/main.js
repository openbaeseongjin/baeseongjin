import { AreaEditorDraft } from "../../src/game/world/area-authoring-v2/editor/AreaEditorDraft.js";
import { AREA_ENTRY_EDITOR_DEFINITION } from "../../src/game/world/area-authoring-v2/editor/AreaEntryEditorComponent.js";
import { AREA_ENEMY_EDITOR_DEFINITION } from "../../src/game/world/area-authoring-v2/editor/AreaEnemyEditorDefinition.js";
import { AREA_EXIT_EDITOR_DEFINITION } from "../../src/game/world/area-authoring-v2/editor/AreaExitEditorComponent.js";
import {
    canRemoveEditorEntity,
    collectEditorEntities,
    hitTestEditorEntity,
    removeEditorEntity,
    screenToWorld,
    translateEditorEntity,
    worldToScreen
} from "../../src/game/world/area-authoring-v2/editor/AreaEditorProjection.js";
import { BossStageEditorDraft } from "../../src/game/boss-authoring/editor/BossStageEditorDraft.js";
import {
    collectBossStageEditorEntities,
    translateBossStageEditorEntity
} from "../../src/game/boss-authoring/editor/BossStageEditorProjection.js";
import { AUTHORABLE_ENEMY_TYPE_IDS } from "../../src/game/EnemyType.js";
import { enemyDisplayName } from "../../src/game/combat/EnemyArchetypeCatalog.js";
import { AUTHORED_COORDINATE_ANCHORS } from "../../src/game/world/AuthoredCoordinateAnchor.js";
import { WIND_MODE } from "../../src/game/world/WindPhase.js";
import {
    BOSS_MECHANIC_TYPE,
    BOSS_TRANSITION_TRIGGER,
    BOSS_VICTORY_PRESENTATION_ID,
    BOSS_VISUAL_PRESET_ID,
    BOSS_VULNERABILITY_TARGET_ID,
    BOSS_VULNERABILITY_TRIGGER,
    bossStageDerivedPreview
} from "../../src/game/boss-authoring/BossStageSpec.js";

const EDITABLE_GROUPS = Object.freeze([
    ["bounds", "맵 경계", null],
    ["entry", "시작 지점", "entry"],
    ["exit", "출구", "exit"],
    ["surfaces", "지형 표면", "surface"],
    ["anchors", "앵커", "anchor"],
    ["recoveryRoute", "복구 / 경로", "route"],
    ["enemySlots", "적 슬롯", "enemy"],
    ["wind", "바람", "wind"],
    ["camera", "카메라 구역", "camera"]
]);
const READ_ONLY_GROUPS = Object.freeze([
    ["objectives", "목표", "objectives"],
    ["progression", "진행", "routes"],
    ["story", "스토리", "storyTriggers"],
    ["scanner", "스캐너", "scannerGroups"],
    ["behaviorRegistry", "행동 레지스트리", "behaviorRefs"]
]);
const BOSS_EDITABLE_GROUPS = Object.freeze([
    ["arena", "Arena 경계", null],
    ["entry", "시작 지점", null],
    ["exit", "출구", null],
    ["surfaces", "Arena 표면", null],
    ["anchors", "Rope 경로", null],
    ["recovery", "복구 지점", null],
    ["zones", "Phase 구역", null],
    ["boss", "Boss Actor", null],
    ["mechanics", "Mechanic", null],
    ["phases", "Phase", null],
    ["combat", "HP / 피해", null],
    ["hud", "Boss HUD", null],
    ["transition", "진입 / 승리 전환", null]
]);
const DOMAIN_LABELS = Object.freeze({
    bounds: "맵 경계",
    entry: "시작 지점",
    exit: "출구",
    surfaces: "지형 표면",
    anchors: "앵커",
    recoveryRoute: "복구 / 경로",
    enemySlots: "적 슬롯",
    wind: "바람",
    camera: "카메라 구역",
    objectives: "목표",
    progression: "진행",
    story: "스토리",
    scanner: "스캐너",
    behaviorRegistry: "행동 레지스트리",
    arena: "Arena 경계",
    recovery: "복구 지점",
    zones: "Phase 구역",
    boss: "Boss Actor",
    mechanics: "Mechanic",
    phases: "Phase",
    combat: "HP / 피해",
    hud: "Boss HUD",
    transition: "진입 / 승리 전환"
});
const KIND_LABELS = Object.freeze({
    bounds: "맵 경계",
    entry: "시작 지점",
    exit: "출구 복합 객체",
    surface: "지형",
    anchor: "앵커",
    recovery: "복구 지점",
    "phase-zone": "Phase 구역",
    route: "경로 지점",
    enemy: "적 슬롯",
    "wind-source": "바람원",
    "wind-zone": "바람 구역",
    "camera-zone": "카메라 구역",
    "arena-bounds": "Arena 경계",
    boss: "Boss Actor",
    combat: "HP / 피해",
    hud: "Boss HUD",
    transition: "전환",
    phase: "Phase",
    "full-crossbeam-sweep": "Full Crossbeam",
    "directional-broken-beam-sweep": "Directional Beam",
    "beam-failure": "Beam Failure",
    "rail-ram": "Rail Ram"
});
const MAX_ZOOM = 2.4;
const MIN_ZOOM = 0.08;
const POSITION_GRID_SIZE = 5;

const dom = {
    editorShell: document.querySelector(".editor-shell"),
    stageSelect: document.querySelector("#stage-select"),
    stageScope: document.querySelector("#stage-scope"),
    layerFilter: document.querySelector("#layer-filter"),
    layerPanel: document.querySelector("#layer-panel"),
    inspector: document.querySelector("#inspector-panel"),
    canvas: document.querySelector("#editor-canvas"),
    fitStage: document.querySelector("#fit-stage"),
    scenarioReferenceToggle: document.querySelector("#toggle-scenario-reference"),
    scenarioReferencePanel: document.querySelector("#scenario-reference-panel"),
    scenarioReferenceStage: document.querySelector("#scenario-reference-stage"),
    scenarioReferenceFrame: document.querySelector("#scenario-reference-frame"),
    focusSelection: document.querySelector("#focus-selection"),
    clearSelection: document.querySelector("#clear-selection"),
    selectionReadout: document.querySelector("#selection-readout"),
    status: document.querySelector("#draft-status"),
    undo: document.querySelector("#undo-draft"),
    redo: document.querySelector("#redo-draft"),
    validate: document.querySelector("#validate-draft"),
    apply: document.querySelector("#apply-draft"),
    preview: document.querySelector("#preview-stage")
};
const context = dom.canvas.getContext("2d");
const state = {
    draft: null,
    stages: [],
    stageId: null,
    authoringMode: null,
    specType: "area",
    derivedPreview: null,
    runtimePromotion: null,
    previewAvailable: false,
    view: { x: 0, y: 0, zoom: 1 },
    message: { kind: "", text: "스테이지를 불러오는 중입니다.", issues: [] },
    pointer: null,
    spaceDown: false,
    applyPending: false,
    validationPending: false,
    memoryPreviewReady: false,
    replacementPoints: { entry: null, exit: null },
    layerFilter: "",
    scenarioReferenceOpen: false
};

function clear(node) {
    node.replaceChildren();
}

function element(tag, { className = "", text = "", attributes = {} } = {}) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
    return node;
}

function button({ text, className = "", disabled = false, onClick, title = "" }) {
    const node = element("button", { className, text, attributes: { type: "button" } });
    node.disabled = disabled;
    if (title) node.title = title;
    node.addEventListener("click", onClick);
    return node;
}

function selectedMatches(entity) {
    const selected = state.draft?.selected();
    return selected?.domain === entity.domain && selected.id === entity.id;
}

function entities() {
    if (!state.draft) return [];
    return state.specType === "boss-stage"
        ? collectBossStageEditorEntities(state.draft.specification())
        : collectEditorEntities(state.draft.specification());
}

function selectedEntity() {
    const selected = state.draft?.selected();
    if (!selected) return null;
    return entities().find((entity) => entity.domain === selected.domain && entity.id === selected.id) ?? null;
}

function entityLabel(entity) {
    const spec = state.draft?.specification();
    const prefix = state.specType === "boss-stage" ? spec?.id : spec?.definition.id;
    return entity?.id?.replace(`${prefix ?? ""}:`, "") ?? "선택 없음";
}

function editableGroups() {
    return state.specType === "boss-stage" ? BOSS_EDITABLE_GROUPS : EDITABLE_GROUPS;
}

function stageBounds(spec = state.draft?.specification()) {
    return state.specType === "boss-stage" ? spec?.arena.bounds : spec?.definition.bounds;
}

function stageIdentity(spec = state.draft?.specification()) {
    return state.specType === "boss-stage" ? spec?.id : spec?.definition.id;
}

function domainLabel(domain) {
    return DOMAIN_LABELS[domain] ?? domain;
}

function kindLabel(kind) {
    return KIND_LABELS[kind] ?? kind;
}

function authoringModeLabel(mode) {
    if (mode === "runtime-generated") return "Runtime 적용";
    if (mode === "runtime-staged") return "Runtime 준비";
    if (mode === "scenario-only") return "시나리오 전용";
    return "저작 원본";
}

function authoringModeDescription(mode) {
    if (mode === "runtime-generated") {
        return state.specType === "boss-stage"
            ? "저장 적용 시 Boss Stage JSON과 생성 Runtime 정의를 함께 갱신합니다. 현재 전투는 hot reload하지 않습니다."
            : "저장 적용 시 생성 JS와 현재 Sector Catalog를 함께 갱신합니다.";
    }
    if (mode === "runtime-staged") return "생성 JS를 갱신하지만 현재 게임 Catalog 전환은 메인 개발자 통합 범위입니다.";
    return "시나리오 원본만 편집합니다. 게임 Runtime과 멀티플레이에는 적용되지 않습니다.";
}

function runtimePromotionDescription(promotion) {
    if (!promotion || promotion.status === "live") return "";
    if (promotion.status === "ready")
        return "Runtime 승격 검증은 통과했지만 manifest와 facade 전환은 아직 적용되지 않았습니다.";
    const labels = {
        "gate-not-authored": "진행 Gate 미저작",
        "next-area-not-authored": "다음 스테이지 전환 미정",
        "terrain-not-authored": "충돌 지형 미저작",
        "enemy-type-unmapped": "적 Runtime 타입 미연결",
        "runtime-contract-invalid": "Runtime 계약 불일치"
    };
    const blockers = promotion.blockers?.map((blocker) => labels[blocker] ?? blocker) ?? [];
    return `Runtime 승격 보류: ${blockers.join(" · ")}.`;
}

function stageOptionLabel(stage) {
    const promotion = runtimePromotionDescription(stage.runtimePromotion);
    return `${stage.stageId} · ${stage.name} · ${authoringModeLabel(stage.authoringMode)}${
        promotion ? " · Runtime 보류" : ""
    }`;
}

function roundedValue(value) {
    return Number.isFinite(value) ? Math.round(value * 10) / 10 : "-";
}

function snapPosition(value) {
    return Number.isFinite(value) ? Math.round(value / POSITION_GRID_SIZE) * POSITION_GRID_SIZE : value;
}

function snapPoint(point) {
    return { x: snapPosition(point.x), y: snapPosition(point.y) };
}

function entityAnnotation(entity, spec) {
    const id = entityLabel(entity);
    if (state.specType === "boss-stage") {
        if (entity.domain === "arena") return { name: "Boss Arena", effect: "전용 Stage 플레이 범위" };
        if (entity.domain === "entry") return { name: "Boss 진입", effect: "1-8 Checkpoint 이후 시작 위치" };
        if (entity.domain === "exit") return { name: "열린 Gate", effect: "승리 뒤 Sector 02 진입" };
        if (entity.domain === "boss") return { name: spec.name, effect: "Rail 위 중립 Boss Actor" };
        if (entity.domain === "surfaces") return { name: `Arena · ${id}`, effect: "충돌 / Rope 이동 표면" };
        if (entity.domain === "anchors") return { name: `Rope · ${id}`, effect: "400px authored 이동 관계" };
        if (entity.domain === "recovery") return { name: `복구 · ${id}`, effect: "실패 후 지역 복귀" };
        if (entity.domain === "mechanics") return { name: `Mechanic · ${id}`, effect: kindLabel(entity.kind) };
        if (entity.domain === "phases") return { name: `Phase · ${id}`, effect: "HP floor / 약점 공략" };
        return { name: kindLabel(entity.kind), effect: domainLabel(entity.domain) };
    }
    if (entity.domain === "bounds") return { name: "맵 경계", effect: "플레이 가능 범위" };
    if (entity.domain === "entry") return { name: "시작 지점", effect: "플레이어 시작 위치" };
    if (entity.domain === "surfaces") {
        const surface = spec.definition.surfaces.find(({ id: surfaceId }) => surfaceId === entity.id);
        const effects = [
            surface?.oneWay ? "아래에서 통과" : "충돌 표면",
            surface?.grappleable ? "갈고리 부착" : "부착 불가"
        ];
        return { name: `지형 · ${id}`, effect: effects.join(" · ") };
    }
    if (entity.domain === "anchors") {
        const anchor = spec.anchors.find(({ landmark }) => landmark.id === entity.id);
        return { name: `앵커 · ${anchor?.landmark.properties?.label ?? id}`, effect: "갈고리 부착 지점" };
    }
    if (entity.kind === "recovery") return { name: `복구 · ${id}`, effect: "낙하 시 복귀 위치" };
    if (entity.kind === "route") return { name: `경로 · ${id}`, effect: "진행 경로 표시" };
    if (entity.domain === "enemySlots") {
        const enemy = spec.definition.objects.find(({ id: objectId }) => objectId === entity.id);
        return { name: `적 · ${id}`, effect: enemy?.enemyType ? `${enemy.enemyType} 생성` : "적 생성 지점" };
    }
    if (entity.kind === "wind-source") return { name: `바람원 · ${id}`, effect: "바람 구역 발생점" };
    if (entity.kind === "wind-zone") {
        const zone = spec.definition.windZones.find(({ id: zoneId }) => zoneId === entity.id);
        return { name: `바람 구역 · ${id}`, effect: `바람 세기 ${roundedValue(zone?.strength)}` };
    }
    if (entity.domain === "camera") {
        const zone = spec.definition.cameraZones.find(({ id: zoneId }) => zoneId === entity.id);
        return { name: `카메라 · ${id}`, effect: `데스크톱 배율 ${roundedValue(zone?.desktopZoom)}` };
    }
    return { name: kindLabel(entity.kind), effect: domainLabel(entity.domain) };
}

function matchesLayerFilter(entity, label = "") {
    const query = state.layerFilter.trim().toLocaleLowerCase();
    if (!query) return true;
    return [entity.id, entity.kind, entity.domain, label].join(" ").toLocaleLowerCase().includes(query);
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: { ...(options.body ? { "content-type": "application/json" } : {}), ...(options.headers ?? {}) }
    });
    const payload = await response
        .json()
        .catch(() => ({ code: "response-invalid", message: "서버 응답을 읽을 수 없습니다." }));
    if (!response.ok) {
        const failure = new Error(payload.message ?? "맵 에디터 요청이 실패했습니다.");
        Object.assign(failure, payload);
        throw failure;
    }
    return payload;
}

function stageEndpoint(stageId, suffix = "") {
    return `/api/map-editor/stages/${encodeURIComponent(stageId)}${suffix}`;
}

function scenarioReferenceUrl(stageId) {
    if (/^boss-\d+$/.test(stageId ?? "")) return null;
    const match = /^(\d+)-(\d+)$/.exec(stageId ?? "");
    if (!match) return null;
    return stageEndpoint(stageId, "/reference");
}

function renderScenarioReference() {
    const source = scenarioReferenceUrl(state.stageId);
    const open = Boolean(state.scenarioReferenceOpen && source);
    dom.scenarioReferenceToggle.disabled = !source;
    dom.scenarioReferenceToggle.setAttribute("aria-pressed", String(open));
    dom.scenarioReferenceToggle.title = open
        ? "시나리오 MAP-PREVIEW.html 비교 닫기 (C)"
        : "시나리오 MAP-PREVIEW.html과 비교 (C)";
    dom.scenarioReferencePanel.hidden = !open;
    dom.editorShell.classList.toggle("is-comparing", open);
    if (!open) return;
    dom.scenarioReferenceStage.textContent = `${state.stageId} · MAP-PREVIEW.html`;
    if (dom.scenarioReferenceFrame.dataset.source === source) return;
    dom.scenarioReferenceFrame.dataset.source = source;
    dom.scenarioReferenceFrame.src = source;
}

function setScenarioReferenceOpen(open) {
    state.scenarioReferenceOpen = Boolean(open);
    renderScenarioReference();
    globalThis.requestAnimationFrame(() => {
        fitView();
        drawCanvas();
    });
}

function setMessage(kind, text, issues = []) {
    state.message = { kind, text, issues };
    renderStatus();
}

function errorMessage(cause) {
    const issues = cause.issues ?? [];
    setMessage("error", `${cause.code ?? "request-failed"}: ${cause.message}`, issues);
}

function fitView() {
    const bounds = stageBounds(state.draft?.snapshot().spec);
    const rect = dom.canvas.getBoundingClientRect();
    if (!bounds || rect.width === 0 || rect.height === 0) return;
    state.view.zoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, Math.min(rect.width / (bounds.width * 1.16), rect.height / (bounds.height * 1.16)))
    );
    if (state.specType === "area") {
        state.view.x = rect.width * 0.5;
        state.view.y = rect.height * 0.87;
        return;
    }
    const left = Number.isFinite(bounds.x) ? bounds.x : -bounds.width * 0.5;
    const top = Number.isFinite(bounds.y) ? bounds.y : -bounds.height;
    state.view.x = rect.width * 0.5 - (left + bounds.width * 0.5) * state.view.zoom;
    state.view.y = rect.height * 0.5 - (top + bounds.height * 0.5) * state.view.zoom;
}

function focusSelection() {
    const entity = selectedEntity();
    if (!entity?.point) return setMessage("info", "위치가 있는 오브젝트를 먼저 선택하세요.");
    const rect = dom.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    state.view.x = rect.width * 0.5 - entity.point.x * state.view.zoom;
    state.view.y = rect.height * 0.5 - entity.point.y * state.view.zoom;
    setMessage("info", `${entityLabel(entity)} 항목을 캔버스 중앙에 표시했습니다.`);
    render();
}

function clearSelection() {
    if (!state.draft?.selected()) return;
    state.draft.select(null);
    setMessage("info", "선택을 해제했습니다.");
    render();
}

function resizeCanvas() {
    const rect = dom.canvas.getBoundingClientRect();
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (dom.canvas.width !== width || dom.canvas.height !== height) {
        dom.canvas.width = width;
        dom.canvas.height = height;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return rect;
}

function currentWorldAtCanvasCenter() {
    const rect = dom.canvas.getBoundingClientRect();
    const point = screenToWorld({ x: rect.width * 0.5, y: rect.height * 0.5 }, state.view);
    const bounds = stageBounds();
    const left = Number.isFinite(bounds.x) ? bounds.x : -bounds.width * 0.5;
    const top = Number.isFinite(bounds.y) ? bounds.y : -bounds.height;
    const insetX = Math.min(96, bounds.width * 0.5);
    const insetY = Math.min(96, bounds.height * 0.5);
    return snapPoint({
        x: Math.max(left + insetX, Math.min(left + bounds.width - insetX, point.x)),
        y: Math.max(top + insetY, Math.min(top + bounds.height - insetY, point.y))
    });
}

function nextStableId(prefix) {
    const spec = state.draft.specification();
    if (state.specType === "boss-stage") {
        const ids = new Set([
            spec.id,
            ...spec.arena.surfaces.map(({ id }) => id),
            ...spec.arena.anchors.map(({ id }) => id),
            ...spec.arena.recoveryPoints.map(({ id }) => id),
            ...spec.mechanics.map(({ id }) => id),
            ...spec.phases.map(({ id }) => id)
        ]);
        let index = 1;
        while (ids.has(`${spec.id}:${prefix}-${index}`)) index += 1;
        return `${spec.id}:${prefix}-${index}`;
    }
    const ids = new Set([
        spec.definition.id,
        ...spec.definition.surfaces.map(({ id }) => id),
        ...spec.definition.objects.map(({ id }) => id),
        ...spec.definition.routePoints.map(({ id }) => id),
        ...spec.definition.recoveryPoints.map(({ id }) => id),
        ...spec.definition.windZones.map(({ id }) => id),
        ...spec.definition.cameraZones.map(({ id }) => id),
        ...spec.anchors.flatMap(({ landmark, target }) => [landmark.id, target.id])
    ]);
    let index = 1;
    while (ids.has(`${spec.definition.id}:${prefix}-${index}`)) index += 1;
    return `${spec.definition.id}:${prefix}-${index}`;
}

function replaceSpec(target, next) {
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, next);
}

function draftSnapshot() {
    return state.draft?.snapshot() ?? null;
}

function draftIsDirty() {
    return Boolean(draftSnapshot()?.dirty);
}

function confirmDiscardDirtyDraft() {
    return (
        !draftIsDirty() ||
        globalThis.confirm("저장 적용되지 않은 초안 변경사항이 있습니다. 현재 변경을 버리고 계속하시겠습니까?")
    );
}

function applyMutation({ domain, label, apply }) {
    if (!state.draft?.mutate({ domain, label, apply })) return render();
    state.memoryPreviewReady = false;
    setMessage("dirty", "변경사항이 있습니다. 메모리 초안 저장으로 미리보거나 저장 적용하세요.");
    render();
}

function addPreset(kind) {
    const point = state.replacementPoints[kind] ?? currentWorldAtCanvasCenter();
    if (kind === "boss-phase") {
        const id = nextStableId("phase");
        applyMutation({
            domain: "phases",
            label: "Boss Phase 추가",
            apply: (spec) => {
                spec.phases.push({
                    id,
                    order: spec.phases.length + 1,
                    name: "NEW PHASE",
                    basePhaseHealth: 120,
                    mechanicIds: [],
                    vulnerability: { targetId: `${id}:weakpoint`, trigger: "mechanic-complete", durationSeconds: 3 },
                    hud: { objective: "새 Phase 목표" }
                });
                return true;
            }
        });
        state.draft.select({ domain: "phases", id, kind: "phase" });
        return render();
    }
    if (kind === "boss-mechanic") {
        const id = nextStableId("mechanic");
        applyMutation({
            domain: "mechanics",
            label: "Boss Mechanic 추가",
            apply: (spec) => {
                spec.mechanics.push({
                    id,
                    type: "rail-ram",
                    position: point,
                    parameters: { travelSpeed: 300, telegraphSeconds: 0.5, recoverySeconds: 1.5 }
                });
                return true;
            }
        });
        state.draft.select({ domain: "mechanics", id, kind: "rail-ram" });
        return render();
    }
    if (kind === "entry") {
        const id = `${state.draft.specification().definition.id}:entry`;
        applyMutation({
            domain: "entry",
            label: "시작 지점 추가",
            apply: (spec) => {
                AREA_ENTRY_EDITOR_DEFINITION.install(spec.definition, point);
                return true;
            }
        });
        state.draft.select({ domain: "entry", id, kind: "entry" });
        state.replacementPoints.entry = null;
    }
    if (kind === "exit") {
        const id = `${state.draft.specification().definition.id}:exit`;
        applyMutation({
            domain: "exit",
            label: "출구 추가",
            apply: (spec) => {
                AREA_EXIT_EDITOR_DEFINITION.install(spec.definition, point);
                return true;
            }
        });
        state.draft.select({ domain: "exit", id, kind: "exit" });
        state.replacementPoints.exit = null;
    }
    if (kind === "surface") {
        const id = nextStableId("surface");
        applyMutation({
            domain: "surfaces",
            label: "지형 표면 추가",
            apply: (spec) => {
                spec.definition.surfaces.push({
                    id,
                    kind: "platform",
                    oneWay: true,
                    grappleable: true,
                    coordinateAnchor: "top-center",
                    position: { x: point.x, y: point.y },
                    vertices: [
                        { x: point.x - 64, y: point.y },
                        { x: point.x + 64, y: point.y },
                        { x: point.x + 64, y: point.y + 32 },
                        { x: point.x - 64, y: point.y + 32 }
                    ]
                });
                return true;
            }
        });
        state.draft.select({ domain: "surfaces", id, kind: "surface" });
    }
    if (kind === "anchor") {
        const id = nextStableId("editor-anchor");
        applyMutation({
            domain: "anchors",
            label: "앵커 추가",
            apply: (spec) => {
                spec.anchors.push({
                    target: { id: `${id}-surface`, x: point.x, y: point.y, properties: {} },
                    landmark: { id, x: point.x, y: point.y, properties: { label: "NEW", coordinateAnchor: "center" } }
                });
                return true;
            }
        });
        state.draft.select({ domain: "anchors", id, kind: "anchor" });
    }
    if (kind === "recovery") {
        const id = nextStableId("recovery");
        applyMutation({
            domain: "recoveryRoute",
            label: "복구 지점 추가",
            apply: (spec) => {
                spec.definition.recoveryPoints.push({ id, x: point.x, y: point.y });
                return true;
            }
        });
        state.draft.select({ domain: "recoveryRoute", id, kind: "recovery" });
    }
    if (kind === "route") {
        const id = nextStableId("route");
        applyMutation({
            domain: "recoveryRoute",
            label: "경로 지점 추가",
            apply: (spec) => {
                spec.definition.routePoints.push({ id, x: point.x, y: point.y });
                return true;
            }
        });
        state.draft.select({ domain: "recoveryRoute", id, kind: "route" });
    }
    if (kind === "enemy") {
        const id = nextStableId("enemy");
        applyMutation({
            domain: "enemySlots",
            label: "적 슬롯 추가",
            apply: (spec) => {
                spec.definition.objects.push(AREA_ENEMY_EDITOR_DEFINITION.create({ id, position: point }));
                return true;
            }
        });
        state.draft.select({ domain: "enemySlots", id, kind: "enemy" });
    }
    if (kind === "wind") {
        const id = nextStableId("wind");
        applyMutation({
            domain: "wind",
            label: "바람원과 구역 추가",
            apply: (spec) => {
                spec.definition.windZones.push({
                    id: `${id}-zone`,
                    bounds: { x: point.x - 96, y: point.y - 64, width: 192, height: 128 },
                    direction: { x: 1, y: 0 },
                    mode: "continuous",
                    strength: 180,
                    falloff: 32
                });
                spec.definition.objects.push({
                    id,
                    kind: "wind-source",
                    presentationId: "world-object:wind-source",
                    position: { x: point.x, y: point.y },
                    windZoneId: `${id}-zone`,
                    damage: false,
                    coordinateAnchor: "center"
                });
                return true;
            }
        });
        state.draft.select({ domain: "wind", id, kind: "wind-source" });
    }
    if (kind === "camera") {
        const id = nextStableId("camera");
        applyMutation({
            domain: "camera",
            label: "카메라 구역 추가",
            apply: (spec) => {
                spec.definition.cameraZones.push({
                    id,
                    minY: point.y - 96,
                    maxY: point.y + 96,
                    desktopZoom: 0.9,
                    mobileZoom: 0.72
                });
                return true;
            }
        });
        state.draft.select({ domain: "camera", id, kind: "camera-zone" });
    }
    render();
}

function renderLayers() {
    clear(dom.layerPanel);
    const all = entities();
    const snapshot = state.draft.snapshot();
    let hasFilterMatch = false;
    for (const [domain, label, preset] of editableGroups()) {
        const entries = all.filter((entry) => entry.domain === domain);
        const visibleEntries = entries.filter((entry) => matchesLayerFilter(entry, label));
        const count = entries.length;
        const groupMatches = matchesLayerFilter({ domain, id: label, kind: label }, label);
        if (state.layerFilter && visibleEntries.length === 0 && !groupMatches) continue;
        if (visibleEntries.length > 0 || groupMatches) hasFilterMatch = true;
        const group = element("section", { className: "layer-group" });
        const heading = element("div", { className: "panel-heading", text: label });
        heading.append(
            element("span", {
                className: "layer-badge",
                text: state.layerFilter ? `${visibleEntries.length}/${count}` : String(count)
            })
        );
        if (state.specType === "boss-stage" && domain === "phases") {
            heading.append(
                button({ text: "+ Phase", className: "add-button", onClick: () => addPreset("boss-phase") })
            );
        } else if (state.specType === "boss-stage" && domain === "mechanics") {
            heading.append(
                button({ text: "+ Mechanic", className: "add-button", onClick: () => addPreset("boss-mechanic") })
            );
        } else if (domain === "recoveryRoute") {
            heading.append(button({ text: "+ 복구", className: "add-button", onClick: () => addPreset("recovery") }));
            heading.append(button({ text: "+ 경로", className: "add-button", onClick: () => addPreset("route") }));
        } else if (preset && (!["entry", "exit"].includes(domain) || count === 0)) {
            heading.append(button({ text: "+ 추가", className: "add-button", onClick: () => addPreset(preset) }));
        }
        group.append(heading);
        const list = element("div", { className: "layer-list" });
        for (const entry of visibleEntries) {
            const row = button({
                text: entry.id.replace(`${stageIdentity(snapshot.spec)}:`, ""),
                className: `layer-item${selectedMatches(entry) ? " is-selected" : ""}`,
                onClick: () => {
                    state.draft.select(entry);
                    render();
                }
            });
            row.append(element("span", { className: "layer-badge", text: kindLabel(entry.kind) }));
            list.append(row);
        }
        if (state.layerFilter && groupMatches && count > 0 && visibleEntries.length === 0)
            list.append(element("p", { className: "layer-empty", text: "이 레이어에는 일치하는 항목이 없습니다." }));
        if (domain === "enemySlots" && count === 0 && !state.layerFilter)
            list.append(
                element("p", { className: "inspector-subtitle", text: "이 스테이지에는 기존 적 슬롯이 없습니다." })
            );
        group.append(list);
        dom.layerPanel.append(group);
    }
    if (state.specType === "boss-stage") {
        if (state.layerFilter && !hasFilterMatch)
            dom.layerPanel.append(
                element("p", {
                    className: "layer-search-empty",
                    text: "검색 결과가 없습니다. Esc를 눌러 검색을 지우세요."
                })
            );
        return;
    }
    const readOnly = element("section", { className: "layer-group" });
    readOnly.append(element("div", { className: "panel-heading", text: "읽기 전용" }));
    const list = element("div", { className: "layer-list" });
    let hasReadOnlyMatch = false;
    for (const [domain, label, collection] of READ_ONLY_GROUPS) {
        const value = collection === "behaviorRefs" ? snapshot.spec.behaviorRefs : snapshot.spec.definition[collection];
        const count = Array.isArray(value) ? value.length : 0;
        const entry = { domain, id: domain, kind: "read-only" };
        if (matchesLayerFilter(entry, label)) {
            hasReadOnlyMatch = true;
            hasFilterMatch = true;
            const row = button({
                text: label,
                className: `layer-item is-read-only${selectedMatches(entry) ? " is-selected" : ""}`,
                onClick: () => {
                    state.draft.select(entry);
                    render();
                }
            });
            row.append(element("span", { className: "layer-badge", text: `잠김 ${count}` }));
            list.append(row);
        }
    }
    readOnly.append(list);
    if (!state.layerFilter || hasReadOnlyMatch) dom.layerPanel.append(readOnly);
    if (state.layerFilter && !hasFilterMatch)
        dom.layerPanel.append(
            element("p", { className: "layer-search-empty", text: "검색 결과가 없습니다. Esc를 눌러 검색을 지우세요." })
        );
}

function appendField(
    container,
    { label, value, type = "number", disabled = false, onChange, step = "any", minimum = null, maximum = null }
) {
    const wrapper = element("label", { className: "field", text: label });
    const input = element("input", { attributes: { type, step } });
    input.value = String(value ?? "");
    if (Number.isFinite(minimum)) input.min = String(minimum);
    if (Number.isFinite(maximum)) input.max = String(maximum);
    input.disabled = disabled;
    if (onChange)
        input.addEventListener("change", () => onChange(type === "number" ? Number(input.value) : input.value));
    wrapper.append(input);
    container.append(wrapper);
}

function appendSelect(container, { label, value, options, multiple = false, disabled = false, onChange }) {
    const wrapper = element("label", { className: "field", text: label });
    const select = element("select");
    select.multiple = multiple;
    select.disabled = disabled;
    if (multiple) select.size = Math.min(7, Math.max(3, options.length));
    const selected = new Set(multiple ? (value ?? []) : [value]);
    for (const option of options) {
        const descriptor = typeof option === "string" ? { value: option, label: option } : option;
        const node = element("option", { text: descriptor.label, attributes: { value: descriptor.value } });
        node.selected = selected.has(descriptor.value);
        select.append(node);
    }
    if (onChange) {
        select.addEventListener("change", () => {
            const nextValue = multiple ? [...select.selectedOptions].map(({ value }) => value) : select.value;
            onChange(nextValue);
        });
    }
    wrapper.append(select);
    container.append(wrapper);
    return select;
}

function appendPositionField(container, { label, value, disabled = false, onChange }) {
    appendField(container, {
        label: `${label} (5px)`,
        value: snapPosition(value),
        disabled,
        step: POSITION_GRID_SIZE,
        onChange: (nextValue) => onChange(snapPosition(nextValue))
    });
}

function appendCheck(container, { label, checked, onChange, disabled = false }) {
    const wrapper = element("label", { className: "field checkbox" });
    const input = element("input", { attributes: { type: "checkbox" } });
    input.checked = Boolean(checked);
    input.disabled = disabled;
    input.addEventListener("change", () => onChange(input.checked));
    wrapper.append(input, element("span", { text: label }));
    container.append(wrapper);
}

function appendEnemyAdditionalInfo(container, enemy, selectedId) {
    const definitions = AREA_ENEMY_EDITOR_DEFINITION.additionalFields(enemy);
    if (definitions.length === 0) return false;
    const panel = element("fieldset", { className: "enemy-additional-info" });
    panel.append(element("legend", { text: "추가 정보" }));
    for (const definition of definitions) {
        appendField(panel, {
            label: definition.label,
            value: enemy[definition.key] ?? definition.defaultValue,
            step: definition.step,
            minimum: definition.minimum,
            maximum: definition.maximum,
            onChange: (value) =>
                applyMutation({
                    domain: "enemySlots",
                    label: `Set enemy ${definition.key}`,
                    apply: (next) => {
                        const object = next.definition.objects.find(({ id }) => id === selectedId);
                        object[definition.key] = Math.max(
                            definition.minimum,
                            Math.min(definition.maximum, Math.round(value))
                        );
                        return true;
                    }
                })
        });
    }
    container.append(panel);
    return true;
}

function replacePointer(domain, label, pointer, value) {
    try {
        if (state.draft.replaceAtPointer({ domain, label, pointer, value })) {
            setMessage("dirty", "변경사항이 있습니다. 메모리 초안 저장으로 미리보거나 저장 적용하세요.");
            render();
        }
    } catch (cause) {
        errorMessage(cause);
    }
}

function updateEntityPosition(selected, nextPoint, { buffered = false } = {}) {
    const current = entities().find((entry) => entry.domain === selected.domain && entry.id === selected.id);
    if (!current) return;
    const snappedPoint = snapPoint(nextPoint);
    const delta = { x: snappedPoint.x - current.point.x, y: snappedPoint.y - current.point.y };
    if (delta.x === 0 && delta.y === 0) return;
    const apply = (spec) => {
        replaceSpec(
            spec,
            state.specType === "boss-stage"
                ? translateBossStageEditorEntity(spec, current, delta)
                : translateEditorEntity(spec, current, delta)
        );
        return true;
    };
    if (buffered) return state.draft.updateBufferedMutation(apply);
    applyMutation({ domain: selected.domain, label: "Move map object", apply });
}

function removeBossEntry(domain, id) {
    applyMutation({
        domain,
        label: `Remove ${domain}`,
        apply: (spec) => {
            if (domain === "phases") {
                spec.phases = spec.phases.filter((phase) => phase.id !== id);
                spec.phases.forEach((phase, index) => (phase.order = index + 1));
            } else if (domain === "mechanics") {
                spec.mechanics = spec.mechanics.filter((mechanic) => mechanic.id !== id);
                for (const phase of spec.phases) {
                    phase.mechanicIds = phase.mechanicIds.filter((mechanicId) => mechanicId !== id);
                }
            }
            return true;
        }
    });
    state.draft.select(null);
}

function moveBossPhase(id, delta) {
    applyMutation({
        domain: "phases",
        label: "Reorder Boss Phase",
        apply: (spec) => {
            const index = spec.phases.findIndex((phase) => phase.id === id);
            const nextIndex = index + delta;
            if (index < 0 || nextIndex < 0 || nextIndex >= spec.phases.length) return false;
            const [phase] = spec.phases.splice(index, 1);
            spec.phases.splice(nextIndex, 0, phase);
            spec.phases.forEach((entry, order) => (entry.order = order + 1));
            return true;
        }
    });
}

function renderBossInspector(snapshot, selected, entity) {
    const fields = element("div", { className: "inspector-fields" });
    const spec = snapshot.spec;
    if (entity?.point) {
        appendPositionField(fields, {
            label: "X",
            value: entity.point.x,
            onChange: (value) => updateEntityPosition(selected, { x: value, y: entity.point.y })
        });
        appendPositionField(fields, {
            label: "Y",
            value: entity.point.y,
            onChange: (value) => updateEntityPosition(selected, { x: entity.point.x, y: value })
        });
    }
    if (selected.domain === "arena") {
        appendField(fields, {
            label: "Arena 너비",
            value: spec.arena.bounds.width,
            onChange: (value) => replacePointer("arena", "Set Arena width", "/arena/bounds/width", value)
        });
        appendField(fields, {
            label: "Arena 높이",
            value: spec.arena.bounds.height,
            onChange: (value) => replacePointer("arena", "Set Arena height", "/arena/bounds/height", value)
        });
    }
    if (selected.domain === "surfaces") {
        const surface = spec.arena.surfaces.find(({ id }) => id === selected.id);
        appendField(fields, {
            label: "너비",
            value: surface.bounds.width,
            onChange: (value) => replacePointer("surfaces", "Set surface width", `${entity.path}/bounds/width`, value)
        });
        appendField(fields, {
            label: "높이",
            value: surface.bounds.height,
            onChange: (value) => replacePointer("surfaces", "Set surface height", `${entity.path}/bounds/height`, value)
        });
        appendCheck(fields, {
            label: "한 방향 통과",
            checked: surface.oneWay,
            onChange: (value) => replacePointer("surfaces", "Set one-way", `${entity.path}/oneWay`, value)
        });
        appendCheck(fields, {
            label: "갈고리 부착 가능",
            checked: surface.grappleable,
            onChange: (value) => replacePointer("surfaces", "Set grappleable", `${entity.path}/grappleable`, value)
        });
        appendCheck(fields, {
            label: "Boss 유도 성공 구조물",
            checked: surface.validArchitecture === true,
            onChange: (value) =>
                replacePointer("surfaces", "Set valid architecture", `${entity.path}/validArchitecture`, value)
        });
    }
    if (selected.domain === "zones") {
        const zone = spec.arena.phaseZones.find(({ id }) => id === selected.id);
        appendField(fields, {
            label: "너비",
            value: zone.bounds.width,
            onChange: (value) => replacePointer("zones", "Set Phase Zone width", `${entity.path}/bounds/width`, value)
        });
        appendField(fields, {
            label: "높이",
            value: zone.bounds.height,
            onChange: (value) => replacePointer("zones", "Set Phase Zone height", `${entity.path}/bounds/height`, value)
        });
        appendSelect(fields, {
            label: "Phase",
            value: zone.phaseId,
            options: spec.phases.map(({ id, name }) => ({ value: id, label: `${name} · ${id}` })),
            onChange: (value) => replacePointer("zones", "Set Phase Zone phase", `${entity.path}/phaseId`, value)
        });
    }
    if (selected.domain === "boss") {
        appendField(fields, {
            label: "Collider 너비",
            value: spec.boss.collider.width,
            onChange: (value) => replacePointer("boss", "Set Boss width", "/boss/collider/width", value)
        });
        appendField(fields, {
            label: "Collider 높이",
            value: spec.boss.collider.height,
            onChange: (value) => replacePointer("boss", "Set Boss height", "/boss/collider/height", value)
        });
        appendSelect(fields, {
            label: "표현 Preset",
            value: spec.boss.visualPresetId,
            options: Object.values(BOSS_VISUAL_PRESET_ID),
            onChange: (value) => replacePointer("boss", "Set Boss preset", "/boss/visualPresetId", value)
        });
    }
    if (selected.domain === "mechanics") {
        const mechanic = spec.mechanics.find(({ id }) => id === selected.id);
        appendSelect(fields, {
            label: "등록 Mechanic 종류",
            value: mechanic.type,
            options: Object.values(BOSS_MECHANIC_TYPE),
            onChange: (value) => replacePointer("mechanics", "Set mechanic type", `${entity.path}/type`, value)
        });
        for (const [key, value] of Object.entries(mechanic.parameters)) {
            const parameterPath = `${entity.path}/parameters/${key}`;
            if (key === "validArchitectureSurfaceIds") {
                appendSelect(fields, {
                    label: "유도 성공 구조물",
                    value,
                    options: spec.arena.surfaces.map(({ id }) => ({ value: id, label: id })),
                    multiple: true,
                    onChange: (next) =>
                        replacePointer("mechanics", "Set valid architecture surfaces", parameterPath, next)
                });
                continue;
            }
            if (typeof value === "boolean") {
                appendCheck(fields, {
                    label: key,
                    checked: value,
                    onChange: (next) => replacePointer("mechanics", `Set ${key}`, parameterPath, next)
                });
                continue;
            }
            if (value && typeof value === "object" && !Array.isArray(value)) {
                for (const axis of ["x", "y"]) {
                    if (!Number.isFinite(value[axis])) continue;
                    appendField(fields, {
                        label: `${key} ${axis.toUpperCase()}`,
                        value: value[axis],
                        onChange: (next) =>
                            replacePointer("mechanics", `Set ${key} ${axis}`, `${parameterPath}/${axis}`, next)
                    });
                }
                continue;
            }
            appendField(fields, {
                label: key,
                ...(typeof value === "string" ? { type: "text" } : {}),
                value,
                onChange: (next) => replacePointer("mechanics", `Set ${key}`, parameterPath, next)
            });
        }
        fields.append(
            button({
                text: "Mechanic 삭제",
                className: "danger",
                onClick: () => removeBossEntry("mechanics", selected.id)
            })
        );
    }
    if (selected.domain === "phases") {
        const phase = spec.phases.find(({ id }) => id === selected.id);
        for (const axis of ["x", "y"]) {
            appendField(fields, {
                label: `Phase 시작 ${axis.toUpperCase()}`,
                value: phase.startPosition?.[axis] ?? spec.boss.position[axis],
                onChange: (value) =>
                    replacePointer("phases", `Set Phase start ${axis}`, `${entity.path}/startPosition/${axis}`, value)
            });
        }
        appendField(fields, {
            label: "Phase 이름",
            type: "text",
            value: phase.name,
            onChange: (value) => replacePointer("phases", "Set Phase name", `${entity.path}/name`, value)
        });
        appendField(fields, {
            label: "기본 Phase HP",
            value: phase.basePhaseHealth,
            onChange: (value) => replacePointer("phases", "Set Phase HP", `${entity.path}/basePhaseHealth`, value)
        });
        appendSelect(fields, {
            label: "Mechanic",
            value: phase.mechanicIds,
            options: spec.mechanics.map(({ id, type }) => ({ value: id, label: `${type} · ${id}` })),
            multiple: true,
            onChange: (value) => replacePointer("phases", "Set Phase mechanics", `${entity.path}/mechanicIds`, value)
        });
        appendSelect(fields, {
            label: "약점 Target ID",
            value: phase.vulnerability.targetId,
            options: Object.values(BOSS_VULNERABILITY_TARGET_ID),
            onChange: (value) =>
                replacePointer("phases", "Set weak target", `${entity.path}/vulnerability/targetId`, value)
        });
        appendSelect(fields, {
            label: "약점 개방 조건",
            value: phase.vulnerability.trigger,
            options: Object.values(BOSS_VULNERABILITY_TRIGGER),
            onChange: (value) =>
                replacePointer("phases", "Set weak trigger", `${entity.path}/vulnerability/trigger`, value)
        });
        appendField(fields, {
            label: "약점 개방 시간 (초)",
            value: phase.vulnerability.durationSeconds,
            onChange: (value) =>
                replacePointer("phases", "Set weak duration", `${entity.path}/vulnerability/durationSeconds`, value)
        });
        for (const axis of ["x", "y"]) {
            appendField(fields, {
                label: `약점 위치 ${axis.toUpperCase()}`,
                value: phase.vulnerability.offset?.[axis] ?? 0,
                onChange: (value) =>
                    replacePointer(
                        "phases",
                        `Set weak offset ${axis}`,
                        `${entity.path}/vulnerability/offset/${axis}`,
                        value
                    )
            });
        }
        appendField(fields, {
            label: "약점 반지름",
            value: phase.vulnerability.radius ?? 45,
            onChange: (value) =>
                replacePointer("phases", "Set weak radius", `${entity.path}/vulnerability/radius`, value)
        });
        appendField(fields, {
            label: "HUD 목표",
            type: "text",
            value: phase.hud.objective,
            onChange: (value) => replacePointer("phases", "Set HUD objective", `${entity.path}/hud/objective`, value)
        });
        const actions = element("div", { className: "inspector-actions" });
        actions.append(
            button({ text: "위로", disabled: phase.order === 1, onClick: () => moveBossPhase(selected.id, -1) }),
            button({
                text: "아래로",
                disabled: phase.order === spec.phases.length,
                onClick: () => moveBossPhase(selected.id, 1)
            }),
            button({ text: "Phase 삭제", className: "danger", onClick: () => removeBossEntry("phases", selected.id) })
        );
        fields.append(actions);
    }
    if (selected.domain === "combat") {
        appendField(fields, {
            label: "추가 Player HP 배율",
            value: spec.combat.additionalPlayerMultiplier,
            step: 0.05,
            onChange: (value) =>
                replacePointer("combat", "Set player HP multiplier", "/combat/additionalPlayerMultiplier", value)
        });
        appendField(fields, {
            label: "약점 고정 추가 피해 비율",
            value: spec.combat.weakFixedPercent,
            step: 0.05,
            onChange: (value) => replacePointer("combat", "Set weak fixed percent", "/combat/weakFixedPercent", value)
        });
        appendField(fields, {
            label: "닫힌 몸체 일반 피해 배율",
            value: spec.combat.closedBodyDamageMultiplier,
            step: 0.05,
            onChange: (value) =>
                replacePointer(
                    "combat",
                    "Set closed body damage multiplier",
                    "/combat/closedBodyDamageMultiplier",
                    value
                )
        });
        if (spec.combat.weakNormalDamageMultiplier !== undefined) {
            appendField(fields, {
                label: "약점 일반 피해 배율",
                value: spec.combat.weakNormalDamageMultiplier,
                step: 0.05,
                onChange: (value) =>
                    replacePointer(
                        "combat",
                        "Set weak normal damage multiplier",
                        "/combat/weakNormalDamageMultiplier",
                        value
                    )
            });
        }
        const derived = bossStageDerivedPreview(spec);
        for (const entry of derived.participants) {
            appendField(fields, {
                label: `${entry.participantCount}인 총 HP / Phase / Floor / 약점`,
                type: "text",
                value: `${entry.totalHealth} / ${entry.phases.map(({ maxHealth }) => maxHealth).join("+")} / ${entry.phases.map(({ healthFloor }) => healthFloor).join(",")} / ${entry.phases.map(({ weakFixedDamage }) => weakFixedDamage).join(",")}`,
                disabled: true
            });
        }
    }
    if (selected.domain === "hud") {
        appendField(fields, {
            label: "Boss UI 제목",
            type: "text",
            value: spec.hud.title,
            onChange: (value) => replacePointer("hud", "Set Boss HUD title", "/hud/title", value)
        });
        appendCheck(fields, {
            label: "Phase 구간 표시",
            checked: spec.hud.healthBar.showPhaseBreaks,
            onChange: (value) => replacePointer("hud", "Set Phase breaks", "/hud/healthBar/showPhaseBreaks", value)
        });
        appendCheck(fields, {
            label: "HP 수치 표시",
            checked: spec.hud.healthBar.showNumbers,
            onChange: (value) => replacePointer("hud", "Set HP numbers", "/hud/healthBar/showNumbers", value)
        });
        appendCheck(fields, {
            label: "약점 잔여 시간 표시",
            checked: spec.hud.showVulnerabilityCountdown,
            onChange: (value) => replacePointer("hud", "Set countdown", "/hud/showVulnerabilityCountdown", value)
        });
    }
    if (selected.domain === "transition") {
        const areaOptions = [
            ...new Map(
                state.stages
                    .filter(({ specType, areaId }) => (specType ?? "area") === "area" && areaId)
                    .map(({ areaId, stageId, name }) => [
                        areaId,
                        { value: areaId, label: `${stageId} · ${name} · ${areaId}` }
                    ])
            ).values()
        ];
        const optionsByKey = {
            entryTrigger: [BOSS_TRANSITION_TRIGGER.CHECKPOINT_COMPLETE],
            victoryTrigger: [BOSS_TRANSITION_TRIGGER.ALL_PHASES_DEPLETED],
            nextAreaId: areaOptions,
            victoryPresentationId: Object.values(BOSS_VICTORY_PRESENTATION_ID)
        };
        for (const [label, key] of [
            ["진입 조건", "entryTrigger"],
            ["승리 조건", "victoryTrigger"],
            ["다음 Area", "nextAreaId"],
            ["승리 표현 ID", "victoryPresentationId"]
        ]) {
            appendSelect(fields, {
                label,
                value: spec.transition[key],
                options: optionsByKey[key],
                onChange: (value) => {
                    if (key !== "nextAreaId") {
                        replacePointer("transition", `Set ${key}`, `/transition/${key}`, value);
                        return;
                    }
                    applyMutation({
                        domain: "transition",
                        label: "Set nextAreaId",
                        apply: (next) => {
                            next.nextAreaId = value;
                            next.transition.nextAreaId = value;
                            return true;
                        }
                    });
                }
            });
        }
    }
    dom.inspector.append(fields);
}

function removeSelectedEntity() {
    const selected = selectedEntity();
    if (!canRemoveEditorEntity(selected)) return;
    const removed = state.draft.mutate({
        domain: selected.domain,
        label: "맵 요소 삭제",
        apply: (spec) => {
            replaceSpec(spec, removeEditorEntity(spec, selected));
            return true;
        }
    });
    if (!removed) return;
    state.memoryPreviewReady = false;
    if (selected.domain === "entry" || selected.domain === "exit") {
        state.replacementPoints[selected.domain] = { ...selected.point };
    }
    state.draft.select(null);
    setMessage("dirty", `${selected.id} 요소를 초안에서 삭제했습니다. 되돌리기로 복구할 수 있습니다.`);
    render();
}

function renderInspector() {
    clear(dom.inspector);
    const snapshot = state.draft.snapshot();
    const selected = snapshot.selection;
    if (!selected) {
        dom.inspector.append(
            element("p", {
                className: "inspector-empty",
                text: "왼쪽에서 ID를 검색하거나 캔버스에서 편집할 오브젝트를 선택하세요."
            })
        );
        return;
    }
    const title = element("h2", { className: "inspector-title", text: selected.id });
    dom.inspector.append(title, element("p", { className: "inspector-subtitle", text: domainLabel(selected.domain) }));
    if (state.specType === "boss-stage") {
        const entity = entities().find((entry) => entry.domain === selected.domain && entry.id === selected.id);
        if (!entity) return;
        renderBossInspector(snapshot, selected, entity);
        return;
    }
    if (READ_ONLY_GROUPS.some(([domain]) => domain === selected.domain)) {
        const [, label, collection] = READ_ONLY_GROUPS.find(([domain]) => domain === selected.domain);
        const value = collection === "behaviorRefs" ? snapshot.spec.behaviorRefs : snapshot.spec.definition[collection];
        const note = element("div", {
            className: "readonly-note",
            text: `${label}은 현재 표시 전용입니다. 해당 Runtime 계약은 맵 에디터에서 변경하지 않습니다.`
        });
        const fields = element("div", { className: "inspector-fields" });
        appendField(fields, { label: "항목 수", value: Array.isArray(value) ? value.length : 0, disabled: true });
        dom.inspector.append(note, fields);
        return;
    }
    const entity = entities().find((entry) => entry.domain === selected.domain && entry.id === selected.id);
    if (!entity) {
        dom.inspector.append(
            element("p", { className: "inspector-empty", text: "선택한 오브젝트가 현재 초안에 없습니다." })
        );
        return;
    }
    const fields = element("div", { className: "inspector-fields" });
    const spec = snapshot.spec;
    if (selected.domain === "bounds") {
        appendField(fields, {
            label: "너비",
            value: spec.definition.bounds.width,
            onChange: (value) => replacePointer("bounds", "Set bounds width", "/definition/bounds/width", value)
        });
        appendField(fields, {
            label: "높이",
            value: spec.definition.bounds.height,
            onChange: (value) => replacePointer("bounds", "Set bounds height", "/definition/bounds/height", value)
        });
    } else if (selected.domain === "camera") {
        const zone = spec.definition.cameraZones.find(({ id }) => id === selected.id);
        for (const [label, key, isPosition] of [
            ["최소 Y", "minY", true],
            ["최대 Y", "maxY", true],
            ["데스크톱 배율", "desktopZoom", false],
            ["모바일 배율", "mobileZoom", false]
        ]) {
            const append = isPosition ? appendPositionField : appendField;
            append(fields, {
                label,
                value: zone[key],
                onChange: (value) => replacePointer("camera", `Set ${key}`, `${entity.path}/${key}`, value)
            });
        }
    } else if (entity.kind === "wind-zone") {
        const zone = spec.definition.windZones.find(({ id }) => id === selected.id);
        appendPositionField(fields, {
            label: "X",
            value: entity.point.x,
            onChange: (value) => updateEntityPosition(selected, { x: value, y: entity.point.y })
        });
        appendPositionField(fields, {
            label: "Y",
            value: entity.point.y,
            onChange: (value) => updateEntityPosition(selected, { x: entity.point.x, y: value })
        });
        appendField(fields, {
            label: "너비",
            value: zone.bounds.width,
            onChange: (value) => replacePointer("wind", "Set zone width", `${entity.path}/bounds/width`, value)
        });
        appendField(fields, {
            label: "높이",
            value: zone.bounds.height,
            onChange: (value) => replacePointer("wind", "Set zone height", `${entity.path}/bounds/height`, value)
        });
        appendSelect(fields, {
            label: "모드",
            value: zone.mode,
            options: [
                { value: WIND_MODE.CONTINUOUS, label: "연속 · continuous" },
                { value: WIND_MODE.PULSED, label: "주기 · pulsed" }
            ],
            onChange: (value) => replacePointer("wind", "Set wind mode", `${entity.path}/mode`, value)
        });
        appendField(fields, {
            label: "세기",
            value: zone.strength,
            onChange: (value) => replacePointer("wind", "Set wind strength", `${entity.path}/strength`, value)
        });
        appendField(fields, {
            label: "감쇠",
            value: zone.falloff,
            onChange: (value) => replacePointer("wind", "Set wind falloff", `${entity.path}/falloff`, value)
        });
    } else {
        appendPositionField(fields, {
            label: "X",
            value: entity.point.x,
            onChange: (value) => updateEntityPosition(selected, { x: value, y: entity.point.y })
        });
        appendPositionField(fields, {
            label: "Y",
            value: entity.point.y,
            onChange: (value) => updateEntityPosition(selected, { x: entity.point.x, y: value })
        });
        if (selected.domain === "surfaces") {
            const surface = spec.definition.surfaces.find(({ id }) => id === selected.id);
            appendCheck(fields, {
                label: "한 방향 통과",
                checked: surface.oneWay,
                onChange: (value) => replacePointer("surfaces", "Set one-way surface", `${entity.path}/oneWay`, value)
            });
            appendCheck(fields, {
                label: "갈고리 부착 가능",
                checked: surface.grappleable,
                onChange: (value) =>
                    replacePointer("surfaces", "Set grapple surface", `${entity.path}/grappleable`, value)
            });
        }
        if (selected.domain === "enemySlots") {
            const enemy = spec.definition.objects.find(({ id }) => id === selected.id);
            const selectedEnemyTypes =
                enemy.enemySelection?.allowedEnemyTypes ??
                [enemy.enemySelection?.fixedEnemyType ?? enemy.enemyType].filter(Boolean);
            appendSelect(fields, {
                label: "적 종류 · 1개=고정 / 복수=seed 선택",
                value: selectedEnemyTypes,
                options: AUTHORABLE_ENEMY_TYPE_IDS.map((enemyType) => ({
                    value: enemyType,
                    label: `${enemyDisplayName(enemyType)} · ${enemyType}`
                })),
                multiple: true,
                onChange: (allowedEnemyTypes) => {
                    if (allowedEnemyTypes.length === 0) {
                        setMessage("invalid", "적 종류는 최소 1개를 선택해야 합니다.");
                        renderInspector();
                        return;
                    }
                    applyMutation({
                        domain: "enemySlots",
                        label: "Set enemy types",
                        apply: (next) => {
                            const object = next.definition.objects.find(({ id }) => id === selected.id);
                            delete object.enemyType;
                            object.enemySelection = { allowedEnemyTypes };
                            return true;
                        }
                    });
                }
            });
            appendEnemyAdditionalInfo(fields, enemy, selected.id);
            if (enemy.activationSpec) {
                appendSelect(fields, {
                    label: "활성화 기준점",
                    value: enemy.activationSpec.anchor ?? "center",
                    options: AUTHORED_COORDINATE_ANCHORS,
                    onChange: (value) =>
                        replacePointer(
                            "enemySlots",
                            "Set activation anchor",
                            `${entity.path}/activationSpec/anchor`,
                            value
                        )
                });
                appendField(fields, {
                    label: "활성화 X 오프셋",
                    value: enemy.activationSpec.offset?.x ?? 0,
                    onChange: (value) =>
                        replacePointer(
                            "enemySlots",
                            "Set activation offset x",
                            `${entity.path}/activationSpec/offset/x`,
                            value
                        )
                });
                appendField(fields, {
                    label: "활성화 Y 오프셋",
                    value: enemy.activationSpec.offset?.y ?? 0,
                    onChange: (value) =>
                        replacePointer(
                            "enemySlots",
                            "Set activation offset y",
                            `${entity.path}/activationSpec/offset/y`,
                            value
                        )
                });
                appendField(fields, {
                    label: "활성화 너비",
                    value: enemy.activationSpec.size?.width ?? 0,
                    onChange: (value) =>
                        replacePointer(
                            "enemySlots",
                            "Set activation width",
                            `${entity.path}/activationSpec/size/width`,
                            value
                        )
                });
                appendField(fields, {
                    label: "활성화 높이",
                    value: enemy.activationSpec.size?.height ?? 0,
                    onChange: (value) =>
                        replacePointer(
                            "enemySlots",
                            "Set activation height",
                            `${entity.path}/activationSpec/size/height`,
                            value
                        )
                });
            } else if (enemy.activation) {
                for (const [label, key] of [
                    ["활성화 X", "x"],
                    ["활성화 Y", "y"],
                    ["활성화 너비", "width"],
                    ["활성화 높이", "height"]
                ]) {
                    appendField(fields, {
                        label,
                        value: enemy.activation[key],
                        onChange: (value) =>
                            replacePointer(
                                "enemySlots",
                                `Set activation ${key}`,
                                `${entity.path}/activation/${key}`,
                                value
                            )
                    });
                }
            } else {
                fields.append(
                    element("p", {
                        className: "inspector-subtitle",
                        text: "이 적 슬롯에는 활성화 영역 설정이 없습니다."
                    })
                );
            }
        }
    }
    dom.inspector.append(fields);
    if (canRemoveEditorEntity(entity)) {
        dom.inspector.append(
            button({
                text: "선택 요소 삭제",
                className: "delete-button",
                onClick: removeSelectedEntity,
                title: "초안에서 삭제합니다. 되돌리기로 복구할 수 있습니다."
            })
        );
    }
}

function drawRect(bounds, style, fill = false) {
    const topLeft = worldToScreen({ x: bounds.x, y: bounds.y }, state.view);
    const bottomRight = worldToScreen({ x: bounds.x + bounds.width, y: bounds.y + bounds.height }, state.view);
    context.strokeStyle = style;
    if (fill) {
        context.fillStyle = style;
        context.globalAlpha = 0.14;
        context.fillRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
        context.globalAlpha = 1;
    }
    context.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
}

function drawMarker(point, color, shape = "circle", selected = false) {
    const screen = worldToScreen(point, state.view);
    const radius = selected ? 8 : 6;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = selected ? 2.6 : 1.5;
    context.beginPath();
    if (shape === "square") context.rect(screen.x - radius, screen.y - radius, radius * 2, radius * 2);
    else if (shape === "diamond") {
        context.moveTo(screen.x, screen.y - radius);
        context.lineTo(screen.x + radius, screen.y);
        context.lineTo(screen.x, screen.y + radius);
        context.lineTo(screen.x - radius, screen.y);
        context.closePath();
    } else if (shape === "triangle") {
        context.moveTo(screen.x, screen.y - radius);
        context.lineTo(screen.x + radius, screen.y + radius);
        context.lineTo(screen.x - radius, screen.y + radius);
        context.closePath();
    } else context.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    context.stroke();
}

function surfaceScreenPoints(surface) {
    return surface.vertices.map((vertex) => worldToScreen(vertex, state.view));
}

function drawSurface(surface, selected) {
    const points = surfaceScreenPoints(surface);
    if (points.length === 0) return;
    context.save();
    context.beginPath();
    points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
    });
    context.closePath();
    context.fillStyle = selected ? "rgba(53, 177, 206, 0.72)" : "rgba(42, 115, 137, 0.76)";
    context.strokeStyle = selected ? "#66e6ff" : "#a9e8f5";
    context.lineWidth = selected ? 3 : 2;
    context.fill();
    context.stroke();

    const topY = Math.min(...points.map(({ y }) => y));
    const topPoints = points.filter(({ y }) => Math.abs(y - topY) < 0.5);
    if (topPoints.length >= 2) {
        const left = Math.min(...topPoints.map(({ x }) => x));
        const right = Math.max(...topPoints.map(({ x }) => x));
        context.strokeStyle = selected ? "#e7fdff" : "#d8f7fb";
        context.lineWidth = selected ? 3.5 : 2.5;
        context.beginPath();
        context.moveTo(left, topY);
        context.lineTo(right, topY);
        context.stroke();
    }

    if (state.view.zoom >= 0.1) {
        const left = Math.min(...points.map(({ x }) => x));
        const right = Math.max(...points.map(({ x }) => x));
        const label = `발판 · ${surface.id}`;
        context.font = "700 10px ui-monospace, Consolas, monospace";
        const width = context.measureText(label).width + 10;
        const x = Math.max(4, Math.min(dom.canvas.clientWidth - width - 4, (left + right - width) * 0.5));
        const y = Math.max(4, topY - 19);
        context.fillStyle = "rgba(4, 21, 30, 0.92)";
        context.fillRect(x, y, width, 15);
        context.strokeStyle = selected ? "#66e6ff" : "rgba(169, 232, 245, 0.72)";
        context.lineWidth = 1;
        context.strokeRect(x + 0.5, y + 0.5, width - 1, 14);
        context.fillStyle = "#e7fdff";
        context.fillText(label, x + 5, y + 10.5);
    }
    context.restore();
}

function annotationPoint(entity, spec) {
    if (entity.domain === "bounds") return { x: -spec.definition.bounds.width * 0.5 + 72, y: -16 };
    if (entity.domain === "camera") return { x: -spec.definition.bounds.width * 0.5 + 72, y: entity.bounds.y + 16 };
    return entity.point;
}

function rectanglesOverlap(first, second) {
    return (
        first.x < second.x + second.width &&
        first.x + first.width > second.x &&
        first.y < second.y + second.height &&
        first.y + first.height > second.y
    );
}

function drawAnnotation(entity, spec, rect, selected, occupied) {
    if (state.view.zoom < 0.14 || !entity.point) return;
    const annotation = entityAnnotation(entity, spec);
    const point = worldToScreen(annotationPoint(entity, spec), state.view);
    context.save();
    context.font = "600 11px system-ui, sans-serif";
    const width =
        Math.max(
            context.measureText(`이름 · ${annotation.name}`).width,
            context.measureText(`효과 · ${annotation.effect}`).width
        ) + 14;
    const height = 34;
    const x = Math.max(4, Math.min(rect.width - width - 4, point.x - width * 0.5));
    const preferredY = point.y - height - 13 < 4 ? point.y + 13 : point.y - height - 13;
    const y = Math.max(4, Math.min(rect.height - height - 54, preferredY));
    const box = { x, y, width, height };
    if (!selected && occupied.some((placed) => rectanglesOverlap(box, placed))) {
        context.restore();
        return;
    }
    occupied.push(box);
    context.fillStyle = "rgba(7, 16, 24, 0.86)";
    context.fillRect(x, y, width, height);
    context.strokeStyle = selected ? "#66e6ff" : "rgba(134, 176, 190, 0.42)";
    context.lineWidth = selected ? 1.4 : 1;
    context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    context.fillStyle = selected ? "#66e6ff" : "#e6f2f5";
    context.fillText(`이름 · ${annotation.name}`, x + 7, y + 13);
    context.fillStyle = "#83a1b1";
    context.font = "10px system-ui, sans-serif";
    context.fillText(`효과 · ${annotation.effect}`, x + 7, y + 27);
    context.restore();
}

function drawBossCanvas(rect, spec) {
    const selected = state.draft.selected();
    const isSelected = (domain, id) => selected?.domain === domain && selected.id === id;
    context.setLineDash([7, 6]);
    drawRect(spec.arena.bounds, "#5a7d89");
    context.setLineDash([]);
    for (const surface of spec.arena.surfaces) {
        drawRect(surface.bounds, isSelected("surfaces", surface.id) ? "#66e6ff" : "#789dab", true);
    }
    for (const zone of spec.arena.phaseZones ?? []) {
        context.setLineDash([9, 6]);
        drawRect(zone.bounds, isSelected("zones", zone.id) ? "#d8b4fe" : "#7e5aa6");
        context.setLineDash([]);
    }
    for (const mechanic of spec.mechanics) {
        if (mechanic.bounds) {
            context.setLineDash([5, 4]);
            drawRect(mechanic.bounds, isSelected("mechanics", mechanic.id) ? "#ffcb78" : "#9d6734", true);
            context.setLineDash([]);
        }
        drawMarker(mechanic.position, "#f4ae4b", "diamond", isSelected("mechanics", mechanic.id));
    }
    drawRect(spec.boss.collider, isSelected("boss", spec.boss.actorId) ? "#ff796a" : "#b94c4c", true);
    drawMarker(spec.boss.position, "#ff796a", "square", isSelected("boss", spec.boss.actorId));
    drawMarker(spec.arena.entry, "#e6f2f5", "triangle", isSelected("entry", spec.arena.entry.id));
    drawMarker(spec.arena.exit, "#66e6ff", "diamond", isSelected("exit", spec.arena.exit.id));
    for (const anchor of spec.arena.anchors) drawMarker(anchor, "#33889d", "circle", isSelected("anchors", anchor.id));
    for (const point of spec.arena.recoveryPoints)
        drawMarker(point, "#86c99d", "square", isSelected("recovery", point.id));
    context.fillStyle = "rgba(230,242,245,0.7)";
    context.font = "11px ui-monospace, Consolas, monospace";
    context.fillText(`${spec.id} · ${spec.name}`, 12, 20);
    const occupied = [];
    for (const entity of entities()) {
        drawAnnotation(entity, spec, rect, isSelected(entity.domain, entity.id), occupied);
    }
}

function drawCanvas() {
    const rect = resizeCanvas();
    context.clearRect(0, 0, rect.width, rect.height);
    if (!state.draft) return;
    const spec = state.draft.specification();
    if (state.specType === "boss-stage") return drawBossCanvas(rect, spec);
    const selected = state.draft.selected();
    const isSelected = (domain, id) => selected?.domain === domain && selected.id === id;
    const canvasEntities = entities();
    const entryEntity = canvasEntities.find(({ domain }) => domain === "entry");
    const exitEntity = canvasEntities.find(({ domain }) => domain === "exit");
    const bounds = spec.definition.bounds;
    context.setLineDash([7, 6]);
    drawRect({ x: -bounds.width * 0.5, y: -bounds.height, width: bounds.width, height: bounds.height }, "#5a7d89");
    context.setLineDash([]);
    for (const zone of spec.definition.cameraZones) {
        drawRect(
            { x: -bounds.width * 0.5, y: zone.minY, width: bounds.width, height: zone.maxY - zone.minY },
            isSelected("camera", zone.id) ? "#66e6ff" : "#476c7a",
            true
        );
    }
    for (const zone of spec.definition.windZones) {
        context.setLineDash([4, 4]);
        drawRect(zone.bounds, "#f4ae4b", true);
        context.setLineDash([]);
    }
    for (const surface of spec.definition.surfaces) {
        if (!surface.vertices?.length) continue;
        const selectedSurface =
            isSelected("surfaces", surface.id) ||
            (selected?.domain === "entry" && surface.id === entryEntity?.sourceId) ||
            (selected?.domain === "exit" && surface.id === exitEntity?.sourceId);
        drawSurface(surface, selectedSurface);
    }
    if (entryEntity) drawMarker(entryEntity.point, "#e6f2f5", "triangle", isSelected("entry", entryEntity.id));
    if (exitEntity) drawMarker(exitEntity.point, "#66e6ff", "diamond", isSelected("exit", exitEntity.id));
    for (const point of spec.definition.routePoints)
        drawMarker(point, "#b4ced7", "diamond", isSelected("recoveryRoute", point.id));
    for (const point of spec.definition.recoveryPoints)
        drawMarker(point, "#b4ced7", "square", isSelected("recoveryRoute", point.id));
    for (const enemy of canvasEntities.filter((entry) => entry.domain === "enemySlots" && entry.bounds)) {
        context.setLineDash([6, 4]);
        drawRect(enemy.bounds, isSelected("enemySlots", enemy.id) ? "#ffcb78" : "#8f6a31");
        context.setLineDash([]);
    }
    for (const object of spec.definition.objects) {
        if (!object.position) continue;
        if (object.kind === "wind-source")
            drawMarker(object.position, "#f4ae4b", "circle", isSelected("wind", object.id));
        else if (object.enemyType || object.enemySelection || object.kind === "sentry")
            drawMarker(object.position, "#f4ae4b", "triangle", isSelected("enemySlots", object.id));
    }
    for (const anchor of spec.anchors) {
        const active = isSelected("anchors", anchor.landmark.id);
        const screen = worldToScreen(anchor.landmark, state.view);
        context.strokeStyle = active ? "#66e6ff" : "#33889d";
        context.lineWidth = active ? 3 : 1.7;
        context.beginPath();
        context.arc(screen.x, screen.y, active ? 12 : 10, 0, Math.PI * 2);
        context.stroke();
        const size = 24 * state.view.zoom;
        context.strokeRect(screen.x - size * 0.5, screen.y - size * 0.5, size, size);
    }
    context.fillStyle = "rgba(230,242,245,0.7)";
    context.font = "11px ui-monospace, Consolas, monospace";
    context.fillText(`${spec.stage.id} · ${spec.definition.name}`, 12, 20);
    const occupiedAnnotations = [];
    const annotatedEntities = [...canvasEntities].sort(
        (left, right) => Number(isSelected(right.domain, right.id)) - Number(isSelected(left.domain, left.id))
    );
    for (const entity of annotatedEntities)
        drawAnnotation(entity, spec, rect, isSelected(entity.domain, entity.id), occupiedAnnotations);
}

function renderStatus() {
    const snapshot = draftSnapshot();
    const validation = snapshot
        ? `${snapshot.valid ? "검증 통과" : "검증 오류"} · ${snapshot.issues.length}개`
        : "불러오는 중";
    const saveState = snapshot?.dirty
        ? state.memoryPreviewReady
            ? "메모리 초안 저장됨"
            : "저장되지 않은 초안"
        : "저장됨";
    const issues = state.message.issues
        ?.slice(0, 3)
        .map(({ code }) => code)
        .join(", ");
    dom.status.textContent = [saveState, validation, state.message.text, issues].filter(Boolean).join("  /  ");
    dom.status.className = `draft-status${snapshot?.dirty ? " is-dirty" : ""}${state.message.kind ? ` is-${state.message.kind}` : ""}`;
    dom.stageSelect.disabled = state.applyPending || state.validationPending;
    dom.undo.disabled = state.applyPending || state.validationPending || !snapshot?.canUndo;
    dom.redo.disabled = state.applyPending || state.validationPending || !snapshot?.canRedo;
    dom.validate.disabled = state.applyPending || state.validationPending || !snapshot;
    dom.apply.disabled =
        state.applyPending || state.validationPending || !snapshot || !snapshot.valid || !snapshot.dirty;
    dom.preview.disabled =
        state.applyPending ||
        state.validationPending ||
        !snapshot ||
        (snapshot.dirty && !state.memoryPreviewReady) ||
        !state.previewAvailable;
    const entity = selectedEntity();
    const selected = snapshot?.selection;
    dom.focusSelection.disabled = state.applyPending || !entity?.point;
    dom.clearSelection.disabled = state.applyPending || !selected;
    const annotation = entity ? entityAnnotation(entity, snapshot.spec) : null;
    dom.selectionReadout.textContent = entity?.point
        ? `${annotation.name} · ${annotation.effect} · X ${Math.round(entity.point.x)} / Y ${Math.round(entity.point.y)}`
        : selected
          ? `${domainLabel(selected.domain)} · ${selected.id}`
          : "선택 없음 · 목록 또는 캔버스에서 선택";
    dom.selectionReadout.className = `selection-readout${selected ? " has-selection" : ""}`;
}

function render() {
    if (!state.draft) return renderStatus();
    renderScenarioReference();
    renderLayers();
    renderInspector();
    drawCanvas();
    renderStatus();
}

async function loadStage(stageId, { fit = true } = {}) {
    try {
        const payload = await api(stageEndpoint(stageId));
        state.stageId = payload.stageId;
        state.specType = payload.specType ?? "area";
        state.authoringMode = payload.authoringMode;
        state.runtimePromotion = payload.runtimePromotion;
        state.previewAvailable = payload.previewAvailable;
        state.derivedPreview = payload.derivedPreview ?? null;
        state.draft =
            state.specType === "boss-stage"
                ? new BossStageEditorDraft({ spec: payload.spec, revision: payload.revision })
                : new AreaEditorDraft({
                      spec: payload.spec,
                      appliedSpec: payload.sourceSpec ?? payload.spec,
                      revision: payload.revision
                  });
        state.memoryPreviewReady = state.specType === "area" && Boolean(payload.memoryStored);
        state.replacementPoints = { entry: null, exit: null };
        state.draft.select(null);
        const scope =
            state.specType === "boss-stage"
                ? "POST-SECTOR BOSS / 독립 Boss Stage"
                : `SECTOR ${payload.stageId.split("-")[0].padStart(2, "0")}`;
        dom.stageScope.textContent = `${scope} / ${authoringModeLabel(payload.authoringMode)}`;
        if (fit) fitView();
        setMessage(
            "valid",
            `${payload.stageId} 초안을 불러왔습니다. ${authoringModeDescription(payload.authoringMode)} ${runtimePromotionDescription(payload.runtimePromotion)}`
        );
        render();
    } catch (cause) {
        errorMessage(cause);
    }
}

async function initialize() {
    try {
        const payload = await api("/api/map-editor/stages");
        state.stages = payload.stages;
        clear(dom.stageSelect);
        for (const stage of state.stages) {
            const option = element("option", {
                text: stageOptionLabel(stage),
                attributes: { value: stage.stageId }
            });
            dom.stageSelect.append(option);
        }
        const requested = new URLSearchParams(globalThis.location.search).get("stage");
        const initial = state.stages.find(({ stageId }) => stageId === requested) ?? state.stages[0];
        if (!initial) throw new Error("편집 가능한 스테이지가 없습니다.");
        dom.stageSelect.value = initial.stageId;
        await loadStage(initial.stageId);
    } catch (cause) {
        errorMessage(cause);
    }
}

dom.stageSelect.addEventListener("change", () => {
    const nextStageId = dom.stageSelect.value;
    if (nextStageId === state.stageId) return;
    if (!confirmDiscardDirtyDraft()) {
        dom.stageSelect.value = state.stageId ?? nextStageId;
        return;
    }
    loadStage(nextStageId);
});
dom.layerFilter.addEventListener("input", () => {
    state.layerFilter = dom.layerFilter.value;
    if (state.draft) renderLayers();
});
dom.layerFilter.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !dom.layerFilter.value) return;
    event.preventDefault();
    dom.layerFilter.value = "";
    state.layerFilter = "";
    renderLayers();
});
dom.fitStage.addEventListener("click", () => {
    fitView();
    setMessage("info", "전체 스테이지를 화면에 맞췄습니다.");
    render();
});
dom.scenarioReferenceToggle.addEventListener("click", () => {
    setScenarioReferenceOpen(!state.scenarioReferenceOpen);
    setMessage(
        "info",
        state.scenarioReferenceOpen
            ? "시나리오 MAP HTML을 읽기 전용 비교 화면으로 열었습니다."
            : "시나리오 MAP HTML 비교 화면을 닫았습니다."
    );
});
dom.focusSelection.addEventListener("click", focusSelection);
dom.clearSelection.addEventListener("click", clearSelection);
dom.undo.addEventListener("click", () => {
    if (state.draft.undo()) {
        state.memoryPreviewReady = false;
        setMessage("dirty", "이전 초안 변경으로 되돌렸습니다.");
        render();
    }
});
dom.redo.addEventListener("click", () => {
    if (state.draft.redo()) {
        state.memoryPreviewReady = false;
        setMessage("dirty", "다음 초안 변경을 다시 적용했습니다.");
        render();
    }
});
dom.validate.addEventListener("click", async () => {
    if (state.validationPending) return;
    const local = state.draft.validate();
    if (!local.valid) {
        state.memoryPreviewReady = false;
        return setMessage("invalid", "메모리 저장 전에 v2 오류를 해결하세요.", local.issues);
    }
    state.validationPending = true;
    state.memoryPreviewReady = false;
    setMessage("info", "서버 메모리에 저장할 초안을 검증하는 중입니다.");
    renderStatus();
    try {
        const payload = await api(stageEndpoint(state.stageId, "/validate"), {
            method: "POST",
            body: JSON.stringify({ spec: state.draft.specification() })
        });
        state.memoryPreviewReady = Boolean(payload.memoryStored);
        setMessage("valid", "메모리 초안 저장 완료: 파일은 변경하지 않았으며 새 미리보기를 열 수 있습니다.");
    } catch (cause) {
        errorMessage(cause);
    } finally {
        state.validationPending = false;
        renderStatus();
    }
});
dom.apply.addEventListener("click", async () => {
    if (state.applyPending) return;
    const local = state.draft.validate();
    if (!local.valid) return setMessage("invalid", "저장 적용 전에 v2 오류를 해결하세요.", local.issues);
    state.applyPending = true;
    setMessage("valid", "저장 적용 요청을 전송 중입니다.");
    renderStatus();
    try {
        const payload = await api(stageEndpoint(state.stageId), {
            method: "PUT",
            body: JSON.stringify({ spec: state.draft.specification(), baseRevision: state.draft.revision() })
        });
        state.draft.markApplied(payload.revision);
        state.memoryPreviewReady = false;
        state.runtimePromotion = payload.runtimePromotion;
        state.derivedPreview = payload.derivedPreview ?? state.derivedPreview;
        const stage = state.stages.find(({ stageId }) => stageId === payload.stageId);
        if (stage)
            Object.assign(stage, {
                name: payload.name,
                revision: payload.revision,
                runtimePromotion: payload.runtimePromotion
            });
        setMessage(
            "valid",
            state.authoringMode === "scenario-only"
                ? `저장 적용 완료: revision ${payload.revision} 시나리오 v2 원본을 갱신했습니다. ${runtimePromotionDescription(state.runtimePromotion)}`
                : `저장 적용 완료: revision ${payload.revision} 생성 JS를 갱신했습니다.`
        );
        render();
    } catch (cause) {
        errorMessage(cause);
    } finally {
        state.applyPending = false;
        renderStatus();
    }
});
dom.preview.addEventListener("click", () => {
    if (!state.previewAvailable) {
        return setMessage("info", "시나리오 전용 Stage는 게임 Runtime 미리보기를 제공하지 않습니다.");
    }
    if (state.draft.snapshot().dirty && !state.memoryPreviewReady) {
        return setMessage("dirty", "현재 변경을 메모리 초안으로 저장한 뒤 미리보기를 시작하세요.");
    }
    const url = `./preview.html?stage=${encodeURIComponent(state.stageId)}`;
    const opened = globalThis.open(url, "map-editor-preview", "noopener");
    if (!opened) setMessage("error", "브라우저가 미리보기 창을 차단했습니다. 팝업을 허용한 뒤 다시 시도하세요.");
});

dom.canvas.addEventListener(
    "wheel",
    (event) => {
        if (!state.draft) return;
        event.preventDefault();
        const rect = dom.canvas.getBoundingClientRect();
        const pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        const world = screenToWorld(pointer, state.view);
        state.view.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.view.zoom * (event.deltaY > 0 ? 0.88 : 1.14)));
        state.view.x = pointer.x - world.x * state.view.zoom;
        state.view.y = pointer.y - world.y * state.view.zoom;
        drawCanvas();
    },
    { passive: false }
);

dom.canvas.addEventListener("pointerdown", (event) => {
    if (!state.draft) return;
    const rect = dom.canvas.getBoundingClientRect();
    const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const world = screenToWorld(screen, state.view);
    const panning = state.spaceDown || event.button === 1;
    if (panning) {
        state.pointer = { mode: "pan", screen };
        dom.canvas.classList.add("is-panning");
    } else {
        const selected = hitTestEditorEntity(entities(), world, 28 / state.view.zoom);
        state.draft.select(selected);
        if (selected?.point && !["bounds", "arena"].includes(selected.domain)) {
            state.draft.beginBufferedMutation({ domain: selected.domain, label: "Move map object" });
            state.pointer = { mode: "drag", selected, originPoint: { ...selected.point }, originWorld: world };
        } else {
            state.pointer = null;
        }
        render();
    }
    dom.canvas.setPointerCapture(event.pointerId);
});

dom.canvas.addEventListener("pointermove", (event) => {
    if (!state.pointer || !state.draft) return;
    const rect = dom.canvas.getBoundingClientRect();
    const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (state.pointer.mode === "pan") {
        state.view.x += screen.x - state.pointer.screen.x;
        state.view.y += screen.y - state.pointer.screen.y;
        state.pointer.screen = screen;
        return drawCanvas();
    }
    const world = screenToWorld(screen, state.view);
    const nextPoint = snapPoint({
        x: state.pointer.originPoint.x + world.x - state.pointer.originWorld.x,
        y: state.pointer.originPoint.y + world.y - state.pointer.originWorld.y
    });
    updateEntityPosition(state.pointer.selected, nextPoint, { buffered: true });
    drawCanvas();
});

function finishPointer(event) {
    if (!state.pointer) return;
    if (state.pointer.mode === "drag") {
        try {
            if (event.type === "pointercancel") state.draft.cancelBufferedMutation();
            else if (state.draft.commitBufferedMutation()) {
                state.memoryPreviewReady = false;
                setMessage("dirty", "변경사항이 있습니다. 메모리 초안 저장으로 미리보거나 저장 적용하세요.");
            }
        } catch (cause) {
            state.draft.cancelBufferedMutation();
            errorMessage(cause);
        }
        render();
    }
    state.pointer = null;
    dom.canvas.classList.remove("is-panning");
    if (dom.canvas.hasPointerCapture(event.pointerId)) dom.canvas.releasePointerCapture(event.pointerId);
}

dom.canvas.addEventListener("pointerup", finishPointer);
dom.canvas.addEventListener("pointercancel", finishPointer);
globalThis.addEventListener("keydown", (event) => {
    const typingField =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable);
    if (event.code === "Space") {
        if (!typingField && !(event.target instanceof HTMLButtonElement)) state.spaceDown = true;
        return;
    }
    if (typingField || event.altKey) return;
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyZ") {
        event.preventDefault();
        if (event.shiftKey) dom.redo.click();
        else dom.undo.click();
        return;
    }
    if (event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.code === "Digit0") dom.fitStage.click();
    if (event.code === "KeyC") dom.scenarioReferenceToggle.click();
    if (event.code === "KeyF") dom.focusSelection.click();
    if (event.code === "Escape") dom.clearSelection.click();
    if (event.code === "Delete") removeSelectedEntity();
});
globalThis.addEventListener("keyup", (event) => {
    if (event.code === "Space") state.spaceDown = false;
});
globalThis.addEventListener("resize", () => {
    if (state.draft) drawCanvas();
});
globalThis.addEventListener("beforeunload", (event) => {
    if (!draftIsDirty()) return;
    event.preventDefault();
    event.returnValue = "";
});

await initialize();
