import { apiClient } from "./axios";

export type SummaryType =
  | "short_summary"
  | "detailed_summary"
  | "beginner_summary"
  | "advanced_summary"
  | "bullet_points"
  | "key_takeaways";

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type Difficulty = "easy" | "medium" | "hard";

export interface AiResponse {
  result: string;
  model: string;
  promptVersion: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  responseTimeMs: number;
}

export interface AiStatus {
  configured: boolean;
  provider: string;
  model: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const aiApi = {
  status: async (): Promise<AiStatus> => {
    const res = await apiClient.get<AiStatus>("/api/ai/status");
    return res.data;
  },

  summarize: async (params: {
    resourceId?: string;
    content: string;
    summaryType: SummaryType;
  }): Promise<AiResponse> => {
    const res = await apiClient.post<AiResponse>("/api/ai/summarize", params);
    return res.data;
  },

  flashcards: async (params: {
    resourceId?: string;
    content: string;
    count?: number;
  }): Promise<AiResponse> => {
    const res = await apiClient.post<AiResponse>("/api/ai/flashcards", params);
    return res.data;
  },

  quiz: async (params: {
    resourceId?: string;
    content: string;
    questionType?: QuestionType;
    difficulty?: Difficulty;
    count?: number;
  }): Promise<AiResponse> => {
    const res = await apiClient.post<AiResponse>("/api/ai/quizzes", params);
    return res.data;
  },

  chat: async (params: {
    resourceId?: string;
    content: string;
    message: string;
    history?: ChatMessage[];
  }): Promise<AiResponse> => {
    const res = await apiClient.post<AiResponse>("/api/ai/chat", params);
    return res.data;
  },
};
