function validateSprite(sprite) {
    if (!sprite || !Array.isArray(sprite.rows) || sprite.rows.length === 0) {
        throw new Error("Pixel sprite requires rows");
    }
    const width = sprite.rows[0].length;
    if (width === 0 || sprite.rows.some((row) => typeof row !== "string" || row.length !== width)) {
        throw new Error("Pixel sprite rows must have equal positive width");
    }
    return { width, height: sprite.rows.length };
}

export function paintPixelSprite({ context, sprite, palette, position, size, anchor = { x: 0.5, y: 0.5 } }) {
    const source = validateSprite(sprite);
    if (!context || !palette || !position || !size) throw new Error("Pixel sprite painter requires draw arguments");
    if (!Number.isFinite(size.width) || !Number.isFinite(size.height) || size.width <= 0 || size.height <= 0) {
        throw new Error("Pixel sprite destination size must be positive");
    }
    const pixelWidth = size.width / source.width;
    const pixelHeight = size.height / source.height;
    const left = position.x - size.width * anchor.x;
    const top = position.y - size.height * anchor.y;
    context.save();
    context.imageSmoothingEnabled = false;
    for (let row = 0; row < source.height; row += 1) {
        for (let column = 0; column < source.width; column += 1) {
            const color = palette[sprite.rows[row][column]];
            if (!color) continue;
            context.fillStyle = color;
            context.fillRect(left + column * pixelWidth, top + row * pixelHeight, pixelWidth, pixelHeight);
        }
    }
    context.restore();
}
