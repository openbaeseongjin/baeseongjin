const CONTROL_ORDER = Object.freeze(["left", "jump", "right"]);

export function getMobileControlLayout(width, height) {
    const size = Math.max(64, Math.min(96, height * 0.2));
    const jumpSize = Math.min(size * 1.3, height * 0.28);
    const margin = Math.max(10, Math.min(18, height * 0.025));
    const y = height - size - margin;
    const jumpY = height - jumpSize - margin;
    return Object.freeze({
        size,
        left: Object.freeze({ x: margin, y, width: size, height: size }),
        jump: Object.freeze({ x: (width - jumpSize) * 0.5, y: jumpY, width: jumpSize, height: jumpSize }),
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
