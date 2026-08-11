import type { Client, SendableChannels } from "discord.js";
import { splitMarkdown } from "./markdown.js";

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
    for (const chunk of splitMarkdown(markdown)) {
      await sendable.send({ content: chunk, allowedMentions: { parse: [] } });
    }
  }
}
