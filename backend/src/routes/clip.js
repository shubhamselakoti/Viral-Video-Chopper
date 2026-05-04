/**
 * Clip download route
 * POST /api/clip  — streams an FFmpeg-trimmed MP4 clip to the client
 *
 * Strategy:
 *  1. Try ytdl-core to get a streamable video URL
 *  2. Pipe through FFmpeg with -ss / -t for the timestamp window
 *  3. Stream the result directly — no temp files on disk
 *
 * If ytdl-core fails (YouTube blocks the server IP, common on Render free tier),
 * we return a structured error so the frontend can show the "open on YouTube" fallback.
 */

import { Router } from 'express';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';

const router = Router();

/** Convert "MM:SS" or "HH:MM:SS" to total seconds */
function tsToSeconds(ts) {
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

router.post('/clip', async (req, res) => {
  const { videoId, timestamp, duration = 45, title = 'clip' } = req.body;

  if (!videoId || !timestamp) {
    return res.status(400).json({ error: 'videoId and timestamp are required.' });
  }

  const startSec = tsToSeconds(timestamp);
  const durationSec = Math.min(Number(duration) || 45, 120); // cap at 2min
  const safeTitle = title.replace(/[^a-z0-9_-]/gi, '_').slice(0, 40);

  console.log(`[Clip] ${videoId} @ ${timestamp} for ${durationSec}s`);

  let videoUrl;
  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    // Pick best mp4 format with both video+audio, under 720p for speed
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestvideo',
      filter: f => f.container === 'mp4' && f.hasAudio && f.hasVideo,
    }) || ytdl.chooseFormat(info.formats, { quality: '18' }); // 360p fallback

    videoUrl = format.url;
  } catch (err) {
    console.warn('[Clip] ytdl-core failed:', err.message);
    // Return structured error — frontend will show YouTube fallback button
    return res.status(422).json({
      error: 'direct_download_unavailable',
      message: 'YouTube is blocking direct download from this server. Use the "Open on YouTube" link to watch and download manually.',
      youtubeLink: `https://www.youtube.com/watch?v=${videoId}&t=${startSec}s`,
    });
  }

  // Set response headers for download
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_${timestamp.replace(':', '-')}.mp4"`);
  res.setHeader('X-Clip-Start', startSec);
  res.setHeader('X-Clip-Duration', durationSec);

  const passThrough = new PassThrough();

  ffmpeg(videoUrl)
    .setStartTime(startSec)
    .setDuration(durationSec)
    .outputOptions([
      '-c:v libx264',
      '-c:a aac',
      '-preset ultrafast',   // fastest encoding, smaller file
      '-crf 23',             // quality (18=high, 28=low)
      '-movflags frag_keyframe+empty_moov', // streamable MP4
    ])
    .format('mp4')
    .on('error', err => {
      console.error('[FFmpeg] Error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'FFmpeg processing failed: ' + err.message });
      }
    })
    .pipe(passThrough, { end: true });

  passThrough.pipe(res);
});

export default router;
