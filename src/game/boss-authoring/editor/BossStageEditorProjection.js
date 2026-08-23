function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y);
}

function entity({ domain, id, kind, point = null, bounds = null, path, interactionPriority = 0 }) {
    return Object.freeze({
        domain,
        id,
        kind,
        ...(point ? { point: Object.freeze({ ...point }) } : {}),
        ...(bounds ? { bounds: Object.freeze({ ...bounds }) } : {}),
        path,
        interactionPriority
    });
}

function center(bounds) {
    return { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 };
}

export function collectBossStageEditorEntities(spec) {
    const result = [
        entity({
            domain: "arena",
            id: `${spec.id}:arena`,
            kind: "arena-bounds",
            point: center(spec.arena.bounds),
            bounds: spec.arena.bounds,
            path: "/arena/bounds"
        }),
        entity({
            domain: "entry",
            id: spec.arena.entry.id,
            kind: "entry",
            point: spec.arena.entry,
            path: "/arena/entry"
        }),
        entity({ domain: "exit", id: spec.arena.exit.id, kind: "exit", point: spec.arena.exit, path: "/arena/exit" }),
        entity({
            domain: "boss",
            id: spec.boss.actorId,
            kind: "boss",
            point: spec.boss.position,
            bounds: spec.boss.collider,
            path: "/boss"
        }),
        entity({ domain: "combat", id: `${spec.id}:combat`, kind: "combat", path: "/combat" }),
        entity({ domain: "hud", id: `${spec.id}:hud`, kind: "hud", path: "/hud" }),
        entity({ domain: "transition", id: `${spec.id}:transition`, kind: "transition", path: "/transition" })
    ];
    for (const [index, surface] of spec.arena.surfaces.entries()) {
        result.push(
            entity({
                domain: "surfaces",
                id: surface.id,
                kind: "surface",
                point: center(surface.bounds),
                bounds: surface.bounds,
                path: `/arena/surfaces/${index}`
            })
        );
    }
    for (const [index, anchor] of spec.arena.anchors.entries()) {
        if (anchor.role !== BOSS_ANCHOR_ROLE.SWING_ATTACK) continue;
        result.push(
            entity({
                domain: "combatAnchors",
                id: anchor.id,
                kind: "swing-anchor",
                point: anchor,
                path: `/arena/anchors/${index}`,
                interactionPriority: 0
            })
        );
    }
    for (const [index, point] of spec.arena.recoveryPoints.entries()) {
        result.push(
            entity({
                domain: "recovery",
                id: point.id,
                kind: "recovery",
                point,
                path: `/arena/recoveryPoints/${index}`
            })
        );
    }
    for (const [index, zone] of (spec.arena.phaseZones ?? []).entries()) {
        result.push(
            entity({
                domain: "zones",
                id: zone.id,
                kind: "phase-zone",
                point: center(zone.bounds),
                bounds: zone.bounds,
                path: `/arena/phaseZones/${index}`
            })
        );
    }
    for (const [index, mechanic] of spec.mechanics.entries()) {
        result.push(
            entity({
                domain: "mechanics",
                id: mechanic.id,
                kind: mechanic.type,
                point: mechanic.position,
                bounds: mechanic.bounds ?? null,
                path: `/mechanics/${index}`
            })
        );
    }
    for (const [index, phase] of spec.phases.entries()) {
        result.push(entity({ domain: "phases", id: phase.id, kind: "phase", path: `/phases/${index}` }));
    }
    return Object.freeze(result);
}

export function translateBossStageEditorEntity(spec, selected, delta) {
    if (!selected || !finitePoint(delta)) throw new TypeError("boss-editor-translate-invalid");
    const next = structuredClone(spec);
    const move = (point) => {
        point.x += delta.x;
        point.y += delta.y;
    };
    if (selected.domain === "arena") move(next.arena.bounds);
    else if (selected.domain === "entry") move(next.arena.entry);
    else if (selected.domain === "exit") move(next.arena.exit);
    else if (selected.domain === "boss") {
        move(next.boss.position);
        move(next.boss.collider);
    } else if (selected.domain === "surfaces") {
        const surface = next.arena.surfaces.find(({ id }) => id === selected.id);
        if (!surface) throw new TypeError("boss-editor-entity-not-found");
        move(surface.bounds);
    } else if (selected.domain === "combatAnchors") {
        const anchor = next.arena.anchors.find(({ id }) => id === selected.id);
        if (!anchor) throw new TypeError("boss-editor-entity-not-found");
        move(anchor);
    } else if (selected.domain === "recovery") {
        const point = next.arena.recoveryPoints.find(({ id }) => id === selected.id);
        if (!point) throw new TypeError("boss-editor-entity-not-found");
        move(point);
    } else if (selected.domain === "zones") {
        const zone = next.arena.phaseZones?.find(({ id }) => id === selected.id);
        if (!zone) throw new TypeError("boss-editor-entity-not-found");
        move(zone.bounds);
    } else if (selected.domain === "mechanics") {
        const mechanic = next.mechanics.find(({ id }) => id === selected.id);
        if (!mechanic) throw new TypeError("boss-editor-entity-not-found");
        move(mechanic.position);
        if (mechanic.bounds) move(mechanic.bounds);
    } else throw new TypeError("boss-editor-entity-not-movable");
    return next;
}
import { BOSS_ANCHOR_ROLE } from "../BossStageSpec.js";
