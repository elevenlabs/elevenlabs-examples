export interface ResearchState {
  phase: "profile" | "topics" | "research" | "knowledge" | "complete" | null;
  progress: number; // 0-100
  knowledgeBaseId: string | null;
  isComplete: boolean;
  error: string | null;
}

export interface VoiceState {
  isRecorded: boolean;
  voiceId: string | null;
  audioBlob: Blob | null;
  error: string | null;
}

export interface AgentCreationState {
  isCreating: boolean;
  agentId: string | null;
  error: string | null;
}

export interface ProfileInfo {
  type: "twitter" | "linkedin";
  url: string;
  identifier: string;
  displayName: string;
}
