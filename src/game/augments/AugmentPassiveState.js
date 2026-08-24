export class AugmentPassiveState {
    constructor() {
        this.reset();
    }
    prepareCommand(player, loadout, command) {
        if (player.physics.isGrounded) this.airJumpsRemaining = loadout.has("double-jump") ? 1 : 0;
        const pressed = command.vertical < 0;
        if (
            loadout.has("double-jump") &&
            !player.physics.isGrounded &&
            !player.ropeObject.rope.isAttached &&
            pressed &&
            !this.jumpPressed &&
            this.airJumpsRemaining > 0
        ) {
            const velocity = player.physics.physicsStepVelocity();
            player.physics.applyImpulse({ x: 0, y: -player.physics.config.jumpSpeed - velocity.y });
            this.airJumpsRemaining -= 1;
        }
        this.jumpPressed = pressed;
    }
    advance(player, loadout, dt) {
        if (loadout.has("rope-regeneration") && player.ropeObject.rope.isAttached && player.lifeState === "active")
            player.health = Math.min(player.maxHealth, player.health + 2 * dt);
    }
    snapshot() {
        return Object.freeze({ airJumpsRemaining: this.airJumpsRemaining, jumpPressed: this.jumpPressed });
    }
    restore(snapshot = null) {
        this.airJumpsRemaining = snapshot?.airJumpsRemaining ?? 0;
        this.jumpPressed = snapshot?.jumpPressed === true;
    }
    reset() {
        this.airJumpsRemaining = 0;
        this.jumpPressed = false;
    }
}
