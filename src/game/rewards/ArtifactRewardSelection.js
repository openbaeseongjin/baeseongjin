function freezeSelection(selection) {
    return Object.freeze({
        checkpointId: selection.checkpointId,
        choices: selection.choices,
        selectedIndex: selection.selectedIndex,
        inputReady: selection.inputReady,
        previousHorizontal: selection.previousHorizontal,
        previousConfirm: selection.previousConfirm
    });
}

export function createArtifactRewardSelection({ checkpointId, choices, selectedIndex = 0 }) {
    if (typeof checkpointId !== "string" || checkpointId.length === 0) {
        throw new Error("checkpointId must be non-empty");
    }
    if (!Array.isArray(choices) || choices.length === 0) throw new Error("choices must be non-empty");
    if (!Number.isSafeInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= choices.length) {
        throw new Error("selectedIndex must reference a choice");
    }
    return freezeSelection({
        checkpointId,
        choices,
        selectedIndex,
        inputReady: false,
        previousHorizontal: 0,
        previousConfirm: false
    });
}

export function advanceArtifactRewardSelection(selection, command) {
    const horizontal = Math.sign(command.horizontal);
    const confirm = command.vertical < 0;
    if (!selection.inputReady) {
        return Object.freeze({
            selection: freezeSelection({
                ...selection,
                inputReady: horizontal === 0 && !confirm
            }),
            confirmedArtifactId: null
        });
    }

    let selectedIndex = selection.selectedIndex;
    if (horizontal !== 0 && selection.previousHorizontal === 0) {
        selectedIndex = (selectedIndex + horizontal + selection.choices.length) % selection.choices.length;
    }
    const confirmedArtifactId = confirm && !selection.previousConfirm ? selection.choices[selectedIndex].id : null;
    return Object.freeze({
        selection: freezeSelection({
            ...selection,
            selectedIndex,
            previousHorizontal: horizontal,
            previousConfirm: confirm
        }),
        confirmedArtifactId
    });
}
