import { Router } from 'express';
import { extractVideoId, fetchTranscript } from '../services/transcript.js';
import { analyzeTranscript, generateBlogSummary } from '../services/llm.js';

const router = Router();

/**
 * POST /api/analyze
 * Body: { url: string, videoTitle?: string }
 * Returns: { clips: [], blogSummary: string, videoId: string, stats: {} }
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { url, videoTitle } = req.body;

    // ── Validate input ───────────────────────────────────────────────────────
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid YouTube URL.' });
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL. Please paste a valid YouTube video link.' });
    }

    console.log(`[Analyze] Processing video: ${videoId}`);

    // ── Fetch Transcript ─────────────────────────────────────────────────────
    let transcriptData;
    try {
      transcriptData = await fetchTranscript(videoId);
    } catch (err) {
      console.error('[Transcript Error]', err.message);
      return res.status(422).json({
        error: err.message || 'Could not fetch transcript. The video may have no captions or be private.',
      });
    }

    console.log(`[Analyze] Transcript fetched: ${transcriptData.wordCount} words`);

    // ── Analyze with LLM (parallel) ──────────────────────────────────────────
    const [clips, blogSummary] = await Promise.all([
      analyzeTranscript(transcriptData.formatted, videoTitle),
      generateBlogSummary(transcriptData.formatted, videoTitle),
    ]);

    console.log(`[Analyze] Found ${clips.length} viral clips`);

    // ── Respond ───────────────────────────────────────────────────────────────
    res.json({
      videoId,
      clips,
      blogSummary,
      stats: {
        wordCount: transcriptData.wordCount,
        duration: Math.round(transcriptData.duration),
        clipsFound: clips.length,
      },
    });
  } catch (err) {
    console.error('[Analyze Error]', err);
    next(err);
  }
});

export default router;
