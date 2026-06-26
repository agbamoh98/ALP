import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Check,
  ContentCopy,
  ExpandLess,
  ExpandMore,
  MenuBook,
  UnfoldLess,
  UnfoldMore,
} from "@mui/icons-material";

interface ResourceContentViewerProps {
  content: string;
  title: string;
  type: "PDF" | "TEXT";
}

function estimateReadMinutes(charCount: number): number {
  const words = charCount / 5;
  return Math.max(1, Math.ceil(words / 200));
}

export default function ResourceContentViewer({ content, title, type }: ResourceContentViewerProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accent = type === "PDF" ? "#FF6584" : "#6C63FF";
  const readMins = estimateReadMinutes(content.length);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid rgba(108, 99, 255, 0.12)",
        boxShadow: "0 8px 32px rgba(108, 99, 255, 0.08)",
        mb: 3,
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          bgcolor: "rgba(108, 99, 255, 0.04)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.5,
              bgcolor: `${accent}18`,
              color: accent,
              display: "flex",
            }}
          >
            <MenuBook fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Document Content
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ~{readMins} min read · {content.length.toLocaleString()} characters
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title={expanded ? "Default height" : "Expand viewer"}>
            <IconButton size="small" onClick={() => setExpanded((e) => !e)}>
              {expanded ? <UnfoldLess fontSize="small" /> : <UnfoldMore fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={collapsed ? "Show content" : "Collapse content"}>
            <IconButton size="small" onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={copied ? "Copied!" : "Copy all text"}>
            <Button
              size="small"
              variant="outlined"
              startIcon={copied ? <Check /> : <ContentCopy />}
              onClick={handleCopy}
              color={copied ? "success" : "primary"}
              sx={{ ml: 0.5 }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {!collapsed && (
        <Box
          sx={{
            position: "relative",
            bgcolor: "#EEF0F8",
            p: { xs: 2, sm: 3 },
          }}
        >
          {/* Paper sheet */}
          <Box
            sx={{
              position: "relative",
              maxHeight: expanded ? "none" : { xs: "50vh", sm: "58vh" },
              overflow: expanded ? "visible" : "auto",
              borderRadius: 2,
              bgcolor: "#fff",
              boxShadow: "0 2px 12px rgba(26, 26, 46, 0.06), 0 0 0 1px rgba(0,0,0,0.04)",
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(108, 99, 255, 0.25)",
                borderRadius: 4,
              },
            }}
          >
            {/* Document margin line */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: { xs: 20, sm: 48 },
                width: 2,
                bgcolor: "rgba(255, 101, 132, 0.15)",
                pointerEvents: "none",
              }}
            />

            <Box sx={{ px: { xs: 3, sm: 6 }, py: { xs: 3, sm: 4 } }}>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", letterSpacing: 1.2, display: "block", mb: 2 }}
              >
                {title}
              </Typography>
              <Typography
                component="div"
                sx={{
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  fontSize: { xs: "0.95rem", sm: "1.02rem" },
                  lineHeight: 1.85,
                  color: "#2D3748",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {content}
              </Typography>
            </Box>

            {/* Bottom fade when scrollable */}
            {!expanded && content.length > 2000 && (
              <Box
                sx={{
                  position: "sticky",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 48,
                  background: "linear-gradient(to top, #fff 20%, transparent)",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {collapsed && (
        <Box sx={{ px: 3, py: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Content collapsed — expand to read the full document
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
