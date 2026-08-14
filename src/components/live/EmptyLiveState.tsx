import { RadioTower } from "lucide-react";

export function EmptyLiveState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-[#111111] px-6 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full border border-white/10 bg-white/5">
        <RadioTower className="size-7 text-[#e31b23]" />
      </span>
      <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white sm:text-3xl">
        No live fights right now
      </h2>
      <p className="max-w-md text-sm leading-7 text-white/55">
        There are currently no verified free boxing broadcasts available. Check Upcoming Fights for the next events.
      </p>
    </div>
  );
}
