export function createInputCapabilityMixin({ id, order = 0, apply }) {
    if (typeof id !== "string" || id.length === 0) throw new Error("input capability id must be non-empty");
    if (!Number.isFinite(order)) throw new Error("input capability order must be finite");
    if (typeof apply !== "function") throw new Error("input capability apply must be a function");

    return (Base) =>
        class extends Base {
            constructor(...args) {
                super(...args);
                this.registerInputCapability({
                    id,
                    order,
                    apply: (input, context) => apply.call(this, input, context)
                });
            }
        };
}
