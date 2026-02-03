export type Verdict = 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SlotResult {
  slotName: string;
  verdict: Verdict;
  reasons: string[];
  fileIds: string[];
  fileNames: string[];
}

export interface Clarification {
  slotName: string;
  message: string;
  fileIds: string[];
}

export interface AiAnalysisResult {
  verdict: Verdict;
  riskLevel: RiskLevel;
  whySummary: string;
  slotResults: SlotResult[];
  clarifications: Clarification[];
  analyzedAt: string;
}

export interface AiHistoryEntry {
  id: string;
  verdict: Verdict;
  riskLevel: RiskLevel;
  whySummary: string;
  analyzedAt: string;
}
