import React, { useState } from 'react';
import { Copy, Check, Clock, ExternalLink, ChevronDown, ChevronUp, Hash } from 'lucide-react';
import { ViralScoreRing, CategoryBadge } from './ViralScore.jsx';
import { toast } from './Toast.jsx';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.js';

function CopyButton({ text, label, id, copiedId }) {
  const { copy } = useCopyToClipboard();
  const isCopied = copiedId === id;

  return (
    <button
      onClick={async () => {
        const ok = await copy(text, id);
        if (ok) toast(`${label} copied!`, 'success');
        else toast('Copy failed — try manually', 'error');
      }}
      className="btn-ghost flex items-center gap-1.5 text-xs font-semibold py-2 px-3"
    >
      {isCopied ? (
        <><Check size={13} className="text-kiwi" /><span className="text-kiwi">Copied!</span></>
      ) : (
        <><Copy size={13} /><span>{label}</span></>
      )}
    </button>
  );
}

export function ClipCard({ clip, index, videoId }) {
  const [expanded, setExpanded] = useState(false);
  const { copy, copiedId } = useCopyToClipboard();

  const youtubeLink = `https://www.youtube.com/watch?v=${videoId}&t=${clip.timestamp.replace(':', 'm')}s`;

  const fullCopyText = `🪝 HOOK:\n${clip.hook}\n\n📝 CAPTION:\n${clip.caption}\n\n${clip.hashtags.join(' ')}`;

  return (
    <div
      className="clay-card p-6 flex flex-col gap-4 transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Clip number */}
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center font-display font-extrabold text-sm text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff7040, #ff4500)', boxShadow: '3px 3px 0 0 rgba(180,50,0,0.25)' }}
          >
            {index + 1}
          </div>

          {/* Timestamp */}
          <a
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 clay-card px-3 py-1.5 hover:bg-orange-50 transition-colors group"
          >
            <Clock size={13} className="text-mango" />
            <span className="font-mono text-sm font-bold text-gray-700">{clip.timestamp}</span>
            <ExternalLink size={11} className="text-gray-400 group-hover:text-mango transition-colors" />
          </a>

          <CategoryBadge category={clip.category} />
        </div>

        {/* Viral score */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <ViralScoreRing score={clip.viralScore} category={clip.category} size={52} />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Score</span>
        </div>
      </div>

      {/* ── Why it's viral ────────────────────────────────── */}
      {clip.reason && (
        <p className="text-xs text-gray-500 font-body italic border-l-2 border-orange-200 pl-3">
          {clip.reason}
        </p>
      )}

      {/* ── Hook ─────────────────────────────────────────── */}
      <div className="clay-card-orange p-4 rounded-3xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-display font-bold text-orange-400 uppercase tracking-widest">
            🪝 Hook
          </span>
          <CopyButton text={clip.hook} label="Hook" id={`hook-${clip.id}`} copiedId={copiedId} />
        </div>
        <p className="font-display font-bold text-gray-900 text-lg leading-snug">{clip.hook}</p>
      </div>

      {/* ── Caption ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest">
            📝 Caption
          </span>
          <CopyButton text={clip.caption} label="Caption" id={`cap-${clip.id}`} copiedId={copiedId} />
        </div>
        <p className="font-body text-sm text-gray-600 leading-relaxed">{clip.caption}</p>
      </div>

      {/* ── Hashtags ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Hash size={10} /> Hashtags
          </span>
          <CopyButton text={clip.hashtags.join(' ')} label="Tags" id={`tags-${clip.id}`} copiedId={copiedId} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {clip.hashtags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-mono font-medium"
              style={{ background: '#f0f5ff', color: '#4060c0', border: '1.5px solid #ccd8ff' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Duration + Copy All ──────────────────────────── */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-body">
          ~{clip.clipDuration}s clip
        </span>
        <CopyButton text={fullCopyText} label="Copy All" id={`all-${clip.id}`} copiedId={copiedId} />
      </div>
    </div>
  );
}
