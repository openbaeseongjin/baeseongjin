import { CameraWorldRenderer, SceneRendererComposition } from "./SceneRendererComposition.js";
import {
    AttachRangeRenderer,
    AttachmentCandidateRenderer,
    AuthoredWorldObjectRenderer,
    BackdropRenderer,
    CombatEffectRenderer,
    EventEffectRenderer,
    RopeRenderer,
    SwingRenderer,
    WorldGeometryRenderer,
    localRopes,
    remoteRopes
} from "./layers/SharedSceneRenderers.js";
import {
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
        environmentDefinition = DEFAULT_ENVIRONMENT_DEFINITION,
        environmentAssets = null
    } = {}) {
        this.profile = "sprite";
        this.playerDefinition = playerDefinition;
        this.playerAssets = playerAssets ?? new SpriteImageAssetSet({ atlases: playerDefinition.atlases });
        this.environmentDefinition = environmentDefinition;
        this.environmentAssets =
            environmentAssets ?? new EnvironmentAssetSet({ atlases: environmentDefinition.atlases });
        this.environmentDiagnostics = null;

        const polygonBackdrop = new BackdropRenderer();
        const polygonTerrain = new WorldGeometryRenderer();

        this.environmentComposer = new EnvironmentRendererComposer({
            definition: this.environmentDefinition,
            assets: this.environmentAssets,
            polygonBackdrop,
            polygonTerrain
        });

        const actorRenderers = new CameraWorldRenderer([
            new AuthoredAreaStructureRenderer(),
            new AuthoredWorldObjectRenderer(),
            new AttachRangeRenderer(),
            new RopeRenderer(localRopes),
            new RopeRenderer(remoteRopes),
            new SpriteRemotePlayerRenderer({ assets: this.playerAssets, definition: playerDefinition }),
            new SwingRenderer(),
            new SpriteEnemyRenderer(),
            new SpriteProjectileRenderer({
                selectProjectiles: (scene) => scene.projectiles ?? [],
                sprite: playerProjectileSprite,
                palette: { a: "#f59e0b", b: "#fef08a" },
                size: { width: 10, height: 10 },
                category: "playerProjectiles"
            }),
            new SpriteProjectileRenderer({
                selectProjectiles: (scene) => scene.enemyProjectiles ?? [],
                sprite: enemyProjectileSprite,
                palette: { a: "#881337", b: "#f43f5e", c: "#fecdd3" },
                size: { width: 14, height: 14 },
                category: "enemyProjectiles"
            }),
            new CombatEffectRenderer(),
            new EventEffectRenderer(),
            new AttachmentCandidateRenderer(),
            new SpriteLocalPlayerRenderer({ assets: this.playerAssets, definition: playerDefinition })
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
