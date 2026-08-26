import { colliderSnapshotBounds, colliderSnapshotWorldVertices } from "../../game/physics/colliders/Collider.js";
import { resolveObjectTriggerBounds } from "../../game/world/areas/AreaDefinition.js";

const DEBUG_COLLISION_ROLE = Object.freeze({
    PHYSICAL: "physical",
    ONE_WAY: "one-way",
    ACTOR: "actor",
    PROJECTILE: "projectile",
    HAZARD: "hazard",
    INTERACTION: "interaction",
    PORTAL: "portal",
    OBJECTIVE: "objective",
    SAVEPOINT: "savepoint"
});

const STYLE_BY_ROLE = Object.freeze({
    [DEBUG_COLLISION_ROLE.PHYSICAL]: Object.freeze({ stroke: "#ff4d5d", fill: "rgba(255,77,93,0.12)" }),
    [DEBUG_COLLISION_ROLE.ONE_WAY]: Object.freeze({ stroke: "#ff9f43", fill: "rgba(255,159,67,0.08)" }),
    [DEBUG_COLLISION_ROLE.ACTOR]: Object.freeze({ stroke: "#ff5cf4", fill: "rgba(255,92,244,0.13)" }),
    [DEBUG_COLLISION_ROLE.PROJECTILE]: Object.freeze({ stroke: "#ffffff", fill: "rgba(255,255,255,0.12)" }),
    [DEBUG_COLLISION_ROLE.HAZARD]: Object.freeze({ stroke: "#ff274b", fill: "rgba(255,39,75,0.2)" }),
    [DEBUG_COLLISION_ROLE.INTERACTION]: Object.freeze({ stroke: "#ffe45c", fill: "rgba(255,228,92,0.14)" }),
    [DEBUG_COLLISION_ROLE.PORTAL]: Object.freeze({ stroke: "#38e8ff", fill: "rgba(56,232,255,0.13)" }),
    [DEBUG_COLLISION_ROLE.OBJECTIVE]: Object.freeze({ stroke: "#b985ff", fill: "rgba(185,133,255,0.13)" }),
    [DEBUG_COLLISION_ROLE.SAVEPOINT]: Object.freeze({ stroke: "#62f68c", fill: "rgba(98,246,140,0.13)" })
});

function boxGeometry(bounds) {
    const center = Object.freeze({ x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 });
    const halfWidth = bounds.width * 0.5;
    const halfHeight = bounds.height * 0.5;
    return Object.freeze({
        position: center,
        collider: Object.freeze({
            type: "polygon",
            vertices: Object.freeze([
                Object.freeze({ x: -halfWidth, y: -halfHeight }),
                Object.freeze({ x: halfWidth, y: -halfHeight }),
                Object.freeze({ x: halfWidth, y: halfHeight }),
                Object.freeze({ x: -halfWidth, y: halfHeight })
            ])
        })
    });
}

function circleGeometry(position, radius) {
    return Object.freeze({ position, collider: Object.freeze({ type: "circle", radius }) });
}

function resolvedCollider(actor) {
    if (actor?.collider?.type) return actor.collider;
    if (Number.isFinite(actor?.radius) && actor.radius > 0)
        return Object.freeze({ type: "circle", radius: actor.radius });
    return null;
}

function boundsOverlap(left, right) {
    return !(
        left.x + left.width < right.minX ||
        left.x > right.maxX ||
        left.y + left.height < right.minY ||
        left.y > right.maxY
    );
}

function visibleCollider(viewport, collider, position) {
    const bounds = colliderSnapshotBounds(collider, position);
    return boundsOverlap(bounds, viewport.visibleWorldBounds);
}

function tracePolygon(context, vertices) {
    if (vertices.length < 2) return;
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    for (const vertex of vertices.slice(1)) context.lineTo(vertex.x, vertex.y);
    context.closePath();
}

class CircleColliderShapeRenderer {
    draw(context, collider, position) {
        context.beginPath();
        context.arc(position.x, position.y, collider.radius, 0, Math.PI * 2);
    }
}

class PolygonColliderShapeRenderer {
    draw(context, collider, position) {
        tracePolygon(context, colliderSnapshotWorldVertices(collider, position));
    }
}

const COLLIDER_RENDERER_BY_TYPE = Object.freeze({
    circle: Object.freeze(new CircleColliderShapeRenderer()),
    polygon: Object.freeze(new PolygonColliderShapeRenderer())
});

function interactionGeometries(world) {
    const geometries = [];
    for (const object of world?.objects ?? []) {
        if (object.interactionSpec) {
            geometries.push({
                id: object.id,
                role: DEBUG_COLLISION_ROLE.INTERACTION,
                ...boxGeometry(resolveObjectTriggerBounds(object.position, object.interactionSpec))
            });
        } else if (Number.isFinite(object.interactionRadius) && object.interactionRadius > 0) {
            geometries.push({
                id: object.id,
                role: DEBUG_COLLISION_ROLE.INTERACTION,
                ...circleGeometry(object.position, object.interactionRadius)
            });
        }
    }
    for (const transition of world?.stageTransitions ?? []) {
        geometries.push({
            id: transition.id,
            role: DEBUG_COLLISION_ROLE.PORTAL,
            ...boxGeometry(transition.trigger)
        });
    }
    for (const gate of world?.gates ?? []) {
        if (!gate.trigger) continue;
        geometries.push({ id: gate.id, role: DEBUG_COLLISION_ROLE.PORTAL, ...boxGeometry(gate.trigger) });
    }
    for (const objective of world?.objectives ?? []) {
        if (!objective.bounds) continue;
        geometries.push({ id: objective.id, role: DEBUG_COLLISION_ROLE.OBJECTIVE, ...boxGeometry(objective.bounds) });
    }
    for (const anchor of world?.respawnAnchors ?? []) {
        if (anchor.triggerBounds) {
            geometries.push({
                id: anchor.id,
                role: DEBUG_COLLISION_ROLE.SAVEPOINT,
                ...boxGeometry(anchor.triggerBounds)
            });
        } else if (Number.isFinite(anchor.radius) && anchor.radius > 0) {
            geometries.push({
                id: anchor.id,
                role: DEBUG_COLLISION_ROLE.SAVEPOINT,
                ...circleGeometry(anchor.position, anchor.radius)
            });
        }
    }
    return geometries;
}

function actorGeometries(scene, debugGeometry) {
    const actors = [
        scene.player,
        ...(scene.otherPlayers ?? []),
        ...(scene.enemies ?? []),
        ...(debugGeometry.bossActors ?? [])
    ];
    return actors.flatMap((actor) => {
        const collider = resolvedCollider(actor);
        return actor?.position && collider
            ? [{ id: actor.id, role: DEBUG_COLLISION_ROLE.ACTOR, position: actor.position, collider }]
            : [];
    });
}

function projectileGeometries(scene) {
    return [scene.projectiles, scene.augmentProjectiles, scene.enemyProjectiles]
        .flatMap((collection) => collection ?? [])
        .flatMap((projectile) => {
            const collider = resolvedCollider(projectile);
            if (!projectile?.position || !collider) return [];
            const geometries = [
                { id: projectile.id, role: DEBUG_COLLISION_ROLE.PROJECTILE, position: projectile.position, collider }
            ];
            if (Number.isFinite(projectile.auraRadius) && projectile.auraRadius > 0) {
                geometries.push({
                    id: `${projectile.id}:aura`,
                    role: DEBUG_COLLISION_ROLE.HAZARD,
                    ...circleGeometry(projectile.position, projectile.auraRadius)
                });
            }
            return geometries;
        });
}

function hazardGeometries(debugGeometry) {
    return (debugGeometry.bossHazards ?? []).flatMap((hazard) => {
        if (hazard.position && hazard.collider) {
            return [
                {
                    id: hazard.id,
                    role: DEBUG_COLLISION_ROLE.HAZARD,
                    position: hazard.position,
                    collider: hazard.collider
                }
            ];
        }
        if (hazard.position && Number.isFinite(hazard.radius)) {
            return [
                { id: hazard.id, role: DEBUG_COLLISION_ROLE.HAZARD, ...circleGeometry(hazard.position, hazard.radius) }
            ];
        }
        return hazard.bounds
            ? [{ id: hazard.id, role: DEBUG_COLLISION_ROLE.HAZARD, ...boxGeometry(hazard.bounds) }]
            : [];
    });
}

class CircleSpellAreaRenderer {
    draw(context, area) {
        context.beginPath();
        context.arc(area.position.x, area.position.y, area.radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
    }
}

class LineSpellAreaRenderer {
    draw(context, area) {
        context.save();
        context.lineCap = "round";
        context.lineWidth = area.radius * 2;
        context.beginPath();
        context.moveTo(area.position.x, area.position.y);
        context.lineTo(
            area.position.x + area.direction.x * area.range,
            area.position.y + area.direction.y * area.range
        );
        context.stroke();
        context.restore();
    }
}

class ConeSpellAreaRenderer {
    draw(context, area) {
        const heading = Math.atan2(area.direction.y, area.direction.x);
        const halfAngle = (area.halfAngleDegrees * Math.PI) / 180;
        context.beginPath();
        context.moveTo(area.position.x, area.position.y);
        context.arc(area.position.x, area.position.y, area.range, heading - halfAngle, heading + halfAngle);
        context.closePath();
        context.fill();
        context.stroke();
    }
}

const SPELL_AREA_RENDERER_BY_SHAPE = Object.freeze({
    circle: Object.freeze(new CircleSpellAreaRenderer()),
    line: Object.freeze(new LineSpellAreaRenderer()),
    cone: Object.freeze(new ConeSpellAreaRenderer())
});

export class DebugCollisionRenderer {
    draw({ context, scene, viewport, renderStats }) {
        const debugGeometry = scene.collisionDebugGeometry;
        if (!debugGeometry) return;
        const zoom = scene.camera?.zoom ?? 1;
        const lineWidth = 2 / zoom;
        let drawn = 0;
        context.save();
        context.lineWidth = lineWidth;
        context.setLineDash([7 / zoom, 4 / zoom]);
        for (const surface of debugGeometry.surfaces ?? []) {
            if (surface.collision === false || !Array.isArray(surface.vertices) || surface.vertices.length < 2)
                continue;
            const surfaceBounds = surface.vertices.reduce(
                (bounds, vertex) => ({
                    x: Math.min(bounds.x, vertex.x),
                    y: Math.min(bounds.y, vertex.y),
                    width: Math.max(bounds.x + bounds.width, vertex.x) - Math.min(bounds.x, vertex.x),
                    height: Math.max(bounds.y + bounds.height, vertex.y) - Math.min(bounds.y, vertex.y)
                }),
                { x: surface.vertices[0].x, y: surface.vertices[0].y, width: 0, height: 0 }
            );
            if (!boundsOverlap(surfaceBounds, viewport.visibleWorldBounds)) continue;
            const role = surface.oneWay ? DEBUG_COLLISION_ROLE.ONE_WAY : DEBUG_COLLISION_ROLE.PHYSICAL;
            const style = STYLE_BY_ROLE[role];
            context.strokeStyle = style.stroke;
            context.fillStyle = style.fill;
            if (surface.oneWay) {
                const end = Number.isInteger(surface.oneWayEdgeEnd) ? surface.oneWayEdgeEnd : 1;
                const vertices = surface.vertices.slice(0, end + 1);
                context.beginPath();
                context.moveTo(vertices[0].x, vertices[0].y);
                for (const vertex of vertices.slice(1)) context.lineTo(vertex.x, vertex.y);
                context.stroke();
            } else {
                tracePolygon(context, surface.vertices);
                context.fill();
                context.stroke();
            }
            drawn += 1;
        }
        const geometries = [
            ...interactionGeometries(scene.world),
            ...actorGeometries(scene, debugGeometry),
            ...projectileGeometries(scene),
            ...hazardGeometries(debugGeometry)
        ];
        context.setLineDash([]);
        context.font = `700 ${10 / zoom}px ui-monospace, Consolas, monospace`;
        context.textBaseline = "bottom";
        for (const geometry of geometries) {
            if (!visibleCollider(viewport, geometry.collider, geometry.position)) continue;
            const renderer = COLLIDER_RENDERER_BY_TYPE[geometry.collider.type];
            if (!renderer) continue;
            const style = STYLE_BY_ROLE[geometry.role];
            context.strokeStyle = style.stroke;
            context.fillStyle = style.fill;
            renderer.draw(context, geometry.collider, geometry.position);
            context.fill();
            context.stroke();
            context.fillStyle = style.stroke;
            context.fillText(
                geometry.id ?? geometry.role,
                geometry.position.x + 4 / zoom,
                geometry.position.y - 4 / zoom
            );
            drawn += 1;
        }
        const hazardStyle = STYLE_BY_ROLE[DEBUG_COLLISION_ROLE.HAZARD];
        context.strokeStyle = hazardStyle.stroke;
        context.fillStyle = hazardStyle.fill;
        context.lineWidth = lineWidth;
        for (const area of scene.augmentAreas ?? []) {
            const renderer = SPELL_AREA_RENDERER_BY_SHAPE[area.shape];
            if (!renderer || !area.position) continue;
            renderer.draw(context, area);
            drawn += 1;
        }
        context.restore();
        renderStats?.recordCollection(
            "debugCollisionGeometry",
            geometries.length + (debugGeometry.surfaces?.length ?? 0) + (scene.augmentAreas?.length ?? 0),
            drawn
        );
    }
}
