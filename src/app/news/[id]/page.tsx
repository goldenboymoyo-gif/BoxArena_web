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

// Hand-written per-article bodies. Every story gets its own angle and structure
// instead of one template stretched over different headlines.
const articleBodies: Record<string, ArticleSection[]> = {
  "usyk-zhang-official": [
    {
      heading: "What's Been Confirmed",
      paragraphs: [
        "Turki Alalshikh made it official on Wednesday: Oleksandr Usyk defends the undisputed heavyweight championship against Zhilei Zhang on October 17 in Riyadh, closing out a Riyadh Season card that's been rumored since the summer.",
        "It's Usyk's first voluntary defense since unifying all four belts, and the first time he's faced a genuine southpaw puncher at this weight. Zhang's win over Deontay Wilder is still the loudest knockout of the division's last two years.",
      ],
    },
    {
      heading: "The Southpaw Problem",
      paragraphs: [
        "Usyk has never lost a professional fight, but he's also never shared a ring with someone Zhang's size who can switch a fight off with one shot. At 6'6\" and with a jab that discouraged Wilder from letting his hands go, Zhang is the rare opponent who doesn't need Usyk to make a mistake — he just needs one opening.",
        "For Usyk's team, the calculation is that footwork and volume beat power over twelve rounds. Riyadh gets to find out which read is right.",
      ],
    },
  ],
  "canelo-crawford-presser": [
    {
      heading: "What Happened at the Podium",
      paragraphs: [
        "The Madison Square Garden kickoff press conference stayed civil for about four minutes. Then Crawford, sitting a few feet from Canelo, said flatly that Álvarez had \"never fought anyone like me,\" and the room's tone changed for good.",
        "Canelo didn't raise his voice — he rarely does — but he leaned into the mic and reminded Crawford that he's the one moving up in weight to chase this fight. That line got the loudest reaction of the afternoon.",
      ],
    },
    {
      heading: "Why the Tension Is Real",
      paragraphs: [
        "This isn't manufactured heat. Crawford is undefeated and jumping two weight classes to face a naturally bigger, naturally stronger champion, and everyone in that room knows the size gap is the actual story heading into September 12.",
        "Both camps leave New York with fight week dates locked and a rivalry that no longer needs the microphones to keep it going.",
      ],
    },
  ],
  "inoe-nakatani-announced": [
    {
      heading: "The Matchup",
      paragraphs: [
        "Naoya Inoue will face Junto Nakatani at the Tokyo Dome — two undefeated Japanese champions, two different weight classes on paper, and a fight that promoter Bob Arum is already calling the biggest in Asian boxing history.",
        "Nakatani has never lost as a professional and has stopped nearly every fighter who's stood in front of him. He's also never faced anything close to Inoue's hand speed or finishing instinct.",
      ],
    },
    {
      heading: "Why It's Bigger Than a Title Fight",
      paragraphs: [
        "Japan has produced champions before, but never two active pound-for-pound talents on a collision course at the same time. The Tokyo Dome card is being built as a national event, not just a boxing card — expect the kind of crossover attention Naoya's last few fights only hinted at.",
      ],
    },
  ],
  "dubois-parker-fight-week": [
    {
      heading: "The Schedule",
      paragraphs: [
        "Daniel Dubois and Joseph Parker meet at Wembley on November 7, and fight week runs the usual gauntlet: grand arrivals Monday, head-to-head press conference Wednesday, weigh-in Friday afternoon, ring walks Saturday night London time.",
        "For UK fans that means an early-evening main event; for US viewers, expect the broadcast to land mid-afternoon East Coast.",
      ],
    },
    {
      heading: "What's at Stake",
      paragraphs: [
        "Dubois is defending home turf and a belt in front of a Wembley crowd that's turned into one of the loudest atmospheres in the sport. Parker, a former titleholder himself, is the most live puncher Dubois has faced since his win over Anthony Joshua.",
      ],
    },
  ],
  "joshua-fury-presser": [
    {
      heading: "The Face-Off",
      paragraphs: [
        "Anthony Joshua and Tyson Fury stood chest to chest in London on Monday, and Joshua didn't blink first. \"I retired Fury once,\" he said, \"I'll do it again\" — a direct callback to their first fight and a line clearly aimed at getting under Fury's skin.",
        "Fury answered the way he usually does: with volume. He promised a \"Gypsy King reset\" and spent most of his time at the mic talking about the version of himself that beat Wladimir Klitschko, not the one who struggled in recent outings.",
      ],
    },
    {
      heading: "December 5 at Tottenham",
      paragraphs: [
        "Whatever was said in that room, the fight itself is the real story: two heavyweights who've already shared a ring once, both insisting the rematch goes differently, in front of what's expected to be one of the largest gates in British boxing this year.",
      ],
    },
  ],
  "lomachenko-retirement": [
    {
      heading: "No Goodbye Yet",
      paragraphs: [
        "Vasiliy Lomachenko shut down retirement talk this week, telling reporters \"I still move like I'm 28\" after his win over Nakatani. The three-division champion says he wants one more meaningful run at lightweight before he's done.",
        "It's a familiar position for Lomachenko — he's been written off before, usually right before a career-best performance.",
      ],
    },
    {
      heading: "What a Title Run Would Take",
      paragraphs: [
        "The lightweight division isn't short on names. Whoever ends up across the ring from him will be significantly younger, which is exactly the kind of test Lomachenko says he wants to answer before he walks away on his own terms.",
      ],
    },
  ],
  "rankings-august-update": [
    {
      heading: "The Big Move",
      paragraphs: [
        "Terence Crawford jumps Canelo Álvarez in our pound-for-pound top ten this month, the direct result of his one-sided win over Israil Madrimov and a quiet stretch for Canelo since his last title defense.",
        "It's the first time Crawford has held the top spot outright since moving up from welterweight, and it puts extra weight on his September 12 date with Canelo — a literal chance to settle the argument in the ring.",
      ],
    },
    {
      heading: "Who Else Rose and Fell",
      paragraphs: [
        "Naoya Inoue holds steady at the top of the list regardless of weight class talk. Further down, a strong summer for the light-heavyweight and super-middleweight contenders pushed two new names into our top ten for the first time this year.",
      ],
    },
  ],
  "benavidez-morrell-review": [
    {
      heading: "How It Played Out",
      paragraphs: [
        "David Benavidez did what he always does: walked forward, cut off the ring, and made David Morrell work for every inch of it. Morrell's jab kept the fight competitive through the midrounds, but Benavidez's pressure and body work eventually broke the rhythm that had carried Morrell to that point.",
        "It wasn't a blowout, but it was decisive enough that there's no argument left to make about who won.",
      ],
    },
    {
      heading: "What It Sets Up",
      paragraphs: [
        "The result does what everyone expected: it puts Benavidez back in the conversation for a Canelo Álvarez unification fight at 168 pounds, a matchup that's been circling for two years without either side committing to a date.",
      ],
    },
  ],
  "shererz-explained": [
    {
      heading: "The Ten-Point Must System",
      paragraphs: [
        "Every round, each judge scores the fight independently. The winner of the round gets 10 points; the loser gets 9, or fewer if there's a knockdown or a point deduction. Even rounds don't officially exist — judges are required to pick a winner every time.",
        "Three factors matter more than anything else: clean, effective punching; ring generalship (who's controlling distance and pace); and defense. Aggression only counts if it actually lands.",
      ],
    },
    {
      heading: "Where New Fans Get It Wrong",
      paragraphs: [
        "The most common mistake is scoring for activity instead of effectiveness — a fighter throwing more punches isn't automatically winning the round if most of them are blocked or miss. Judges are watching for what connects clean, not what looks busy.",
        "A single knockdown usually decides a round outright (10-8), even if the fighter who scored it did little else for the other two minutes.",
      ],
    },
  ],
  "ticket-scalping-crackdown": [
    {
      heading: "How the New System Works",
      paragraphs: [
        "Ringcraft's new entry system pairs every ticket to a facial scan taken at purchase, checked again at the gate. If the face at the door doesn't match the name on the ticket, that ticket doesn't get in — no exceptions, no reselling around it.",
        "It launches with Canelo vs Crawford at Madison Square Garden, one of the most scalped tickets of the year before this rule existed.",
      ],
    },
    {
      heading: "Why Now",
      paragraphs: [
        "The WBC has pushed for stricter resale controls after fans paid multiples of face value for recent title fights, often from bots that bought out inventory in minutes. Ringcraft and the WBC are betting the extra step at the door is worth it if it keeps prices closer to what's actually printed on the ticket.",
      ],
    },
  ],
  "tyson-still-the-baddest": [
    {
      heading: "Thirty Years Later",
      paragraphs: [
        "Mike Tyson turns 60 this year, three decades removed from the version of him that ended fights in under two minutes. And yet no heavyweight since — not Klitschko, not Fury, not Usyk — has managed to take his spot as the sport's most recognizable face.",
        "Part of it is the highlight reel. Part of it is that Tyson's rise and fall happened entirely in public, in a way that made him feel less like an athlete and more like a character everyone had an opinion about.",
      ],
    },
    {
      heading: "The Mark He Left",
      paragraphs: [
        "Every heavyweight who's come up since has been measured against him in some way — for power, for aura, for the ability to end a night with one punch. Whatever era boxing is in now, it's still partly being narrated in reference to his.",
      ],
    },
  ],
  "shakur-davis-presser": [
    {
      heading: "Two Undefeated Records, One Ring",
      paragraphs: [
        "Shakur Stevenson and Gervonta Davis meet at Allegiant Stadium in what's shaping up to be the most-discussed lightweight fight in years — a boxer's boxer against a puncher who ends careers early.",
        "Trainer \"Bam Bam\" Roach broke down the styles clash at the press conference: Stevenson's jab and lateral movement against Davis's ability to close distance and land in bursts. \"Whoever solves the other guy's first minute wins the fight,\" Roach said.",
      ],
    },
    {
      heading: "The Case for Both Sides",
      paragraphs: [
        "Stevenson has never really been hit clean by anyone at this level, which makes him hard to read out. Davis has never needed more than a few rounds to find a finish. Odds favor Davis by a narrow margin, but this is the rare fight where either result would surprise almost no one.",
      ],
    },
  ],
  "womens-boxing-boom": [
    {
      heading: "The Numbers Don't Lie",
      paragraphs: [
        "Five fights this year alone sold out arenas that used to treat women's boxing as an undercard formality. Prime-time television slots that once went automatically to the men's main event are now getting handed to the best available matchup, period.",
      ],
    },
    {
      heading: "What Changed",
      paragraphs: [
        "It's not one breakout star — it's depth. Multiple weight classes now have two or three fighters capable of headlining on their own, which means promoters finally have real matchups to sell instead of one-off spectacles. That's the difference between a moment and a trend, and 2026 has made the case for the latter.",
      ],
    },
  ],
  "spence-ortiz-official": [
    {
      heading: "The Comeback",
      paragraphs: [
        "Errol Spence Jr. returns after three years away to face Vergil Ortiz Jr. in a 154-pound eliminator — a fight that answers one question immediately: is there anything left of the fighter who used to be the most avoided man in the welterweight division?",
        "Ortiz isn't the kind of opponent you pick for an easy return. He's heavy-handed, comes forward, and has stopped almost everyone who's shared a ring with him.",
      ],
    },
    {
      heading: "What's Really Being Tested",
      paragraphs: [
        "Spence's chin and reflexes took a beating in his last two fights before the layoff. This isn't really about whether \"The Truth\" can still box — it's about whether his body will let him prove it against someone who won't give him a slow round to find out.",
      ],
    },
  ],
};

function buildSections(article: ReturnType<typeof getNewsArticle>): ArticleSection[] {
  if (!article) return [];
  return (
    articleBodies[article.id] ?? [
      {
        heading: "The Story",
        paragraphs: [article.excerpt],
      },
    ]
  );
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
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 py-10 lg:px-8">
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

      <article className="mx-auto max-w-[1440px] px-4 sm:px-6 py-12 lg:px-8">
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
