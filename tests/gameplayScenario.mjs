import { run as inputSampler } from "./inputSampler.mjs";
import { run as fixedLengthRope } from "./fixedLengthRope.mjs";
import { run as worldGenerator } from "./worldGenerator.mjs";
import { run as playerPhysics } from "./playerPhysics.mjs";
import { run as playerCollision } from "./playerCollision.mjs";
import { run as swingDrag } from "./swingDrag.mjs";
import { run as gameSimulation } from "./gameSimulation.mjs";
import { run as combatSystems } from "./combatSystems.mjs";
import { run as canvasRenderer } from "./canvasRenderer.mjs";
import { run as worldTraversalValidator } from "./worldTraversalValidator.mjs";
import { run as worldSeed } from "./worldSeed.mjs";
import { run as commandReplay } from "./commandReplay.mjs";
import { run as artifactRewardSelection } from "./artifactRewardSelection.mjs";
import { run as gameObjectModel } from "./gameObjectModel.mjs";
import { run as renderingSystem } from "./renderingSystem.mjs";
import { run as stateMachine } from "./stateMachine.mjs";
import { run as spriteAssetValidator } from "./spriteAssetValidator.mjs";

const steps = {
    worldSeed,
    inputSampler,
    fixedLengthRope,
    worldGenerator,
    playerPhysics,
    playerCollision,
    swingDrag,
    artifactRewardSelection,
    gameObjectModel,
    gameSimulation,
    combatSystems,
    canvasRenderer,
    renderingSystem,
    spriteAssetValidator,
    stateMachine,
    worldTraversalValidator,
    commandReplay
};

export async function run() {
    for (const [name, step] of Object.entries(steps)) {
        try {
            await step();
        } catch (error) {
            error.message = `gameplay/${name}: ${error.message}`;
            throw error;
        }
    }
}
