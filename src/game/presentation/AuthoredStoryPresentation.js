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
    ]),
    "sector-01-05": Object.freeze([
        Object.freeze({
            id: "sector-01-05:live-calibration",
            title: "AUGMENT TEST BAY",
            detail: "LIVE CALIBRATION",
            durationSeconds: 1.4
        })
    ]),
    "sector-01-06": Object.freeze([
        Object.freeze({
            id: "sector-01-06:airflow-unstable",
            title: "COOLING DISTRIBUTION",
            detail: "AIRFLOW UNSTABLE",
            durationSeconds: 1.6
        })
    ]),
    "sector-01-07": Object.freeze([
        Object.freeze({
            id: "sector-01-07:pressure-network",
            title: "PRESSURE NETWORK",
            detail: "UNSTABLE",
            durationSeconds: 1.4
        })
    ]),
    "sector-01-08": Object.freeze([
        Object.freeze({
            id: "sector-01-08:containment-gate",
            title: "CONTAINMENT GATE",
            detail: "LOCKED",
            durationSeconds: 1.4
        })
    ]),
    "sector-02-01": Object.freeze([
        Object.freeze({
            id: "sector-02-01:block-12-entry",
            title: "WORKER BLOCK 12",
            detail: "RESIDENTIAL COURTYARD",
            durationSeconds: 1.4
        })
    ]),
    "sector-02-02": Object.freeze([
        Object.freeze({
            id: "sector-02-02:patrol-cycle",
            title: "PATROL WALKWAY",
            detail: "SECURITY STILL ACTIVE",
            durationSeconds: 1.4
        })
    ]),
    "sector-02-03": Object.freeze([
        Object.freeze({
            id: "sector-02-03:foundation-detected",
            title: "FOUNDATION AUGMENT",
            detail: "DETECTED",
            durationSeconds: 1.4
        })
    ]),
    "sector-02-04": Object.freeze([
        Object.freeze({
            id: "sector-02-04:residential-stack",
            title: "RESIDENTIAL STACK",
            detail: "MULTI-ROUTE HOUSING",
            durationSeconds: 1.4
        })
    ]),
    "sector-02-05": Object.freeze([
        Object.freeze({
            id: "sector-02-05:upper-transit",
            title: "EVACUATION WALKWAY",
            detail: "UPPER TRANSIT RESTRICTED",
            durationSeconds: 1.5
        })
    ]),
    "sector-02-06": Object.freeze([
        Object.freeze({
            id: "sector-02-06:residential-blocks",
            title: "RESIDENTIAL BLOCKS",
            detail: "12–18",
            durationSeconds: 1.3
        })
    ]),
    "sector-02-07": Object.freeze([
        Object.freeze({
            id: "sector-02-07:shelter-access",
            title: "SHELTER ACCESS",
            detail: "EVACUATION TRANSFER SUSPENDED",
            durationSeconds: 1.5
        })
    ]),
    "sector-02-08": Object.freeze([
        Object.freeze({
            id: "sector-02-08:evacuation-platform",
            title: "EVACUATION PLATFORM",
            detail: "GROUP C TRANSFER SUSPENDED",
            durationSeconds: 1.5
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
    ]),
    "sector-01-05": Object.freeze([
        Object.freeze({
            token: "load-test-context",
            minLocalY: -900,
            maxLocalY: -600,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-05:vertical-load-test",
                    title: "VERTICAL LOAD TEST",
                    detail: "IN PROGRESS",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-01-05:security-response-test",
                    title: "SECURITY RESPONSE TEST",
                    detail: "IN PROGRESS",
                    durationSeconds: 1.1
                })
            ])
        })
    ]),
    "sector-01-07": Object.freeze([
        Object.freeze({
            token: "pressure-limit",
            minLocalY: -832,
            maxLocalY: -608,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-07:pressure-limit",
                    title: "PRESSURE LIMIT",
                    detail: "EXCEEDED",
                    durationSeconds: 1.1
                })
            ])
        }),
        Object.freeze({
            token: "containment-violation",
            minLocalY: -960,
            maxLocalY: -736,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-07:containment-violation",
                    title: "CONTAINMENT VIOLATION",
                    detail: "ACTIVE",
                    durationSeconds: 1.2
                })
            ])
        })
    ]),
    "sector-01-08": Object.freeze([
        Object.freeze({
            token: "lockdown-warning",
            minLocalY: -608,
            maxLocalY: -384,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-08:final-warning",
                    title: "FINAL WARNING",
                    detail: "",
                    durationSeconds: 1.0
                }),
                Object.freeze({
                    id: "sector-01-08:return-to-lower-maintenance",
                    title: "RETURN TO LOWER MAINTENANCE",
                    detail: "",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-01-08:closure-in-progress",
                    title: "CONTAINMENT GATE",
                    detail: "CLOSURE IN PROGRESS",
                    durationSeconds: 1.3
                })
            ])
        }),
        Object.freeze({
            token: "mid-safe-story",
            minLocalY: -1088,
            maxLocalY: -960,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-08:lockdown-87",
                    title: "CONTAINMENT GATE",
                    detail: "LOCKDOWN · 87%",
                    durationSeconds: 1.1
                })
            ])
        }),
        Object.freeze({
            token: "worker-district-preview",
            minLocalY: -1792,
            maxLocalY: -1696,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-01-08:worker-district-sign",
                    title: "WORKER DISTRICT",
                    detail: "BLOCK 12",
                    durationSeconds: 1.3
                })
            ])
        })
    ]),
    "sector-02-01": Object.freeze([
        Object.freeze({
            token: "community-notice",
            minLocalX: 96,
            maxLocalX: 224,
            minLocalY: -1008,
            maxLocalY: -896,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-02-01:community-notice",
                    title: "COMMUNITY NOTICE",
                    detail: "EVACUATION GROUP C",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-02-01:assembly-status",
                    title: "ASSEMBLY: BLOCK 12",
                    detail: "WAIT FOR FURTHER INSTRUCTION",
                    durationSeconds: 1.3
                })
            ])
        })
    ]),
    "sector-02-02": Object.freeze([
        Object.freeze({
            token: "security-status",
            minLocalX: -320,
            maxLocalX: 96,
            minLocalY: -320,
            maxLocalY: -192,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-02-02:security-patrol-active",
                    title: "SECURITY PATROL",
                    detail: "ACTIVE",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-02-02:residential-transit-restricted",
                    title: "RESIDENTIAL TRANSIT",
                    detail: "RESTRICTED",
                    durationSeconds: 1.1
                })
            ])
        })
    ]),
    "sector-02-03": Object.freeze([
        Object.freeze({
            token: "node-detection",
            minLocalX: -96,
            maxLocalX: 96,
            minLocalY: -480,
            maxLocalY: -320,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-02-03:grapple-device-detected",
                    title: "GRAPPLE DEVICE",
                    detail: "DETECTED",
                    durationSeconds: 0.9
                }),
                Object.freeze({
                    id: "sector-02-03:emergency-configuration-active",
                    title: "EMERGENCY CONFIGURATION",
                    detail: "ACTIVE",
                    durationSeconds: 1.1
                })
            ])
        })
    ]),
    "sector-02-05": Object.freeze([
        Object.freeze({
            token: "evacuation-status",
            minLocalX: 288,
            maxLocalX: 416,
            minLocalY: -768,
            maxLocalY: -640,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-02-05:assembly-complete",
                    title: "EVACUATION GROUP C",
                    detail: "ASSEMBLY COMPLETE",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-02-05:transit-restricted",
                    title: "TRANSFER AUTHORIZATION",
                    detail: "PENDING",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-02-05:upper-transit",
                    title: "UPPER TRANSIT ACCESS",
                    detail: "RESTRICTED",
                    durationSeconds: 1.1
                })
            ])
        })
    ]),
    "sector-02-07": Object.freeze([
        Object.freeze({
            token: "shelter-status",
            minLocalX: -64,
            maxLocalX: 64,
            minLocalY: -896,
            maxLocalY: -752,
            presentations: Object.freeze([
                Object.freeze({
                    id: "sector-02-07:shelter-capacity",
                    title: "SHELTER CAPACITY",
                    detail: "FULL",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-02-07:transfer-suspended",
                    title: "EVACUATION TRANSFER",
                    detail: "SUSPENDED",
                    durationSeconds: 1.1
                }),
                Object.freeze({
                    id: "sector-02-07:designated-area",
                    title: "REMAIN IN",
                    detail: "DESIGNATED AREA",
                    durationSeconds: 1.2
                })
            ])
        })
    ])
});

const TRIGGER_CUE_PRESENTATIONS = Object.freeze({
    "sector-01-03:employee-verified": Object.freeze([
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
    ]),
    "sector-01-06:exit-panel-engaged": Object.freeze([
        Object.freeze({
            id: "sector-01-06:cooling-pressure",
            title: "COOLING PRESSURE",
            detail: "CRITICAL",
            durationSeconds: 1.1
        }),
        Object.freeze({
            id: "sector-01-06:automatic-bypass",
            title: "AUTOMATIC BYPASS",
            detail: "FAILED",
            durationSeconds: 1.1
        }),
        Object.freeze({
            id: "sector-01-06:manual-bypass",
            title: "MANUAL PRESSURE BYPASS",
            detail: "REQUIRED",
            durationSeconds: 1.3
        })
    ]),
    "sector-01-07:bypass-open": Object.freeze([
        Object.freeze({
            id: "sector-01-07:pressure-stabilizing",
            title: "PRESSURE",
            detail: "STABILIZING",
            durationSeconds: 1.1
        }),
        Object.freeze({
            id: "sector-01-07:service-route",
            title: "SERVICE ROUTE",
            detail: "AVAILABLE",
            durationSeconds: 1.1
        })
    ]),
    "sector-01-08:maintenance-override": Object.freeze([
        Object.freeze({
            id: "sector-01-08:override-lock",
            title: "OVERRIDE LOCK",
            detail: "CONFIRM",
            durationSeconds: 1.1
        }),
        Object.freeze({
            id: "sector-01-08:lower-grid",
            title: "LOWER GRID CONNECTION",
            detail: "TERMINATING",
            durationSeconds: 1.2
        })
    ]),
    "sector-02-03:specialization-selected": Object.freeze([
        Object.freeze({
            id: "sector-02-03:specialization-available",
            title: "SPECIALIZATION",
            detail: "AVAILABLE",
            durationSeconds: 1.1
        }),
        Object.freeze({
            id: "sector-02-03:specialization-pending",
            title: "CALIBRATION PROTOCOL",
            detail: "PENDING",
            durationSeconds: 1.2
        })
    ]),
    "sector-02-08:transfer-control-read": Object.freeze([
        Object.freeze({
            id: "sector-02-08:group-a",
            title: "EVACUATION GROUP A",
            detail: "TRANSFER COMPLETE",
            durationSeconds: 1.1
        }),
        Object.freeze({
            id: "sector-02-08:group-b",
            title: "EVACUATION GROUP B",
            detail: "TRANSFER COMPLETE",
            durationSeconds: 1.1
        }),
        Object.freeze({
            id: "sector-02-08:group-c",
            title: "EVACUATION GROUP C",
            detail: "TRANSFER SUSPENDED",
            durationSeconds: 1.3
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
    ]),
    "sector-01-05:gate": Object.freeze([
        Object.freeze({
            id: "sector-01-05:cooling-access",
            title: "COOLING DISTRIBUTION",
            detail: "SERVICE ACCESS",
            durationSeconds: 1.2
        })
    ]),
    "sector-01-06:gate": Object.freeze([
        Object.freeze({
            id: "sector-01-06:bypass-required",
            title: "PRESSURE BYPASS",
            detail: "SERVICE ACCESS",
            durationSeconds: 1.2
        })
    ]),
    "sector-01-07:gate": Object.freeze([
        Object.freeze({
            id: "sector-01-07:containment-route",
            title: "SERVICE ROUTE",
            detail: "AVAILABLE",
            durationSeconds: 1.2
        })
    ]),
    "sector-01-08:gate": Object.freeze([
        Object.freeze({
            id: "sector-01-08:worker-district",
            title: "WORKER DISTRICT",
            detail: "ACCESS OPEN",
            durationSeconds: 1.3
        })
    ]),
    "sector-02-08:gate": Object.freeze([
        Object.freeze({
            id: "sector-02-08:commercial-transfer",
            title: "COMMERCIAL TRANSFER",
            detail: "SERVICE ACCESS",
            durationSeconds: 1.3
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

function triggerInsideBounds(triggerObject, localX, localY) {
    if (!triggerObject?.bounds || !Number.isFinite(localX) || !Number.isFinite(localY)) return false;
    const { bounds } = triggerObject;
    return (
        localX >= bounds.x &&
        localX <= bounds.x + bounds.width &&
        localY >= bounds.y &&
        localY <= bounds.y + bounds.height
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

    update(
        dt,
        { currentAreaId = null, currentAreaLocalX = null, currentAreaLocalY = null, events = [], triggers = [] } = {}
    ) {
        if (currentAreaId !== this.currentAreaId) {
            this.currentAreaId = currentAreaId;
            this.#enqueue(`area:${currentAreaId}`, ENTRY_PRESENTATIONS[currentAreaId]);
        }
        for (const trigger of POSITION_PRESENTATIONS[currentAreaId] ?? []) {
            if (positionMatches(trigger, currentAreaLocalX, currentAreaLocalY)) {
                this.#enqueue(`position:${currentAreaId}:${trigger.token}`, trigger.presentations);
            }
        }
        for (const triggerObject of triggers) {
            if (triggerInsideBounds(triggerObject, currentAreaLocalX, currentAreaLocalY)) {
                for (const cueId of triggerObject.cueIds ?? []) {
                    this.#enqueue(`trigger:${cueId}`, TRIGGER_CUE_PRESENTATIONS[cueId]);
                }
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
