import { apiClient } from "./axios";

export interface DeckSummary {
  id: string;
  resourceId: string;
  title: string;
  cardCount: number;
  createdAt: string;
}

export interface DeckDetail extends DeckSummary {
  cards: {
    id: string;
    front: string;
    back: string;
    difficulty?: string;
    category?: string;
    sortOrder: number;
  }[];
}

export const flashcardApi = {
  saveDeck: async (params: {
    resourceId: string;
    title?: string;
    cards: { front: string; back: string; difficulty?: string; category?: string }[];
  }): Promise<DeckDetail> => {
    const res = await apiClient.post<DeckDetail>("/api/flashcards/decks", params);
    return res.data;
  },

  listDecks: async (resourceId: string): Promise<DeckSummary[]> => {
    const res = await apiClient.get<DeckSummary[]>("/api/flashcards/decks", {
      params: { resourceId },
    });
    return res.data;
  },

  getDeck: async (id: string): Promise<DeckDetail> => {
    const res = await apiClient.get<DeckDetail>(`/api/flashcards/decks/${id}`);
    return res.data;
  },

  deleteDeck: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/flashcards/decks/${id}`);
  },

  count: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>("/api/flashcards/count");
    return res.data.count;
  },

  limits: async (): Promise<{
    plan: string;
    decksUsed: number;
    decksMax: number;
    cardsPerDeckMax: number;
  }> => {
    const res = await apiClient.get("/api/flashcards/limits");
    return res.data;
  },
};
