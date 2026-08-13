"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pugnera_followed";

export function useFollowedFighters() {
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setFollowedIds(JSON.parse(raw) as string[]);
      } catch {
        // ignore corrupted storage
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isFollowed = useCallback(
    (id: string) => followedIds.includes(id),
    [followedIds]
  );

  const toggleFollow = useCallback((id: string) => {
    setFollowedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return { followedIds, hydrated, isFollowed, toggleFollow };
}
