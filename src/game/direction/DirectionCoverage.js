function actionKey(command) {
    return `${command.domain}.${command.action}`;
}

export function assessDirectionCoverage(
    definitions,
    { supportedActions = new Set(), boundActions = new Set(), verifiedActions = new Set() } = {}
) {
    const tracks = definitions.flatMap((definition) =>
        definition.beats.flatMap((beat) =>
            beat.commands.map((command) => {
                const key = actionKey(command);
                let status;
                if (command.review) status = "review-required";
                else if (!supportedActions.has(key)) status = "unsupported";
                else if (!boundActions.has(key)) status = "unbound";
                else if (!verifiedActions.has(key)) status = "implemented";
                else status = "verified";
                return Object.freeze({
                    definitionId: definition.definitionId,
                    beatId: beat.beatId,
                    trackId: command.trackId,
                    commandId: command.commandId,
                    actionKey: key,
                    optional: command.optional,
                    status,
                    review: command.review
                });
            })
        )
    );
    return Object.freeze({
        releaseReady: tracks.every(({ optional, status }) => optional || status === "verified"),
        tracks: Object.freeze(tracks)
    });
}
