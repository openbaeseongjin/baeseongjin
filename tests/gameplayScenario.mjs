import { run as inputSampler } from "./inputSampler.mjs";
import { run as fixedLengthRope } from "./fixedLengthRope.mjs";
import { run as playerPhysics } from "./playerPhysics.mjs";
import { run as playerCollision } from "./playerCollision.mjs";
import { run as swingDrag } from "./swingDrag.mjs";
import { run as ropeLauncher } from "./ropeLauncher.mjs";
import { run as gameSimulation } from "./gameSimulation.mjs";
import { run as combatSystems } from "./combatSystems.mjs";
import { run as enemyPatrol } from "./enemyPatrol.mjs";
import { run as enemyEncounterSelection } from "./enemyEncounterSelection.mjs";
import { run as enemyArchetypes } from "./enemyArchetypes.mjs";
import { run as canvasRenderer } from "./canvasRenderer.mjs";
import { run as worldSeed } from "./worldSeed.mjs";
import { run as commandReplay } from "./commandReplay.mjs";
import { run as foundationAugment } from "./foundationAugment.mjs";
import { run as augmentOffer } from "./augmentOffer.mjs";
import { run as actionAugmentRuntime } from "./actionAugmentRuntime.mjs";
import { run as ropeAugmentModules } from "./ropeAugmentModules.mjs";
import { run as playerEnemyImpact } from "./playerEnemyImpact.mjs";
import { run as augmentV1Integration } from "./augmentV1Integration.mjs";
import { run as gameObjectModel } from "./gameObjectModel.mjs";
import { run as renderingSystem } from "./renderingSystem.mjs";
import { run as stateMachine } from "./stateMachine.mjs";
import { run as spriteAssetValidator } from "./spriteAssetValidator.mjs";
import { run as renderPerformance } from "./renderPerformance.mjs";
import { run as areaDefinitionValidator } from "./areaDefinitionValidator.mjs";
import { run as areaSpecValidator } from "./areaSpecValidator.mjs";
import { run as authoredWorldAssembler } from "./authoredWorldAssembler.mjs";
import { run as worldProgressState } from "./worldProgressState.mjs";
import { run as worldProgressController } from "./worldProgressController.mjs";
import { run as worldForceField } from "./worldForceField.mjs";
import { run as authoredGameSimulation } from "./authoredGameSimulation.mjs";
import { run as sector02AreaCatalog } from "./sector02AreaCatalog.mjs";
import { run as sector03AreaCatalog } from "./sector03AreaCatalog.mjs";
import { run as sector04AreaCatalog } from "./sector04AreaCatalog.mjs";
import { run as accessScanField } from "./accessScanField.mjs";
import { run as currentAuthoredWorld } from "./currentAuthoredWorld.mjs";
import { run as authoredCameraDirector } from "./authoredCameraDirector.mjs";
import { run as authoredStoryPresentation } from "./authoredStoryPresentation.mjs";
import { run as interpolateRenderSnapshot } from "./interpolateRenderSnapshot.mjs";
import { run as debugSettings } from "./debugSettings.mjs";
import { run as debugPanel } from "./debugPanel.mjs";
import { run as traversalDamageFeedback } from "./traversalDamageFeedback.mjs";
import { run as legacyAreaSeamlessSectorRuntime } from "./legacyAreaSeamlessSectorRuntime.mjs";
import { run as sectorProgressState } from "./sectorProgressState.mjs";
import { run as sectorProgressController } from "./sectorProgressController.mjs";
import { run as seamlessSectorGameSimulation } from "./seamlessSectorGameSimulation.mjs";
import { run as seamlessSectorMultiplayerWorld } from "./seamlessSectorMultiplayerWorld.mjs";
import { run as sectorDefinitionValidator } from "./sectorDefinitionValidator.mjs";

const steps = {
    worldSeed,
    inputSampler,
    fixedLengthRope,
    playerPhysics,
    playerCollision,
    swingDrag,
    ropeLauncher,
    foundationAugment,
    augmentOffer,
    actionAugmentRuntime,
    ropeAugmentModules,
    playerEnemyImpact,
    augmentV1Integration,
    gameObjectModel,
    gameSimulation,
    combatSystems,
    enemyPatrol,
    enemyEncounterSelection,
    enemyArchetypes,
    canvasRenderer,
    renderingSystem,
    renderPerformance,
    areaDefinitionValidator,
    areaSpecValidator,
    authoredWorldAssembler,
    worldProgressState,
    worldProgressController,
    worldForceField,
    authoredGameSimulation,
    sector02AreaCatalog,
    sector03AreaCatalog,
    sector04AreaCatalog,
    accessScanField,
    currentAuthoredWorld,
    authoredCameraDirector,
    authoredStoryPresentation,
    interpolateRenderSnapshot,
    debugSettings,
    debugPanel,
    traversalDamageFeedback,
    legacyAreaSeamlessSectorRuntime,
    sectorProgressState,
    sectorProgressController,
    seamlessSectorGameSimulation,
    seamlessSectorMultiplayerWorld,
    sectorDefinitionValidator,
    spriteAssetValidator,
    stateMachine,
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
