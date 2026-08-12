export const MULTIPLAYER_TIMING = Object.freeze({
    inputLeadTicks: 30,
    maxFutureTicks: 36,
    inputHoldTicks: 30,
    remoteInterpolationSeconds: 0.1,
    deadReckoningMaxSeconds: 0.12,
    remoteClockCorrectionRatio: 0.125,
    remoteClockMaxCorrectionSeconds: 0.05,
    ownerCorrectionSeconds: 0.1,
    ownerHardSnapDistance: 160,
    ownerMotionBaseTolerance: 160,
    ownerMotionMaxSpeed: 1800,
    maxHitClaimPastTicks: 36,
    impactRecoveryRetentionTicks: 1200,
    hitClaimPositionTolerance: 40
});
