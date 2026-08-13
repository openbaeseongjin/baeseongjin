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
    PolygonEnemyRenderer,
    PolygonLocalPlayerRenderer,
    PolygonProjectileRenderer,
    PolygonRemotePlayerRenderer
} from "./polygon/PolygonActorRenderers.js";

export class PolygonSceneRenderer {
    constructor() {
        this.profile = "polygon";
        this.composition = new SceneRendererComposition({
            profile: this.profile,
            renderers: [
                new BackdropRenderer(),
                new CameraWorldRenderer([
                    new WorldGeometryRenderer(),
                    new AttachRangeRenderer(),
                    new RopeRenderer(localRopes),
                    new RopeRenderer(remoteRopes),
                    new PolygonRemotePlayerRenderer(),
                    new SwingRenderer(),
                    new PolygonEnemyRenderer(),
                    new PolygonProjectileRenderer({
                        selectProjectiles: (scene) => scene.projectiles ?? [],
                        color: "#fef08a",
                        category: "playerProjectiles"
                    }),
                    new PolygonProjectileRenderer({
                        selectProjectiles: (scene) => scene.enemyProjectiles ?? [],
                        color: "#f43f5e",
                        category: "enemyProjectiles"
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
