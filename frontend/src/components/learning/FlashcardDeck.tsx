import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  AutoStories,
  ChevronLeft,
  ChevronRight,
  Flip,
  LightbulbOutlined,
  QuizOutlined,
} from "@mui/icons-material";
import type { ParsedFlashcard } from "../../utils/parseAiJson";
import { difficultyStyle, GRADIENT_PRIMARY, navIconButtonSx } from "./sharedStyles";

interface FlashcardDeckProps {
  cards: ParsedFlashcard[];
}

interface CardFaceProps {
  side: "front" | "back";
  text: string;
  category?: string;
  difficulty?: string;
}

function CardFace({ side, text, category, difficulty }: CardFaceProps) {
  const isFront = side === "front";
  const diff = difficultyStyle(difficulty);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 50px rgba(108, 99, 255, 0.18), 0 8px 20px rgba(0,0,0,0.06)",
        transform: isFront ? "rotateY(0deg)" : "rotateY(180deg)",
      }}
    >
      {/* Gradient background */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: "column",
          background: isFront
            ? "linear-gradient(145deg, #6C63FF 0%, #8B83FF 45%, #A59FFF 100%)"
            : "linear-gradient(145deg, #1A1A2E 0%, #2D2B55 50%, #3D3B6E 100%)",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        />

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, zIndex: 1 }}>
          <Chip
            icon={isFront ? <QuizOutlined sx={{ color: "inherit !important" }} /> : <LightbulbOutlined sx={{ color: "inherit !important" }} />}
            label={isFront ? "Question" : "Answer"}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          />
          <Stack direction="row" spacing={0.5}>
            {category && (
              <Chip
                label={category}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  maxWidth: 120,
                  "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                }}
              />
            )}
            {difficulty && (
              <Chip
                label={difficulty}
                size="small"
                sx={{
                  bgcolor: diff.bg,
                  color: diff.color,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  border: "none",
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            px: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              lineHeight: 1.65,
              textAlign: "center",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: { xs: "1.05rem", sm: "1.2rem" },
              textShadow: isFront ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {text}
          </Typography>
        </Box>

        {/* Footer hint */}
        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
            opacity: 0.75,
            mt: 2,
            zIndex: 1,
          }}
        >
          {isFront ? "Tap to reveal answer" : "Tap to see question"}
        </Typography>
      </Box>
    </Box>
  );
}

export default function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  const goTo = useCallback((next: number) => {
    setIndex(next);
    setFlipped(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(Math.max(0, index - 1));
      if (e.key === "ArrowRight") goTo(Math.min(cards.length - 1, index + 1));
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, cards.length, goTo]);

  if (cards.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No valid flashcards were parsed from the AI response.
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 520, mx: "auto" }}>
      {/* Deck header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: "rgba(34, 197, 94, 0.1)",
              color: "#22C55E",
              display: "flex",
            }}
          >
            <AutoStories fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Flashcard Deck
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cards.length} cards · use ← → and Space
            </Typography>
          </Box>
        </Stack>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ color: "primary.main" }}
        >
          {index + 1}
          <Typography component="span" variant="body2" color="text.secondary" fontWeight={500}>
            /{cards.length}
          </Typography>
        </Typography>
      </Box>

      {/* Stacked card illusion */}
      <Box sx={{ position: "relative", mb: 3, perspective: "1200px" }}>
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: "92%",
            height: "100%",
            minHeight: 280,
            borderRadius: 4,
            bgcolor: "rgba(108, 99, 255, 0.06)",
            border: "1px solid rgba(108, 99, 255, 0.08)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 4,
            left: "50%",
            transform: "translateX(-50%)",
            width: "96%",
            height: "100%",
            minHeight: 280,
            borderRadius: 4,
            bgcolor: "rgba(108, 99, 255, 0.04)",
            border: "1px solid rgba(108, 99, 255, 0.06)",
          }}
        />

        {/* Flip container */}
        <Box
          onClick={() => setFlipped((f) => !f)}
          sx={{
            position: "relative",
            minHeight: 280,
            cursor: "pointer",
            transformStyle: "preserve-3d",
            transition: "transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            "&:hover": {
              transform: flipped ? "rotateY(180deg) scale(1.01)" : "rotateY(0deg) scale(1.01)",
            },
          }}
        >
          <CardFace
            side="front"
            text={card.front}
            category={card.category}
            difficulty={card.difficulty}
          />
          <CardFace
            side="back"
            text={card.back}
            category={card.category}
            difficulty={card.difficulty}
          />
        </Box>
      </Box>

      {/* Progress dots */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mb: 2.5, flexWrap: "wrap" }}>
        {cards.map((_, i) => (
          <Box
            key={i}
            onClick={() => goTo(i)}
            sx={{
              width: i === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: i === index ? "primary.main" : "rgba(108, 99, 255, 0.2)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              "&:hover": {
                bgcolor: i === index ? "primary.dark" : "rgba(108, 99, 255, 0.35)",
              },
            }}
          />
        ))}
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <IconButton
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          sx={navIconButtonSx}
        >
          <ChevronLeft />
        </IconButton>

        <Button
          variant="contained"
          startIcon={<Flip />}
          onClick={() => setFlipped((f) => !f)}
          sx={{
            px: 3,
            background: flipped ? "linear-gradient(135deg, #1A1A2E 0%, #3D3B6E 100%)" : GRADIENT_PRIMARY,
            boxShadow: "0 4px 14px rgba(108, 99, 255, 0.35)",
            "&:hover": { boxShadow: "0 6px 20px rgba(108, 99, 255, 0.45)" },
          }}
        >
          {flipped ? "Show Question" : "Reveal Answer"}
        </Button>

        <IconButton
          onClick={() => goTo(Math.min(cards.length - 1, index + 1))}
          disabled={index === cards.length - 1}
          sx={navIconButtonSx}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    </Box>
  );
}
