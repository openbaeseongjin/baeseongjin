import assert from "node:assert/strict";
import {
    createAugmentImpactClaim,
    createAugmentImpactReceipt,
    deserializeAugmentImpactClaim,
    deserializeAugmentImpactReceipt,
    serializeAugmentImpactClaim,
    serializeAugmentImpactReceipt
} from "../src/game/network/AugmentImpactClaim.js";
import {
    createAugmentOfferClaim,
    deserializeAugmentOfferClaim,
    serializeAugmentOfferClaim
} from "../src/game/network/AugmentOfferClaim.js";

function buildClaim(overrides = {}) {
    return {
        eventId: "player-1:augment-impact:event-42",
        predictionId: "player-1:augment-impact:prediction-42",
        sourcePlayerId: "player-1",
        targetId: "enemy-3",
        clientTick: 42,
        effectId: "electrified-rope",
        sourceKind: "rope-contact",
        sourcePosition: { x: 10, y: -15 },
        contactPosition: { x: 22, y: -4 },
        damage: 12,
        knockback: {
            direction: { x: 1, y: 0 },
            distance: 100,
            duration: 0.25
        },
        ...overrides
    };
}

export function run() {
    const offerClaim = createAugmentOfferClaim({ sourceId: "maintenance-node", clientTick: 12 });
    assert.deepEqual(deserializeAugmentOfferClaim(serializeAugmentOfferClaim(offerClaim)), offerClaim);
    const claim = createAugmentImpactClaim(buildClaim());
    assert.deepEqual(deserializeAugmentImpactClaim(serializeAugmentImpactClaim(claim)), claim);
    assert.ok(Object.isFrozen(claim));
    assert.ok(Object.isFrozen(claim.sourcePosition));
    assert.ok(Object.isFrozen(claim.contactPosition));
    assert.ok(Object.isFrozen(claim.knockback));
    assert.throws(() => createAugmentImpactClaim(buildClaim({ damage: -1 })), /damage/);
    assert.throws(
        () => createAugmentImpactClaim(buildClaim({ sourcePosition: { x: Number.POSITIVE_INFINITY, y: 0 } })),
        /sourcePosition/
    );
    assert.throws(
        () =>
            createAugmentImpactClaim(
                buildClaim({ knockback: { direction: { x: Number.NaN, y: 0 }, distance: 10, duration: 0.1 } })
            ),
        /knockback\.direction/
    );
    assert.throws(
        () =>
            createAugmentImpactClaim(
                buildClaim({ knockback: { direction: { x: 1, y: 0 }, distance: -10, duration: 0.1 } })
            ),
        /knockback\.distance/
    );

    const appliedReceipt = createAugmentImpactReceipt({
        eventId: claim.eventId,
        predictionId: claim.predictionId,
        accepted: true,
        resolution: "applied",
        damage: 12,
        knockbackApplied: true
    });
    assert.deepEqual(deserializeAugmentImpactReceipt(serializeAugmentImpactReceipt(appliedReceipt)), appliedReceipt);

    assert.deepEqual(
        createAugmentImpactReceipt({
            eventId: claim.eventId,
            predictionId: claim.predictionId,
            accepted: true,
            resolution: "shield-blocked"
        }),
        {
            protocolVersion: 1,
            eventId: claim.eventId,
            predictionId: claim.predictionId,
            accepted: true,
            resolution: "shield-blocked",
            damage: 0,
            knockbackApplied: false
        }
    );

    assert.deepEqual(
        createAugmentImpactReceipt({
            eventId: claim.eventId,
            predictionId: claim.predictionId,
            accepted: true,
            resolution: "target-already-dead"
        }).resolution,
        "target-already-dead"
    );

    assert.deepEqual(
        createAugmentImpactReceipt({
            eventId: claim.eventId,
            predictionId: claim.predictionId,
            accepted: true,
            resolution: "duplicate"
        }).resolution,
        "duplicate"
    );

    assert.deepEqual(
        createAugmentImpactReceipt({
            eventId: claim.eventId,
            predictionId: claim.predictionId,
            accepted: false,
            reason: "target-missing"
        }),
        {
            protocolVersion: 1,
            eventId: claim.eventId,
            predictionId: claim.predictionId,
            accepted: false,
            reason: "target-missing",
            damage: 0,
            knockbackApplied: false
        }
    );

    assert.deepEqual(
        createAugmentImpactReceipt({
            eventId: claim.eventId,
            predictionId: claim.predictionId,
            accepted: false,
            reason: "invalid"
        }).reason,
        "invalid"
    );

    assert.throws(
        () =>
            createAugmentImpactReceipt({
                eventId: claim.eventId,
                predictionId: claim.predictionId,
                accepted: true,
                resolution: "applied",
                reason: "invalid"
            }),
        /must not include a rejection reason/
    );
    assert.throws(
        () =>
            deserializeAugmentImpactReceipt(
                JSON.stringify({
                    protocolVersion: 99,
                    eventId: claim.eventId,
                    predictionId: claim.predictionId,
                    accepted: false,
                    reason: "invalid"
                })
            ),
        /unsupported augment impact receipt protocol/
    );
}
