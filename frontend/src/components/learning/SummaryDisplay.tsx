import { Box, Chip, Paper, Typography } from "@mui/material";
import { Summarize } from "@mui/icons-material";
import { GRADIENT_SUMMARY, CARD_SHADOW } from "./sharedStyles";
import type { AiResponse } from "../../api/aiApi";

interface SummaryDisplayProps {
  result: AiResponse;
}

export default function SummaryDisplay({ result }: SummaryDisplayProps) {
  const lines = result.result.split("\n").filter((l) => l.trim());

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: CARD_SHADOW,
        border: "1px solid rgba(108, 99, 255, 0.1)",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          background: GRADIENT_SUMMARY,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Summarize />
        <Typography variant="subtitle1" fontWeight={700}>
          AI Summary
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {lines.length > 1 && lines.some((l) => l.match(/^[-•*]\s/)) ? (
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {lines.map((line, i) => (
              <Typography
                component="li"
                key={i}
                variant="body1"
                sx={{ mb: 1.25, lineHeight: 1.75, color: "text.primary" }}
              >
                {line.replace(/^[-•*]\s*/, "")}
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{ lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {result.result}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: "rgba(108, 99, 255, 0.04)",
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Chip label={result.model} size="small" variant="outlined" />
        <Chip label={`${result.totalTokens.toLocaleString()} tokens`} size="small" variant="outlined" />
        <Chip label={`${(result.responseTimeMs / 1000).toFixed(1)}s`} size="small" variant="outlined" />
      </Box>
    </Paper>
  );
}
