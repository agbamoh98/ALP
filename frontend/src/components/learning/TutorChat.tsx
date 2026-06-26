import { useRef, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Psychology, Send } from "@mui/icons-material";
import { GRADIENT_TUTOR } from "./sharedStyles";
import type { ChatMessage } from "../../api/aiApi";

interface TutorChatProps {
  history: ChatMessage[];
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

const SUGGESTIONS = [
  "Explain the main idea in simple terms",
  "What are the key terms I should know?",
  "Give me an example from this material",
];

export default function TutorChat({ history, input, loading, onInputChange, onSend }: TutorChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  return (
    <Box>
      <Box
        sx={{
          minHeight: 320,
          maxHeight: 420,
          overflow: "auto",
          mb: 2,
          p: 2,
          borderRadius: 3,
          bgcolor: "rgba(255, 101, 132, 0.04)",
          border: "1px solid rgba(255, 101, 132, 0.12)",
        }}
      >
        {history.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: GRADIENT_TUTOR,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                boxShadow: "0 8px 24px rgba(255, 101, 132, 0.3)",
              }}
            >
              <Psychology sx={{ color: "#fff", fontSize: 28 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              AI Tutor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 360, mx: "auto" }}>
              Ask anything about this resource. I use the document as context for every reply.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  size="small"
                  variant="outlined"
                  onClick={() => onInputChange(s)}
                  sx={{
                    borderColor: "rgba(255, 101, 132, 0.35)",
                    color: "#FF6584",
                    "&:hover": { bgcolor: "rgba(255, 101, 132, 0.06)" },
                  }}
                >
                  {s}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {history.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              {!isUser && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: GRADIENT_TUTOR,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1.5,
                    flexShrink: 0,
                    mt: 0.5,
                  }}
                >
                  <Psychology sx={{ color: "#fff", fontSize: 18 }} />
                </Box>
              )}
              <Paper
                elevation={0}
                sx={{
                  maxWidth: "78%",
                  p: 2,
                  borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isUser ? GRADIENT_TUTOR : "#fff",
                  color: isUser ? "#fff" : "text.primary",
                  boxShadow: isUser
                    ? "0 4px 12px rgba(255, 101, 132, 0.25)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                  border: isUser ? "none" : "1px solid",
                  borderColor: "divider",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.65,
                  fontSize: "0.95rem",
                }}
              >
                {msg.content}
              </Paper>
            </Box>
          );
        })}

        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 5 }}>
            <CircularProgress size={18} sx={{ color: "#FF6584" }} />
            <Typography variant="body2" color="text.secondary">
              Tutor is thinking…
            </Typography>
          </Box>
        )}
        <div ref={chatEndRef} />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          p: 1.5,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Ask a question about this material…"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={loading}
          multiline
          maxRows={4}
          variant="standard"
          InputProps={{ disableUnderline: true, sx: { px: 1 } }}
        />
        <Button
          variant="contained"
          onClick={onSend}
          disabled={loading || !input.trim()}
          sx={{
            minWidth: 48,
            minHeight: 48,
            borderRadius: 2.5,
            background: GRADIENT_TUTOR,
            boxShadow: "0 4px 12px rgba(255, 101, 132, 0.35)",
          }}
        >
          <Send fontSize="small" />
        </Button>
      </Box>
    </Box>
  );
}
