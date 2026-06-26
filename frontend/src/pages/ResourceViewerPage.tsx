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
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  PictureAsPdf,
  TextFields,
  ContentCopy,
  Check,
} from "@mui/icons-material";
import Layout from "../components/layout/Layout";
import ResourceAiPanel from "../components/ai/ResourceAiPanel";
import { resourceApi } from "../api/resourceApi";
import type { LearningResource } from "../types";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResourceViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialAiTab = (location.state as { aiTab?: number } | null)?.aiTab ?? 0;
  const [resource, setResource] = useState<(LearningResource & { characterCount: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    resourceApi.get(id)
      .then(setResource)
      .catch(() => setError("Resource not found or you don't have access to it."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    if (resource?.content) {
      navigator.clipboard.writeText(resource.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>
        <Container maxWidth="lg">
          {/* Back button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/resources")}
            sx={{ mb: 3, color: "text.secondary" }}
          >
            Back to Library
          </Button>

          {loading && (
            <Box>
              <Skeleton variant="text" width="50%" height={48} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 3 }} />
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {resource && !loading && (
            <>
              {/* Header */}
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    {resource.type === "PDF"
                      ? <PictureAsPdf sx={{ color: "#FF6584", fontSize: 28 }} />
                      : <TextFields sx={{ color: "#6C63FF", fontSize: 28 }} />}
                    <Chip
                      label={resource.type}
                      size="small"
                      sx={{
                        bgcolor: resource.type === "PDF" ? "rgba(255,101,132,0.1)" : "rgba(108,99,255,0.1)",
                        color: resource.type === "PDF" ? "#FF6584" : "#6C63FF",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                    {resource.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatBytes(resource.fileSize)} · {resource.characterCount.toLocaleString()} characters ·{" "}
                    {new Date(resource.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </Typography>
                </Box>

                <Tooltip title={copied ? "Copied!" : "Copy content"}>
                  <IconButton onClick={handleCopy} color={copied ? "success" : "default"}>
                    {copied ? <Check /> : <ContentCopy />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Content */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  maxHeight: "70vh",
                  overflow: "auto",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "text.primary",
                }}
              >
                {resource.content}
              </Paper>

              <ResourceAiPanel
                resourceId={resource.id}
                content={resource.content ?? ""}
                initialTab={initialAiTab}
              />
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
}
