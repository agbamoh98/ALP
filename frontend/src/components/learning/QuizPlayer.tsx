import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  ChevronLeft,
  ChevronRight,
  EmojiEvents,
  Quiz as QuizIcon,
  Refresh,
} from "@mui/icons-material";
import type { ParsedQuizQuestion } from "../../utils/parseAiJson";
import { quizApi } from "../../api/quizApi";
import {
  GRADIENT_QUIZ,
  QUIZ_SHADOW,
  difficultyStyle,
  formatTypeLabel,
  navIconButtonSx,
} from "./sharedStyles";

interface QuizPlayerProps {
  questions: ParsedQuizQuestion[];
  savedQuizId?: string | null;
}

type Answers = Record<number, string | boolean>;

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function isCorrect(q: ParsedQuizQuestion, answer: string | boolean | undefined): boolean {
  if (answer === undefined || answer === "") return false;
  if (q.type === "multiple_choice") {
    return String(answer).toUpperCase() === String(q.correct_answer ?? "").toUpperCase();
  }
  if (q.type === "true_false") return answer === q.correct_answer;
  const expected = q.expected_answer ?? String(q.correct_answer ?? "");
  return normalizeText(String(answer)) === normalizeText(expected);
}

function ScoreRing({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Box sx={{ position: "relative", width: 140, height: 140, mx: "auto", mb: 2 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke="#fff"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ color: "#fff", lineHeight: 1 }}>
          {pct}%
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
          {score}/{total}
        </Typography>
      </Box>
    </Box>
  );
}

export default function QuizPlayer({ questions, savedQuizId }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);

  if (questions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No valid quiz questions were parsed from the AI response.
      </Typography>
    );
  }

  const q = questions[current];
  const answeredCount = questions.filter((_, i) => answers[i] !== undefined && answers[i] !== "").length;
  const score = submitted
    ? questions.filter((question, i) => isCorrect(question, answers[i])).length
    : 0;

  const setAnswer = (value: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [current]: value }));
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrent(0);
  };

  const handleSubmit = () => {
    const finalScore = questions.filter((question, i) => isCorrect(question, answers[i])).length;
    setSubmitted(true);
    if (savedQuizId) {
      quizApi.saveAttempt(savedQuizId, finalScore, questions.length).catch(() => {});
    }
  };

  if (submitted) {
    const perfect = score === questions.length;
    return (
      <Box sx={{ maxWidth: 560, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            mb: 3,
            background: GRADIENT_QUIZ,
            boxShadow: QUIZ_SHADOW,
            color: "#fff",
          }}
        >
          <EmojiEvents sx={{ fontSize: 40, mb: 1, opacity: 0.95 }} />
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            {perfect ? "Outstanding!" : score >= questions.length / 2 ? "Nice work!" : "Keep practicing!"}
          </Typography>
          <ScoreRing score={score} total={questions.length} />
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
            {perfect
              ? "You nailed every question."
              : "Review the explanations below and try again."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRetry}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            Try Again
          </Button>
        </Paper>

        <Stack spacing={1.5}>
          {questions.map((question, i) => {
            const correct = isCorrect(question, answers[i]);
            return (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: correct ? "rgba(34, 197, 94, 0.35)" : "rgba(239, 68, 68, 0.35)",
                  bgcolor: correct ? "rgba(34, 197, 94, 0.04)" : "rgba(239, 68, 68, 0.04)",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  {correct ? (
                    <CheckCircle sx={{ color: "#22C55E", mt: 0.25 }} />
                  ) : (
                    <Cancel sx={{ color: "#EF4444", mt: 0.25 }} />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={0.75} sx={{ mb: 1 }}>
                      <Chip
                        label={correct ? "Correct" : "Incorrect"}
                        size="small"
                        sx={{
                          bgcolor: correct ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.12)",
                          color: correct ? "#16A34A" : "#DC2626",
                          fontWeight: 600,
                        }}
                      />
                      <Chip label={formatTypeLabel(question.type)} size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, lineHeight: 1.5 }}>
                      {i + 1}. {question.question}
                    </Typography>
                    {question.explanation && (
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {question.explanation}
                      </Typography>
                    )}
                    {!correct && question.type === "short_answer" && question.expected_answer && (
                      <Typography variant="body2" sx={{ mt: 1, color: "primary.main", fontWeight: 500 }}>
                        Expected: {question.expected_answer}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    );
  }

  const diff = difficultyStyle(q.difficulty);
  const selected = answers[current];

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: "rgba(245, 158, 11, 0.12)",
              color: "#F59E0B",
              display: "flex",
            }}
          >
            <QuizIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Quiz Mode
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {answeredCount} of {questions.length} answered
            </Typography>
          </Box>
        </Stack>
        <Typography variant="h6" fontWeight={800} sx={{ color: "#F59E0B" }}>
          {current + 1}
          <Typography component="span" variant="body2" color="text.secondary" fontWeight={500}>
            /{questions.length}
          </Typography>
        </Typography>
      </Box>

      {/* Progress dots */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mb: 2.5, flexWrap: "wrap" }}>
        {questions.map((_, i) => {
          const answered = answers[i] !== undefined && answers[i] !== "";
          return (
            <Box
              key={i}
              onClick={() => setCurrent(i)}
              sx={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: i === current
                  ? "#F59E0B"
                  : answered
                    ? "rgba(34, 197, 94, 0.5)"
                    : "rgba(245, 158, 11, 0.2)",
                transition: "all 0.25s ease",
                cursor: "pointer",
              }}
            />
          );
        })}
      </Box>

      {/* Question card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          boxShadow: QUIZ_SHADOW,
          border: "1px solid rgba(245, 158, 11, 0.12)",
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={formatTypeLabel(q.type)}
            size="small"
            sx={{ bgcolor: "rgba(245, 158, 11, 0.12)", color: "#D97706", fontWeight: 600 }}
          />
          {q.difficulty && (
            <Chip
              label={q.difficulty}
              size="small"
              sx={{ bgcolor: diff.bg, color: diff.color, fontWeight: 600 }}
            />
          )}
        </Stack>

        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, lineHeight: 1.55, fontSize: "1.1rem" }}>
          {q.question}
        </Typography>

        {q.type === "multiple_choice" && q.options && (
          <Stack spacing={1.25}>
            {Object.entries(q.options).map(([key, value]) => {
              const isSelected = selected === key;
              return (
                <Paper
                  key={key}
                  elevation={0}
                  onClick={() => setAnswer(key)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderRadius: 2.5,
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: isSelected ? "rgba(108, 99, 255, 0.08)" : "background.paper",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: isSelected ? "primary.main" : "primary.light",
                      bgcolor: isSelected ? "rgba(108, 99, 255, 0.1)" : "rgba(108, 99, 255, 0.03)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        bgcolor: isSelected ? "primary.main" : "rgba(108, 99, 255, 0.1)",
                        color: isSelected ? "#fff" : "primary.main",
                      }}
                    >
                      {key}
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.5, pt: 0.25 }}>
                      {value}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}

        {q.type === "true_false" && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {(["true", "false"] as const).map((val) => {
              const boolVal = val === "true";
              const isSelected = selected === boolVal;
              const isTrue = val === "true";
              return (
                <Paper
                  key={val}
                  elevation={0}
                  onClick={() => setAnswer(boolVal)}
                  sx={{
                    p: 2.5,
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: isSelected
                      ? isTrue ? "#22C55E" : "#EF4444"
                      : "divider",
                    bgcolor: isSelected
                      ? isTrue ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.08)"
                      : "background.paper",
                    transition: "all 0.2s ease",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                >
                  <Typography variant="h6" fontWeight={800} sx={{ color: isTrue ? "#22C55E" : "#EF4444" }}>
                    {isTrue ? "True" : "False"}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        )}

        {q.type === "short_answer" && (
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Write your answer here…"
            value={(selected as string) ?? ""}
            onChange={(e) => setAnswer(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(108, 99, 255, 0.02)",
              },
            }}
          />
        )}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5 }}>
        <IconButton
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
          sx={navIconButtonSx}
        >
          <ChevronLeft />
        </IconButton>

        {current < questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setCurrent((c) => c + 1)}
            sx={{
              px: 4,
              background: GRADIENT_QUIZ,
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
              "&:hover": { boxShadow: "0 6px 20px rgba(245, 158, 11, 0.45)" },
            }}
          >
            Next Question
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={answeredCount < questions.length}
            sx={{
              px: 4,
              background: GRADIENT_QUIZ,
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
            }}
          >
            Submit Quiz
          </Button>
        )}

        <IconButton
          onClick={() => setCurrent((c) => c + 1)}
          disabled={current === questions.length - 1}
          sx={navIconButtonSx}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {answeredCount < questions.length && current === questions.length - 1 && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          Answer all {questions.length} questions before submitting.
        </Alert>
      )}
    </Box>
  );
}
