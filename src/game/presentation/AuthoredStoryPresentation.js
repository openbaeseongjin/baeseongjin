const ENTRY_PRESENTATIONS = Object.freeze({
    "sector-01-01": Object.freeze([
        Object.freeze({
            id: "sector-01-01:lockdown",
            title: "GROUND SERVICE ACCESS",
            detail: "LOCKDOWN",
            durationSeconds: 1.8
        })
    ]),
    "sector-01-02": Object.freeze([
        Object.freeze({
            id: "sector-01-02:lift-offline",
            title: "LIFT CONTROL",
            detail: "OFFLINE",
            durationSeconds: 1.6
        })
    ])
});

const POSITION_PRESENTATIONS = Object.freeze({
    "sector-01-02": Object.freeze([
        Object.freeze({
            token: "manual-access-only",
            maxLocalY: -96,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-02:manual-access-only",
                    title: "AUTOMATIC LIFT SERVICE",
                    detail: "SUSPENDED · MANUAL ACCESS ONLY",
                    durationSeconds: 1.8
                })
            ])
        })
    ])
});

const OBJECTIVE_PRESENTATIONS = Object.freeze({
    "sector-01-01:terminal-read": Object.freeze([
        Object.freeze({
            id: "sector-01-01:terminal-grid",
            title: "VERTICAL GRID",
            detail: "CASCADE FAILURE",
            durationSeconds: 0.9
        }),
        Object.freeze({
            id: "sector-01-01:terminal-transit",
            title: "LOWER TRANSIT",
            detail: "OFFLINE",
            durationSeconds: 0.9
        }),
        Object.freeze({
            id: "sector-01-01:terminal-shuttle",
            title: "ROOFTOP PAD 03",
            detail: "MAINTENANCE SHUTTLE · STANDBY",
            durationSeconds: 0.9
        })
    ]),
    "sector-01-02:final-deck-reached": Object.freeze([
        Object.freeze({
            id: "sector-01-02:power-reduction-stage-2",
            title: "POWER REDUCTION",
            detail: "STAGE 2",
            durationSeconds: 1.2
        }),
        Object.freeze({
            id: "sector-01-02:security-access-check",
            title: "SECURITY ACCESS",
            detail: "CHECK",
            durationSeconds: 1.2
        })
    ])
});

const GATE_PRESENTATIONS = Object.freeze({
    "sector-01-01:gate": Object.freeze([
        Object.freeze({
            id: "sector-01-01:gate-open",
            title: "SERVICE SHAFT 02",
            detail: "ACCESS OPEN",
            durationSeconds: 1.2
        })
    ])
});

export class AuthoredStoryPresentation {
    constructor() {
        this.currentAreaId = null;
        this.queue = [];
        this.current = null;
        this.age = 0;
        this.seenTokens = new Set();
    }

    #enqueue(token, presentations) {
        if (!presentations?.length || this.seenTokens.has(token)) return;
        this.seenTokens.add(token);
        this.queue.push(...presentations);
        this.current ??= this.queue.shift() ?? null;
    }

    #advance(dt) {
        let remaining = dt;
        while (this.current && remaining > 0) {
            const available = this.current.durationSeconds - this.age;
            if (remaining < available) {
                this.age += remaining;
                return;
            }
            remaining -= available;
            this.current = this.queue.shift() ?? null;
            this.age = 0;
        }
    }

    update(dt, { currentAreaId = null, currentAreaLocalY = null, events = [] } = {}) {
        if (currentAreaId !== this.currentAreaId) {
            this.currentAreaId = currentAreaId;
            this.#enqueue(`area:${currentAreaId}`, ENTRY_PRESENTATIONS[currentAreaId]);
        }
        for (const trigger of POSITION_PRESENTATIONS[currentAreaId] ?? []) {
            if (Number.isFinite(currentAreaLocalY) && currentAreaLocalY <= trigger.maxLocalY) {
                this.#enqueue(`position:${currentAreaId}:${trigger.token}`, trigger.presentations);
            }
        }
        for (const event of events) {
            if (event.eventType === "objective-sequence-started") {
                this.#enqueue(`objective:${event.objectiveId}`, OBJECTIVE_PRESENTATIONS[event.objectiveId]);
            }
            if (event.eventType === "objective-completed") {
                this.#enqueue(`objective:${event.objectiveId}`, OBJECTIVE_PRESENTATIONS[event.objectiveId]);
            }
            if (event.eventType === "gate-unlocked") {
                this.#enqueue(`gate:${event.gateId}`, GATE_PRESENTATIONS[event.gateId]);
            }
        }
        this.#advance(dt);
        return this.snapshot();
    }

    snapshot() {
        if (!this.current) return null;
        return Object.freeze({
            ...this.current,
            age: this.age,
            progress: Math.min(1, this.age / this.current.durationSeconds)
        });
    }
}
