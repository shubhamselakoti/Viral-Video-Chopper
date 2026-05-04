import React from 'react';
import { BookOpen, Clock, Scissors, Trophy } from 'lucide-react';

function StatItem({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-3">
      <div className="flex items-center gap-2">
        <span className="text-mango">{icon}</span>
        <span className="font-display font-extrabold text-2xl text-gray-900">{value}</span>
      </div>
      <span className="font-body text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</span>
    </div>
  );
}

export function StatsBar({ stats, videoId }) {
  const minutes = Math.floor(stats.duration / 60);
  const seconds = stats.duration % 60;
  const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="clay-card p-2 mb-8 overflow-hidden">
      <div className="flex items-stretch justify-around divide-x divide-gray-100">
        <StatItem
          icon={<Scissors size={18} />}
          value={stats.clipsFound}
          label="Viral Clips"
        />
        <StatItem
          icon={<Clock size={18} />}
          value={durationStr}
          label="Video Length"
        />
        <StatItem
          icon={<BookOpen size={18} />}
          value={stats.wordCount.toLocaleString()}
          label="Words Analyzed"
        />
        <div className="flex flex-col items-center justify-center px-6 py-3">
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs font-semibold py-2 px-4 flex items-center gap-2"
          >
            <span>▶</span> Watch Video
          </a>
        </div>
      </div>
    </div>
  );
}
