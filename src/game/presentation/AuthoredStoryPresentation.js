import { foundationAugmentById } from "../augments/FoundationAugmentCatalog.js";

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
    ]),
    "sector-01-04": Object.freeze([
        Object.freeze({
            id: "sector-01-04:grapple-detected",
            title: "GRAPPLE DEVICE",
            detail: "DETECTED",
            durationSeconds: 1.1
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
    ]),
    "sector-01-03": Object.freeze([
        Object.freeze({
            token: "employee-scan",
            minLocalX: -144,
            maxLocalX: -48,
            minLocalY: -160,
            maxLocalY: 0,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-03:employee-verified",
                    title: "EMPLOYEE VERIFIED",
                    detail: "VERTICAL MAINTENANCE",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-01-03:assigned-sector",
                    title: "ASSIGNED SECTOR",
                    detail: "LOWER MAINTENANCE",
                    durationSeconds: 1.1
                })
            ])
        }),
        Object.freeze({
            token: "return-warning",
            minLocalX: 112,
            maxLocalX: 384,
            minLocalY: -384,
            maxLocalY: -288,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-03:return-warning",
                    title: "RETURN TO ASSIGNED SECTOR",
                    detail: "FINAL WARNING",
                    durationSeconds: 1.4
                })
            ])
        }),
        Object.freeze({
            token: "unauthorized-transit",
            minLocalY: -928,
            maxLocalY: -384,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-03:route-violation",
                    title: "ROUTE VIOLATION",
                    detail: "DETECTED",
                    durationSeconds: 0.45
                }),
                Object.freeze({
                    id: "sector-01-03:unauthorized-transit",
                    title: "UNAUTHORIZED",
                    detail: "VERTICAL TRANSIT",
                    durationSeconds: 1.2
                })
            ])
        }),
        Object.freeze({
            token: "access-denied",
            minLocalX: 32,
            minLocalY: -1152,
            maxLocalY: -944,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-03:access-denied",
                    title: "ACCESS DENIED",
                    detail: "RETURN TO ASSIGNED SECTOR",
                    durationSeconds: 1.2
                })
            ])
        })
    ]),
    "sector-01-04": Object.freeze([
        Object.freeze({
            token: "node-scan",
            minLocalY: -288,
            maxLocalY: -96,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-04:telemetry-analyzed",
                    title: "GRAPPLE TELEMETRY",
                    detail: "ANALYZED",
                    durationSeconds: 0.9
                }),
                Object.freeze({
                    id: "sector-01-04:override-available",
                    title: "SAFETY LIMIT OVERRIDE",
                    detail: "AVAILABLE",
                    durationSeconds: 1.1
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
    ]),
    "sector-01-03:maintenance-override": Object.freeze([
        Object.freeze({
            id: "sector-01-03:maintenance-override",
            title: "MAINTENANCE",
            detail: "OVERRIDE",
            durationSeconds: 0.9
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
    ]),
    "sector-01-03:gate": Object.freeze([
        Object.freeze({
            id: "sector-01-03:violation-logged",
            title: "VIOLATION",
            detail: "LOGGED",
            durationSeconds: 1.2
        })
    ])
});

function insideOptionalRange(value, minimum, maximum) {
    if (!Number.isFinite(value)) return minimum === undefined && maximum === undefined;
    return (minimum === undefined || value >= minimum) && (maximum === undefined || value <= maximum);
}

function positionMatches(trigger, localX, localY) {
    return (
        insideOptionalRange(localX, trigger.minLocalX, trigger.maxLocalX) &&
        insideOptionalRange(localY, trigger.minLocalY, trigger.maxLocalY)
    );
}

function foundationSelectionPresentations(foundationId) {
    const foundation = foundationAugmentById(foundationId);
    if (!foundation) return Object.freeze([]);
    return Object.freeze([
        Object.freeze({
            id: `sector-01-04:augment-selected:${foundationId}`,
            title: "AUGMENT PROTOCOL",
            detail: "ACCEPTED",
            durationSeconds: 0.9
        }),
        Object.freeze({
            id: `sector-01-04:firmware-applied:${foundationId}`,
            title: foundation.name,
            detail: "ONLINE",
            durationSeconds: 1.2
        })
    ]);
}

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

    update(dt, { currentAreaId = null, currentAreaLocalX = null, currentAreaLocalY = null, events = [] } = {}) {
        if (currentAreaId !== this.currentAreaId) {
            this.currentAreaId = currentAreaId;
            this.#enqueue(`area:${currentAreaId}`, ENTRY_PRESENTATIONS[currentAreaId]);
        }
        for (const trigger of POSITION_PRESENTATIONS[currentAreaId] ?? []) {
            if (positionMatches(trigger, currentAreaLocalX, currentAreaLocalY)) {
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
            if (event.eventType === "foundation-selected" || event.eventType === "predicted-foundation-selected") {
                this.#enqueue(
                    `foundation:${event.playerId ?? event.ownerId}:${event.sourceId}`,
                    foundationSelectionPresentations(event.foundationId)
                );
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
