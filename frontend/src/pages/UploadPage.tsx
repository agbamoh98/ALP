import { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
} from "@mui/material";
import { CloudUpload, TextFields, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { resourceApi } from "../api/resourceApi";

export default function UploadPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<0 | 1>(0);

  // PDF state
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text state
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  // Shared
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resourceLimits, setResourceLimits] = useState<{ used: number; max: number; plan: string } | null>(null);

  useEffect(() => {
    resourceApi.limits().then(setResourceLimits).catch(() => setResourceLimits(null));
  }, []);

  const atResourceLimit = resourceLimits !== null && resourceLimits.used >= resourceLimits.max;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Only PDF files are accepted.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadPdf = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      await resourceApi.uploadPdf(selectedFile, pdfTitle || undefined);
      setSuccess(true);
      setTimeout(() => navigate("/resources"), 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Upload failed. Please try again.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadText = async () => {
    if (!textTitle.trim() || !textContent.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await resourceApi.uploadText(textTitle, textContent);
      setSuccess(true);
      setTimeout(() => navigate("/resources"), 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Upload failed. Please try again.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h5" fontWeight={700}>Upload successful!</Typography>
            <Typography color="text.secondary">Redirecting to your library…</Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Upload Learning Resource
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Upload a PDF or paste text — ALP will extract and store the content for AI features.
          </Typography>

          {resourceLimits && (
            <Alert
              severity={atResourceLimit ? "warning" : "info"}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {atResourceLimit
                ? `You've saved ${resourceLimits.used}/${resourceLimits.max} resources on your ${resourceLimits.plan} plan. Delete one from your library to upload more.`
                : `Resources saved: ${resourceLimits.used}/${resourceLimits.max} (${resourceLimits.plan} plan)`}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
            <Tabs
              value={tab}
              onChange={(_, v) => { setTab(v); setError(null); }}
              sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}
            >
              <Tab icon={<CloudUpload />} iconPosition="start" label="Upload PDF" />
              <Tab icon={<TextFields />} iconPosition="start" label="Paste Text" />
            </Tabs>

            <Box sx={{ p: 4 }}>
              {/* ── PDF Tab ── */}
              {tab === 0 && (
                <Box>
                  <Box
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: "2px dashed",
                      borderColor: dragOver ? "primary.main" : selectedFile ? "success.main" : "divider",
                      borderRadius: 3,
                      p: 6,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: dragOver ? "rgba(108,99,255,0.04)" : "transparent",
                      transition: "all 0.2s",
                      mb: 3,
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <CloudUpload sx={{ fontSize: 48, color: selectedFile ? "success.main" : "text.secondary", mb: 1 }} />
                    {selectedFile ? (
                      <>
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — click to change
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" fontWeight={600}>
                          Drag & drop your PDF here
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          or click to browse — max 10 MB
                        </Typography>
                      </>
                    )}
                  </Box>

                  <TextField
                    label="Title (optional)"
                    placeholder="Leave blank to use the filename"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                  />

                  {uploading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={!selectedFile || uploading || atResourceLimit}
                    onClick={handleUploadPdf}
                    sx={{ background: "linear-gradient(135deg, #6C63FF, #FF6584)", height: 52 }}
                  >
                    {uploading ? <CircularProgress size={22} color="inherit" /> : "Upload PDF"}
                  </Button>
                </Box>
              )}

              {/* ── Text Tab ── */}
              {tab === 1 && (
                <Box>
                  <TextField
                    label="Title"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    required
                    fullWidth
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    label="Content"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    required
                    fullWidth
                    multiline
                    minRows={10}
                    placeholder="Paste your notes, article, or any text you want to study…"
                    sx={{ mb: 3 }}
                    helperText={`${textContent.length} characters`}
                  />

                  {uploading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={!textTitle.trim() || !textContent.trim() || uploading || atResourceLimit}
                    onClick={handleUploadText}
                    sx={{ background: "linear-gradient(135deg, #6C63FF, #FF6584)", height: 52 }}
                  >
                    {uploading ? <CircularProgress size={22} color="inherit" /> : "Save Resource"}
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
}
