export class InputDispatcher {
    dispatch({ objects, ownerId, input, context = {} }) {
        if (!Array.isArray(objects)) throw new Error("objects must be an array");
        if (typeof ownerId !== "string" || ownerId.length === 0) throw new Error("ownerId must be non-empty");

        const pending = [];
        for (const object of objects) {
            if (object?.driveKind !== "input" || object.ownerId !== ownerId) continue;
            if (typeof object.inputCapabilities !== "function") continue;
            for (const capability of object.inputCapabilities()) pending.push({ object, capability });
        }
        pending.sort(
            (left, right) =>
                left.capability.order - right.capability.order ||
                left.capability.id.localeCompare(right.capability.id) ||
                left.object.id.localeCompare(right.object.id)
        );
        for (const { capability } of pending) capability.apply(input, context);
        return pending.length;
    }
}
