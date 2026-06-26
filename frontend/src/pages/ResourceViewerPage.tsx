import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  Paper,
  Skeleton,
  Alert,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  PictureAsPdf,
  TextFields,
  CalendarToday,
  Storage,
  TextSnippet,
  Schedule,
} from "@mui/icons-material";
import Layout from "../components/layout/Layout";
import ResourceAiPanel from "../components/ai/ResourceAiPanel";
import ResourceContentViewer from "../components/resources/ResourceContentViewer";
import { resourceApi } from "../api/resourceApi";
import type { LearningResource } from "../types";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function estimateReadMinutes(charCount: number): number {
  return Math.max(1, Math.ceil(charCount / 5 / 200));
}

export default function ResourceViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialAiTab = (location.state as { aiTab?: number } | null)?.aiTab ?? 0;
  const [resource, setResource] = useState<(LearningResource & { characterCount: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    resourceApi.get(id)
      .then(setResource)
      .catch(() => setError("Resource not found or you don't have access to it."))
      .finally(() => setLoading(false));
  }, [id]);

  const isPdf = resource?.type === "PDF";
  const accent = isPdf ? "#FF6584" : "#6C63FF";
  const heroGradient = isPdf
    ? "linear-gradient(135deg, rgba(255,101,132,0.12) 0%, rgba(108,99,255,0.08) 100%)"
    : "linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(255,101,132,0.06) 100%)";

  return (
    <Layout>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 3, sm: 5 } }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/resources")}
            sx={{
              mb: 3,
              color: "text.secondary",
              "&:hover": { bgcolor: "rgba(108, 99, 255, 0.06)" },
            }}
          >
            Back to Library
          </Button>

          {loading && (
            <Box>
              <Skeleton variant="rounded" height={160} sx={{ mb: 3, borderRadius: 4 }} />
              <Skeleton variant="rounded" height={480} sx={{ borderRadius: 4 }} />
            </Box>
          )}

          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          {resource && !loading && (
            <>
              {/* Hero header */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  mb: 3,
                  borderRadius: 4,
                  background: heroGradient,
                  border: "1px solid rgba(108, 99, 255, 0.12)",
                  boxShadow: "0 8px 32px rgba(108, 99, 255, 0.08)",
                }}
              >
                <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: "#fff",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    }}
                  >
                    {isPdf ? (
                      <PictureAsPdf sx={{ fontSize: 36, color: accent }} />
                    ) : (
                      <TextFields sx={{ fontSize: 36, color: accent }} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label={resource.type}
                        size="small"
                        sx={{
                          bgcolor: `${accent}18`,
                          color: accent,
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        label="Ready for AI"
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: "rgba(108, 99, 255, 0.3)", color: "primary.main", fontWeight: 600 }}
                      />
                    </Stack>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1, lineHeight: 1.25 }}>
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Study this material with summaries, flashcards, quizzes, and the AI Tutor below.
                    </Typography>
                  </Box>
                </Box>

                {/* Stats row */}
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={1.5}
                  sx={{ mt: 3, pt: 2.5, borderTop: "1px solid rgba(108, 99, 255, 0.1)" }}
                >
                  {[
                    { icon: <Storage fontSize="small" />, label: formatBytes(resource.fileSize) },
                    { icon: <TextSnippet fontSize="small" />, label: `${resource.characterCount.toLocaleString()} chars` },
                    { icon: <Schedule fontSize="small" />, label: `~${estimateReadMinutes(resource.characterCount)} min read` },
                    {
                      icon: <CalendarToday fontSize="small" />,
                      label: new Date(resource.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }),
                    },
                  ].map((stat) => (
                    <Chip
                      key={stat.label}
                      icon={stat.icon}
                      label={stat.label}
                      variant="outlined"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.7)",
                        borderColor: "rgba(108, 99, 255, 0.15)",
                        fontWeight: 500,
                        "& .MuiChip-icon": { color: "primary.main" },
                      }}
                    />
                  ))}
                </Stack>
              </Paper>

              {/* Document content */}
              {resource.content ? (
                <ResourceContentViewer
                  content={resource.content}
                  title={resource.title}
                  type={resource.type}
                />
              ) : (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  No text content available for this resource.
                </Alert>
              )}

              {/* AI tools */}
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    mb: 0,
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: 1.5,
                  }}
                >
                  Study with AI
                </Typography>
                <ResourceAiPanel
                  resourceId={resource.id}
                  content={resource.content ?? ""}
                  initialTab={initialAiTab}
                />
              </Box>
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
}
