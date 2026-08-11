import { describe, expect, it } from "vitest";
import { CodexAdmissionController } from "../src/codex/admission.js";

describe("CodexAdmissionController", () => {
    it("allows only one outstanding job per member", () => {
        const admission = new CodexAdmissionController(5);
        const first = admission.acquire("member-a");

        expect(first.accepted).toBe(true);
        expect(admission.acquire("member-a")).toEqual({ accepted: false, reason: "requester-busy" });

        if (first.accepted) {
            first.release();
        }
        expect(admission.acquire("member-a").accepted).toBe(true);
    });

    it("bounds the total number of outstanding jobs", () => {
        const admission = new CodexAdmissionController(2);

        expect(admission.acquire("member-a").accepted).toBe(true);
        expect(admission.acquire("member-b").accepted).toBe(true);
        expect(admission.acquire("member-c")).toEqual({ accepted: false, reason: "queue-full" });
    });
});
