import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  /** Light-mode neon glow multiplier, 0–200 (100 = default 1x). Ignored in dark mode. */
  neonIntensity: number;
  setNeonIntensity: (v: number) => void;
}

const DEFAULT_INTENSITY = 100;

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  neonIntensity: DEFAULT_INTENSITY,
  setNeonIntensity: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("tvk-theme") as Theme) || "dark";
    }
    return "dark";
  });

  const [neonIntensity, setNeonIntensityState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tvk-neon-intensity");
      const parsed = stored ? Number(stored) : NaN;
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 200) return parsed;
    }
    return DEFAULT_INTENSITY;
  });

  const setNeonIntensity = (v: number) => {
    const clamped = Math.max(0, Math.min(200, Math.round(v)));
    setNeonIntensityState(clamped);
    localStorage.setItem("tvk-neon-intensity", String(clamped));
  };

  // Load theme from database when user logs in
  useEffect(() => {
    if (user) {
      const loadThemeFromDB = async () => {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          const themeValue = (profileData as any)?.theme;
          if (themeValue) {
            setTheme(themeValue as Theme);
          }
        } catch (error) {
          console.error("Error loading theme preference:", error);
        }
      };

      loadThemeFromDB();
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("tvk-theme", theme);

    // Save to database if user is logged in
    if (user) {
      const saveThemeToDB = async () => {
        try {
          await supabase
            .from("profiles")
            .update({ theme } as any)
            .eq("user_id", user.id);
        } catch (error) {
          console.error("Error saving theme preference:", error);
        }
      };

      saveThemeToDB();
    }
  }, [theme, user]);

  // Apply neon intensity as a CSS variable. Only in light mode; dark stays at 1x.
  useEffect(() => {
    const root = document.documentElement;
    const multiplier = theme === "light" ? neonIntensity / 100 : 1;
    root.style.setProperty("--neon-intensity", String(multiplier));
  }, [neonIntensity, theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, neonIntensity, setNeonIntensity }}>
      {children}
    </ThemeContext.Provider>
  );
};
