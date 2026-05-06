<div align="center">

<img src="product_images/title.svg" alt="Viral Video Chopper" />

<br/>

**Turn any YouTube video into scroll-stopping viral clips — instantly.**

AI finds the sharpest moments, writes hooks & captions, then cuts the exact MP4 for you.

<br/>

[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo?style=flat-square)](LICENSE)
[![Free AI](https://img.shields.io/badge/AI-100%25_Free-22c55e?style=flat-square)](https://huggingface.co)
[![No Signup](https://img.shields.io/badge/No_Signup-Required-f97316?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-818cf8?style=flat-square)](CONTRIBUTING.md)

<br/>

[**Live Demo**](https://viral-video-chopper.netlify.app)

<br/>

---

</div>

## ✨ What It Does

Paste a YouTube URL (or upload your own video file). In under **30 seconds**, you get:

| Output | Description |
|--------|-------------|
| ✂️ **5–8 Viral Clips** | Exact timestamps of the highest-impact moments |
| 🪝 **Scroll-Stopping Hooks** | Under 12 words — engineered to stop the scroll |
| 📝 **Full Captions** | 2-3 sentences with emotional arc and CTA |
| 🔥 **Viral Score (1–100)** | AI-rated by emotional impact and shareability |
| `#️⃣` **Auto Hashtags** | 5–7 trending tags per clip |
| ↓ **Downloadable MP4 Clips** | FFmpeg-cut to exact timestamp — no editing needed |
| 📄 **Blog Post Summary** | SEO-ready article excerpt in markdown |

<br/>

---

## 🖼 Preview

<div align="center">

### ☀️ Light Mode · 🌙 Dark Mode · 📱 Mobile Responsive

```
┌─────────────────────────────────────────────────────────┐
│  ✂️ Viral Video Chopper                         ☀️  ●  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Turn any video into                                   │
│   viral clips instantly                                 │
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │  🔗 YouTube URL  │  📁 Upload Video             │  │
│   ├─────────────────────────────────────────────────┤  │
│   │  https://youtube.com/watch?v=...   [✂️ Chop It] │  │
│   └─────────────────────────────────────────────────┘  │
│                                                         │
│   🎬 Timestamps  🪝 Hooks  🔥 Scores  ↓ Download       │
└─────────────────────────────────────────────────────────┘
```

</div>

<br/>

---
## Architecture

<img src="/product_images/viral_video_chopper_architecture.svg" alt="archiecture_image">

---
## Workflow

<img src="/product_images/viral_video_chopper_flow.svg" alt="workflow_image">

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **FFmpeg** — for clip cutting ([install guide](#-ffmpeg-setup))
- A **free AI API key** — [Groq](https://console.groq.com), [Hugging Face](https://huggingface.co/settings/tokens), or [OpenRouter](https://openrouter.ai)

### 1 · Clone

```bash
git clone https://github.com/YOUR_USERNAME/viral-video-chopper.git
cd viral-video-chopper
```

### 2 · Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your free API key:

```env
# Pick ONE provider
AI_PROVIDER=groq                        # groq | huggingface | openrouter
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx  # fastest free option

PORT=3001
FRONTEND_URL=http://localhost:5173
```

```bash
npm install
npm run dev
# ✅ API running on http://localhost:3001
```

### 3 · Frontend setup

```bash
# In a new terminal
cd frontend
npm install
npm run dev
# ✅ App running on http://localhost:5173
```

Open **http://localhost:5173**, paste a YouTube URL, and hit ✂️ **Chop It**.

<br/>

---

## 🔑 Getting Free API Keys

### Option 1 — Groq ⚡ *(Recommended — fastest)*

> **Free, no credit card, no cold start.**

1. Sign up at [console.groq.com](https://console.groq.com)
2. Go to **API Keys → Create API Key**
3. Copy key (starts with `gsk_`) → paste in `.env` as `GROQ_API_KEY`
4. Set `AI_PROVIDER=groq`

Uses **Llama 3 70B** — blazing fast, generous free tier.

---

### Option 2 — Hugging Face 🤗 *(Default)*

> **Free, but has cold starts (~20s first request).**

1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click **"+ Create new token"** → choose **Fine-grained**
3. Enable these two permissions:
   - ✅ **Make calls to Inference Providers**
   - ✅ **Read access to contents of all public gated repos**
4. Copy key (starts with `hf_`) → paste as `HUGGINGFACE_API_KEY`
5. Set `AI_PROVIDER=huggingface`

> 💡 The cold-start loader on the frontend handles the ~20s warm-up automatically — users see a friendly animated progress screen instead of a timeout.

---

### Option 3 — OpenRouter 🌐

> **Free tier with multiple model choices.**

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. **Keys → Create Key**
3. Copy key (starts with `sk-or-`) → paste as `OPENROUTER_API_KEY`
4. Set `AI_PROVIDER=openrouter`

Uses `mistralai/mistral-7b-instruct:free`.

<br/>

---

## ⚙️ FFmpeg Setup

FFmpeg is required for the **clip download** feature. The app auto-detects it in this order:

1. `FFMPEG_PATH` environment variable *(highest priority)*
2. `ffmpeg-static` npm package *(bundled — no system install needed)*
3. Common system paths (`/usr/bin/ffmpeg`, homebrew, Windows `C:\ffmpeg\bin\...`)

#### Install FFmpeg by platform

```bash
# macOS (Homebrew)
brew install ffmpeg

# Ubuntu / Debian
sudo apt update && sudo apt install ffmpeg

# Windows (winget)
winget install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg
```

Or set the path manually in `.env`:

```env
FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe
```

> If FFmpeg is not found, the app shows a helpful error message with installation instructions — other features still work normally.

<br/>

---

## 📁 Project Structure

```
viral-video-chopper/
│
├── README.md
├── .gitignore
│
├── frontend/                         # React + Vite + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                   # Main app + full landing page
│       ├── main.jsx
│       ├── index.css                 # Design token system (light + dark)
│       ├── utils/
│       │   └── api.js                # Backend API calls
│       └── components/
│           ├── ColdStartLoader.jsx   # Animated cold-start screen
│           ├── Toast.jsx             # Toast notification system
│           └── ...
│
└── backend/                          # Node.js + Express
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js                  # Express server + route registration
        ├── routes/
        │   ├── analyze.js            # POST /api/analyze
        │   ├── clip.js               # POST /api/clip (YouTube → FFmpeg)
        │   └── upload-clip.js        # POST /api/upload-clip (file → FFmpeg)
        └── services/
            ├── transcript.js         # YouTube transcript fetcher
            └── llm.js                # Multi-provider AI + robust JSON parser
```

<br/>

---

## 🧠 How the AI Analysis Works

```
YouTube URL or Video File
         │
         ▼
  Extract Video ID
         │
         ▼
  Fetch Transcript          ← youtube-transcript npm package
  [MM:SS] caption text…
         │
         ▼
  Send to LLM               ← Groq / HuggingFace / OpenRouter
         │
    ┌────▼────────────────────────────────────┐
    │  System: "Return ONLY raw JSON array"   │
    │  Prompt: transcript + viral detection   │
    │          instructions                   │
    └────┬────────────────────────────────────┘
         │
         ▼
  Robust JSON Parser         ← 3-strategy fallback parser
  (handles truncated output)    full → trim → regex-extract
         │
         ▼
  [{ timestamp, hook, caption, hashtags,
     viralScore, category, reason, clipDuration }]
         │
         ▼
  Parallel: Blog Summary     ← second LLM call
         │
         ▼
  Return to Frontend
```

### Viral Detection Criteria

The LLM prompt instructs the model to find moments with:

- 😱 **Emotional peaks** — surprising, shocking, funny, inspiring
- 💬 **Quotable lines** — punchy statements worth clipping
- 🎯 **Curiosity gaps** — moments that demand "what happens next"
- 💡 **Aha moments** — high-value insights delivered quickly
- 🔥 **Controversy triggers** — debate-sparking statements

<br/>

---

## 📋 API Reference

### `POST /api/analyze`

Analyze a YouTube video and return viral clips.

**Request**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "videoTitle": "Optional title for better context"
}
```

**Response**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "clips": [
    {
      "id": 1,
      "timestamp": "01:23",
      "clipDuration": 28,
      "hook": "Nobody told you this and it changes everything",
      "caption": "This was the moment that shifted everything...",
      "hashtags": ["#viral", "#mindblown", "#fyp"],
      "viralScore": 94,
      "category": "shocking",
      "reason": "Unexpected reveal creates immediate curiosity gap"
    }
  ],
  "blogSummary": "Markdown blog post...",
  "stats": {
    "wordCount": 2341,
    "duration": 767,
    "clipsFound": 7
  }
}
```

---

### `POST /api/clip`

Download a clip from a YouTube video using ytdl-core + FFmpeg.

**Request**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "timestamp": "01:23",
  "duration": 28,
  "title": "Nobody told you this"
}
```

**Response** → `video/mp4` stream (download)

> ⚠️ If YouTube blocks the server IP (common on Render free tier), returns a structured fallback:
> ```json
> { "error": "direct_download_unavailable", "youtubeLink": "...", "message": "..." }
> ```
> The frontend then shows a [save-tube.com](https://save-tube.com) link as an alternative.

---

### `POST /api/upload-clip`

Cut a clip from an **uploaded video file** using FFmpeg. No YouTube needed.

**Request** — `multipart/form-data`
```
video      File       Video file (MP4, MOV, AVI, MKV — up to 2GB)
timestamp  string     "01:23"
duration   number     28
hookTitle  string     "Nobody told you this"
```

**Response** → `video/mp4` stream (download)

---

### `GET /health`

Health check.

```json
{ "status": "ok", "ts": 1717000000000 }
```

<br/>

---

## 🌐 Deployment

### Frontend → Netlify

```bash
cd frontend
npm run build
# Drag the dist/ folder to netlify.com
# OR connect GitHub repo with:
#   Build command:  npm run build
#   Publish dir:    dist
```

Add environment variable in Netlify dashboard:
```
VITE_API_URL = https://your-backend.onrender.com/api
```

---

### Backend → Render

1. Push repo to GitHub
2. New → **Web Service** → connect repo → set **Root Directory:** `backend`
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add environment variables:

```
AI_PROVIDER         = groq
GROQ_API_KEY        = gsk_xxxxxxxxxxxxxxxxxxxx
FRONTEND_URL        = https://your-site.netlify.app
NODE_ENV            = production
```

> 💤 **Cold start note:** Render free tier sleeps after 15 min of inactivity. The app's animated cold-start loader handles this gracefully — it shows users a friendly phased progress screen so they don't think it's broken.

<br/>

---

## 🔄 Cold Start Behaviour

Both Render (free tier) and Hugging Face have cold starts. Here's what to expect:

| Service | Cold Start Time | After First Request |
|---------|----------------|---------------------|
| Render (free) | ~10–30 seconds | Instant (stays warm while active) |
| Hugging Face | ~20–60 seconds | Fast (~2–5s) |
| Groq | ✅ None | Always instant |

The `ColdStartLoader` component detects slow responses and shows a phased animated screen:

```
🚀 Waking up the server     → Render backend spinning up
🧠 Loading the AI model     → HuggingFace model container booting
📜 Fetching transcript      → YouTube captions being pulled
⚡ Scanning for viral moments → LLM processing the transcript
```

Each phase shows real step-by-step messages, a progress ring, and rotating viral content tips.

<br/>

---

## ⚠️ Known Limitations

| Limitation | Workaround |
|------------|------------|
| Video must have captions | Use auto-generated captions or upload manually captioned videos |
| Video must be public | Private/unlisted videos cannot be transcribed |
| YouTube may block clip download on server | Use [save-tube.com](https://save-tube.com) to download, then upload |
| Very long videos (2h+) get truncated transcripts | Works best on videos under 60 minutes |
| Free AI rate limits | Switch to Groq for effectively unlimited free usage |

<br/>

---

## 🛠 Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PROVIDER` | ✅ | `groq` · `huggingface` · `openrouter` |
| `GROQ_API_KEY` | If using Groq | From console.groq.com |
| `HUGGINGFACE_API_KEY` | If using HF | From huggingface.co/settings/tokens |
| `OPENROUTER_API_KEY` | If using OR | From openrouter.ai |
| `PORT` | No | Defaults to `3001` |
| `FRONTEND_URL` | No | CORS origin, defaults to `http://localhost:5173` |
| `FFMPEG_PATH` | No | Absolute path to ffmpeg binary |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL — defaults to `/api` (proxied in dev) |

<br/>

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request
```

**Ideas for contributions:**
- 🌍 Multi-language transcript support
- 📊 Analytics dashboard for clip performance
- 🎨 Custom clip thumbnail generation
- 📅 Scheduled posting integration (Buffer, Later)
- 🔗 Direct TikTok / Reels upload via API

<br/>

---

## 📄 License

[MIT](LICENSE) — do whatever you want with it. A ⭐ is appreciated if this saved you time!

<br/>

---

<div align="center">

**Built with ❤️ using free, open-source AI**

[Hugging Face](https://huggingface.co) · [Groq](https://groq.com) · [OpenRouter](https://openrouter.ai) · [React](https://react.dev) · [FFmpeg](https://ffmpeg.org)

<br/>

*If you found this useful, give it a ⭐ on GitHub — it helps others discover the project.*

</div>
