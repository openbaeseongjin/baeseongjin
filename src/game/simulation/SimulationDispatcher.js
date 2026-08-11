export class SimulationDispatcher {
    dispatch({ objects, capabilityId, context = {} }) {
        if (!Array.isArray(objects)) throw new Error("objects must be an array");
        if (typeof capabilityId !== "string" || capabilityId.length === 0) {
            throw new Error("capabilityId must be a non-empty string");
        }

        const pending = [];
        for (const object of objects) {
            if (object?.driveKind !== "simulation") continue;
            if (typeof object.simulationCapabilities !== "function") continue;
            for (const capability of object.simulationCapabilities()) {
                if (capability.id !== capabilityId) continue;
                pending.push({ object, capability });
            }
        }
        pending.sort(
            (left, right) =>
                left.capability.order - right.capability.order ||
                left.capability.id.localeCompare(right.capability.id) ||
                left.object.id.localeCompare(right.object.id)
        );
        return Object.freeze(
            pending.map(({ object, capability }) =>
                Object.freeze({
                    object,
                    capabilityId: capability.id,
                    result: capability.apply(context)
                })
            )
        );
    }
}
