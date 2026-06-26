/** Shared visual tokens for learning components */

export const GRADIENT_PRIMARY = "linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)";
export const GRADIENT_QUIZ = "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)";
export const GRADIENT_TUTOR = "linear-gradient(135deg, #FF6584 0%, #FF94AB 100%)";
export const GRADIENT_SUMMARY = "linear-gradient(135deg, #6C63FF 0%, #9D97FF 50%, #FF6584 100%)";
export const GRADIENT_DARK = "linear-gradient(145deg, #1A1A2E 0%, #2D2B55 100%)";

export const CARD_SHADOW = "0 12px 40px rgba(108, 99, 255, 0.12), 0 4px 12px rgba(0,0,0,0.04)";
export const QUIZ_SHADOW = "0 12px 40px rgba(245, 158, 11, 0.15), 0 4px 12px rgba(0,0,0,0.04)";

export const navIconButtonSx = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  "&:hover": { bgcolor: "rgba(108, 99, 255, 0.06)" },
  "&.Mui-disabled": { opacity: 0.4 },
} as const;

export const generateButtonSx = {
  px: 3,
  background: GRADIENT_PRIMARY,
  boxShadow: "0 4px 14px rgba(108, 99, 255, 0.35)",
  "&:hover": {
    boxShadow: "0 6px 20px rgba(108, 99, 255, 0.45)",
  },
} as const;

export const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  easy: { bg: "rgba(34, 197, 94, 0.15)", color: "#16A34A" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", color: "#D97706" },
  hard: { bg: "rgba(239, 68, 68, 0.12)", color: "#DC2626" },
  beginner: { bg: "rgba(34, 197, 94, 0.15)", color: "#16A34A" },
  intermediate: { bg: "rgba(245, 158, 11, 0.15)", color: "#D97706" },
  advanced: { bg: "rgba(239, 68, 68, 0.12)", color: "#DC2626" },
};

export function difficultyStyle(level?: string) {
  if (!level) return { bg: "rgba(108, 99, 255, 0.12)", color: "#6C63FF" };
  return DIFFICULTY_COLORS[level.toLowerCase()] ?? DIFFICULTY_COLORS.easy;
}

export function formatTypeLabel(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
