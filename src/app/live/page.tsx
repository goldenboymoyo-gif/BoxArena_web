import { LiveFeed } from "@/components/live/LiveFeed";

export const metadata = {
  title: "Live Fights",
  description:
    "Watch live boxing from verified official sources — federations, promoters and free public broadcasts — plus the full upcoming schedule.",
};

export default function LivePage() {
  return <LiveFeed />;
}
