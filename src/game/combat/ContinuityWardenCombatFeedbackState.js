import {
    CONTINUITY_WARDEN_COMBAT_VFX,
    isContinuityWardenBeamObject,
    isContinuityWardenMeleeObject
} from "./ContinuityWardenCombatFeedbackDefinition.js";

export class ContinuityWardenCombatFeedbackState {
    constructor(definition) {
        if (!definition || typeof definition.request !== "function") {
            throw new Error("ContinuityWardenCombatFeedbackState requires a definition");
        }
        this.definition = definition;
    }

    project(source, context) {
        for (const object of source.objects) {
            if (!this.predicate(object)) continue;
            this.present(object, context);
        }
    }

    predicate() {
        throw new Error(`${this.constructor.name} must implement predicate`);
    }

    present(object, { emit }) {
        const { id, presetId, position, direction, options } = this.definition.request(object);
        emit(id, presetId, position, direction, options);
    }
}

export class ContinuityWardenMeleeActiveFeedbackState extends ContinuityWardenCombatFeedbackState {
    constructor() {
        super(CONTINUITY_WARDEN_COMBAT_VFX.MELEE);
    }

    predicate(object) {
        return isContinuityWardenMeleeObject(object);
    }
}

export class ContinuityWardenBeamActiveFeedbackState extends ContinuityWardenCombatFeedbackState {
    constructor() {
        super(CONTINUITY_WARDEN_COMBAT_VFX.BEAM);
    }

    predicate(object) {
        return isContinuityWardenBeamObject(object);
    }
}

export function createContinuityWardenCombatFeedbackStates() {
    return Object.freeze([
        new ContinuityWardenMeleeActiveFeedbackState(),
        new ContinuityWardenBeamActiveFeedbackState()
    ]);
}
