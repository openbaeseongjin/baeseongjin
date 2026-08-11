export function createSimulationCapabilityMixin({ id, order = 0, apply }) {
    if (typeof id !== "string" || id.length === 0) throw new Error("simulation capability id must be non-empty");
    if (!Number.isFinite(order)) throw new Error("simulation capability order must be finite");
    if (typeof apply !== "function") throw new Error("simulation capability apply must be a function");

    return (Base) =>
        class extends Base {
            constructor(...args) {
                super(...args);
                this.registerSimulationCapability({
                    id,
                    order,
                    apply: (context) => apply.call(this, context)
                });
            }
        };
}
