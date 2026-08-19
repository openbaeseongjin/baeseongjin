function freezePhase(phase) {
    return Object.freeze({ ...phase, threats: Object.freeze([...phase.threats]) });
}

export const BOSS_01_DEFINITION = Object.freeze({
    id: "boss-01:containment-gantry-c-01",
    name: "CONTAINMENT GANTRY C-01",
    maxHealth: 360,
    phaseCount: 3,
    phaseHealth: 120,
    exposureSeconds: 8,
    timerSeconds: 210,
    collapseSpeed: 80,
    breakerIds: Object.freeze(["boss-01:breaker:phase-1", "boss-01:breaker:phase-2", "boss-01:breaker:phase-3"]),
    phases: Object.freeze([
        freezePhase({ phase: 1, threats: ["standard-emitter"] }),
        freezePhase({ phase: 2, threats: ["standard-emitter", "pulsed-wind"] }),
        freezePhase({ phase: 3, threats: ["alternating-emitters", "pulsed-wind", "no-crossfire"] })
    ])
});
