const API_KEY = process.env.YOUTUBE_TRANSCRIPT_API;

/**
 * Extracts the YouTube video ID from various URL formats.
 */
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

/**
 * Fetches and formats transcript using external API
 */
export async function fetchTranscript(videoId) {
  if (!videoId) {
    throw new Error("Invalid video ID");
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

  if (!data?.transcript || data.transcript.length === 0) {
    throw new Error("No transcript available for this video.");
  }

  const formatted = data.transcript
    .map((entry) => {
      const totalSeconds = Math.floor(entry.start);
      const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (totalSeconds % 60)
        .toString()
        .padStart(2, "0");

      return `[${minutes}:${seconds}] ${entry.text}`;
    })
    .join("\n");

  return {
    formatted,
    duration:
      (data.transcript.at(-1)?.start || 0) +
      (data.transcript.at(-1)?.duration || 0),
    wordCount: data.transcript.reduce(
      (acc, e) => acc + e.text.split(/\s+/).length,
      0
    ),
    title: data.metadata?.title || "Unknown Title",
    language: data.language,
  };
}