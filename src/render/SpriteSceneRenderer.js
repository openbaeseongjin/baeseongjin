import { CameraWorldRenderer, SceneRendererComposition } from "./SceneRendererComposition.js";
import {
    AttachRangeRenderer,
    AttachmentCandidateRenderer,
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
import { SpriteImageAsset } from "./sprites/SpriteImageAsset.js";
import { DEFAULT_PLAYER_SPRITE_DEFINITION } from "./sprites/PlayerSpriteCatalog.js";
import { PolygonSceneRenderer } from "./PolygonSceneRenderer.js";

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
    constructor({ playerDefinition = DEFAULT_PLAYER_SPRITE_DEFINITION, playerAsset = null } = {}) {
        this.profile = "sprite";
        this.playerDefinition = playerDefinition;
        this.playerAsset =
            playerAsset ??
            new SpriteImageAsset({ source: playerDefinition.source, expectedSize: playerDefinition.atlasSize });
        const spriteComposition = new SceneRendererComposition({
            profile: this.profile,
            renderers: [
                new BackdropRenderer(),
                new CameraWorldRenderer([
                    new WorldGeometryRenderer(),
                    new AttachRangeRenderer(),
                    new RopeRenderer(localRopes),
                    new RopeRenderer(remoteRopes),
                    new SpriteRemotePlayerRenderer({ asset: this.playerAsset, definition: playerDefinition }),
                    new SwingRenderer(),
                    new SpriteEnemyRenderer(),
                    new SpriteProjectileRenderer({
                        selectProjectiles: (scene) => scene.projectiles ?? [],
                        sprite: playerProjectileSprite,
                        palette: { a: "#f59e0b", b: "#fef08a" },
                        size: { width: 10, height: 10 }
                    }),
                    new SpriteProjectileRenderer({
                        selectProjectiles: (scene) => scene.enemyProjectiles ?? [],
                        sprite: enemyProjectileSprite,
                        palette: { a: "#881337", b: "#f43f5e", c: "#fecdd3" },
                        size: { width: 14, height: 14 }
                    }),
                    new CombatEffectRenderer(),
                    new EventEffectRenderer(),
                    new AttachmentCandidateRenderer(),
                    new SpriteLocalPlayerRenderer({ asset: this.playerAsset, definition: playerDefinition })
                ])
            ]
        });
        this.composition = new SceneRendererComposition({
            profile: this.profile,
            renderers: [
                new SpriteAssetFallbackRenderer({
                    asset: this.playerAsset,
                    spriteRenderer: spriteComposition,
                    polygonRenderer: new PolygonSceneRenderer()
                })
            ]
        });
        this.renderers = this.composition.renderers;
    }

    draw(args) {
        this.composition.draw(args);
    }
}
