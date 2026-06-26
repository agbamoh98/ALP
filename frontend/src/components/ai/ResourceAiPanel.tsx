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
import SavedItemsBar from "../learning/SavedItemsBar";
import { generateButtonSx, GRADIENT_PRIMARY } from "../learning/sharedStyles";
import { useAuth } from "../../context/AuthContext";
import { flashcardApi, type DeckSummary } from "../../api/flashcardApi";
import { quizApi, type QuizSummary } from "../../api/quizApi";
import {
  buildCountOptions,
  cardsPerDeckMax,
  FREE_TIER,
  isPremiumTier,
  PREMIUM_TIER,
  PREMIUM_SUMMARY_TYPES,
  questionsPerQuizMax,
} from "../../utils/planLimits";
import {
  aiApi,
  type AiResponse,
  type ChatMessage,
  type Difficulty,
  type QuestionType,
  type SummaryType,
} from "../../api/aiApi";
import {
  parseFlashcards,
  parseQuizQuestions,
  type ParsedFlashcard,
  type ParsedQuizQuestion,
} from "../../utils/parseAiJson";

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

function GenerateBtn({ loading, label, onClick, disabled }: { loading: boolean; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Button variant="contained" onClick={onClick} disabled={loading || disabled} sx={generateButtonSx}>
      {loading ? <CircularProgress size={22} color="inherit" /> : label}
    </Button>
  );
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
  const { user } = useAuth();
  const isPremium = isPremiumTier(user?.role);

  const [tab, setTab] = useState(initialTab);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summaryType, setSummaryType] = useState<SummaryType>("short_summary");
  const [summaryResult, setSummaryResult] = useState<AiResponse | null>(null);

  const [flashcardCount, setFlashcardCount] = useState(10);
  const [flashcardResult, setFlashcardResult] = useState<AiResponse | null>(null);
  const [activeFlashcards, setActiveFlashcards] = useState<ParsedFlashcard[]>([]);
  const [savedDecks, setSavedDecks] = useState<DeckSummary[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [deckSaved, setDeckSaved] = useState(false);
  const [savingDeck, setSavingDeck] = useState(false);
  const [deckLimits, setDeckLimits] = useState<{
    decksUsed: number;
    decksMax: number;
    cardsPerDeckMax: number;
  } | null>(null);

  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [quizCount, setQuizCount] = useState(5);
  const [quizResult, setQuizResult] = useState<AiResponse | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<ParsedQuizQuestion[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<QuizSummary[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizSaved, setQuizSaved] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizLimits, setQuizLimits] = useState<{
    quizzesUsed: number;
    quizzesMax: number;
    questionsPerQuizMax: number;
  } | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const loadSavedLists = () => {
    flashcardApi.listDecks(resourceId).then(setSavedDecks).catch(() => setSavedDecks([]));
    quizApi.listQuizzes(resourceId).then(setSavedQuizzes).catch(() => setSavedQuizzes([]));

    flashcardApi.limits()
      .then((l) => setDeckLimits({
        decksUsed: l.decksUsed,
        decksMax: l.decksMax,
        cardsPerDeckMax: l.cardsPerDeckMax,
      }))
      .catch(async () => {
        const count = await flashcardApi.count().catch(() => 0);
        setDeckLimits({
          decksUsed: count,
          decksMax: isPremium ? PREMIUM_TIER.maxDecks : FREE_TIER.maxDecks,
          cardsPerDeckMax: isPremium ? PREMIUM_TIER.maxCardsPerDeck : FREE_TIER.maxCardsPerDeck,
        });
      });

    quizApi.limits()
      .then((l) => setQuizLimits({
        quizzesUsed: l.quizzesUsed,
        quizzesMax: l.quizzesMax,
        questionsPerQuizMax: l.questionsPerQuizMax,
      }))
      .catch(async () => {
        const count = await quizApi.count().catch(() => 0);
        setQuizLimits({
          quizzesUsed: count,
          quizzesMax: isPremium ? PREMIUM_TIER.maxQuizzes : FREE_TIER.maxQuizzes,
          questionsPerQuizMax: isPremium ? PREMIUM_TIER.maxQuestionsPerQuiz : FREE_TIER.maxQuestionsPerQuiz,
        });
      });
  };

  const cardsMax = cardsPerDeckMax(deckLimits?.cardsPerDeckMax, user?.role);
  const questionsMax = questionsPerQuizMax(quizLimits?.questionsPerQuizMax, user?.role);

  const flashcardCountOptions = buildCountOptions(cardsMax, [5, 10, 15, 20, 30]);
  const quizCountOptions = buildCountOptions(questionsMax, [3, 5, 8, 10, 15]);

  const deckAtLimit = deckLimits !== null && deckLimits.decksUsed >= deckLimits.decksMax;
  const quizAtLimit = quizLimits !== null && quizLimits.quizzesUsed >= quizLimits.quizzesMax;

  useEffect(() => {
    if (!isPremium && PREMIUM_SUMMARY_TYPES.includes(summaryType as typeof PREMIUM_SUMMARY_TYPES[number])) {
      setSummaryType("short_summary");
    }
  }, [isPremium, summaryType]);

  const summaryOptions = isPremium
    ? SUMMARY_OPTIONS
    : SUMMARY_OPTIONS.filter((o) => !PREMIUM_SUMMARY_TYPES.includes(o.value as typeof PREMIUM_SUMMARY_TYPES[number]));

  useEffect(() => {
    aiApi.status()
      .then((s: { configured: boolean }) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    if (configured) loadSavedLists();
  }, [resourceId, configured]);

  useEffect(() => {
    if (flashcardCount > cardsMax) {
      setFlashcardCount(flashcardCountOptions[flashcardCountOptions.length - 1]);
    }
  }, [cardsMax, flashcardCount, flashcardCountOptions]);

  useEffect(() => {
    if (quizCount > questionsMax) {
      setQuizCount(quizCountOptions[quizCountOptions.length - 1]);
    }
  }, [questionsMax, quizCount, quizCountOptions]);

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

  const saveDeck = async (cards: ParsedFlashcard[] = activeFlashcards) => {
    if (cards.length === 0) return;
    setSavingDeck(true);
    try {
      const deck = await flashcardApi.saveDeck({
        resourceId,
        title: `Deck · ${cards.length} cards`,
        cards,
      });
      setDeckSaved(true);
      setSelectedDeckId(deck.id);
      loadSavedLists();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingDeck(false);
    }
  };

  const saveQuiz = async (questions: ParsedQuizQuestion[] = activeQuestions) => {
    if (questions.length === 0) return;
    setSavingQuiz(true);
    try {
      const quiz = await quizApi.saveQuiz({
        resourceId,
        title: `Quiz · ${questions.length} questions`,
        questionType,
        difficulty,
        questions: questions.map((q) => ({
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
          expectedAnswer: q.expected_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
        })),
      });
      setQuizSaved(true);
      setSelectedQuizId(quiz.id);
      loadSavedLists();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingQuiz(false);
    }
  };

  const generateFlashcards = async () => {
    if (deckAtLimit) {
      setError(`Plan limit reached: maximum ${deckLimits?.decksMax ?? 3} saved decks. Delete one to generate more.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.flashcards({ resourceId, content, count: flashcardCount });
      setFlashcardResult(result);
      setDeckSaved(false);
      setSelectedDeckId(null);
      let cards: ParsedFlashcard[];
      try {
        cards = parseFlashcards(result.result);
      } catch {
        setActiveFlashcards([]);
        setError("Could not parse flashcards from AI response.");
        return;
      }
      setActiveFlashcards(cards);
      if (!isPremium) {
        await saveDeck(cards);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (quizAtLimit) {
      setError(`Plan limit reached: maximum ${quizLimits?.quizzesMax ?? 3} saved quizzes. Delete one to generate more.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.quiz({ resourceId, content, questionType, difficulty, count: quizCount });
      setQuizResult(result);
      setQuizSaved(false);
      setSelectedQuizId(null);
      let questions: ParsedQuizQuestion[];
      try {
        questions = parseQuizQuestions(result.result);
      } catch {
        setActiveQuestions([]);
        setError("Could not parse quiz from AI response.");
        return;
      }
      setActiveQuestions(questions);
      if (!isPremium) {
        await saveQuiz(questions);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadDeck = async (deckId: string) => {
    try {
      const deck = await flashcardApi.getDeck(deckId);
      setSelectedDeckId(deckId);
      setDeckSaved(true);
      setFlashcardResult(null);
      setActiveFlashcards(deck.cards.map((c) => ({
        front: c.front,
        back: c.back,
        difficulty: c.difficulty,
        category: c.category,
      })));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const deleteDeck = async (deckId: string) => {
    try {
      await flashcardApi.deleteDeck(deckId);
      if (selectedDeckId === deckId) {
        setSelectedDeckId(null);
        setActiveFlashcards([]);
        setDeckSaved(false);
      }
      loadSavedLists();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const loadQuiz = async (quizId: string) => {
    try {
      const quiz = await quizApi.getQuiz(quizId);
      setSelectedQuizId(quizId);
      setQuizSaved(true);
      setQuizResult(null);
      setActiveQuestions(quiz.questions.map((q) => ({
        type: q.type as ParsedQuizQuestion["type"],
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        expected_answer: q.expectedAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      await quizApi.deleteQuiz(quizId);
      if (selectedQuizId === quizId) {
        setSelectedQuizId(null);
        setActiveQuestions([]);
        setQuizSaved(false);
      }
      loadSavedLists();
    } catch (err) {
      setError(extractErrorMessage(err));
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
            {!isPremium && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Free plan includes short, detailed, beginner, and advanced summaries. Upgrade to Premium for bullet points and key takeaways.
              </Alert>
            )}
            <Toolbar>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Summary type</InputLabel>
                <Select value={summaryType} label="Summary type" onChange={(e) => setSummaryType(e.target.value as SummaryType)}>
                  {summaryOptions.map((o) => (
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
                  {flashcardCountOptions.map((n) => (
                    <MenuItem key={n} value={n}>{n} cards</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <GenerateBtn
                loading={loading}
                disabled={deckAtLimit}
                label={deckAtLimit ? "Deck limit reached" : "Generate Flashcards"}
                onClick={generateFlashcards}
              />
            </Toolbar>
            {!isPremium && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Free plan: flashcards are auto-saved when generated (max {deckLimits?.decksMax ?? 3} decks, {cardsMax} cards each).
              </Alert>
            )}
            <SavedItemsBar
              label="Decks"
              items={savedDecks.map((d) => ({
                id: d.id,
                title: d.title,
                count: d.cardCount,
                createdAt: d.createdAt,
              }))}
              selectedId={selectedDeckId}
              saving={savingDeck}
              saved={deckSaved}
              autoSave={!isPremium}
              canSave={
                activeFlashcards.length > 0
                && activeFlashcards.length <= cardsMax
              }
              used={deckLimits?.decksUsed}
              max={deckLimits?.decksMax}
              perItemMax={cardsMax}
              perItemLabel="cards per deck"
              onSelect={loadDeck}
              onSave={() => saveDeck()}
              onDelete={deleteDeck}
              onRefresh={loadSavedLists}
            />
            {activeFlashcards.length > 0 ? (
              <Box>
                <FlashcardDeck cards={activeFlashcards} />
                {flashcardResult && <AiMeta result={flashcardResult} />}
              </Box>
            ) : (
              <EmptyHint text="Generate flip cards or load a saved deck to study." />
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
                  {quizCountOptions.map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <GenerateBtn
                loading={loading}
                disabled={quizAtLimit}
                label={quizAtLimit ? "Quiz limit reached" : "Generate Quiz"}
                onClick={generateQuiz}
              />
            </Toolbar>
            {!isPremium && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Free plan: quizzes are auto-saved when generated (max {quizLimits?.quizzesMax ?? 3} quizzes, {questionsMax} questions each).
              </Alert>
            )}
            <SavedItemsBar
              label="Quizzes"
              items={savedQuizzes.map((q) => ({
                id: q.id,
                title: q.title,
                count: q.questionCount,
                createdAt: q.createdAt,
              }))}
              selectedId={selectedQuizId}
              saving={savingQuiz}
              saved={quizSaved}
              autoSave={!isPremium}
              canSave={
                activeQuestions.length > 0
                && activeQuestions.length <= questionsMax
              }
              used={quizLimits?.quizzesUsed}
              max={quizLimits?.quizzesMax}
              perItemMax={questionsMax}
              perItemLabel="questions per quiz"
              onSelect={loadQuiz}
              onSave={() => saveQuiz()}
              onDelete={deleteQuiz}
              onRefresh={loadSavedLists}
            />
            {activeQuestions.length > 0 ? (
              <Box>
                <QuizPlayer questions={activeQuestions} savedQuizId={selectedQuizId} />
                {quizResult && <AiMeta result={quizResult} />}
              </Box>
            ) : (
              <EmptyHint text="Generate a quiz or load a saved one to test yourself." />
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
