export type TranscriptSource = "text" | "voice";

export interface TextMessageRecord {
  id: string;
  timestamp: string;
  authorId: string;
  authorName: string;
  content: string;
  attachments: string[];
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
}

export interface EvidencedItem {
  text: string;
  evidenceIds: string[];
}

export interface RawActionItem {
  owner: string;
  task: string;
  due: string | null;
  evidenceIds: string[];
}

export interface RawMinutes {
  discussed: string[];
  decided: EvidencedItem[];
  rejected: EvidencedItem[];
  hypotheses: string[];
  actionItems: RawActionItem[];
  blockers: string[];
  nextMeeting: EvidencedItem | null;
}

export interface ActionItem {
  owner: string;
  task: string;
  due: string | null;
}

export interface Minutes {
  discussed: string[];
  decided: string[];
  rejected: string[];
  hypotheses: string[];
  actionItems: ActionItem[];
  blockers: string[];
  nextMeeting: string | null;
}

export interface MeetingMetadata {
  id: string;
  guildId: string;
  startedAt: string;
  endedAt: string;
  startedBy: string;
  voiceChannelName: string | null;
}
