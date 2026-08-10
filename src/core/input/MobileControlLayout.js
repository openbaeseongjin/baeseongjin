const CONTROL_ORDER = Object.freeze(["left", "jump", "right"]);

export function getMobileControlLayout(width, height) {
    const size = Math.max(64, Math.min(96, height * 0.2));
    const jumpWidth = size * 1.7;
    const margin = Math.max(10, Math.min(18, height * 0.025));
    const y = height - size - margin;
    return Object.freeze({
        size,
        left: Object.freeze({ x: margin, y, width: size, height: size }),
        jump: Object.freeze({ x: (width - jumpWidth) * 0.5, y, width: jumpWidth, height: size }),
        right: Object.freeze({ x: width - size - margin, y, width: size, height: size })
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
