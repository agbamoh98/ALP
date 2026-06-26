// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = "GUEST" | "FREE" | "PREMIUM" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ─── Learning Resources ───────────────────────────────────────────────────────

export type ResourceType = "PDF" | "TEXT";

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  content?: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export type FlashcardDifficulty = "beginner" | "intermediate" | "advanced";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: FlashcardDifficulty;
  category: string;
  resourceId: string;
  userId: string;
  createdAt: string;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: Record<string, string>;
  correctAnswer: string | boolean;
  explanation?: string;
  difficulty: QuizDifficulty;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  resourceId: string;
  userId: string;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface Progress {
  userId: string;
  resourceId: string;
  masteryLevel: number;
  quizzesCompleted: number;
  flashcardsReviewed: number;
  studyTimeMinutes: number;
  lastActivityAt: string;
}
