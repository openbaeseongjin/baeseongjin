export class ArtifactInventory {
    constructor({ checkpointLossFraction, minimumOwnedForLoss }) {
        this.checkpointLossFraction = checkpointLossFraction;
        this.minimumOwnedForLoss = minimumOwnedForLoss;
        this.items = [];
    }

    add(artifact) {
        this.items.push(Object.freeze({ ...artifact }));
    }

    replace(artifacts) {
        if (!Array.isArray(artifacts)) throw new Error("artifacts must be an array");
        this.items = artifacts.map((artifact) => Object.freeze({ ...artifact }));
    }

    applyCheckpointLoss() {
        if (this.items.length < this.minimumOwnedForLoss) return [];
        const lossCount = Math.min(
            this.items.length - 1,
            Math.max(1, Math.floor(this.items.length * this.checkpointLossFraction))
        );
        return this.items.splice(this.items.length - lossCount, lossCount);
    }

    snapshot() {
        return [...this.items];
    }
}
