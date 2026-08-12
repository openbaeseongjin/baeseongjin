export function paintSpriteFrame({
    context,
    image,
    frame,
    position,
    size,
    anchor = { x: 0, y: 0 },
    offset = { x: 0, y: 0 },
    opacity = 1,
    pixelSnap = false,
    flipX = false,
    rotation = 0
}) {
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
        "anchor.y": anchor?.y,
        "offset.x": offset?.x,
        "offset.y": offset?.y,
        opacity,
        rotation
    })) {
        if (!Number.isFinite(value)) throw new Error(`Sprite painter requires finite ${name}`);
    }
    if (frame.width <= 0 || frame.height <= 0 || size.width <= 0 || size.height <= 0)
        throw new Error("Sprite painter requires positive frame and destination sizes");
    if (opacity <= 0 || opacity > 1)
        throw new Error("Sprite painter opacity must be greater than zero and at most one");
    if (typeof pixelSnap !== "boolean") throw new Error("Sprite painter pixelSnap must be a boolean");
    if (typeof flipX !== "boolean") throw new Error("Sprite painter flipX must be a boolean");
    const pivot = {
            x: pixelSnap ? Math.round(position.x + offset.x) : position.x + offset.x,
            y: pixelSnap ? Math.round(position.y + offset.y) : position.y + offset.y
        },
        x = pixelSnap ? Math.round(pivot.x - size.width * anchor.x) : pivot.x - size.width * anchor.x,
        y = pixelSnap ? Math.round(pivot.y - size.height * anchor.y) : pivot.y - size.height * anchor.y;
    context.save();
    context.imageSmoothingEnabled = false;
    context.globalAlpha *= opacity;
    if (rotation !== 0) {
        const centerX = pixelSnap ? Math.round(position.x) : position.x;
        const centerY = pixelSnap ? Math.round(position.y) : position.y;
        const offsetX = pixelSnap ? pivot.x - centerX : offset.x;
        const offsetY = pixelSnap ? pivot.y - centerY : offset.y;
        const localX = pixelSnap
            ? Math.round(-size.width * (flipX ? 1 - anchor.x : anchor.x))
            : -size.width * (flipX ? 1 - anchor.x : anchor.x);
        const localY = pixelSnap ? Math.round(-size.height * anchor.y) : -size.height * anchor.y;
        context.translate(centerX, centerY);
        context.rotate(rotation);
        context.translate(offsetX, offsetY);
        if (flipX) context.scale(-1, 1);
        context.drawImage(image, frame.x, frame.y, frame.width, frame.height, localX, localY, size.width, size.height);
    } else if (flipX) {
        context.translate(pivot.x, 0);
        context.scale(-1, 1);
        context.drawImage(
            image,
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            pivot.x - x - size.width,
            y,
            size.width,
            size.height
        );
    } else context.drawImage(image, frame.x, frame.y, frame.width, frame.height, x, y, size.width, size.height);
    context.restore();
}
