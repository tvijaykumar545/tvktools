import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
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

  // Load theme from database when user logs in
  useEffect(() => {
    if (user) {
      const loadThemeFromDB = async () => {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("theme")
            .eq("user_id", user.id)
            .single();

          if (profileData?.theme) {
            setTheme(profileData.theme as Theme);
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
            .update({ theme })
            .eq("user_id", user.id)
            .select();
        } catch (error) {
          console.error("Error saving theme preference:", error);
        }
      };

      saveThemeToDB();
    }
  }, [theme, user]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
