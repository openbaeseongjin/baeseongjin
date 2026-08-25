import { advanceRewardSelection, createRewardSelection } from "./RewardSelection.js";
import { augmentById } from "../augments/AugmentCatalog.js";
import { createLogicalAugmentEntitlement } from "../augments/AugmentOffer.js";

function asAugmentSelection(selection, { selectionIndex = 0 } = {}) {
    return Object.freeze({
        ...selection,
        selectionIndex
    });
}

export function createAugmentRewardSelection({ sourceId, choices, selectedIndex = 0, selectionIndex = 0 }) {
    return asAugmentSelection(
        createRewardSelection({
            sourceId,
            rewardType: "augment",
            choices,
            selectedIndex
        }),
        { selectionIndex }
    );
}

export function advanceAugmentRewardSelection(selection, command) {
    const outcome = advanceRewardSelection(selection, command);
    return Object.freeze({
        selection: asAugmentSelection(outcome.selection, selection),
        confirmedAugmentId: outcome.confirmedChoiceId
    });
}

export function createDeterministicAugmentRewardSelection({
    sourceId,
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
    if (entitlement.choices.length === 0) return null;
    const choices = entitlement.choices.map((id) => augmentById(id));
    return createAugmentRewardSelection({
        sourceId,
        choices,
        selectionIndex
    });
}

export const EXPERIENCE_REWARD_KEY = Object.freeze({
    source: (playerId, rewardLevel) => `experience-reward:${playerId}:${rewardLevel}`
});

export function createExperienceAugmentRewardSelection({
    runSeed,
    stablePlayerId,
    rewardLevel,
    selectedAugmentIds = []
}) {
    const selectionIndex = rewardLevel - 1;
    return createDeterministicAugmentRewardSelection({
        sourceId: EXPERIENCE_REWARD_KEY.source(stablePlayerId, rewardLevel),
        runSeed,
        stablePlayerId,
        selectionIndex,
        selectedAugmentIds
    });
}
