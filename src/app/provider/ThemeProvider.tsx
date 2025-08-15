"use client";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useMemo } from "react";

import {
  createTheme,
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";

import type { ReactNode } from "react";

function MuiThemeWrapper({ children }: { children: ReactNode }) {
  const { theme, systemTheme } = useTheme(); // 'light' | 'dark' | 'system'

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode:
            theme === "system"
              ? systemTheme
              : theme === "dark"
              ? "dark"
              : "light",
        },
      }),
    [theme, systemTheme]
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function ThemeProvider({ children, ...props }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" {...props}>
      <MuiThemeWrapper>{children}</MuiThemeWrapper>
    </NextThemesProvider>
  );
}
