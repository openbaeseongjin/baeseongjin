function finite(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
}

function freezeWorldObject(object) {
    return Object.freeze({
        id: object.id,
        kind: PRESENTATION_KIND[object.kind] ?? object.kind,
        state: object.state ?? object.beamState ?? (object.telegraphing ? "telegraph" : "idle"),
        variant: object.variant ?? null,
        physicsBody: object.physicsBody === true,
        ropeAttachable: object.ropeAttachable === true,
        hazardKind: object.hazardKind ?? null,
        actionState: object.actionState ?? null,
        damaging: object.damaging === true,
        movementProgress: finite(object.movementProgress),
        suspensionHeight: Math.max(0, finite(object.suspensionHeight)),
        rotation: finite(object.rotation),
        remainingSeconds: Math.max(0, finite(object.remainingSeconds)),
        surfaceId: object.surfaceId ?? null,
        velocity: Object.freeze({ x: finite(object.velocity?.x), y: finite(object.velocity?.y) }),
        path: object.path
            ? Object.freeze({ startX: finite(object.path.startX), targetX: finite(object.path.targetX) })
            : null,
        active: object.active !== false,
        position: Object.freeze({ x: finite(object.position?.x), y: finite(object.position?.y) }),
        ...(object.geometry?.type === "polygon" && Array.isArray(object.geometry.vertices)
            ? {
                  geometry: Object.freeze({
                      type: "polygon",
                      vertices: Object.freeze(
                          object.geometry.vertices.map(({ x, y }) => Object.freeze({ x: finite(x), y: finite(y) }))
                      )
                  })
              }
            : {}),
        ...((object.size ?? object.bounds)
            ? {
                  size: Object.freeze({
                      width: finite((object.size ?? object.bounds).width),
                      height: finite((object.size ?? object.bounds).height)
                  })
              }
            : {}),
        ...(object.direction
            ? {
                  direction:
                      directionLabel(object.direction) ??
                      (Number.isFinite(object.direction.x) && Number.isFinite(object.direction.y)
                          ? Object.freeze({ x: object.direction.x, y: object.direction.y })
                          : object.direction)
              }
            : {})
    });
}

const PRESENTATION_KIND = Object.freeze({
    "boss-grapple-anchor": "grapple-anchor"
});
const DIRECTION_LABEL = Object.freeze({ "-1": "left", 1: "right" });

function directionLabel(direction) {
    return DIRECTION_LABEL[String(direction)] ?? null;
}

export function createBossStagePresentation(snapshot, stageSpec = null) {
    if (!snapshot || snapshot.status === "inactive") return null;
    const phaseCount = Math.max(1, Math.trunc(finite(snapshot.phaseCount, 1)));
    const phase = Math.max(1, Math.min(phaseCount, Math.trunc(finite(snapshot.phase, 1))));
    const maxHealth = Math.max(1, finite(snapshot.maxHealth, 1));
    const health = Math.max(0, Math.min(maxHealth, finite(snapshot.health)));
    const presentation = snapshot.presentation ?? {};
    const hud = stageSpec?.hud ?? presentation.hud ?? snapshot.hudSpec ?? snapshot.hud ?? {};
    const phaseHealths = Object.freeze(Array.from(snapshot.phaseHealths ?? [], (value) => Math.max(0, finite(value))));
    const phaseFloors = Object.freeze(Array.from(snapshot.phaseFloors ?? [], (value) => Math.max(0, finite(value))));
    const currentPhase = snapshot.currentPhase ?? snapshot.phaseSpec ?? stageSpec?.phases?.[phase - 1] ?? {};
    const vulnerabilityRemainingSeconds = finite(
        snapshot.vulnerabilityRemainingSeconds ??
            snapshot.vulnerability?.remainingSeconds ??
            snapshot.exposureRemainingSeconds
    );
    const weakpointExposed =
        snapshot.weakpointExposed === true ||
        snapshot.vulnerability?.active === true ||
        snapshot.mechanism?.weakpointExposed === true ||
        snapshot.vulnerabilityState === "exposed" ||
        snapshot.shieldState === "exposed";
    return Object.freeze({
        visible: true,
        stageId: snapshot.stageId ?? stageSpec?.id ?? null,
        hud: Object.freeze({
            name: hud.title ?? hud.name ?? presentation.name ?? snapshot.name ?? "BOSS",
            phaseLabel: snapshot.phaseTransitioning
                ? "TRANSITION"
                : (hud.phaseLabel ?? `PHASE ${phase} / ${phaseCount}`),
            objective: snapshot.phaseTransitioning
                ? "다음 전투 구역으로 이동"
                : (snapshot.objectiveLabel ??
                  snapshot.currentObjective ??
                  currentPhase.hud?.objective ??
                  hud.objective ??
                  presentation.objective ??
                  "ENGAGE TARGET"),
            vulnerabilityLabel:
                snapshot.vulnerabilityLabel ??
                hud.vulnerabilityLabel ??
                (weakpointExposed ? "WEAKPOINT EXPOSED" : "WEAKPOINT SECURED"),
            health,
            maxHealth,
            phaseHealths,
            phaseFloors,
            phase,
            phaseCount,
            showNumbers: hud.healthBar?.showNumbers === true,
            showPhaseBreaks: hud.healthBar?.showPhaseBreaks !== false,
            healthBarStyle: hud.healthBar?.style ?? "segmented-total",
            phaseMarkerCount: hud.healthBar?.phaseMarkerCount ?? phaseCount,
            showVulnerabilityCountdown: hud.showVulnerabilityCountdown !== false,
            weakpointExposed,
            vulnerabilityRemainingSeconds,
            vulnerabilityDurationSeconds: finite(currentPhase.vulnerability?.durationSeconds)
        }),
        world: Object.freeze({
            name: presentation.name ?? snapshot.name ?? hud.title ?? hud.name ?? "BOSS",
            objects: Object.freeze((presentation.objects ?? snapshot.presentationObjects ?? []).map(freezeWorldObject))
        })
    });
}
