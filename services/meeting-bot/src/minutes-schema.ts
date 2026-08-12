import { z } from "zod";
import { usesKoreanOrEnglishWritingSystems } from "./writing-system.js";

const minutesText = z
  .string()
  .min(1)
  .max(1_000)
  .refine(usesKoreanOrEnglishWritingSystems, "must use only Korean or English writing systems");
const evidenceQuote = z.string().min(1).max(1_000);
const evidenceSchema = z
  .array(
    z.object({
      id: z.string().min(1).max(100),
      quote: evidenceQuote,
    }).strict(),
  )
  .min(1)
  .max(10);

const evidencedItemSchema = z.object({
  text: minutesText,
  evidence: evidenceSchema,
}).strict();

export const rawMinutesSchema = z.object({
  discussed: z.array(evidencedItemSchema).max(200),
  decided: z.array(evidencedItemSchema).max(100),
  rejected: z.array(evidencedItemSchema).max(100),
  hypotheses: z.array(evidencedItemSchema).max(200),
  actionItems: z.array(
    z.object({
      owner: minutesText,
      task: minutesText,
      due: minutesText.nullable(),
      evidence: evidenceSchema,
    }).strict(),
  ).max(100),
  blockers: z.array(evidencedItemSchema).max(100),
  nextMeeting: evidencedItemSchema.nullable(),
}).strict();

const evidenceJsonSchema = {
  type: "array",
  minItems: 1,
  maxItems: 10,
  items: {
    type: "object",
    additionalProperties: false,
    required: ["id", "quote"],
    properties: {
      id: { type: "string", minLength: 1, maxLength: 100 },
      quote: { type: "string", minLength: 1, maxLength: 1_000 },
    },
  },
} as const;

const evidencedItemJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["text", "evidence"],
  properties: {
    text: { type: "string", minLength: 1, maxLength: 1_000 },
    evidence: evidenceJsonSchema,
  },
} as const;

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
    discussed: { type: "array", maxItems: 200, items: evidencedItemJsonSchema },
    decided: {
      type: "array",
      maxItems: 100,
      items: evidencedItemJsonSchema,
    },
    rejected: {
      type: "array",
      maxItems: 100,
      items: evidencedItemJsonSchema,
    },
    hypotheses: { type: "array", maxItems: 200, items: evidencedItemJsonSchema },
    actionItems: {
      type: "array",
      maxItems: 100,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["owner", "task", "due", "evidence"],
        properties: {
          owner: { type: "string", minLength: 1, maxLength: 1_000 },
          task: { type: "string", minLength: 1, maxLength: 1_000 },
          due: { type: ["string", "null"], minLength: 1, maxLength: 1_000 },
          evidence: evidenceJsonSchema,
        },
      },
    },
    blockers: { type: "array", maxItems: 100, items: evidencedItemJsonSchema },
    nextMeeting: {
      anyOf: [evidencedItemJsonSchema, { type: "null" }],
    },
  },
} as const;
