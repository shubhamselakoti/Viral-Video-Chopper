import React from 'react';

const CATEGORY_COLORS = {
  shocking:      { ring: '#ff4500', bg: '#fff1ee', text: '#cc3700' },
  funny:         { ring: '#ffd166', bg: '#fffbee', text: '#a87900' },
  educational:   { ring: '#4ecdc4', bg: '#edfffe', text: '#1a9a92' },
  inspiring:     { ring: '#6bcb77', bg: '#edfff0', text: '#248a30' },
  controversial: { ring: '#a78bfa', bg: '#f5f3ff', text: '#6c4fd1' },
  relatable:     { ring: '#f06595', bg: '#fff0f5', text: '#c41d5a' },
  general:       { ring: '#ff7040', bg: '#fff8f5', text: '#c04020' },
};

const CATEGORY_EMOJI = {
  shocking:      '😱',
  funny:         '😂',
  educational:   '🧠',
  inspiring:     '🌟',
  controversial: '🔥',
  relatable:     '💯',
  general:       '✨',
};

export function ViralScoreRing({ score, category = 'general', size = 56 }) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f0e8df" strokeWidth={5}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-extrabold text-sm leading-none" style={{ color: colors.ring }}>
          {score}
        </span>
      </div>
    </div>
  );
}

export function CategoryBadge({ category }) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
  const emoji = CATEGORY_EMOJI[category] || '✨';
  return (
    <span
      className="pill text-xs font-bold"
      style={{ background: colors.bg, borderColor: colors.ring + '33', color: colors.text }}
    >
      <span>{emoji}</span>
      <span className="capitalize">{category}</span>
    </span>
  );
}
