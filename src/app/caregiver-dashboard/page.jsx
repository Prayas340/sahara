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
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { COGNITIVE_LEVELS } from '../../data/gamesData.js';

function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function CaregiverDashboardPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'memories' | 'routine' | 'contacts' | 'report'

  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('sahara:portal-tab-change', {
        detail: { tab: activeTab, layout: 'caregiver-dashboard' }
      }));
    } catch (e) {}
  }, [activeTab]);
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

  // AI Clinical Report State
  const [aiReportData, setAiReportData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

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
    let unsubCaregiverDoc = null;

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
        unsubDailyLog = onSnapshot(dailyLogRef, async (docSnap) => {
          try {
            if (docSnap.exists()) {
              const data = docSnap.data() || {};
              const history = Array.isArray(data.sessionsHistory) && data.sessionsHistory.length > 0
                ? data.sessionsHistory
                : (Array.isArray(data.gamesHistory) ? data.gamesHistory : []);
              
              const sessions = typeof data.todaySessions === 'number'
                ? data.todaySessions
                : (typeof data.completedSessions === 'number'
                    ? data.completedSessions
                    : (typeof data.gameSessions === 'number'
                        ? data.gameSessions
                        : history.filter(s => (s.pointsEarned !== undefined ? Number(s.pointsEarned) > 0 : Number(s.score) > 0)).length));

              const score = typeof data.todayScore === 'number'
                ? data.todayScore
                : (typeof data.totalScore === 'number'
                    ? data.totalScore
                    : (typeof data.gameScore === 'number'
                        ? data.gameScore
                        : sessions * 50));
              
              setTodayGameSessions(sessions);
              setTodayGameScore(score);

              // Calculate cognitive score percentage (sticks to 50 pts for completion, timeout reduces percentage)
              const totalAttempts = history.length;
              const historyAcc = totalAttempts > 0
                ? Math.round(history.reduce((sum, g) => {
                    if (g.accuracy !== undefined && typeof g.accuracy === 'number') {
                      return sum + g.accuracy;
                    }
                    if (g.pointsEarned !== undefined) {
                      return sum + (Number(g.pointsEarned) > 0 ? 100 : 0);
                    }
                    return sum + (Number(g.score) > 0 ? 100 : 0);
                  }, 0) / totalAttempts)
                : (sessions > 0 ? 100 : 0);

              const stability = totalAttempts > 0
                ? (historyAcc >= 90
                    ? `High Recall (${historyAcc}%)`
                    : (historyAcc >= 70
                        ? `Steady Recall (${historyAcc}%)`
                        : `Needs Support (${historyAcc}%)`))
                : (sessions > 0 ? 'Steady Recall' : 'Awaiting Game Today');

              // Fetch and sum past 7 days of daily log records from Firestore
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const daysPromises = [];

              for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const dayLabel = i === 0 ? 'Today' : dayNames[d.getDay()];
                const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

                if (i === 0) {
                  daysPromises.push(Promise.resolve({
                    day: 'Today',
                    dateStr,
                    date: dStr,
                    score,
                    sessions,
                    isToday: true,
                  }));
                } else {
                  const pastRef = doc(db, 'elders', cleanElderId, 'dailyLogs', dStr);
                  daysPromises.push(
                    getDoc(pastRef).then(pSnap => {
                      if (pSnap.exists()) {
                        const pData = pSnap.data() || {};
                        const pSess = typeof pData.todaySessions === 'number'
                          ? pData.todaySessions
                          : (typeof pData.completedSessions === 'number' ? pData.completedSessions : 0);
                        const pScore = typeof pData.todayScore === 'number'
                          ? pData.todayScore
                          : (typeof pData.totalScore === 'number' ? pData.totalScore : pSess * 50);
                        return { day: dayLabel, dateStr, date: dStr, score: pScore, sessions: pSess, isToday: false };
                      }
                      return { day: dayLabel, dateStr, date: dStr, score: 0, sessions: 0, isToday: false };
                    }).catch(() => ({ day: dayLabel, dateStr, date: dStr, score: 0, sessions: 0, isToday: false }))
                  );
                }
              }

              try {
                const sevenDays = await Promise.all(daysPromises);
                const weeklySum = sevenDays.reduce((sum, day) => sum + (Number(day.score) || 0), 0);
                const weeklySessSum = sevenDays.reduce((sum, day) => sum + (Number(day.sessions) || 0), 0);

                setGameAnalytics({
                  todaySessions: sessions,
                  todayScore: score,
                  weeklyScore: weeklySum,
                  weeklySessions: weeklySessSum,
                  weeklyTrend: sevenDays,
                  averageAccuracy: historyAcc,
                  avgAccuracy: historyAcc,
                  stabilityRating: stability,
                  cognitiveStability: stability,
                  sessions: history,
                  recentScores: history,
                });
              } catch (e) {
                setGameAnalytics(prev => ({
                  ...prev,
                  todaySessions: sessions,
                  todayScore: score,
                  averageAccuracy: historyAcc,
                  avgAccuracy: historyAcc,
                  stabilityRating: stability,
                  cognitiveStability: stability,
                  sessions: history,
                  recentScores: history,
                }));
              }

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

              // Sync scores from elder profile doc if present
              const docScore = typeof elderData.games?.totalScore === 'number'
                ? elderData.games.totalScore
                : (typeof elderData.todayGameScore === 'number' ? elderData.todayGameScore : 0);
              const docSessions = typeof elderData.games?.completedSessions === 'number'
                ? elderData.games.completedSessions
                : (typeof elderData.todayGameSessions === 'number' ? elderData.todayGameSessions : 0);
              if (docScore > 0 || docSessions > 0) {
                setTodayGameScore(prev => Math.max(prev, docScore));
                setTodayGameSessions(prev => Math.max(prev, docSessions));
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
      const todayDate = getTodayDateString();
      fetch(`/api/game-scores?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(caregiverEmail || '')}&date=${encodeURIComponent(todayDate)}`)
        .then(r => r.json())
        .then(sData => {
          if (sData?.success && sData?.scores) {
            dataStore.saveGameScores?.(sData.scores);
            if (sData.analytics) {
              setGameAnalytics(sData.analytics);
              const tSessions = Number(sData.analytics.todaySessions) || 0;
              const tScore = Number(sData.analytics.todayScore) || 0;
              if (tSessions > 0 || tScore > 0) {
                setTodayGameSessions(prev => Math.max(prev, tSessions));
                setTodayGameScore(prev => Math.max(prev, tScore));
              } else if (sData.scores.length > 0) {
                const totalScore = sData.scores.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
                setTodayGameSessions(prev => Math.max(prev, sData.scores.length));
                setTodayGameScore(prev => Math.max(prev, totalScore));
              }
            }
          } else if (dataStore.getGameAnalytics) {
            const ga = dataStore.getGameAnalytics();
            if (ga) {
              setGameAnalytics(prev => ({ ...prev, ...ga }));
              const gaSessions = Number(ga.todaySessions) || 0;
              const gaScore = Number(ga.todayScore) || 0;
              if (gaSessions > 0 || gaScore > 0) {
                setTodayGameSessions(prev => Math.max(prev, gaSessions));
                setTodayGameScore(prev => Math.max(prev, gaScore));
              }
            }
          }
        })
        .catch(() => {
          if (dataStore.getGameAnalytics) {
            const ga = dataStore.getGameAnalytics();
            if (ga) {
              setGameAnalytics(prev => ({ ...prev, ...ga }));
              const gaSessions = Number(ga.todaySessions) || 0;
              const gaScore = Number(ga.todayScore) || 0;
              if (gaSessions > 0 || gaScore > 0) {
                setTodayGameSessions(prev => Math.max(prev, gaSessions));
                setTodayGameScore(prev => Math.max(prev, gaScore));
              }
            }
          }
        });
    };

    // Fetch fresh reminders and routines from server DB
    const fetchServerReminders = (elderId, caregiverEmail) => {
      if (!elderId && !caregiverEmail) return;
      fetch(`/api/reminders?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(caregiverEmail || '')}`)
        .then(r => r.json())
        .then(rData => {
          if (rData?.success && Array.isArray(rData?.medicines)) {
            setMedicines(prev => {
              const current = prev || [];
              const merged = rData.medicines.map(rm => {
                const prevItem = current.find(p => p.id === rm.id || p.title === rm.title || p.name === rm.name);
                if (rm.taken) return rm;
                if (prevItem?.taken) {
                  return { ...rm, taken: true, takenAt: prevItem.takenAt, takenDate: prevItem.takenDate };
                }
                return rm;
              });
              if (dataStore?.state) {
                dataStore.state.medicines = merged;
                dataStore.saveState?.();
              }
              return merged;
            });
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
          fetchServerScores(resolvedElderId, cgEmail);
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

    // 3. Subscribe to Caregiver Document in Firestore for dynamic reciprocal linkedElderId
    if (db && _caregiverEmail) {
      const cleanCg = _caregiverEmail.trim().toLowerCase();
      const cgDocRef = doc(db, 'caregivers', cleanCg);
      unsubCaregiverDoc = onSnapshot(cgDocRef, (cgSnap) => {
        if (cgSnap.exists()) {
          const cgData = cgSnap.data() || {};
          if (cgData.name) {
            setCaregiver(prev => ({ ...prev, ...cgData }));
          }
          if (cgData.linkedElderId) {
            _elderId = cgData.linkedElderId;
            setIsSyncing(false);
            setupFirestoreLiveListeners(cgData.linkedElderId);
          }
        }
      }, (err) => console.warn('[CaregiverDashboard] Caregiver onSnapshot notice:', err));
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
      if (unsubCaregiverDoc) unsubCaregiverDoc();
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
  const displayTodaySessions = Math.max(Number(todayGameSessions) || 0, Number(gameAnalytics?.todaySessions) || 0);
  const displayTodayScore = Math.max(Number(todayGameScore) || 0, Number(gameAnalytics?.todayScore) || 0);
  const displayWeeklyScore = Math.max(Number(gameAnalytics?.weeklyScore) || 0, displayTodayScore);

  const handleResetScores = async () => {
    try {
      const elderId = patient?.id || patient?.phone || patient?.email;
      const cgEmail = caregiver?.email;

      // 1. Reset Server DB
      await fetch(`/api/game-scores?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(cgEmail || '')}`, {
        method: 'DELETE',
      }).catch(() => {});

      // 2. Reset Local DataStore
      dataStore.clearGameScores?.();

      // 3. Reset Firestore if available
      if (db) {
        const cleanElderId = normalizeElderId(elderId || '+919854012345');
        const todayDate = getTodayDateString();
        const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
        const elderRef = doc(db, 'elders', cleanElderId);
        await Promise.allSettled([
          setDoc(dailyLogRef, { gameSessions: 0, gameScore: 0, gamesHistory: [] }, { merge: true }),
          setDoc(elderRef, { todayGameScore: 0, todayGameSessions: 0, lastGameScore: 0 }, { merge: true }),
        ]);
      }

      // 4. Update UI State
      setTodayGameSessions(0);
      setTodayGameScore(0);
      setGameAnalytics({
        todayScore: 0,
        todaySessions: 0,
        todayAvgScore: 0,
        weeklyScore: 0,
        weeklySessions: 0,
        weeklyAvgDailyScore: 0,
        avgAccuracy: 0,
        averageAccuracy: 0,
        cognitiveStability: 'Awaiting Game Today',
        stabilityRating: 'Awaiting Game Today',
        last7Days: [],
        weeklyTrend: [],
        sessions: [],
        recentScores: [],
      });

      showToast('✓ Game scores reset to 0. Ready for new games!', 'success', 3000);
    } catch (err) {
      console.error('Reset scores error:', err);
      showToast('Could not reset scores: ' + err.message, 'error', 3000);
    }
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `/caregiver-dashboard?tab=${tab}`);
    if (tab === 'report' && !aiReportData) {
      handleGenerateReport();
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: patient || {},
          gameAnalytics: {
            ...gameAnalytics,
            todaySessions: todayGameSessions,
            todayScore: todayGameScore,
          },
          medications: medicines || [],
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiReportData(data.data);
        showToast('✓ AI Clinical Report generated successfully!', 'success', 3000);
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Generate report error:', err);
      showToast('Could not generate report: ' + err.message, 'error', 3000);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPdfReport = async () => {
    setIsDownloadingPdf(true);
    showToast('Preparing downloadable PDF patient report...', 'info', 2500);
    try {
      const element = document.getElementById('printable-patient-report');
      if (!element) {
        window.print();
        setIsDownloadingPdf(false);
        return;
      }

      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const safePatientName = (patient?.name || 'Patient').replace(/\s+/g, '_');
      const todayDateStr = getTodayDateString();
      pdf.save(`Sahara_Clinical_Report_${safePatientName}_${todayDateStr}.pdf`);
      showToast('✓ Patient Report PDF downloaded successfully!', 'success', 3500);
    } catch (err) {
      console.error('Download PDF error:', err);
      showToast('Exporting via browser print dialog...', 'info', 3000);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
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

  const handleToggleMedStatus = (medId, medTitle) => {
    const todayStr = getTodayDateString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let targetNewTaken = false;
    const updated = (medicines || []).map(m => {
      if (m.id === medId || m.title === medTitle || m.name === medTitle) {
        targetNewTaken = !m.taken;
        return {
          ...m,
          taken: targetNewTaken,
          takenAt: targetNewTaken ? timeStr : null,
          takenDate: targetNewTaken ? todayStr : null,
        };
      }
      return m;
    });

    setMedicines([...updated]);
    dataStore.saveMedicines?.(updated);

    const elderId = patient?.id || patient?.phone || patient?.email;
    const caregiverEmail = caregiver?.email;

    // Direct Firestore write for instant cross-device sync
    if (db) {
      const cleanElderId = normalizeElderId(elderId || '+919854012345');
      const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayStr);
      const elderRef = doc(db, 'elders', cleanElderId);

      const formattedMeds = updated.map(m => ({
        id: m.id,
        name: m.title || m.name,
        title: m.title || m.name,
        detail: m.detail || '',
        scheduledTime: m.scheduledTime || m.time || '08:00 AM',
        taken: Boolean(m.taken),
        completedAt: m.taken ? (m.takenAt || timeStr) : null,
        takenAt: m.taken ? (m.takenAt || timeStr) : null,
        takenDate: m.taken ? (m.takenDate || todayStr) : null,
      }));

      const formattedRoutines = updated.map(m => ({
        id: m.id,
        title: m.title || m.name,
        completed: Boolean(m.taken),
        completedAt: m.taken ? (m.takenAt || timeStr) : null,
      }));

      setDoc(dailyLogRef, {
        medications: formattedMeds,
        routines: formattedRoutines,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});

      setDoc(elderRef, {
        medications: formattedMeds,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }

    // Direct server toggle & sync
    fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        elderId,
        caregiverEmail,
        medicines: updated,
        reminderId: medId,
        taken: targetNewTaken,
        takenAt: targetNewTaken ? timeStr : null,
        takenDate: targetNewTaken ? todayStr : null,
      }),
    }).catch(() => {});

    showToast(targetNewTaken ? `✓ Marked "${medTitle}" as completed!` : `Marked "${medTitle}" as pending.`, 'success', 3000);
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

      <div className="flex-1 flex pt-24 sm:pt-28 lg:pt-20">
        {/* Persistent Left Sidebar */}
        <CaregiverSidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          patient={patient}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[80rem] mx-auto w-full pb-28 pt-2 sm:pt-4 lg:pt-6">
          {/* Explicit Sync Status if Database Read Failed or No Elder Linked */}
          {!isSyncing && !patient && (
            <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-white border border-amber-300 text-[#032109] flex flex-col items-center justify-center text-center space-y-4 shadow-md max-w-2xl mx-auto my-6 sm:my-12">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">cloud_sync</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#032109]">Elder Profile Not Synchronized</h3>
                <p className="text-xs sm:text-sm text-[#40493d]">
                  {syncError || `No elder profile is associated with caregiver "${caregiver?.email || 'this account'}" in the cloud database.`}
                </p>
                <p className="text-[11px] sm:text-xs text-[#40493d]">
                  To sync across devices, please ensure the Elder Profile setup was completed on Device A with this caregiver email.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
                <button
                  type="button"
                  onClick={handleRetrySync}
                  className="btn-tactile btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  <span>Retry Cloud Sync</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/caregiver-login')}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#ebffe7] text-[#0d631b] border border-[#cdf2cb] font-bold text-xs hover:bg-[#d9fdd6] transition-colors cursor-pointer"
                >
                  Switch Account / Back to Login
                </button>
              </div>
            </div>
          )}

          {/* Syncing Indicator */}
          {isSyncing && !patient && (
            <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#cdf2cb] flex flex-col items-center justify-center text-center space-y-3 shadow-md max-w-xl mx-auto my-6 sm:my-12">
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
            <div className="space-y-4 sm:space-y-6">
              {/* Top Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
                    <span className="text-[11px] sm:text-xs font-bold text-[#0d631b] uppercase tracking-wider">
                      {t.monitoringHeader || 'Live Synchronized Caregiver Portal'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#032109]">
                    {t.goodMorning || 'Hello'}, {caregiver?.name?.split(' ')[0] || 'Caregiver'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#40493d]">
                    {patient?.honorific || patient?.name} · {patient?.city ? `${patient.city}, ${patient.state || ''}` : t.residenceSanctuary || 'Live Connected'}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-1.5 h-9 sm:h-11 px-3.5 sm:px-5 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base sm:text-xl">add_alarm</span>
                    <span>{t.addReminder || 'Add Reminder'}</span>
                  </button>
                </div>
              </div>

              {/* Live Emergency SOS Alert Banner */}
              {activeSosAlert && (
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3.5 sm:p-5 rounded-2xl shadow-xl border-2 border-red-300 flex flex-col sm:flex-row items-center justify-between gap-3 animate-bounce-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white text-red-600 flex items-center justify-center font-black shadow-md shrink-0">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl">emergency</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-yellow-300 text-red-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                          CRITICAL EMERGENCY SOS
                        </span>
                        <span className="text-[11px] sm:text-xs text-red-100 font-semibold">{activeSosAlert.time || activeSosAlert.formattedTime || 'Today'}</span>
                      </div>
                      <p className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                        {patient?.name || 'Prayas Dey'} triggered the Emergency SOS Beacon!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <a
                      href={`tel:${patient?.phone?.replace(/\s+/g, '') || '+919854012345'}`}
                      className="btn-tactile flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">call</span>
                      <span>Call {patient?.honorific || patient?.name?.split(' ')[0] || 'Elder'} Now</span>
                    </a>
                    <button
                      onClick={() => {
                        setActiveSosAlert(null);
                        try { localStorage.removeItem('sahara_active_sos'); } catch (e) {}
                      }}
                      type="button"
                      className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-red-800/80 hover:bg-red-800 text-white font-bold text-xs cursor-pointer border border-red-400"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Patient Card */}
              <div className="card-tactile w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm sm:shadow-md relative overflow-hidden border border-[#cdf2cb]">
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#d9fdd6]/60 pointer-events-none blur-2xl"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
                  <div className="flex items-center gap-3.5 sm:gap-6">
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
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden shadow-xs sm:shadow-sm border border-[#cdf2cb] bg-white relative block cursor-pointer transition-transform hover:scale-105 shrink-0"
                      >
                        <img
                          alt={patient?.name || 'Patient'}
                          className="w-full h-full object-cover bg-white"
                          src={patient?.avatar || '/avatar.png'}
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-lg sm:text-xl">photo_camera</span>
                          <span className="text-[9px] font-bold">Upload</span>
                        </div>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        title="Upload photo"
                        className="absolute -bottom-1 -right-1 bg-[#0d631b] hover:bg-[#006e1c] text-white p-1 rounded-full shadow-xs flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">photo_camera</span>
                      </button>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#032109] truncate">{patient?.name || 'Elder Patient'}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-[#d3f8d0] text-[#40493d] text-[10px] sm:text-xs font-bold">
                          {patient?.age || 74}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-[10px] sm:text-xs font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c] animate-pulse"></span>
                          {t.activeToday || 'Active'} · {patient?.lastActive || 'Just now'}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs lg:text-sm text-[#40493d] mb-1.5 truncate">
                        {(patient?.status || patient?.problemStatement || t.mildCognitiveSupport || 'Mild Cognitive Support Mode')} · {(patient?.location || patient?.wing || t.residenceSanctuary || 'Residence Sanctuary')}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 text-[#40493d] text-[11px] sm:text-xs font-semibold flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#0d631b] text-sm sm:text-base">wifi_tethering</span>
                          {t.deviceConnected || 'Connected'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#724f00] text-sm sm:text-base">home_pin</span>
                          {patient?.location || (patient?.city ? `${patient.city}, ${patient.state || ''}` : t.residenceSanctuary || 'Home')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                    <button
                      onClick={() => {
                        const targetPhone = patient?.phone || '+91 98540 12345';
                        showToast(`Calling ${patient?.honorific || patient?.name} (${targetPhone})...`, 'heart');
                        window.open(`tel:${targetPhone.replace(/\s+/g, '')}`);
                      }}
                      type="button"
                      className="btn-tactile btn-primary flex items-center justify-center gap-1.5 h-10 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">call</span>
                      <span className="truncate">{t.callDirect || 'Call'} {patient?.honorific || patient?.name?.split(' ')[0] || 'Elder'}</span>
                    </button>
                    <button
                      onClick={() => handleSelectTab('memories')}
                      type="button"
                      className="btn-tactile btn-secondary flex items-center justify-center gap-1.5 h-10 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold bg-[#d3f8d0] text-[#032109] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">photo_library</span>
                      <span className="truncate">{t.tabMemories || 'Game Score'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div
                  onClick={() => handleSelectTab('routine')}
                  className="card-tactile bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs sm:shadow-sm border border-[#cdf2cb] flex flex-col justify-between cursor-pointer hover:border-[#006e1c] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#d9fdd6] flex items-center justify-center text-[#0d631b] shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">medication</span>
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#032109]">{t.metricMedicines || 'Medicines'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-[#0d631b]">
                        {takenCount}/{totalMeds}
                      </span>
                      <span className="text-[10px] sm:text-xs text-[#40493d] block">{t.metricTaken || 'Taken'}</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#d3f8d0] h-2 sm:h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0d631b] h-full rounded-full transition-all duration-500"
                      style={{ width: `${medPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#40493d] mt-2">
                    {medicines.find((m) => !m.taken)
                      ? `${t.metricNextMed || 'Next'}: ` + (medicines.find((m) => !m.taken).scheduledTime || 'Scheduled')
                      : (totalMeds > 0 ? (t.metricAllMedsDone || 'All medicines completed for today') : 'No scheduled medicines')}
                  </span>
                </div>

                <div
                  onClick={() => handleSelectTab('memories')}
                  className="card-tactile bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs sm:shadow-sm border border-[#cdf2cb] flex flex-col justify-between cursor-pointer hover:border-[#006e1c] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#98f994] flex items-center justify-center text-[#0c7521] shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">psychology</span>
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#032109]">{t.metricMindGames || 'Mind Games'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-[10px] sm:text-xs font-bold">{t.activeToday || 'Today'}</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#032109]">
                    {displayTodaySessions} {t.metricSessions || 'Sessions'}
                  </p>
                  <span className="text-[11px] sm:text-xs text-[#40493d] mt-0.5 sm:mt-1">
                    {displayTodaySessions > 0
                      ? `${displayTodayScore} pts logged today`
                      : 'No game rounds played today'}
                  </span>
                </div>

                <div className="card-tactile bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs sm:shadow-sm border border-[#cdf2cb] flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#ffdeaa] flex items-center justify-center text-[#724f00] shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">mood</span>
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#032109]">{t.metricMood || 'Mood & Comfort'}</span>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-lg sm:text-xl">favorite</span>
                  </div>
                  <p className="text-base sm:text-lg font-extrabold text-[#032109]">
                    {dataStore.state.moodRating || t.metricMoodCalm || 'Very Calm & Cheerful'}
                  </p>
                  <span className="text-[11px] sm:text-xs text-[#40493d] mt-0.5 sm:mt-1">{t.metricChaiResponse || 'Positive response to morning chai'}</span>
                </div>
              </div>

              {/* Medication Schedule & Vitals */}
              <div className="w-full card-tactile bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm sm:shadow-md border border-[#cdf2cb] space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#032109]">{t.medScheduleTitle || 'Medication Schedule & Vitals'}</h3>
                    <p className="text-[11px] sm:text-xs lg:text-sm text-[#40493d]">
                      {t.medScheduleSubtitle || 'Real-time synchronization with smart pillbox and elder tablet'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectTab('routine')}
                    className="text-xs font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm sm:text-base">edit</span> {t.openSchedule || 'Open Schedule'}
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

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleResetScores}
                    type="button"
                    title="Reset today's score test data"
                    className="btn-tactile bg-white hover:bg-red-50 text-red-700 border border-red-200 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-base">restart_alt</span>
                    <span>Reset Scores</span>
                  </button>
                </div>
              </div>

              {/* 10-Level Cognitive Progression Track & AI Baseline Overview */}
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-[#0d631b]">psychology</span>
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#032109]">
                        10-Level Cognitive Progression Track
                      </h2>
                      <p className="text-xs text-[#40493d]">
                        Strict 1-minute sessions (+50 pts). Levels unlock sequentially as {(patient?.name ? patient.name.split(' ')[0] : 'the elder')} completes cognitive challenges.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#d9fdd6] text-[#006e1c] border border-[#cdf2cb]">
                      Level {patient?.unlockedLevel || 1} of 10 Unlocked
                    </span>
                    {patient?.aiAnalysis && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">clinical_notes</span>
                        <span>AI Baseline: L{patient.aiAnalysis.recommendedLevel || patient.startingLevel || 1}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 10-Level Stepped Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-2">
                  {COGNITIVE_LEVELS.map((lvl) => {
                    const isUnlocked = lvl.level <= (patient?.unlockedLevel || 1);
                    const isAiStarting = patient?.aiAnalysis && lvl.level === (patient.aiAnalysis.recommendedLevel || patient.startingLevel || 1);

                    return (
                      <div
                        key={lvl.level}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col justify-between min-h-[95px] ${
                          isUnlocked
                            ? 'bg-[#ebffe7] border-[#006e1c] text-[#032109] shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${
                            isUnlocked ? 'bg-[#006e1c] text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            L{lvl.level}
                          </span>
                          <span className="material-symbols-outlined text-sm">
                            {isUnlocked ? 'check_circle' : 'lock'}
                          </span>
                        </div>

                        <div className="my-1">
                          <p className="text-[11px] font-bold leading-tight line-clamp-1">
                            {lvl.title}
                          </p>
                          <p className="text-[9px] opacity-75 line-clamp-1">
                            {lvl.category}
                          </p>
                        </div>

                        {isAiStarting ? (
                          <span className="text-[8px] font-extrabold uppercase bg-teal-600 text-white rounded py-0.5">
                            AI Start
                          </span>
                        ) : (
                          <span className={`text-[9px] font-semibold ${isUnlocked ? 'text-[#006e1c]' : 'text-gray-400'}`}>
                            {isUnlocked ? 'Available' : 'Locked'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* AI Assessment Report Summary Card */}
                {patient?.aiAnalysis && (
                  <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border-2 border-teal-300 shadow-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-teal-800">clinical_notes</span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-teal-950">
                          Saha AI Clinical Baseline Assessment
                        </h4>
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                        Mapped to Starting Level {patient.aiAnalysis.recommendedLevel || patient.startingLevel || 1}
                      </span>
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-white/80 p-2 rounded-xl border border-teal-200">
                        <span className="text-[10px] text-gray-500 font-bold block">Identified Condition:</span>
                        <span className="font-extrabold text-[#032109]">
                          {patient.aiAnalysis.identifiedCondition || 'Cognitive Evaluation Complete'}
                        </span>
                      </div>
                      <div className="sm:col-span-2 bg-white/80 p-2 rounded-xl border border-teal-200">
                        <span className="text-[10px] text-gray-500 font-bold block">Clinical Cognitive Summary:</span>
                        <span className="text-[#40493d] font-medium leading-relaxed">
                          {patient.aiAnalysis.cognitiveSummary || 'Patient cognitive baseline evaluated and synchronized.'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#cdf2cb] text-[#006e1c]">
                      {displayTodaySessions} Sessions
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#032109]">{displayTodayScore}</span>
                      <span className="text-sm font-bold text-[#0d631b]">Points</span>
                    </div>
                    <p className="text-xs text-[#40493d] mt-1">Earned in today&apos;s 1-minute memory sessions</p>
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
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      7-Day Total
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#032109]">{displayWeeklyScore}</span>
                      <span className="text-sm font-bold text-[#0d631b]">Points</span>
                    </div>
                    <p className="text-xs text-[#40493d] mt-1">Rolling 7-day cumulative points from Firestore</p>
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
                      {(displayTodaySessions > 0 || displayWeeklyScore > 0 || (gameAnalytics?.avgAccuracy || 0) > 0)
                        ? (gameAnalytics.stabilityRating || gameAnalytics.cognitiveStability || 'Steady Recall')
                        : 'Awaiting Game Today'}
                    </span>
                    <p className="text-xs text-[#40493d] mt-1">Pattern retention & stability</p>
                  </div>
                </div>

                {/* 4. Average Accuracy / Cognitive Score % */}
                <div className="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-2xl">query_stats</span>
                      </span>
                      <span className="text-xs font-bold text-[#40493d]">Cognitive Score %</span>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                      Live Sync
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#032109]">
                        {(displayTodaySessions > 0 || displayWeeklyScore > 0 || (gameAnalytics?.avgAccuracy || 0) > 0)
                          ? (gameAnalytics.averageAccuracy ?? gameAnalytics.avgAccuracy ?? 100)
                          : 0}%
                      </span>
                    </div>
                    <p className="text-xs text-[#40493d] mt-1">Completion precision (reduced on timeout)</p>
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
                      <span className="w-3 h-3 rounded-md bg-[#006e1c]"></span> High Score (200-250 pts)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-[#a3f69c]"></span> Moderate (50-150 pts)
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
                      const score = isToday ? displayTodayScore : (dayData.score || 0);
                      const heightPercent = score > 0 ? Math.max(16, Math.min(100, Math.round((score / 250) * 100))) : 8;
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
                                score >= 200
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
                        Detailed audit trail of each 1-minute session completed by {(patient?.name ? patient.name.split(' ')[0] : 'Patient')}.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0d631b] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                    {(gameAnalytics.sessions && Array.isArray(gameAnalytics.sessions) ? gameAnalytics.sessions.length : (gameAnalytics.recentScores ? gameAnalytics.recentScores.length : 0))} Total Sessions Logged
                  </span>
                </div>

                <div className="overflow-x-auto pt-2">
                  {(!gameAnalytics.sessions || gameAnalytics.sessions.length === 0) && (!gameAnalytics.recentScores || gameAnalytics.recentScores.length === 0) ? (
                    <div className="text-center py-10 px-4 bg-[#ebffe7]/40 rounded-2xl border border-dashed border-[#cdf2cb]">
                      <span className="material-symbols-outlined text-4xl text-[#0d631b] mb-2">sports_esports</span>
                      <h4 className="text-base font-bold text-[#032109]">No Game Sessions Recorded Yet</h4>
                      <p className="text-xs text-[#40493d] mt-1 max-w-sm mx-auto">
                        Scores and memory recall accuracy will appear here in real-time as {patient?.name ? patient.name.split(' ')[0] : 'the elder'} plays 1-minute memory games in their portal.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#cdf2cb] text-xs font-bold text-[#40493d]">
                          <th className="pb-3 px-3">Date & Time</th>
                          <th className="pb-3 px-3">Session</th>
                          <th className="pb-3 px-3 text-center">Level Played</th>
                          <th className="pb-3 px-3 text-center">Timer Remaining</th>
                          <th className="pb-3 px-3 text-center">Recall %</th>
                          <th className="pb-3 px-3 text-right">Points Earned</th>
                          <th className="pb-3 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ebffe7] text-sm font-medium text-[#032109]">
                        {(gameAnalytics.sessions && gameAnalytics.sessions.length > 0 ? gameAnalytics.sessions : (gameAnalytics.recentScores || [])).map((sess, sIdx) => {
                        const dateFormatted = sess.completedAt || sess.timestamp
                          ? new Date(sess.completedAt || sess.timestamp).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Today';
                        const isTimedOutSess = sess.status === 'timed_out' || Number(sess.pointsEarned) === 0 || sess.status === 'Timed Out';
                        const ptsEarned = sess.pointsEarned !== undefined ? Number(sess.pointsEarned) : (sess.score !== undefined ? Number(sess.score) : (isTimedOutSess ? 0 : 50));
                        const playedLevelNum = sess.level || 1;
                        const levelTitle = COGNITIVE_LEVELS.find(l => l.level === playedLevelNum)?.title || 'Memory Match';

                        return (
                          <tr key={sess.id || sIdx} className="hover:bg-[#ebffe7]/50 transition-colors">
                            <td className="py-3.5 px-3">
                              <span className="font-bold block text-[#032109]">{dateFormatted}</span>
                              <span className="text-[11px] text-[#40493d]">
                                {sess.remainingTimeSeconds !== undefined && sess.remainingTimeSeconds > 0
                                  ? `${sess.remainingTimeSeconds}s left on 60s clock`
                                  : (isTimedOutSess ? '60s time expired' : `${sess.durationSeconds || 30}s duration`)}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-bold text-[#0d631b] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base">extension</span>
                                <span>{`Session ${sess.sessionNumber || (sIdx + 1)}`}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-[#d9fdd6] text-[#006e1c] border border-[#cdf2cb]" title={levelTitle}>
                                <span className="material-symbols-outlined text-xs">psychology</span>
                                <span>L{playedLevelNum}: {levelTitle}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-xs">
                              {sess.remainingTimeSeconds !== undefined && sess.remainingTimeSeconds > 0
                                ? <span className="text-emerald-700 font-extrabold">{sess.remainingTimeSeconds}s</span>
                                : <span className="text-amber-700">0s (expired)</span>}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                                isTimedOutSess ? 'bg-amber-100 text-amber-900' : 'bg-[#cdf2cb] text-[#006e1c]'
                              }`}>
                                {sess.accuracy !== undefined ? sess.accuracy : (isTimedOutSess ? 0 : 100)}%
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <span className={`text-base font-extrabold ${ptsEarned > 0 ? 'text-[#0d631b]' : 'text-gray-400'}`}>
                                {ptsEarned > 0 ? `+${ptsEarned} Points` : '0 Points'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                                isTimedOutSess
                                  ? 'text-amber-800 bg-amber-50 border border-amber-200'
                                  : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                              }`}>
                                <span className="material-symbols-outlined text-sm">{isTimedOutSess ? 'schedule' : 'check_circle'}</span>
                                {isTimedOutSess ? 'Timed Out' : 'Completed (+50 pts)'}
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
                        {/* Interactive Status badge — synced across Elder and Caregiver portals */}
                        <button
                          type="button"
                          onClick={() => handleToggleMedStatus(med.id, med.title)}
                          title={med.taken ? "Click to mark as pending" : "Click to mark as completed"}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-90 active:scale-95 shadow-xs ${
                            med.taken
                              ? 'bg-[#d9fdd6] text-[#0c7521] border border-[#cdf2cb]'
                              : 'bg-amber-100 hover:bg-emerald-50 text-amber-900 hover:text-emerald-900 border border-amber-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {med.taken ? 'check_circle' : 'pending'}
                          </span>
                          <span>
                            {med.taken
                              ? `✓ Taken${med.takenAt ? ' (' + med.takenAt + ')' : ''}`
                              : 'Pending (Tap to Mark Done)'}
                          </span>
                        </button>

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
                            <div className="w-12 h-12 rounded-2xl bg-[#006e1c] text-white font-extrabold text-lg flex items-center justify-center border border-[#cdf2cb] shadow-xs shrink-0">
                              {c.name ? c.name.trim().charAt(0).toUpperCase() : 'C'}
                            </div>
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

          {/* 4. AI REPORT GENERATOR TAB (Combined Games Score & Routine Completion Downloadable PDF) */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              {/* Report Action Header */}
              <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d9fdd6] text-[#0d631b] text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-base">clinical_notes</span>
                    <span>AI Report Generator</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    Patient Cognitive & Routine Clinical Report
                  </h2>
                  <p className="text-xs sm:text-sm text-[#40493d] mt-1">
                    Combined daily intelligence correlating memory game metrics with routine compliance, formatted for doctors and families.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    type="button"
                    className="btn-tactile inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#ebffe7] text-[#0d631b] border border-[#cdf2cb] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-lg ${isGeneratingReport ? 'animate-spin' : ''}`}>
                      {isGeneratingReport ? 'autorenew' : 'refresh'}
                    </span>
                    <span>{isGeneratingReport ? 'Analyzing Data...' : 'Refresh AI Analysis'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPdfReport}
                    disabled={isDownloadingPdf}
                    type="button"
                    className="btn-tactile btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-xl">download</span>
                    <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
                  </button>
                </div>
              </div>

              {/* Printable PDF Canvas Container */}
              <div
                id="printable-patient-report"
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#cdf2cb] text-[#032109] space-y-8 max-w-4xl mx-auto"
              >
                {/* Clinical Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-[#0d631b] gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-[#006e1c] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                      S
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-[#032109] tracking-tight">SAHARA MEMORY CARE</h1>
                      <p className="text-xs font-bold text-[#0d631b] uppercase tracking-wider">
                        AI Report Generator · Cognitive & Routine Summary
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs text-[#40493d] space-y-0.5">
                    <p className="font-bold text-[#032109]">Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p>Report ID: SHR-{Math.abs((patient?.phone || '12345').split('').reduce((a,b)=>a+b.charCodeAt(0),0))}-AI</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#ebffe7] text-[#0d631b] font-bold text-[11px] border border-[#cdf2cb]">
                      Status: {aiReportData?.overallStatusBadge || 'Stable Recall'}
                    </span>
                  </div>
                </div>

                {/* Patient Profile Card Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#ebffe7]/60 border border-[#cdf2cb]">
                  <div>
                    <span className="text-[11px] font-bold text-[#40493d] uppercase block">Patient Name</span>
                    <p className="text-base font-extrabold text-[#032109] mt-0.5">{patient?.name || 'Elder Patient'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#40493d] uppercase block">Care Mode</span>
                    <p className="text-sm font-bold text-[#0d631b] mt-0.5">{patient?.status || 'Mild Cognitive Support'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#40493d] uppercase block">Residence</span>
                    <p className="text-sm font-semibold text-[#032109] mt-0.5">{patient?.city || 'Kolkata, India'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#40493d] uppercase block">Caregiver Contact</span>
                    <p className="text-sm font-semibold text-[#032109] mt-0.5 truncate">{caregiver?.name || caregiver?.email || 'Caregiver Linked'}</p>
                  </div>
                </div>

                {/* KPI Metrics Dashboard Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Game Score KPI */}
                  <div className="p-5 rounded-2xl bg-white border border-[#cdf2cb] shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#40493d]">
                      <span className="font-bold uppercase tracking-wider">Game Score</span>
                      <span className="material-symbols-outlined text-[#0d631b] text-base">extension</span>
                    </div>
                    <div className="text-3xl font-black text-[#032109]">{todayGameScore} <span className="text-xs font-semibold text-[#40493d]">pts</span></div>
                    <p className="text-xs text-[#0d631b] font-bold">
                      {todayGameSessions > 0 ? `${todayGameSessions} session(s) completed today` : '0 sessions played today'}
                    </p>
                  </div>

                  {/* Recall Stability */}
                  <div className="p-5 rounded-2xl bg-white border border-[#cdf2cb] shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#40493d]">
                      <span className="font-bold uppercase tracking-wider">Cognitive Stability</span>
                      <span className="material-symbols-outlined text-[#0d631b] text-base">psychology</span>
                    </div>
                    <div className="text-2xl font-black text-[#032109] truncate">
                      {gameAnalytics.stabilityRating || (todayGameSessions > 0 ? 'Steady Recall' : 'Awaiting Game')}
                    </div>
                    <p className="text-xs text-[#40493d]">
                      Avg accuracy: <span className="font-bold text-[#0d631b]">{gameAnalytics.averageAccuracy ?? gameAnalytics.avgAccuracy ?? 0}%</span>
                    </p>
                  </div>

                  {/* Routine Adherence */}
                  <div className="p-5 rounded-2xl bg-white border border-[#cdf2cb] shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#40493d]">
                      <span className="font-bold uppercase tracking-wider">Routine Adherence</span>
                      <span className="material-symbols-outlined text-[#0d631b] text-base">task_alt</span>
                    </div>
                    <div className="text-3xl font-black text-[#032109]">
                      {medicines.length > 0 
                        ? Math.round((medicines.filter(m => m.taken || m.completed).length / medicines.length) * 100) 
                        : 100}%
                    </div>
                    <p className="text-xs text-[#0d631b] font-bold">
                      {medicines.filter(m => m.taken || m.completed).length} of {medicines.length} completed
                    </p>
                  </div>
                </div>

                {/* AI Executive Clinical Summary */}
                <div className="p-6 rounded-2xl bg-[#f7fdf7] border-l-4 border-[#0d631b] border-t border-r border-b border-[#cdf2cb] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0d631b] text-xl">psychology_alt</span>
                    <h3 className="text-base font-extrabold text-[#032109]">AI Clinical Executive Summary</h3>
                  </div>
                  <p className="text-sm text-[#40493d] leading-relaxed">
                    {aiReportData?.executiveSummary || 
                      'The patient maintained steady adherence to scheduled daily rhythms and memory wellness exercises. Cognitive response parameters and recall accuracy show continuous domestic stability.'}
                  </p>
                </div>

                {/* Two-Column Deep Dive Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cognitive Domain Analysis */}
                  <div className="p-5 rounded-2xl bg-white border border-[#cdf2cb] shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#ebffe7]">
                      <span className="material-symbols-outlined text-[#0d631b] text-lg">memory</span>
                      <h4 className="text-sm font-extrabold text-[#032109]">Cognitive Memory Analysis</h4>
                    </div>
                    <p className="text-xs text-[#40493d] leading-relaxed">
                      {aiReportData?.cognitiveAssessment || 
                        'Memory match exercises confirm intact visual pattern recognition with calm execution pacing. Moves-to-pairs ratio reflects attentive focus without signs of frustration or confusion.'}
                    </p>
                    <div className="pt-2 text-[11px] text-[#40493d] space-y-1">
                      <div className="flex justify-between">
                        <span>Today Sessions:</span>
                        <span className="font-bold text-[#032109]">{todayGameSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Score:</span>
                        <span className="font-bold text-[#032109]">{todayGameScore} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Daily Average:</span>
                        <span className="font-bold text-[#032109]">{gameAnalytics.weeklyAvgDailyScore || 0} pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Routine & Medication Analysis */}
                  <div className="p-5 rounded-2xl bg-white border border-[#cdf2cb] shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#ebffe7]">
                      <span className="material-symbols-outlined text-[#0d631b] text-lg">medication</span>
                      <h4 className="text-sm font-extrabold text-[#032109]">Routine & Medication Adherence</h4>
                    </div>
                    <p className="text-xs text-[#40493d] leading-relaxed">
                      {aiReportData?.routineAssessment || 
                        'Pillbox and scheduled routine adherence remains robust. Prescribed morning and afternoon intervals were honored on schedule, reflecting calm compliance with family guidance.'}
                    </p>
                    <div className="pt-2 text-[11px] text-[#40493d] space-y-1">
                      <div className="flex justify-between">
                        <span>Completed Items:</span>
                        <span className="font-bold text-[#032109]">{medicines.filter(m => m.taken || m.completed).length} / {medicines.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Adherence Score:</span>
                        <span className="font-bold text-[#0d631b]">
                          {medicines.length > 0 
                            ? Math.round((medicines.filter(m => m.taken || m.completed).length / medicines.length) * 100) 
                            : 100}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Observations & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Observations */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#0d631b] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">visibility</span>
                      Key Clinical Observations
                    </h4>
                    <ul className="space-y-2 text-xs text-[#40493d]">
                      {(aiReportData?.keyObservations || [
                        `Medication schedule has ${medicines.filter(m => m.taken || m.completed).length} of ${medicines.length} routines marked taken.`,
                        `Visual memory game recorded ${todayGameScore} pts across ${todayGameSessions} session(s).`,
                        `Live caregiver device sync maintains steady telemetry without alert dropoffs.`
                      ]).map((obs, i) => (
                        <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#ebffe7]/40 border border-[#cdf2cb]">
                          <span className="material-symbols-outlined text-xs text-[#0d631b] mt-0.5">check</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#0d631b] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">lightbulb</span>
                      Caregiver Next Actions
                    </h4>
                    <ul className="space-y-2 text-xs text-[#40493d]">
                      {(aiReportData?.recommendations || [
                        'Continue morning warm hydration reminder alongside Donepezil regimen.',
                        'Encourage a gentle 5-minute memory match play session in late afternoon.',
                        'Maintain active WhatsApp touchpoints with linked loved ones.'
                      ]).map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#d9fdd6]/40 border border-[#cdf2cb]">
                          <span className="material-symbols-outlined text-xs text-[#0d631b] mt-0.5">arrow_forward</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="pt-6 border-t border-[#cdf2cb] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#40493d] gap-2">
                  <p>Generated by Sahara AI Report Generator · Confidential Medical & Caregiver Record</p>
                  <p>© {new Date().getFullYear()} Sahara Memory Care. All rights reserved.</p>
                </div>
              </div>
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
