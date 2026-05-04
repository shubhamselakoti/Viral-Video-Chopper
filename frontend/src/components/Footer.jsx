import React from 'react';
import { Scissors } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-orange-100 py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ff7040, #ff4500)' }}
          >
            <Scissors size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-gray-700">Viral Video Chopper</span>
        </div>
        <p className="font-body text-xs text-gray-400">
          Powered by Claude AI · Built with React + Tailwind
        </p>
      </div>
    </footer>
  );
}
