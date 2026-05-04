import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({ message, onRetry }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-10 text-center">
      <div
        className="clay-card p-8 border-2"
        style={{ borderColor: '#ffd0c0', background: 'linear-gradient(135deg, #fff5f2, #fff8f5)' }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: '#fff0ec', boxShadow: '4px 4px 0 0 rgba(255,100,64,0.2)' }}>
          <AlertTriangle size={28} className="text-clay-600" />
        </div>
        <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Something went wrong</h3>
        <p className="font-body text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-clay flex items-center gap-2 mx-auto text-sm py-3 px-6">
            <RefreshCw size={14} />
            Try Again
          </button>
        )}
        <div className="mt-5 p-4 rounded-3xl bg-orange-50 border border-orange-100">
          <p className="text-xs text-orange-700 font-body font-medium">
            💡 Tips: Make sure the video has captions enabled, is public, and is not a live stream.
          </p>
        </div>
      </div>
    </div>
  );
}
