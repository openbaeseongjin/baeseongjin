import { advanceRewardSelection, createRewardSelection } from "./RewardSelection.js";

function asFoundationSelection(selection, objectiveId) {
    return Object.freeze({ ...selection, objectiveId });
}

export function createFoundationRewardSelection({ sourceId, objectiveId, choices, selectedIndex = 0 }) {
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
        objectiveId
    );
}

export function advanceFoundationRewardSelection(selection, command) {
    const outcome = advanceRewardSelection(selection, command);
    return Object.freeze({
        selection: asFoundationSelection(outcome.selection, selection.objectiveId),
        confirmedFoundationId: outcome.confirmedChoiceId
    });
}
