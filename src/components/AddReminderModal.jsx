'use client';

import { useState } from 'react';
import { dataStore } from '../services/dataStore.js';
import { showToast } from './Toast.jsx';
import { db, normalizeElderId } from '../lib/firebaseClient.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AddReminderModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [category, setCategory] = useState('medication');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a reminder title', 'error');
      return;
    }

    const newMed = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      name: title.trim(),
      detail: detail.trim() || 'Daily schedule',
      scheduledTime: time || '08:00 AM',
      taken: false,
      takenAt: null,
      category,
    };

    dataStore.addReminder(newMed);

    // Sync directly to Firestore dailyLogs
    if (db) {
      try {
        const activeUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_active_user') || 'null') : null;
        const patient = dataStore.getPatient ? dataStore.getPatient() : dataStore.state?.patient;
        const elderId = activeUser?.linkedElder?.phone || activeUser?.linkedElder?.id || activeUser?.linkedElder?.email || activeUser?.phone || activeUser?.id || patient?.phone || patient?.id || patient?.email || '+919854012345';
        const cleanElderId = normalizeElderId(elderId);
        const todayDate = new Date().toISOString().split('T')[0];
        const updatedList = dataStore.getMedicines ? dataStore.getMedicines() : [];
        const formattedRoutines = updatedList.map(m => ({ id: m.id, title: m.title || m.name, completed: Boolean(m.taken), completedAt: m.takenAt || null }));

        setDoc(doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate), {
          medications: updatedList,
          routines: formattedRoutines,
          updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
        }, { merge: true }).catch(() => {});

        setDoc(doc(db, 'elders', cleanElderId), {
          medications: updatedList,
          routines: formattedRoutines,
          updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
        }, { merge: true }).catch(() => {});

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sahara:medicines-change', { detail: { medicines: updatedList } }));
        }
      } catch (err) {
        console.warn('Firestore reminder sync warning:', err);
      }
    }

    // Explicitly persist to server DB endpoint
    try {
      const activeUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_active_user') || 'null') : null;
      const elderId = activeUser?.linkedElder?.id || activeUser?.linkedElder?.phone || activeUser?.phone || dataStore.state?.patient?.phone;
      const caregiverEmail = activeUser?.email || activeUser?.caregiverEmail || dataStore.state?.caregiver?.email;
      if (elderId || caregiverEmail) {
        fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', elderId, caregiverEmail, reminder: newMed }),
        }).catch(() => {});
      }
    } catch (e) {}

    showToast(`✓ Added reminder: "${title}" for ${time}`, 'success', 3500);
    setTitle('');
    setDetail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#cdf2cb] space-y-5 animate-scale-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">add_alarm</span>
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-[#032109]">Add New Reminder</h2>
              <p className="text-xs text-[#40493d]">Syncs with smart pillbox and tablet</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#032109] mb-1">Reminder / Medicine Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Donepezil 5mg or Veranda Walk"
              className="w-full px-4 py-2.5 rounded-xl border border-[#cdf2cb] bg-[#ebffe7]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#032109] mb-1">Instruction / Detail</label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="e.g. Take with warm morning chai"
              className="w-full px-4 py-2.5 rounded-xl border border-[#cdf2cb] bg-[#ebffe7]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#032109] mb-1">Scheduled Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-4 py-2.5 rounded-xl border border-[#cdf2cb] bg-[#ebffe7]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#032109] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#cdf2cb] bg-[#ebffe7]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
              >
                <option value="medication">Medication</option>
                <option value="meal">Meal / Tea</option>
                <option value="activity">Cognitive / Walk</option>
                <option value="doctor">Doctor Check</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#cdf2cb]">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile btn-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Save Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
