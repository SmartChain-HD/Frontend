import { apiClient } from './client';
import type { BaseResponse } from '../types/api.types';

// ============================================
// Request / Response Types
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  file_id?: number;
  history?: ChatMessage[];
  domain?: 'safety' | 'compliance' | 'esg' | 'all';
  doc_name?: string;
  top_k?: number;
  session_id?: string;
}

export interface SourceItem {
  title: string;
  type: 'manual' | 'code' | 'law';
  snippet: string;
  score: number;
  loc: {
    page: number | null;
    lineStart: number | null;
  };
}

export interface ChatResponseData {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  notes: string | null;
  sources: SourceItem[];
  session_id?: string;
}

// ============================================
// API Functions
// ============================================

export const sendChat = async (request: ChatRequest): Promise<ChatResponseData> => {
  const response = await apiClient.post<BaseResponse<ChatResponseData>>(
    '/v1/chat',
    request,
    { timeout: 60000 },
  );
  return response.data.data;
};
