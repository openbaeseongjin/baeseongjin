import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";
import { PolygonSceneRenderer } from "../src/render/PolygonSceneRenderer.js";

const canvas = document.getElementById("preview");
const simulation = createCurrentGameSimulation({ worldSeed: 9182, playerId: "punch-preview" });
simulation.enemies = [];
const player = simulation.players[0];
simulation.advanceOwnerPrediction(
    player.id,
    createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            action: true,
            pointer: { x: player.physics.position.x + 100, y: player.physics.position.y, down: false },
            viewport: { width: innerWidth, height: innerHeight }
        },
        { x: player.physics.position.x + 100, y: player.physics.position.y }
    ),
    1 / 120,
    1
);

const renderer = new CanvasRenderer(canvas, new PolygonSceneRenderer(), { pixelRatio: () => 1 });

function render() {
    const state = simulation.snapshot();
    const zoom = 1;
    renderer.draw({
        ...state,
        camera: {
            x: state.player.position.x - innerWidth / zoom / 2,
            y: state.player.position.y - innerHeight / zoom / 2,
            zoom,
            initialized: true
        },
        mobileView: innerWidth <= 900 && innerHeight <= 500,
        hudVisible: true,
        mobileControls: { visible: false }
    });
}

addEventListener("resize", render);
render();
