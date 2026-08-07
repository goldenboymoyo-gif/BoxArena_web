"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onSubmitted?: () => void;
}

export function SearchForm({
  className,
  inputClassName,
  placeholder = "Search fights, fighters, events...",
  onSubmitted,
}: SearchFormProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    onSubmitted?.();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn("flex items-center", className)}
    >
      <Search className="size-4 shrink-0 text-white/50" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className={cn(
          "w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/40",
          inputClassName
        )}
      />
    </form>
  );
}
