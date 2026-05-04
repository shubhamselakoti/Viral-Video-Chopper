import React, { useState } from 'react';
import { Scissors, Sparkles, Youtube, ArrowRight, Zap } from 'lucide-react';

const EXAMPLE_URLS = [
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
];

export function Hero({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) onSubmit(url.trim());
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 px-4">

      {/* ── Decorative background blobs ─── */}
      <div className="blob w-96 h-96 bg-mango top-[-120px] left-[-100px] animate-float-slow" />
      <div className="blob w-80 h-80 bg-grape top-[-60px] right-[-80px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="blob w-64 h-64 bg-sky bottom-[-80px] left-[40%] animate-float-slow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        {/* ── Badge ─── */}
        <div className="inline-flex items-center gap-2 clay-card px-4 py-2 mb-8 animate-bounce-in">
          <Zap size={14} className="text-mango fill-mango" />
          <span className="font-body text-sm font-semibold text-gray-600 tracking-wide uppercase">
            AI-Powered Viral Clip Detector
          </span>
          <Sparkles size={14} className="text-grape" />
        </div>

        {/* ── Headline ─── */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-5">
          <span className="text-gray-900">Chop your videos</span>
          <br />
          <span
            className="relative inline-block"
            style={{
              background: 'linear-gradient(135deg, #ff7040 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            into viral clips
          </span>
          <span className="text-gray-900"> ✂️</span>
        </h1>

        <p className="font-body text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Paste any YouTube URL. Our AI finds the most viral moments,
          writes scroll-stopping hooks, captions &amp; hashtags — in seconds.
        </p>

        {/* ── Input form ─── */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <div
            className="clay-card p-2 flex items-center gap-3 transition-all duration-300"
            style={focused ? { boxShadow: '8px 8px 0 0 rgba(255,112,64,0.2), 0 0 0 4px rgba(255,112,64,0.1), inset 0 1px 0 rgba(255,255,255,0.9)' } : {}}
          >
            <div className="flex items-center gap-2 pl-3 shrink-0">
              <Youtube size={22} className="text-red-500" />
            </div>

            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Paste YouTube URL here..."
              className="flex-1 bg-transparent outline-none font-body text-base text-gray-800 placeholder:text-gray-400 min-w-0"
              required
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-clay flex items-center gap-2 shrink-0 text-sm py-3 px-6"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Scissors size={16} />
                  <span>Chop It</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* ── Stats pills ─── */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            { icon: '🎬', text: '5–8 viral clips' },
            { icon: '🪝', text: 'Scroll-stopping hooks' },
            { icon: '📝', text: 'Blog summary' },
            { icon: '🔥', text: 'Viral score' },
            { icon: '#️⃣', text: 'Auto hashtags' },
          ].map(item => (
            <div key={item.text} className="clay-card px-4 py-2 flex items-center gap-2">
              <span className="text-sm">{item.icon}</span>
              <span className="font-body text-xs font-medium text-gray-600">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
