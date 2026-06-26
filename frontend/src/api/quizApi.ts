import { apiClient } from "./axios";

export interface QuizSummary {
  id: string;
  resourceId: string;
  title: string;
  questionType?: string;
  difficulty?: string;
  questionCount: number;
  createdAt: string;
}

export interface QuizDetail extends QuizSummary {
  questions: {
    id: string;
    type: string;
    question: string;
    options?: Record<string, string>;
    correctAnswer?: string | boolean;
    expectedAnswer?: string;
    explanation?: string;
    difficulty?: string;
    sortOrder: number;
  }[];
}

export const quizApi = {
  saveQuiz: async (params: {
    resourceId: string;
    title?: string;
    questionType?: string;
    difficulty?: string;
    questions: {
      type: string;
      question: string;
      options?: Record<string, string>;
      correctAnswer?: string | boolean;
      expectedAnswer?: string;
      explanation?: string;
      difficulty?: string;
    }[];
  }): Promise<QuizDetail> => {
    const res = await apiClient.post<QuizDetail>("/api/quizzes/", params);
    return res.data;
  },

  listQuizzes: async (resourceId: string): Promise<QuizSummary[]> => {
    const res = await apiClient.get<QuizSummary[]>("/api/quizzes/", {
      params: { resourceId },
    });
    return res.data;
  },

  getQuiz: async (id: string): Promise<QuizDetail> => {
    const res = await apiClient.get<QuizDetail>(`/api/quizzes/${id}`);
    return res.data;
  },

  deleteQuiz: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/quizzes/${id}`);
  },

  count: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>("/api/quizzes/count");
    return res.data.count;
  },

  saveAttempt: async (quizId: string, score: number, totalQuestions: number): Promise<void> => {
    await apiClient.post(`/api/quizzes/${quizId}/attempts`, { score, totalQuestions });
  },

  attemptCount: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>("/api/quizzes/attempts/count");
    return res.data.count;
  },

  limits: async (): Promise<{
    plan: string;
    quizzesUsed: number;
    quizzesMax: number;
    questionsPerQuizMax: number;
  }> => {
    const res = await apiClient.get("/api/quizzes/limits");
    return res.data;
  },
};
