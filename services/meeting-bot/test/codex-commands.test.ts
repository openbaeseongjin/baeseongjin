import { describe, expect, it } from "vitest";
import { guildCommands } from "../src/commands.js";

describe("Codex guild commands", () => {
    it("does not reserve the command for administrators", () => {
        const command = guildCommands.find((candidate) => candidate.name === "codex");

        expect(command).toBeDefined();
        expect(command?.default_member_permissions).toBeUndefined();
    });

    it("registers only the bounded V1 operations", () => {
        const command = guildCommands.find((candidate) => candidate.name === "codex");

        expect(command).toBeDefined();
        expect(command?.options?.map((option) => option.name)).toEqual(["plan", "status", "result", "cancel"]);
    });

    it("offers only allowlisted read-only repository skills", () => {
        const command = guildCommands.find((candidate) => candidate.name === "codex");
        const plan = command?.options?.find((option) => option.name === "plan") as
            { options?: Array<{ name: string; choices?: Array<{ value: string | number }> }> } | undefined;
        const skill = plan?.options?.find((option) => option.name === "skill");

        expect(skill?.choices?.map((choice) => choice.value)).toEqual([
            "meeting-to-game-plan",
            "repo-task-plan",
            "discord-repo-cross-reference"
        ]);
    });
});
