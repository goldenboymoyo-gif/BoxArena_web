"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ringcraft_theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(() => {
    try {
      return (
        typeof window !== "undefined" &&
        localStorage.getItem(STORAGE_KEY) === "light"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    try {
      localStorage.setItem(STORAGE_KEY, light ? "light" : "dark");
    } catch {
      // ignore storage errors
    }
  }, [light]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setLight((v) => !v)}
      aria-label={light ? "Switch to dark theme" : "Switch to white theme"}
      suppressHydrationWarning
    >
      {light ? (
        <Sun className="size-4.5 text-white/80" />
      ) : (
        <Moon className="size-4.5 text-white/80" />
      )}
    </Button>
  );
}
