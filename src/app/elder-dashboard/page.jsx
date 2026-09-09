'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import { dataStore } from '../../services/dataStore.js';
import { authService } from '../../services/authService.js';
import { useTranslation } from '../../utils/i18n.js';
import { showToast } from '../../components/Toast.jsx';

export default function ElderDashboardPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
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
        setMedicines([...(dataStore.getMedicines ? dataStore.getMedicines() : (dataStore.state?.medicines || []))]);
      } catch (err) {
        console.warn('Error reading local user state:', err);
      }
    };

    syncData();
    window.addEventListener('sahara:datastore-change', syncData);
    window.addEventListener('sahara:auth-change', syncData);
    window.addEventListener('sahara:medicines-change', syncData);

    // Multi-Device Cloud Sync for Elder
    try {
      const u = authService.getCurrentUser ? authService.getCurrentUser() : null;
      const identifier = u?.phone || u?.email || u?.id;
      if (identifier) {
        // Sync elder profile
        if (authService.syncElderData) {
          authService.syncElderData(identifier).then((res) => {
            if (res?.elder) syncData();
          }).catch((err) => console.warn('Elder sync error:', err));
        }
        // Sync reminders from server database
        fetch(`/api/reminders?elderId=${encodeURIComponent(identifier)}`)
          .then(r => r.json())
          .then(rData => {
            if (rData?.success && rData?.medicines) {
              dataStore.saveMedicines(rData.medicines);
              setMedicines([...rData.medicines]);
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.warn('Elder cloud sync skipped:', err);
    }

    return () => {
      window.removeEventListener('sahara:datastore-change', syncData);
      window.removeEventListener('sahara:auth-change', syncData);
      window.removeEventListener('sahara:medicines-change', syncData);
    };
  }, []);

  const displayName = (activeUser?.role === 'elder' ? activeUser.name : null) || patient?.name || 'Sahara Member';
  const displayHonorific = (activeUser?.role === 'elder' ? activeUser.honorific : null) || patient?.honorific || (displayName ? `${displayName.split(' ')[0]} ji` : 'Elder');
  const caregiverObj = dataStore.getCaregiver ? dataStore.getCaregiver() : null;
  const caregiverName = caregiverObj?.name || patient?.caregiverName || 'Your caregiver';

  const allMeds = medicines && medicines.length > 0 ? medicines : (dataStore.getMedicines ? dataStore.getMedicines() : []);
  const pendingMeds = allMeds.filter(m => !m.taken);
  const completedMeds = allMeds.filter(m => m.taken);
  const isAllDone = allMeds.length > 0 && pendingMeds.length === 0;
  const currentMed = pendingMeds.length > 0 ? pendingMeds[0] : (allMeds[0] || null);

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

  const handleMarkCurrentMedTaken = () => {
    if (!currentMed) return;
    const medId = currentMed.id;
    dataStore.toggleMedicineStatus(medId);
    
    const remainingAfterThis = pendingMeds.filter(m => m.id !== medId);
    if (remainingAfterThis.length === 0) {
      showToast(`🎉 Wonderful, ${displayHonorific}! All routines completed for today!`, 'success', 5000);
      speakText(`Wonderful, ${displayHonorific}! All daily medicines completed for today!`);
    } else {
      const nextMed = remainingAfterThis[0];
      showToast(`✓ Marked "${currentMed.title}" as taken! Next: ${nextMed.title}`, 'success', 4000);
      speakText(`Marked ${currentMed.title} as taken.`);
    }
  };

  const avatarInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, JPEG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        authService.updateAvatar(optimizedDataUrl);
        showToast('✅ Profile photo updated successfully!', 'success');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
              {/* Profile Avatar with Direct Upload Trigger */}
              <div className="relative shrink-0 group">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  type="button"
                  title="Click to upload profile photo"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-[#2e7d32] via-[#98f994] to-[#ffdeaa] shadow-md relative overflow-hidden block cursor-pointer transition-transform hover:scale-105"
                >
                  <img
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full shadow-inner bg-white"
                    src={patient?.avatar || '/avatar.png'}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-2xl">photo_camera</span>
                    <span className="text-[10px] font-bold mt-0.5">Change</span>
                  </div>
                </button>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  type="button"
                  title="Upload profile photo"
                  className="absolute bottom-1 right-1 bg-[#0d631b] hover:bg-[#006e1c] text-white rounded-full p-1.5 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d3f8d0] text-xs sm:text-sm font-bold text-[#0d631b]">
                    <span className="material-symbols-outlined text-base text-[#0d631b]">calendar_today</span>
                    {currentDateStr}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdeaa]/60 text-xs font-bold text-[#724f00]">
                    {lang || 'English'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109] leading-tight">
                  {t.goodMorning || 'Good morning'}, {displayHonorific} <span className="inline-block hover:scale-110 transition-transform">🌿</span>
                </h1>
                <p className="text-sm sm:text-base text-[#40493d] max-w-xl">
                  {t.elderGreetingDesc || `The morning air in ${patient?.city || 'your area'} is calm and fresh today. Take your time, sip warm water, and enjoy your quiet rhythm.`}
                </p>
              </div>
            </div>
          </div>

          {/* 1. Medicine Rhythm Card - ALL COMPLETED STATE */}
          {isAllDone ? (
            <section className="relative card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4 flex-col sm:flex-row">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#006e1c] text-white flex items-center justify-center shadow-md shrink-0">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl">task_alt</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#0d631b] text-xs font-extrabold mb-1 shadow-sm">
                      <span className="material-symbols-outlined text-sm">celebration</span>
                      {t.metricAllMedsDone || 'All medicines completed for today'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">
                      {t.metricAllMedsDone || 'All Medicines Completed for Today ✓'}
                    </h2>
                    <p className="text-sm text-[#40493d] mt-1">
                      Wonderful care today, {displayHonorific}! All {allMeds.length} daily routines and medicine doses are completed.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-4 py-2 rounded-full bg-[#006e1c] text-white font-extrabold text-sm shadow-sm">
                    {allMeds.length}/{allMeds.length} (100%)
                  </span>
                </div>
              </div>

              {/* Completed list badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-[#cdf2cb]">
                {allMeds.map((med, idx) => (
                  <div key={med.id || idx} className="p-2.5 bg-white rounded-xl border border-[#cdf2cb] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0d631b] text-base">check_circle</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#032109] truncate">{med.title}</p>
                      <p className="text-[10px] text-[#40493d]">{med.scheduledTime} · Taken {med.takenAt || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : currentMed ? (
            <section className="relative card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
              <div className={`absolute top-0 left-0 bottom-0 w-2.5 ${currentMed.taken ? 'bg-[#0d631b]' : 'bg-[#2e7d32]'}`}></div>

              <div className="pl-2 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#d9fdd6] flex items-center justify-center shadow-inner shrink-0 text-[#0d631b]">
                      <span className="material-symbols-outlined text-3xl">medication</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-[#40493d] flex items-center gap-1 font-bold">
                          <span className="material-symbols-outlined text-sm text-[#0d631b]">schedule</span>
                          {t.metricNextMed || 'Scheduled'}: {currentMed.scheduledTime}
                        </span>
                        {pendingMeds.length > 1 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            {pendingMeds.length} remaining today
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">
                        {currentMed.title}
                      </h2>
                    </div>
                  </div>

                  <span
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 self-start sm:self-center ${
                      currentMed.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {currentMed.taken ? 'check_circle' : 'pending'}
                    </span>
                    {currentMed.taken ? (t.takenJustNow || 'Taken on time') : (t.pendingDose || 'Pending dose')}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#40493d] bg-[#ebffe7] p-3 rounded-2xl border border-[#cdf2cb]">
                  {currentMed.detail}
                </p>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <span className="text-xs text-[#40493d] font-bold">
                    {completedMeds.length} of {allMeds.length} completed today ({allMeds.length > 0 ? Math.round((completedMeds.length / allMeds.length) * 100) : 0}%)
                  </span>

                  <button
                    onClick={handleMarkCurrentMedTaken}
                    type="button"
                    className="btn-tactile btn-primary px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    <span>{t.markAsTaken || 'Mark as Taken'}</span>
                  </button>
                </div>
              </div>
            </section>
          ) : null}

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
                  {t.metricMindGames || 'Gentle Mind Game'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#032109] mt-0.5">
                  {t.memoryMatchCardTitle || 'Memory Match'}
                </h3>
                <p className="text-xs sm:text-sm text-[#40493d] mt-1">
                  {t.memoryMatchDesc || 'Gentle picture match with morning tea, flowers, and family memories.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-tactile btn-primary px-6 py-3 rounded-full text-sm font-bold shrink-0 cursor-pointer shadow-md"
            >
              {t.tapToPlayCards || 'Play Match Game →'}
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
                  {t.familyContacts || 'People Who Care for You'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#032109] mt-0.5">
                  {t.lovedOnesEmergencyTitle || 'Your Loved Ones & Family'}
                </h3>
                <p className="text-xs sm:text-sm text-[#40493d] mt-1">
                  {t.lovedOnesEmergencyDesc || `Tap to call ${caregiverName} or family with 1 gentle tap.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-tactile btn-secondary px-6 py-3 rounded-full text-sm font-bold shrink-0 cursor-pointer bg-[#d3f8d0] text-[#032109]"
            >
              {t.openContactsButton || 'View Contacts →'}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
