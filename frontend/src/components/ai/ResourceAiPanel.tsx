import { useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  AutoAwesome,
  AutoStories,
  Psychology,
  Quiz,
  Summarize,
} from "@mui/icons-material";
import FlashcardDeck from "../learning/FlashcardDeck";
import QuizPlayer from "../learning/QuizPlayer";
import SummaryDisplay from "../learning/SummaryDisplay";
import TutorChat from "../learning/TutorChat";
import { generateButtonSx, GRADIENT_PRIMARY } from "../learning/sharedStyles";
import {
  aiApi,
  type AiResponse,
  type ChatMessage,
  type Difficulty,
  type QuestionType,
  type SummaryType,
} from "../../api/aiApi";
import { parseFlashcards, parseQuizQuestions } from "../../utils/parseAiJson";

interface ResourceAiPanelProps {
  resourceId: string;
  content: string;
  initialTab?: number;
}

const TAB_ACCENTS = ["#6C63FF", "#22C55E", "#F59E0B", "#FF6584"];

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

function AiMeta({ result }: { result: AiResponse }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block", textAlign: "center" }}>
      {result.model} · {result.totalTokens.toLocaleString()} tokens · {(result.responseTimeMs / 1000).toFixed(1)}s
    </Typography>
  );
}

function Toolbar({ children }: { children: ReactNode }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        bgcolor: "rgba(108, 99, 255, 0.03)",
        border: "1px solid rgba(108, 99, 255, 0.08)",
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {children}
    </Paper>
  );
}

function GenerateBtn({ loading, label, onClick }: { loading: boolean; label: string; onClick: () => void }) {
  return (
    <Button variant="contained" onClick={onClick} disabled={loading} sx={generateButtonSx}>
      {loading ? <CircularProgress size={22} color="inherit" /> : label}
    </Button>
  );
}

function FlashcardResult({ result }: { result: AiResponse }) {
  try {
    return (
      <Box>
        <FlashcardDeck cards={parseFlashcards(result.result)} />
        <AiMeta result={result} />
      </Box>
    );
  } catch {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        Could not parse flashcards — the AI may have returned invalid JSON. Try generating again.
      </Alert>
    );
  }
}

function QuizResult({ result }: { result: AiResponse }) {
  try {
    return (
      <Box>
        <QuizPlayer questions={parseQuizQuestions(result.result)} />
        <AiMeta result={result} />
      </Box>
    );
  } catch {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        Could not parse quiz — the AI may have returned invalid JSON. Try generating again.
      </Alert>
    );
  }
}

function EmptyHint({ text }: { text: string }) {
  return (
    <Box
      sx={{
        py: 6,
        textAlign: "center",
        color: "text.secondary",
        borderRadius: 3,
        border: "2px dashed",
        borderColor: "divider",
        bgcolor: "rgba(108, 99, 255, 0.02)",
      }}
    >
      <AutoAwesome sx={{ fontSize: 36, color: "primary.light", mb: 1 }} />
      <Typography variant="body2">{text}</Typography>
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

  useEffect(() => {
    aiApi.status()
      .then((s: { configured: boolean }) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  const run = async (fn: () => Promise<AiResponse>, onSuccess: (r: AiResponse) => void) => {
    setLoading(true);
    setError(null);
    try {
      onSuccess(await fn());
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    const message = chatInput.trim();
    if (!message) return;
    const historyForApi = chatHistory;
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);
    setError(null);
    aiApi
      .chat({ resourceId, content, message, history: historyForApi })
      .then((result) => setChatHistory((prev) => [...prev, { role: "assistant", content: result.result }]))
      .catch((err: unknown) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  if (configured === null) {
    return (
      <Paper elevation={0} sx={{ mt: 3, p: 5, borderRadius: 4, textAlign: "center", border: "1px solid", borderColor: "divider" }}>
        <CircularProgress size={32} sx={{ color: "primary.main" }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Checking AI service…
        </Typography>
      </Paper>
    );
  }

  if (!configured) {
    return (
      <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
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
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(108, 99, 255, 0.1)",
        border: "1px solid rgba(108, 99, 255, 0.12)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 0,
          background: `linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(255,101,132,0.06) 100%)`,
          borderBottom: "1px solid rgba(108, 99, 255, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: GRADIENT_PRIMARY,
              display: "flex",
              boxShadow: "0 4px 12px rgba(108, 99, 255, 0.3)",
            }}
          >
            <AutoAwesome sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              AI Learning Tools
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Powered by your uploaded material
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              minHeight: 48,
              "&.Mui-selected": { color: TAB_ACCENTS[tab] },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: TAB_ACCENTS[tab],
            },
          }}
        >
          <Tab icon={<Summarize fontSize="small" />} iconPosition="start" label="Summary" />
          <Tab icon={<AutoStories fontSize="small" />} iconPosition="start" label="Flashcards" />
          <Tab icon={<Quiz fontSize="small" />} iconPosition="start" label="Quiz" />
          <Tab icon={<Psychology fontSize="small" />} iconPosition="start" label="AI Tutor" />
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {tab === 0 && (
          <Box>
            <Toolbar>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Summary type</InputLabel>
                <Select value={summaryType} label="Summary type" onChange={(e) => setSummaryType(e.target.value as SummaryType)}>
                  {SUMMARY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <GenerateBtn loading={loading} label="Generate Summary" onClick={() => run(
                () => aiApi.summarize({ resourceId, content, summaryType }),
                setSummaryResult
              )} />
            </Toolbar>
            {summaryResult ? <SummaryDisplay result={summaryResult} /> : (
              <EmptyHint text="Pick a summary style and generate an AI overview of this resource." />
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Toolbar>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Count</InputLabel>
                <Select value={flashcardCount} label="Count" onChange={(e) => setFlashcardCount(Number(e.target.value))}>
                  {[5, 10, 15, 20, 30].map((n) => (
                    <MenuItem key={n} value={n}>{n} cards</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <GenerateBtn loading={loading} label="Generate Flashcards" onClick={() => run(
                () => aiApi.flashcards({ resourceId, content, count: flashcardCount }),
                setFlashcardResult
              )} />
            </Toolbar>
            {flashcardResult ? <FlashcardResult result={flashcardResult} /> : (
              <EmptyHint text="Generate flip cards to study key concepts from this material." />
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Toolbar>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Type</InputLabel>
                <Select value={questionType} label="Type" onChange={(e) => setQuestionType(e.target.value as QuestionType)}>
                  <MenuItem value="multiple_choice">Multiple choice</MenuItem>
                  <MenuItem value="true_false">True / False</MenuItem>
                  <MenuItem value="short_answer">Short answer</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Difficulty</InputLabel>
                <Select value={difficulty} label="Difficulty" onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Count</InputLabel>
                <Select value={quizCount} label="Count" onChange={(e) => setQuizCount(Number(e.target.value))}>
                  {[3, 5, 10, 15].map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <GenerateBtn loading={loading} label="Generate Quiz" onClick={() => run(
                () => aiApi.quiz({ resourceId, content, questionType, difficulty, count: quizCount }),
                setQuizResult
              )} />
            </Toolbar>
            {quizResult ? <QuizResult result={quizResult} /> : (
              <EmptyHint text="Generate an interactive quiz to test your understanding." />
            )}
          </Box>
        )}

        {tab === 3 && (
          <TutorChat
            history={chatHistory}
            input={chatInput}
            loading={loading}
            onInputChange={setChatInput}
            onSend={handleChat}
          />
        )}
      </Box>
    </Paper>
  );
}
