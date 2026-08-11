export function paintSpriteFrame({ context, image, frame, position, size, anchor = { x: 0, y: 0 }, flipX = false }) {
    if (!context || !image || !frame || !position || !size)
        throw new Error("Sprite painter requires context, image, frame, position, and size");
    for (const [name, value] of Object.entries({
        "frame.x": frame.x,
        "frame.y": frame.y,
        "frame.width": frame.width,
        "frame.height": frame.height,
        "position.x": position.x,
        "position.y": position.y,
        "size.width": size.width,
        "size.height": size.height,
        "anchor.x": anchor?.x,
        "anchor.y": anchor?.y
    })) {
        if (!Number.isFinite(value)) throw new Error(`Sprite painter requires finite ${name}`);
    }
    if (frame.width <= 0 || frame.height <= 0 || size.width <= 0 || size.height <= 0)
        throw new Error("Sprite painter requires positive frame and destination sizes");
    if (typeof flipX !== "boolean") throw new Error("Sprite painter flipX must be a boolean");
    const x = position.x - size.width * anchor.x,
        y = position.y - size.height * anchor.y;
    context.save();
    context.imageSmoothingEnabled = false;
    if (flipX) {
        context.translate(position.x, 0);
        context.scale(-1, 1);
        context.drawImage(
            image,
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            position.x - x - size.width,
            y,
            size.width,
            size.height
        );
    } else context.drawImage(image, frame.x, frame.y, frame.width, frame.height, x, y, size.width, size.height);
    context.restore();
}
