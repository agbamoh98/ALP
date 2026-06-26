import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useScrollTrigger,
  Slide,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
  transparent?: boolean;
}

function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navbar({ transparent = false }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/");
  };

  const initials =
    user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "";

  return (
    <HideOnScroll>
      <AppBar
        position="sticky"
        elevation={transparent ? 0 : 1}
        sx={{
          backgroundColor: transparent ? "transparent" : "background.paper",
          color: transparent ? "white" : "text.primary",
          backdropFilter: transparent ? "none" : "blur(8px)",
          borderBottom: transparent ? "none" : "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component="a"
              onClick={() => navigate("/")}
              sx={{
                cursor: "pointer",
                fontWeight: 800,
                background: transparent
                  ? "white"
                  : "linear-gradient(135deg, #6C63FF, #FF6584)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                flexGrow: 1,
                textDecoration: "none",
              }}
            >
              ALP
            </Typography>

            {/* Nav actions */}
            {isAuthenticated ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  onClick={() => navigate("/dashboard")}
                  sx={{ color: transparent ? "white" : "text.primary" }}
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/resources")}
                  sx={{ color: transparent ? "white" : "text.primary" }}
                >
                  Library
                </Button>
                <Button
                  onClick={() => navigate("/upload")}
                  sx={{ color: transparent ? "white" : "text.primary" }}
                >
                  Upload
                </Button>
                <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 36,
                      height: 36,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {initials}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  PaperProps={{ sx: { minWidth: 200, borderRadius: 2, mt: 1 } }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                  <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  onClick={() => navigate("/login")}
                  sx={{ color: transparent ? "white" : "text.primary" }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/register")}
                  sx={{
                    background: transparent
                      ? "white"
                      : "linear-gradient(135deg, #6C63FF, #FF6584)",
                    color: transparent ? "#6C63FF" : "white",
                  }}
                >
                  Get Started
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
}
