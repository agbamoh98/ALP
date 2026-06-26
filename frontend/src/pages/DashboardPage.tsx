import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
} from "@mui/material";
import {
  CloudUpload,
  AutoStories,
  Quiz,
  TrendingUp,
  Psychology,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { resourceApi, type ResourceListItem } from "../api/resourceApi";
import { flashcardApi } from "../api/flashcardApi";
import { quizApi } from "../api/quizApi";
import { isPremiumTier } from "../utils/planLimits";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resourceCount, setResourceCount] = useState<number | null>(null);
  const [deckCount, setDeckCount] = useState<number | null>(null);
  const [quizCount, setQuizCount] = useState<number | null>(null);
  const [resources, setResources] = useState<ResourceListItem[]>([]);

  useEffect(() => {
    resourceApi.count()
      .then(setResourceCount)
      .catch(() => setResourceCount(0));
    flashcardApi.count()
      .then(setDeckCount)
      .catch(() => setDeckCount(0));
    quizApi.count()
      .then(setQuizCount)
      .catch(() => setQuizCount(0));
    resourceApi.list()
      .then(setResources)
      .catch(() => setResources([]));
  }, []);

  const openResourceAi = (aiTab: number) => {
    if (resources.length > 0) {
      navigate(`/resources/${resources[0].id}`, { state: { aiTab } });
    } else {
      navigate("/upload");
    }
  };

  const quickActions = [
    {
      icon: <CloudUpload sx={{ fontSize: 28, color: "#6C63FF" }} />,
      title: "Upload Resource",
      description: "Add a PDF or paste text to study",
      color: "rgba(108, 99, 255, 0.08)",
      available: true,
      onClick: () => navigate("/upload"),
    },
    {
      icon: <Psychology sx={{ fontSize: 28, color: "#FF6584" }} />,
      title: "AI Tutor",
      description: "Ask questions about your material",
      color: "rgba(255, 101, 132, 0.08)",
      available: true,
      onClick: () => openResourceAi(3),
    },
    {
      icon: <AutoStories sx={{ fontSize: 28, color: "#22C55E" }} />,
      title: "Flashcards",
      description: "Generate flashcards from a resource",
      color: "rgba(34, 197, 94, 0.08)",
      available: true,
      onClick: () => openResourceAi(1),
    },
    {
      icon: <Quiz sx={{ fontSize: 28, color: "#F59E0B" }} />,
      title: "Take a Quiz",
      description: "Generate a quiz from a resource",
      color: "rgba(245, 158, 11, 0.08)",
      available: true,
      onClick: () => openResourceAi(2),
    },
  ];

  const stats = [
    { label: "Resources", value: resourceCount !== null ? String(resourceCount) : "…", icon: <CloudUpload />, color: "#6C63FF", onClick: () => navigate("/resources") },
    { label: "Flashcard Decks", value: deckCount !== null ? String(deckCount) : "…", icon: <AutoStories />, color: "#22C55E", onClick: () => openResourceAi(1) },
    { label: "Saved Quizzes", value: quizCount !== null ? String(quizCount) : "…", icon: <Quiz />, color: "#F59E0B", onClick: () => openResourceAi(2) },
    { label: "Study Minutes", value: "0", icon: <TrendingUp />, color: "#FF6584", onClick: () => {} },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
              {greeting()}, {user?.firstName} 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ready to learn something today?
            </Typography>
            <Chip
              label={`${user?.role ?? "FREE"} Plan`}
              size="small"
              sx={{
                mt: 1.5,
                bgcolor:
                  isPremiumTier(user?.role)
                    ? "rgba(255, 101, 132, 0.1)"
                    : "rgba(108, 99, 255, 0.1)",
                color: isPremiumTier(user?.role) ? "#FF6584" : "#6C63FF",
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Card sx={{ height: "100%", cursor: "pointer" }} onClick={stat.onClick}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: `${stat.color}1A`,
                        color: stat.color,
                        mb: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" fontWeight={800}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions */}
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {quickActions.map((action) => (
              <Grid item xs={12} sm={6} md={3} key={action.title}>
                <Card
                  sx={{
                    height: "100%",
                    opacity: action.available ? 1 : 0.65,
                    cursor: action.available ? "pointer" : "default",
                  }}
                >
                  <CardActionArea
                    disabled={!action.available}
                    onClick={action.onClick}
                    sx={{ height: "100%" }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: action.color,
                          mb: 2,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                      {!action.available && (
                        <Chip
                          label="Coming in v0.3"
                          size="small"
                          sx={{ mt: 1.5, fontSize: "0.7rem" }}
                        />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {resourceCount === 0 && (
          <Card
            sx={{
              p: 2,
              textAlign: "center",
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "transparent",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ py: 6 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 2,
                  borderRadius: "50%",
                  bgcolor: "rgba(108, 99, 255, 0.1)",
                  mb: 2,
                }}
              >
                <Add sx={{ fontSize: 32, color: "primary.main" }} />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                No learning resources yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a PDF or paste text to get started with AI summaries, flashcards, and quizzes.
              </Typography>
            </CardContent>
          </Card>
          )}

          {/* Version badge */}
          <Stack direction="row" justifyContent="center" sx={{ mt: 6 }}>
            <Chip
              label="Version 0.3 — Basic AI"
              variant="outlined"
              size="small"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          </Stack>
        </Container>
      </Box>
    </Layout>
  );
}
