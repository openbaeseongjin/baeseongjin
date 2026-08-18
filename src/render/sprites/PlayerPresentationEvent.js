function fallbackEventId(event, index) {
    return (
        event.eventId ??
        event.impactId ??
        event.predictionId ??
        event.projectileId ??
        `${event.eventType}:${event.tick ?? index}`
    );
}

function impactEventId(event, index) {
    return `hit:${event.objectId ?? event.projectileId ?? event.predictionId ?? fallbackEventId(event, index)}`;
}

function respawnEventId(event) {
    const causeId = event.causeId ?? event.impactId ?? event.projectileId ?? event.predictionId;
    if (causeId) return `respawn:${event.playerId ?? event.targetId}:${causeId}`;
    const position = event.position ?? {};
    const x = Number.isFinite(position.x) ? position.x.toFixed(3) : "unknown";
    const y = Number.isFinite(position.y) ? position.y.toFixed(3) : "unknown";
    return `respawn:${event.playerId}:${event.reason ?? "unknown"}:${x}:${y}`;
}

export function createPlayerPresentationEvents(events = []) {
    const presentationEvents = [];
    events.forEach((event, index) => {
        if (!event) return;
        if (
            (event.eventType === "resolve" || event.eventType === "predicted-resolve") &&
            (event.resolution === "player-hit" || event.resolution === "fall-damage")
        ) {
            const playerId = event.targetId ?? event.parameters?.targetId;
            if (playerId) {
                presentationEvents.push(
                    event.respawned
                        ? Object.freeze({
                              id: respawnEventId({ ...event, playerId }),
                              playerId,
                              type: "respawn",
                              deathPosition: event.deathPosition ?? event.position,
                              respawnPosition: event.respawnPosition ?? null
                          })
                        : Object.freeze({ id: impactEventId(event, index), playerId, type: "hit" })
                );
            }
            return;
        }
        if (
            (event.eventType === "player-fall-damaged" || event.eventType === "predicted-player-fall-damaged") &&
            (event.targetId || event.playerId)
        ) {
            const playerId = event.targetId ?? event.playerId;
            presentationEvents.push(
                event.respawned
                    ? Object.freeze({
                          id: respawnEventId({ ...event, playerId }),
                          playerId,
                          type: "respawn",
                          deathPosition: event.deathPosition ?? event.position,
                          respawnPosition: event.respawnPosition ?? null
                      })
                    : Object.freeze({ id: impactEventId(event, index), playerId, type: "hit" })
            );
            return;
        }
        if (event.eventType === "player-respawned" && event.playerId) {
            presentationEvents.push(
                Object.freeze({
                    id: respawnEventId(event),
                    playerId: event.playerId,
                    type: "respawn",
                    deathPosition: event.deathPosition ?? event.position,
                    respawnPosition: event.position
                })
            );
            return;
        }
        if (event.type === "checkpoint-respawn" && event.playerId) {
            presentationEvents.push(
                Object.freeze({
                    id: respawnEventId(event),
                    playerId: event.playerId,
                    type: "respawn",
                    deathPosition: event.deathPosition ?? event.position,
                    respawnPosition: event.position
                })
            );
        }
    });
    return Object.freeze(presentationEvents);
}
