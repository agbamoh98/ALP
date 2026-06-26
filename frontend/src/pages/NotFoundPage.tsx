import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: "6rem",
            fontWeight: 900,
            background: "linear-gradient(135deg, #6C63FF, #FF6584)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/")}
          sx={{ background: "linear-gradient(135deg, #6C63FF, #FF6584)" }}
        >
          Go Home
        </Button>
      </Container>
    </Box>
  );
}
