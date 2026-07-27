import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

const THEME_KEY = "@kribb_theme";

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  danger: string;
  dangerLight: string;
  tabBar: string;
  tabBarBorder: string;
  card: string;
  inputBg: string;
  skeleton: string;
  overlay: string;
}

const lightColors: ThemeColors = {
  bg: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceAlt: "#F3F4F6",
  text: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  primary: "#0F766E",
  primaryLight: "#F0FDFA",
  primaryDark: "#115E59",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E5E7EB",
  card: "#FFFFFF",
  inputBg: "#FFFFFF",
  skeleton: "#E5E7EB",
  overlay: "rgba(0,0,0,0.5)",
};

const darkColors: ThemeColors = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceAlt: "#334155",
  text: "#F1F5F9",
  textSecondary: "#CBD5E1",
  textMuted: "#64748B",
  border: "#334155",
  borderLight: "#1E293B",
  primary: "#14B8A6",
  primaryLight: "#134E4A",
  primaryDark: "#0F766E",
  danger: "#F87171",
  dangerLight: "#451A1A",
  tabBar: "#1E293B",
  tabBarBorder: "#334155",
  card: "#1E293B",
  inputBg: "#334155",
  skeleton: "#334155",
  overlay: "rgba(0,0,0,0.7)",
};

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") {
        setMode(saved);
      } else {
        setMode(systemScheme === "dark" ? "dark" : "light");
      }
      setLoaded(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  if (!loaded) return null;

  const colors = mode === "dark" ? darkColors : lightColors;
  const isDark = mode === "dark";

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
