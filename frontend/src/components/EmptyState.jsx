import React from 'react';
import { Scissors, Zap, Hash, FileText } from 'lucide-react';

const FEATURES = [
  { icon: <Scissors size={22} className="text-mango" />, title: '5–8 Viral Clips', desc: 'AI detects peak engagement moments' },
  { icon: <Zap size={22} className="text-grape" />,      title: 'Viral Scores',    desc: 'Each clip rated 1–100 for impact' },
  { icon: <span className="text-2xl">🪝</span>,           title: 'Scroll-stopping hooks', desc: 'Written to stop the scroll instantly' },
  { icon: <Hash size={22} className="text-sky" />,        title: 'Auto Hashtags',  desc: 'Relevant tags for max reach' },
  { icon: <FileText size={22} className="text-kiwi" />,   title: 'Blog Summary',   desc: 'Ready-to-publish article excerpt' },
];

export function EmptyState() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="clay-card p-10 text-center mb-10">
        <div className="text-6xl mb-4 animate-float inline-block">✂️</div>
        <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">Paste a YouTube URL above to begin</h2>
        <p className="font-body text-gray-500 text-sm max-w-sm mx-auto">
          We'll analyze the transcript and deliver AI-powered viral clips in under 30 seconds.
        </p>
      </div>

      <h3 className="font-display font-bold text-lg text-gray-700 mb-5 text-center">What you'll get</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="clay-card p-5 flex gap-4 items-start animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className="w-11 h-11 rounded-3xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '3px 3px 0 0 rgba(0,0,0,0.08)' }}
            >
              {f.icon}
            </div>
            <div>
              <h4 className="font-display font-bold text-gray-800 text-sm mb-0.5">{f.title}</h4>
              <p className="font-body text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
