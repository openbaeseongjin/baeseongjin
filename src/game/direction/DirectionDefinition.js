export const DIRECTION_STATUS = Object.freeze([
    "unsupported",
    "compile-failed",
    "review-required",
    "unbound",
    "implemented",
    "verified"
]);

export const DIRECTION_COMMAND_CONTRACTS = Object.freeze({
    camera: Object.freeze({ authorities: Object.freeze(["local"]), actions: Object.freeze(["follow-zone"]) }),
    story: Object.freeze({ authorities: Object.freeze(["local"]), actions: Object.freeze(["show"]) }),
    message: Object.freeze({ authorities: Object.freeze(["local"]), actions: Object.freeze(["show-bark"]) }),
    audio: Object.freeze({
        authorities: Object.freeze(["local"]),
        actions: Object.freeze(["play-direction-cue"])
    }),
    lighting: Object.freeze({
        authorities: Object.freeze(["local"]),
        actions: Object.freeze(["apply-preset"])
    }),
    character: Object.freeze({ authorities: Object.freeze(["local"]), actions: Object.freeze(["exhale"]) }),
    player: Object.freeze({
        authorities: Object.freeze(["owner"]),
        actions: Object.freeze(["set-input-lock", "set-invulnerability", "force-motion", "review"])
    }),
    enemy: Object.freeze({
        authorities: Object.freeze(["server"]),
        actions: Object.freeze(["spawn", "set-state", "review"])
    }),
    collision: Object.freeze({
        authorities: Object.freeze(["server"]),
        actions: Object.freeze(["set-enabled", "review"])
    }),
    objective: Object.freeze({
        authorities: Object.freeze(["server"]),
        actions: Object.freeze(["complete", "set-state", "review"])
    }),
    gate: Object.freeze({
        authorities: Object.freeze(["server"]),
        actions: Object.freeze(["unlock", "set-state", "review"])
    })
});

export const DIRECTION_SCOPES_BY_AUTHORITY = Object.freeze({
    local: Object.freeze(["local-player", "party"]),
    owner: Object.freeze(["owner-player"]),
    server: Object.freeze(["shared-world", "server"])
});

const AUDIO_CUES_BY_ACTION = Object.freeze({
    "normal-hum-relay-trip-shutter-settle": "direction-relay-trip-settle",
    "rope-priority": "direction-rope-priority",
    "air-rope-landing-priority": "direction-air-rope-landing",
    "dead-motor-silence-plus-cable-brake-settle": "direction-cable-brake-settle",
    "release-free-air-clear-c-attach": "direction-free-air-attach",
    "rope-air-priority-lift-remains-silent": "direction-rope-air-priority",
    "dead-machinery-to-clean-security-beep-servo": "direction-security-beep-servo"
});

const LIGHTING_PRESETS_BY_ACTION = Object.freeze({
    "maintenance-white-plus-local-amber": "maintenance-white-local-amber"
});

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) deepFreeze(child);
    return Object.freeze(value);
}

function nonEmpty(value, label) {
    if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be non-empty`);
    return value;
}

function finiteNonNegative(value, label) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be non-negative`);
    return value;
}

function commandIdentity(beatId, trackId, itemIndex = 0) {
    return `${beatId}:${trackId}:${itemIndex}`;
}

export function defineDirectionCommand({
    commandId,
    beatId,
    trackId,
    domain,
    action,
    scope,
    authority,
    payload,
    causalId = commandId,
    offsetSeconds = 0,
    durationSeconds = 0,
    optional = false,
    review = null
}) {
    const contract = DIRECTION_COMMAND_CONTRACTS[domain];
    if (!contract) throw new Error(`unknown direction domain: ${domain}`);
    if (!contract.actions.includes(action)) throw new Error(`unknown ${domain} direction action: ${action}`);
    if (!contract.authorities.includes(authority)) {
        throw new Error(`direction authority '${authority}' is invalid for ${domain}`);
    }
    if (!DIRECTION_SCOPES_BY_AUTHORITY[authority]?.includes(scope)) {
        throw new Error(`direction scope '${scope}' is invalid for ${authority} authority`);
    }
    return deepFreeze({
        commandId: nonEmpty(commandId, "commandId"),
        beatId: nonEmpty(beatId, "beatId"),
        trackId: nonEmpty(trackId, "trackId"),
        domain,
        action,
        scope: nonEmpty(scope, "scope"),
        authority,
        payload: deepFreeze(structuredClone(payload ?? {})),
        causalId: nonEmpty(causalId, "causalId"),
        offsetSeconds: finiteNonNegative(offsetSeconds, "offsetSeconds"),
        durationSeconds: finiteNonNegative(durationSeconds, "durationSeconds"),
        optional: Boolean(optional),
        review: review ? deepFreeze(structuredClone(review)) : null
    });
}

function presentationCommand(properties) {
    return defineDirectionCommand({ ...properties, scope: "local-player", authority: "local" });
}

function normalizedTrigger(trigger, { areaId, beat }) {
    if (!trigger || typeof trigger !== "object") throw new Error(`${beat.beatId} trigger is required`);
    switch (trigger.type) {
        case "area-enter":
            return deepFreeze({ kind: "area-enter", areaId });
        case "position-threshold":
            return deepFreeze({
                kind: "position-threshold",
                minLocalX: trigger.minLocalX,
                maxLocalX: trigger.maxLocalX,
                minLocalY: trigger.minLocalY,
                maxLocalY: trigger.maxLocalY
            });
        case "camera-zone":
            return deepFreeze({ kind: "camera-zone", zoneIds: [nonEmpty(trigger.zoneId, "trigger.zoneId")] });
        case "position-zone":
            return deepFreeze({
                kind: "camera-zone",
                zoneIds: [...new Set([trigger.zoneId, beat.camera?.zoneId].filter(Boolean))]
            });
        case "objective-started":
            return deepFreeze({
                kind: "event",
                eventTypes: ["objective-sequence-started", "objective-started"],
                objectiveId: nonEmpty(trigger.objectiveId, "trigger.objectiveId")
            });
        case "objective-completed":
            return deepFreeze({
                kind: "event",
                eventTypes: ["objective-completed"],
                objectiveId: nonEmpty(trigger.objectiveId, "trigger.objectiveId")
            });
        case "gate-unlocked":
            return deepFreeze({
                kind: "event",
                eventTypes: ["gate-unlocked"],
                gateId: trigger.gateId ?? `${areaId}:gate`
            });
        default:
            throw new Error(`unsupported direction trigger: ${trigger.type}`);
    }
}

function cameraCommand(beat) {
    if (!beat.camera?.zoneId) return [];
    const trackId = `${beat.beatId}:camera`;
    return [
        presentationCommand({
            commandId: commandIdentity(beat.beatId, trackId),
            beatId: beat.beatId,
            trackId,
            domain: "camera",
            action: "follow-zone",
            payload: { zoneId: beat.camera.zoneId, forcedPan: beat.camera.forcedPan === true },
            causalId: `${beat.dedupeToken}:camera`,
            review: beat.camera.forcedPan
                ? {
                      reason: "forced-camera-not-bound",
                      intent: `forced pan to ${beat.camera.zoneId}`,
                      recommendation: "강제 카메라 adapter와 Player 안전 정책을 개발자 검토한다."
                  }
                : null
        })
    ];
}

function storyCommands(track, context) {
    const { beat, trackId } = context;
    const base = {
        beatId: beat.beatId,
        trackId,
        domain: "story",
        action: "show",
        optional: track.optional === true
    };
    if (track.content) {
        const durationSeconds = track.timing?.durationSeconds ?? 1.2;
        return [
            presentationCommand({
                ...base,
                commandId: commandIdentity(beat.beatId, trackId),
                payload: { id: `${beat.dedupeToken}:story`, ...track.content, durationSeconds },
                causalId: `${beat.dedupeToken}:story`,
                durationSeconds
            })
        ];
    }
    const items = track.items ?? [];
    return items.map((item, index) => {
        const offsetSeconds = item.atSeconds ?? 0;
        const nextOffset = items[index + 1]?.atSeconds;
        const previousOffset = items[index - 1]?.atSeconds;
        const durationSeconds =
            nextOffset !== undefined
                ? nextOffset - offsetSeconds
                : items.length > 1
                  ? offsetSeconds - (previousOffset ?? 0)
                  : 1.2;
        return presentationCommand({
            ...base,
            commandId: commandIdentity(beat.beatId, trackId, index),
            payload: { id: `${beat.dedupeToken}:story:${index}`, ...item, durationSeconds },
            causalId: `${beat.dedupeToken}:story:${index}`,
            offsetSeconds,
            durationSeconds
        });
    });
}

function dialogueCommands(track, context) {
    if (!track.content) return [];
    const { beat, trackId, storyEndSeconds } = context;
    const durationSeconds = track.timing?.durationSeconds ?? 1.8;
    const offsetSeconds = track.timing?.minDelaySeconds ?? storyEndSeconds;
    return [
        presentationCommand({
            commandId: commandIdentity(beat.beatId, trackId),
            beatId: beat.beatId,
            trackId,
            domain: "message",
            action: "show-bark",
            payload: {
                messageId: `${beat.dedupeToken}:dialogue`,
                channel: "player-bark",
                audience: "local-player",
                speakerId: "local-player",
                text: track.content.text,
                durationSeconds,
                revealCharactersPerSecond: track.timing?.revealCharactersPerSecond ?? 18,
                priority: track.priority ?? 0,
                causalId: `${beat.dedupeToken}:dialogue`
            },
            causalId: `${beat.dedupeToken}:dialogue`,
            offsetSeconds,
            durationSeconds,
            optional: track.optional === true
        })
    ];
}

function resolveAuthoringAction(actionMap, track, domain) {
    const direct = actionMap[track.action];
    if (direct) return { runtimeValue: direct, fallback: null, review: null };
    const fallback = track.fallbackPolicy;
    const approved =
        fallback?.approval === "approved" &&
        typeof fallback.approvedBy === "string" &&
        fallback.approvedBy.trim() &&
        typeof fallback.originalIntent === "string" &&
        fallback.originalIntent.trim() &&
        typeof fallback.lostMeaning === "string" &&
        fallback.lostMeaning.trim() &&
        actionMap[fallback.replacementAction];
    if (approved) {
        return {
            runtimeValue: actionMap[fallback.replacementAction],
            fallback: structuredClone(fallback),
            review: null
        };
    }
    return {
        runtimeValue: null,
        fallback: null,
        review: {
            reason: "unsupported-authoring-action",
            intent: track.action,
            recommendation: `새 ${domain} action adapter 또는 기획자 승인 fallback을 검토한다.`
        }
    };
}

function audioCommands(track, { beat, trackId }) {
    if (!track.action || track.action === "none") return [];
    const resolved = resolveAuthoringAction(AUDIO_CUES_BY_ACTION, track, "Audio");
    return [
        presentationCommand({
            commandId: commandIdentity(beat.beatId, trackId),
            beatId: beat.beatId,
            trackId,
            domain: "audio",
            action: "play-direction-cue",
            payload: { actionToken: track.action, cueId: resolved.runtimeValue, fallbackPolicy: resolved.fallback },
            causalId: `${beat.dedupeToken}:audio:${trackId}`,
            optional: track.optional === true,
            review: resolved.review
        })
    ];
}

function lightingCommands(track, { beat, trackId }) {
    if (!track.action || track.action === "none") return [];
    const resolved = resolveAuthoringAction(LIGHTING_PRESETS_BY_ACTION, track, "Lighting");
    return [
        presentationCommand({
            commandId: commandIdentity(beat.beatId, trackId),
            beatId: beat.beatId,
            trackId,
            domain: "lighting",
            action: "apply-preset",
            payload: {
                actionToken: track.action,
                presetId: resolved.runtimeValue,
                lifetime: "area",
                fallbackPolicy: resolved.fallback
            },
            causalId: `${beat.dedupeToken}:lighting:${trackId}`,
            optional: track.optional === true,
            review: resolved.review
        })
    ];
}

function characterCommands(track, { beat, trackId }) {
    if (!track.action || track.action === "none") return [];
    if (track.action !== "optional-nonverbal-exhale") {
        return [
            presentationCommand({
                commandId: commandIdentity(beat.beatId, trackId),
                beatId: beat.beatId,
                trackId,
                domain: "character",
                action: "exhale",
                payload: { actionToken: track.action },
                causalId: `${beat.dedupeToken}:character:${trackId}`,
                optional: track.optional === true,
                review: {
                    reason: "unsupported-authoring-action",
                    intent: track.action,
                    recommendation: "새 Character action adapter를 검토한다."
                }
            })
        ];
    }
    return [
        presentationCommand({
            commandId: commandIdentity(beat.beatId, trackId),
            beatId: beat.beatId,
            trackId,
            domain: "character",
            action: "exhale",
            payload: { durationSeconds: 0.8 },
            causalId: `${beat.dedupeToken}:character:${trackId}`,
            durationSeconds: 0.8,
            optional: track.optional === true
        })
    ];
}

const GAMEPLAY_COMMAND_DEFAULTS = Object.freeze({
    player: Object.freeze({ scope: "owner-player", authority: "owner" }),
    enemy: Object.freeze({ scope: "shared-world", authority: "server" }),
    collision: Object.freeze({ scope: "shared-world", authority: "server" }),
    objective: Object.freeze({ scope: "shared-world", authority: "server" }),
    gate: Object.freeze({ scope: "shared-world", authority: "server" })
});

function gameplayDomainCommands(track, { beat, trackId }) {
    if (!track.action || track.action === "none") return [];
    const defaults = GAMEPLAY_COMMAND_DEFAULTS[track.type];
    const supportedAction = DIRECTION_COMMAND_CONTRACTS[track.type].actions.includes(track.action);
    return [
        defineDirectionCommand({
            commandId: commandIdentity(beat.beatId, trackId),
            beatId: beat.beatId,
            trackId,
            domain: track.type,
            action: supportedAction ? track.action : "review",
            scope: track.scope ?? defaults.scope,
            authority: track.authority ?? defaults.authority,
            payload: track.payload ?? {},
            causalId: `${beat.dedupeToken}:${track.type}:${trackId}`,
            offsetSeconds: track.timing?.atSeconds ?? 0,
            durationSeconds: track.timing?.durationSeconds ?? 0,
            optional: track.optional === true,
            review: supportedAction
                ? null
                : {
                      reason: "unsupported-gameplay-action",
                      intent: `${track.type}.${track.action}`,
                      recommendation: `기획 의도를 보존하는 ${track.type} adapter 확장을 개발자 검토한다.`
                  }
        })
    ];
}

const TRACK_COMPILERS = Object.freeze({
    systemText: storyCommands,
    dialogue: dialogueCommands,
    audio: audioCommands,
    lighting: lightingCommands,
    character: characterCommands,
    player: gameplayDomainCommands,
    enemy: gameplayDomainCommands,
    collision: gameplayDomainCommands,
    objective: gameplayDomainCommands,
    gate: gameplayDomainCommands
});

function compileBeat(beat, areaId, order) {
    nonEmpty(beat.beatId, "beatId");
    nonEmpty(beat.dedupeToken, "dedupeToken");
    const commands = [...cameraCommand(beat)];
    const tracks = beat.tracks ?? [];
    const storyEndSeconds = tracks
        .filter(({ type }) => type === "systemText")
        .flatMap((track, index) => storyCommands(track, { beat, trackId: `${beat.beatId}:story:${index}` }))
        .reduce((maximum, command) => Math.max(maximum, command.offsetSeconds + command.durationSeconds), 0);
    tracks.forEach((track, index) => {
        if (track.action === "none" || track.type === "object") return;
        const compile = TRACK_COMPILERS[track.type];
        if (!compile) throw new Error(`unsupported direction track: ${track.type}`);
        commands.push(...compile(track, { beat, trackId: `${beat.beatId}:${track.type}:${index}`, storyEndSeconds }));
    });
    commands.sort((left, right) => left.offsetSeconds - right.offsetSeconds);
    return deepFreeze({
        beatId: beat.beatId,
        areaId,
        order,
        purpose: beat.purpose ?? null,
        trigger: normalizedTrigger(beat.trigger, { areaId, beat }),
        scope: beat.scope,
        replayPolicy: beat.replayPolicy,
        dedupeToken: beat.dedupeToken,
        worldPause: beat.worldPause === true,
        playerControl: beat.playerControl ?? "ON",
        commands,
        durationSeconds: commands.reduce(
            (maximum, command) => Math.max(maximum, command.offsetSeconds + command.durationSeconds),
            0
        )
    });
}

export function compileDirectionAuthoring(source) {
    if (source?.schemaVersion !== "direction-spec-v1") {
        throw new Error(`unsupported direction authoring schema: ${source?.schemaVersion}`);
    }
    const areaId = nonEmpty(source.stage?.sourceAreaId, "stage.sourceAreaId");
    const beats = (source.beats ?? []).map((beat, index) => compileBeat(beat, areaId, index));
    if (beats.length === 0) throw new Error(`${areaId} must define at least one direction beat`);
    return deepFreeze({
        definitionId: `direction:${areaId}`,
        schemaVersion: 1,
        areaId,
        stageId: source.stage.id,
        designStatus: source.directionStatus,
        globalControl: structuredClone(source.globalControl ?? {}),
        beats
    });
}

export function compileDirectionAuthoringReport(source) {
    try {
        return deepFreeze({ status: "implemented", definition: compileDirectionAuthoring(source), issues: [] });
    } catch (error) {
        return deepFreeze({
            status: "compile-failed",
            definition: null,
            issues: [{ message: error.message }]
        });
    }
}
