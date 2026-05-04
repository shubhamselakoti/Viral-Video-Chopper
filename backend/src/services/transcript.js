import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extracts the YouTube video ID from various URL formats.
 * Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID
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
 * Fetches and formats the YouTube transcript for a given video ID.
 * Returns transcript as a time-stamped text block ready for LLM consumption.
 */
export async function fetchTranscript(videoId) {
  const raw = await YoutubeTranscript.fetchTranscript(videoId);

  if (!raw || raw.length === 0) {
    throw new Error('No transcript available for this video. It may be disabled or a live stream.');
  }

  // Format: [MM:SS] text
  const formatted = raw.map((entry) => {
    const totalSeconds = Math.floor(entry.offset / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `[${minutes}:${seconds}] ${entry.text}`;
  }).join('\n');

  return {
    formatted,
    duration: raw[raw.length - 1]?.offset / 1000 || 0,
    wordCount: raw.reduce((acc, e) => acc + e.text.split(' ').length, 0),
  };
}
