import { foundationAugmentById } from "../augments/FoundationAugmentCatalog.js";

const CALIBRATION_AREA_ID = "sector-01-04";
const CALIBRATION_NODE_ID = "sector-01-04:maintenance-node";
const CALIBRATION_FRAME_ID = "sector-01-04:universal-calibration-frame";
const MESSAGE_DURATION_SECONDS = 1.6;

const LOADED_MESSAGE = "CALIBRATION PROFILE / LOADED";
const VERIFIED_MESSAGE = "CALIBRATION / VERIFIED";

function playerIdForEvent(event) {
    return event?.playerId ?? event?.ownerId ?? null;
}

function selectionToken(viewerId, augmentId) {
    return `${viewerId}:${CALIBRATION_NODE_ID}:${augmentId}`;
}

function selectedCalibration(player, currentAreaId) {
    if (currentAreaId !== CALIBRATION_AREA_ID || !player) return null;
    const consumedSourceIds = player.augmentRuntimeState?.consumedSourceIds;
    if (!Array.isArray(consumedSourceIds) || !consumedSourceIds.includes(CALIBRATION_NODE_ID)) return null;
    const selectedAugmentIds = Array.isArray(player.selectedAugmentIds) ? player.selectedAugmentIds : [];
    const augmentId = selectedAugmentIds.at(-1);
    const definition = foundationAugmentById(augmentId);
    if (!definition) return null;
    const verifiedSourceIds = Array.isArray(player.calibrationVerifiedSourceIds)
        ? player.calibrationVerifiedSourceIds
        : [];
    return Object.freeze({
        augmentId: definition.id,
        name: definition.name,
        family: definition.family,
        verified: verifiedSourceIds.includes(CALIBRATION_FRAME_ID)
    });
}

export class CalibrationPresentation {
    constructor({ viewerId } = {}) {
        if (typeof viewerId !== "string" || viewerId.length === 0) {
            throw new Error("CalibrationPresentation viewerId must be non-empty");
        }
        this.viewerId = viewerId;
        this.currentToast = null;
        this.toastQueue = [];
        this.toastAge = 0;
        this.seenSelectionTokens = new Set();
        this.observedVerificationBySelection = new Map();
        this.hud = null;
    }

    update(dt, { currentAreaId = null, player = null, events = [] } = {}) {
        if (!Number.isFinite(dt) || dt < 0) {
            throw new Error("CalibrationPresentation dt must be non-negative");
        }
        const calibration = selectedCalibration(player, currentAreaId);
        if (!calibration) {
            this.hud = null;
            this.currentToast = null;
            this.toastQueue = [];
            this.toastAge = 0;
            return null;
        }

        const token = selectionToken(this.viewerId, calibration.augmentId);
        this.#enqueueLoadedToast(events, calibration, token);
        this.#observeVerification(calibration, token);
        this.hud = calibration;
        this.#advanceToast(dt);
        return this.snapshot();
    }

    #enqueueLoadedToast(events, calibration, token) {
        if (this.seenSelectionTokens.has(token)) return;
        const selected = (Array.isArray(events) ? events : []).some(
            (event) =>
                (event?.eventType === "foundation-selected" || event?.eventType === "predicted-foundation-selected") &&
                playerIdForEvent(event) === this.viewerId &&
                event.sourceId === CALIBRATION_NODE_ID &&
                event.foundationId === calibration.augmentId
        );
        if (!selected) return;
        this.seenSelectionTokens.add(token);
        this.observedVerificationBySelection.set(token, false);
        this.#enqueue(LOADED_MESSAGE);
    }

    #observeVerification(calibration, token) {
        const previous = this.observedVerificationBySelection.get(token);
        if (previous === undefined) {
            this.observedVerificationBySelection.set(token, calibration.verified);
            return;
        }
        if (!previous && calibration.verified) this.#enqueue(VERIFIED_MESSAGE);
        this.observedVerificationBySelection.set(token, calibration.verified);
    }

    #enqueue(text) {
        this.toastQueue.push(
            Object.freeze({
                text,
                durationSeconds: MESSAGE_DURATION_SECONDS
            })
        );
        this.currentToast ??= this.toastQueue.shift() ?? null;
    }

    #advanceToast(dt) {
        if (!this.currentToast) return;
        this.toastAge += dt;
        while (this.currentToast && this.toastAge >= this.currentToast.durationSeconds) {
            this.toastAge -= this.currentToast.durationSeconds;
            this.currentToast = this.toastQueue.shift() ?? null;
        }
    }

    snapshot() {
        if (!this.hud) return null;
        return Object.freeze({
            hud: Object.freeze({ ...this.hud }),
            toast: this.currentToast
                ? Object.freeze({
                      ...this.currentToast,
                      age: this.toastAge
                  })
                : null
        });
    }
}
