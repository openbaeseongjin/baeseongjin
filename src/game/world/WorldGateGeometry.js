function barrierSurface(gate) {
    const { x, y, width, height } = gate.barrier;
    const vertices = Object.freeze([
        Object.freeze({ x, y }),
        Object.freeze({ x: x + width, y }),
        Object.freeze({ x: x + width, y: y + height }),
        Object.freeze({ x, y: y + height })
    ]);
    return Object.freeze({
        id: `${gate.id}:barrier`,
        areaId: gate.areaId,
        kind: "gate-barrier",
        collision: true,
        grappleable: false,
        renderable: false,
        oneWay: false,
        x,
        y,
        width,
        height,
        topY: y,
        vertices
    });
}

export function collisionSurfacesForProgress(world, progress) {
    if (!progress || !world.gates) return world.surfaces;
    const lockedBarriers = world.gates
        .filter((gate) => gate.barrier && !progress.isGateUnlocked(gate.id))
        .map((gate) => barrierSurface(gate));
    return Object.freeze([...world.surfaces, ...lockedBarriers]);
}
