import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { CanvasRenderer } from "../render/CanvasRenderer.js";
import { PLAYER_CONFIG, ROPE_CONFIG, WORLD_CONFIG } from "./config.js";
import { PlayerPhysics } from "./physics/PlayerPhysics.js";
import { FixedLengthRope } from "./rope/FixedLengthRope.js";
import { evaluateSwingDrag } from "./rope/SwingDrag.js";
import { WorldGenerator, closestPointOnSurface } from "./world/WorldGenerator.js";

export class GameApp {
    constructor({ canvas }) {
        if (!canvas) throw new Error("GameApp requires a canvas element");
        this.renderer = new CanvasRenderer(canvas);
        this.input = new InputSampler();
        this.world = new WorldGenerator(WORLD_CONFIG).generate();
        this.player = new PlayerPhysics(PLAYER_CONFIG);
        this.rope = new FixedLengthRope(ROPE_CONFIG);
        this.camera = { x: 0, y: 0 };
        this.aimWorld = { x: 0, y: 0 };
        this.attachmentCandidate = null;
        this.wasPointerDown = false;
        this.attachBufferRemaining = 0;
        this.eventFlash = { type: "ready", age: 10 };
        this.swingDrag = null;
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.frameId = null;
        this.runner = new FixedStepRunner({
            step: (dt, input) => this.update(dt, input),
            render: () =>
                this.renderer.draw({
                    world: this.world,
                    player: this.player,
                    rope: this.rope,
                    camera: this.camera,
                    aimWorld: this.aimWorld,
                    attachmentCandidate: this.attachmentCandidate,
                    eventFlash: this.eventFlash,
                    swingDrag: this.swingDrag,
                    stats: this.stats,
                    maxAttachDistance: ROPE_CONFIG.maxAttachDistance
                })
        });
        this.tick = (time) => {
            this.stats = { ...this.stats, ...this.runner.frame(time, this.input.snapshot()) };
            this.frameId = requestAnimationFrame(this.tick);
        };
    }

    start() {
        if (this.frameId !== null) return;
        this.input.attach();
        this.frameId = requestAnimationFrame(this.tick);
    }

    stop() {
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.input.detach();
        this.frameId = null;
    }

    update(dt, input) {
        this.aimWorld = this.renderer.screenToWorld(input.pointer, this.camera);
        this.attachmentCandidate = this.findAttachment(this.aimWorld);

        if (input.pointer.down && !this.wasPointerDown) {
            this.attachBufferRemaining = ROPE_CONFIG.attachBufferSeconds;
        }
        if (input.pointer.down && !this.rope.isAttached && this.attachBufferRemaining > 0 && this.attachmentCandidate) {
            if (this.rope.attach(this.player.position, this.attachmentCandidate)) {
                this.eventFlash = { type: "attach", age: 0 };
                this.swingDrag = {
                    origin: { x: input.pointer.x, y: input.pointer.y },
                    direction: null,
                    progress: 0,
                    used: false
                };
                this.attachBufferRemaining = 0;
            }
        }
        if (input.pointer.down && this.rope.isAttached) this.updateSwingDrag(input.pointer);
        if (!input.pointer.down && this.wasPointerDown && this.rope.isAttached) {
            this.rope.detach();
            this.eventFlash = { type: "release", age: 0 };
            this.swingDrag = null;
        }
        this.attachBufferRemaining = Math.max(0, this.attachBufferRemaining - dt);
        this.wasPointerDown = input.pointer.down;

        this.player.step(dt, input, this.world.surfaces, this.rope);
        this.eventFlash.age += dt;
        this.updateCamera(dt);

        if (!this.player.position.isFinite() || this.player.position.y > WORLD_CONFIG.floorY + 780) this.resetRun();
    }

    updateSwingDrag(pointer) {
        if (!this.swingDrag || this.swingDrag.used || !this.rope.anchor) return;
        const evaluation = evaluateSwingDrag({
            anchor: this.rope.anchor,
            playerPosition: this.player.position,
            drag: {
                x: pointer.x - this.swingDrag.origin.x,
                y: pointer.y - this.swingDrag.origin.y
            },
            threshold: ROPE_CONFIG.swingDragThreshold
        });
        if (!evaluation) return;

        this.swingDrag.direction = evaluation.direction;
        this.swingDrag.progress = evaluation.progress;
        if (!evaluation.triggered) return;

        this.player.addImpulse(evaluation.direction, ROPE_CONFIG.swingImpulse);
        this.swingDrag.used = true;
        this.eventFlash = { type: "swing", age: 0 };
    }

    findAttachment(aimPoint) {
        let best = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const surface of this.world.surfaces) {
            const point = closestPointOnSurface(aimPoint, surface);
            const playerDistance = this.player.position.distanceTo(point);
            if (playerDistance > ROPE_CONFIG.maxAttachDistance) continue;
            const aimDistance = Math.hypot(point.x - aimPoint.x, point.y - aimPoint.y);
            const score = aimDistance * 2 + playerDistance * 0.05;
            if (aimDistance <= 90 && score < bestScore) {
                best = point;
                bestScore = score;
            }
        }
        return best;
    }

    updateCamera(dt) {
        const targetX = this.player.position.x - this.renderer.cssWidth * 0.38;
        const targetY = this.player.position.y - this.renderer.cssHeight * 0.58;
        const blend = 1 - Math.exp(-5 * dt);
        this.camera.x += (targetX - this.camera.x) * blend;
        this.camera.y += (targetY - this.camera.y) * blend;
    }

    resetRun() {
        this.player.reset();
        this.rope.detach();
        this.attachBufferRemaining = 0;
        this.camera.x = 0;
        this.camera.y = 0;
        this.eventFlash = { type: "reset", age: 0 };
        this.swingDrag = null;
        this.stats.resets += 1;
    }
}
