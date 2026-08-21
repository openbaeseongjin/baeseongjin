# 핵심 구현 의사코드

## Player step

```js
const bossSnapshot = this.bossRuntime?.snapshot();

if (bossSnapshot?.status === "active") {
    const target = currentBossPhaseTarget(BOSS_01_DEFINITION, bossSnapshot);

    const overlap = target
        ? player.physics.collider.overlapsCircle(
              player.physics.position,
              target.assembly,
              target.assembly.radius
          )
        : false;

    const entered = this.bossTargetContacts.entered(player.id, overlap);

    if (entered) {
        const speed = Math.hypot(player.physics.velocity.x, player.physics.velocity.y);
        const baseDamage = ropeImpactDamageForSpeed(speed, ROPE_IMPACT_CONFIG);

        const outcome = resolveBossPhaseTargetImpact({
            definition: BOSS_01_DEFINITION,
            bossSnapshot,
            target,
            playerPosition: player.physics.position,
            ropeAttached: player.ropeObject.rope.isAttached,
            impactSpeed: speed,
            baseDamage,
            minimumSpeed: ROPE_IMPACT_CONFIG.minimumSpeed
        });

        if (outcome.accepted) {
            this.applyBossDamage(player.id, outcome.damage);

            // Presentation:
            // outcome.hitZone === "weak-point"
        }
    }
}
```

실제 코드에서는:
- `baseDamage` 계산 전에 minimum speed 검사
- repository Vector/collider helper 사용
- prediction/authority 경계를 현재 combat architecture와 맞춤
- snapshot event replication과 중복되지 않게 구성

## Breaker

```js
if (
    command.interact &&
    distance(player.position, breaker.position) <= 72 &&
    breaker.id === bossSnapshot.currentBreakerId
) {
    this.interactBossBreaker(player.id, breaker.id);
}
```

## Victory

```js
for (const event of bossRuntime.drainEvents()) {
    if (event.eventType === "boss-encounter-completed") {
        progress.completeObjective("boss-01:victory");
    }
}
```
