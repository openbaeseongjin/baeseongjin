function freezeSelection(selection) {
    return Object.freeze({
        sourceId: selection.sourceId,
        rewardType: selection.rewardType,
        choices: selection.choices,
        selectedIndex: selection.selectedIndex,
        openingInputCaptured: selection.openingInputCaptured,
        horizontalReady: selection.horizontalReady,
        confirmReady: selection.confirmReady,
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
        openingInputCaptured: false,
        horizontalReady: false,
        confirmReady: false,
        previousHorizontal: null,
        previousConfirm: null
    });
}

export function advanceRewardSelection(selection, command) {
    const horizontal = Math.sign(command.horizontal);
    const confirm = command.vertical < 0;
    if (!selection.openingInputCaptured) {
        return Object.freeze({
            selection: freezeSelection({
                ...selection,
                openingInputCaptured: true,
                horizontalReady: horizontal === 0,
                confirmReady: !confirm,
                previousHorizontal: horizontal,
                previousConfirm: confirm
            }),
            confirmedChoiceId: null
        });
    }

    let selectedIndex = selection.selectedIndex;
    if (selection.horizontalReady && horizontal !== 0 && selection.previousHorizontal === 0) {
        selectedIndex = (selectedIndex + horizontal + selection.choices.length) % selection.choices.length;
    }
    const confirmedChoiceId =
        selection.confirmReady && confirm && !selection.previousConfirm ? selection.choices[selectedIndex].id : null;
    return Object.freeze({
        selection: freezeSelection({
            ...selection,
            selectedIndex,
            horizontalReady: selection.horizontalReady || horizontal === 0,
            confirmReady: selection.confirmReady || !confirm,
            previousHorizontal: horizontal,
            previousConfirm: confirm
        }),
        confirmedChoiceId
    });
}
