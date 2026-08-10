export function createPlayerCommand(input, aimWorld) {
    return Object.freeze({
        horizontal: input.horizontal,
        vertical: input.vertical,
        interact: Boolean(input.interact),
        pointer: Object.freeze({ ...input.pointer }),
        viewport: Object.freeze({ width: input.viewport.width, height: input.viewport.height }),
        aimWorld: Object.freeze({ x: aimWorld.x, y: aimWorld.y })
    });
}
