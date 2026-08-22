import { ClientFeedbackObject } from "./ClientFeedbackObject.js";
import { CLIENT_FEEDBACK_OBJECT } from "./ClientFeedbackObjectDefinition.js";

export class ProjectileCombatFeedback extends ClientFeedbackObject {
    sync(scene, context) {
        for (const definition of CLIENT_FEEDBACK_OBJECT.PROJECTILE)
            for (const projectile of scene[definition.collection] ?? [])
                this.project(definition, projectile, scene, context);
    }
}
