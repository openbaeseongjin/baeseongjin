import { CameraWorldRenderer, SceneRendererComposition } from "./SceneRendererComposition.js";
import {
    AttachRangeRenderer,
    AccessScanSurfaceRenderer,
    AccessModuleSignalRenderer,
    AttachmentCandidateRenderer,
    AuthoredWorldObjectRenderer,
    BackdropRenderer,
    CombatEffectRenderer,
    EventEffectRenderer,
    RopeRenderer,
    RopeShotRenderer,
    SwingRenderer,
    WindParticleRenderer,
    WorldGeometryRenderer,
    localRopes,
    localShots,
    remoteRopes,
    remoteShots
} from "./layers/SharedSceneRenderers.js";
import {
    PolygonCutterProjectileRenderer,
    PolygonEnemyRenderer,
    PolygonLocalPlayerRenderer,
    PolygonProjectileRenderer,
    PolygonRemotePlayerRenderer
} from "./polygon/PolygonActorRenderers.js";
import { AuthoredAreaStructureRenderer } from "./world/AuthoredAreaStructureRenderer.js";

export class PolygonSceneRenderer {
    constructor() {
        this.profile = "polygon";
        this.composition = new SceneRendererComposition({
            profile: this.profile,
            renderers: [
                new BackdropRenderer(),
                new CameraWorldRenderer([
                    new WorldGeometryRenderer(),
                    new AuthoredAreaStructureRenderer(),
                    new AuthoredWorldObjectRenderer(),
                    new AccessScanSurfaceRenderer(),
                    new AccessModuleSignalRenderer(),
                    new WindParticleRenderer(),
                    new AttachRangeRenderer(),
                    new RopeRenderer(localRopes),
                    new RopeRenderer(remoteRopes),
                    new RopeShotRenderer(localShots),
                    new RopeShotRenderer(remoteShots),
                    new PolygonRemotePlayerRenderer(),
                    new SwingRenderer(),
                    new PolygonEnemyRenderer(),
                    new PolygonProjectileRenderer({
                        selectProjectiles: (scene) => scene.projectiles ?? [],
                        color: "#fef08a",
                        category: "playerProjectiles"
                    }),
                    new PolygonProjectileRenderer({
                        selectProjectiles: (scene) => scene.augmentProjectiles ?? [],
                        color: "#67e8f9",
                        category: "augmentProjectiles"
                    }),
                    new PolygonProjectileRenderer({
                        selectProjectiles: (scene) =>
                            (scene.enemyProjectiles ?? []).filter((projectile) => !projectile.canCutRope),
                        color: "#f43f5e",
                        category: "enemyProjectiles"
                    }),
                    new PolygonCutterProjectileRenderer({
                        selectProjectiles: (scene) =>
                            (scene.enemyProjectiles ?? []).filter((projectile) => projectile.canCutRope),
                        category: "cutterProjectiles"
                    }),
                    new CombatEffectRenderer(),
                    new EventEffectRenderer(),
                    new AttachmentCandidateRenderer(),
                    new PolygonLocalPlayerRenderer()
                ])
            ]
        });
        this.renderers = this.composition.renderers;
    }

    draw(args) {
        this.composition.draw(args);
    }
}
