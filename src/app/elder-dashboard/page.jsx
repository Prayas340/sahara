'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import { dataStore } from '../../services/dataStore.js';
import { authService } from '../../services/authService.js';
import { speakText } from '../../utils/speech.js';
import { showToast } from '../../components/Toast.jsx';

export default function ElderDashboardPage() {
  const router = useRouter();
  const [patient, setPatient] = useState({});
  const [activeUser, setActiveUser] = useState(null);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const syncData = () => {
      try {
        const u = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_active_user') || 'null') : null;
        setActiveUser(u);
        const p = dataStore.getPatient ? dataStore.getPatient() : (dataStore.state?.patient || {});
        setPatient(p || {});
        setMedicines([...(dataStore.state?.medicines || [])]);
      } catch (err) {
        console.warn('Error reading local user state:', err);
      }
    };

    syncData();
    window.addEventListener('sahara:datastore-change', syncData);
    window.addEventListener('sahara:auth-change', syncData);

    // Multi-Device Cloud Sync for Elder
    try {
      const u = authService.getCurrentUser ? authService.getCurrentUser() : null;
      const identifier = u?.phone || u?.email || u?.id;
      if (identifier && authService.syncElderData) {
        authService.syncElderData(identifier).then((res) => {
          if (res?.elder) {
            syncData();
          }
        }).catch((err) => console.warn('Elder sync error:', err));
      }
    } catch (err) {
      console.warn('Elder cloud sync skipped:', err);
    }

    return () => {
      window.removeEventListener('sahara:datastore-change', syncData);
      window.removeEventListener('sahara:auth-change', syncData);
    };
  }, []);

  const displayName = (activeUser?.role === 'elder' ? activeUser.name : null) || patient?.name || 'Sahara Member';
  const displayHonorific = (activeUser?.role === 'elder' ? activeUser.honorific : null) || patient?.honorific || (displayName ? `${displayName.split(' ')[0]} ji` : 'Elder');
  const caregiverObj = dataStore.getCaregiver ? dataStore.getCaregiver() : null;
  const caregiverName = caregiverObj?.name || patient?.caregiverName || 'Your caregiver';

  const morningMed = medicines[0] || {
    title: 'Donepezil 5mg & Morning Routine',
    detail: 'After breakfast with a warm cup of Assam tea',
    scheduledTime: '08:00 AM',
    taken: true,
    takenAt: '8:15 AM',
  };

  const currentDateStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const handleListenPlan = () => {
    const planText = `Good morning ${displayHonorific}. Today is ${currentDateStr}. In ${patient?.city || 'your area'}, the morning is peaceful. Your morning routine is ready, and ${caregiverName} is connected with your care today.`;
    speakText(planText);
    showToast('🔊 ' + planText, 'info', 6000);
  };

  const handleToggleMorningMed = () => {
    if (dataStore.state.medicines[0]) {
      const med = dataStore.state.medicines[0];
      med.taken = !med.taken;
      med.takenAt = med.taken ? 'Just now' : null;
      dataStore.notifyChange();
      showToast(med.taken ? `✓ Marked "${med.title}" as taken!` : 'Pending morning dose', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] text-[#032109]">
      <Navbar activeView="elder" />

      <main className="w-full pt-24 pb-28">
        <div className="w-full max-w-[48rem] mx-auto px-4 sm:px-6 space-y-6">
          {/* Hero Greeting Section */}
          <div className="relative card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#d9fdd6]/70 pointer-events-none blur-2xl"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#ffdeaa]/40 pointer-events-none blur-2xl"></div>

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-[#2e7d32] via-[#98f994] to-[#ffdeaa] shadow-md">
                  <img
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full shadow-inner bg-white"
                    src={patient?.avatar || '/avatar.png'}
                  />
                </div>
                <span className="absolute bottom-1 right-1 bg-[#0d631b] text-white rounded-full p-1 shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">eco</span>
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d3f8d0] text-xs sm:text-sm font-bold text-[#0d631b]">
                    <span className="material-symbols-outlined text-base text-[#0d631b]">calendar_today</span>
                    {currentDateStr}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdeaa]/60 text-xs font-bold text-[#724f00]">
                    {dataStore.getLanguage ? dataStore.getLanguage() : 'English'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109] leading-tight">
                  Good morning, {displayHonorific} <span className="inline-block hover:scale-110 transition-transform">🌿</span>
                </h1>
                <p className="text-sm sm:text-base text-[#40493d] max-w-xl">
                  The morning air in {patient?.city || 'your area'} is calm and fresh today. Take your time, sip warm water, and enjoy your quiet rhythm.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={handleListenPlan}
                    type="button"
                    className="btn-tactile btn-secondary flex items-center gap-2 min-h-[48px] px-5 bg-[#d3f8d0] hover:bg-[#cdf2cb] text-[#0d631b] text-sm sm:text-base rounded-full shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-2xl text-[#0d631b] animate-pulse">volume_up</span>
                    <span>Listen to Today&apos;s Plan</span>
                    <span className="text-xs opacity-75">(Suniyé)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Medicine Rhythm Card */}
          <section className="relative card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
            <div className={`absolute top-0 left-0 bottom-0 w-2.5 ${morningMed.taken ? 'bg-[#0d631b]' : 'bg-[#2e7d32]'}`}></div>

            <div className="pl-2 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#d9fdd6] flex items-center justify-center shadow-inner shrink-0 text-[#0d631b]">
                    <span className="material-symbols-outlined text-3xl">medication</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[#40493d] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#0d631b]">schedule</span>
                      Scheduled for {morningMed.scheduledTime}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">
                      {morningMed.title}
                    </h2>
                  </div>
                </div>

                <span
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 self-start sm:self-center ${
                    morningMed.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {morningMed.taken ? 'check_circle' : 'pending'}
                  </span>
                  {morningMed.taken ? 'Completed for Today' : 'Scheduled Soon'}
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#40493d] bg-[#ebffe7] p-3 rounded-2xl border border-[#cdf2cb]">
                {morningMed.detail}
              </p>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={handleToggleMorningMed}
                  type="button"
                  className="btn-tactile btn-primary px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold cursor-pointer"
                >
                  {morningMed.taken ? '✓ Marked Taken' : 'Mark as Taken'}
                </button>
              </div>
            </div>
          </section>

          {/* 2. Play Memory Match Game Card */}
          <section
            onClick={() => router.push('/memory-game')}
            className="card-tactile bg-gradient-to-r from-[#d9fdd6] to-[#ebffe7] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0d631b] shrink-0 border border-[#cdf2cb]">
                <span className="material-symbols-outlined text-4xl">extension</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-[#0d631b] tracking-wider">
                  Gentle Mind Game
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#032109] mt-0.5">
                  Familiar Treasures Match
                </h3>
                <p className="text-xs sm:text-sm text-[#40493d] mt-1">
                  Enjoy finding matching morning chai, tea leaves, and gentle cat cards.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-tactile btn-primary px-6 py-3 rounded-full text-sm font-bold shrink-0 cursor-pointer shadow-md"
            >
              Play Match Game →
            </button>
          </section>

          {/* 3. Speak with Loved Ones Card */}
          <section
            onClick={() => router.push('/contacts')}
            className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#d9fdd6] shadow-sm flex items-center justify-center text-[#0d631b] shrink-0 border border-[#cdf2cb]">
                <span className="material-symbols-outlined text-4xl">family_restroom</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-[#0d631b] tracking-wider">
                  People Who Care for You
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#032109] mt-0.5">
                  Your Loved Ones & Family
                </h3>
                <p className="text-xs sm:text-sm text-[#40493d] mt-1">
                  Tap to call {caregiverName} or family with 1 gentle tap.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-tactile btn-secondary px-6 py-3 rounded-full text-sm font-bold shrink-0 cursor-pointer bg-[#d3f8d0] text-[#032109]"
            >
              View Contacts →
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
