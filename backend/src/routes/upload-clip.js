/**
 * POST /api/upload-clip
 * Accepts a video upload + timestamp, cuts clip with FFmpeg, streams MP4 back.
 * Auto-detects FFmpeg path for Windows, Mac, Linux, and Render/cloud.
 */
import { Router } from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const router = Router();
const TMP = os.tmpdir();

// ─── Auto-detect FFmpeg ───────────────────────────────────────────
function detectFfmpeg() {
  // 1. Explicit env var (highest priority)
  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    console.log('[FFmpeg] Using FFMPEG_PATH env:', process.env.FFMPEG_PATH);
    return;
  }

  // 2. ffmpeg-static npm package (works on all platforms without install)
  try {
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
      ffmpeg.setFfmpegPath(ffmpegStatic);
      console.log('[FFmpeg] Using ffmpeg-static:', ffmpegStatic);
      return;
    }
  } catch (_) {}

  // 3. System PATH
  const candidates = os.platform() === 'win32'
    ? ['ffmpeg.exe', 'C:\\ffmpeg\\bin\\ffmpeg.exe', 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe']
    : ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg', 'ffmpeg'];

  for (const c of candidates) {
    try {
      execSync(`"${c}" -version`, { stdio: 'ignore', timeout: 3000 });
      ffmpeg.setFfmpegPath(c);
      console.log('[FFmpeg] Found at:', c);
      return;
    } catch (_) {}
  }

  console.warn('[FFmpeg] Not found on system. Install FFmpeg or set FFMPEG_PATH env var.');
}

// Run detection (sync-ish via top-level await alternative)
detectFfmpeg();

// ─── Multer ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: TMP,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `vvc_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) return cb(null, true);
    cb(new Error('Only video files accepted'));
  },
});

// ─── Timestamp → seconds ──────────────────────────────────────────
function tsToSec(ts = '00:00') {
  const p = ts.split(':').map(Number);
  if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2];
  return (p[0]||0)*60 + (p[1]||0);
}

// ─── Route ───────────────────────────────────────────────────────
router.post('/upload-clip', upload.single('video'), async (req, res) => {
  const { timestamp = '00:00', duration = 45, hookTitle = 'clip' } = req.body;
  const videoPath = req.file?.path;

  if (!videoPath) return res.status(400).json({ error: 'No video file uploaded.' });

  const startSec  = tsToSec(timestamp);
  const durSec    = Math.min(180, Math.max(5, Number(duration)));
  const safeTitle = hookTitle.replace(/[^a-z0-9_\-\s]/gi, '').trim().slice(0, 50) || 'clip';
  const outName   = `${safeTitle.replace(/\s+/g,'_')}_${timestamp.replace(':','-')}.mp4`;

  console.log(`[UploadClip] ${req.file.originalname} @${timestamp} for ${durSec}s → ${outName}`);

  // Check FFmpeg is available
  try {
    const { getFfmpegPath } = ffmpeg;
    // fluent-ffmpeg throws if binary not found when you try to run
  } catch (_) {}

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
  res.setHeader('X-Clip-Start', startSec);
  res.setHeader('X-Clip-Duration', durSec);

  const pass = new PassThrough();

  const cmd = ffmpeg(videoPath)
    .setStartTime(startSec)
    .setDuration(durSec)
    .outputOptions([
      '-c:v libx264',
      '-c:a aac',
      '-preset ultrafast',
      '-crf 23',
      '-movflags frag_keyframe+empty_moov',
      '-avoid_negative_ts make_zero',
    ])
    .format('mp4')
    .on('start', cmd => console.log('[FFmpeg] Start:', cmd.slice(0, 80)))
    .on('error', err => {
      console.error('[FFmpeg Error]', err.message);
      fs.unlink(videoPath, () => {});
      if (!res.headersSent) {
        res.status(500).json({
          error: 'ffmpeg_not_found',
          message: err.message.includes('Cannot find') || err.message.includes('ENOENT')
            ? 'FFmpeg is not installed on this server. Please install FFmpeg or set the FFMPEG_PATH environment variable pointing to the ffmpeg binary.'
            : `FFmpeg failed: ${err.message}`,
        });
      }
    })
    .on('end', () => {
      console.log('[FFmpeg] Done:', outName);
      fs.unlink(videoPath, () => {});
    });

  cmd.pipe(pass, { end: true });
  pass.pipe(res);
});

export default router;
