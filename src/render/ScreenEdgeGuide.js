import { authoredRegionForPosition } from "../game/world/AuthoredLandmarkResolver.js";

function finite(value, label) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    return value;
}

const ACCESS_GUIDE_MAX_TARGETS = 3;
const ACCESS_GUIDE_MIN_SCALE = 0.62;

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
    const remaining = moduleIds
        .filter((id) => !collected.has(id))
        .map((id) => moduleById.get(id))
        .filter(Boolean)
        .map((module) => ({
            module,
            distance: Math.hypot(module.position.x - playerPosition.x, module.position.y - playerPosition.y)
        }))
        .sort((left, right) => left.distance - right.distance || left.module.id.localeCompare(right.module.id))
        .slice(0, Math.min(ACCESS_GUIDE_MAX_TARGETS, Math.floor(maxTargets)));
    const nearestDistance = remaining[0]?.distance ?? 0;
    const farthestDistance = remaining.at(-1)?.distance ?? nearestDistance;
    return Object.freeze(
        remaining.map(({ module, distance }) =>
            Object.freeze({
                module,
                distance,
                scale:
                    farthestDistance === nearestDistance
                        ? 1
                        : Math.max(
                              ACCESS_GUIDE_MIN_SCALE,
                              1 - ((distance - nearestDistance) / (farthestDistance - nearestDistance)) * 0.38
                          )
            })
        )
    );
}

function distributeGuides(guides, { minimum, maximum, spacing, coordinate }) {
    if (guides.length === 0) return [];
    const availableSpacing = guides.length === 1 ? 0 : Math.min(spacing, (maximum - minimum) / (guides.length - 1));
    const center = guides.reduce((sum, guide) => sum + guide[coordinate], 0) / guides.length;
    const span = availableSpacing * (guides.length - 1);
    const start = Math.min(Math.max(center - span * 0.5, minimum), maximum - span);
    return guides.map((guide, index) => ({ ...guide, [coordinate]: start + index * availableSpacing }));
}

export function layoutAccessEdgeGuides({
    targets,
    camera,
    viewportWidth,
    viewportHeight,
    insets = {},
    compactView = false,
    spacing = 28
}) {
    const guides = (targets ?? [])
        .map((target) => {
            const guide = resolveScreenEdgeGuide({
                target: target.module.position,
                camera,
                viewportWidth,
                viewportHeight,
                insets
            });
            return guide ? { ...guide, moduleId: target.module.id, scale: target.scale } : null;
        })
        .filter(Boolean);
    const groups = new Map();
    for (const guide of guides) groups.set(guide.edge, [...(groups.get(guide.edge) ?? []), guide]);
    const laidOutById = new Map();
    for (const [edge, group] of groups) {
        const vertical = edge === "left" || edge === "right";
        const preferredMinimum = vertical
            ? edge === "left"
                ? compactView
                    ? 214
                    : 252
                : (insets.top ?? 54)
            : edge === "top"
              ? 184
              : (insets.left ?? 30);
        const maximum = vertical ? viewportHeight - (insets.bottom ?? 30) : viewportWidth - (insets.right ?? 30);
        const insetMinimum = vertical ? (insets.top ?? 54) : (insets.left ?? 30);
        const minimum = Math.min(preferredMinimum, Math.max(insetMinimum, maximum - spacing * (group.length - 1)));
        for (const guide of distributeGuides(group, { minimum, maximum, spacing, coordinate: vertical ? "y" : "x" })) {
            laidOutById.set(guide.moduleId, Object.freeze(guide));
        }
    }
    return Object.freeze(guides.map(({ moduleId }) => laidOutById.get(moduleId)));
}

export function projectWorldToScreen(position, camera) {
    const zoom = finite(camera?.zoom ?? 1, "camera.zoom");
    if (zoom <= 0) throw new Error("camera.zoom must be positive");
    return Object.freeze({
        x: (finite(position?.x, "position.x") - finite(camera?.x, "camera.x")) * zoom,
        y: (finite(position?.y, "position.y") - finite(camera?.y, "camera.y")) * zoom
    });
}

export function resolveScreenEdgeGuide({ target, camera, viewportWidth, viewportHeight, insets = {} }) {
    const width = finite(viewportWidth, "viewportWidth");
    const height = finite(viewportHeight, "viewportHeight");
    if (width <= 0 || height <= 0) throw new Error("viewport size must be positive");
    const screen = projectWorldToScreen(target, camera);
    if (screen.x >= 0 && screen.x <= width && screen.y >= 0 && screen.y <= height) return null;

    const left = Math.max(0, insets.left ?? 28);
    const right = Math.min(width, width - (insets.right ?? 28));
    const top = Math.max(0, insets.top ?? 48);
    const bottom = Math.min(height, height - (insets.bottom ?? 28));
    const center = { x: width * 0.5, y: height * 0.5 };
    const dx = screen.x - center.x;
    const dy = screen.y - center.y;
    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return null;

    const horizontalScale =
        Math.abs(dx) < 1e-9 ? Number.POSITIVE_INFINITY : (dx > 0 ? right - center.x : center.x - left) / Math.abs(dx);
    const verticalScale =
        Math.abs(dy) < 1e-9 ? Number.POSITIVE_INFINITY : (dy > 0 ? bottom - center.y : center.y - top) / Math.abs(dy);
    const scale = Math.min(horizontalScale, verticalScale);
    const edge = horizontalScale < verticalScale ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";
    return Object.freeze({
        x: center.x + dx * scale,
        y: center.y + dy * scale,
        angle: Math.atan2(dy, dx),
        edge,
        target: Object.freeze({ x: target.x, y: target.y })
    });
}
