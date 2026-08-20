import { DIRECTION_COMMAND_CONTRACTS } from "./DirectionDefinition.js";

export class DirectionAdapterRegistry {
    constructor() {
        this.adapters = new Map();
    }

    register({ domain, action, execute }) {
        const contract = DIRECTION_COMMAND_CONTRACTS[domain];
        if (!contract?.actions.includes(action)) throw new Error(`unknown direction adapter: ${domain}.${action}`);
        if (typeof execute !== "function") throw new Error("direction adapter execute must be a function");
        const key = `${domain}.${action}`;
        if (this.adapters.has(key)) throw new Error(`duplicate direction adapter: ${key}`);
        this.adapters.set(key, Object.freeze({ domain, action, execute }));
        return this;
    }

    has(domain, action) {
        return this.adapters.has(`${domain}.${action}`);
    }

    actions() {
        return new Set(this.adapters.keys());
    }

    dispatch(command, context = {}) {
        if (context.executionAuthority !== command.authority) return false;
        const adapter = this.adapters.get(`${command.domain}.${command.action}`);
        if (!adapter) return false;
        return adapter.execute(command, context) !== false;
    }
}
