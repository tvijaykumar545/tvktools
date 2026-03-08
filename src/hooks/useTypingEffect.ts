import { useState, useEffect, useRef } from "react";

export const useTypingEffect = (text: string, speed = 20) => {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, isTyping: displayed.length < text.length };
};
