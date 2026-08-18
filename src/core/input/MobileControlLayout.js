const CONTROL_ORDER = Object.freeze(["left", "jump", "right", "action"]);

export function getMobileControlLayout(width, height) {
    const size = Math.max(64, Math.min(96, height * 0.2));
    const jumpWidth = width * 0.4;
    const controlGap = Math.max(4, Math.min(8, width * 0.008));
    const margin = Math.max(10, Math.min(18, height * 0.025));
    const y = height - size - margin;
    const jumpX = (width - jumpWidth) * 0.5;
    return Object.freeze({
        size,
        left: Object.freeze({ x: jumpX - size - controlGap, y, width: size, height: size }),
        jump: Object.freeze({ x: jumpX, y, width: jumpWidth, height: size }),
        right: Object.freeze({ x: jumpX + jumpWidth + controlGap, y, width: size, height: size }),
        action: Object.freeze({
            x: jumpX + jumpWidth + controlGap,
            y: y - size - controlGap,
            width: size,
            height: size
        })
    });
}

export function findMobileControl(x, y, width, height) {
    const layout = getMobileControlLayout(width, height);
    return (
        CONTROL_ORDER.find((name) => {
            const bounds = layout[name];
            return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
        }) ?? null
    );
}
