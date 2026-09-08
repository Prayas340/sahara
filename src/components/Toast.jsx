'use client';

import { useState, useEffect } from 'react';

let toastCallback = null;

export function showToast(message, type = 'info', duration = 4000) {
  if (toastCallback) {
    toastCallback(message, type, duration);
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastCallback = (message, type, duration) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    const handleEvent = (e) => {
      if (e.detail) {
        showToast(e.detail.message, e.detail.type, e.detail.duration);
      }
    };
    window.addEventListener('sahara:toast', handleEvent);

    return () => {
      toastCallback = null;
      window.removeEventListener('sahara:toast', handleEvent);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 max-w-[90vw] w-[460px] pointer-events-none">
      {toasts.map((toast) => {
        let icon = 'info';
        let iconColor = 'text-[#0d631b]';
        let borderColor = 'border-[#cdf2cb]';

        if (toast.type === 'success') {
          icon = 'check_circle';
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          icon = 'error';
          iconColor = 'text-red-600';
          borderColor = 'border-red-200';
        } else if (toast.type === 'heart') {
          icon = 'favorite';
          iconColor = 'text-rose-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white/95 backdrop-blur-md text-[#032109] border ${borderColor} shadow-xl rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all animate-bounce-short`}
          >
            <span className={`material-symbols-outlined text-2xl ${iconColor}`}>
              {icon}
            </span>
            <p className="text-xs sm:text-sm font-semibold flex-1 leading-snug">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
