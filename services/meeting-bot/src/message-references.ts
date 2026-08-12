import type { ReferenceMaterial, TextMessageRecord } from "./types.js";

const MAX_REFERENCE_ITEMS = 200;
const MAX_URLS_PER_REFERENCE = 20;
const MAX_ATTACHMENTS_PER_REFERENCE = 20;
const MAX_REFERENCE_NOTE_LENGTH = 500;
const MAX_REFERENCE_URL_LENGTH = 500;
const URL_PATTERN = /https?:\/\/[^\s<>()]+/giu;

function isDiscordAttachmentUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      ["cdn.discordapp.com", "media.discordapp.net"].includes(url.hostname.toLowerCase()) &&
      (url.pathname.startsWith("/attachments/") ||
        url.pathname.startsWith("/ephemeral-attachments/"))
    );
  } catch {
    return false;
  }
}

function isDiscordWebhookHostname(hostname: string): boolean {
  return (
    hostname === "discord.com" ||
    hostname.endsWith(".discord.com") ||
    hostname === "discordapp.com" ||
    hostname.endsWith(".discordapp.com")
  );
}

function isSensitiveExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.username || url.password) {
      return true;
    }
    const credentialParameter = /(?:token|key|secret|signature|auth|password|credential|jwt|bearer|session)/iu;
    const standaloneSig = /(?:^|[-_])sig(?:$|[-_])/iu;
    if (
      [...url.searchParams.keys()].some(
        (name) => credentialParameter.test(name) || standaloneSig.test(name) || /^x-amz-/iu.test(name),
      )
    ) {
      return true;
    }
    if (/(?:^|[&#])[^=]*(?:token|key|secret|jwt|auth|password|credential)[^=]*=/iu.test(url.hash)) {
      return true;
    }
    const hostname = url.hostname.toLowerCase();
    return (
      (isDiscordWebhookHostname(hostname) &&
        /^\/api\/(?:v\d+\/)?webhooks\/[^/]+\/[^/]+/iu.test(url.pathname)) ||
      (hostname === "hooks.slack.com" &&
        /^\/(?:services|workflows|triggers)\/[^/]+\/[^/]+/iu.test(url.pathname))
    );
  } catch {
    return true;
  }
}

export function sanitizeReferenceContent(content: string): string {
  return content.replace(URL_PATTERN, (match) => {
    const candidate = match.replace(/[.,;!?]+$/u, "");
    const suffix = match.slice(candidate.length);
    if (isDiscordAttachmentUrl(candidate)) {
      return `[Discord attachment link omitted]${suffix}`;
    }
    if (isSensitiveExternalUrl(candidate)) {
      return `[Sensitive URL omitted]${suffix}`;
    }
    return match;
  });
}

const REFERENCE_ADMISSION_MARKERS = [
  "[Discord attachment link omitted]",
  "[Sensitive URL omitted]",
  "[Oversized URL omitted]",
  "[Additional URL omitted]",
];
const SENSITIVE_OMISSION_MARKERS = [
  "[Sensitive URL omitted]",
  "[Oversized URL omitted]",
  "[Additional URL omitted]",
];

function extractUrlsAndNote(content: string): {
  note: string;
  urls: string[];
  hasOmittedUrl: boolean;
  hasSensitiveOmission: boolean;
} {
  const urls: string[] = [];
  const sanitizedContent = sanitizeReferenceContent(content);
  const normalizedNote = sanitizedContent
    .replace(URL_PATTERN, (match) => {
      const candidate = match.replace(/[.,;!?]+$/u, "");
      if (isSensitiveExternalUrl(candidate)) {
        return "[Sensitive URL omitted]";
      }
      if (candidate.length > MAX_REFERENCE_URL_LENGTH) {
        return "[Oversized URL omitted]";
      }
      if (!urls.includes(candidate) && urls.length >= MAX_URLS_PER_REFERENCE) {
        return "[Additional URL omitted]";
      }
      if (!urls.includes(candidate)) {
        urls.push(candidate);
      }
      return "";
    })
    .replace(/\s+/gu, " ")
    .trim();
  const hasOmittedUrl = REFERENCE_ADMISSION_MARKERS.some((marker) => normalizedNote.includes(marker));
  const hasSensitiveOmission = SENSITIVE_OMISSION_MARKERS.some((marker) => normalizedNote.includes(marker));
  return {
    note: normalizedNote.slice(0, MAX_REFERENCE_NOTE_LENGTH),
    urls,
    hasOmittedUrl,
    hasSensitiveOmission,
  };
}

export function extractReferenceMaterials(messages: TextMessageRecord[]): {
  items: ReferenceMaterial[];
  truncated: boolean;
  itemCapReached: boolean;
  perMessageCapReached: boolean;
  sensitiveUrlOmitted: boolean;
} {
  const items: ReferenceMaterial[] = [];
  let itemCapReached = false;
  let perMessageCapReached = false;
  let sensitiveUrlOmitted = false;

  for (const message of messages) {
    const { note, urls, hasOmittedUrl, hasSensitiveOmission } = extractUrlsAndNote(message.content);
    const attachments = message.attachments.slice(0, MAX_ATTACHMENTS_PER_REFERENCE);
    if (hasSensitiveOmission) {
      sensitiveUrlOmitted = true;
    }
    if (message.attachments.length > MAX_ATTACHMENTS_PER_REFERENCE) {
      perMessageCapReached = true;
    }
    if (urls.length === 0 && attachments.length === 0 && !hasOmittedUrl) {
      continue;
    }
    if (items.length >= MAX_REFERENCE_ITEMS) {
      itemCapReached = true;
      break;
    }
    items.push({
      timestamp: message.timestamp,
      channelName: message.channelName,
      authorName: message.authorName,
      note,
      urls,
      attachments,
    });
  }

  return {
    items,
    truncated: itemCapReached || perMessageCapReached || sensitiveUrlOmitted,
    itemCapReached,
    perMessageCapReached,
    sensitiveUrlOmitted,
  };
}
