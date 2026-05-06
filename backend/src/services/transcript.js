import { Video } from '../database/db.js';
import 'dotenv/config';

export function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      return urlObj.pathname.slice(1).split('?')[0];
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (urlObj.pathname.startsWith('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1].split('?')[0];
      }
      return urlObj.searchParams.get('v');
    }

    return null;
  } catch {
    return null;
  }
}


export async function fetchTranscript(videoId) {
  if (!videoId) throw new Error("Invalid video ID");

  const existing = await Video.findOne({ videoId });

  if (existing) {
    return {
      raw: existing.raw,
      ...existing.processed,
      title: existing.raw?.metadata?.title,
      language: existing.raw?.language,
      fromCache: true,
    };
  }

  const url = `https://transcriptapi.com/api/v2/youtube/transcript?video_url=${videoId}&format=json`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.YOUTUBE_TRANSCRIPT_API}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Transcript API error: HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data?.transcript?.length) {
    throw new Error("No transcript available");
  }

  const formatted = data.transcript
    .map((e) => {
      const sec = Math.floor(e.start);
      const m = String(Math.floor(sec / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      return `[${m}:${s}] ${e.text}`;
    })
    .join("\n");

  const duration =
    (data.transcript.at(-1)?.start || 0) +
    (data.transcript.at(-1)?.duration || 0);

  const wordCount = data.transcript.reduce(
    (acc, e) => acc + e.text.split(/\s+/).length,
    0
  );

  await Video.findOneAndUpdate(
    { videoId },
    {
      videoId,
      raw: data,
      processed: {
        formatted,
        wordCount,
        duration,
        clips: [],
        blogSummary: "",
      },
    },
    { upsert: true }
  );

  return {
    raw: data,
    formatted,
    duration,
    wordCount,
    title: data.metadata?.title,
    language: data.language,
    fromCache: false,
  };
}