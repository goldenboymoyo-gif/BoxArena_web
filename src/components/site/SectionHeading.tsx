import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionHeading({
  title,
  subtitle,
  description,
  actionLabel,
  actionHref,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
            {subtitle}
          </p>
        </div>
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">{description}</p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="group flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
        >
          {actionLabel}
          <ArrowRight className="size-4 text-[#e31b23] transition group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
