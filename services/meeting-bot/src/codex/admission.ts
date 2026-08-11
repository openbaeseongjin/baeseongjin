export type CodexAdmission =
    | { accepted: true; release: () => void }
    | { accepted: false; reason: "requester-busy" | "queue-full" };

export class CodexAdmissionController {
    private readonly requesters = new Set<string>();

    constructor(private readonly maximumOutstanding: number) {}

    acquire(requesterId: string): CodexAdmission {
        if (this.requesters.has(requesterId)) {
            return { accepted: false, reason: "requester-busy" };
        }
        if (this.requesters.size >= this.maximumOutstanding) {
            return { accepted: false, reason: "queue-full" };
        }

        this.requesters.add(requesterId);
        let released = false;
        return {
            accepted: true,
            release: () => {
                if (!released) {
                    released = true;
                    this.requesters.delete(requesterId);
                }
            }
        };
    }
}
