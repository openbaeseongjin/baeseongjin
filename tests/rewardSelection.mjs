import assert from "node:assert/strict";
import { advanceRewardSelection, createRewardSelection } from "../src/game/rewards/RewardSelection.js";

function command({ horizontal = 0, vertical = 0, interactSequence = 0 } = {}) {
    return { horizontal, vertical, interactSequence };
}

export function run() {
    const choices = [{ id: "first" }, { id: "second" }, { id: "third" }];
    let selection = createRewardSelection({
        sourceId: "augment-node",
        rewardType: "foundation",
        choices
    });

    const openingConfirm = advanceRewardSelection(selection, command({ vertical: -1, interactSequence: 1 }));
    assert.equal(openingConfirm.confirmedChoiceId, null, "the input that opens the chooser must not confirm a card");
    selection = openingConfirm.selection;
    selection = advanceRewardSelection(
        selection,
        command({ horizontal: 1, vertical: -1, interactSequence: 1 })
    ).selection;
    assert.equal(
        selection.selectedIndex,
        1,
        "a neutral horizontal channel may navigate immediately even while the opening confirm remains held"
    );

    selection = advanceRewardSelection(
        selection,
        command({ horizontal: 1, vertical: -1, interactSequence: 1 })
    ).selection;
    assert.equal(selection.selectedIndex, 1, "a held horizontal input must not move again on every frame");

    let horizontalHeld = createRewardSelection({
        sourceId: "augment-node",
        rewardType: "foundation",
        choices
    });
    const openingHorizontal = advanceRewardSelection(horizontalHeld, command({ horizontal: 1 }));
    assert.equal(openingHorizontal.selection.selectedIndex, 0, "the input that opens the chooser must not move a card");
    horizontalHeld = openingHorizontal.selection;
    const confirmed = advanceRewardSelection(
        horizontalHeld,
        command({ horizontal: 1, vertical: -1, interactSequence: 1 })
    );
    assert.equal(
        confirmed.confirmedChoiceId,
        "first",
        "confirmation must work after its own release even while the opening horizontal remains held"
    );

    let delayedHeldConfirm = createRewardSelection({
        sourceId: "augment-node",
        rewardType: "foundation",
        choices
    });
    delayedHeldConfirm = advanceRewardSelection(
        delayedHeldConfirm,
        command({ vertical: -1, interactSequence: 7 })
    ).selection;
    delayedHeldConfirm = advanceRewardSelection(
        delayedHeldConfirm,
        command({ vertical: 0, interactSequence: 7 })
    ).selection;
    const resumedHeldInput = advanceRewardSelection(delayedHeldConfirm, command({ vertical: -1, interactSequence: 7 }));
    assert.equal(
        resumedHeldInput.confirmedChoiceId,
        null,
        "a neutral network sample must not turn the still-held opening W into a new confirmation press"
    );
    delayedHeldConfirm = advanceRewardSelection(
        resumedHeldInput.selection,
        command({ vertical: 0, interactSequence: 7 })
    ).selection;
    assert.equal(
        advanceRewardSelection(delayedHeldConfirm, command({ vertical: -1, interactSequence: 8 })).confirmedChoiceId,
        "first",
        "only a newer physical interact sequence may confirm the choice"
    );
}
