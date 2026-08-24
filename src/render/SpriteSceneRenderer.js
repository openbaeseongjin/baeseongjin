import { CameraWorldRenderer, SceneRendererComposition } from "./SceneRendererComposition.js";
import {
    AttachRangeRenderer,
    AccessScanSurfaceRenderer,
    AccessModuleSignalRenderer,
    HardpointJammerSurfaceRenderer,
    AttachmentCandidateRenderer,
    AuthoredWorldObjectRenderer,
    BackdropRenderer,
    CombatEffectRenderer,
    EventEffectRenderer,
    RopeRenderer,
    RopeShotRenderer,
    SwingRenderer,
    WorldGeometryRenderer,
    localRopes,
    localShots,
    remoteRopes,
    remoteShots
} from "./layers/SharedSceneRenderers.js";
import {
    SpriteCutterProjectileRenderer,
    SpriteEnemyRenderer,
    SpriteLocalPlayerRenderer,
    SpriteProjectileRenderer,
    SpriteRemotePlayerRenderer,
    enemyProjectileSprite,
    playerProjectileSprite
} from "./sprites/SpriteActorRenderers.js";
import { SpriteImageAssetSet } from "./sprites/SpriteImageAsset.js";
import { DEFAULT_PLAYER_SPRITE_DEFINITION } from "./sprites/PlayerSpriteCatalog.js";
import { PolygonLocalPlayerRenderer, PolygonRemotePlayerRenderer } from "./polygon/PolygonActorRenderers.js";
import { DEFAULT_ENVIRONMENT_DEFINITION } from "./environment/EnvironmentCatalog.js";
import { EnvironmentAssetSet } from "./environment/EnvironmentAssetSet.js";
import { EnvironmentRendererComposer } from "./environment/EnvironmentRendererComposer.js";
import { AuthoredAreaStructureRenderer } from "./world/AuthoredAreaStructureRenderer.js";
import { ActorStatusRenderer } from "./ActorStatusPresentation.js";
import { BossStageWorldRenderer } from "./boss/BossStageWorldRenderer.js";
import { DEFAULT_ENEMY_SPRITE_SECTOR_ID } from "./sprites/EnemySpriteCatalog.js";
import { EnemySpritePackageCatalog } from "./sprites/EnemySpritePackageCatalog.js";
import { DEFAULT_CONTINUITY_WARDEN_SPRITE_DEFINITION } from "./boss/ContinuityWardenSpriteCatalog.js";
import { ContinuityWardenSpriteObjectRendererCatalog } from "./boss/ContinuityWardenSpriteObjectRenderer.js";

function authoredEnvironmentAtlases(authoredAreaEnvironmentDefinitions) {
    return Object.fromEntries(
        Object.values(authoredAreaEnvironmentDefinitions).flatMap((definition) => Object.entries(definition.atlases))
    );
}

export class SpriteSceneResourceBundle {
    constructor({
        playerDefinition = DEFAULT_PLAYER_SPRITE_DEFINITION,
        playerAssets = null,
        enemyDefinition = null,
        enemyAssets = null,
        enemyDefinitionsBySectorId = null,
        enemyAssetsBySectorId = null,
        enemySpritePackages = null,
        environmentDefinition = DEFAULT_ENVIRONMENT_DEFINITION,
        environmentAssets = null,
        authoredAreaEnvironmentDefinitions = Object.freeze({}),
        continuityWardenDefinition = DEFAULT_CONTINUITY_WARDEN_SPRITE_DEFINITION,
        continuityWardenAssets = null,
        ImageClass = globalThis.Image
    } = {}) {
        this.playerDefinition = playerDefinition;
        this.playerAssets =
            playerAssets ??
            new SpriteImageAssetSet({ atlases: playerDefinition.atlases, autoStart: false, ImageClass });
        const resolvedEnemyDefinitions =
            enemyDefinitionsBySectorId ??
            (enemyDefinition
                ? Object.freeze({ [DEFAULT_ENEMY_SPRITE_SECTOR_ID]: enemyDefinition })
                : Object.freeze({}));
        const resolvedEnemyAssets =
            enemyAssetsBySectorId ??
            (enemyAssets ? Object.freeze({ [DEFAULT_ENEMY_SPRITE_SECTOR_ID]: enemyAssets }) : Object.freeze({}));
        this.enemySpritePackages =
            enemySpritePackages ??
            new EnemySpritePackageCatalog({
                definitionsBySectorId: resolvedEnemyDefinitions,
                defaultSectorId: DEFAULT_ENEMY_SPRITE_SECTOR_ID,
                assetsBySectorId: resolvedEnemyAssets,
                autoStart: false,
                ImageClass
            });
        this.environmentDefinition = environmentDefinition;
        this.authoredAreaEnvironmentDefinitions = authoredAreaEnvironmentDefinitions;
        this.environmentAssets =
            environmentAssets ??
            new EnvironmentAssetSet({
                atlases: {
                    ...environmentDefinition.atlases,
                    ...authoredEnvironmentAtlases(authoredAreaEnvironmentDefinitions)
                },
                autoStart: false,
                ImageClass
            });
        this.continuityWardenDefinition = continuityWardenDefinition;
        this.continuityWardenAssets =
            continuityWardenAssets ??
            new SpriteImageAssetSet({
                atlases: continuityWardenDefinition.atlases,
                autoStart: false,
                ImageClass,
                fallbackLabel: "Continuity Warden polygon fallback"
            });
    }

    environmentDefinitionForArea(areaId) {
        return this.authoredAreaEnvironmentDefinitions[areaId] ?? this.environmentDefinition;
    }

    environmentAtlasIdsForArea(areaId) {
        return Object.keys(this.environmentDefinitionForArea(areaId).atlases);
    }

    preparePlayer() {
        return this.playerAssets.prepare();
    }

    async prepareArea({ areaId = null, sectorId = DEFAULT_ENEMY_SPRITE_SECTOR_ID } = {}) {
        const environmentAtlasIds = this.environmentAtlasIdsForArea(areaId);
        await Promise.all([
            this.preparePlayer(),
            this.enemySpritePackages.prepareSector(sectorId),
            this.environmentAssets.prepare(environmentAtlasIds)
        ]);
        return this.snapshotForArea({ areaId, sectorId });
    }

    async prepareBossStage({ areaId = null, sectorId = DEFAULT_ENEMY_SPRITE_SECTOR_ID } = {}) {
        const environmentAtlasIds = this.environmentAtlasIdsForArea(areaId);
        await Promise.all([
            this.preparePlayer(),
            this.enemySpritePackages.prepareSector(sectorId),
            this.environmentAssets.prepare(environmentAtlasIds),
            this.continuityWardenAssets.prepare()
        ]);
        return this.snapshotForArea({ areaId, sectorId });
    }

    prepareRemaining({ areaId = null, sectorId = DEFAULT_ENEMY_SPRITE_SECTOR_ID } = {}) {
        const currentEnvironmentAtlasIds = new Set(this.environmentAtlasIdsForArea(areaId));
        const remainingEnvironmentAtlasIds = Object.keys(this.environmentAssets.assets).filter(
            (atlasId) => !currentEnvironmentAtlasIds.has(atlasId)
        );
        return Promise.all([
            this.enemySpritePackages.prepareRemaining([sectorId]),
            this.environmentAssets.prepare(remainingEnvironmentAtlasIds),
            this.continuityWardenAssets.prepare()
        ]).then(() => this.snapshot());
    }

    async prepare() {
        await Promise.all([
            this.playerAssets.prepare(),
            this.enemySpritePackages.prepare(),
            this.environmentAssets.prepare(),
            this.continuityWardenAssets.prepare()
        ]);
        return this.snapshot();
    }

    snapshot() {
        return Object.freeze({
            player: this.playerAssets.status,
            enemies: Object.freeze(
                Object.fromEntries(
                    Object.entries(this.enemySpritePackages.packagesBySectorId).map(([sectorId, spritePackage]) => [
                        sectorId,
                        spritePackage.assets.status
                    ])
                )
            ),
            environment: this.environmentAssets.status,
            continuityWarden: this.continuityWardenAssets.status
        });
    }

    snapshotForArea({ areaId = null, sectorId = DEFAULT_ENEMY_SPRITE_SECTOR_ID } = {}) {
        return Object.freeze({
            player: this.playerAssets.status,
            enemies: this.enemySpritePackages.statusForSector(sectorId),
            environment: this.environmentAssets.statusFor(this.environmentAtlasIdsForArea(areaId)),
            continuityWarden: this.continuityWardenAssets.status
        });
    }
}

export class SpriteAssetFallbackRenderer {
    constructor({ asset, spriteRenderer, polygonRenderer }) {
        this.asset = asset;
        this.spriteRenderer = spriteRenderer;
        this.polygonRenderer = polygonRenderer;
    }

    draw(args) {
        const renderer = this.asset.status === "ready" ? this.spriteRenderer : this.polygonRenderer;
        renderer.draw(args);
    }
}

export class SpriteSceneRenderer {
    constructor({
        playerDefinition = DEFAULT_PLAYER_SPRITE_DEFINITION,
        playerAssets = null,
        enemyDefinition = null,
        enemyAssets = null,
        enemyDefinitionsBySectorId = null,
        enemyAssetsBySectorId = null,
        enemySpritePackages = null,
        environmentDefinition = DEFAULT_ENVIRONMENT_DEFINITION,
        environmentAssets = null,
        authoredAreaEnvironmentDefinitions = Object.freeze({}),
        continuityWardenDefinition = DEFAULT_CONTINUITY_WARDEN_SPRITE_DEFINITION,
        continuityWardenAssets = null,
        resources = null
    } = {}) {
        this.profile = "sprite";
        if (resources !== null && !(resources instanceof SpriteSceneResourceBundle)) {
            throw new Error("SpriteSceneRenderer resources must be a SpriteSceneResourceBundle");
        }
        this.resources =
            resources ??
            new SpriteSceneResourceBundle({
                playerDefinition,
                playerAssets,
                enemyDefinition,
                enemyAssets,
                enemyDefinitionsBySectorId,
                enemyAssetsBySectorId,
                enemySpritePackages,
                environmentDefinition,
                environmentAssets,
                authoredAreaEnvironmentDefinitions,
                continuityWardenDefinition,
                continuityWardenAssets
            });
        this.playerDefinition = this.resources.playerDefinition;
        this.playerAssets = this.resources.playerAssets;
        this.enemySpritePackages = this.resources.enemySpritePackages;
        this.enemyDefinition = this.enemySpritePackages.defaultDefinition;
        this.enemyAssets = this.enemySpritePackages.defaultAssets;
        this.environmentDefinition = this.resources.environmentDefinition;
        this.authoredAreaEnvironmentDefinitions = this.resources.authoredAreaEnvironmentDefinitions;
        this.environmentAssets = this.resources.environmentAssets;
        this.continuityWardenDefinition = this.resources.continuityWardenDefinition;
        this.continuityWardenAssets = this.resources.continuityWardenAssets;
        this.environmentDiagnostics = null;

        const polygonBackdrop = new BackdropRenderer();
        const polygonTerrain = new WorldGeometryRenderer();

        this.environmentComposer = new EnvironmentRendererComposer({
            definition: this.environmentDefinition,
            assets: this.environmentAssets,
            authoredAreaEnvironmentDefinitions: this.authoredAreaEnvironmentDefinitions,
            polygonBackdrop,
            polygonTerrain
        });

        const bossObjectRenderers = new ContinuityWardenSpriteObjectRendererCatalog({
            assets: this.continuityWardenAssets,
            definition: this.continuityWardenDefinition
        });

        const actorRenderers = new CameraWorldRenderer([
            new AuthoredAreaStructureRenderer(),
            new AuthoredWorldObjectRenderer(),
            new BossStageWorldRenderer({ objectRenderer: bossObjectRenderers.rendererFor.bind(bossObjectRenderers) }),
            new AccessScanSurfaceRenderer(),
            new HardpointJammerSurfaceRenderer(),
            new AccessModuleSignalRenderer(),
            new AttachRangeRenderer(),
            new RopeRenderer(localRopes),
            new RopeRenderer(remoteRopes),
            new RopeShotRenderer(localShots),
            new RopeShotRenderer(remoteShots),
            new SpriteAssetFallbackRenderer({
                asset: this.playerAssets,
                spriteRenderer: new SpriteRemotePlayerRenderer({
                    assets: this.playerAssets,
                    definition: this.playerDefinition
                }),
                polygonRenderer: new PolygonRemotePlayerRenderer()
            }),
            new SwingRenderer(),
            new SpriteEnemyRenderer({ packageCatalog: this.enemySpritePackages }),
            new SpriteProjectileRenderer({
                selectProjectiles: (scene) => scene.projectiles ?? [],
                sprite: playerProjectileSprite,
                palette: { a: "#f59e0b", b: "#fef08a" },
                size: { width: 10, height: 10 },
                category: "playerProjectiles"
            }),
            new SpriteProjectileRenderer({
                selectProjectiles: (scene) => scene.augmentProjectiles ?? [],
                sprite: playerProjectileSprite,
                palette: { a: "#0891b2", b: "#ecfeff" },
                size: { width: 12, height: 8 },
                category: "augmentProjectiles"
            }),
            new SpriteProjectileRenderer({
                selectProjectiles: (scene) =>
                    (scene.enemyProjectiles ?? []).filter((projectile) => !projectile.canCutRope),
                sprite: enemyProjectileSprite,
                palette: { a: "#881337", b: "#fb7185", c: "#fecdd3" },
                size: { width: 14, height: 14 },
                category: "enemyProjectiles"
            }),
            new SpriteCutterProjectileRenderer({
                selectProjectiles: (scene) =>
                    (scene.enemyProjectiles ?? []).filter((projectile) => projectile.canCutRope),
                category: "cutterProjectiles"
            }),
            new CombatEffectRenderer(),
            new EventEffectRenderer(),
            new AttachmentCandidateRenderer(),
            new SpriteAssetFallbackRenderer({
                asset: this.playerAssets,
                spriteRenderer: new SpriteLocalPlayerRenderer({
                    assets: this.playerAssets,
                    definition: this.playerDefinition
                }),
                polygonRenderer: new PolygonLocalPlayerRenderer()
            }),
            new ActorStatusRenderer()
        ]);

        this.composition = new SceneRendererComposition({
            profile: this.profile,
            renderers: [this.environmentComposer, actorRenderers]
        });
        this.renderers = this.composition.renderers;
    }

    prepare() {
        return this.resources.prepare();
    }

    draw(args) {
        this.composition.draw(args);
        this.environmentDiagnostics = this.environmentComposer.status;
    }
}
