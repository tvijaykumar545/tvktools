import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_BEFORE = 5 * 60 * 1000; // 5 min warning

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];

export const useSessionTimeout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();
  const warningShownRef = useRef(false);

  const handleLogout = useCallback(async () => {
    await signOut();
    toast({
      title: "Session Expired",
      description: "You've been logged out due to inactivity. Please log in again.",
      variant: "destructive",
    });
    navigate("/login");
  }, [signOut, navigate]);

  const resetTimers = useCallback(() => {
    if (!user) return;

    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    warningShownRef.current = false;

    warningRef.current = setTimeout(() => {
      warningShownRef.current = true;
      toast({
        title: "Session Expiring Soon",
        description: "You'll be logged out in 5 minutes due to inactivity.",
      });
    }, SESSION_TIMEOUT - WARNING_BEFORE);

    timeoutRef.current = setTimeout(handleLogout, SESSION_TIMEOUT);
  }, [user, handleLogout]);

  useEffect(() => {
    if (!user) return;

    resetTimers();

    const onActivity = () => {
      resetTimers();
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true })
    );

    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, onActivity)
      );
    };
  }, [user, resetTimers]);
};
