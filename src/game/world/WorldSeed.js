const MAX_WORLD_SEED = 0xffffffff;

export function parseWorldSeed(search = "") {
    const value = new URLSearchParams(search).get("seed");
    if (!value || !/^\d+$/.test(value)) return null;
    const seed = Number(value);
    return Number.isSafeInteger(seed) && seed >= 1 && seed <= MAX_WORLD_SEED ? seed : null;
}

export function randomWorldSeed(random = Math.random) {
    return Math.floor(random() * MAX_WORLD_SEED) + 1;
}

export function selectWorldSeed(search = "", random = Math.random) {
    return parseWorldSeed(search) ?? randomWorldSeed(random);
}
