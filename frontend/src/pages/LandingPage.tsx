import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import {
  AutoStories,
  Psychology,
  Quiz,
  TrendingUp,
  Lock,
  CloudUpload,
  BoltRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const features = [
  {
    icon: <CloudUpload sx={{ fontSize: 32, color: "#6C63FF" }} />,
    title: "Upload Your Material",
    description:
      "Upload PDFs or paste text. ALP reads and understands your content.",
  },
  {
    icon: <Psychology sx={{ fontSize: 32, color: "#FF6584" }} />,
    title: "AI Tutor",
    description:
      "Ask questions, get explanations, compare concepts — like a personal tutor.",
  },
  {
    icon: <AutoStories sx={{ fontSize: 32, color: "#22C55E" }} />,
    title: "Smart Flashcards",
    description:
      "AI generates flashcards from your material for spaced-repetition practice.",
  },
  {
    icon: <Quiz sx={{ fontSize: 32, color: "#F59E0B" }} />,
    title: "Adaptive Quizzes",
    description:
      "Multiple choice, true/false, and short-answer quizzes with instant feedback.",
  },
  {
    icon: <TrendingUp sx={{ fontSize: 32, color: "#6C63FF" }} />,
    title: "Progress Tracking",
    description:
      "See your mastery level grow across every resource you study.",
  },
  {
    icon: <BoltRounded sx={{ fontSize: 32, color: "#FF6584" }} />,
    title: "Multiple AI Models",
    description:
      "Upgrade to premium for access to more powerful AI models and higher limits.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "#6C63FF",
    features: [
      "Upload PDFs & text",
      "AI summaries",
      "Generate flashcards",
      "Generate quizzes",
      "Basic AI Tutor",
      "Progress dashboard",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$9",
    period: "per month",
    color: "#FF6584",
    features: [
      "Everything in Free",
      "Advanced AI agents",
      "Larger file uploads",
      "Longer conversations",
      "Faster AI responses",
      "Priority new features",
    ],
    cta: "Upgrade to Premium",
    highlighted: true,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar transparent />
        <Container maxWidth="lg" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              py: { xs: 8, md: 12 },
              maxWidth: 720,
              mx: "auto",
              textAlign: "center",
            }}
          >
            <Chip
              label="Version 0.1 — Foundation"
              size="small"
              sx={{
                mb: 3,
                bgcolor: "rgba(108, 99, 255, 0.2)",
                color: "#9D97FF",
                border: "1px solid rgba(108, 99, 255, 0.4)",
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontSize: { xs: "2.5rem", md: "3.75rem" },
                fontWeight: 800,
                background: "linear-gradient(135deg, #ffffff 0%, #9D97FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Learn Anything,
              <br />
              Faster with AI
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 400,
                fontSize: { xs: "1.125rem", md: "1.375rem" },
                lineHeight: 1.6,
              }}
            >
              Upload your study material and let ALP generate summaries,
              flashcards, quizzes, and a personal AI tutor — all from your own
              content.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/register")}
                sx={{
                  background: "linear-gradient(135deg, #6C63FF, #FF6584)",
                  px: 5,
                  py: 1.75,
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  "&:hover": { opacity: 0.9 },
                }}
              >
                Start Learning Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "white",
                  px: 5,
                  py: 1.75,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            textAlign="center"
            sx={{ mb: 2, fontWeight: 800 }}
          >
            Everything you need to learn smarter
          </Typography>
          <Typography
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, fontSize: "1.125rem" }}
          >
            ALP doesn't just summarize — it teaches, drills, and tracks your
            mastery.
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Card
                  sx={{
                    height: "100%",
                    p: 1,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 32px rgba(108, 99, 255, 0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            textAlign="center"
            sx={{ mb: 2, fontWeight: 800 }}
          >
            Simple, transparent pricing
          </Typography>
          <Typography
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, fontSize: "1.125rem" }}
          >
            Start for free. Upgrade when you need more power.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} key={plan.name}>
                <Card
                  sx={{
                    p: 1,
                    position: "relative",
                    border: plan.highlighted
                      ? `2px solid ${plan.color}`
                      : "none",
                    boxShadow: plan.highlighted
                      ? `0 8px 40px rgba(255, 101, 132, 0.2)`
                      : undefined,
                  }}
                >
                  {plan.highlighted && (
                    <Chip
                      label="Most Popular"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -14,
                        left: "50%",
                        transform: "translateX(-50%)",
                        bgcolor: plan.color,
                        color: "white",
                        fontWeight: 700,
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                      {plan.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", mb: 3 }}>
                      <Typography
                        variant="h3"
                        fontWeight={800}
                        sx={{ color: plan.color }}
                      >
                        {plan.price}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {plan.period}
                      </Typography>
                    </Box>
                    <Stack spacing={1.5} sx={{ mb: 4 }}>
                      {plan.features.map((f) => (
                        <Box
                          key={f}
                          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                        >
                          <Lock
                            sx={{
                              fontSize: 16,
                              color: plan.color,
                              transform: "none",
                            }}
                          />
                          <Typography variant="body2">{f}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Button
                      variant={plan.highlighted ? "contained" : "outlined"}
                      fullWidth
                      size="large"
                      onClick={() => navigate("/register")}
                      sx={
                        plan.highlighted
                          ? {
                              background: `linear-gradient(135deg, ${plan.color}, #6C63FF)`,
                            }
                          : { borderColor: plan.color, color: plan.color }
                      }
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          bgcolor: "#1A1A2E",
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          © 2026 AI Learning Platform. Built with React + Spring Boot.
        </Typography>
      </Box>
    </Box>
  );
}
