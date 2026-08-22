function finite(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
}

function freezeWorldObject(object) {
    return Object.freeze({
        id: object.id,
        kind: PRESENTATION_KIND[object.kind] ?? object.kind,
        state: object.state ?? object.beamState ?? (object.telegraphing ? "telegraph" : "idle"),
        active: object.active !== false,
        position: Object.freeze({ x: finite(object.position?.x), y: finite(object.position?.y) }),
        ...((object.size ?? object.bounds)
            ? {
                  size: Object.freeze({
                      width: finite((object.size ?? object.bounds).width),
                      height: finite((object.size ?? object.bounds).height)
                  })
              }
            : {}),
        ...(object.direction ? { direction: directionLabel(object.direction) ?? object.direction } : {})
    });
}

const MECHANIC_PRESENTATION_KIND = Object.freeze({
    "full-crossbeam-sweep": "beam",
    "directional-broken-beam-sweep": "beam",
    "beam-failure": "beam",
    "rail-ram": "ram"
});
const PRESENTATION_KIND = Object.freeze({
    "boss-carriage": "carriage",
    "boss-beam": "beam",
    "boss-rail-ram": "ram",
    "boss-weakpoint": "weakpoint"
});
const DIRECTION_LABEL = Object.freeze({ "-1": "left", 1: "right" });

function directionLabel(direction) {
    return DIRECTION_LABEL[String(direction)] ?? null;
}

function stageSpecWorldObjects(stageSpec, snapshot) {
    if (!stageSpec?.boss) return [];
    const mechanicStateById = snapshot.mechanicStates ?? {};
    const mechanism = snapshot.mechanism ?? {};
    const currentMechanicIds = Object.freeze(
        stageSpec.phases?.[Math.max(0, (snapshot.phase ?? 1) - 1)]?.mechanicIds ?? []
    );
    const objects = [
        {
            id: stageSpec.boss.actorId,
            kind: "carriage",
            state: snapshot.status === "completed" ? "disabled" : "active",
            position: snapshot.bossPosition ?? {
                x: Number.isFinite(mechanism.positionX) ? mechanism.positionX : stageSpec.boss.position.x,
                y: stageSpec.boss.position.y
            },
            size: {
                width: stageSpec.boss.collider?.width,
                height: stageSpec.boss.collider?.height
            },
            direction: snapshot.travelDirection ?? directionLabel(mechanism.direction)
        },
        ...(stageSpec.mechanics ?? [])
            .filter((mechanic) => currentMechanicIds.includes(mechanic.id) || mechanicStateById[mechanic.id])
            .map((mechanic) => ({
                id: mechanic.id,
                kind: MECHANIC_PRESENTATION_KIND[mechanic.type] ?? "mechanism",
                state: mechanicStateById[mechanic.id]?.state ?? mechanism.state ?? "idle",
                position: mechanicStateById[mechanic.id]?.position ?? mechanic.position,
                size: mechanic.bounds ? { width: mechanic.bounds.width, height: mechanic.bounds.height } : undefined,
                direction:
                    mechanicStateById[mechanic.id]?.direction ??
                    mechanism.beamDirection ??
                    directionLabel(mechanism.direction)
            }))
    ];
    const activeTargetId = snapshot.activeTargetId ?? snapshot.currentTargetId ?? snapshot.vulnerability?.targetId;
    if (activeTargetId) {
        objects.push({
            id: activeTargetId,
            kind: "weakpoint",
            state:
                snapshot.weakpointExposed || snapshot.vulnerability?.active || mechanism.weakpointExposed
                    ? "exposed"
                    : "secured",
            position: snapshot.activeTargetPosition ??
                snapshot.bossPosition ?? {
                    x: Number.isFinite(mechanism.positionX) ? mechanism.positionX : stageSpec.boss.position.x,
                    y: stageSpec.boss.position.y
                },
            size: snapshot.activeTargetSize ?? { width: 96, height: 96 }
        });
    }
    return objects;
}

function enrichRuntimeWorldObject(object, stageSpec, phase) {
    if (object.size || object.bounds || !stageSpec) return object;
    const kind = PRESENTATION_KIND[object.kind] ?? object.kind;
    if (kind === "carriage") return { ...object, size: stageSpec.boss?.collider };
    if (kind === "weakpoint") return { ...object, size: { width: 96, height: 96 } };
    if (kind !== "beam") return object;
    const currentMechanicIds = stageSpec.phases?.[phase - 1]?.mechanicIds ?? [];
    const beam = stageSpec.mechanics?.find(
        (mechanic) => currentMechanicIds.includes(mechanic.id) && MECHANIC_PRESENTATION_KIND[mechanic.type] === "beam"
    );
    return beam?.bounds ? { ...object, size: beam.bounds } : object;
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
            phaseLabel: hud.phaseLabel ?? `PHASE ${phase} / ${phaseCount}`,
            objective:
                snapshot.objectiveLabel ??
                snapshot.currentObjective ??
                currentPhase.hud?.objective ??
                hud.objective ??
                presentation.objective ??
                "ENGAGE TARGET",
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
            showVulnerabilityCountdown: hud.showVulnerabilityCountdown !== false,
            weakpointExposed,
            vulnerabilityRemainingSeconds
        }),
        world: Object.freeze({
            name: presentation.name ?? snapshot.name ?? hud.title ?? hud.name ?? "GATE LOCKING CARRIAGE",
            objects: Object.freeze(
                (presentation.objects ?? snapshot.presentationObjects ?? stageSpecWorldObjects(stageSpec, snapshot))
                    .map((object) => enrichRuntimeWorldObject(object, stageSpec, phase))
                    .map(freezeWorldObject)
            )
        })
    });
}
