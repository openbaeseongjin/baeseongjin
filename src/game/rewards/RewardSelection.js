function freezeSelection(selection) {
    return Object.freeze({
        sourceId: selection.sourceId,
        rewardType: selection.rewardType,
        choices: selection.choices,
        selectedIndex: selection.selectedIndex,
        inputReady: selection.inputReady,
        previousHorizontal: selection.previousHorizontal,
        previousConfirm: selection.previousConfirm
    });
}

export function createRewardSelection({ sourceId, rewardType, choices, selectedIndex = 0 }) {
    if (typeof sourceId !== "string" || sourceId.length === 0) throw new Error("sourceId must be non-empty");
    if (typeof rewardType !== "string" || rewardType.length === 0) throw new Error("rewardType must be non-empty");
    if (!Array.isArray(choices) || choices.length === 0) throw new Error("choices must be non-empty");
    if (!Number.isSafeInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= choices.length) {
        throw new Error("selectedIndex must reference a choice");
    }
    return freezeSelection({
        sourceId,
        rewardType,
        choices: Object.freeze([...choices]),
        selectedIndex,
        inputReady: false,
        previousHorizontal: 0,
        previousConfirm: false
    });
}

export function advanceRewardSelection(selection, command) {
    const horizontal = Math.sign(command.horizontal);
    const confirm = command.vertical < 0;
    if (!selection.inputReady) {
        return Object.freeze({
            selection: freezeSelection({
                ...selection,
                inputReady: horizontal === 0 && !confirm
            }),
            confirmedChoiceId: null
        });
    }

    let selectedIndex = selection.selectedIndex;
    if (horizontal !== 0 && selection.previousHorizontal === 0) {
        selectedIndex = (selectedIndex + horizontal + selection.choices.length) % selection.choices.length;
    }
    const confirmedChoiceId = confirm && !selection.previousConfirm ? selection.choices[selectedIndex].id : null;
    return Object.freeze({
        selection: freezeSelection({
            ...selection,
            selectedIndex,
            previousHorizontal: horizontal,
            previousConfirm: confirm
        }),
        confirmedChoiceId
    });
}
