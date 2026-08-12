import type { Client, Message } from "discord.js";
import { sanitizeReferenceContent } from "./message-references.js";
import type { TextMessageRecord } from "./types.js";

const HISTORY_PAGE_SIZE = 100;
const MAX_HISTORY_PAGES_PER_CHANNEL = 50;
const HISTORY_FAILURE_WARNING =
  "Message history reconciliation failed for one capture channel; live capture was retained.";
const HISTORY_INCOMPLETE_WARNING =
  "Message history reconciliation was incomplete for one capture channel; live capture was retained.";
const DISCORD_EPOCH_MS = 1_420_070_400_000n;

interface ReconcileMeetingMessagesOptions {
  guildId: string;
  captureChannelIds: string[];
  startedAt: Date;
  endedAt: Date;
  liveMessages: TextMessageRecord[];
  maxMessages: number;
}

export interface ReconciledMessages {
  messages: TextMessageRecord[];
  warnings: string[];
}

export function discordMessageRecord(message: Message): TextMessageRecord | null {
  const content = sanitizeReferenceContent(message.content).trim();
  const attachments = [...message.attachments.values()].map((attachment) => ({
    name: attachment.name ?? "unnamed file",
    contentType: attachment.contentType ?? null,
    sizeBytes: attachment.size,
  }));
  if (message.author.bot || (!content && attachments.length === 0)) {
    return null;
  }
  return {
    id: message.id,
    channelId: message.channelId,
    channelName:
      "name" in message.channel && typeof message.channel.name === "string"
        ? message.channel.name
        : "unknown-channel",
    timestamp: message.createdAt.toISOString(),
    authorId: message.author.id,
    authorName: message.member?.displayName ?? message.author.displayName,
    content,
    attachments,
  };
}

async function fetchChannelMessages(
  client: Pick<Client, "channels">,
  channelId: string,
  options: ReconcileMeetingMessagesOptions,
): Promise<{ records: TextMessageRecord[]; complete: boolean }> {
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased() || !("messages" in channel)) {
    throw new Error("Capture channel does not expose message history");
  }

  const records: TextMessageRecord[] = [];
  let before = (
    (BigInt(options.endedAt.getTime() + 1) - DISCORD_EPOCH_MS) << 22n
  ).toString();
  let complete = false;
  for (let pageIndex = 0; pageIndex < MAX_HISTORY_PAGES_PER_CHANNEL; pageIndex += 1) {
    const page = await channel.messages.fetch({ limit: HISTORY_PAGE_SIZE, before });
    const messages = [...page.values()];
    if (messages.length === 0) {
      complete = true;
      break;
    }
    messages.sort((left, right) => right.createdTimestamp - left.createdTimestamp);
    for (const message of messages) {
      if (
        message.guildId !== options.guildId ||
        message.createdAt < options.startedAt ||
        message.createdAt > options.endedAt
      ) {
        continue;
      }
      const record = discordMessageRecord(message);
      if (record) {
        records.push(record);
      }
    }
    const oldest = messages.at(-1);
    if (!oldest || oldest.createdAt <= options.startedAt || messages.length < HISTORY_PAGE_SIZE) {
      complete = true;
      break;
    }
    before = oldest.id;
  }
  return { records, complete };
}

export async function reconcileMeetingMessages(
  client: Pick<Client, "channels">,
  options: ReconcileMeetingMessagesOptions,
): Promise<ReconciledMessages> {
  const successfulChannels = new Set<string>();
  const historyRecords: TextMessageRecord[] = [];
  let historyFailed = false;
  let historyIncomplete = false;

  for (const channelId of options.captureChannelIds) {
    try {
      const channelHistory = await fetchChannelMessages(client, channelId, options);
      historyRecords.push(...channelHistory.records);
      if (channelHistory.complete) {
        successfulChannels.add(channelId);
      } else {
        historyIncomplete = true;
      }
    } catch {
      historyFailed = true;
    }
  }

  const recordsById = new Map<string, TextMessageRecord>();
  for (const message of options.liveMessages) {
    if (!successfulChannels.has(message.channelId)) {
      recordsById.set(message.id, message);
    }
  }
  for (const message of historyRecords) {
    recordsById.set(message.id, message);
  }
  const allMessages = [...recordsById.values()].sort(
    (left, right) => left.timestamp.localeCompare(right.timestamp) || left.id.localeCompare(right.id),
  );
  const messages = allMessages.slice(-options.maxMessages);
  const warnings = [
    ...(historyFailed ? [HISTORY_FAILURE_WARNING] : []),
    ...(historyIncomplete ? [HISTORY_INCOMPLETE_WARNING] : []),
    ...(allMessages.length > options.maxMessages
      ? ["The reconciled text message capture limit was reached."]
      : []),
  ];
  return { messages, warnings };
}
