'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import CaregiverSidebar from '../../components/CaregiverSidebar.jsx';
import AddReminderModal from '../../components/AddReminderModal.jsx';
import ContactModal from '../../components/ContactModal.jsx';
import SendSafeMessageModal from '../../components/SendSafeMessageModal.jsx';
import { authService } from '../../services/authService.js';
import { dataStore } from '../../services/dataStore.js';
import { useTranslation } from '../../utils/i18n.js';
import { speakText } from '../../utils/speech.js';
import { showToast } from '../../components/Toast.jsx';

export default function CaregiverDashboardPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'memories' | 'routine' | 'contacts'
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [caregiver, setCaregiver] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [isSafeMessageModalOpen, setIsSafeMessageModalOpen] = useState(false);

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
        setPatient((prev) => prev ? { ...prev, avatar: optimizedDataUrl } : { avatar: optimizedDataUrl });
        showToast('✅ Profile photo updated successfully!', 'success');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Patient Game Score & Analytics State
  const [gameAnalytics, setGameAnalytics] = useState(() => (
    dataStore.getGameAnalytics ? dataStore.getGameAnalytics() : {
      todayScore: 280,
      weeklyScore: 1640,
      todaySessions: 1,
      weeklyTrend: [],
      sessions: [],
      averageAccuracy: 94,
      stabilityRating: 'High Recall Stability (96%)',
    }
  ));

  useEffect(() => {
    // 1. Verify authenticated caregiver session on this device
    const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_active_user') || 'null') : null;
    const curUser = (authService.getCurrentUser ? authService.getCurrentUser() : null) || storedUser;

    if (!curUser || curUser.role !== 'caregiver') {
      showToast('Please sign in with your Caregiver account to access this portal.', 'info', 4000);
      router.replace('/caregiver-login');
      return;
    }

    setCaregiver(curUser);
    if (curUser.linkedElder && curUser.linkedElder.name) {
      setPatient(curUser.linkedElder);
      setIsSyncing(false);
    }

    // 2. Fetch linked elder directly from cloud database for cross-device sync
    const cgEmail = curUser.email;
    if (cgEmail) {
      setIsSyncing(true);
      authService.syncCaregiverElderData(cgEmail).then((res) => {
        setIsSyncing(false);
        const elder = res?.elderProfile || res?.elder;
        if (elder && elder.name) {
          setPatient(elder);
          if (res.user || res.caregiver) setCaregiver(res.user || res.caregiver);
          setMedicines([...(dataStore.state?.medicines || [])]);
          
          // Load contacts from database
          const elderId = elder.id || elder.phone || elder.email;
          fetch(`/api/contacts?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(cgEmail || '')}`)
            .then(r => r.json())
            .then(cData => {
              if (cData?.contacts && Array.isArray(cData.contacts)) {
                dataStore.saveContacts(cData.contacts);
                setContacts([...cData.contacts]);
              } else {
                const loadedContacts = dataStore.getContacts ? dataStore.getContacts() : [];
                setContacts([...loadedContacts]);
              }
            })
            .catch(() => {
              const loadedContacts = dataStore.getContacts ? dataStore.getContacts() : [];
              setContacts([...loadedContacts]);
            });

          // Load game scores from database for analytics
          fetch(`/api/game-scores?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(cgEmail || '')}`)
            .then(r => r.json())
            .then(sData => {
              if (sData?.success && sData?.scores) {
                dataStore.saveGameScores?.(sData.scores);
                if (sData.analytics) setGameAnalytics(sData.analytics);
              } else if (dataStore.getGameAnalytics) {
                setGameAnalytics(dataStore.getGameAnalytics());
              }
            })
            .catch(() => {
              if (dataStore.getGameAnalytics) setGameAnalytics(dataStore.getGameAnalytics());
            });
        } else if (!curUser.linkedElder) {
          setSyncError(`No elder profile associated with caregiver "${cgEmail}" in the database.`);
        }
      }).catch((err) => {
        setIsSyncing(false);
        console.error('Caregiver cloud sync error:', err);
        if (!curUser.linkedElder) {
          setSyncError('Could not reach cloud database to load elder details: ' + err.message);
        }
      });
    } else {
      setIsSyncing(false);
    }

    const syncData = () => {
      const activeUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
      if (activeUser?.linkedElder && activeUser.linkedElder.name) {
        setPatient(activeUser.linkedElder);
      }
      if (activeUser?.role === 'caregiver') {
        setCaregiver(activeUser);
      }
      setMedicines([...(dataStore.state?.medicines || [])]);
      const loadedContacts = dataStore.getContacts ? dataStore.getContacts() : (dataStore.state?.contacts || []);
      setContacts([...loadedContacts]);
      if (dataStore.getGameAnalytics) {
        setGameAnalytics(dataStore.getGameAnalytics());
      }
    };

    window.addEventListener('sahara:datastore-change', syncData);
    window.addEventListener('sahara:auth-change', syncData);
    window.addEventListener('sahara:game-score-change', syncData);

    // Read initial tab from URL if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'memories', 'routine', 'contacts'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }

    return () => {
      window.removeEventListener('sahara:datastore-change', syncData);
      window.removeEventListener('sahara:auth-change', syncData);
      window.removeEventListener('sahara:game-score-change', syncData);
    };
  }, [router]);

  const handleRetrySync = async () => {
    const curUser = (authService.getCurrentUser ? authService.getCurrentUser() : null) || caregiver;
    const cgEmail = curUser?.email;
    if (!cgEmail) {
      router.push('/caregiver-login');
      return;
    }
    setIsSyncing(true);
    setSyncError('');
    try {
      const res = await authService.syncCaregiverElderData(cgEmail);
      setIsSyncing(false);
      const elder = res?.elderProfile || res?.elder;
      if (elder && elder.name) {
        setPatient(elder);
        if (res.user || res.caregiver) setCaregiver(res.user || res.caregiver);
        setMedicines([...(dataStore.state?.medicines || [])]);
        const loadedContacts = dataStore.getContacts ? dataStore.getContacts() : (dataStore.state?.contacts || []);
        setContacts([...loadedContacts]);
        showToast(`Synchronized with ${elder.name}'s profile!`, 'success');
      } else {
        setSyncError(`No elder profile associated with caregiver "${cgEmail}" in the cloud database.`);
      }
    } catch (err) {
      setIsSyncing(false);
      setSyncError('Sync failed: ' + err.message);
    }
  };

  const takenCount = medicines.filter((m) => m.taken).length;
  const totalMeds = medicines.length;
  const medPercent = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 100;

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `/caregiver-dashboard?tab=${tab}`);
  };

  const handleCardClick = (idx) => {
    const card = cards[idx];
    if (card.matched || card.flipped || flippedIndices.length >= 2) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);
    showToast(`Opened: ${card.title}`, 'info', 1500);

    if (newFlipped.length === 2) {
      const first = newCards[newFlipped[0]];
      const second = newCards[newFlipped[1]];

      if (first.pairId === second.pairId) {
        first.matched = true;
        second.matched = true;
        setCards([...newCards]);
        setFlippedIndices([]);
        dataStore.incrementGamesCount?.();
        showToast(`🎉 Pair Matched: ${first.title}!`, 'success', 3000);
      } else {
        setTimeout(() => {
          first.flipped = false;
          second.flipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 1200);
      }
    }
  };

  const handleShuffleCards = () => {
    const reset = cards.map((c, i) => ({
      ...c,
      flipped: i === 0 || i === 5,
      matched: i === 0 || i === 5,
    }));
    setCards(reset);
    setFlippedIndices([]);
    showToast('Cards shuffled softly!', 'info');
  };

  const toggleMedStatus = (idx) => {
    if (dataStore.state.medicines[idx]) {
      const med = dataStore.state.medicines[idx];
      med.taken = !med.taken;
      med.takenAt = med.taken
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;
      dataStore.notifyChange();
      showToast(med.taken ? `✓ "${med.title}" marked as taken` : `Pending: "${med.title}"`, 'info');
    }
  };

  const handleOpenAddContact = () => {
    setContactToEdit(null);
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (c) => {
    setContactToEdit(c);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (contactData) => {
    if (contactData.id) {
      dataStore.updateContact(contactData.id, contactData);
      showToast(`Contact "${contactData.name}" updated successfully!`, 'success');
    } else {
      dataStore.addContact(contactData);
      showToast(`Contact "${contactData.name}" added successfully!`, 'success');
    }
    const updated = dataStore.getContacts ? dataStore.getContacts() : (dataStore.state?.contacts || []);
    setContacts([...updated]);
    setIsContactModalOpen(false);
  };

  const handleDeleteContact = (contactId, contactName) => {
    if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to remove "${contactName}" from emergency contacts?`)) {
      dataStore.deleteContact(contactId);
      const updated = dataStore.getContacts ? dataStore.getContacts() : (dataStore.state?.contacts || []);
      setContacts([...updated]);
      showToast(`Contact "${contactName}" removed.`, 'info');
    }
  };

  const handleWhatsAppContact = (contact) => {
    if (!contact?.phone) {
      showToast('No phone number saved for this contact.', 'error');
      return;
    }
    let digits = contact.phone.replace(/\D/g, '');
    if (digits.length === 10) digits = `91${digits}`;
    if (digits.length < 10) {
      showToast('Invalid phone number format for WhatsApp.', 'error');
      return;
    }
    const elderName = patient?.honorific || patient?.name || 'Our elder';
    const city = patient?.city || 'Kolkata';
    const msg = encodeURIComponent(`Namaste! 🙏 Update from Sahara Care: ${elderName} is safe, healthy, and doing well today in ${city}. 🌿`);
    window.open(`https://wa.me/${digits}?text=${msg}`, '_blank', 'noopener,noreferrer');
    showToast(`Opening WhatsApp for ${contact.name}...`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] text-[#032109] flex flex-col">
      <Navbar activeView="caregiver" />

      <div className="flex-1 flex pt-20 lg:pt-20">
        {/* Persistent Left Sidebar */}
        <CaregiverSidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          patient={patient}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[80rem] mx-auto w-full pb-28 pt-12 lg:pt-6">
          {/* Explicit Sync Status if Database Read Failed or No Elder Linked */}
          {!isSyncing && !patient && (
            <div className="mb-6 p-8 rounded-3xl bg-white border border-amber-300 text-[#032109] flex flex-col items-center justify-center text-center space-y-4 shadow-md max-w-2xl mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-3xl">cloud_sync</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-[#032109]">Elder Profile Not Synchronized</h3>
                <p className="text-xs sm:text-sm text-[#40493d]">
                  {syncError || `No elder profile is associated with caregiver "${caregiver?.email || 'this account'}" in the cloud database.`}
                </p>
                <p className="text-xs text-[#40493d]">
                  To sync across devices, please ensure the Elder Profile setup was completed on Device A with this caregiver email.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
                <button
                  type="button"
                  onClick={handleRetrySync}
                  className="btn-tactile btn-primary px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  <span>Retry Cloud Sync</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/caregiver-login')}
                  className="px-4 py-2.5 rounded-xl bg-[#ebffe7] text-[#0d631b] border border-[#cdf2cb] font-bold text-xs hover:bg-[#d9fdd6] transition-colors cursor-pointer"
                >
                  Switch Account / Back to Login
                </button>
              </div>
            </div>
          )}

          {/* Syncing Indicator */}
          {isSyncing && !patient && (
            <div className="mb-6 p-8 rounded-3xl bg-white border border-[#cdf2cb] flex flex-col items-center justify-center text-center space-y-3 shadow-md max-w-xl mx-auto my-12">
              <span className="material-symbols-outlined text-3xl text-[#0d631b] animate-spin">sync</span>
              <p className="text-sm font-bold text-[#0d631b]">Connecting to Elder Sanctuary & Synchronizing Cloud Database...</p>
              <p className="text-xs text-[#40493d]">Retrieving real elder profile and vitals across devices...</p>
            </div>
          )}

          {/* REAL SYNCHRONIZED DASHBOARD (Rendered when real elder profile is present) */}
          {patient && patient.name && (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Greeting */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006e1c] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#0d631b] uppercase tracking-wider">
                      {t.monitoringHeader || 'Live Synchronized Caregiver Portal'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    {t.goodMorning || 'Hello'}, {caregiver?.name?.split(' ')[0] || 'Caregiver'}
                  </h1>
                  <p className="text-sm text-[#40493d]">
                    {patient?.honorific || patient?.name} · {patient?.city ? `${patient.city}, ${patient.state || ''}` : t.residenceSanctuary || 'Live Connected'}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 h-11 px-5 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">add_alarm</span>
                    <span>{t.addReminder || 'Add Reminder'}</span>
                  </button>
                </div>
              </div>

              {/* Primary Patient Card */}
              <div className="card-tactile w-full bg-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-[#cdf2cb]">
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#d9fdd6]/60 pointer-events-none blur-2xl"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                    <div className="relative shrink-0 group">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        title="Click to upload/change elder profile photo"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-sm border border-[#cdf2cb] bg-white relative block cursor-pointer transition-transform hover:scale-105"
                      >
                        <img
                          alt={patient?.name || 'Patient'}
                          className="w-full h-full object-cover bg-white"
                          src={patient?.avatar || '/avatar.png'}
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-xl">photo_camera</span>
                          <span className="text-[10px] font-bold">Upload</span>
                        </div>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        title="Upload photo"
                        className="absolute -bottom-1 -right-1 bg-[#0d631b] hover:bg-[#006e1c] text-white p-1 rounded-full shadow-sm flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">{patient?.name || 'Elder Patient'}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#d3f8d0] text-[#40493d] text-xs font-bold">
                          {patient?.age || 74}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
                          {t.activeToday || 'Active today'} · {t.lastActive || 'Last active'} {patient?.lastActive || 'Just now'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#40493d] mb-2">
                        {(patient?.status || patient?.problemStatement || t.mildCognitiveSupport || 'Mild Cognitive Support Mode')} · {(patient?.location || patient?.wing || t.residenceSanctuary || 'Residence Sanctuary')}
                      </p>
                      <div className="flex items-center gap-3 text-[#40493d] text-xs font-semibold flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#0d631b] text-base">wifi_tethering</span>
                          {t.deviceConnected || 'Device Connected'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#724f00] text-base">home_pin</span>
                          {patient?.location || (patient?.city ? `${patient.city}, ${patient.state || ''}` : t.residenceSanctuary || 'Home')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const targetPhone = patient?.phone || '+91 98540 12345';
                        showToast(`Calling ${patient?.honorific || patient?.name} (${targetPhone})...`, 'heart');
                        window.open(`tel:${targetPhone.replace(/\s+/g, '')}`);
                      }}
                      type="button"
                      className="btn-tactile btn-primary flex items-center gap-2 h-11 px-4 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">call</span>
                      <span>{t.callDirect || 'Call'} {patient?.honorific || patient?.name?.split(' ')[0] || 'Elder'}</span>
                    </button>
                    <button
                      onClick={() => handleSelectTab('memories')}
                      type="button"
                      className="btn-tactile btn-secondary flex items-center gap-2 h-11 px-4 rounded-full text-xs sm:text-sm font-bold bg-[#d3f8d0] text-[#032109] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">photo_library</span>
                      <span>{t.tabMemories || 'Memories Deck'}</span>
                    </button>
                    <button
                      onClick={() => {
                        const emergencyLoc = patient?.location || (patient?.city ? `${patient.city}, ${patient.state || ''}` : 'residence sanctuary');
                        showToast(`🚨 Dispatching emergency response to ${emergencyLoc}...`, 'error', 6000);
                      }}
                      type="button"
                      className="btn-tactile btn-sos flex items-center gap-1.5 h-11 px-4 rounded-full text-xs sm:text-sm font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">emergency</span>
                      <span>{t.dispatchTeam || 'Dispatch'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => handleSelectTab('routine')}
                  className="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between cursor-pointer hover:border-[#006e1c] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-full bg-[#d9fdd6] flex items-center justify-center text-[#0d631b]">
                        <span className="material-symbols-outlined text-2xl">medication</span>
                      </span>
                      <span className="text-sm font-bold text-[#032109]">{t.metricMedicines || 'Medicines'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#0d631b]">
                        {takenCount}/{totalMeds}
                      </span>
                      <span className="text-xs text-[#40493d] block">{t.metricTaken || 'Taken'}</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#d3f8d0] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0d631b] h-full rounded-full transition-all duration-500"
                      style={{ width: `${medPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-[#40493d] mt-2">
                    {medicines.find((m) => !m.taken)
                      ? `${t.metricNextMed || 'Next'}: ` + medicines.find((m) => !m.taken).scheduledTime
                      : (t.metricAllMedsDone || 'All medicines completed for today')}
                  </span>
                </div>

                <div
                  onClick={() => handleSelectTab('memories')}
                  className="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between cursor-pointer hover:border-[#006e1c] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-full bg-[#98f994] flex items-center justify-center text-[#0c7521]">
                        <span className="material-symbols-outlined text-2xl">psychology</span>
                      </span>
                      <span className="text-sm font-bold text-[#032109]">{t.metricMindGames || 'Mind Games'}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold">{t.activeToday || 'Today'}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-[#032109]">
                    {dataStore.state.gamesPlayedCount || 1} {t.metricSessions || 'Sessions'}
                  </p>
                  <span className="text-xs text-[#40493d] mt-1">{t.metricFamiliarTreasures || 'Familiar Treasures matched'}</span>
                </div>

                <div className="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-full bg-[#ffdeaa] flex items-center justify-center text-[#724f00]">
                        <span className="material-symbols-outlined text-2xl">mood</span>
                      </span>
                      <span className="text-sm font-bold text-[#032109]">{t.metricMood || 'Mood & Comfort'}</span>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-xl">favorite</span>
                  </div>
                  <p className="text-lg font-extrabold text-[#032109]">
                    {dataStore.state.moodRating || t.metricMoodCalm || 'Very Calm & Cheerful'}
                  </p>
                  <span className="text-xs text-[#40493d] mt-1">{t.metricChaiResponse || 'Positive response to morning chai'}</span>
                </div>
              </div>

              {/* Medication Schedule & Care Team */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#032109]">{t.medScheduleTitle || 'Medication Schedule & Vitals'}</h3>
                      <p className="text-xs sm:text-sm text-[#40493d]">
                        {t.medScheduleSubtitle || 'Real-time synchronization with smart pillbox and elder tablet'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectTab('routine')}
                      className="text-xs font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span> {t.openSchedule || 'Open Schedule'}
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl ${
                              med.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-[#ffdad6] text-[#93000a]'
                            } flex items-center justify-center font-bold`}
                          >
                            <span className="material-symbols-outlined">{med.taken ? 'check' : 'medication'}</span>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-bold text-[#032109]">{med.title}</p>
                            <p className="text-xs text-[#40493d]">
                              {med.detail} • {med.scheduledTime}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            med.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {med.taken ? 'Completed (' + (med.takenAt || 'Taken') + ')' : 'Pending Due'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#032109]">{patient?.city || 'Kolkata'} Care Team</h3>
                    <p className="text-xs sm:text-sm text-[#40493d] mb-4">Direct hotlines on standby</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#d9fdd6]">
                        <div>
                          <p className="text-sm font-bold text-[#032109]">Dr. B. Das</p>
                          <p className="text-xs text-[#40493d]">Family Physician · Primary Clinic</p>
                        </div>
                        <a
                          href="tel:+919864099887"
                          className="p-2 bg-white text-[#0d631b] rounded-full shadow-sm hover:bg-[#ebffe7]"
                        >
                          <span className="material-symbols-outlined text-lg">call</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#d9fdd6]">
                        <div>
                          <p className="text-sm font-bold text-[#032109]">Anil Borah (Family)</p>
                          <p className="text-xs text-[#40493d]">Emergency Contact · +91 98640 54321</p>
                        </div>
                        <a
                          href="tel:+919864054321"
                          className="p-2 bg-white text-[#0d631b] rounded-full shadow-sm hover:bg-[#ebffe7]"
                        >
                          <span className="material-symbols-outlined text-lg">call</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
                        <div>
                          <p className="text-sm font-bold text-red-900">{patient?.city || 'Local'} 108 Ambulance</p>
                          <p className="text-xs text-red-700">Emergency Medical Service</p>
                        </div>
                        <a
                          href="tel:108"
                          className="p-2 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700"
                        >
                          <span className="material-symbols-outlined text-lg">emergency</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#cdf2cb]">
                    <button
                      onClick={() => handleSelectTab('contacts')}
                      type="button"
                      className="btn-tactile btn-primary w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">family_restroom</span>
                      <span>{t.openContactsButton || 'View All Loved Ones & Contacts'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENT GAME SCORE & COGNITIVE ANALYTICS */}
          {activeTab === 'memories' && (
            <div className="space-y-6">
              {/* Main Banner */}
              <div className="card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                    <span className="material-symbols-outlined text-lg">leaderboard</span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {t.tabGameScores || 'Patient Game Score & Analytics'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    {(patient?.name ? patient.name.split(' ')[0] : 'Patient')}&apos;s Cognitive Game Scores
                  </h1>
                  <p className="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    {t.weeklyTrend || 'Daily and weekly memory game scores, pattern recognition recall, and cognitive stability tracking.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#cdf2cb] shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006e1c] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#0d631b]">Live Database Synced</span>
                  </div>
                  <button
                    onClick={() => {
                      const elderId = patient?.id || patient?.phone || patient?.email;
                      const cgEmail = caregiver?.email;
                      fetch(`/api/game-scores?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(cgEmail || '')}`)
                        .then(r => r.json())
                        .then(sData => {
                          if (sData?.success && sData?.analytics) {
                            setGameAnalytics(sData.analytics);
                            showToast('Scores synchronized from cloud database!', 'success', 2500);
                          }
                        })
                        .catch(() => showToast('Refreshed local analytics', 'info', 2000));
                    }}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">sync</span>
                    <span>Sync Scores</span>
                  </button>
                </div>
              </div>

              {/* 4 Analytics Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Daily Score */}
                <div className="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-2xl">today</span>
                      </span>
                      <span className="text-xs font-bold text-[#40493d]">{t.dailyScore || "Today's Game Score"}</span>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#cdf2cb] text-[#006e1c]">
                      {gameAnalytics.todaySessions || 0} {t.metricSessions || 'Sessions'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#032109]">{gameAnalytics.todayScore || 0}</span>
                      <span className="text-sm font-bold text-[#0d631b]">{t.pointsLabel || 'pts'}</span>
                    </div>
                    <p className="text-xs text-[#40493d] mt-1">Earned in today&apos;s memory matches</p>
                  </div>
                </div>

                {/* 2. Weekly Cumulative Score */}
                <div className="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl bg-[#cdf2cb] text-[#006e1c] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-2xl">date_range</span>
                      </span>
                      <span className="text-xs font-bold text-[#40493d]">{t.weeklyScore || 'Weekly Score'}</span>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      7-Day Total
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#032109]">{gameAnalytics.weeklyScore || 0}</span>
                      <span className="text-sm font-bold text-[#0d631b]">{t.pointsLabel || 'pts'}</span>
                    </div>
                    <p className="text-xs text-[#40493d] mt-1">Rolling 7-day cumulative points</p>
                  </div>
                </div>

                {/* 3. Cognitive Stability */}
                <div className="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl bg-[#ffdeaa] text-[#724f00] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-2xl">psychology</span>
                      </span>
                      <span className="text-xs font-bold text-[#40493d]">{t.cognitiveStability || 'Cognitive Stability'}</span>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-[#032109] block leading-tight">
                      {gameAnalytics.stabilityRating || 'High Recall (96%)'}
                    </span>
                    <p className="text-xs text-[#40493d] mt-1">Pattern retention & stability</p>
                  </div>
                </div>

                {/* 4. Average Accuracy */}
                <div className="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-2xl">query_stats</span>
                      </span>
                      <span className="text-xs font-bold text-[#40493d]">{t.averageAccuracy || 'Average Accuracy'}</span>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                      Steady
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#032109]">{gameAnalytics.averageAccuracy || 94}%</span>
                    </div>
                    <p className="text-xs text-[#40493d] mt-1">Average familiar cards accuracy</p>
                  </div>
                </div>
              </div>

              {/* 7-Day Weekly Trend Chart */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-[#0d631b]">bar_chart</span>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#032109]">
                        {t.weeklyTrend || '7-Day Cognitive Performance Analytics'}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#40493d]">
                        Daily memory match scores showing cognitive engagement and consistency.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-[#40493d]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-[#006e1c]"></span> High Score (250+ pts)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-[#a3f69c]"></span> Moderate
                    </span>
                  </div>
                </div>

                {/* Vertical Bar Visualizer */}
                <div className="pt-4 pb-2">
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end min-h-[220px] bg-[#ebffe7] p-4 sm:p-6 rounded-2xl border border-[#cdf2cb]">
                    {(gameAnalytics.weeklyTrend && gameAnalytics.weeklyTrend.length > 0 ? gameAnalytics.weeklyTrend : [
                      { day: 'Mon', dateStr: '09/03', score: 260, sessions: 1 },
                      { day: 'Tue', dateStr: '09/04', score: 280, sessions: 1 },
                      { day: 'Wed', dateStr: '09/05', score: 240, sessions: 1 },
                      { day: 'Thu', dateStr: '09/06', score: 300, sessions: 2 },
                      { day: 'Fri', dateStr: '09/07', score: 280, sessions: 1 },
                      { day: 'Sat', dateStr: '09/08', score: 280, sessions: 1 },
                      { day: 'Today', dateStr: '09/09', score: gameAnalytics.todayScore || 280, sessions: gameAnalytics.todaySessions || 1 },
                    ]).map((dayData, idx) => {
                      const score = dayData.score || 0;
                      const heightPercent = Math.max(12, Math.min(100, Math.round((score / 350) * 100)));
                      const isToday = idx === 6 || dayData.day === 'Today';
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end">
                          {/* Score Pill */}
                          <span className={`text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-md transition-all ${
                            isToday ? 'bg-[#006e1c] text-white shadow-sm' : score > 0 ? 'bg-white text-[#0d631b] border border-[#cdf2cb]' : 'text-gray-400'
                          }`}>
                            {score > 0 ? `${score}p` : '0p'}
                          </span>

                          {/* Bar */}
                          <div className="w-full max-w-[48px] bg-white rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 h-36 border border-[#cdf2cb]">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                isToday
                                  ? 'bg-gradient-to-t from-[#006e1c] to-[#2e7d32] shadow-sm'
                                  : score >= 260
                                  ? 'bg-gradient-to-t from-[#0d631b] to-[#43a047]'
                                  : score > 0
                                  ? 'bg-gradient-to-t from-[#81c784] to-[#a3f69c]'
                                  : 'bg-gray-100'
                              }`}
                            ></div>
                          </div>

                          {/* Day & Date Labels */}
                          <div className="text-center">
                            <p className={`text-xs font-extrabold ${isToday ? 'text-[#006e1c]' : 'text-[#032109]'}`}>
                              {dayData.day}
                            </p>
                            <p className="text-[10px] text-[#40493d]">{dayData.dateStr || ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Sessions History Table */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-[#0d631b]">history</span>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#032109]">
                        {t.sessionHistory || 'Recent Game Sessions & Score Logs'}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#40493d]">
                        Detailed audit trail of each game played by {(patient?.name ? patient.name.split(' ')[0] : 'Patient')}.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0d631b] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                    {(gameAnalytics.sessions && gameAnalytics.sessions.length > 0 ? gameAnalytics.sessions.length : 1)} Total Records
                  </span>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#cdf2cb] text-xs font-bold text-[#40493d]">
                        <th className="pb-3 px-3">Date & Time</th>
                        <th className="pb-3 px-3">Game Mode</th>
                        <th className="pb-3 px-3 text-center">{t.movesLabel || 'Moves'}</th>
                        <th className="pb-3 px-3 text-center">{t.averageAccuracy || 'Accuracy'}</th>
                        <th className="pb-3 px-3 text-right">{t.scoreEarned || 'Score Earned'}</th>
                        <th className="pb-3 px-3 text-right">{t.recallStatus || 'Recall Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebffe7] text-sm font-medium text-[#032109]">
                      {(gameAnalytics.sessions && gameAnalytics.sessions.length > 0 ? gameAnalytics.sessions : [
                        {
                          id: 'sample-1',
                          timestamp: new Date().toISOString(),
                          gameName: 'Familiar Treasures Match',
                          score: 280,
                          moves: 4,
                          accuracy: 94,
                          durationSeconds: 28,
                          status: 'Recall Verified ✓',
                        }
                      ]).map((sess, sIdx) => {
                        const dateFormatted = sess.timestamp
                          ? new Date(sess.timestamp).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Today';
                        return (
                          <tr key={sess.id || sIdx} className="hover:bg-[#ebffe7]/50 transition-colors">
                            <td className="py-3.5 px-3">
                              <span className="font-bold block text-[#032109]">{dateFormatted}</span>
                              <span className="text-[11px] text-[#40493d]">{sess.durationSeconds || 30}s session</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-bold text-[#0d631b] flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">extension</span>
                                {sess.gameName || 'Familiar Treasures'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold">
                              {sess.moves || 4} {t.movesLabel || 'moves'}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#cdf2cb] text-[#006e1c]">
                                {sess.accuracy || 94}%
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <span className="text-base font-extrabold text-[#0d631b]">
                                +{sess.score || 280} pts
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {sess.status || 'Active Recall ✓'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Memory Anchor Album */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#032109]">
                      {(patient?.name ? patient.name.split(' ')[0] : 'Elder')}&apos;s Memory Anchor Album
                    </h3>
                    <p className="text-xs sm:text-sm text-[#40493d]">
                      Personal photographs tied to voice narrations that help evoke comfort and orientation.
                    </p>
                  </div>
                  <button
                    onClick={() => showToast('Select audio story to link with photo', 'info')}
                    type="button"
                    className="btn-tactile btn-primary px-4 py-2 rounded-full text-xs font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">cloud_upload</span> Upload Story
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 bg-[#ebffe7] rounded-2xl border border-[#cdf2cb] flex items-center gap-3">
                    <img
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#cdf2cb]"
                      src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&auto=format&fit=crop"
                      alt="Cat memory"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#032109]">Gentle Cat &ldquo;Mimi&rdquo;</h4>
                      <p className="text-xs text-[#40493d]">Sunlit veranda nap in Dispur</p>
                      <span className="text-[11px] font-bold text-[#0d631b] flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">record_voice_over</span>Voice audio linked
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#ebffe7] rounded-2xl border border-[#cdf2cb] flex items-center gap-3">
                    <img
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#cdf2cb]"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDauqRUl7YpuJSBa4kuyqJidfQJRaCYT-3Oo4ZsHNJ-in8bGK4pPiMMwFwYXfcbFm8bjhHjTdbTvCJCXeBeip_UP8N5E3SY6mspaZ_RJ96mymlOszjhLt6jkZv4bdFun-_i-V8jOzhenh_NupZeRE9_b7FTmWMFA7LGfVW5mICyVvp8a9Yl8jyP7w4U6gL2IiKQJrqw79kBvqVVgteQ_5Z_bsLTMPu9-kKoaukZGOL7wLaXdCvZ_8WK5Q"
                      alt="Tea garden"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#032109]">Jorhat Tea Estate</h4>
                      <p className="text-xs text-[#40493d]">Childhood vacations 1968</p>
                      <span className="text-[11px] font-bold text-[#0d631b] flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">record_voice_over</span>Assamese story linked
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#ebffe7] rounded-2xl border border-[#cdf2cb] flex items-center gap-3">
                    <img
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#cdf2cb]"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfb2Ilw0SLdOuUlOFLSzgAfBI-Gfu3AZuBqTInkesBiLBm6G2Be1pJ4TK9BY-Kh7Fs4oRCnQU5npntF9UZSiZKSoSrOkBgfIuaC67UF1QmjicWtikoUoag5AARfFvVxlZUBcNh0Usr1iI-fdom5Yok0COkHQwTVc4WLzYwOLywZ1ShZieBFZqd8vQOyjvOAqMJQotxgHn3DzFeSXIVXEaodQMgfHV_QNfPHER-HdxfMZdEicRJiGfmFA"
                      alt="Chai"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#032109]">Morning Assam Chai</h4>
                      <p className="text-xs text-[#40493d]">Traditional earthen bhar cup</p>
                      <span className="text-[11px] font-bold text-[#0d631b] flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>Active memory trigger
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY RHYTHM & ROUTINE */}
          {activeTab === 'routine' && (
            <div className="space-y-6">
              <div className="card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {t.tabRoutine || 'Daily Rhythm & Routine Schedule'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    {t.medScheduleTitle || 'Medication & Daily Care Timeline'}
                  </h1>
                  <p className="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    {t.medScheduleSubtitle || 'Manage smart reminders, sync with pillbox sensors, and adjust dosage alerts.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">add_alarm</span>
                    <span>{t.addReminder || 'Add New Reminder'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Card */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#032109]">{t.metricMedicines || 'Medication Adherence'}</h3>
                    <p className="text-xs sm:text-sm text-[#40493d]">
                      {takenCount} of {totalMeds} {t.metricTaken || 'doses logged as taken'}
                    </p>
                  </div>
                  <span className="text-2xl font-extrabold text-[#006e1c]">{medPercent}%</span>
                </div>
                <div className="w-full bg-[#d3f8d0] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#006e1c] h-full rounded-full transition-all duration-500"
                    style={{ width: `${medPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Full Medicines List */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-[#032109]">{t.medScheduleTitle || 'Full Medication Schedule'}</h3>
                  <span className="text-xs font-bold text-[#40493d] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {t.deviceConnected || 'Connected'}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl ${
                            med.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-[#ffdad6] text-[#93000a]'
                          } flex items-center justify-center font-bold text-lg shrink-0`}
                        >
                          <span className="material-symbols-outlined">{med.taken ? 'check' : 'medication'}</span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-[#032109]">{med.title}</p>
                          <p className="text-xs sm:text-sm text-[#40493d]">
                            {med.detail} • Scheduled: <span className="font-bold text-[#032109]">{med.scheduledTime}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleMedStatus(idx)}
                        type="button"
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer self-end sm:self-center ${
                          med.taken
                            ? 'bg-[#d9fdd6] text-[#0c7521] hover:bg-[#cdf2cb]'
                            : 'bg-[#006e1c] text-white hover:bg-[#0d631b]'
                        }`}
                      >
                        {med.taken ? '✓ Taken (' + (med.takenAt || 'Logged') + ')' : 'Mark as Taken'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Milestones */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <h3 className="text-xl font-extrabold text-[#032109]">Daily Activity Rhythm</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0d631b] uppercase">Morning · 8:00 AM</span>
                      <span className="material-symbols-outlined text-[#0d631b]">wb_sunny</span>
                    </div>
                    <p className="text-sm font-bold text-[#032109]">Warm Assam Chai & Donepezil</p>
                    <p className="text-xs text-[#40493d] mt-1">Veranda garden walk & gentle music</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0d631b] uppercase">Noon · 1:00 PM</span>
                      <span className="material-symbols-outlined text-[#0d631b]">restaurant</span>
                    </div>
                    <p className="text-sm font-bold text-[#032109]">Lunch & Hydration Check</p>
                    <p className="text-xs text-[#40493d] mt-1">Light dal, rice & tender greens</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0d631b] uppercase">Evening · 5:30 PM</span>
                      <span className="material-symbols-outlined text-[#0d631b]">psychology</span>
                    </div>
                    <p className="text-sm font-bold text-[#032109]">Memory Match & Audio Memos</p>
                    <p className="text-xs text-[#40493d] mt-1">Familiar treasures on tablet</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0d631b] uppercase">Night · 9:00 PM</span>
                      <span className="material-symbols-outlined text-[#0d631b]">bedtime</span>
                    </div>
                    <p className="text-sm font-bold text-[#032109]">Night Calming & Bedtime</p>
                    <p className="text-xs text-[#40493d] mt-1">Warm water & dim night light</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCTOR & FAMILY SOS */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                    <span className="material-symbols-outlined text-lg">contact_phone</span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {t.tabContacts || 'Doctor & Family SOS Care Network'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    {t.emergencyContactsTitle || 'Emergency Contacts & Loved Ones'}
                  </h1>
                  <p className="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    {t.emergencyContactsSubtitle || 'Direct access to primary doctors, family members, and immediate emergency assistance.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button
                    onClick={() => setIsSafeMessageModalOpen(true)}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                    <span>{t.sendDoingWellBtn || `Send “${patient?.name?.split(' ')[0] || 'Loved One'} is Safe” to Everyone`}</span>
                  </button>

                  <button
                    onClick={handleOpenAddContact}
                    type="button"
                    className="btn-tactile flex items-center gap-2 px-4 py-3 rounded-full bg-white text-[#0d631b] border-2 border-[#006e1c] text-xs sm:text-sm font-bold shadow-sm hover:bg-[#d9fdd6] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    <span>+ {t.addContact || 'Add Contact'}</span>
                  </button>
                </div>
              </div>

              {/* Family Contacts List & Empty State */}
              {contacts.length === 0 ? (
                <div className="card-tactile bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-md border border-[#cdf2cb] space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center mx-auto text-3xl font-extrabold shadow-sm">
                    <span className="material-symbols-outlined text-4xl">contacts_product</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#032109]">{t.noContactsYet || 'No Emergency Contacts or Loved Ones Added'}</h2>
                  <p className="text-sm text-[#40493d]">
                    {t.noContactsSubtitle || 'Customize your own trusted contact numbers to enable 1-tap WhatsApp updates and direct calling.'}
                  </p>
                  <button
                    onClick={handleOpenAddContact}
                    type="button"
                    className="btn-tactile btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">person_add</span>
                    <span>+ {t.addFirstContact || 'Add First Contact'}</span>
                  </button>
                </div>
              ) : (
                <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#032109]">All Linked Family Members & Caregivers</h3>
                      <p className="text-xs text-[#40493d] mt-0.5">Customize names, phone numbers, and send instant WhatsApp safe updates.</p>
                    </div>
                    <button
                      onClick={handleOpenAddContact}
                      type="button"
                      className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#006e1c] text-white text-xs font-bold shadow-sm hover:bg-[#0d631b] transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <span className="material-symbols-outlined text-base">person_add</span>
                      <span>+ Add Contact</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {contacts.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="p-5 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex flex-col justify-between gap-4 relative group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              className="w-14 h-14 rounded-2xl object-cover border border-[#cdf2cb] bg-white shadow-xs shrink-0"
                              src={c.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                              alt={c.name}
                            />
                            <div className="min-w-0">
                              <h4 className="text-base font-extrabold text-[#032109] truncate">{c.name}</h4>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold inline-block mt-0.5 truncate max-w-full">
                                {c.relation}
                              </span>
                              <p className="text-xs font-semibold text-[#0d631b] mt-0.5">{c.phone}</p>
                              <p className="text-xs text-[#40493d] truncate">{c.location}</p>
                            </div>
                          </div>

                          {/* Edit and Delete action buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditContact(c)}
                              title={t.edit || "Edit Contact"}
                              className="p-1.5 rounded-xl bg-white text-[#0d631b] hover:bg-[#c9f6c7] border border-[#cdf2cb] shadow-xs transition-colors cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteContact(c.id, c.name)}
                              title={t.delete || "Remove Contact"}
                              className="p-1.5 rounded-xl bg-white text-red-600 hover:bg-red-50 border border-red-200 shadow-xs transition-colors cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#cdf2cb]">
                          <a
                            href={`tel:${c.phone}`}
                            className="btn-tactile btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-base">call</span>
                            <span>{t.callDirect || 'Call'}</span>
                          </a>

                          <button
                            onClick={() => handleWhatsAppContact(c)}
                            type="button"
                            className="btn-tactile py-2.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">chat</span>
                            <span>{t.whatsApp || 'WhatsApp'}</span>
                          </button>

                          <button
                            onClick={() => showToast(`🎙️ Recording 15s voice note for ${c.name}...`, 'info')}
                            type="button"
                            className="py-2.5 rounded-xl bg-white text-[#0d631b] border border-[#cdf2cb] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#d9fdd6] transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">mic</span>
                            <span>{t.voiceNote || 'Voice'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
      </div>

      <AddReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
        contactToEdit={contactToEdit}
        patientCity={patient?.city}
      />

      <SendSafeMessageModal
        isOpen={isSafeMessageModalOpen}
        onClose={() => setIsSafeMessageModalOpen(false)}
        contacts={contacts}
        elderName={patient?.honorific || patient?.name}
        elderLocation={patient?.city || 'Kolkata'}
      />
    </div>
  );
}
