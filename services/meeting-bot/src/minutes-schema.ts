import { z } from "zod";

const minutesText = z.string().min(1).max(1_000);
const evidenceIds = z.array(z.string().min(1).max(100)).min(1).max(10);

const evidencedItemSchema = z.object({
  text: minutesText,
  evidenceIds,
});

export const rawMinutesSchema = z.object({
  discussed: z.array(minutesText).max(200),
  decided: z.array(evidencedItemSchema).max(100),
  rejected: z.array(evidencedItemSchema).max(100),
  hypotheses: z.array(minutesText).max(200),
  actionItems: z.array(
    z.object({
      owner: minutesText,
      task: minutesText,
      due: minutesText.nullable(),
      evidenceIds,
    }),
  ).max(100),
  blockers: z.array(minutesText).max(100),
  nextMeeting: evidencedItemSchema.nullable(),
});

export const meetingMinutesJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "discussed",
    "decided",
    "rejected",
    "hypotheses",
    "actionItems",
    "blockers",
    "nextMeeting",
  ],
  properties: {
    discussed: { type: "array", maxItems: 200, items: { type: "string", maxLength: 1_000 } },
    decided: {
      type: "array",
      maxItems: 100,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "evidenceIds"],
        properties: {
          text: { type: "string", maxLength: 1_000 },
          evidenceIds: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", maxLength: 100 } },
        },
      },
    },
    rejected: {
      type: "array",
      maxItems: 100,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "evidenceIds"],
        properties: {
          text: { type: "string", maxLength: 1_000 },
          evidenceIds: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", maxLength: 100 } },
        },
      },
    },
    hypotheses: { type: "array", maxItems: 200, items: { type: "string", maxLength: 1_000 } },
    actionItems: {
      type: "array",
      maxItems: 100,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["owner", "task", "due", "evidenceIds"],
        properties: {
          owner: { type: "string", maxLength: 1_000 },
          task: { type: "string", maxLength: 1_000 },
          due: { type: ["string", "null"], maxLength: 1_000 },
          evidenceIds: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", maxLength: 100 } },
        },
      },
    },
    blockers: { type: "array", maxItems: 100, items: { type: "string", maxLength: 1_000 } },
    nextMeeting: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["text", "evidenceIds"],
          properties: {
            text: { type: "string", maxLength: 1_000 },
            evidenceIds: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", maxLength: 100 } },
          },
        },
        { type: "null" },
      ],
    },
  },
} as const;
