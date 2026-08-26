function insideOptionalRange(value, minimum, maximum) {
    if (!Number.isFinite(value)) return minimum === undefined && maximum === undefined;
    return (minimum === undefined || value >= minimum) && (maximum === undefined || value <= maximum);
}

function eventMatches(trigger, event) {
    if (!trigger.eventTypes.includes(event.eventType)) return false;
    if (trigger.objectiveId && trigger.objectiveId !== (event.sourceObjectiveId ?? event.objectiveId)) return false;
    if (trigger.gateId && trigger.gateId !== event.gateId) return false;
    return true;
}

function triggerMatches(trigger, context, areaEntered) {
    switch (trigger.kind) {
        case "area-enter":
            return areaEntered && context.areaId === trigger.areaId;
        case "position-threshold":
            return (
                insideOptionalRange(context.localX, trigger.minLocalX, trigger.maxLocalX) &&
                insideOptionalRange(context.localY, trigger.minLocalY, trigger.maxLocalY)
            );
        case "camera-zone":
            return trigger.zoneIds.includes(context.cameraZoneId);
        case "event":
            return (context.events ?? []).some((event) => eventMatches(trigger, event));
        default:
            return false;
    }
}

export class DirectionRuntime {
    constructor({ definitions = [], adapters, executionAuthorities = ["local"] } = {}) {
        if (!adapters?.dispatch) throw new Error("DirectionRuntime requires an adapter registry");
        this.definitions = new Map(definitions.map((definition) => [definition.areaId, definition]));
        this.adapters = adapters;
        this.executionAuthorities = new Set(executionAuthorities);
        this.activeSchedules = [];
        this.seenTokens = new Set();
        this.triggerStates = new Map();
        this.currentAreaId = null;
    }

    update(dt, context = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("DirectionRuntime dt must be non-negative");
        const dispatched = [];
        const areaEntered = context.areaId !== this.currentAreaId;
        this.currentAreaId = context.areaId ?? null;
        const definition = this.definitions.get(context.areaId);
        if (definition) {
            for (const beat of definition.beats) {
                const matches = triggerMatches(beat.trigger, context, areaEntered);
                const wasMatching = this.triggerStates.get(beat.dedupeToken) === true;
                this.triggerStates.set(beat.dedupeToken, matches);
                const repeatable = beat.replayPolicy?.startsWith("repeatable") === true;
                const mayActivate = matches && (!repeatable || !wasMatching) && !this.seenTokens.has(beat.dedupeToken);
                if (!mayActivate) continue;
                if (!repeatable) this.seenTokens.add(beat.dedupeToken);
                this.activeSchedules.push({ beat, elapsed: 0, nextCommandIndex: 0 });
            }
        }

        for (const schedule of this.activeSchedules) {
            schedule.elapsed += dt;
            while (
                schedule.nextCommandIndex < schedule.beat.commands.length &&
                schedule.beat.commands[schedule.nextCommandIndex].offsetSeconds <= schedule.elapsed + 1e-9
            ) {
                const command = schedule.beat.commands[schedule.nextCommandIndex++];
                if (this.executionAuthorities.has(command.authority)) {
                    const accepted = this.adapters.dispatch(command, {
                        ...context,
                        executionAuthority: command.authority
                    });
                    dispatched.push(Object.freeze({ command, accepted }));
                }
            }
        }
        this.activeSchedules = this.activeSchedules.filter(
            ({ beat, elapsed, nextCommandIndex }) =>
                nextCommandIndex < beat.commands.length || elapsed < beat.durationSeconds
        );
        return Object.freeze(dispatched);
    }

    cancelBeat(beatId) {
        const before = this.activeSchedules.length;
        this.activeSchedules = this.activeSchedules.filter(({ beat }) => beat.beatId !== beatId);
        return before - this.activeSchedules.length;
    }

    resetAttempt() {
        this.activeSchedules = [];
        this.seenTokens.clear();
        this.triggerStates.clear();
        this.currentAreaId = null;
    }
}
