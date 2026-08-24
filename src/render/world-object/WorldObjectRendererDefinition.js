export const WORLD_OBJECT_KIND = Object.freeze({
    GATE_PANEL: "gate-panel",
    GATE: "gate",
    ACCESS_TRANSIT_LOCK: "access-transit-lock",
    AUGMENT_NODE: "augment-node",
    TERMINAL: "terminal",
    GRAPPLE_LANDMARK: "grapple-landmark",
    WIND_SOURCE: "wind-source",
    TEST_TARGET: "test-target",
    STORY_DISPLAY: "story-display",
    MAINTENANCE_FRAME: "maintenance-frame"
});

function center(context, bounds) {
    context.translate(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5);
}

class WorldObjectRendererDefinition {
    constructor({ drawsLabel = true } = {}) {
        this.drawsLabel = drawsLabel;
    }
    draw() {
        throw new Error(`${this.constructor.name} must implement draw()`);
    }
}
class GatePanelRenderer extends WorldObjectRendererDefinition {
    constructor() {
        super({ drawsLabel: false });
    }
    draw(a) {
        a.painter.drawGatePanel(a.context, a.style, a.bounds, {
            blocked: !a.requirementsComplete,
            ready: a.requirementsComplete && !a.objectiveComplete,
            opened: a.gateUnlocked || a.objectiveComplete,
            sectorId: a.sectorId
        });
    }
}
class GateRenderer extends WorldObjectRendererDefinition {
    constructor() {
        super({ drawsLabel: false });
    }
    draw(a) {
        a.painter.drawGate(a.context, a.style, a.bounds, a.gateUnlocked, { sectorId: a.sectorId });
    }
}
class AccessTransitLockRenderer extends WorldObjectRendererDefinition {
    constructor() {
        super({ drawsLabel: false });
    }
    draw(a) {
        a.painter.drawAccessTransitLock(
            a.context,
            a.object,
            a.scene,
            a.gateUnlocked || a.objectiveComplete,
            a.renderArgs.presentationTimeSeconds ?? 0
        );
    }
}
class AugmentNodeRenderer extends WorldObjectRendererDefinition {
    draw(a) {
        center(a.context, a.bounds);
        a.painter.drawAugmentNode(
            a.context,
            a.style,
            a.bounds,
            a.scene.player?.augmentRuntimeState?.consumedSourceIds?.includes(a.object.id) ?? false
        );
    }
}
class TerminalRenderer extends WorldObjectRendererDefinition {
    draw(a) {
        center(a.context, a.bounds);
        const width = a.style.radius * 1.7;
        const height = a.style.radius * 1.25;
        a.context.fillRect(-width, -height, width * 2, height * 2);
        a.context.strokeRect(-width, -height, width * 2, height * 2);
        a.context.fillStyle = a.objectiveComplete ? a.style.color : `${a.style.color}99`;
        a.context.fillRect(-width + 7, -height + 7, width * 2 - 14, 5);
        a.context.fillRect(-width + 7, -height + 17, width - 3, 4);
    }
}
class GrappleLandmarkRenderer extends WorldObjectRendererDefinition {
    draw(a) {
        center(a.context, a.bounds);
        a.painter.drawGrappleLandmark(a.context, a.style, { sectorId: a.sectorId });
    }
}
class WindSourceRenderer extends WorldObjectRendererDefinition {
    draw(a) {
        center(a.context, a.bounds);
        a.painter.drawWindSource(a.context, a.style, {
            zone: a.renderArgs.windZoneById?.[a.object.windZoneId] ?? null,
            state: a.renderArgs.windStateById?.[a.object.windZoneId] ?? null,
            elapsedSeconds: a.renderArgs.elapsedSeconds ?? 0
        });
    }
}
class TestTargetRenderer extends WorldObjectRendererDefinition {
    draw(a) {
        center(a.context, a.bounds);
        a.painter.drawTestTarget(a.context, a.style, {
            contactRegistered:
                a.scene.eventFlash?.type === "foundation-shear-hit" && a.scene.eventFlash.targetId === a.object.id,
            age: a.scene.eventFlash?.age ?? 0
        });
    }
}
class StoryDisplayRenderer extends WorldObjectRendererDefinition {
    draw(a) {
        a.painter.drawStoryDisplay(a.context, a.style, a.bounds);
    }
}
class MaintenanceFrameRenderer extends WorldObjectRendererDefinition {
    draw(a) {
        center(a.context, a.bounds);
        a.painter.drawMaintenanceFrame(a.context, a.style);
    }
}
class DefaultWorldObjectRenderer extends WorldObjectRendererDefinition {
    draw(a) {
        center(a.context, a.bounds);
        a.context.beginPath();
        a.context.moveTo(0, -a.style.radius);
        a.context.lineTo(a.style.radius, 0);
        a.context.lineTo(0, a.style.radius);
        a.context.lineTo(-a.style.radius, 0);
        a.context.closePath();
        a.context.fill();
        a.context.stroke();
    }
}

const DEFAULT_RENDERER = Object.freeze(new DefaultWorldObjectRenderer());
export const WORLD_OBJECT_RENDERER = Object.freeze({
    [WORLD_OBJECT_KIND.GATE_PANEL]: Object.freeze(new GatePanelRenderer()),
    [WORLD_OBJECT_KIND.GATE]: Object.freeze(new GateRenderer()),
    [WORLD_OBJECT_KIND.ACCESS_TRANSIT_LOCK]: Object.freeze(new AccessTransitLockRenderer()),
    [WORLD_OBJECT_KIND.AUGMENT_NODE]: Object.freeze(new AugmentNodeRenderer()),
    [WORLD_OBJECT_KIND.TERMINAL]: Object.freeze(new TerminalRenderer()),
    [WORLD_OBJECT_KIND.GRAPPLE_LANDMARK]: Object.freeze(new GrappleLandmarkRenderer()),
    [WORLD_OBJECT_KIND.WIND_SOURCE]: Object.freeze(new WindSourceRenderer()),
    [WORLD_OBJECT_KIND.TEST_TARGET]: Object.freeze(new TestTargetRenderer()),
    [WORLD_OBJECT_KIND.STORY_DISPLAY]: Object.freeze(new StoryDisplayRenderer()),
    [WORLD_OBJECT_KIND.MAINTENANCE_FRAME]: Object.freeze(new MaintenanceFrameRenderer())
});
export function worldObjectRenderer(kind) {
    return WORLD_OBJECT_RENDERER[kind] ?? DEFAULT_RENDERER;
}
