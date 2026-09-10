'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import { authService } from '../../services/authService.js';
import { dataStore } from '../../services/dataStore.js';
import { useTranslation } from '../../utils/i18n.js';
import { speakText } from '../../utils/speech.js';
import { showToast } from '../../components/Toast.jsx';
import { db, normalizeElderId, getTodayDateString } from '../../lib/firebaseClient.js';
import { doc, onSnapshot, setDoc, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';

function resolveElderAndCaregiver() {
  let elderId = null;
  let caregiverEmail = null;
  let caregiverName = null;

  try {
    const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_active_user') || 'null') : null;
    if (stored?.role === 'elder') {
      elderId = stored.phone || stored.id || stored.email;
      caregiverEmail = stored.caregiverEmail || stored.caregiver || null;
      caregiverName = stored.caregiverName || null;
    } else if (stored?.role === 'caregiver') {
      elderId = stored.linkedElder?.phone || stored.linkedElder?.id || stored.linkedElder?.email;
      caregiverEmail = stored.email || null;
      caregiverName = stored.name || null;
    }
  } catch (e) {}

  if (!elderId) {
    try {
      const storedPatient = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_patient_profile') || 'null') : null;
      if (storedPatient) {
        elderId = storedPatient.phone || storedPatient.id || storedPatient.email;
        caregiverEmail = caregiverEmail || storedPatient.caregiverEmail || storedPatient.caregiver;
        caregiverName = caregiverName || storedPatient.caregiverName;
      }
    } catch (e) {}
  }

  if (!elderId) {
    const u = authService?.getCurrentUser ? authService.getCurrentUser() : null;
    if (u?.role === 'elder') {
      elderId = u.phone || u.id || u.email;
      caregiverEmail = u.caregiverEmail || u.caregiver || caregiverEmail;
      caregiverName = u.caregiverName || caregiverName;
    } else if (u?.role === 'caregiver') {
      elderId = u.linkedElder?.phone || u.linkedElder?.id || u.linkedElder?.email;
      caregiverEmail = u.email || caregiverEmail;
      caregiverName = u.name || caregiverName;
    }
  }

  if (!elderId) {
    const p = dataStore.getPatient ? dataStore.getPatient() : dataStore.state?.patient;
    elderId = p?.phone || p?.id || p?.email;
    caregiverEmail = caregiverEmail || p?.caregiverEmail || p?.caregiver;
    caregiverName = caregiverName || p?.caregiverName;
  }
  if (!caregiverEmail) {
    const cg = dataStore.getCaregiver ? dataStore.getCaregiver() : dataStore.state?.caregiver;
    caregiverEmail = cg?.email || dataStore.state?.patient?.caregiverEmail || null;
    caregiverName = caregiverName || cg?.name || null;
  }

  return {
    elderId: elderId || '+919854012345',
    caregiverEmail: caregiverEmail || 'prayasdey10@gmail.com',
    caregiverName: caregiverName || 'Primary Caregiver',
    cleanElderId: normalizeElderId(elderId || '+919854012345'),
  };
}

export default function MemoryMatchGamePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const FULL_ITEMS_POOL = [
    { pairId: 'apple', title: 'Fresh Apple 🍎', subtitle: 'Sweet Red Fruit', img: '/game-items/apple.jpeg', icon: 'nutrition' },
    { pairId: 'balloon', title: 'Colorful Balloon 🎈', subtitle: 'Floating Joy', img: '/game-items/balloon.jpeg', icon: 'celebration' },
    { pairId: 'car', title: 'Classic Car 🚗', subtitle: 'Smooth Drive', img: '/game-items/car.jpeg', icon: 'directions_car' },
    { pairId: 'cat', title: 'Gentle Cat 🐱', subtitle: 'Soft Warm Nap', img: '/game-items/Cat.webp', icon: 'pets' },
    { pairId: 'heart', title: 'Caring Heart ❤️', subtitle: 'Love & Warmth', img: '/game-items/heart.jpeg', icon: 'favorite' },
    { pairId: 'horse', title: 'Noble Horse 🐴', subtitle: 'Gentle Companion', img: '/game-items/horse.jpeg', icon: 'cruelty_free' },
    { pairId: 'key', title: 'Golden Key 🔑', subtitle: 'Safe & Secure', img: '/game-items/key.jpeg', icon: 'key' },
    { pairId: 'kite', title: 'Flying Kite 🪁', subtitle: 'High Blue Skies', img: '/game-items/kite.jpeg', icon: 'toys' },
    { pairId: 'spade', title: 'Garden Spade ♠️', subtitle: 'Rich Blossom Soil', img: '/game-items/spade.jpeg', icon: 'handyman' },
    { pairId: 'tree', title: 'Green Tree 🌳', subtitle: 'Peaceful Shade', img: '/game-items/tree.jpeg', icon: 'park' },
    { pairId: 'umbrella', title: 'Bright Umbrella ☂️', subtitle: 'Gentle Rain Shelter', img: '/game-items/umbrella.jpeg', icon: 'umbrella' },
  ];

  // Randomly pick 3 distinct items from pool and duplicate into 6 cards, then shuffle
  const generateRandomRoundCards = () => {
    const poolCopy = [...FULL_ITEMS_POOL].sort(() => Math.random() - 0.5);
    const chosen3 = poolCopy.slice(0, 3);
    const pairs = [
      { ...chosen3[0] },
      { ...chosen3[0] },
      { ...chosen3[1] },
      { ...chosen3[1] },
      { ...chosen3[2] },
      { ...chosen3[2] },
    ];
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    return shuffled.map((c, i) => ({
      id: i,
      ...c,
      matched: false,
      flipped: false,
    }));
  };

  const [cards, setCards] = useState(() => generateRandomRoundCards());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Real-time Firestore Synced Session State
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayScore, setTodayScore] = useState(0);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // 1-Minute Active Countdown Timer State
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState(0);

  const isRecordingRef = useRef(false);
  const timerRef = useRef(null);

  // 1. Listen to Today's Firestore Log for Elder's Account
  useEffect(() => {
    const { cleanElderId } = resolveElderAndCaregiver();
    const todayDate = getTodayDateString();

    if (!db || !cleanElderId) {
      setIsLoadingSession(false);
      return;
    }

    const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
    const unsub = onSnapshot(dailyLogRef, (snap) => {
      setIsLoadingSession(false);
      if (snap.exists()) {
        const data = snap.data() || {};
        const sess = typeof data.todaySessions === 'number'
          ? data.todaySessions
          : (typeof data.completedSessions === 'number'
              ? data.completedSessions
              : (Array.isArray(data.sessionsHistory)
                  ? data.sessionsHistory.filter(s => Number(s.pointsEarned) > 0).length
                  : 0));
        const score = typeof data.todayScore === 'number'
          ? data.todayScore
          : (typeof data.totalScore === 'number' ? data.totalScore : sess * 50);

        setTodaySessions(sess);
        setTodayScore(score);
      } else {
        setTodaySessions(0);
        setTodayScore(0);
      }
    }, (err) => {
      console.warn('[MemoryGame] DailyLog snapshot notice:', err);
      setIsLoadingSession(false);
    });

    return () => unsub();
  }, []);

  // 2. 60-Second Countdown Timer Mechanism
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0 && !roundCompleted && !isTimedOut) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, timeLeft, roundCompleted, isTimedOut]);

  // Handle 60s Timer Expiry Gracefully
  const handleTimeUp = () => {
    if (roundCompleted || isTimedOut) return;
    setIsTimerRunning(false);
    setIsTimedOut(true);

    const matchedPairsCount = Math.floor(cards.filter(c => c.matched).length / 2);
    const accuracy = Math.round((matchedPairsCount / 3) * 100);

    speakText("Time's up! Round ended. Take a gentle breath.");
    showToast("⏰ Time's up! No points awarded for incomplete round.", "info", 5000);

    const { cleanElderId, elderId, caregiverEmail } = resolveElderAndCaregiver();
    const todayDate = getTodayDateString();

    // Persist incomplete / timed out session to Firestore (0 points, reduces cognitive score percentage)
    if (db && cleanElderId) {
      const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
      const sessionEntry = {
        sessionNumber: Math.min(5, todaySessions + 1),
        pointsEarned: 0,
        completedAt: new Date().toISOString(),
        remainingTimeSeconds: 0,
        status: 'timed_out',
        accuracy,
      };

      setDoc(dailyLogRef, {
        lastPlayedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sessionsHistory: arrayUnion(sessionEntry),
        gamesHistory: arrayUnion(sessionEntry),
      }, { merge: true }).catch(err => {
        console.warn('[MemoryGame] Timeout Firestore record notice:', err);
      });
    }

    // Update local dataStore
    dataStore.recordGameScore?.({
      score: 0,
      moves,
      matchedPairs: matchedPairsCount,
      accuracy,
      durationSeconds: 60,
      date: todayDate,
      elderId,
      caregiverEmail,
      status: 'Timed Out',
      skipServerPersist: true,
    });
  };

  const startRoundTimer = () => {
    if (!isTimerRunning && !roundCompleted && !isTimedOut && todaySessions < 5) {
      setIsTimerRunning(true);
    }
  };

  const handleCardClick = (idx) => {
    // Prevent interaction if daily cap reached, timed out, or round finished
    if (todaySessions >= 5 || isTimedOut || roundCompleted) return;

    const card = cards[idx];
    if (card.matched || card.flipped || flippedIndices.length >= 2) return;

    // Start 60-second timer on first card interaction
    if (!isTimerRunning && timeLeft === 60) {
      setIsTimerRunning(true);
    }

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);
    showToast(`Tapped: ${card.title}`, 'info', 1200);
    speakText(card.title);

    if (newFlipped.length === 2) {
      const updatedMoves = moves + 1;
      setMoves(updatedMoves);
      const first = newCards[newFlipped[0]];
      const second = newCards[newFlipped[1]];

      if (first.pairId === second.pairId) {
        first.matched = true;
        second.matched = true;
        setCards([...newCards]);
        setFlippedIndices([]);

        // Check if all 3 pairs are matched within the 60s
        const allMatched = newCards.every((c) => c.matched);
        if (allMatched) {
          if (isRecordingRef.current) return;
          isRecordingRef.current = true;
          setIsTimerRunning(false);

          const finalRemaining = timeLeft;
          setRemainingTimeSeconds(finalRemaining);
          setRoundCompleted(true);

          const nextSessionNum = Math.min(5, todaySessions + 1);
          const nextScore = Math.min(250, todayScore + 50);

          setTodaySessions(nextSessionNum);
          setTodayScore(nextScore);

          const { elderId, caregiverEmail, cleanElderId } = resolveElderAndCaregiver();
          const todayDate = getTodayDateString();
          const isoDate = new Date().toISOString().split('T')[0];

          // 1. Atomic Real-time Firestore Mutation
          if (db && cleanElderId) {
            const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
            const elderRef = doc(db, 'elders', cleanElderId);

            const sessionEntry = {
              sessionNumber: nextSessionNum,
              pointsEarned: 50,
              completedAt: new Date().toISOString(),
              remainingTimeSeconds: finalRemaining,
              status: 'completed',
              accuracy: 100,
            };

            const gamePayload = {
              todaySessions: increment(1),
              todayScore: increment(50),
              completedSessions: increment(1),
              totalScore: increment(50),
              gameSessions: increment(1),
              gameScore: increment(50),
              lastGameScore: 50,
              lastPlayedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              sessionsHistory: arrayUnion(sessionEntry),
              gamesHistory: arrayUnion(sessionEntry),
            };

            setDoc(dailyLogRef, gamePayload, { merge: true }).catch(err => {
              console.warn('[MemoryGame] Firestore setDoc error:', err);
            });

            if (isoDate !== todayDate) {
              const isoDailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', isoDate);
              setDoc(isoDailyLogRef, gamePayload, { merge: true }).catch(() => {});
            }

            setDoc(elderRef, {
              id: cleanElderId,
              todayGameScore: increment(50),
              todayGameSessions: increment(1),
              lastGameScore: 50,
              lastGameAt: new Date().toISOString(),
              lastActive: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true }).catch(() => {});
          }

          // 2. Update local state & DataStore (+50 points fixed)
          dataStore.incrementGamesCount?.();
          dataStore.recordGameScore?.({
            score: 50,
            moves: updatedMoves,
            matchedPairs: 3,
            accuracy: 100,
            durationSeconds: 60 - finalRemaining,
            date: todayDate,
            elderId,
            caregiverEmail,
            status: 'Completed (+50 pts)',
            skipServerPersist: true,
          });

          // 3. Direct server DB persistence
          fetch('/api/game-scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              elderId,
              caregiverEmail,
              score: 50,
              pointsEarned: 50,
              sessionNumber: nextSessionNum,
              moves: updatedMoves,
              matchedPairs: 3,
              accuracy: 100,
              durationSeconds: 60 - finalRemaining,
              remainingTimeSeconds: finalRemaining,
              status: 'Completed (+50 pts)',
              date: todayDate,
            }),
          }).catch(() => {});

          // 4. Dispatch event across windows
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sahara:game-score-change', {
              detail: {
                score: {
                  score: 50,
                  moves: updatedMoves,
                  matchedPairs: 3,
                  accuracy: 100,
                  durationSeconds: 60 - finalRemaining,
                  date: todayDate,
                  timestamp: new Date().toISOString(),
                },
                elderId,
                caregiverEmail,
              }
            }));
          }

          showToast(`🌟 Round Complete! +50 Points Earned! (Session ${nextSessionNum}/5)`, 'success', 5000);
          speakText(`Round Complete! You earned 50 points!`);
        } else {
          showToast(`🎉 Wonderful! You matched ${first.title}!`, 'success', 2500);
          speakText(`Wonderful! You matched ${first.title}!`);
        }
      } else {
        setTimeout(() => {
          first.flipped = false;
          second.flipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  const handleStartNextSession = () => {
    if (todaySessions >= 5) {
      showToast('Daily limit reached (5/5 sessions completed today). Rest well!', 'info', 4000);
      return;
    }
    isRecordingRef.current = false;
    const shuffled = generateRandomRoundCards();
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setRoundCompleted(false);
    setIsTimedOut(false);
    setTimeLeft(60);
    setIsTimerRunning(true);
    showToast(`⏱️ 1-Minute Round Started! Session ${todaySessions + 1} of 5. Have fun!`, 'info', 3000);
  };

  const handleRetryRound = () => {
    if (todaySessions >= 5) {
      showToast('Daily limit reached (5/5 sessions completed today). Rest well!', 'info', 4000);
      return;
    }
    isRecordingRef.current = false;
    const shuffled = generateRandomRoundCards();
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setRoundCompleted(false);
    setIsTimedOut(false);
    setTimeLeft(60);
    setIsTimerRunning(true);
    showToast(`⏱️ New 60-second round started! Find the pairs.`, 'info', 3000);
  };

  const isDailyCapReached = todaySessions >= 5;

  return (
    <div className="min-h-screen bg-[#ebffe7] text-[#032109]">
      <Navbar activeView="elder" />

      <main className="w-full pt-24 pb-28">
        <div className="max-w-[48rem] mx-auto w-full px-4 sm:px-6 flex flex-col gap-6">

          {/* Top Bar with Navigation & Live Timer / Session Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-[#cdf2cb]">
            <button
              onClick={() => router.push('/elder-dashboard')}
              className="inline-flex items-center gap-2 font-bold text-sm sm:text-base text-[#0d631b] hover:text-[#032109] transition-colors py-1.5 px-2 rounded-lg cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-2xl font-bold">arrow_back</span>
              <span>{t.backToHome || 'Back to Home'}</span>
            </button>

            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              {/* Daily Session Indicator Pill */}
              <div className="flex items-center gap-1.5 bg-[#ebffe7] px-3.5 py-1.5 rounded-full border border-[#cdf2cb]">
                <span className="material-symbols-outlined text-[#0d631b] text-base">today</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#032109]">
                  {isDailyCapReached ? '5 / 5 Sessions (Done)' : `Session ${todaySessions + 1} of 5`}
                </span>
              </div>

              {/* Today's Score Pill */}
              <div className="flex items-center gap-1 bg-[#d9fdd6] px-3.5 py-1.5 rounded-full border border-[#cdf2cb]">
                <span className="material-symbols-outlined text-[#006e1c] text-base">stars</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#006e1c]">
                  {todayScore} / 250 pts
                </span>
              </div>
            </div>
          </div>

          {/* 1-Minute Active Countdown Timer Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#cdf2cb] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-colors ${
                timeLeft <= 10
                  ? 'bg-red-600 text-white animate-pulse'
                  : timeLeft <= 20
                  ? 'bg-amber-500 text-white'
                  : isTimerRunning
                  ? 'bg-[#0d631b] text-white'
                  : 'bg-[#d9fdd6] text-[#0d631b]'
              }`}>
                <span className="material-symbols-outlined text-2xl">
                  {timeLeft <= 10 ? 'alarm' : 'timer'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0d631b]">
                    1-Minute Session Timer
                  </span>
                  {isTimerRunning && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span> Active
                    </span>
                  )}
                </div>
                <p className="text-lg sm:text-xl font-black text-[#032109] tracking-tight">
                  {`0:${timeLeft < 10 ? '0' : ''}${timeLeft}`}
                  <span className="text-xs text-[#40493d] font-bold ml-1.5">seconds remaining</span>
                </p>
              </div>
            </div>

            {/* Timer Progress Track */}
            <div className="w-full sm:w-48 flex flex-col gap-1">
              <div className="w-full bg-[#ebffe7] h-3 rounded-full overflow-hidden border border-[#cdf2cb]">
                <div
                  style={{ width: `${Math.round((timeLeft / 60) * 100)}%` }}
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-[#0d631b]'
                  }`}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-[#40493d]">
                <span>0s</span>
                <span>Fixed 50 pts on win</span>
                <span>60s</span>
              </div>
            </div>
          </div>

          {/* Daily Cap Banner (When 5/5 sessions reached) */}
          {isDailyCapReached && (
            <div className="card-tactile bg-gradient-to-r from-[#d9fdd6] to-[#ebffe7] rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#0d631b] text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#0d631b] text-white flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-3xl">celebration</span>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#cdf2cb] text-[#006e1c] text-xs font-black uppercase tracking-wider">
                Daily Goal Achieved (5/5 Sessions)
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#032109]">
                Daily limit reached (5/5 sessions completed today). Rest well!
              </h2>
              <p className="text-sm text-[#40493d] max-w-md mx-auto">
                You scored a maximum of <strong>{todayScore} Points</strong> today! Gentle mental exercises are complete for today.
              </p>
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => router.push('/elder-dashboard')}
                  type="button"
                  className="btn-tactile btn-primary px-8 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">home</span>
                  <span>Back to Elder Home</span>
                </button>
              </div>
            </div>
          )}

          {/* Graceful Time's Up Banner (When 60s expires) */}
          {isTimedOut && !roundCompleted && (
            <div className="card-tactile bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-300 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-3xl">hourglass_bottom</span>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                60-Second Timer Ended
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#032109]">
                Time&apos;s up!
              </h2>
              <p className="text-sm text-[#40493d] max-w-md mx-auto">
                Take a gentle breath and relax. No points are awarded for incomplete rounds. You can start a fresh session whenever you feel ready!
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                {!isDailyCapReached && (
                  <button
                    onClick={handleRetryRound}
                    type="button"
                    className="btn-tactile btn-primary px-6 py-3 rounded-full text-sm font-bold shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xl">replay</span>
                    <span>Try Again (1-Minute Timer)</span>
                  </button>
                )}
                <button
                  onClick={() => router.push('/elder-dashboard')}
                  type="button"
                  className="btn-tactile bg-white hover:bg-gray-50 text-[#40493d] border border-gray-300 px-6 py-3 rounded-full text-sm font-bold shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">home</span>
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          )}

          {/* Title & Dignified Instructions */}
          {!isDailyCapReached && !isTimedOut && (
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="inline-flex items-center gap-2 bg-[#cdf2cb] text-[#0d631b] px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm">
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Session {todaySessions + 1} of 5 · Match all 3 pairs in 60s for 50 Points</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109] tracking-tight">
                {t.memoryMatchTitle || 'Memory Match'}
              </h1>
              <p className="text-xs sm:text-sm text-[#40493d] max-w-xl">
                Tap any card to reveal its image and start the 60-second countdown. Match all 3 pairs to earn +50 points!
              </p>
            </div>
          )}

          {/* 6 Tactile Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {cards.map((card, idx) => {
              const isCardClickable = !isDailyCapReached && !isTimedOut && !roundCompleted && !card.matched && !card.flipped;
              return (
                <div
                  key={idx}
                  onClick={() => isCardClickable && handleCardClick(idx)}
                  className={`select-none transition-transform ${
                    isCardClickable ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default opacity-90'
                  }`}
                >
                  {card.flipped || card.matched ? (
                    <div className="card-tactile relative flex flex-col items-center justify-between p-4 bg-white rounded-3xl shadow-[0_6px_0_#2e7d32] border border-[#cdf2cb] min-h-[200px] sm:min-h-[240px]">
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs bg-[#a3f69c] text-[#002204] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          {t.matchedPill || 'Matched'}
                        </span>
                        <span className="material-symbols-outlined text-[#0d631b] text-xl">favorite</span>
                      </div>
                      <div className="w-24 h-24 sm:w-28 sm:h-28 my-auto flex items-center justify-center rounded-2xl bg-[#d9fdd6] overflow-hidden shadow-inner p-1 border border-[#cdf2cb]">
                        <img className="w-full h-full object-cover rounded-xl" src={card.img} alt={card.title} />
                      </div>
                      <div className="w-full text-center">
                        <p className="text-base sm:text-lg font-extrabold text-[#0d631b]">{card.title}</p>
                        <p className="text-xs text-[#40493d]">{card.subtitle}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="card-tactile relative flex flex-col items-center justify-center p-4 bg-[#cdf2cb] hover:bg-[#d3f8d0] rounded-3xl shadow-[0_6px_0_#1b6d24] border border-[#bfcaba] min-h-[200px] sm:min-h-[240px] group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 flex flex-col items-center justify-center text-[#0d631b] shadow-sm group-hover:scale-105 transition-transform border border-[#d9fdd6]">
                        <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#0d631b]">touch_app</span>
                        <span className="text-[11px] font-bold text-[#40493d] mt-1">{t.tapToOpen || 'Tap to Open'}</span>
                      </div>
                      <span className="mt-3 text-xs sm:text-sm font-bold text-[#032109]">Card {idx + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Victory Card (When Completed in Time) */}
          {roundCompleted && (
            <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#0d631b] text-center space-y-4 animate-celebrate">
              <div className="w-16 h-16 rounded-2xl bg-[#0d631b] text-white flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-3xl">celebration</span>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d9fdd6] text-[#006e1c] text-sm sm:text-base font-extrabold border border-[#cdf2cb] shadow-sm">
                <span className="material-symbols-outlined text-xl">stars</span>
                <span>🌟 Session Complete! +50 Points Awarded!</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-[#032109]">
                  Today&apos;s Score: <span className="text-[#0d631b]">{todayScore} Points</span>
                </p>
                <p className="text-xs sm:text-sm text-[#40493d]">
                  Finished with <strong>{remainingTimeSeconds}s</strong> remaining on the clock! (Session {todaySessions} of 5 completed)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {todaySessions < 5 ? (
                  <button
                    onClick={handleStartNextSession}
                    type="button"
                    className="btn-tactile btn-primary flex items-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                    <span>Play Session {todaySessions + 1} of 5 →</span>
                  </button>
                ) : (
                  <div className="text-center w-full space-y-2">
                    <p className="text-sm font-extrabold text-[#0d631b]">
                      Daily limit reached (5/5 sessions completed today). Rest well!
                    </p>
                    <button
                      onClick={() => router.push('/elder-dashboard')}
                      type="button"
                      className="btn-tactile btn-primary px-8 py-3 rounded-full text-sm font-bold shadow-md cursor-pointer"
                    >
                      Back to Elder Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Start / Instructions when timer has not started yet */}
          {!isTimerRunning && !roundCompleted && !isTimedOut && !isDailyCapReached && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button
                onClick={handleStartNextSession}
                type="button"
                className="btn-tactile btn-primary flex items-center gap-2 px-8 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">timer</span>
                <span>Start 1-Minute Round (Session {todaySessions + 1} of 5)</span>
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
