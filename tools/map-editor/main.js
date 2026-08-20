import { AreaEditorDraft } from "../../src/game/world/area-authoring-v2/editor/AreaEditorDraft.js";
import {
    collectEditorEntities,
    hitTestEditorEntity,
    screenToWorld,
    translateEditorEntity,
    worldToScreen
} from "../../src/game/world/area-authoring-v2/editor/AreaEditorProjection.js";

const EDITABLE_GROUPS = Object.freeze([
    ["bounds", "Bounds", null],
    ["entry", "Entry", null],
    ["surfaces", "Terrain surfaces", "surface"],
    ["anchors", "Anchors", "anchor"],
    ["recoveryRoute", "Recovery / Route", "route"],
    ["enemySlots", "Enemy slots", null],
    ["wind", "Wind", "wind"],
    ["camera", "Camera zones", "camera"]
]);
const READ_ONLY_GROUPS = Object.freeze([
    ["objectives", "Objectives", "objectives"],
    ["progression", "Progression", "routes"],
    ["story", "Story", "storyTriggers"],
    ["scanner", "Scanner", "scannerGroups"],
    ["behaviorRegistry", "Behavior registry", "behaviorRefs"]
]);
const MAX_ZOOM = 2.4;
const MIN_ZOOM = 0.08;

const dom = {
    stageSelect: document.querySelector("#stage-select"),
    layerPanel: document.querySelector("#layer-panel"),
    inspector: document.querySelector("#inspector-panel"),
    canvas: document.querySelector("#editor-canvas"),
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
    view: { x: 0, y: 0, zoom: 1 },
    message: { kind: "", text: "Stage를 불러오는 중입니다.", issues: [] },
    pointer: null,
    spaceDown: false,
    applyPending: false
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
    return state.draft ? collectEditorEntities(state.draft.specification()) : [];
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

function setMessage(kind, text, issues = []) {
    state.message = { kind, text, issues };
    renderStatus();
}

function errorMessage(cause) {
    const issues = cause.issues ?? [];
    setMessage("error", `${cause.code ?? "request-failed"}: ${cause.message}`, issues);
}

function fitView() {
    const bounds = state.draft?.snapshot().spec.definition.bounds;
    const rect = dom.canvas.getBoundingClientRect();
    if (!bounds || rect.width === 0 || rect.height === 0) return;
    state.view.zoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, Math.min(rect.width / (bounds.width * 1.16), rect.height / (bounds.height * 1.16)))
    );
    state.view.x = rect.width * 0.5;
    state.view.y = rect.height * 0.87;
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
    const bounds = state.draft.specification().definition.bounds;
    const insetX = Math.min(96, bounds.width * 0.5);
    const insetY = Math.min(96, bounds.height * 0.5);
    return {
        x: Math.max(-bounds.width * 0.5 + insetX, Math.min(bounds.width * 0.5 - insetX, point.x)),
        y: Math.max(-bounds.height + insetY, Math.min(-insetY, point.y))
    };
}

function nextStableId(prefix) {
    const spec = state.draft.specification();
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
        globalThis.confirm("Apply되지 않은 Draft 변경사항이 있습니다. 현재 변경을 버리고 계속하시겠습니까?")
    );
}

function applyMutation({ domain, label, apply }) {
    if (!state.draft?.mutate({ domain, label, apply })) return render();
    setMessage("dirty", "Draft 변경사항이 있습니다. Validate 후 Apply하세요.");
    render();
}

function addPreset(kind) {
    const point = currentWorldAtCanvasCenter();
    if (kind === "surface") {
        const id = nextStableId("surface");
        applyMutation({
            domain: "surfaces",
            label: "Add surface",
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
            label: "Add anchor",
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
            label: "Add recovery point",
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
            label: "Add route point",
            apply: (spec) => {
                spec.definition.routePoints.push({ id, x: point.x, y: point.y });
                return true;
            }
        });
        state.draft.select({ domain: "recoveryRoute", id, kind: "route" });
    }
    if (kind === "wind") {
        const id = nextStableId("wind");
        applyMutation({
            domain: "wind",
            label: "Add wind source and zone",
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
            label: "Add camera zone",
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
    for (const [domain, label, preset] of EDITABLE_GROUPS) {
        const group = element("section", { className: "layer-group" });
        const heading = element("div", { className: "panel-heading", text: label });
        const count = all.filter((entry) => entry.domain === domain).length;
        heading.append(element("span", { className: "layer-badge", text: String(count) }));
        if (domain === "recoveryRoute") {
            heading.append(
                button({ text: "+ Recovery", className: "add-button", onClick: () => addPreset("recovery") })
            );
            heading.append(button({ text: "+ Route", className: "add-button", onClick: () => addPreset("route") }));
        } else if (preset) {
            heading.append(button({ text: "+ Add", className: "add-button", onClick: () => addPreset(preset) }));
        }
        group.append(heading);
        const list = element("div", { className: "layer-list" });
        for (const entry of all.filter((candidate) => candidate.domain === domain)) {
            const row = button({
                text: entry.id.replace(`${snapshot.spec.definition.id}:`, ""),
                className: `layer-item${selectedMatches(entry) ? " is-selected" : ""}`,
                onClick: () => {
                    state.draft.select(entry);
                    render();
                }
            });
            row.append(element("span", { className: "layer-badge", text: entry.kind }));
            list.append(row);
        }
        if (domain === "enemySlots" && count === 0)
            list.append(
                element("p", { className: "inspector-subtitle", text: "이 Stage에는 기존 Enemy slot이 없습니다." })
            );
        group.append(list);
        dom.layerPanel.append(group);
    }
    const readOnly = element("section", { className: "layer-group" });
    readOnly.append(element("div", { className: "panel-heading", text: "READ-ONLY" }));
    const list = element("div", { className: "layer-list" });
    for (const [domain, label, collection] of READ_ONLY_GROUPS) {
        const value = collection === "behaviorRefs" ? snapshot.spec.behaviorRefs : snapshot.spec.definition[collection];
        const count = Array.isArray(value) ? value.length : 0;
        const entry = { domain, id: domain, kind: "read-only" };
        const row = button({
            text: label,
            className: `layer-item is-read-only${selectedMatches(entry) ? " is-selected" : ""}`,
            onClick: () => {
                state.draft.select(entry);
                render();
            }
        });
        row.append(element("span", { className: "layer-badge", text: `LOCK ${count}` }));
        list.append(row);
    }
    readOnly.append(list);
    dom.layerPanel.append(readOnly);
}

function appendField(container, { label, value, type = "number", disabled = false, onChange, step = "any" }) {
    const wrapper = element("label", { className: "field", text: label });
    const input = element("input", { attributes: { type, step } });
    input.value = String(value ?? "");
    input.disabled = disabled;
    if (onChange)
        input.addEventListener("change", () => onChange(type === "number" ? Number(input.value) : input.value));
    wrapper.append(input);
    container.append(wrapper);
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

function replacePointer(domain, label, pointer, value) {
    try {
        if (state.draft.replaceAtPointer({ domain, label, pointer, value })) {
            setMessage("dirty", "Draft 변경사항이 있습니다. Validate 후 Apply하세요.");
            render();
        }
    } catch (cause) {
        errorMessage(cause);
    }
}

function updateEntityPosition(selected, nextPoint, { buffered = false } = {}) {
    const current = entities().find((entry) => entry.domain === selected.domain && entry.id === selected.id);
    if (!current) return;
    const delta = { x: nextPoint.x - current.point.x, y: nextPoint.y - current.point.y };
    const apply = (spec) => {
        replaceSpec(spec, translateEditorEntity(spec, current, delta));
        return true;
    };
    if (buffered) return state.draft.updateBufferedMutation(apply);
    applyMutation({ domain: selected.domain, label: "Move map object", apply });
}

function renderInspector() {
    clear(dom.inspector);
    const snapshot = state.draft.snapshot();
    const selected = snapshot.selection;
    if (!selected) {
        dom.inspector.append(
            element("p", {
                className: "inspector-empty",
                text: "Canvas 또는 왼쪽 목록에서 편집할 오브젝트를 선택하세요."
            })
        );
        return;
    }
    const title = element("h2", { className: "inspector-title", text: selected.id });
    dom.inspector.append(title, element("p", { className: "inspector-subtitle", text: selected.domain }));
    if (READ_ONLY_GROUPS.some(([domain]) => domain === selected.domain)) {
        const [, label, collection] = READ_ONLY_GROUPS.find(([domain]) => domain === selected.domain);
        const value = collection === "behaviorRefs" ? snapshot.spec.behaviorRefs : snapshot.spec.definition[collection];
        const note = element("div", {
            className: "readonly-note",
            text: `${label}은 현재 표시 전용입니다. 해당 Runtime 계약은 맵 에디터에서 변경하지 않습니다.`
        });
        const fields = element("div", { className: "inspector-fields" });
        appendField(fields, { label: "ENTRIES", value: Array.isArray(value) ? value.length : 0, disabled: true });
        dom.inspector.append(note, fields);
        return;
    }
    const entity = entities().find((entry) => entry.domain === selected.domain && entry.id === selected.id);
    if (!entity) {
        dom.inspector.append(
            element("p", { className: "inspector-empty", text: "선택한 오브젝트가 현재 Draft에 없습니다." })
        );
        return;
    }
    const fields = element("div", { className: "inspector-fields" });
    const spec = snapshot.spec;
    if (selected.domain === "bounds") {
        appendField(fields, {
            label: "WIDTH",
            value: spec.definition.bounds.width,
            onChange: (value) => replacePointer("bounds", "Set bounds width", "/definition/bounds/width", value)
        });
        appendField(fields, {
            label: "HEIGHT",
            value: spec.definition.bounds.height,
            onChange: (value) => replacePointer("bounds", "Set bounds height", "/definition/bounds/height", value)
        });
    } else if (selected.domain === "camera") {
        const zone = spec.definition.cameraZones.find(({ id }) => id === selected.id);
        for (const [label, key] of [
            ["MIN Y", "minY"],
            ["MAX Y", "maxY"],
            ["DESKTOP ZOOM", "desktopZoom"],
            ["MOBILE ZOOM", "mobileZoom"]
        ]) {
            appendField(fields, {
                label,
                value: zone[key],
                onChange: (value) => replacePointer("camera", `Set ${key}`, `${entity.path}/${key}`, value)
            });
        }
    } else if (entity.kind === "wind-zone") {
        const zone = spec.definition.windZones.find(({ id }) => id === selected.id);
        appendField(fields, {
            label: "X",
            value: entity.point.x,
            onChange: (value) => updateEntityPosition(selected, { x: value, y: entity.point.y })
        });
        appendField(fields, {
            label: "Y",
            value: entity.point.y,
            onChange: (value) => updateEntityPosition(selected, { x: entity.point.x, y: value })
        });
        appendField(fields, {
            label: "WIDTH",
            value: zone.bounds.width,
            onChange: (value) => replacePointer("wind", "Set zone width", `${entity.path}/bounds/width`, value)
        });
        appendField(fields, {
            label: "HEIGHT",
            value: zone.bounds.height,
            onChange: (value) => replacePointer("wind", "Set zone height", `${entity.path}/bounds/height`, value)
        });
        appendField(fields, {
            label: "MODE",
            type: "text",
            value: zone.mode,
            onChange: (value) => replacePointer("wind", "Set wind mode", `${entity.path}/mode`, value)
        });
        appendField(fields, {
            label: "STRENGTH",
            value: zone.strength,
            onChange: (value) => replacePointer("wind", "Set wind strength", `${entity.path}/strength`, value)
        });
        appendField(fields, {
            label: "FALLOFF",
            value: zone.falloff,
            onChange: (value) => replacePointer("wind", "Set wind falloff", `${entity.path}/falloff`, value)
        });
    } else {
        appendField(fields, {
            label: "X",
            value: entity.point.x,
            onChange: (value) => updateEntityPosition(selected, { x: value, y: entity.point.y })
        });
        appendField(fields, {
            label: "Y",
            value: entity.point.y,
            onChange: (value) => updateEntityPosition(selected, { x: entity.point.x, y: value })
        });
        if (selected.domain === "surfaces") {
            const surface = spec.definition.surfaces.find(({ id }) => id === selected.id);
            appendCheck(fields, {
                label: "ONE WAY",
                checked: surface.oneWay,
                onChange: (value) => replacePointer("surfaces", "Set one-way surface", `${entity.path}/oneWay`, value)
            });
            appendCheck(fields, {
                label: "GRAPPLEABLE",
                checked: surface.grappleable,
                onChange: (value) =>
                    replacePointer("surfaces", "Set grapple surface", `${entity.path}/grappleable`, value)
            });
        }
        if (selected.domain === "enemySlots") {
            const enemy = spec.definition.objects.find(({ id }) => id === selected.id);
            appendField(fields, {
                label: "ENEMY TYPE",
                type: "text",
                value: enemy.enemyType,
                onChange: (value) => replacePointer("enemySlots", "Set enemy type", `${entity.path}/enemyType`, value)
            });
            appendField(fields, {
                label: "ALLOWED ENEMIES",
                type: "text",
                value: enemy.enemySelection?.allowedEnemyTypes?.join(", ") ?? "",
                onChange: (value) => {
                    const allowedEnemyTypes = value
                        .split(",")
                        .map((entry) => entry.trim())
                        .filter(Boolean);
                    applyMutation({
                        domain: "enemySlots",
                        label: "Set allowed enemies",
                        apply: (next) => {
                            const object = next.definition.objects.find(({ id }) => id === selected.id);
                            object.enemySelection = { ...(object.enemySelection ?? {}), allowedEnemyTypes };
                            return true;
                        }
                    });
                }
            });
            if (enemy.activationSpec) {
                appendField(fields, {
                    label: "ACTIVATION ANCHOR",
                    type: "text",
                    value: enemy.activationSpec.anchor ?? "center",
                    onChange: (value) =>
                        replacePointer(
                            "enemySlots",
                            "Set activation anchor",
                            `${entity.path}/activationSpec/anchor`,
                            value
                        )
                });
                appendField(fields, {
                    label: "ACTIVATION OFFSET X",
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
                    label: "ACTIVATION OFFSET Y",
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
                    label: "ACTIVATION WIDTH",
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
                    label: "ACTIVATION HEIGHT",
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
                    ["ACTIVATION X", "x"],
                    ["ACTIVATION Y", "y"],
                    ["ACTIVATION WIDTH", "width"],
                    ["ACTIVATION HEIGHT", "height"]
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
                        text: "이 Enemy slot에는 activation bounds/spec가 없습니다."
                    })
                );
            }
        }
    }
    dom.inspector.append(fields);
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

function drawCanvas() {
    const rect = resizeCanvas();
    context.clearRect(0, 0, rect.width, rect.height);
    if (!state.draft) return;
    const spec = state.draft.specification();
    const selected = state.draft.selected();
    const isSelected = (domain, id) => selected?.domain === domain && selected.id === id;
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
        context.beginPath();
        surface.vertices.forEach((vertex, index) => {
            const screen = worldToScreen(vertex, state.view);
            if (index === 0) context.moveTo(screen.x, screen.y);
            else context.lineTo(screen.x, screen.y);
        });
        context.closePath();
        context.fillStyle = isSelected("surfaces", surface.id)
            ? "rgba(102, 230, 255, 0.2)"
            : "rgba(89, 121, 137, 0.35)";
        context.strokeStyle = isSelected("surfaces", surface.id) ? "#66e6ff" : "#789dab";
        context.lineWidth = isSelected("surfaces", surface.id) ? 2.5 : 1.2;
        context.fill();
        context.stroke();
    }
    drawMarker(spec.definition.entry, "#e6f2f5", "triangle", isSelected("entry", spec.definition.entry.id));
    for (const point of spec.definition.routePoints)
        drawMarker(point, "#b4ced7", "diamond", isSelected("recoveryRoute", point.id));
    for (const point of spec.definition.recoveryPoints)
        drawMarker(point, "#b4ced7", "square", isSelected("recoveryRoute", point.id));
    for (const enemy of entities().filter((entry) => entry.domain === "enemySlots" && entry.bounds)) {
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
        if (active || state.view.zoom > 0.28) {
            context.fillStyle = active ? "#66e6ff" : "#8ec4d0";
            context.font = "11px ui-monospace, Consolas, monospace";
            context.fillText(anchor.landmark.properties?.label ?? "ANCHOR", screen.x + 14, screen.y - 12);
        }
    }
    context.fillStyle = "rgba(230,242,245,0.7)";
    context.font = "11px ui-monospace, Consolas, monospace";
    context.fillText(`${spec.stage.legacyStageAlias} · ${spec.definition.name}`, 12, 20);
}

function renderStatus() {
    const snapshot = draftSnapshot();
    const validation = snapshot
        ? `${snapshot.valid ? "VALID" : "INVALID"} · ${snapshot.issues.length} issues`
        : "LOADING";
    const dirty = snapshot?.dirty ? "DRAFT" : "APPLIED";
    const issues = state.message.issues
        ?.slice(0, 3)
        .map(({ code }) => code)
        .join(", ");
    dom.status.textContent = [dirty, validation, state.message.text, issues].filter(Boolean).join("  /  ");
    dom.status.className = `draft-status${state.message.kind ? ` is-${state.message.kind}` : ""}`;
    dom.stageSelect.disabled = state.applyPending;
    dom.undo.disabled = state.applyPending || !snapshot?.canUndo;
    dom.redo.disabled = state.applyPending || !snapshot?.canRedo;
    dom.validate.disabled = state.applyPending || !snapshot;
    dom.apply.disabled = state.applyPending || !snapshot || !snapshot.valid || !snapshot.dirty;
    dom.preview.disabled = state.applyPending || !snapshot || snapshot.dirty;
}

function render() {
    if (!state.draft) return renderStatus();
    renderLayers();
    renderInspector();
    drawCanvas();
    renderStatus();
}

async function loadStage(stageId, { fit = true } = {}) {
    try {
        const payload = await api(stageEndpoint(stageId));
        state.stageId = payload.stageId;
        state.draft = new AreaEditorDraft({ spec: payload.spec, revision: payload.revision });
        state.draft.select(null);
        if (fit) fitView();
        setMessage("valid", `${payload.stageId} Draft를 불러왔습니다.`);
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
                text: `${stage.stageId} · ${stage.name}`,
                attributes: { value: stage.stageId }
            });
            dom.stageSelect.append(option);
        }
        const requested = new URLSearchParams(globalThis.location.search).get("stage");
        const initial = state.stages.find(({ stageId }) => stageId === requested) ?? state.stages[0];
        if (!initial) throw new Error("편집 가능한 generated Stage가 없습니다.");
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
dom.undo.addEventListener("click", () => {
    if (state.draft.undo()) {
        setMessage("dirty", "이전 Draft 변경으로 되돌렸습니다.");
        render();
    }
});
dom.redo.addEventListener("click", () => {
    if (state.draft.redo()) {
        setMessage("dirty", "다음 Draft 변경을 다시 적용했습니다.");
        render();
    }
});
dom.validate.addEventListener("click", async () => {
    const local = state.draft.validate();
    if (!local.valid) return setMessage("invalid", "로컬 v2 검증에 실패했습니다.", local.issues);
    try {
        await api(stageEndpoint(state.stageId, "/validate"), {
            method: "POST",
            body: JSON.stringify({ spec: state.draft.specification() })
        });
        setMessage("valid", "Validate 완료: 파일을 변경하지 않았습니다.");
    } catch (cause) {
        errorMessage(cause);
    }
});
dom.apply.addEventListener("click", async () => {
    if (state.applyPending) return;
    const local = state.draft.validate();
    if (!local.valid) return setMessage("invalid", "Apply 전에 v2 오류를 해결하세요.", local.issues);
    state.applyPending = true;
    setMessage("valid", "Apply 요청을 전송 중입니다.");
    renderStatus();
    try {
        const payload = await api(stageEndpoint(state.stageId), {
            method: "PUT",
            body: JSON.stringify({ spec: state.draft.specification(), baseRevision: state.draft.revision() })
        });
        state.draft.markApplied(payload.revision);
        const stage = state.stages.find(({ stageId }) => stageId === payload.stageId);
        if (stage) Object.assign(stage, { name: payload.name, revision: payload.revision });
        setMessage("valid", `Apply 완료: revision ${payload.revision} generated JS를 갱신했습니다.`);
        render();
    } catch (cause) {
        errorMessage(cause);
    } finally {
        state.applyPending = false;
        renderStatus();
    }
});
dom.preview.addEventListener("click", () => {
    if (state.draft.snapshot().dirty) return setMessage("dirty", "현재 Draft를 Apply한 뒤 Preview를 시작하세요.");
    const url = `./preview.html?stage=${encodeURIComponent(state.stageId)}`;
    const opened = globalThis.open(url, "map-editor-preview", "noopener");
    if (!opened) setMessage("error", "브라우저가 Preview 창을 차단했습니다. 팝업을 허용한 뒤 다시 시도하세요.");
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
        state.view.y = pointer.y + world.y * state.view.zoom;
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
        if (selected && selected.domain !== "bounds") {
            state.draft.beginBufferedMutation({ domain: selected.domain, label: "Move map object" });
            state.pointer = { mode: "drag", selected, world };
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
    const delta = { x: world.x - state.pointer.world.x, y: world.y - state.pointer.world.y };
    if (Math.abs(delta.x) + Math.abs(delta.y) < 0.01) return;
    updateEntityPosition(
        state.pointer.selected,
        {
            x: state.pointer.selected.point.x + delta.x,
            y: state.pointer.selected.point.y + delta.y
        },
        { buffered: true }
    );
    state.pointer.selected = entities().find(
        (entry) => entry.domain === state.pointer.selected.domain && entry.id === state.pointer.selected.id
    );
    state.pointer.world = world;
    drawCanvas();
});

function finishPointer(event) {
    if (!state.pointer) return;
    if (state.pointer.mode === "drag") {
        try {
            if (event.type === "pointercancel") state.draft.cancelBufferedMutation();
            else if (state.draft.commitBufferedMutation())
                setMessage("dirty", "Draft 변경사항이 있습니다. Validate 후 Apply하세요.");
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
    if (event.code === "Space" && event.target instanceof HTMLInputElement) return;
    if (event.code === "Space") state.spaceDown = true;
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
