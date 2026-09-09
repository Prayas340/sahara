'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import CaregiverSidebar from '../../components/CaregiverSidebar.jsx';
import AddReminderModal from '../../components/AddReminderModal.jsx';
import { authService } from '../../services/authService.js';
import { dataStore } from '../../services/dataStore.js';
import { speakText } from '../../utils/speech.js';
import { showToast } from '../../components/Toast.jsx';

export default function CaregiverDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'memories' | 'routine' | 'contacts'
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [patient, setPatient] = useState({});
  const [caregiver, setCaregiver] = useState({});
  const [medicines, setMedicines] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Memory game state
  const initialCards = [
    {
      pairId: 'chai',
      title: 'Assam Chai ☕',
      subtitle: 'Warm Morning Tea',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfb2Ilw0SLdOuUlOFLSzgAfBI-Gfu3AZuBqTInkesBiLBm6G2Be1pJ4TK9BY-Kh7Fs4oRCnQU5npntF9UZSiZKSoSrOkBgfIuaC67UF1QmjicWtikoUoag5AARfFvVxlZUBcNh0Usr1iI-fdom5Yok0COkHQwTVc4WLzYwOLywZ1ShZieBFZqd8vQOyjvOAqMJQotxgHn3DzFeSXIVXEaodQMgfHV_QNfPHER-HdxfMZdEicRJiGfmFA',
      icon: 'local_cafe',
      matched: true,
      flipped: true,
    },
    {
      pairId: 'tea_leaf',
      title: 'Tea Garden 🌿',
      subtitle: 'Fresh Green Leaves',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDauqRUl7YpuJSBa4kuyqJidfQJRaCYT-3Oo4ZsHNJ-in8bGK4pPiMMwFwYXfcbFm8bjhHjTdbTvCJCXeBeip_UP8N5E3SY6mspaZ_RJ96mymlOszjhLt6jkZv4bdFun-_i-V8jOzhenh_NupZeRE9_b7FTmWMFA7LGfVW5mICyVvp8a9Yl8jyP7w4U6gL2IiKQJrqw79kBvqVVgteQ_5Z_bsLTMPu9-kKoaukZGOL7wLaXdCvZ_8WK5Q',
      icon: 'potted_plant',
      matched: false,
      flipped: false,
    },
    {
      pairId: 'cat',
      title: 'Gentle Cat 🐱',
      subtitle: 'Soft Sunlit Nap',
      img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80',
      icon: 'pets',
      matched: false,
      flipped: false,
    },
    {
      pairId: 'tea_leaf',
      title: 'Tea Garden 🌿',
      subtitle: 'Fresh Green Leaves',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDauqRUl7YpuJSBa4kuyqJidfQJRaCYT-3Oo4ZsHNJ-in8bGK4pPiMMwFwYXfcbFm8bjhHjTdbTvCJCXeBeip_UP8N5E3SY6mspaZ_RJ96mymlOszjhLt6jkZv4bdFun-_i-V8jOzhenh_NupZeRE9_b7FTmWMFA7LGfVW5mICyVvp8a9Yl8jyP7w4U6gL2IiKQJrqw79kBvqVVgteQ_5Z_bsLTMPu9-kKoaukZGOL7wLaXdCvZ_8WK5Q',
      icon: 'potted_plant',
      matched: false,
      flipped: false,
    },
    {
      pairId: 'cat',
      title: 'Gentle Cat 🐱',
      subtitle: 'Soft Sunlit Nap',
      img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80',
      icon: 'pets',
      matched: false,
      flipped: false,
    },
    {
      pairId: 'chai',
      title: 'Assam Chai ☕',
      subtitle: 'Warm Morning Tea',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfb2Ilw0SLdOuUlOFLSzgAfBI-Gfu3AZuBqTInkesBiLBm6G2Be1pJ4TK9BY-Kh7Fs4oRCnQU5npntF9UZSiZKSoSrOkBgfIuaC67UF1QmjicWtikoUoag5AARfFvVxlZUBcNh0Usr1iI-fdom5Yok0COkHQwTVc4WLzYwOLywZ1ShZieBFZqd8vQOyjvOAqMJQotxgHn3DzFeSXIVXEaodQMgfHV_QNfPHER-HdxfMZdEicRJiGfmFA',
      icon: 'local_cafe',
      matched: true,
      flipped: true,
    },
  ];

  const [cards, setCards] = useState(initialCards);
  const [flippedIndices, setFlippedIndices] = useState([]);

  useEffect(() => {
    const syncData = () => {
      const activeUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
      const linkedP = activeUser?.linkedElder || (dataStore.getPatient ? dataStore.getPatient() : (dataStore.state?.patient || {}));
      const currentCg = (activeUser?.role === 'caregiver' ? activeUser : null) || (dataStore.getCaregiver ? dataStore.getCaregiver() : (dataStore.state?.caregiver || {}));
      setPatient(linkedP);
      setCaregiver(currentCg);
      setMedicines([...(dataStore.state?.medicines || [])]);
      setContacts([...(dataStore.state?.contacts || [])]);
    };

    syncData();
    window.addEventListener('sahara:datastore-change', syncData);
    window.addEventListener('sahara:auth-change', syncData);

    // Multi-Device Cloud Sync: automatically fetch connected elder profile
    const activeUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
    const cgEmail = activeUser?.email;
    if (cgEmail) {
      authService.syncCaregiverElderData(cgEmail).then((res) => {
        if (res?.elderProfile) {
          syncData();
        }
      });
    }

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
    };
  }, []);

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
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Greeting */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006e1c] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#0d631b] uppercase tracking-wider">
                      Live Synchronized Caregiver Portal
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    Hello, {caregiver?.name?.split(' ')[0] || 'Caregiver'}
                  </h1>
                  <p className="text-sm text-[#40493d]">
                    Here is {patient?.honorific || patient?.name}&apos;s day at a glance · {patient?.city ? `${patient.city}, ${patient.state || ''}` : 'Live Connected'}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 h-11 px-5 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">add_alarm</span>
                    <span>Add Reminder</span>
                  </button>
                </div>
              </div>

              {/* Primary Patient Card */}
              <div className="card-tactile w-full bg-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-[#cdf2cb]">
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#d9fdd6]/60 pointer-events-none blur-2xl"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                    <div className="relative shrink-0">
                      <img
                        alt={patient?.name || 'Patient'}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm border border-[#cdf2cb] bg-white"
                        src={patient?.avatar || '/avatar.png'}
                      />
                      <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                        <span className="material-symbols-outlined text-[#0d631b] text-xl">verified</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">{patient?.name || 'Elder Patient'}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#d3f8d0] text-[#40493d] text-xs font-bold">
                          {patient?.age || 74} years
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
                          Active today · Last active {patient?.lastActive || 'Just now'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#40493d] mb-2">
                        {(patient?.status || patient?.problemStatement || 'Mild Cognitive Support Mode')} · {(patient?.location || patient?.wing || 'Residence Sanctuary')}
                      </p>
                      <div className="flex items-center gap-3 text-[#40493d] text-xs font-semibold flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#0d631b] text-base">wifi_tethering</span>
                          Device Connected (Battery {patient?.tabletBattery || 94}%)
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#724f00] text-base">home_pin</span>
                          {patient?.location || (patient?.city ? `${patient.city}, ${patient.state || ''}` : 'Home')}
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
                      <span>Call {patient?.honorific || patient?.name || 'Elder'}</span>
                    </button>
                    <button
                      onClick={() => handleSelectTab('memories')}
                      type="button"
                      className="btn-tactile btn-secondary flex items-center gap-2 h-11 px-4 rounded-full text-xs sm:text-sm font-bold bg-[#d3f8d0] text-[#032109] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">photo_library</span>
                      <span>Memories Deck</span>
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
                      <span>Dispatch</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => handleSelectTab('routine')}
                  className="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between cursor-pointer hover:border-[#006e1c] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-full bg-[#d9fdd6] flex items-center justify-center text-[#0d631b]">
                        <span className="material-symbols-outlined text-2xl">medication</span>
                      </span>
                      <span className="text-sm font-bold text-[#032109]">Medicines</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#0d631b]">
                        {takenCount}/{totalMeds}
                      </span>
                      <span className="text-xs text-[#40493d] block">Taken</span>
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
                      ? 'Next: ' + medicines.find((m) => !m.taken).scheduledTime
                      : 'All medicines completed for today'}
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
                      <span className="text-sm font-bold text-[#032109]">Mind Games</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold">Today</span>
                  </div>
                  <p className="text-2xl font-extrabold text-[#032109]">
                    {dataStore.state.gamesPlayedCount || 1} Sessions
                  </p>
                  <span className="text-xs text-[#40493d] mt-1">Familiar Treasures matched</span>
                </div>

                <div className="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-full bg-[#ffdeaa] flex items-center justify-center text-[#724f00]">
                        <span className="material-symbols-outlined text-2xl">mood</span>
                      </span>
                      <span className="text-sm font-bold text-[#032109]">Mood & Comfort</span>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-xl">favorite</span>
                  </div>
                  <p className="text-lg font-extrabold text-[#032109]">
                    {dataStore.state.moodRating || 'Very Calm & Cheerful'}
                  </p>
                  <span className="text-xs text-[#40493d] mt-1">Positive response to morning chai</span>
                </div>

                <div
                  onClick={() => handleSelectTab('contacts')}
                  className="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between cursor-pointer hover:border-[#006e1c] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-full bg-[#d9fdd6] flex items-center justify-center text-[#0d631b]">
                        <span className="material-symbols-outlined text-2xl">campaign</span>
                      </span>
                      <span className="text-sm font-bold text-[#032109]">WhatsApp Sync</span>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-lg font-extrabold text-[#032109]">Active & Linked</p>
                  <span className="text-xs text-[#40493d] mt-1">Regional voice memos enabled</span>
                </div>
              </div>

              {/* Medication Schedule & Care Team */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#032109]">Medication Schedule & Vitals</h3>
                      <p className="text-xs sm:text-sm text-[#40493d]">
                        Real-time synchronization with smart pillbox and elder tablet
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectTab('routine')}
                      className="text-xs font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span> Open Schedule
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
                      <span>View All Loved Ones & Contacts</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FAMILY MEMORIES DECK */}
          {activeTab === 'memories' && (
            <div className="space-y-6">
              <div className="card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Family Memories Deck & Cognitive Companion
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    Memory Match & Familiar Treasures
                  </h1>
                  <p className="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    Caregiver monitoring and live game companion for {patient?.name || 'Elder'}. Tap cards below to test or guide through the session.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button
                    onClick={() => showToast('Opening Memory Deck Photo Uploader...', 'info')}
                    type="button"
                    className="btn-tactile btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white text-[#0d631b] border border-[#cdf2cb] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                    <span>Add New Photo Memory</span>
                  </button>
                  <button
                    onClick={() => {
                      const msg = "Playing voice guidance: Tap two matching cards gently to discover familiar treasures.";
                      speakText(msg);
                      showToast('🔊 ' + msg, 'info');
                    }}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">volume_up</span>
                    <span>Play Voice Guidance</span>
                  </button>
                </div>
              </div>

              {/* Status Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#cdf2cb] shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-2xl">extension</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#40493d] font-bold block">Game Difficulty</span>
                    <span className="text-base font-extrabold text-[#032109]">Gentle & Free (3 Pairs)</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#cdf2cb] shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#cdf2cb] text-[#006e1c] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#40493d] font-bold block">Completed Today</span>
                    <span className="text-base font-extrabold text-[#032109]">
                      {dataStore.state.gamesPlayedCount || 1} Sessions
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#cdf2cb] shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#ffdeaa] text-[#724f00] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-2xl">favorite</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#40493d] font-bold block">Emotional Response</span>
                    <span className="text-base font-extrabold text-[#032109]">Calm & Joyful</span>
                  </div>
                </div>
              </div>

              {/* Embedded Interactive Game Board */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb]">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#006e1c] animate-pulse"></span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">
                        Familiar Treasures Game Board
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[#40493d]">
                      Tap cards to flip them and experience the cognitive match session.
                    </p>
                  </div>
                  <button
                    onClick={handleShuffleCards}
                    type="button"
                    className="btn-tactile btn-primary px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">replay</span>
                    <span>Shuffle Cards</span>
                  </button>
                </div>

                {/* 6 Tactile Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {cards.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCardClick(idx)}
                      className="cursor-pointer select-none transition-transform active:scale-[0.98]"
                    >
                      {card.flipped || card.matched ? (
                        <div className="card-tactile relative flex flex-col items-center justify-between p-4 bg-white rounded-3xl shadow-[0_4px_0_#2e7d32] border border-[#cdf2cb] min-h-[190px]">
                          <div className="w-full flex items-center justify-between">
                            <span
                              className={`text-xs ${
                                card.matched ? 'bg-[#a3f69c] text-[#002204]' : 'bg-[#ffdeaa] text-[#724f00]'
                              } font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {card.matched ? 'check_circle' : 'visibility'}
                              </span>
                              {card.matched ? 'Matched' : 'Open'}
                            </span>
                            <span className="material-symbols-outlined text-[#0d631b] text-lg">favorite</span>
                          </div>
                          <div className="w-20 h-20 sm:w-24 sm:h-24 my-auto flex items-center justify-center rounded-2xl bg-[#d9fdd6] overflow-hidden p-1 border border-[#cdf2cb]">
                            <img className="w-full h-full object-cover rounded-xl" src={card.img} alt={card.title} />
                          </div>
                          <div className="w-full text-center">
                            <p className="text-sm sm:text-base font-extrabold text-[#0d631b]">{card.title}</p>
                            <p className="text-xs text-[#40493d]">{card.subtitle}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="card-tactile relative flex flex-col items-center justify-center p-4 bg-[#cdf2cb] hover:bg-[#d3f8d0] rounded-3xl shadow-[0_4px_0_#1b6d24] border border-[#bfcaba] min-h-[190px] group">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 flex flex-col items-center justify-center text-[#0d631b] shadow-sm group-hover:scale-105 transition-transform border border-[#d9fdd6]">
                            <span className="material-symbols-outlined text-3xl sm:text-4xl">{card.icon}</span>
                            <span className="text-[10px] font-bold text-[#40493d] mt-1">Tap to Open</span>
                          </div>
                          <span className="mt-2 text-xs font-bold text-[#032109]">Card {idx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
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
                      Daily Rhythm & Routine Schedule
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    Medication & Daily Care Timeline
                  </h1>
                  <p className="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    Manage smart reminders, sync with pillbox sensors, and adjust dosage alerts for {patient?.name || 'Elder'}.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">add_alarm</span>
                    <span>Add New Reminder</span>
                  </button>
                </div>
              </div>

              {/* Progress Card */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#032109]">Today&apos;s Adherence Rate</h3>
                    <p className="text-xs sm:text-sm text-[#40493d]">
                      {takenCount} of {totalMeds} doses logged as taken
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
                  <h3 className="text-xl font-extrabold text-[#032109]">Full Medication Schedule</h3>
                  <span className="text-xs font-bold text-[#40493d] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Smart Pillbox Connected
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
                      Doctor & Family SOS Care Network
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    Emergency Contacts & Loved Ones
                  </h1>
                  <p className="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    Direct access to primary doctors, family members, and immediate ambulance dispatch in {patient?.city || 'your elder’s location'}.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button
                    onClick={() =>
                      showToast(
                        `💚 Broadcast sent to all family: "${patient?.honorific || patient?.name} is resting well and active today."`,
                        'heart',
                        6000
                      )
                    }
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                    <span>Send &ldquo;{patient?.name?.split(' ')[0] || 'Loved One'} is Safe&rdquo; to Everyone</span>
                  </button>
                </div>
              </div>

              {/* Emergency Hotlines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-red-50 border border-red-200 rounded-3xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-red-700 uppercase">Emergency Service</span>
                    <h3 className="text-lg font-extrabold text-red-900">108 Ambulance</h3>
                    <p className="text-xs text-red-600">{patient?.state || 'National'} Emergency Network</p>
                  </div>
                  <a
                    href="tel:108"
                    className="p-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">emergency</span>
                  </a>
                </div>

                <div className="p-5 bg-white border border-[#cdf2cb] rounded-3xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-[#0d631b] uppercase">Primary Physician</span>
                    <h3 className="text-lg font-extrabold text-[#032109]">Dr. {(patient?.city || 'Health').slice(0, 8)} Clinic</h3>
                    <p className="text-xs text-[#40493d]">{patient?.city || 'Local'} Health Center · +91 98640 99887</p>
                  </div>
                  <a
                    href="tel:+919864099887"
                    className="p-3 bg-[#006e1c] text-white rounded-full shadow-md hover:bg-[#0d631b] transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">call</span>
                  </a>
                </div>

                <div className="p-5 bg-white border border-[#cdf2cb] rounded-3xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-[#0d631b] uppercase">Primary Caregiver</span>
                    <h3 className="text-lg font-extrabold text-[#032109]">{caregiver?.name || 'Family Caregiver'}</h3>
                    <p className="text-xs text-[#40493d]">{caregiver?.relation || 'Primary Caregiver'} · {caregiver?.phone || '+91 98540 12345'}</p>
                  </div>
                  <a
                    href={`tel:${(caregiver?.phone || '+91 98540 12345').replace(/\s+/g, '')}`}
                    className="p-3 bg-[#006e1c] text-white rounded-full shadow-md hover:bg-[#0d631b] transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">call</span>
                  </a>
                </div>
              </div>

              {/* Family Contacts List */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <h3 className="text-xl font-extrabold text-[#032109]">All Linked Family Members & Caregivers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {contacts.map((c, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          className="w-14 h-14 rounded-2xl object-cover border border-[#cdf2cb] bg-white"
                          src={c.avatar}
                          alt={c.name}
                        />
                        <div>
                          <h4 className="text-base font-extrabold text-[#032109]">{c.name}</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold inline-block mt-0.5">
                            {c.relation}
                          </span>
                          <p className="text-xs text-[#40493d] mt-1">{c.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#cdf2cb]">
                        <a
                          href={`tel:${c.phone}`}
                          className="btn-tactile btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-base">call</span>
                          <span>Call Direct</span>
                        </a>
                        <button
                          onClick={() => showToast(`🎙️ Recording 15s voice note for ${c.name}...`, 'info')}
                          type="button"
                          className="flex-1 py-2.5 rounded-xl bg-white text-[#0d631b] border border-[#cdf2cb] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#d9fdd6] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">mic</span>
                          <span>Voice Note</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AddReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />
    </div>
  );
}
