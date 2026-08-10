export function createPlayerCommand(input, aimWorld) {
    return Object.freeze({
        horizontal: input.horizontal,
        vertical: input.vertical,
        pointer: Object.freeze({ ...input.pointer }),
        aimWorld: Object.freeze({ x: aimWorld.x, y: aimWorld.y })
    });
}
