"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Pin, Send, Shield } from "lucide-react";

interface ChatMessage {
  id: number;
  name: string;
  text: string;
  self?: boolean;
  mod?: boolean;
  reaction?: boolean;
  colorId: number;
}

interface LiveChatProps {
  className?: string;
}

const MAX_MESSAGES = 60;
const SLOW_MODE_SECONDS = 8;

const avatarColors = [
  "from-[#e31b23] to-[#7a0d10]",
  "from-[#f5c518] to-[#a5810a]",
  "from-[#22c55e] to-[#15803d]",
  "from-[#38bdf8] to-[#0369a1]",
  "from-[#a78bfa] to-[#6d28d9]",
  "from-[#fb923c] to-[#c2410c]",
];

const fans: { name: string; mod?: boolean }[] = [
  { name: "BigGuyT" },
  { name: "KOQueen88" },
  { name: "RingsideSam", mod: true },
  { name: "TheIronFist" },
  { name: "Southpaw_Sim" },
  { name: "KidDynamite" },
  { name: "MannyPacFan" },
  { name: "BoxingBelle" },
  { name: "Ringcraft_Official", mod: true },
];

const fanLines = [
  "What a round!! That jab is landing all night.",
  "Inoue is on another level tonight.",
  "Madison Square Garden is absolutely rocking.",
  "My heart can't take these close rounds.",
  "Who else is watching alone?",
  "Rounds 10-12 are going to be a war.",
  "That body work is paying off big time.",
  "This is why I love this sport.",
  "Calling a stoppage in the 10th round.",
  "Footwork masterclass happening right now.",
  "Ref needs to watch the clinching.",
  "That counter was picture perfect.",
];

const reactions = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Applause" },
  { emoji: "😂", label: "Haha" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "💀", label: "Knockout" },
];

const pinnedMessage =
  "Round 12 — judges scorecards are in. All three see it 115-113.";

let nextId = 100;

export function LiveChat({ className = "" }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, name: "Ringcraft_Official", text: "Welcome to fight night! Be respectful, no spoilers, and enjoy the show. 🥊", mod: true, colorId: 0 },
    { id: 2, name: "BigGuyT", text: "What a round!! That jab is landing all night.", colorId: 1 },
    { id: 3, name: "KOQueen88", text: "Inoue is on another level tonight.", colorId: 2 },
  ]);
  const [draft, setDraft] = useState("");
  const [viewers, setViewers] = useState(2140);
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function pushMessage(msg: Omit<ChatMessage, "id">) {
    setMessages((prev) => {
      const next = [...prev, { ...msg, id: nextId++ }];
      return next.length > MAX_MESSAGES
        ? next.slice(next.length - MAX_MESSAGES)
        : next;
    });
  }

  useEffect(() => {
    const id = setInterval(() => {
      const fan = fans[Math.floor(Math.random() * fans.length)];
      pushMessage({
        name: fan.name,
        mod: fan.mod,
        colorId: Math.floor(Math.random() * avatarColors.length),
        text: fanLines[Math.floor(Math.random() * fanLines.length)],
      });
    }, 7000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setViewers((v) =>
        Math.max(
          1980,
          v + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 7 + 1)
        )
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (cooldown === 0) return;
    const id = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function sendMessage(text: string) {
    if (cooldown > 0) return;
    pushMessage({ name: "You", text, self: true, colorId: 0 });
    setCooldown(SLOW_MODE_SECONDS);
  }

  function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || cooldown > 0) return;
    sendMessage(text);
    setDraft("");
  }

  return (
    <div
      className={`flex h-[440px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111111] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide text-white">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#e31b23] opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-[#e31b23]" />
          </span>
          <MessageCircle className="size-4 text-[#e31b23]" /> Fight Chat
        </h3>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />{" "}
          {viewers.toLocaleString()} online
        </span>
      </div>

      <div className="flex items-center gap-2 border-b border-[#f5c518]/20 bg-[#f5c518]/10 px-4 py-2">
        <Pin className="size-3.5 shrink-0 text-[#f5c518]" />
        <p className="truncate text-xs font-medium text-[#f5c518]/90">
          {pinnedMessage}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${
              m.self ? "flex-row-reverse" : ""
            }`}
          >
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br ${
                avatarColors[m.colorId % avatarColors.length]
              } text-[10px] font-bold text-white`}
            >
              {m.name.slice(0, 1).toUpperCase()}
            </span>
            <div
              className={`flex min-w-0 flex-col ${
                m.self ? "items-end" : "items-start"
              }`}
            >
              <span className="flex items-center gap-1 text-[11px] font-bold text-white/55">
                {m.name}
                {m.mod && (
                  <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-emerald-400">
                    <Shield className="size-2.5" /> Mod
                  </span>
                )}
              </span>
              <p
                className={`mt-0.5 inline-block max-w-[88%] text-sm leading-5 ${
                  m.reaction
                    ? "bg-transparent px-0 py-0 text-2xl leading-7"
                    : m.self
                      ? "rounded-2xl rounded-br-sm bg-[#e31b23]/90 px-3 py-2 text-white"
                      : "rounded-2xl rounded-tl-sm bg-white/5 px-3 py-2 text-white/85"
                }`}
              >
                {m.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t border-white/10 px-3 pt-2.5">
        {reactions.map((r) => (
          <button
            key={r.emoji}
            type="button"
            aria-label={r.label}
            onClick={() => sendMessage(r.emoji)}
            disabled={cooldown > 0}
            className="grid size-8 cursor-pointer place-items-center rounded-full text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {r.emoji}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
          Slow mode · 1 msg / {SLOW_MODE_SECONDS}s
        </span>
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            cooldown > 0
              ? `Slow mode — wait ${cooldown}s...`
              : "Join the conversation..."
          }
          className="h-11 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e31b23]/60"
        />
        <button
          type="submit"
          disabled={cooldown > 0 || !draft.trim()}
          aria-label="Send message"
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#e31b23] text-white transition hover:bg-[#c3161d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cooldown > 0 ? (
            <span className="text-xs font-bold">{cooldown}</span>
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
}
