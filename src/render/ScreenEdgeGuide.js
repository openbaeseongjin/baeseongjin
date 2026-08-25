import { authoredRegionForPosition } from "../game/world/AuthoredLandmarkResolver.js";

const ACCESS_GUIDE_MAX_TARGETS = 1;
const SCREEN_EDGE_DEFAULT_INSETS = Object.freeze({ left: 28, right: 28, top: 48, bottom: 28 });
const SCREEN_EDGE_COLLISION_GAP = 10;
const SCREEN_EDGE_SEARCH_STEP = 12;

function finite(value, label) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    return value;
}

function finiteSize(size = {}) {
    const width = finite(size.width ?? 0, "size.width");
    const height = finite(size.height ?? 0, "size.height");
    if (width < 0 || height < 0) throw new Error("screen-edge presentation size must be non-negative");
    return Object.freeze({ width, height });
}

function screenBoundsAt(x, y, size, gap = 0) {
    return Object.freeze({
        minX: x - size.width * 0.5 - gap,
        minY: y - size.height * 0.5 - gap,
        maxX: x + size.width * 0.5 + gap,
        maxY: y + size.height * 0.5 + gap
    });
}

function boundsOverlap(left, right) {
    return !(left.maxX <= right.minX || left.minX >= right.maxX || left.maxY <= right.minY || left.minY >= right.maxY);
}

function edgeSafeBounds(viewportWidth, viewportHeight, insets, size) {
    const left = Math.max(0, insets.left ?? SCREEN_EDGE_DEFAULT_INSETS.left) + size.width * 0.5;
    const right =
        Math.min(viewportWidth, viewportWidth - (insets.right ?? SCREEN_EDGE_DEFAULT_INSETS.right)) - size.width * 0.5;
    const top = Math.max(0, insets.top ?? SCREEN_EDGE_DEFAULT_INSETS.top) + size.height * 0.5;
    const bottom =
        Math.min(viewportHeight, viewportHeight - (insets.bottom ?? SCREEN_EDGE_DEFAULT_INSETS.bottom)) -
        size.height * 0.5;
    if (left > right || top > bottom) return null;
    return Object.freeze({ left, right, top, bottom });
}

export function resolveAccessModuleTargets({
    world,
    worldProgress,
    playerPosition,
    maxTargets = ACCESS_GUIDE_MAX_TARGETS
}) {
    if (!world?.accessModules?.length || !playerPosition || maxTargets <= 0) return Object.freeze([]);
    const sectorId = authoredRegionForPosition(world, playerPosition)?.sectorId;
    const sector = (world.sectors ?? []).find(({ id }) => id === sectorId);
    const requiredCount = sector?.accessModuleRequirement ?? 0;
    if (requiredCount <= 0) return Object.freeze([]);
    const collected = new Set(worldProgress?.collectedAccessModuleIds ?? []);
    const moduleIds = sector.accessModuleIds ?? [];
    if (moduleIds.filter((id) => collected.has(id)).length >= requiredCount) return Object.freeze([]);
    const moduleById = new Map(world.accessModules.map((module) => [module.id, module]));
    const nearest = moduleIds
        .filter((id) => !collected.has(id))
        .map((id) => moduleById.get(id))
        .filter(Boolean)
        .map((module) => ({
            module,
            distance: Math.hypot(module.position.x - playerPosition.x, module.position.y - playerPosition.y)
        }))
        .sort((left, right) => left.distance - right.distance || left.module.id.localeCompare(right.module.id))
        .slice(0, Math.min(ACCESS_GUIDE_MAX_TARGETS, Math.floor(maxTargets)));
    return Object.freeze(nearest.map(({ module, distance }) => Object.freeze({ module, distance, scale: 1 })));
}

export function projectWorldToScreen(position, camera) {
    const zoom = finite(camera?.zoom ?? 1, "camera.zoom");
    if (zoom <= 0) throw new Error("camera.zoom must be positive");
    return Object.freeze({
        x: (finite(position?.x, "position.x") - finite(camera?.x, "camera.x")) * zoom,
        y: (finite(position?.y, "position.y") - finite(camera?.y, "camera.y")) * zoom
    });
}

export function resolveScreenEdgeGuide({
    target,
    camera,
    viewportWidth,
    viewportHeight,
    insets = {},
    size = Object.freeze({ width: 0, height: 0 })
}) {
    const width = finite(viewportWidth, "viewportWidth");
    const height = finite(viewportHeight, "viewportHeight");
    if (width <= 0 || height <= 0) throw new Error("viewport size must be positive");
    const screen = projectWorldToScreen(target, camera);
    if (screen.x >= 0 && screen.x <= width && screen.y >= 0 && screen.y <= height) return null;
    const presentationSize = finiteSize(size);
    const safe = edgeSafeBounds(width, height, insets, presentationSize);
    if (!safe) return null;
    const center = Object.freeze({ x: width * 0.5, y: height * 0.5 });
    const dx = screen.x - center.x;
    const dy = screen.y - center.y;
    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return null;
    const horizontalScale =
        Math.abs(dx) < 1e-9
            ? Number.POSITIVE_INFINITY
            : (dx > 0 ? safe.right - center.x : center.x - safe.left) / Math.abs(dx);
    const verticalScale =
        Math.abs(dy) < 1e-9
            ? Number.POSITIVE_INFINITY
            : (dy > 0 ? safe.bottom - center.y : center.y - safe.top) / Math.abs(dy);
    const scale = Math.min(horizontalScale, verticalScale);
    const edge = horizontalScale < verticalScale ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";
    const x = Math.max(safe.left, Math.min(safe.right, center.x + dx * scale));
    const y = Math.max(safe.top, Math.min(safe.bottom, center.y + dy * scale));
    return Object.freeze({
        x,
        y,
        angle: Math.atan2(screen.y - y, screen.x - x),
        edge,
        target: Object.freeze({ x: target.x, y: target.y }),
        targetScreen: screen,
        size: presentationSize,
        safe
    });
}

function candidateCoordinates(guide) {
    const vertical = guide.edge === "left" || guide.edge === "right";
    const minimum = vertical ? guide.safe.top : guide.safe.left;
    const maximum = vertical ? guide.safe.bottom : guide.safe.right;
    const origin = vertical ? guide.y : guide.x;
    const coordinates = [origin];
    const steps = Math.ceil((maximum - minimum) / SCREEN_EDGE_SEARCH_STEP);
    for (let step = 1; step <= steps; step += 1) {
        coordinates.push(Math.min(maximum, origin + SCREEN_EDGE_SEARCH_STEP * step));
        coordinates.push(Math.max(minimum, origin - SCREEN_EDGE_SEARCH_STEP * step));
    }
    return Object.freeze([...new Set(coordinates)]);
}

export function layoutScreenEdgePresentations({
    presentations,
    camera,
    viewportWidth,
    viewportHeight,
    insets = {},
    avoidanceBounds = []
}) {
    const resolved = (presentations ?? [])
        .map((presentation, order) => {
            const guide = resolveScreenEdgeGuide({
                target: presentation.target,
                camera,
                viewportWidth,
                viewportHeight,
                insets,
                size: presentation.size
            });
            return guide ? { presentation, guide, order } : null;
        })
        .filter(Boolean)
        .sort(
            (left, right) =>
                (right.presentation.priority ?? 0) - (left.presentation.priority ?? 0) || left.order - right.order
        );
    const reserved = [...avoidanceBounds];
    const placements = [];
    for (const { presentation, guide, order } of resolved) {
        const vertical = guide.edge === "left" || guide.edge === "right";
        let placement = null;
        for (const coordinate of candidateCoordinates(guide)) {
            const x = vertical ? guide.x : coordinate;
            const y = vertical ? coordinate : guide.y;
            const bounds = screenBoundsAt(x, y, guide.size, SCREEN_EDGE_COLLISION_GAP);
            if (reserved.some((existing) => boundsOverlap(bounds, existing))) continue;
            placement = Object.freeze({
                ...guide,
                id: presentation.id,
                x,
                y,
                angle: Math.atan2(guide.targetScreen.y - y, guide.targetScreen.x - x),
                bounds,
                order
            });
            break;
        }
        if (!placement) continue;
        reserved.push(placement.bounds);
        placements.push(placement);
    }
    return Object.freeze(placements.sort((left, right) => left.order - right.order));
}

export function layoutAccessEdgeGuides({
    targets,
    camera,
    viewportWidth,
    viewportHeight,
    insets = {},
    avoidanceBounds = []
}) {
    const presentations = (targets ?? []).map((target) =>
        Object.freeze({
            id: target.module.id,
            target: target.module.position,
            priority: 0,
            size: Object.freeze({ width: 36 * target.scale, height: 30 * target.scale })
        })
    );
    const placements = layoutScreenEdgePresentations({
        presentations,
        camera,
        viewportWidth,
        viewportHeight,
        insets,
        avoidanceBounds
    });
    return Object.freeze(
        placements.map((placement) =>
            Object.freeze({ ...placement, moduleId: placement.id, scale: targets[0]?.scale ?? 1 })
        )
    );
}
