export type TranscriptSource = "text" | "voice";

export interface TextMessageRecord {
  id: string;
  channelId: string;
  channelName: string;
  timestamp: string;
  authorId: string;
  authorName: string;
  content: string;
  attachments: TextAttachmentRecord[];
}

export interface TextAttachmentRecord {
  name: string;
  contentType: string | null;
  sizeBytes: number;
}

export interface ReferenceMaterial {
  timestamp: string;
  channelName: string;
  authorName: string;
  note: string;
  urls: string[];
  attachments: TextAttachmentRecord[];
}

export interface VoiceSegment {
  id: string;
  filePath: string;
  userId: string;
  userName: string;
  startedAt: string;
  endedAt: string;
}

export interface TranscriptEntry {
  id: string;
  source: TranscriptSource;
  timestamp: string;
  speakerId: string;
  speaker: string;
  text: string;
  channelId?: string;
  channelName?: string;
}

export interface EvidenceCitation {
  id: string;
  quote: string;
}

export interface EvidencedItem {
  text: string;
  evidence: EvidenceCitation[];
}

export interface RawActionItem {
  owner: string;
  task: string;
  due: string | null;
  evidence: EvidenceCitation[];
}

export interface RawMinutes {
  discussed: EvidencedItem[];
  decided: EvidencedItem[];
  rejected: EvidencedItem[];
  hypotheses: EvidencedItem[];
  actionItems: RawActionItem[];
  blockers: EvidencedItem[];
  nextMeeting: EvidencedItem | null;
}

export interface ActionItem {
  owner: string;
  task: string;
  due: string | null;
}

export interface MinutesDetails {
  discussed: string[];
  decided: string[];
  rejected: string[];
  hypotheses: string[];
  actionItems: ActionItem[];
  blockers: string[];
  nextMeeting: string | null;
}

export interface Minutes extends MinutesDetails {
  summary: string[];
  references: ReferenceMaterial[];
}

export interface MeetingMetadata {
  id: string;
  guildId: string;
  startedAt: string;
  endedAt: string;
  startedBy: string;
  voiceChannelName: string | null;
}
