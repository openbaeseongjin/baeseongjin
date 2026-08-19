function freezeSelection(selection) {
    return Object.freeze({
        sourceId: selection.sourceId,
        rewardType: selection.rewardType,
        choices: selection.choices,
        selectedIndex: selection.selectedIndex,
        openingInputCaptured: selection.openingInputCaptured,
        openingInteractSequence: selection.openingInteractSequence,
        horizontalReady: selection.horizontalReady,
        previousHorizontal: selection.previousHorizontal
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
        openingInteractSequence: null,
        horizontalReady: false,
        previousHorizontal: null
    });
}

export function advanceRewardSelection(selection, command) {
    const horizontal = Math.sign(command.horizontal);
    const confirm = command.vertical < 0;
    const interactSequence = Number.isSafeInteger(command.interactSequence) ? command.interactSequence : 0;
    if (!selection.openingInputCaptured) {
        return Object.freeze({
            selection: freezeSelection({
                ...selection,
                openingInputCaptured: true,
                openingInteractSequence: interactSequence,
                horizontalReady: horizontal === 0,
                previousHorizontal: horizontal
            }),
            confirmedChoiceId: null
        });
    }

    let selectedIndex = selection.selectedIndex;
    if (selection.horizontalReady && horizontal !== 0 && selection.previousHorizontal === 0) {
        selectedIndex = (selectedIndex + horizontal + selection.choices.length) % selection.choices.length;
    }
    const confirmedChoiceId =
        confirm && interactSequence > selection.openingInteractSequence ? selection.choices[selectedIndex].id : null;
    return Object.freeze({
        selection: freezeSelection({
            ...selection,
            selectedIndex,
            horizontalReady: selection.horizontalReady || horizontal === 0,
            previousHorizontal: horizontal
        }),
        confirmedChoiceId
    });
}
