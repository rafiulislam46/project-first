"use client";

import React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark"; // locked to dark, but keeps provider for future expansion

const ThemeContext = createContext<Theme>("dark");

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);