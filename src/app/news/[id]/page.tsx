import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Eye,
  Flame,
  MessageCircle,
  Tag,
  ThumbsUp,
} from "lucide-react";
import { NewsCard } from "@/components/cards/NewsCard";
import { getNewsArticle, latestNews } from "@/data/news";
import { formatViews, timeAgo } from "@/lib/format";
import { resolveImage } from "@/lib/resolveImage";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return latestNews.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = getNewsArticle(id);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

function buildSections(article: ReturnType<typeof getNewsArticle>): ArticleSection[] {
  if (!article) return [];
  const tagLine = article.tags.join(" and ");
  return [
    {
      heading: "The Story",
      paragraphs: [
        article.excerpt,
        `The story dominating the ${article.category.toLowerCase()} beat right now centres on ${tagLine}. For Ringcraft's editorial team, it is a fight — and a storyline — that has been building for months, and tonight's news changes the picture across every division it touches.`,
      ],
    },
    {
      heading: "What It Means",
      paragraphs: [
        `Strip away the hype and the mechanics are straightforward: this is a matchup that the top of the division has been circling for some time. ${tagLine} now carry the weight of consequence, and the fighters involved know exactly what is at stake.`,
        `Boxing rewards the calculated risk. Across the sport, contenders are judged on the opponents they accept and the risks they take. Announcements of this size ripple through the rankings, the betting markets and the matchmaking conversations that happen behind closed doors.`,
      ],
    },
    {
      heading: "The Wider Picture",
      paragraphs: [
        `This story does not exist in isolation. In the weeks since it broke, promoters, broadcasters and governing bodies have all weighed in, and the ripple effects are already visible across ${article.tags[0] ?? "the division"}. Fans — the people who pay the bills and fill the arenas — have made their feelings clear in the comment sections and on social media.`,
        `Ringcraft will keep this story updated as it develops. For now, the reaction is unanimous: this is the kind of news that makes a career, and it sets up a stretch of boxing that nobody wants to miss.`,
      ],
    },
  ];
}

export default async function NewsArticlePage({ params }: Props) {
  const { id } = await params;
  const article = getNewsArticle(id);
  if (!article) notFound();

  const sections = buildSections(article);
  const img = resolveImage(article.image);
  const related = latestNews.filter((a) => a.id !== article.id).slice(0, 6);

  return (
    <div className="text-white">
      {/* Breadcrumb */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-10 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-white/25">/</span>
            <Link href="/news" className="transition hover:text-white">News</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="max-w-[260px] truncate text-white/70">
              {article.title}
            </span>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-[1440px] px-6 py-12 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main column */}
          <div className="min-w-0">
            {/* Hero image */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10">
              <img
                src={img}
                alt={article.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 flex items-center gap-2">
                <span className="rounded-full bg-[#e31b23] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  {article.category}
                </span>
                {article.breaking && (
                  <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-[#e31b23]/60 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff6b6b] backdrop-blur-md">
                    <Flame className="size-3" /> Breaking
                  </span>
                )}
              </div>
            </div>

            {/* Headline */}
            <div className="mt-8">
              <h1 className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {article.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/55">
                <span className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-xs font-bold uppercase text-white/80">
                    {article.author
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-xs text-white/40">By</span>
                    <span className="font-semibold text-white/80">
                      {article.author}
                    </span>
                  </span>
                </span>
                <span>{timeAgo(article.publishedAt)}</span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-4 text-[#e31b23]" />{" "}
                  {article.readMinutes} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="size-4 text-[#e31b23]" />{" "}
                  {formatViews(article.views)}
                </span>
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="size-4 text-[#e31b23]" />{" "}
                  {formatViews(article.likes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="size-4 text-[#e31b23]" />{" "}
                  {formatViews(article.comments)} comments
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="mt-10 space-y-10">
              {sections.map((section, i) => (
                <section key={i}>
                  <h2 className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-wide text-white">
                    <span className="h-7 w-1 rounded-full bg-[#e31b23]" />
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="mt-4 text-[15px] leading-8 text-white/70"
                    >
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-white/10 pt-8">
              <Tag className="size-4 text-[#e31b23]" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70"
                >
                  #{tag.replace(/\s+/g, "")}
                </span>
              ))}
            </div>

            {/* Back */}
            <div className="mt-12">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
              >
                <ArrowLeft className="size-4" /> Back to newsroom
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                More stories
              </p>
            </div>
            <div className="mt-5 space-y-3">
              {related.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href={`/news/${a.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111111] p-4 transition hover:border-[#e31b23]/40"
                >
                  <span className="font-display text-3xl font-bold text-white/15 group-hover:text-[#e31b23]">
                    {String(related.indexOf(a) + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e31b23]">
                      {a.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold uppercase leading-snug tracking-wide text-white">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/45">
                      {timeAgo(a.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        {/* Related grid */}
        <div className="mt-20 border-t border-white/10 pt-14">
          <div className="flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
              Related
            </p>
            <h2 className="ml-3 font-display text-2xl font-semibold uppercase tracking-wide text-white">
              Keep Reading
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
