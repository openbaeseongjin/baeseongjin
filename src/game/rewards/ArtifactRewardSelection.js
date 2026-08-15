import { advanceRewardSelection, createRewardSelection } from "./RewardSelection.js";

function asArtifactSelection(selection) {
    return Object.freeze({ ...selection, checkpointId: selection.sourceId });
}

export function createArtifactRewardSelection({ checkpointId, choices, selectedIndex = 0 }) {
    return asArtifactSelection(
        createRewardSelection({
            sourceId: checkpointId,
            rewardType: "artifact",
            choices,
            selectedIndex
        })
    );
}

export function advanceArtifactRewardSelection(selection, command) {
    const outcome = advanceRewardSelection(selection, command);
    return Object.freeze({
        selection: asArtifactSelection(outcome.selection),
        confirmedArtifactId: outcome.confirmedChoiceId
    });
}
