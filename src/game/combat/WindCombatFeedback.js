import { ClientFeedbackObject } from "./ClientFeedbackObject.js";
import { CLIENT_FEEDBACK_OBJECT } from "./ClientFeedbackObjectDefinition.js";

export class WindCombatFeedback extends ClientFeedbackObject {
    sync({ windStates = [], world = {} }, context) {
        const stateById = new Map(windStates.map((state) => [state.id, state]));
        for (const zone of world.windZones ?? []) {
            this.project(CLIENT_FEEDBACK_OBJECT.WIND, { zone, state: stateById.get(zone.id) }, stateById, context);
        }
    }
}
