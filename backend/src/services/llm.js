/**
 * Free AI Provider Service
 * Supports: Hugging Face, Groq, OpenRouter
 * Robust JSON parsing that handles malformed/truncated LLM output
 */

// ─── Prompt ───────────────────────────────────────────────────────
function buildViralPrompt(transcript, videoTitle = '') {
  return `You are a viral content expert. Analyze this YouTube transcript and find 5-7 viral clip moments.

${videoTitle ? `Video: ${videoTitle}` : ''}

TRANSCRIPT:
${transcript.slice(0, 1500)}

Return ONLY a valid JSON array. No markdown, no explanation, no extra text.
Start with [ and end with ].

Each object must have these exact keys:
- "timestamp": string like "01:23"
- "clipDuration": number (seconds, 15-60)
- "hook": string (viral opening line, under 12 words)
- "caption": string (2-3 sentence social caption with CTA)
- "hashtags": array of 5 strings starting with #
- "viralScore": number 1-100
- "category": one of: shocking, funny, educational, inspiring, controversial, relatable, general
- "reason": string (one sentence why this is viral)

IMPORTANT: Return ONLY the JSON array. No text before or after.`;
}

function buildBlogPrompt(transcript, videoTitle = '') {
  return `Write a short blog summary (100-140 words) for this YouTube video.

${videoTitle ? `Video: ${videoTitle}` : ''}

TRANSCRIPT:
${transcript.slice(0, 1500)}

Write: one opening paragraph, three bullet points starting with •, one closing sentence.
Return plain text only.`;
}

// ─── Robust JSON parser ───────────────────────────────────────────
function parseClips(rawText) {
  // Strip markdown fences
  let cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // Find first [ … ] block
  const start = cleaned.indexOf('[');
  if (start === -1) throw new Error('No JSON array found in AI response.');

  // Try progressively shorter slices if JSON is truncated
  let jsonStr = cleaned.slice(start);

  // Strategy 1: full parse
  try {
    const clips = JSON.parse(jsonStr);
    return sanitizeClips(clips);
  } catch (_) {}

  // Strategy 2: find last complete object by scanning backwards for }]
  const lastClose = jsonStr.lastIndexOf('}');
  if (lastClose !== -1) {
    const candidate = jsonStr.slice(0, lastClose + 1) + ']';
    try {
      const clips = JSON.parse(candidate);
      if (Array.isArray(clips) && clips.length > 0) return sanitizeClips(clips);
    } catch (_) {}
  }

  // Strategy 3: extract individual objects with a regex
  const objectMatches = [];
  const objRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}/g;
  let m;
  while ((m = objRegex.exec(jsonStr)) !== null) {
    try {
      const obj = JSON.parse(m[0]);
      if (obj.hook && obj.timestamp) objectMatches.push(obj);
    } catch (_) {}
  }
  if (objectMatches.length > 0) return sanitizeClips(objectMatches);

  throw new Error('Could not parse AI response. Try again — the model may have returned malformed JSON.');
}

function sanitizeClips(clips) {
  if (!Array.isArray(clips) || clips.length === 0) {
    throw new Error('AI returned no clips. Try a longer video with more content.');
  }
  return clips.map((clip, idx) => ({
    id: idx + 1,
    timestamp:    String(clip.timestamp || '00:00').replace(/[^\d:]/g, ''),
    clipDuration: Math.min(120, Math.max(10, Number(clip.clipDuration) || 30)),
    hook:         String(clip.hook || '').trim().slice(0, 200),
    caption:      String(clip.caption || '').trim().slice(0, 600),
    hashtags:     Array.isArray(clip.hashtags) ? clip.hashtags.slice(0, 8).map(String) : [],
    viralScore:   Math.min(100, Math.max(1, Number(clip.viralScore) || 50)),
    category:     String(clip.category || 'general').toLowerCase(),
    reason:       String(clip.reason || '').trim().slice(0, 300),
  }));
}

// ─── Providers ────────────────────────────────────────────────────
async function callHuggingFace(prompt) {
  const model = 'mistralai/Mistral-7B-Instruct-v0.3';
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `<s>[INST] ${prompt} [/INST]`,
      parameters: { max_new_tokens: 1800, temperature: 0.4, return_full_text: false, do_sample: true },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 503) throw new Error('AI model is warming up (cold start). Wait 20s and retry.');
    throw new Error(`Hugging Face error (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
  if (data?.generated_text) return data.generated_text;
  if (data?.error) throw new Error(`HF: ${data.error}`);
  throw new Error('Unexpected Hugging Face response format.');
}

async function callGroq(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a viral content expert. When asked for JSON, return ONLY the raw JSON array with no markdown, no code fences, no explanation. Never truncate — always complete the full JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1800,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenRouter(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://viral-video-chopper.app',
      'X-Title': 'Viral Video Chopper',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error (${res.status})`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAI(prompt) {
  const provider = (process.env.AI_PROVIDER || 'huggingface').toLowerCase();
  console.log(`[LLM] Provider: ${provider}`);
  if (provider === 'groq')        return callGroq(prompt);
  if (provider === 'openrouter')  return callOpenRouter(prompt);
  return callHuggingFace(prompt);
}

// ─── Exports ──────────────────────────────────────────────────────
export async function analyzeTranscript(transcript, videoTitle = '') {
  const raw = await callAI(buildViralPrompt(transcript, videoTitle));
  console.log('[LLM] Raw response length:', raw.length);
  return parseClips(raw);
}

export async function generateBlogSummary(transcript, videoTitle = '') {
  const raw = await callAI(buildBlogPrompt(transcript, videoTitle));
  return raw.trim();
}
