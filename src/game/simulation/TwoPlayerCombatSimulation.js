import { createPlayerCommand } from "../commands/PlayerCommand.js";
import {
    createPlayerCommandBatch,
    deserializePlayerCommandBatch,
    serializePlayerCommandBatch
} from "../network/PlayerCommandBatch.js";
import {
    deserializeWorldSnapshotEnvelope,
    normalizeWorldSnapshotState,
    serializeWorldSnapshotEnvelope
} from "../network/WorldSnapshotEnvelope.js";
import { materializeSnapshotReplication } from "../network/WorldSnapshotReplication.js";
import { buildAuthoritySnapshot } from "../runtime/AuthoritySnapshotBuilder.js";
import { GameSimulation } from "./GameSimulation.js";

const FIXED_DT = 1 / 120;

function idleCommand(aimWorld = { x: 0, y: 0 }) {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact: false,
            interactSequence: 0,
            spellCommand: { commandSequence: 0, commandKey: null },
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        aimWorld
    );
}

export class TwoPlayerCombatSimulation {
    constructor({ worldSeed = 1, firstPlayerId = "player-one", secondPlayerId = "player-two" } = {}) {
        this.worldSeed = worldSeed;
        this.playerIds = Object.freeze([firstPlayerId, secondPlayerId]);
        this.simulation = new GameSimulation({ worldSeed, playerId: firstPlayerId });
        const first = this.player(firstPlayerId);
        this.simulation.addPlayer({ x: first.position.x + 160, y: first.position.y }, secondPlayerId);
        this.commandSequenceByPlayerId = new Map(this.playerIds.map((id) => [id, 0]));
        this.transportSequenceByPlayerId = new Map(this.playerIds.map((id) => [id, 0]));
    }

    player(playerId) {
        const player = this.simulation.players.find(({ id }) => id === playerId);
        if (!player) throw new Error(`unknown simulation player: ${playerId}`);
        return player;
    }

    placePlayer(playerId, position) {
        this.player(playerId).physics.setPhysicsPosition(position);
        return this.player(playerId);
    }

    setPlayerHealth(playerId, health, maxHealth = health) {
        const player = this.player(playerId);
        player.maxHealth = maxHealth;
        player.health = health;
        return player;
    }

    equipAugment(playerId, augmentId) {
        const player = this.player(playerId);
        if (!player.augmentLoadout.has(augmentId)) player.augmentLoadout.select(augmentId);
        player.augmentCombat.syncLoadout(player.augmentLoadout);
        return player.augmentLoadout.snapshot();
    }

    applyStatus(playerId, statusEffectId, sourceId = null) {
        return this.player(playerId).statusEffects.apply(statusEffectId, { sourceId });
    }

    spellCommand(playerId, commandKey, aimWorld) {
        const sequence = (this.commandSequenceByPlayerId.get(playerId) ?? 0) + 1;
        this.commandSequenceByPlayerId.set(playerId, sequence);
        return createPlayerCommand(
            {
                horizontal: 0,
                vertical: 0,
                interact: false,
                interactSequence: 0,
                spellCommand: { commandSequence: sequence, commandKey },
                pointer: { x: 0, y: 0, down: false },
                viewport: { width: 1280, height: 720 }
            },
            aimWorld
        );
    }

    advanceTicks(tickCount, commands = new Map()) {
        for (let index = 0; index < tickCount; index += 1) {
            const commandEntries = this.playerIds.map((playerId) => {
                const sequence = (this.transportSequenceByPlayerId.get(playerId) ?? 0) + 1;
                this.transportSequenceByPlayerId.set(playerId, sequence);
                return {
                    playerId,
                    sequence,
                    command:
                        index === 0 && commands.has(playerId)
                            ? commands.get(playerId)
                            : idleCommand(this.player(playerId).ropeObject.aimWorld)
                };
            });
            const commandBatch = deserializePlayerCommandBatch(
                serializePlayerCommandBatch(createPlayerCommandBatch(this.simulation.getTick() + 1, commandEntries))
            );
            this.simulation.stepCommandBatch(FIXED_DT, commandBatch, {
                resolveCheckpointProgress: false,
                resolveSummitProgress: false,
                recoverPlayerDeaths: false,
                recoverPlayerFalls: false
            });
        }
        return this.snapshot();
    }

    replaceEnemies(enemies) {
        this.simulation.objects.enemies.replace(enemies);
    }

    snapshot() {
        return Object.freeze({
            tick: this.simulation.getTick(),
            players: Object.freeze(this.playerIds.map((id) => this.simulation.playerState(id))),
            enemies: this.simulation.enemyStates(),
            rewards: Object.freeze(Object.fromEntries(this.simulation.augmentRewards))
        });
    }

    convergedReplica() {
        const envelope = deserializeWorldSnapshotEnvelope(
            serializeWorldSnapshotEnvelope(
                buildAuthoritySnapshot({
                    simulation: this.simulation,
                    acknowledgements: Object.fromEntries(this.transportSequenceByPlayerId)
                })
            )
        );
        const snapshotState = normalizeWorldSnapshotState(materializeSnapshotReplication(envelope.replication));
        const state = Object.freeze({
            tick: envelope.serverTick,
            players: snapshotState.players,
            enemies: snapshotState.enemies,
            rewards: snapshotState.augmentRewards
        });
        const replica = new GameSimulation({ worldSeed: this.worldSeed, playerId: this.playerIds[0] });
        replica.addPlayer(state.players[1].position, this.playerIds[1]);
        replica.preparePrediction(state.enemies);
        for (const player of state.players) replica.restoreOwnerPrediction(player.id, player, state.tick);
        return Object.freeze({ source: state, replica: this.playerIds.map((id) => replica.playerState(id)) });
    }
}
