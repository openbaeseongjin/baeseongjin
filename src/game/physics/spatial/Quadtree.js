const MINIMUM_ROOT_SIZE = 1;

export function normalizeBounds(bounds, label = "bounds") {
    if (
        !bounds ||
        !Number.isFinite(bounds.x) ||
        !Number.isFinite(bounds.y) ||
        !Number.isFinite(bounds.width) ||
        !Number.isFinite(bounds.height) ||
        bounds.width < 0 ||
        bounds.height < 0
    ) {
        throw new Error(`${label} must contain finite x, y and non-negative width, height`);
    }
    return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
    };
}

export function boundsIntersect(left, right) {
    return !(
        left.x + left.width < right.x ||
        left.x > right.x + right.width ||
        left.y + left.height < right.y ||
        left.y > right.y + right.height
    );
}

export function boundsContain(outer, inner) {
    return (
        inner.x >= outer.x &&
        inner.y >= outer.y &&
        inner.x + inner.width <= outer.x + outer.width &&
        inner.y + inner.height <= outer.y + outer.height
    );
}

export function unionBounds(left, right) {
    const x = Math.min(left.x, right.x);
    const y = Math.min(left.y, right.y);
    const rightEdge = Math.max(left.x + left.width, right.x + right.width);
    const bottomEdge = Math.max(left.y + left.height, right.y + right.height);
    return { x, y, width: rightEdge - x, height: bottomEdge - y };
}

export function expandBounds(bounds, padding) {
    if (!Number.isFinite(padding) || padding < 0) throw new Error("bounds padding must be non-negative");
    return {
        x: bounds.x - padding,
        y: bounds.y - padding,
        width: bounds.width + padding * 2,
        height: bounds.height + padding * 2
    };
}

function rootBoundsFor(entries) {
    if (entries.length === 0) return { x: 0, y: 0, width: MINIMUM_ROOT_SIZE, height: MINIMUM_ROOT_SIZE };
    let bounds = entries[0].bounds;
    for (let index = 1; index < entries.length; index += 1) bounds = unionBounds(bounds, entries[index].bounds);
    const widthPadding = Math.max(MINIMUM_ROOT_SIZE, bounds.width * 0.01);
    const heightPadding = Math.max(MINIMUM_ROOT_SIZE, bounds.height * 0.01);
    return {
        x: bounds.x - widthPadding,
        y: bounds.y - heightPadding,
        width: Math.max(MINIMUM_ROOT_SIZE, bounds.width + widthPadding * 2),
        height: Math.max(MINIMUM_ROOT_SIZE, bounds.height + heightPadding * 2)
    };
}

class QuadtreeNode {
    constructor(bounds, depth, capacity, maxDepth) {
        this.bounds = bounds;
        this.depth = depth;
        this.capacity = capacity;
        this.maxDepth = maxDepth;
        this.entries = [];
        this.children = null;
    }

    childFor(bounds) {
        if (!this.children) return null;
        return this.children.find((child) => boundsContain(child.bounds, bounds)) ?? null;
    }

    subdivide() {
        const halfWidth = this.bounds.width * 0.5;
        const halfHeight = this.bounds.height * 0.5;
        if (halfWidth <= 0 || halfHeight <= 0) return;
        const x = this.bounds.x;
        const y = this.bounds.y;
        this.children = [
            new QuadtreeNode(
                { x, y, width: halfWidth, height: halfHeight },
                this.depth + 1,
                this.capacity,
                this.maxDepth
            ),
            new QuadtreeNode(
                { x: x + halfWidth, y, width: halfWidth, height: halfHeight },
                this.depth + 1,
                this.capacity,
                this.maxDepth
            ),
            new QuadtreeNode(
                { x, y: y + halfHeight, width: halfWidth, height: halfHeight },
                this.depth + 1,
                this.capacity,
                this.maxDepth
            ),
            new QuadtreeNode(
                { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight },
                this.depth + 1,
                this.capacity,
                this.maxDepth
            )
        ];
        const retained = [];
        for (const entry of this.entries) {
            const child = this.childFor(entry.bounds);
            if (child) child.insert(entry);
            else retained.push(entry);
        }
        this.entries = retained;
        for (const entry of retained) entry.node = this;
    }

    insert(entry) {
        const child = this.childFor(entry.bounds);
        if (child) return child.insert(entry);
        this.entries.push(entry);
        entry.node = this;
        if (!this.children && this.entries.length > this.capacity && this.depth < this.maxDepth) this.subdivide();
        return true;
    }

    query(bounds, results) {
        if (!boundsIntersect(this.bounds, bounds)) return;
        for (const entry of this.entries) {
            if (boundsIntersect(entry.bounds, bounds)) results.push(entry);
        }
        if (this.children) {
            for (const child of this.children) child.query(bounds, results);
        }
    }
}

export class Quadtree {
    constructor({ capacity = 8, maxDepth = 8 } = {}) {
        if (!Number.isSafeInteger(capacity) || capacity <= 0) throw new Error("Quadtree capacity must be positive");
        if (!Number.isSafeInteger(maxDepth) || maxDepth < 0) throw new Error("Quadtree maxDepth must be non-negative");
        this.capacity = capacity;
        this.maxDepth = maxDepth;
        this.entriesById = new Map();
        this.overflowEntries = new Map();
        this.root = new QuadtreeNode(rootBoundsFor([]), 0, capacity, maxDepth);
    }

    rebuild(entries = []) {
        const normalized = entries.map(({ id, bounds, value }) => {
            if (typeof id !== "string" || id.length === 0) throw new Error("Quadtree entry id must be non-empty");
            return { id, bounds: normalizeBounds(bounds, `Quadtree entry ${id}`), value, node: null };
        });
        this.entriesById.clear();
        this.overflowEntries.clear();
        this.root = new QuadtreeNode(rootBoundsFor(normalized), 0, this.capacity, this.maxDepth);
        for (const entry of normalized) this.insertEntry(entry);
        return this;
    }

    insertEntry(entry) {
        if (this.entriesById.has(entry.id)) throw new Error(`duplicate Quadtree entry id: ${entry.id}`);
        this.entriesById.set(entry.id, entry);
        if (boundsContain(this.root.bounds, entry.bounds)) this.root.insert(entry);
        else this.overflowEntries.set(entry.id, entry);
    }

    insert(id, bounds, value) {
        this.insertEntry({ id, bounds: normalizeBounds(bounds, `Quadtree entry ${id}`), value, node: null });
        return this;
    }

    remove(id) {
        const entry = this.entriesById.get(id);
        if (!entry) return false;
        this.entriesById.delete(id);
        if (this.overflowEntries.delete(id)) return true;
        const entries = entry.node?.entries;
        if (!entries) return false;
        const index = entries.indexOf(entry);
        if (index >= 0) entries.splice(index, 1);
        entry.node = null;
        return index >= 0;
    }

    update(id, bounds, value) {
        this.remove(id);
        this.insert(id, bounds, value);
        return this;
    }

    query(bounds) {
        const normalized = normalizeBounds(bounds, "Quadtree query");
        const entries = [];
        this.root.query(normalized, entries);
        for (const entry of this.overflowEntries.values()) {
            if (boundsIntersect(entry.bounds, normalized)) entries.push(entry);
        }
        return entries.map(({ value }) => value);
    }

    get size() {
        return this.entriesById.size;
    }
}
