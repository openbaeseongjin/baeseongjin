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
import { PolygonSceneRenderer } from "./PolygonSceneRenderer.js";
import { DEFAULT_ENVIRONMENT_DEFINITION } from "./environment/EnvironmentCatalog.js";
import { EnvironmentAssetSet } from "./environment/EnvironmentAssetSet.js";
import { EnvironmentRendererComposer } from "./environment/EnvironmentRendererComposer.js";
import { AuthoredAreaStructureRenderer } from "./world/AuthoredAreaStructureRenderer.js";
import { ActorStatusRenderer, ElectrifiedStatusRenderer } from "./ActorStatusPresentation.js";
import { BossStageWorldRenderer } from "./boss/BossStageWorldRenderer.js";
import { DEFAULT_ENEMY_SPRITE_SECTOR_ID } from "./sprites/EnemySpriteCatalog.js";
import { EnemySpritePackageCatalog } from "./sprites/EnemySpritePackageCatalog.js";

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
        authoredAreaEnvironmentDefinitions = Object.freeze({})
    } = {}) {
        this.profile = "sprite";
        this.playerDefinition = playerDefinition;
        this.playerAssets = playerAssets ?? new SpriteImageAssetSet({ atlases: playerDefinition.atlases });
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
                assetsBySectorId: resolvedEnemyAssets
            });
        this.enemyDefinition = this.enemySpritePackages.defaultDefinition;
        this.enemyAssets = this.enemySpritePackages.defaultAssets;
        this.environmentDefinition = environmentDefinition;
        this.authoredAreaEnvironmentDefinitions = authoredAreaEnvironmentDefinitions;
        const authoredAreaEnvironmentAtlases = Object.fromEntries(
            Object.values(authoredAreaEnvironmentDefinitions).flatMap((definition) =>
                Object.entries(definition.atlases)
            )
        );
        this.environmentAssets =
            environmentAssets ??
            new EnvironmentAssetSet({
                atlases: { ...environmentDefinition.atlases, ...authoredAreaEnvironmentAtlases }
            });
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

        const actorRenderers = new CameraWorldRenderer([
            new AuthoredAreaStructureRenderer(),
            new AuthoredWorldObjectRenderer(),
            new BossStageWorldRenderer(),
            new AccessScanSurfaceRenderer(),
            new HardpointJammerSurfaceRenderer(),
            new AccessModuleSignalRenderer(),
            new AttachRangeRenderer(),
            new RopeRenderer(localRopes),
            new RopeRenderer(remoteRopes),
            new RopeShotRenderer(localShots),
            new RopeShotRenderer(remoteShots),
            new SpriteRemotePlayerRenderer({ assets: this.playerAssets, definition: playerDefinition }),
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
            new SpriteLocalPlayerRenderer({ assets: this.playerAssets, definition: playerDefinition }),
            new ElectrifiedStatusRenderer(),
            new ActorStatusRenderer()
        ]);

        const spriteComposition = new SceneRendererComposition({
            profile: this.profile,
            renderers: [this.environmentComposer, actorRenderers]
        });

        this.composition = new SceneRendererComposition({
            profile: this.profile,
            renderers: [
                new SpriteAssetFallbackRenderer({
                    asset: this.playerAssets,
                    spriteRenderer: spriteComposition,
                    polygonRenderer: new PolygonSceneRenderer()
                })
            ]
        });
        this.renderers = this.composition.renderers;
    }

    draw(args) {
        this.composition.draw(args);
        this.environmentDiagnostics = this.environmentComposer.status;
    }
}
