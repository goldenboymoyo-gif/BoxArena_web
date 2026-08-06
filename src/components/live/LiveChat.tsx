"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";

interface ChatMessage {
  id: number;
  name: string;
  text: string;
  self?: boolean;
}

const fans = [
  "BigGuyT",
  "KOQueen88",
  "RingsideSam",
  "TheIronFist",
  "Southpaw_Sim",
  "KidDynamite",
  "MannyPacFan",
  "BoxingBelle",
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

interface LiveChatProps {
  className?: string;
}

export function LiveChat({ className = "" }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, name: "BigGuyT", text: "What a round!! That jab is landing all night." },
    { id: 2, name: "KOQueen88", text: "Inoue is on another level tonight." },
    { id: 3, name: "RingsideSam", text: "Madison Square Garden is absolutely rocking." },
  ]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: fans[Math.floor(Math.random() * fans.length)],
          text: fanLines[Math.floor(Math.random() * fanLines.length)],
        },
      ]);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), name: "You", text, self: true },
    ]);
    setDraft("");
  }

  return (
    <div
      className={`flex h-[440px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111111] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide text-white">
          <MessageCircle className="size-4 text-[#e31b23]" /> Fight Chat
        </h3>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" /> 2,140 online
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((m) => (
          <div key={m.id} className={m.self ? "text-right" : ""}>
            <span
              className={`text-xs font-bold ${
                m.self ? "text-[#e31b23]" : "text-white/60"
              }`}
            >
              {m.name}
            </span>
            <p
              className={`mt-0.5 inline-block rounded-2xl px-3 py-2 text-left text-sm leading-5 ${
                m.self
                  ? "rounded-br-sm bg-[#e31b23]/90 text-white"
                  : "rounded-tl-sm bg-white/5 text-white/85"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-white/10 p-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Join the conversation..."
          className="h-11 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e31b23]/60"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#e31b23] text-white transition hover:bg-[#c3161d]"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
