import { FOUNDATION_AUGMENT_CATALOG } from "../src/game/augments/FoundationAugmentCatalog.js";
import { Vector2 } from "../src/game-kit/index.js";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";
import { drawElectricArc } from "../src/render/effects/ElectricArc.js";
import { EventEffectRenderer } from "../src/render/layers/SharedSceneRenderers.js";

const canvas = document.getElementById("augment-preview");
const eventRenderer = new EventEffectRenderer();
const sceneRenderer = {
    profile: "augment-harness",
    draw({ context, scene, presentationTimeSeconds }) {
        const gradient = context.createLinearGradient(0, 0, 0, 720);
        gradient.addColorStop(0, "#111827");
        gradient.addColorStop(1, "#030712");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1280, 720);
        context.fillStyle = "#334155";
        context.fillRect(90, 540, 1100, 34);
        context.strokeStyle = "#64748b";
        context.strokeRect(90, 540, 1100, 34);
        context.fillStyle = "#67e8f9";
        context.beginPath();
        context.arc(250, 485, 15, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#f8fafc";
        context.beginPath();
        context.arc(800, 205, 7, 0, Math.PI * 2);
        context.fill();
        drawElectricArc(context, { x: 800, y: 205 }, { x: 250, y: 485 }, { time: presentationTimeSeconds });
        eventRenderer.draw({ context, scene });
    }
};

const renderer = new CanvasRenderer(canvas, sceneRenderer, { pixelRatio: () => 1, now: () => 0.24 });
const selectedAugmentIds = [
    "electrified-rope",
    "direction-dash",
    "explosive-trail",
    "fast-reuse",
    "extra-charge",
    "post-action-shield"
];
const choices = ["collision-explosion", "rope-link", "long-rope"].map((id) =>
    FOUNDATION_AUGMENT_CATALOG.find((card) => card.id === id)
);

renderer.draw({
    camera: { x: 0, y: 0, zoom: 1 },
    player: { position: new Vector2(250, 485), velocity: new Vector2() },
    rope: { isAttached: true, anchor: { x: 800, y: 205 }, tension: 540 },
    world: { topY: -8000 },
    attachmentCandidate: null,
    swingDrag: null,
    playerHealth: 82,
    playerMaxHealth: 100,
    ropeDisabledRemaining: 0,
    selectedAugmentIds,
    actionState: {
        loadout: { baseActionId: "direction-dash", modifierIds: ["fast-reuse", "extra-charge"] },
        chargesRemaining: 2
    },
    foundationReward: {
        rewardType: "foundation",
        selectionIndex: 3,
        selectedIndex: 1,
        choices
    },
    augmentEffects: [
        {
            type: "collision-explosion-splash",
            position: { x: 980, y: 480 },
            age: 0.08,
            lifetime: 0.45
        },
        {
            type: "damage-reflect",
            sourcePosition: { x: 250, y: 485 },
            position: { x: 500, y: 420 },
            age: 0.05,
            lifetime: 0.28
        }
    ],
    combatEffects: [],
    storyPresentation: null,
    eventFlash: null,
    runState: "playing",
    mobileView: false,
    metricsVisible: false,
    mobileControls: {
        visible: true,
        ropePointerDown: false,
        left: false,
        jump: false,
        right: false,
        action: true
    }
});

document.body.dataset.ready = "true";
