/** Extract and parse JSON arrays from AI responses (handles markdown fences). */

export function extractJsonArray(raw: string): unknown[] {
  const trimmed = raw.trim();

  // Direct parse
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through
  }

  // ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    const parsed = JSON.parse(fenceMatch[1].trim());
    if (Array.isArray(parsed)) return parsed;
  }

  // First [ ... ] block in the text
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start !== -1 && end > start) {
    const parsed = JSON.parse(trimmed.slice(start, end + 1));
    if (Array.isArray(parsed)) return parsed;
  }

  throw new Error("Could not parse AI response as JSON array.");
}

export interface ParsedFlashcard {
  front: string;
  back: string;
  difficulty?: string;
  category?: string;
}

export interface ParsedQuizQuestion {
  type: "multiple_choice" | "true_false" | "short_answer";
  question: string;
  options?: Record<string, string>;
  correct_answer?: string | boolean;
  expected_answer?: string;
  explanation?: string;
  difficulty?: string;
}

export function parseFlashcards(raw: string): ParsedFlashcard[] {
  const items = extractJsonArray(raw);
  return items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
    .map((item) => ({
      front: String(item.front ?? ""),
      back: String(item.back ?? ""),
      difficulty: item.difficulty != null ? String(item.difficulty) : undefined,
      category: item.category != null ? String(item.category) : undefined,
    }))
    .filter((c) => c.front && c.back);
}

export function parseQuizQuestions(raw: string): ParsedQuizQuestion[] {
  const items = extractJsonArray(raw);
  return items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
    .map((item) => {
      const type = String(item.type ?? "multiple_choice") as ParsedQuizQuestion["type"];
      const q: ParsedQuizQuestion = {
        type,
        question: String(item.question ?? ""),
        difficulty: item.difficulty != null ? String(item.difficulty) : undefined,
      };
      if (item.options && typeof item.options === "object") {
        q.options = item.options as Record<string, string>;
      }
      if (item.correct_answer !== undefined) q.correct_answer = item.correct_answer as string | boolean;
      if (item.expected_answer != null) q.expected_answer = String(item.expected_answer);
      if (item.explanation != null) q.explanation = String(item.explanation);
      return q;
    })
    .filter((q) => q.question);
}
