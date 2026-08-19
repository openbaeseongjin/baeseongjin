export function createPlayerCommand(input, aimWorld) {
    return Object.freeze({
        horizontal: input.horizontal,
        vertical: input.vertical,
        interact: Boolean(input.interact),
        interactSequence: Number.isSafeInteger(input.interactSequence) ? input.interactSequence : 0,
        action: Boolean(input.action),
        pointer: Object.freeze({ ...input.pointer }),
        viewport: Object.freeze({ width: input.viewport.width, height: input.viewport.height }),
        aimWorld: Object.freeze({ x: aimWorld.x, y: aimWorld.y })
    });
}
