import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  AutoStories,
  Psychology,
  Quiz,
  Summarize,
} from "@mui/icons-material";
import {
  aiApi,
  type AiResponse,
  type ChatMessage,
  type Difficulty,
  type QuestionType,
  type SummaryType,
} from "../../api/aiApi";

interface ResourceAiPanelProps {
  resourceId: string;
  content: string;
  initialTab?: number;
}

const SUMMARY_OPTIONS: { value: SummaryType; label: string }[] = [
  { value: "short_summary", label: "Short summary" },
  { value: "detailed_summary", label: "Detailed summary" },
  { value: "beginner_summary", label: "Beginner-friendly" },
  { value: "advanced_summary", label: "Advanced" },
  { value: "bullet_points", label: "Bullet points" },
  { value: "key_takeaways", label: "Key takeaways" },
];

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return data.message;
  }
  return "Something went wrong. Please try again.";
}

function ResultBlock({ result, meta }: { result: AiResponse; meta?: boolean }) {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: 1.7,
          fontSize: "0.95rem",
        }}
      >
        {result.result}
      </Paper>
      {meta && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {result.model} · {result.totalTokens.toLocaleString()} tokens · {(result.responseTimeMs / 1000).toFixed(1)}s
        </Typography>
      )}
    </Box>
  );
}

export default function ResourceAiPanel({ resourceId, content, initialTab = 0 }: ResourceAiPanelProps) {
  const [tab, setTab] = useState(initialTab);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summaryType, setSummaryType] = useState<SummaryType>("short_summary");
  const [summaryResult, setSummaryResult] = useState<AiResponse | null>(null);

  const [flashcardCount, setFlashcardCount] = useState(10);
  const [flashcardResult, setFlashcardResult] = useState<AiResponse | null>(null);

  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [quizCount, setQuizCount] = useState(5);
  const [quizResult, setQuizResult] = useState<AiResponse | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiApi.status()
      .then((s: { configured: boolean }) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const run = async (fn: () => Promise<AiResponse>, onSuccess: (r: AiResponse) => void) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      onSuccess(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = () =>
    run(
      () => aiApi.summarize({ resourceId, content, summaryType }),
      setSummaryResult
    );

  const handleFlashcards = () =>
    run(
      () => aiApi.flashcards({ resourceId, content, count: flashcardCount }),
      setFlashcardResult
    );

  const handleQuiz = () =>
    run(
      () => aiApi.quiz({ resourceId, content, questionType, difficulty, count: quizCount }),
      setQuizResult
    );

  const handleChat = () => {
    const message = chatInput.trim();
    if (!message) return;

    const userMsg: ChatMessage = { role: "user", content: message };
    const historyForApi = chatHistory;
    setChatInput("");
    setChatHistory((prev) => [...prev, userMsg]);

    setLoading(true);
    setError(null);
    aiApi
      .chat({ resourceId, content, message, history: historyForApi })
      .then((result: AiResponse) => {
        setChatHistory((prev) => [...prev, { role: "assistant", content: result.result }]);
      })
      .catch((err: unknown) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  if (configured === null) {
    return (
      <Paper elevation={0} sx={{ mt: 3, p: 4, border: "1px solid", borderColor: "divider", borderRadius: 3, textAlign: "center" }}>
        <CircularProgress size={28} />
      </Paper>
    );
  }

  if (!configured) {
    return (
      <Alert severity="warning" sx={{ mt: 3 }}>
        AI features are not configured. Add your <code>OPENAI_API_KEY</code> to{" "}
        <code>services/ai-service/.env</code> and restart the AI service.
      </Alert>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: "divider", bgcolor: "rgba(108, 99, 255, 0.03)" }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ px: 1, pt: 1.5, pb: 0.5 }}>
          AI Learning Tools
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Summarize fontSize="small" />} iconPosition="start" label="Summary" />
          <Tab icon={<AutoStories fontSize="small" />} iconPosition="start" label="Flashcards" />
          <Tab icon={<Quiz fontSize="small" />} iconPosition="start" label="Quiz" />
          <Tab icon={<Psychology fontSize="small" />} iconPosition="start" label="AI Tutor" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {tab === 0 && (
          <Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Summary type</InputLabel>
                <Select
                  value={summaryType}
                  label="Summary type"
                  onChange={(e) => setSummaryType(e.target.value as SummaryType)}
                >
                  {SUMMARY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleSummarize} disabled={loading}>
                {loading ? <CircularProgress size={22} color="inherit" /> : "Generate Summary"}
              </Button>
            </Box>
            {summaryResult && <ResultBlock result={summaryResult} meta />}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Count</InputLabel>
                <Select
                  value={flashcardCount}
                  label="Count"
                  onChange={(e) => setFlashcardCount(Number(e.target.value))}
                >
                  {[5, 10, 15, 20, 30].map((n) => (
                    <MenuItem key={n} value={n}>{n} cards</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleFlashcards} disabled={loading}>
                {loading ? <CircularProgress size={22} color="inherit" /> : "Generate Flashcards"}
              </Button>
            </Box>
            {flashcardResult && <ResultBlock result={flashcardResult} meta />}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={questionType}
                  label="Type"
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                >
                  <MenuItem value="multiple_choice">Multiple choice</MenuItem>
                  <MenuItem value="true_false">True / False</MenuItem>
                  <MenuItem value="short_answer">Short answer</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={difficulty}
                  label="Difficulty"
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Count</InputLabel>
                <Select
                  value={quizCount}
                  label="Count"
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                >
                  {[3, 5, 10, 15].map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleQuiz} disabled={loading}>
                {loading ? <CircularProgress size={22} color="inherit" /> : "Generate Quiz"}
              </Button>
            </Box>
            {quizResult && <ResultBlock result={quizResult} meta />}
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Box
              sx={{
                maxHeight: 360,
                overflow: "auto",
                mb: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {chatHistory.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  Ask anything about this resource. The AI Tutor uses the document as context.
                </Typography>
              )}
              {chatHistory.map((msg, i) => (
                <Box
                  key={i}
                  sx={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <Chip
                    label={msg.role === "user" ? "You" : "Tutor"}
                    size="small"
                    sx={{ mb: 0.5, fontSize: "0.7rem" }}
                    color={msg.role === "user" ? "primary" : "default"}
                  />
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: msg.role === "user" ? "rgba(108, 99, 255, 0.08)" : "grey.50",
                      borderRadius: 2,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.content}
                  </Paper>
                </Box>
              ))}
              {loading && tab === 3 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">Thinking…</Typography>
                </Box>
              )}
              <div ref={chatEndRef} />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask a question about this material…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChat();
                  }
                }}
                disabled={loading}
                multiline
                maxRows={3}
              />
              <Button variant="contained" onClick={handleChat} disabled={loading || !chatInput.trim()} sx={{ minWidth: 88 }}>
                Send
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
