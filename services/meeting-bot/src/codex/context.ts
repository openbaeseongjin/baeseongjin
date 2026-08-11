export interface DiscordContextMessage {
    id: string;
    createdAt: Date;
    authorName: string;
    content: string;
    attachmentNames: string[];
}

function clean(value: string, maxLength: number): string {
    return value
        .replace(/[\u0000-\u001f\u007f]/gu, " ")
        .replace(/<\/discord-context>/giu, "[removed closing marker]")
        .replace(/\s+/gu, " ")
        .trim()
        .slice(0, maxLength);
}

export function buildDiscordContext(
    messages: DiscordContextMessage[],
    maxMessages: number,
    maxCharacters: number
): string {
    const boundedMessages = [...messages]
        .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
        .slice(-Math.max(0, maxMessages));
    const lines = boundedMessages.map((message) => {
        const author = clean(message.authorName, 100) || "Unknown member";
        const content = clean(message.content, 2_000) || "[no text]";
        const attachments = message.attachmentNames
            .map((name) => clean(name, 200))
            .filter(Boolean)
            .join(", ");
        return [
            `[${message.createdAt.toISOString()}] ${author}: ${content}`,
            ...(attachments ? [`Attachments: ${attachments}`] : [])
        ].join("\n");
    });
    const opening = '<discord-context trust="untrusted-data">';
    const closing = "</discord-context>";
    const available = Math.max(0, maxCharacters - opening.length - closing.length - 2);
    const body = lines.join("\n").slice(-available);
    return `${opening}\n${body}\n${closing}`.slice(0, maxCharacters);
}
