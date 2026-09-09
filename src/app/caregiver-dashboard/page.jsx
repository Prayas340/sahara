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
import { db, normalizeElderId } from '../../lib/firebaseClient.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

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
  const [todayGameSessions, setTodayGameSessions] = useState(0);
  const [todayGameScore, setTodayGameScore] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [isSafeMessageModalOpen, setIsSafeMessageModalOpen] = useState(false);
  const [activeSosAlert, setActiveSosAlert] = useState(null);

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

  // Patient Game Score & Analytics State (Real scores fetched directly from elder view portal)
  const [gameAnalytics, setGameAnalytics] = useState(() => (
    dataStore.getGameAnalytics ? dataStore.getGameAnalytics() : {
      todayScore: 0,
      weeklyScore: 0,
      todaySessions: 0,
      weeklySessions: 0,
      weeklyTrend: [],
      sessions: [],
      averageAccuracy: 0,
      stabilityRating: 'Awaiting First Game',
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

    // References for data listeners and timers
    let _elderId = curUser?.linkedElder?.id || curUser?.linkedElder?.phone || curUser?.linkedElder?.email || null;
    let _caregiverEmail = curUser?.email || null;
    const todayDate = getTodayDateString();
    let unsubDailyLog = null;
    let unsubElderDoc = null;

    // Real-time Firestore Live Listener for cross-device synchronization
    const setupFirestoreLiveListeners = (targetElderId) => {
      try {
        if (!db || !targetElderId) return;
        const cleanElderId = normalizeElderId(targetElderId);

        if (unsubDailyLog) {
          unsubDailyLog();
          unsubDailyLog = null;
        }
        if (unsubElderDoc) {
          unsubElderDoc();
          unsubElderDoc = null;
        }

        // 1. Subscribe to today's daily log: elders/{elderId}/dailyLogs/{todayDate}
        const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
        unsubDailyLog = onSnapshot(dailyLogRef, (docSnap) => {
          try {
            if (docSnap.exists()) {
              const data = docSnap.data() || {};
              const sessions = typeof data.gameSessions === 'number' ? data.gameSessions : 0;
              const score = typeof data.gameScore === 'number' ? data.gameScore : 0;
              if (sessions > 0) setTodayGameSessions(prev => Math.max(prev, sessions));
              if (score > 0) setTodayGameScore(prev => Math.max(prev, score));

              const history = Array.isArray(data.gamesHistory) ? data.gamesHistory : [];
              setGameAnalytics(prev => ({
                ...prev,
                todaySessions: Math.max(sessions, prev?.todaySessions || 0),
                todayScore: Math.max(score, prev?.todayScore || 0),
                sessions: history.length > 0 ? history : (prev?.sessions || []),
                recentScores: history.length > 0 ? history : (prev?.recentScores || []),
              }));

              const list = data.medications || data.routines;
              if (Array.isArray(list)) {
                const liveMeds = list.map((m, idx) => ({
                  id: m.id || `med_${idx}`,
                  title: m.title || m.name || `Routine ${idx + 1}`,
                  name: m.name || m.title || `Routine ${idx + 1}`,
                  detail: m.detail || m.title || 'Scheduled routine',
                  scheduledTime: m.scheduledTime || m.time || '08:00 AM',
                  taken: Boolean(m.taken || m.completed),
                  takenAt: m.completedAt || m.takenAt || null,
                  takenDate: m.takenDate || todayDate,
                }));
                setMedicines(liveMeds);
                if (dataStore?.state) dataStore.state.medicines = liveMeds;
              }

              // Check for emergency SOS alerts logged today
              if (data.lastSosAlert || (Array.isArray(data.sosAlerts) && data.sosAlerts.length > 0)) {
                const latest = data.lastSosAlert || data.sosAlerts[data.sosAlerts.length - 1];
                setActiveSosAlert(latest);
              } else {
                setActiveSosAlert(null);
              }
            } else {
              // Daily log document does not exist yet in Firestore for today
              setActiveSosAlert(null);
              // Do NOT zero out scores if already loaded from database or dataStore
              if (_elderId || _caregiverEmail) {
                fetchServerScores(_elderId, _caregiverEmail);
              }
            }
          } catch (snapErr) {
            console.warn('[CaregiverDashboard] dailyLog snapshot parsing error:', snapErr);
          }
        }, (err) => {
          console.warn('[CaregiverDashboard] Firestore dailyLog onSnapshot notice:', err.message);
        });

        // 2. Subscribe to elder profile doc: elders/{elderId}
        const elderDocRef = doc(db, 'elders', cleanElderId);
        unsubElderDoc = onSnapshot(elderDocRef, (docSnap) => {
          try {
            if (docSnap.exists()) {
              const elderData = docSnap.data() || {};
              if (elderData.name) {
                setPatient(prev => ({ ...prev, ...elderData }));
              }
              // If dailyLog hasn't loaded medicines and elderDoc has scheduled medications, load them
              if (Array.isArray(elderData.medications) && elderData.medications.length > 0) {
                setMedicines(prev => {
                  if (prev.length === 0) {
                    return elderData.medications.map((m, idx) => ({
                      id: m.id || `med_${idx}`,
                      title: m.title || m.name || `Routine ${idx + 1}`,
                      name: m.name || m.title || `Routine ${idx + 1}`,
                      detail: m.detail || m.title || 'Scheduled routine',
                      scheduledTime: m.scheduledTime || m.time || '08:00 AM',
                      taken: false,
                      takenAt: null,
                      takenDate: todayDate,
                    }));
                  }
                  return prev;
                });
              }
            }
          } catch (elderSnapErr) {
            console.warn('[CaregiverDashboard] elder doc snapshot error:', elderSnapErr);
          }
        }, (err) => {
          console.warn('[CaregiverDashboard] Firestore elder doc onSnapshot notice:', err.message);
        });
      } catch (e) {
        console.warn('[CaregiverDashboard] setupFirestoreLiveListeners error:', e);
      }
    };

    const syncData = () => {
      try {
        const activeUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
        if (activeUser?.linkedElder && activeUser.linkedElder.name) {
          setPatient(activeUser.linkedElder);
        }
        if (activeUser?.role === 'caregiver') {
          setCaregiver(activeUser);
        }
        setMedicines([...(dataStore.getMedicines ? dataStore.getMedicines() : (dataStore.state?.medicines || []))]);
        const loadedContacts = dataStore.getContacts ? dataStore.getContacts() : (dataStore.state?.contacts || []);
        setContacts([...loadedContacts]);
        if (dataStore.getGameAnalytics) {
          setGameAnalytics(dataStore.getGameAnalytics());
        }
      } catch (err) {
        console.warn('syncData error:', err);
      }
    };

    // Fetch fresh scores from server DB and update analytics
    const fetchServerScores = (elderId, caregiverEmail) => {
      if (!elderId && !caregiverEmail) return;
      fetch(`/api/game-scores?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(caregiverEmail || '')}`)
        .then(r => r.json())
        .then(sData => {
          if (sData?.success && sData?.scores) {
            dataStore.saveGameScores?.(sData.scores);
            if (sData.analytics) {
              setGameAnalytics(sData.analytics);
              const tSessions = Number(sData.analytics.todaySessions) || 0;
              const tScore = Number(sData.analytics.todayScore) || 0;
              if (tSessions > 0) setTodayGameSessions(prev => Math.max(prev, tSessions));
              if (tScore > 0) setTodayGameScore(prev => Math.max(prev, tScore));
            }
          } else if (dataStore.getGameAnalytics) {
            const ga = dataStore.getGameAnalytics();
            setGameAnalytics(ga);
            if (ga?.todaySessions > 0) setTodayGameSessions(prev => Math.max(prev, ga.todaySessions));
            if (ga?.todayScore > 0) setTodayGameScore(prev => Math.max(prev, ga.todayScore));
          }
        })
        .catch(() => {
          if (dataStore.getGameAnalytics) {
            const ga = dataStore.getGameAnalytics();
            setGameAnalytics(ga);
            if (ga?.todaySessions > 0) setTodayGameSessions(prev => Math.max(prev, ga.todaySessions));
            if (ga?.todayScore > 0) setTodayGameScore(prev => Math.max(prev, ga.todayScore));
          }
        });
    };

    // Fetch fresh reminders and routines from server DB
    const fetchServerReminders = (elderId, caregiverEmail) => {
      if (!elderId && !caregiverEmail) return;
      fetch(`/api/reminders?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(caregiverEmail || '')}`)
        .then(r => r.json())
        .then(rData => {
          if (rData?.success && rData?.medicines) {
            dataStore.state.medicines = rData.medicines;
            dataStore.saveState();
            setMedicines([...rData.medicines]);
          }
        })
        .catch(() => {});
    };

    // 1. Initial State Setup
    setCaregiver(curUser);
    if (curUser.linkedElder && curUser.linkedElder.name) {
      setPatient(curUser.linkedElder);
      setIsSyncing(false);
      setupFirestoreLiveListeners(curUser.linkedElder);
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
          setupFirestoreLiveListeners(elder);
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

          // Load reminders & medicines from database
          fetch(`/api/reminders?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(cgEmail || '')}`)
            .then(r => r.json())
            .then(rData => {
              if (rData?.success && rData?.medicines) {
                dataStore.saveMedicines(rData.medicines);
                setMedicines([...rData.medicines]);
              }
            })
            .catch(() => {});

          // Load game scores from database for analytics
          const resolvedElderId = elder.id || elder.phone || elder.email;
          _elderId = resolvedElderId || null;
          fetch(`/api/game-scores?elderId=${encodeURIComponent(resolvedElderId || '')}&caregiverEmail=${encodeURIComponent(cgEmail || '')}`)
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


    // On game score change, update state immediately and re-fetch from server
    const onGameScoreChange = (e) => {
      syncData();
      if (e?.detail?.score) {
        const s = e.detail.score;
        const addScore = Number(s.score) || 0;
        setTodayGameSessions(prev => prev + 1);
        setTodayGameScore(prev => prev + addScore);
        setGameAnalytics(prev => {
          const newSessions = (prev?.todaySessions || 0) + 1;
          const newScore = (prev?.todayScore || 0) + addScore;
          const history = [s, ...(prev?.sessions || [])];
          return {
            ...prev,
            todaySessions: newSessions,
            todayScore: newScore,
            sessions: history,
            recentScores: history.slice(0, 10),
          };
        });
      }
      fetchServerScores(_elderId, _caregiverEmail);
    };

    // On medicines change event, sync and re-fetch from server
    const onMedicinesChange = (e) => {
      if (e?.detail?.medicines && Array.isArray(e.detail.medicines)) {
        setMedicines([...e.detail.medicines]);
      } else {
        syncData();
      }
      fetchServerReminders(_elderId, _caregiverEmail);
    };

    window.addEventListener('sahara:datastore-change', syncData);
    window.addEventListener('sahara:auth-change', syncData);
    window.addEventListener('sahara:game-score-change', onGameScoreChange);
    window.addEventListener('sahara:medicines-change', onMedicinesChange);

    const onSosAlertChange = (e) => {
      const alert = e.detail;
      if (alert) {
        setActiveSosAlert(alert);
      }
    };
    window.addEventListener('sahara:sos-alert', onSosAlertChange);

    // Check local storage on mount for active SOS alert
    try {
      const storedSos = JSON.parse(localStorage.getItem('sahara_active_sos') || 'null');
      if (storedSos && storedSos.status === 'ACTIVE_SOS') {
        setActiveSosAlert(storedSos);
      }
    } catch (e) {}

    const fetchServerSosAlert = async (eid, cemail) => {
      try {
        const queryParams = new URLSearchParams();
        if (eid) queryParams.set('elderId', eid);
        if (cemail) queryParams.set('caregiverEmail', cemail);
        const res = await fetch(`/api/sos?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.alert && data.alert.status === 'ACTIVE_SOS') {
            setActiveSosAlert(data.alert);
          }
        }
      } catch (e) {}
    };

    // Poll scores, routine completions, and SOS alerts from server every 5 seconds for real-time cross-device sync
    const pollInterval = setInterval(() => {
      if (_elderId || _caregiverEmail) {
        fetchServerScores(_elderId, _caregiverEmail);
        fetchServerReminders(_elderId, _caregiverEmail);
        fetchServerSosAlert(_elderId, _caregiverEmail);
      }
    }, 5000);

    // Read initial tab from URL if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'memories', 'routine', 'contacts'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }

    // Set _elderId after sync resolves (via closure ref)
    setTimeout(() => {
      const storedPatient = dataStore.state?.patient;
      const resolved = storedPatient?.id || storedPatient?.phone || storedPatient?.email;
      if (resolved) {
        _elderId = resolved;
        setupFirestoreLiveListeners(resolved);
        fetchServerSosAlert(resolved, _caregiverEmail);
      }
    }, 2000);

    return () => {
      window.removeEventListener('sahara:datastore-change', syncData);
      window.removeEventListener('sahara:auth-change', syncData);
      window.removeEventListener('sahara:game-score-change', onGameScoreChange);
      window.removeEventListener('sahara:medicines-change', onMedicinesChange);
      window.removeEventListener('sahara:sos-alert', onSosAlertChange);
      clearInterval(pollInterval);
      if (unsubDailyLog) unsubDailyLog();
      if (unsubElderDoc) unsubElderDoc();
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
        setMedicines([...(dataStore.getMedicines ? dataStore.getMedicines() : (dataStore.state?.medicines || []))]);
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
  const medPercent = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0;
  const displayTodaySessions = Math.max(todayGameSessions, gameAnalytics?.todaySessions || 0);
  const displayTodayScore = Math.max(todayGameScore, gameAnalytics?.todayScore || 0);
  const displayWeeklyScore = Math.max(gameAnalytics?.weeklyScore || 0, displayTodayScore);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `/caregiver-dashboard?tab=${tab}`);
  };

  const handleDeleteReminder = (reminderId, reminderTitle) => {
    dataStore.deleteReminder(reminderId);
    const updated = (medicines || []).filter(m => m.id !== reminderId);
    setMedicines([...updated]);
    if (db) {
      const cleanElderId = normalizeElderId(patient?.id || patient?.phone || patient?.email || '+919854012345');
      const todayDate = getTodayDateString();
      setDoc(doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate), {
        medications: updated,
        routines: updated.map(m => ({ id: m.id, title: m.title || m.name, completed: Boolean(m.taken), completedAt: m.takenAt || null })),
      }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'elders', cleanElderId), {
        medications: updated,
        routines: updated.map(m => ({ id: m.id, title: m.title || m.name, completed: Boolean(m.taken), completedAt: m.takenAt || null })),
      }, { merge: true }).catch(() => {});
    }

    // Persist to server DB
    fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        elderId: patient?.id || patient?.phone,
        caregiverEmail: caregiver?.email,
        reminderId,
      }),
    }).catch(() => {});

    showToast(`🗑️ Removed reminder "${reminderTitle || 'Reminder'}"`, 'info', 3000);
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

              {/* Live Emergency SOS Alert Banner */}
              {activeSosAlert && (
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-red-300 flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white text-red-600 flex items-center justify-center font-black shadow-md shrink-0">
                      <span className="material-symbols-outlined text-3xl">emergency</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-yellow-300 text-red-950 text-[10px] font-black uppercase tracking-wider">
                          CRITICAL EMERGENCY SOS
                        </span>
                        <span className="text-xs text-red-100 font-semibold">{activeSosAlert.time || activeSosAlert.formattedTime || 'Today'}</span>
                      </div>
                      <p className="text-base font-extrabold text-white mt-0.5">
                        {patient?.name || 'Prayas Dey'} triggered the Emergency SOS Beacon!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    <a
                      href={`tel:${patient?.phone?.replace(/\s+/g, '') || '+919854012345'}`}
                      className="btn-tactile flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">call</span>
                      <span>Call {patient?.honorific || patient?.name?.split(' ')[0] || 'Elder'} Now</span>
                    </a>
                    <button
                      onClick={() => {
                        setActiveSosAlert(null);
                        try { localStorage.removeItem('sahara_active_sos'); } catch (e) {}
                      }}
                      type="button"
                      className="px-3.5 py-2.5 rounded-xl bg-red-800/80 hover:bg-red-800 text-white font-bold text-xs cursor-pointer border border-red-400"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

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
                      ? `${t.metricNextMed || 'Next'}: ` + (medicines.find((m) => !m.taken).scheduledTime || 'Scheduled')
                      : (totalMeds > 0 ? (t.metricAllMedsDone || 'All medicines completed for today') : 'No scheduled medicines')}
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
                    {displayTodaySessions} {t.metricSessions || 'Sessions'}
                  </p>
                  <span className="text-xs text-[#40493d] mt-1">
                    {displayTodaySessions > 0
                      ? `${displayTodayScore} pts logged today`
                      : 'No game rounds played today'}
                  </span>
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
                    {medicines.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] text-sm text-[#40493d]">
                        No scheduled routines found for today.
                      </div>
                    ) : (
                      medicines.map((med, idx) => (
                        <div
                          key={med.id || idx}
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
                              <p className="text-sm sm:text-base font-bold text-[#032109]">{med.title || med.name}</p>
                              <p className="text-xs text-[#40493d]">
                                {med.detail || 'Daily routine'} • {med.scheduledTime}
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
                      ))
                    )}
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
                      {displayTodaySessions} {t.metricSessions || 'Sessions'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#032109]">{displayTodayScore}</span>
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
                      <span className="text-3xl font-extrabold text-[#032109]">{displayWeeklyScore}</span>
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
                    {(gameAnalytics.weeklyTrend && gameAnalytics.weeklyTrend.length > 0 ? gameAnalytics.weeklyTrend : (() => {
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const days = [];
                      for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const dayLabel = i === 0 ? 'Today' : dayNames[d.getDay()];
                        const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
                        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        days.push({ day: dayLabel, dateStr, score: 0, sessions: 0, isToday: i === 0, date: dStr });
                      }
                      return days;
                    })()).map((dayData, idx) => {
                      const isToday = idx === 6 || dayData.day === 'Today' || dayData.isToday;
                      const score = isToday ? Math.max(dayData.score || 0, displayTodayScore) : (dayData.score || 0);
                      const heightPercent = score > 0 ? Math.max(16, Math.min(100, Math.round((score / 350) * 100))) : 8;
                      const displayDayLabel = isToday ? 'Today' : dayData.day;
                      const displayDateLabel = isToday
                        ? `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}`
                        : (dayData.dateStr || '');
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end">
                          {/* Score Pill */}
                          <span className={`text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-md transition-all ${
                            isToday && score > 0 ? 'bg-[#006e1c] text-white shadow-sm' : score > 0 ? 'bg-white text-[#0d631b] border border-[#cdf2cb]' : 'text-gray-400'
                          }`}>
                            {score > 0 ? `${score}p` : '0p'}
                          </span>

                          {/* Bar */}
                          <div className="w-full max-w-[48px] bg-white rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 h-36 border border-[#cdf2cb]">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                score >= 260
                                  ? 'bg-gradient-to-t from-[#0d631b] to-[#43a047]'
                                  : score > 0
                                  ? 'bg-gradient-to-t from-[#81c784] to-[#a3f69c]'
                                  : 'bg-emerald-50/50'
                              }`}
                            ></div>
                          </div>

                          {/* Day & Date Labels */}
                          <div className="text-center">
                            <p className={`text-xs font-extrabold ${isToday ? 'text-[#006e1c]' : 'text-[#032109]'}`}>
                              {displayDayLabel}
                            </p>
                            <p className="text-[10px] text-[#40493d]">{displayDateLabel}</p>
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
                    {(gameAnalytics.sessions && Array.isArray(gameAnalytics.sessions) ? gameAnalytics.sessions.length : (gameAnalytics.recentScores ? gameAnalytics.recentScores.length : 0))} Total Records
                  </span>
                </div>

                <div className="overflow-x-auto pt-2">
                  {(!gameAnalytics.sessions || gameAnalytics.sessions.length === 0) && (!gameAnalytics.recentScores || gameAnalytics.recentScores.length === 0) ? (
                    <div className="text-center py-10 px-4 bg-[#ebffe7]/40 rounded-2xl border border-dashed border-[#cdf2cb]">
                      <span className="material-symbols-outlined text-4xl text-[#0d631b] mb-2">sports_esports</span>
                      <h4 className="text-base font-bold text-[#032109]">No Game Sessions Recorded Yet</h4>
                      <p className="text-xs text-[#40493d] mt-1 max-w-sm mx-auto">
                        Scores and memory recall accuracy will appear here in real-time as {patient?.name ? patient.name.split(' ')[0] : 'the elder'} plays memory games in their portal.
                      </p>
                    </div>
                  ) : (
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
                        {(gameAnalytics.sessions && gameAnalytics.sessions.length > 0 ? gameAnalytics.sessions : (gameAnalytics.recentScores || [])).map((sess, sIdx) => {
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
                  )}
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
                  {medicines.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] text-sm text-[#40493d]">
                      No scheduled routines found. Click &quot;Add New Reminder&quot; above to create one.
                    </div>
                  ) : (
                    medicines.map((med, idx) => (
                      <div
                        key={med.id || idx}
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

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Status badge — read only, elder marks from their device */}
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                            med.taken
                              ? 'bg-[#d9fdd6] text-[#0c7521]'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {med.taken ? 'check_circle' : 'pending'}
                          </span>
                          {med.taken
                            ? `✓ Taken${med.takenAt ? ' (' + med.takenAt + ')' : ''}`
                            : 'Pending (Elder marks)'}
                        </span>

                        <button
                          onClick={() => handleDeleteReminder(med.id, med.title)}
                          type="button"
                          title="Delete Reminder"
                          className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>

              {/* Daily Milestones - Live Dynamic Rhythm */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <h3 className="text-xl font-extrabold text-[#032109]">Daily Activity Rhythm</h3>
                {medicines.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] text-sm text-[#40493d]">
                    No routine milestones scheduled yet. Click &quot;Add New Reminder&quot; above to establish {patient?.name || 'the elder'}&apos;s daily rhythm.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                    {medicines.map((med, idx) => (
                      <div key={med.id || idx} className="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#0d631b] uppercase">
                              {med.scheduledTime || 'Scheduled'}
                            </span>
                            <span className="material-symbols-outlined text-[#0d631b]">
                              {med.taken ? 'check_circle' : 'schedule'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#032109]">{med.title || med.name}</p>
                          <p className="text-xs text-[#40493d] mt-1">{med.detail}</p>
                        </div>
                        <div className="pt-3 mt-2 border-t border-[#cdf2cb] flex items-center justify-between">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            med.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {med.taken ? `✓ Completed${med.takenAt ? ' (' + med.takenAt + ')' : ''}` : 'Pending Elder'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                      {t.tabContacts || 'Family Contact'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    {t.emergencyContactsTitle || 'Family Contacts & Loved Ones'}
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
