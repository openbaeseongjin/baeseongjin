import { assessDirectionCoverage } from "./DirectionCoverage.js";
import { DirectionAdapterRegistry } from "./DirectionAdapterRegistry.js";
import { DirectionCharacterPresentation } from "./DirectionCharacterPresentation.js";
import { DirectionLightingPresentation } from "./DirectionLightingPresentation.js";
import { DirectionRuntime } from "./DirectionRuntime.js";
import { AuthoredStoryPresentation } from "../presentation/AuthoredStoryPresentation.js";
import { PlayerMessagePresentation } from "../presentation/PlayerMessagePresentation.js";

export const VERIFIED_LOCAL_DIRECTION_ACTIONS = Object.freeze([
    "camera.follow-zone",
    "story.show",
    "message.show-bark",
    "audio.play-direction-cue",
    "lighting.apply-preset",
    "character.exhale"
]);

export function createLocalDirectionAdapters({
    viewerId,
    storyPresentation,
    messagePresentation,
    audioBindings,
    lightingPresentation,
    characterPresentation
}) {
    return new DirectionAdapterRegistry()
        .register({ domain: "camera", action: "follow-zone", execute: () => true })
        .register({
            domain: "story",
            action: "show",
            execute: (command) =>
                storyPresentation.enqueue(command.causalId, [
                    {
                        id: command.payload.id,
                        title: command.payload.title,
                        detail: command.payload.detail,
                        durationSeconds: command.payload.durationSeconds
                    }
                ])
        })
        .register({
            domain: "message",
            action: "show-bark",
            execute: (command) =>
                messagePresentation.enqueue({
                    ...command.payload,
                    speakerId: command.payload.speakerId === "local-player" ? viewerId : command.payload.speakerId
                })
        })
        .register({
            domain: "audio",
            action: "play-direction-cue",
            execute: (command, context) =>
                audioBindings?.playDirectionCue(command.payload.cueId, {
                    ...context.audioContext,
                    emitterId: viewerId,
                    causalId: command.causalId,
                    position: context.audioContext?.listener
                }) ?? false
        })
        .register({
            domain: "lighting",
            action: "apply-preset",
            execute: (command, context) => lightingPresentation.present(command, context)
        })
        .register({
            domain: "character",
            action: "exhale",
            execute: (command) => characterPresentation.present(command, { viewerId })
        });
}

export function assertLocalDirectionReleaseReady(definitions) {
    const verifiedActions = new Set(VERIFIED_LOCAL_DIRECTION_ACTIONS);
    const coverage = assessDirectionCoverage(definitions, {
        supportedActions: verifiedActions,
        boundActions: verifiedActions,
        verifiedActions
    });
    if (!coverage.releaseReady) {
        const blockers = coverage.tracks
            .filter(({ optional, status }) => !optional && status !== "verified")
            .map(({ commandId, status, review }) =>
                [
                    `${commandId} (${status})`,
                    review?.intent ? `의도: ${review.intent}` : null,
                    review?.reason ? `차단: ${review.reason}` : null,
                    review?.recommendation ? `추천: ${review.recommendation}` : null
                ]
                    .filter(Boolean)
                    .join(" · ")
            );
        throw new Error(`direction release blocked: ${blockers.join(", ")}`);
    }
    return coverage;
}

export function createLocalDirectionRuntime({ viewerId, definitions = [], audioBindings = null }) {
    const coverage = assertLocalDirectionReleaseReady(definitions);
    const storyPresentation = new AuthoredStoryPresentation({
        managedAreaIds: definitions.map(({ areaId }) => areaId)
    });
    const messagePresentation = new PlayerMessagePresentation({ viewerId });
    const lightingPresentation = new DirectionLightingPresentation();
    const characterPresentation = new DirectionCharacterPresentation();
    const adapters = createLocalDirectionAdapters({
        viewerId,
        storyPresentation,
        messagePresentation,
        audioBindings,
        lightingPresentation,
        characterPresentation
    });
    return Object.freeze({
        runtime: new DirectionRuntime({ definitions, adapters, executionAuthorities: ["local"] }),
        storyPresentation,
        messagePresentation,
        lightingPresentation,
        characterPresentation,
        coverage
    });
}
