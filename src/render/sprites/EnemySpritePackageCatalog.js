import { SpriteImageAssetSet } from "./SpriteImageAsset.js";

const EMPTY_DEFINITIONS = Object.freeze({});

function definitionsObject(definitionsBySectorId) {
    if (!definitionsBySectorId || Array.isArray(definitionsBySectorId) || typeof definitionsBySectorId !== "object") {
        throw new Error("EnemySpritePackageCatalog definitionsBySectorId must be an object");
    }
    return definitionsBySectorId;
}

function createPackage(definition, assets) {
    return Object.freeze({ id: definition.id, definition, assets });
}

export function enemySectorIdBySourceId(world) {
    const areaEntries = (world?.areas ?? []).flatMap((area) =>
        [area.id, area.legacyAreaId]
            .filter((areaId) => typeof areaId === "string" && areaId)
            .map((areaId) => [areaId, area.sectorId ?? null])
    );
    const enemySpawnEntries = (world?.enemySpawns ?? []).flatMap((spawn) =>
        [spawn.objectId, spawn.encounterId, spawn.slotId]
            .filter((sourceId) => typeof sourceId === "string" && sourceId)
            .map((sourceId) => [sourceId, spawn.sectorId ?? null])
    );
    return Object.freeze(Object.fromEntries([...areaEntries, ...enemySpawnEntries]));
}

export class EnemySpritePackageCatalog {
    constructor({
        definitionsBySectorId = EMPTY_DEFINITIONS,
        defaultSectorId,
        assetsBySectorId = EMPTY_DEFINITIONS,
        autoStart = true,
        ImageClass = globalThis.Image,
        assetSetFactory = (definition) =>
            new SpriteImageAssetSet({
                atlases: definition.atlases,
                autoStart,
                ImageClass,
                fallbackLabel: "built-in enemy mock sprites"
            })
    } = {}) {
        const definitions = definitionsObject(definitionsBySectorId);
        if (typeof defaultSectorId !== "string" || !defaultSectorId) {
            throw new Error("EnemySpritePackageCatalog requires defaultSectorId");
        }
        if (!assetsBySectorId || Array.isArray(assetsBySectorId) || typeof assetsBySectorId !== "object") {
            throw new Error("EnemySpritePackageCatalog assetsBySectorId must be an object");
        }
        if (typeof assetSetFactory !== "function") {
            throw new Error("EnemySpritePackageCatalog assetSetFactory must be a function");
        }
        this.defaultSectorId = defaultSectorId;
        this.packagesBySectorId = Object.freeze(
            Object.fromEntries(
                Object.entries(definitions).map(([sectorId, definition]) => {
                    if (typeof sectorId !== "string" || !sectorId || !definition) {
                        throw new Error("Enemy sprite sector packages require a sector id and definition");
                    }
                    const assets = assetsBySectorId[sectorId] ?? assetSetFactory(definition);
                    return [sectorId, createPackage(definition, assets)];
                })
            )
        );
        Object.freeze(this);
    }

    get defaultPackage() {
        return this.packagesBySectorId[this.defaultSectorId] ?? null;
    }

    get defaultDefinition() {
        return this.defaultPackage?.definition ?? null;
    }

    get defaultAssets() {
        return this.defaultPackage?.assets ?? null;
    }

    async prepare() {
        await Promise.all(
            Object.values(this.packagesBySectorId).map((spritePackage) => spritePackage.assets.prepare())
        );
        return this.snapshot();
    }

    async prepareSector(sectorId) {
        const packages = [...new Set([this.packagesBySectorId[sectorId], this.defaultPackage].filter(Boolean))];
        await Promise.all(packages.map((spritePackage) => spritePackage.assets.prepare()));
        return this.statusForSector(sectorId);
    }

    prepareRemaining(excludedSectorIds = []) {
        const excluded = new Set(excludedSectorIds);
        return Promise.all(
            Object.entries(this.packagesBySectorId)
                .filter(([sectorId]) => !excluded.has(sectorId))
                .map(([, spritePackage]) => spritePackage.assets.prepare())
        ).then(() => this.snapshot());
    }

    statusForSector(sectorId) {
        const sectorPackage = this.packagesBySectorId[sectorId] ?? null;
        return Object.freeze({
            sector: sectorPackage?.assets.status ?? null,
            fallback: sectorPackage === this.defaultPackage ? null : (this.defaultPackage?.assets.status ?? null)
        });
    }

    snapshot() {
        return Object.freeze(
            Object.fromEntries(
                Object.entries(this.packagesBySectorId).map(([sectorId, spritePackage]) => [
                    sectorId,
                    spritePackage.assets.status
                ])
            )
        );
    }

    packageFor({ sectorId = null, enemyType }) {
        const sectorPackage = sectorId ? this.packagesBySectorId[sectorId] : null;
        const candidates =
            sectorPackage === this.defaultPackage ? [sectorPackage] : [sectorPackage, this.defaultPackage];
        for (const candidate of candidates) {
            if (!candidate || candidate.assets.status !== "ready") continue;
            if (candidate.definition.supports(enemyType)) return candidate;
        }
        return null;
    }
}
