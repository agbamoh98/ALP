import type { UserRole } from "../types";

/** Client-side defaults — must match backend application.yml free-tier values. */
export const FREE_TIER = {
  maxResources: 3,
  maxDecks: 3,
  maxCardsPerDeck: 15,
  maxQuizzes: 3,
  maxQuestionsPerQuiz: 8,
} as const;

export const PREMIUM_TIER = {
  maxResources: 100,
  maxDecks: 50,
  maxCardsPerDeck: 30,
  maxQuizzes: 50,
  maxQuestionsPerQuiz: 15,
} as const;

export function isPremiumTier(role?: UserRole | string | null): boolean {
  return role === "PREMIUM" || role === "ADMIN";
}

export function cardsPerDeckMax(
  fromApi: number | undefined,
  role?: UserRole | string | null,
): number {
  if (fromApi !== undefined) return fromApi;
  return isPremiumTier(role) ? PREMIUM_TIER.maxCardsPerDeck : FREE_TIER.maxCardsPerDeck;
}

export function questionsPerQuizMax(
  fromApi: number | undefined,
  role?: UserRole | string | null,
): number {
  if (fromApi !== undefined) return fromApi;
  return isPremiumTier(role) ? PREMIUM_TIER.maxQuestionsPerQuiz : FREE_TIER.maxQuestionsPerQuiz;
}

export function buildCountOptions(max: number, candidates: number[]): number[] {
  const options = candidates.filter((n) => n <= max);
  return options.length > 0 ? options : [max];
}

export const PREMIUM_SUMMARY_TYPES = ["bullet_points", "key_takeaways"] as const;
