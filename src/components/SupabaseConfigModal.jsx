'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabase.js';
import { showToast } from './Toast.jsx';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const cfg = supabaseService.getConfig();
      setUrl(cfg.url || '');
      setKey(cfg.key || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim()) {
      showToast('Please provide a valid Supabase project URL', 'error');
      return;
    }
    supabaseService.saveConfig(url.trim(), key.trim());
    showToast('Supabase settings saved and synchronized!', 'success');
    onClose();
  };

  const handleReset = () => {
    supabaseService.resetConfig();
    const cfg = supabaseService.getConfig();
    setUrl(cfg.url);
    setKey(cfg.key);
    showToast('Reset to default Sahara cloud project.', 'info');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#cdf2cb] space-y-5 animate-scale-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">database</span>
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-[#032109]">Supabase Cloud Sync</h2>
              <p className="text-xs text-[#40493d]">Live cross-device state management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#032109] mb-1">Project URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-4 py-2.5 rounded-xl border border-[#cdf2cb] bg-[#ebffe7]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#032109] mb-1">Anon / Public API Key</label>
            <textarea
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOi..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#cdf2cb] bg-[#ebffe7]/30 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#cdf2cb]">
          <button
            onClick={handleReset}
            type="button"
            className="text-xs font-bold text-gray-500 hover:text-gray-700 underline cursor-pointer"
          >
            Reset to Sahara Default
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="btn-tactile btn-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Save & Reconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
