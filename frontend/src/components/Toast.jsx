import React, { useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={18} className="text-kiwi" />,
  error:   <XCircle size={18} className="text-red-500" />,
  warning: <AlertTriangle size={18} className="text-lemon" />,
};

function Toast({ toast, onRemove }) {
  return (
    <div
      className="clay-card flex items-center gap-3 px-5 py-3.5 min-w-[280px] animate-bounce-in"
      style={{ boxShadow: '5px 5px 0 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)' }}
    >
      {ICONS[toast.type] || ICONS.success}
      <span className="font-body text-sm font-medium text-gray-800 flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// Global toast store (simple singleton pattern)
let toastListeners = [];
let toastId = 0;

export function toast(message, type = 'success') {
  const id = ++toastId;
  toastListeners.forEach(fn => fn({ id, message, type }));
  return id;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  // Register listener on mount
  React.useEffect(() => {
    const handler = (t) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter(fn => fn !== handler); };
  }, []);

  const remove = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {toasts.map(t => <Toast key={t.id} toast={t} onRemove={remove} />)}
    </div>
  );
}
