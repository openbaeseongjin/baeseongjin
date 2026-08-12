import type { Client, SendableChannels } from "discord.js";
import { splitMarkdown } from "./markdown.js";

const maxDiscordMessages = 20;
const truncationNotice =
  "Minutes were truncated for Discord after 19 message chunks. Review the dated document or source channels for remaining details.";

export class DiscordPublisher {
  constructor(
    private readonly client: Client,
    private readonly channelId: string,
  ) {}

  async publish(markdown: string): Promise<void> {
    const channel = await this.client.channels.fetch(this.channelId);
    if (!channel?.isTextBased() || !("send" in channel)) {
      throw new Error("DISCORD_MINUTES_CHANNEL_ID is not a sendable text channel");
    }
    const sendable = channel as SendableChannels;
    const chunks = splitMarkdown(markdown);
    const publishableChunks =
      chunks.length > maxDiscordMessages
        ? [...chunks.slice(0, maxDiscordMessages - 1), truncationNotice]
        : chunks;
    for (const chunk of publishableChunks) {
      await sendable.send({ content: chunk, allowedMentions: { parse: [] } });
    }
  }
}
