import React from 'react';

function SkeletonCard({ delay = 0 }) {
  return (
    <div
      className="clay-card p-6 space-y-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="shimmer h-6 w-20 rounded-full" />
        <div className="shimmer h-8 w-8 rounded-2xl" />
      </div>

      {/* Viral score badge */}
      <div className="flex items-center gap-3">
        <div className="shimmer h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="shimmer h-4 w-3/4 rounded-full" />
          <div className="shimmer h-3 w-1/2 rounded-full" />
        </div>
      </div>

      {/* Hook */}
      <div className="space-y-2">
        <div className="shimmer h-3 w-16 rounded-full" />
        <div className="shimmer h-5 w-full rounded-2xl" />
        <div className="shimmer h-5 w-4/5 rounded-2xl" />
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <div className="shimmer h-3 w-16 rounded-full" />
        <div className="shimmer h-4 w-full rounded-xl" />
        <div className="shimmer h-4 w-full rounded-xl" />
        <div className="shimmer h-4 w-2/3 rounded-xl" />
      </div>

      {/* Hashtags */}
      <div className="flex gap-2 flex-wrap">
        {[80, 100, 65, 90].map(w => (
          <div key={w} className={`shimmer h-7 rounded-full`} style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <div className="shimmer h-10 flex-1 rounded-2xl" />
        <div className="shimmer h-10 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Processing indicator */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="clay-card px-6 py-3 flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-mango animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="font-body text-sm font-medium text-gray-600">
            AI is scanning your video for viral moments...
          </span>
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="clay-card p-4 mb-8 flex items-center justify-around">
        {[1,2,3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="shimmer h-7 w-14 rounded-xl" />
            <div className="shimmer h-3 w-20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 150, 300, 450].map(delay => (
          <SkeletonCard key={delay} delay={delay} />
        ))}
      </div>
    </div>
  );
}
