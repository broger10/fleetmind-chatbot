// --- Agent Types ---

export type AgentType = 'dispatch' | 'compliance' | 'support';

export const AGENT_COLORS: Record<AgentType, string> = {
  dispatch: '#3B82F6',     // blu
  compliance: '#F59E0B',   // ambra
  support: '#22C55E',      // verde
} as const;

export const AGENT_NAMES: Record<AgentType, string> = {
  dispatch: 'FleetMind Dispatch',
  compliance: 'FleetMind Compliance',
  support: 'FleetMind Support',
} as const;

// --- Manager Response ---

export interface ManagerResponse {
  agent: AgentType;
  reason: string;
}

// --- Chat Message ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: AgentType;
}

// --- API Request/Response ---

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  currentAgent: AgentType | null;
}

// --- KB Filenames ---

export const KB_FILES: Record<'shared' | AgentType, string> = {
  shared: 'shared-kb.md',
  dispatch: 'dispatch-kb.md',
  compliance: 'compliance-kb.md',
  support: 'support-kb.md',
} as const;

// --- Config ---

export const MAX_HISTORY_LENGTH = 20;
export const MAX_MESSAGE_LENGTH = 2000;
