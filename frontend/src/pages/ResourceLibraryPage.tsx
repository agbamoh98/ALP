import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  PictureAsPdf,
  TextFields,
  Delete,
  Add,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { resourceApi, type ResourceListItem } from "../api/resourceApi";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function ResourceLibraryPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    resourceApi.list()
      .then(setResources)
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Failed to load resources.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await resourceApi.delete(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete resource. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>My Library</Typography>
              <Typography color="text.secondary">
                {loading ? "Loading…" : `${resources.length} resource${resources.length !== 1 ? "s" : ""}`}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/upload")}
              sx={{ background: "linear-gradient(135deg, #6C63FF, #FF6584)" }}
            >
              Upload
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Loading skeletons */}
          {loading && (
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Empty state */}
          {!loading && resources.length === 0 && (
            <Card sx={{ textAlign: "center", border: "2px dashed", borderColor: "divider", boxShadow: "none", bgcolor: "transparent", p: 2 }}>
              <CardContent sx={{ py: 8 }}>
                <Add sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  No resources yet
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Upload a PDF or paste text to get started.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/upload")}
                  sx={{ background: "linear-gradient(135deg, #6C63FF, #FF6584)" }}
                >
                  Upload your first resource
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resource cards */}
          {!loading && resources.length > 0 && (
            <Grid container spacing={3}>
              {resources.map((resource) => (
                <Grid item xs={12} sm={6} md={4} key={resource.id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardActionArea onClick={() => navigate(`/resources/${resource.id}`)} sx={{ flexGrow: 1 }}>
                      <CardContent sx={{ p: 3 }}>
                        {/* Type icon + badge */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          {resource.type === "PDF" ? (
                            <PictureAsPdf sx={{ color: "#FF6584" }} />
                          ) : (
                            <TextFields sx={{ color: "#6C63FF" }} />
                          )}
                          <Chip
                            label={resource.type}
                            size="small"
                            sx={{
                              bgcolor: resource.type === "PDF" ? "rgba(255,101,132,0.1)" : "rgba(108,99,255,0.1)",
                              color: resource.type === "PDF" ? "#FF6584" : "#6C63FF",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {resource.title}
                        </Typography>

                        {/* Meta */}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatBytes(resource.fileSize)} · {resource.characterCount.toLocaleString()} chars
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(resource.createdAt)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>

                    <CardActions sx={{ px: 2, pb: 2, justifyContent: "space-between" }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/resources/${resource.id}`)}
                      >
                        View
                      </Button>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(resource.id)}
                          disabled={deletingId === resource.id}
                        >
                          {deletingId === resource.id
                            ? <CircularProgress size={16} />
                            : <Delete fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Layout>
  );
}
