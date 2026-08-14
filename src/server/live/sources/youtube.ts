import type { StreamSource } from "@/shared/live";
import { fetchWithTimeout, type SourceAdapter, type SourceCheckResult } from "../adapter";
import type { RawStreamRecord } from "../raw";

export interface ChannelConfig {
  id: string;
  handle?: string;
  channelId?: string;
  name?: string;
  tier?: 1 | 2 | 3;
}

interface Candidate {
  videoId: string;
  scheduledStartTime?: number;
  live: boolean;
}

function extractChannelId(handle: string): string | null {
  if (handle.startsWith("@")) return handle.slice(1);
  return handle;
}

async function findLiveVideo(baseUrl: string): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(`${baseUrl}/live`);
    const watchMatch = response.url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];
    return null;
  } catch {
    return null;
  }
}

function extractCandidates(html: string): Candidate[] {
  const candidates: Candidate[] = [];
  const videoIdPattern = /"videoId":"([A-Za-z0-9_-]{11})"/g;
  const startPattern = /"scheduledStartTime":(\d{10})/g;
  const ids = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = videoIdPattern.exec(html)) !== null) {
    const id = match[1];
    if (!ids.has(id)) {
      ids.add(id);
      candidates.push({ videoId: id, live: false });
    }
  }
  while ((match = startPattern.exec(html)) !== null) {
    const start = Number(match[1]);
    let best: Candidate | null = null;
    for (const candidate of candidates) {
      if (!candidate.scheduledStartTime) {
        best = candidate;
        break;
      }
    }
    if (!best) best = candidates[candidates.length - 1] ?? null;
    if (best && Math.abs(best.scheduledStartTime ?? 0 - start) > 0) best.scheduledStartTime = start;
  }
  const liveRegex = /"isLiveNow":true|BADGE_STYLE_TYPE_LIVE_NOW|"LIVE"/g;
  while ((match = liveRegex.exec(html)) !== null) {
    const index = match.index;
    let best: Candidate | null = null;
    for (const candidate of candidates) {
      const candidateIndex = html.lastIndexOf(candidate.videoId, index);
      if (candidateIndex >= 0 && index - candidateIndex < 4000) {
        if (!best || index - candidateIndex < index - html.lastIndexOf(best.videoId, index)) {
          best = candidate;
        }
      }
    }
    if (best) best.live = true;
  }
  return candidates;
}

interface OEmbedData {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
}

async function fetchOEmbed(videoId: string): Promise<OEmbedData | null> {
  try {
    const url = `https://www.youtube.com/oembed?format=json&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}`;
    const response = await fetchWithTimeout(url, 5000);
    if (!response.ok) return null;
    return (await response.json()) as OEmbedData;
  } catch {
    return null;
  }
}

export function createYouTubeAdapter(source: StreamSource): SourceAdapter {
  return {
    source,
    async check(): Promise<SourceCheckResult> {
      const channels = Array.isArray(source.config.channels) ? (source.config.channels as unknown[]) : [];
      const records: RawStreamRecord[] = [];
      let lastError: string | undefined;

      for (const entry of channels) {
        const channel = entry as Partial<ChannelConfig>;
        if (!channel) continue;
        const handle = channel.handle ? extractChannelId(channel.handle) : null;
        const base = handle
          ? `https://www.youtube.com/${handle}`
          : channel.channelId
            ? `https://www.youtube.com/channel/${channel.channelId}`
            : null;
        if (!base) continue;
        const channelName = channel.name ?? channel.handle ?? channel.channelId ?? "YouTube";
        const tier = channel.tier ?? 3;

        try {
          const liveVideoId = await findLiveVideo(base);
          if (liveVideoId) {
            const oEmbed = await fetchOEmbed(liveVideoId);
            if (oEmbed && oEmbed.author_name && oEmbed.author_name.toLowerCase() !== channelName.toLowerCase()) {
              continue;
            }
            records.push(
              toRecord({
                videoId: liveVideoId,
                live: true,
                scheduledStartTime: undefined,
                oEmbed,
                channelName,
                tier,
              }),
            );
          }

          let html = "";
          try {
            const streamsResponse = await fetchWithTimeout(`${base}/streams`, 5000);
            html = streamsResponse.ok ? await streamsResponse.text() : "";
          } catch {
            html = "";
          }
          const candidates = extractCandidates(html).filter((candidate) => candidate.videoId !== liveVideoId);
          for (const candidate of candidates.slice(0, 20)) {
            const oEmbed = await fetchOEmbed(candidate.videoId);
            if (!oEmbed?.title) continue;
            if (oEmbed.author_name && oEmbed.author_name.toLowerCase() !== channelName.toLowerCase()) continue;
            records.push(
              toRecord({ ...candidate, oEmbed, channelName, tier }),
            );
          }
        } catch {
          lastError = `Failed to check channel ${channelName}`;
        }
      }

      return { records, error: records.length === 0 ? lastError : undefined };
    },
  };
}

interface RecordInput {
  videoId: string;
  live: boolean;
  scheduledStartTime?: number;
  oEmbed: OEmbedData | null;
  channelName: string;
  tier: 1 | 2 | 3;
}

function toRecord(input: RecordInput): RawStreamRecord {
  const title = input.oEmbed?.title ?? `Live boxing stream`;
  const eventDate = input.scheduledStartTime
    ? new Date(input.scheduledStartTime * 1000).toISOString()
    : undefined;
  return {
    externalId: `yt:${input.videoId}`,
    title,
    eventDate,
    startTimeLabel: eventDate ? new Date(eventDate).toISOString() : undefined,
    timezone: "UTC",
    url: `https://www.youtube.com/watch?v=${input.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${input.videoId}`,
    thumbnail: input.oEmbed?.thumbnail_url ?? null,
    access: "free",
    verificationTier: input.tier,
    status: input.live ? "live" : undefined,
    sourceLabel: `Official YouTube`,
  };
}
