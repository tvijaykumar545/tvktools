import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const DAILY_LIMIT = 5;
const STORAGE_KEY = "tvk_guest_usage";

interface UsageData {
  date: string;
  count: number;
}

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getStoredUsage = (): UsageData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: UsageData = JSON.parse(raw);
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), count: 0 };
};

export const useUsageLimit = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData>(getStoredUsage);

  useEffect(() => {
    // Refresh if date changed
    const current = getStoredUsage();
    if (current.date !== usage.date) setUsage(current);
  }, []);

  const remaining = user ? Infinity : Math.max(0, DAILY_LIMIT - usage.count);
  const isLimitReached = !user && usage.count >= DAILY_LIMIT;

  const consumeUsage = useCallback(() => {
    if (user) return true; // logged-in users have unlimited
    const current = getStoredUsage();
    if (current.count >= DAILY_LIMIT) return false;
    const updated = { date: getTodayKey(), count: current.count + 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUsage(updated);
    return true;
  }, [user]);

  return { remaining, isLimitReached, consumeUsage, dailyLimit: DAILY_LIMIT, isGuest: !user };
};
