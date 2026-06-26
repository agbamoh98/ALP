import { Box } from "@mui/material";
import type { ReactNode } from "react";
import Navbar from "./Navbar";

interface Props {
  children: ReactNode;
  transparentNav?: boolean;
}

export default function Layout({ children, transparentNav = false }: Props) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar transparent={transparentNav} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
