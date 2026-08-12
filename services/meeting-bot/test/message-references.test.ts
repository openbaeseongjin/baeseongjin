import { describe, expect, it } from "vitest";
import { extractReferenceMaterials, sanitizeReferenceContent } from "../src/message-references.js";
import type { TextMessageRecord } from "../src/types.js";

describe("meeting reference materials", () => {
  it("organizes external links and safe attachment metadata without signed Discord URLs", () => {
    const messages: TextMessageRecord[] = [
      {
        id: "reference-1",
        channelId: "12345678901234571",
        channelName: "기획",
        timestamp: "2026-08-11T13:10:00.000Z",
        authorId: "member-1",
        authorName: "성현",
        content:
          "산나비 로프 참고 https://example.com/rope https://cdn.discordapp.com/attachments/1/2/file.png?ex=signed",
        attachments: [
          { name: "rope-reference.png", contentType: "image/png", sizeBytes: 4096 },
        ],
      },
      {
        id: "ordinary-1",
        channelId: "12345678901234572",
        channelName: "코딩",
        timestamp: "2026-08-11T13:11:00.000Z",
        authorId: "member-2",
        authorName: "용호",
        content: "로프 구현은 내일 시작할게.",
        attachments: [],
      },
    ];

    const result = extractReferenceMaterials(messages);

    expect(result).toEqual({
      items: [
        {
          timestamp: "2026-08-11T13:10:00.000Z",
          channelName: "기획",
          authorName: "성현",
          note: "산나비 로프 참고 [Discord attachment link omitted]",
          urls: ["https://example.com/rope"],
          attachments: [
            { name: "rope-reference.png", contentType: "image/png", sizeBytes: 4096 },
          ],
        },
      ],
      truncated: false,
      itemCapReached: false,
      perMessageCapReached: false,
      sensitiveUrlOmitted: false,
    });
    expect(JSON.stringify(result)).not.toContain("cdn.discordapp.com");
    expect(JSON.stringify(result)).not.toContain("ex=signed");
  });

  it("removes normal and ephemeral Discord signed attachment links before capture", () => {
    const content = sanitizeReferenceContent(
      "자료 https://media.discordapp.net/ephemeral-attachments/1/2/a.png?ex=secret 그리고 https://example.com/keep",
    );

    expect(content).toBe("자료 [Discord attachment link omitted] 그리고 https://example.com/keep");
    expect(content).not.toContain("ephemeral-attachments");
  });

  it("reports per-message URL and attachment truncation", () => {
    const urls = Array.from({ length: 21 }, (_, index) => `https://example.com/${index}`).join(" ");
    const attachments = Array.from({ length: 21 }, (_, index) => ({
      name: `reference-${index}.png`,
      contentType: "image/png",
      sizeBytes: 100 + index,
    }));
    const message: TextMessageRecord = {
      id: "many-references",
      channelId: "12345678901234571",
      channelName: "기획",
      timestamp: "2026-08-11T13:10:00.000Z",
      authorId: "member-1",
      authorName: "성현",
      content: urls,
      attachments,
    };

    const result = extractReferenceMaterials([message]);

    expect(result.truncated).toBe(true);
    expect(result.items[0]?.urls).toHaveLength(20);
    expect(result.items[0]?.attachments).toHaveLength(20);
  });

  it("omits credential-bearing external URLs instead of publishing their secrets", () => {
    const message: TextMessageRecord = {
      id: "sensitive-reference",
      channelId: "12345678901234571",
      channelName: "기획",
      timestamp: "2026-08-11T13:10:00.000Z",
      authorId: "member-1",
      authorName: "성현",
      content:
        "비공개 자료 https://user:password@example.com/private?token=super-secret 그리고 https://example.com/public",
      attachments: [],
    };

    const result = extractReferenceMaterials([message]);

    expect(result.truncated).toBe(true);
    expect(result.items[0]?.urls).toEqual(["https://example.com/public"]);
    expect(result.items[0]?.note).toContain("[Sensitive URL omitted]");
    expect(JSON.stringify(result)).not.toContain("super-secret");
    expect(JSON.stringify(result)).not.toContain("password");
  });

  it("omits OAuth fragments, JWT parameters, and secret-bearing webhook paths", () => {
    const content = sanitizeReferenceContent(
      [
        "https://example.com/callback#access_token=oauth-secret",
        "https://example.com/data?jwt=encoded-secret",
        "https://discord.com/api/webhooks/123456789/webhook-secret",
        "https://hooks.slack.com/services/T123/B456/slack-secret",
        "https://example.com/public",
      ].join(" "),
    );

    expect(content).toContain("https://example.com/public");
    expect(content.match(/\[Sensitive URL omitted\]/gu)).toHaveLength(4);
    expect(content).not.toContain("oauth-secret");
    expect(content).not.toContain("encoded-secret");
    expect(content).not.toContain("webhook-secret");
    expect(content).not.toContain("slack-secret");
  });

  it("omits versioned and alternate-host Discord webhook links and Slack workflow/trigger links", () => {
    const content = sanitizeReferenceContent(
      [
        "https://discord.com/api/v10/webhooks/123456789/webhook-secret",
        "https://canary.discord.com/api/webhooks/123456789/canary-secret",
        "https://ptb.discordapp.com/api/webhooks/123456789/ptb-secret",
        "https://hooks.slack.com/workflows/T123/A456/00000000000000000000000000000000/workflow-secret",
        "https://hooks.slack.com/triggers/T123/A456/trigger-secret",
        "https://example.com/public",
      ].join(" "),
    );

    expect(content).toContain("https://example.com/public");
    expect(content.match(/\[Sensitive URL omitted\]/gu)).toHaveLength(5);
    expect(content).not.toContain("webhook-secret");
    expect(content).not.toContain("canary-secret");
    expect(content).not.toContain("ptb-secret");
    expect(content).not.toContain("workflow-secret");
    expect(content).not.toContain("trigger-secret");
  });

  it("omits credential query parameters without a separator boundary", () => {
    const content = sanitizeReferenceContent(
      [
        "https://example.com/data?apikey=super-secret",
        "https://example.com/data?authtoken=another-secret",
        "https://example.com/data?sessionid=session-secret",
        "https://example.com/design?theme=modern",
      ].join(" "),
    );

    expect(content).toContain("https://example.com/design?theme=modern");
    expect(content.match(/\[Sensitive URL omitted\]/gu)).toHaveLength(3);
    expect(content).not.toContain("super-secret");
    expect(content).not.toContain("another-secret");
    expect(content).not.toContain("session-secret");
  });

  it("does not treat a long URL-free, attachment-free message as a reference", () => {
    const message: TextMessageRecord = {
      id: "long-plain-text",
      channelId: "12345678901234571",
      channelName: "기획",
      timestamp: "2026-08-11T13:10:00.000Z",
      authorId: "member-1",
      authorName: "성현",
      content: "로프 액션의 손맛에 대한 아주 긴 논의입니다. ".repeat(30),
      attachments: [],
    };

    const result = extractReferenceMaterials([message]);

    expect(result.items).toEqual([]);
    expect(result.truncated).toBe(false);
  });
});
