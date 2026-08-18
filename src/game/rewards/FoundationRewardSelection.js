import { advanceRewardSelection, createRewardSelection } from "./RewardSelection.js";
import { augmentById } from "../augments/FoundationAugmentCatalog.js";
import { createLogicalAugmentEntitlement } from "../augments/AugmentOffer.js";

function asFoundationSelection(
    selection,
    {
        objectiveId,
        selectionIndex = 0,
        stablePlayerId = null,
        runSeed = null,
        selectedAugmentIds = Object.freeze([])
    } = {}
) {
    return Object.freeze({
        ...selection,
        objectiveId,
        selectionIndex,
        stablePlayerId,
        runSeed,
        selectedAugmentIds: Object.freeze([...selectedAugmentIds])
    });
}

export function createFoundationRewardSelection({
    sourceId,
    objectiveId,
    choices,
    selectedIndex = 0,
    selectionIndex = 0,
    stablePlayerId = null,
    runSeed = null,
    selectedAugmentIds = []
}) {
    if (typeof objectiveId !== "string" || objectiveId.length === 0) {
        throw new Error("objectiveId must be non-empty");
    }
    return asFoundationSelection(
        createRewardSelection({
            sourceId,
            rewardType: "foundation",
            choices,
            selectedIndex
        }),
        {
            objectiveId,
            selectionIndex,
            stablePlayerId,
            runSeed,
            selectedAugmentIds
        }
    );
}

export function advanceFoundationRewardSelection(selection, command) {
    const outcome = advanceRewardSelection(selection, command);
    return Object.freeze({
        selection: asFoundationSelection(outcome.selection, selection),
        confirmedFoundationId: outcome.confirmedChoiceId
    });
}

export function createDeterministicFoundationRewardSelection({
    sourceId,
    objectiveId,
    runSeed,
    stablePlayerId,
    selectionIndex,
    selectedAugmentIds = []
}) {
    const entitlement = createLogicalAugmentEntitlement({
        runSeed,
        playerId: stablePlayerId,
        selectionIndex,
        selectedAugmentIds,
        sourceId
    });
    const choices = entitlement.choices.map((id) => augmentById(id));
    return createFoundationRewardSelection({
        sourceId,
        objectiveId,
        choices,
        selectionIndex,
        stablePlayerId,
        runSeed,
        selectedAugmentIds
    });
}

export function openFoundationChooserCandidate({
    world,
    position,
    command,
    playerId,
    runSeed,
    selectedAugmentIds = [],
    consumedSourceIds = []
}) {
    if (!world || !position || !command?.interact) return null;
    const node = world.objects.find(
        (object) =>
            object.kind === "augment-node" &&
            Math.hypot(position.x - object.position.x, position.y - object.position.y) <= object.interactionRadius
    );
    if (!node) return null;
    if (consumedSourceIds.includes(node.id)) return null;
    if (typeof playerId !== "string" || playerId.length === 0) return null;
    const selectionIndex = Array.isArray(selectedAugmentIds) ? selectedAugmentIds.length : 0;
    if (selectionIndex >= 6) return null;
    return createDeterministicFoundationRewardSelection({
        sourceId: node.id,
        objectiveId: node.objectiveId,
        runSeed,
        stablePlayerId: playerId,
        selectionIndex,
        selectedAugmentIds
    });
}
