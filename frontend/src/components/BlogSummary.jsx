import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.js';
import { toast } from './Toast.jsx';

export function BlogSummary({ content }) {
  const [open, setOpen] = useState(false);
  const { copy, copiedId } = useCopyToClipboard();

  return (
    <div className="clay-card overflow-hidden mb-8">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #6d28d9)', boxShadow: '3px 3px 0 0 rgba(100,50,200,0.25)' }}
          >
            <FileText size={18} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-gray-900">Blog Post Summary</h3>
            <p className="text-xs text-gray-500 font-body">AI-generated — ready to publish</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const ok = await copy(content, 'blog');
              if (ok) toast('Blog summary copied!', 'success');
            }}
            className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1"
          >
            {copiedId === 'blog'
              ? <><Check size={12} className="text-kiwi" /><span className="text-kiwi">Copied</span></>
              : <><Copy size={12} /><span>Copy</span></>
            }
          </button>
          {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {/* Collapsible content */}
      {open && (
        <div
          className="px-6 pb-6 prose prose-sm max-w-none font-body text-gray-700"
          style={{ '--tw-prose-headings': '#1a1a1a', '--tw-prose-bold': '#1a1a1a' }}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
