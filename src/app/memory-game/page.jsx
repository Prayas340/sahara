'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import { authService } from '../../services/authService.js';
import { dataStore } from '../../services/dataStore.js';
import { useTranslation } from '../../utils/i18n.js';
import { speakText } from '../../utils/speech.js';
import { getVoiceGuidance } from '../../utils/voiceGuidance.js';
import { showToast } from '../../components/Toast.jsx';
import { db, normalizeElderId, getTodayDateString } from '../../lib/firebaseClient.js';
import { doc, onSnapshot, setDoc, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';
import {
  COGNITIVE_LEVELS,
  LEVEL_1_CARDS_POOL,
  LEVEL_2_WORD_SEARCH_POOLS,
  LEVEL_3_CROSSWORD_POOLS,
  LEVEL_4_ANAGRAMS_POOL,
  LEVEL_5_WORD_WHEELS_POOL,
  LEVEL_6_PROVERBS_POOL,
  LEVEL_7_RHYMES_POOL,
  LEVEL_8_CATEGORIES_POOL,
  LEVEL_9_HANGMAN_POOL,
  LEVEL_10_CHALLENGES_POOL,
} from '../../data/gamesData.js';

function resolveElderAndCaregiver() {
  let elderId = null;
  let caregiverEmail = null;
  let caregiverName = null;
  let startingLevel = 1;
  let unlockedLevel = 1;
  let aiAnalysis = null;
  let elderName = 'Elder';

  try {
    const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_active_user') || 'null') : null;
    if (stored?.role === 'elder' || (!stored?.role && (stored?.phone || stored?.name || stored?.id))) {
      elderId = stored.phone || stored.id || stored.email || stored.identifier;
      caregiverEmail = stored.caregiverEmail || stored.caregiver || null;
      caregiverName = stored.caregiverName || null;
      elderName = stored.name || elderName;
      if (stored.unlockedLevel) unlockedLevel = Number(stored.unlockedLevel);
      if (stored.startingLevel) startingLevel = Number(stored.startingLevel);
      if (stored.aiAnalysis) aiAnalysis = stored.aiAnalysis;
    } else if (stored?.role === 'caregiver') {
      elderId = stored.linkedElder?.phone || stored.linkedElder?.id || stored.linkedElder?.email;
      caregiverEmail = stored.email || null;
      caregiverName = stored.name || null;
      elderName = stored.linkedElder?.name || elderName;
      if (stored.linkedElder?.unlockedLevel) unlockedLevel = Number(stored.linkedElder.unlockedLevel);
      if (stored.linkedElder?.startingLevel) startingLevel = Number(stored.linkedElder.startingLevel);
      if (stored.linkedElder?.aiAnalysis) aiAnalysis = stored.linkedElder.aiAnalysis;
    }
  } catch (e) {}

  if (!elderId) {
    try {
      const storedPatient = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_patient_profile') || 'null') : null;
      if (storedPatient) {
        elderId = storedPatient.phone || storedPatient.id || storedPatient.email || storedPatient.identifier;
        caregiverEmail = caregiverEmail || storedPatient.caregiverEmail || storedPatient.caregiver;
        caregiverName = caregiverName || storedPatient.caregiverName;
        elderName = storedPatient.name || elderName;
        if (storedPatient.unlockedLevel) unlockedLevel = Number(storedPatient.unlockedLevel);
        if (storedPatient.startingLevel) startingLevel = Number(storedPatient.startingLevel);
        if (storedPatient.aiAnalysis) aiAnalysis = storedPatient.aiAnalysis;
      }
    } catch (e) {}
  }

  if (!elderId) {
    const p = dataStore.getPatient ? dataStore.getPatient() : dataStore.state?.patient;
    elderId = p?.phone || p?.id || p?.email || p?.identifier;
    caregiverEmail = caregiverEmail || p?.caregiverEmail || p?.caregiver;
    caregiverName = caregiverName || p?.caregiverName;
    elderName = p?.name || elderName;
    if (p?.unlockedLevel) unlockedLevel = Number(p.unlockedLevel);
    if (p?.startingLevel) startingLevel = Number(p.startingLevel);
    if (p?.aiAnalysis) aiAnalysis = p.aiAnalysis;
  }

  return {
    elderId: elderId || '+919854012345',
    caregiverEmail: caregiverEmail || 'riya@sahara.care',
    caregiverName: caregiverName || 'Primary Caregiver',
    cleanElderId: normalizeElderId(elderId || '+919854012345'),
    elderName,
    startingLevel: Math.max(1, Math.min(10, startingLevel)),
    unlockedLevel: Math.max(1, Math.min(10, unlockedLevel)),
    aiAnalysis,
  };
}

// Utility: pick N distinct random items from an array
function sampleRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function ProgressiveCognitiveSuitePage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Navigation & Level State
  const [viewMode, setViewMode] = useState('hub'); // 'hub' | 'game'
  const [activeLevel, setActiveLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [startingLevel, setStartingLevel] = useState(1);
  const [levelJustUnlocked, setLevelJustUnlocked] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [elderName, setElderName] = useState('Elder');

  // Daily Sessions State (5 sessions per day cap)
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayScore, setTodayScore] = useState(0);
  const [lastPlayedLevel, setLastPlayedLevel] = useState(1);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Active Game State
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);

  // 1-Minute Active Countdown Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const isRecordingRef = useRef(false);
  const timerRef = useRef(null);

  // -------------------------------------------------------------
  // DYNAMIC LEVEL SPECIFIC GAMEPLAY DATA & STATES (50 Variations)
  // -------------------------------------------------------------

  // Level 1: Memory Match (Sample 3 pairs from 50-card pool)
  const generateLevel1Cards = () => {
    const chosen = sampleRandom(LEVEL_1_CARDS_POOL, 3);
    const pairs = [...chosen, ...chosen].sort(() => Math.random() - 0.5);
    return pairs.map((c, i) => ({ id: i, ...c, matched: false, flipped: false }));
  };
  const [cards, setCards] = useState(() => generateLevel1Cards());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);

  // Level 2: Word Search (50 Random Grid Pools)
  const [activeWordSearchL2, setActiveWordSearchL2] = useState(() => LEVEL_2_WORD_SEARCH_POOLS[0]);
  const [foundWordsL2, setFoundWordsL2] = useState([]);
  const [selectedCellsL2, setSelectedCellsL2] = useState([]);
  const [isDraggingL2, setIsDraggingL2] = useState(false);
  const [dragStartCellL2, setDragStartCellL2] = useState(null);

  // Level 3: Quick Crossword (50 Random Clue Pools)
  const [activeCrosswordL3, setActiveCrosswordL3] = useState(() => LEVEL_3_CROSSWORD_POOLS[0]);
  const [crosswordAnswers, setCrosswordAnswers] = useState({});

  // Level 4: Anagrams / Unscramble (50 Words Pool, 3 per round)
  const [activeAnagramsL4, setActiveAnagramsL4] = useState(() => LEVEL_4_ANAGRAMS_POOL.slice(0, 3));
  const [currentAnagramIdx, setCurrentAnagramIdx] = useState(0);
  const [assembledLetters, setAssembledLetters] = useState([]);
  const [solvedAnagrams, setSolvedAnagrams] = useState([]);

  // Level 5: Word Wheel (50 Word Wheel Pools)
  const [activeWheelL5, setActiveWheelL5] = useState(() => LEVEL_5_WORD_WHEELS_POOL[0]);
  const [wheelWordsFound, setWheelWordsFound] = useState([]);
  const [currentWheelWord, setCurrentWheelWord] = useState('');

  // Level 6: Fill-in-the-Blank Proverbs (50 Proverbs Pool, 3 per round)
  const [activeProverbsL6, setActiveProverbsL6] = useState(() => LEVEL_6_PROVERBS_POOL.slice(0, 3));
  const [currentProverbIdx, setCurrentProverbIdx] = useState(0);
  const [solvedProverbs, setSolvedProverbs] = useState([]);

  // Level 7: Rhyming Games (50 Rhymes Pool, 3 per round)
  const [activeRhymesL7, setActiveRhymesL7] = useState(() => LEVEL_7_RHYMES_POOL.slice(0, 3));
  const [currentRhymeIdx, setCurrentRhymeIdx] = useState(0);
  const [solvedRhymes, setSolvedRhymes] = useState([]);

  // Level 8: Category Sorting (50 Category Pools)
  const [activeCategoryL8, setActiveCategoryL8] = useState(() => LEVEL_8_CATEGORIES_POOL[0]);
  const [categorizedItems, setCategorizedItems] = useState({});

  // Level 9: Hangman Vocabulary (50 Mystery Words Pool)
  const [activeHangmanL9, setActiveHangmanL9] = useState(() => LEVEL_9_HANGMAN_POOL[0]);
  const [hangmanGuessed, setHangmanGuessed] = useState([]);
  const [hangmanAttemptsLeft, setHangmanAttemptsLeft] = useState(7);

  // Level 10: Mixed Cognitive Master (50 Challenges Pool, 3 per round)
  const [activeChallengesL10, setActiveChallengesL10] = useState(() => LEVEL_10_CHALLENGES_POOL.slice(0, 3));
  const [challengeStep, setChallengeStep] = useState(0);
  const [challengeAnswers, setChallengeAnswers] = useState([]);

  // -------------------------------------------------------------
  // 1. Synchronize Initial User and Real-Time Firestore / Server Listeners
  // -------------------------------------------------------------
  useEffect(() => {
    const resolved = resolveElderAndCaregiver();
    setElderName(resolved.elderName);
    setStartingLevel(resolved.startingLevel);
    setUnlockedLevel(resolved.unlockedLevel);
    if (resolved.aiAnalysis) setAiAnalysis(resolved.aiAnalysis);

    const { cleanElderId, elderId, caregiverEmail } = resolved;
    const todayDate = getTodayDateString();

    // Fetch initial scores & unlocked level from Server DB
    fetch(`/api/game-scores?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(caregiverEmail || '')}&date=${encodeURIComponent(todayDate)}`)
      .then(r => r.json())
      .then(sData => {
        setIsLoadingSession(false);
        if (sData?.success) {
          const unLvl = Number(sData.unlockedLevel || sData.analytics?.unlockedLevel);
          if (unLvl) {
            setUnlockedLevel(prev => Math.max(prev, unLvl));
          }
          if (sData.analytics) {
            const tSessions = Number(sData.analytics.todaySessions) || 0;
            const tScore = Number(sData.analytics.todayScore) || 0;
            if (tSessions > 0 || tScore > 0) {
              setTodaySessions(prev => Math.max(prev, tSessions));
              setTodayScore(prev => Math.max(prev, tScore));
            }
          }
        }
      })
      .catch(() => setIsLoadingSession(false));

    if (!db || !cleanElderId) {
      return;
    }

    // Listen to Elder document for live unlocked level and AI analysis
    const elderDocRef = doc(db, 'elders', cleanElderId);
    const unsubElder = onSnapshot(elderDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data() || {};
        if (typeof d.unlockedLevel === 'number') {
          setUnlockedLevel(prev => Math.max(prev, d.unlockedLevel));
        }
        if (typeof d.startingLevel === 'number') {
          setStartingLevel(d.startingLevel);
        }
        if (d.aiAnalysis) {
          setAiAnalysis(d.aiAnalysis);
        }
        if (d.name) {
          setElderName(d.name);
        }
      }
    }, (err) => console.warn('[GameHub] Elder snapshot notice:', err));

    // Listen to Today's Daily Log
    const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
    const unsubDaily = onSnapshot(dailyLogRef, (snap) => {
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
        if (data.lastPlayedLevel) setLastPlayedLevel(data.lastPlayedLevel);
      } else {
        setTodaySessions(0);
        setTodayScore(0);
      }
    }, (err) => {
      console.warn('[GameHub] DailyLog snapshot notice:', err);
      setIsLoadingSession(false);
    });

    return () => {
      unsubElder();
      unsubDaily();
    };
  }, []);

  // -------------------------------------------------------------
  // 2. Strict 60-Second Countdown Timer
  // -------------------------------------------------------------
  useEffect(() => {
    if (viewMode === 'game' && isTimerRunning && timeLeft > 0 && !roundCompleted && !isTimedOut) {
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
  }, [viewMode, isTimerRunning, timeLeft, roundCompleted, isTimedOut]);

  // Handle Timeout
  const handleTimeUp = () => {
    if (roundCompleted || isTimedOut) return;
    setIsTimerRunning(false);
    setIsTimedOut(true);

    speakText("Time is up! Round ended. Take a gentle breath.");
    showToast("⏰ Time's up! No points awarded for incomplete round.", "info", 5000);

    const { cleanElderId, elderId, caregiverEmail } = resolveElderAndCaregiver();
    const todayDate = getTodayDateString();

    if (db && cleanElderId) {
      const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
      const sessionEntry = {
        sessionNumber: Math.min(5, todaySessions + 1),
        level: activeLevel,
        pointsEarned: 0,
        completedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        remainingTimeSeconds: 0,
        status: 'timed_out',
        accuracy: 50,
      };

      setDoc(dailyLogRef, {
        lastPlayedLevel: activeLevel,
        lastPlayedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sessionsHistory: arrayUnion(sessionEntry),
      }, { merge: true }).catch(() => {});
    }

    // Record locally
    dataStore.recordGameScore?.({
      score: 0,
      level: activeLevel,
      accuracy: 50,
      durationSeconds: 60,
      date: todayDate,
      elderId,
      caregiverEmail,
      status: 'Timed Out',
      skipServerPersist: true,
    });
  };

  // -------------------------------------------------------------
  // 3. Complete Session & Progressive Unlock Logic
  // -------------------------------------------------------------
  const handleRoundVictory = async (customAccuracy = 100) => {
    if (isRecordingRef.current || isTimedOut || roundCompleted) return;
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

    // Check if next sequential level unlocks
    let willUnlockNext = false;
    let nextUnlocked = unlockedLevel;
    if (activeLevel >= unlockedLevel && unlockedLevel < 10) {
      willUnlockNext = true;
      nextUnlocked = Math.min(10, unlockedLevel + 1);
      setUnlockedLevel(nextUnlocked);
      setLevelJustUnlocked(nextUnlocked);

      // Update local storage
      try {
        const storedUser = JSON.parse(localStorage.getItem('sahara_active_user') || '{}');
        storedUser.unlockedLevel = nextUnlocked;
        localStorage.setItem('sahara_active_user', JSON.stringify(storedUser));
        const storedP = JSON.parse(localStorage.getItem('sahara_patient_profile') || '{}');
        storedP.unlockedLevel = nextUnlocked;
        localStorage.setItem('sahara_patient_profile', JSON.stringify(storedP));
      } catch (e) {}
    }

    speakText(`Wonderful job! Level ${activeLevel} completed! You earned 50 points!`);
    showToast(`🎉 Level ${activeLevel} Complete! +50 Points Awarded!`, 'success', 5000);

    // 1. Atomic Firestore Updates
    if (db && cleanElderId) {
      const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
      const elderRef = doc(db, 'elders', cleanElderId);

      const sessionEntry = {
        sessionNumber: nextSessionNum,
        level: activeLevel,
        pointsEarned: 50,
        completedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        remainingTimeSeconds: finalRemaining,
        status: 'completed',
        accuracy: customAccuracy,
      };

      const gamePayload = {
        todaySessions: increment(1),
        todayScore: increment(50),
        completedSessions: increment(1),
        totalScore: increment(50),
        lastGameScore: 50,
        lastPlayedLevel: activeLevel,
        lastPlayedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sessionsHistory: arrayUnion(sessionEntry),
        gamesHistory: arrayUnion(sessionEntry),
      };

      setDoc(dailyLogRef, gamePayload, { merge: true }).catch(err => {
        console.warn('[GameHub] Firestore dailyLog setDoc error:', err);
      });

      const elderPatch = {
        id: cleanElderId,
        todayGameScore: increment(50),
        todayGameSessions: increment(1),
        lastGameScore: 50,
        lastPlayedLevel: activeLevel,
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (willUnlockNext) {
        elderPatch.unlockedLevel = nextUnlocked;
      }
      setDoc(elderRef, elderPatch, { merge: true }).catch(() => {});
    }

    // 2. Server API sync
    try {
      fetch('/api/game-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elderId,
          caregiverEmail,
          level: activeLevel,
          unlockedLevel: nextUnlocked,
          score: 50,
          pointsEarned: 50,
          moves: moves || 3,
          matchedPairs: 3,
          accuracy: customAccuracy,
          durationSeconds: 60 - finalRemaining,
          remainingTimeSeconds: finalRemaining,
          status: 'Completed (+50 pts)',
          date: todayDate,
          timestamp: new Date().toISOString(),
        }),
      }).catch(e => console.warn('[GameHub] Server score sync notice:', e));
    } catch (e) {}

    // 3. Local dataStore update
    dataStore.incrementGamesCount?.();
    dataStore.recordGameScore?.({
      score: 50,
      pointsEarned: 50,
      level: activeLevel,
      moves: moves || 3,
      matchedPairs: 3,
      accuracy: customAccuracy,
      durationSeconds: 60 - finalRemaining,
      remainingTimeSeconds: finalRemaining,
      date: todayDate,
      elderId,
      caregiverEmail,
      status: 'Completed (+50 pts)',
      skipServerPersist: true,
    });
  };

  // -------------------------------------------------------------
  // 4. Start Level Gameplay (Dynamically Randomize from 50 Pools)
  // -------------------------------------------------------------
  const handleStartLevel = (lvlNum) => {
    if (todaySessions >= 5) {
      showToast('Daily limit reached! 5 sessions completed today. Come back tomorrow! 🌟', 'info', 5000);
      return;
    }
    if (lvlNum > unlockedLevel) {
      showToast(`🔒 Level ${lvlNum} is locked. Complete Level ${lvlNum - 1} to unlock it.`, 'error', 4000);
      return;
    }

    setActiveLevel(lvlNum);
    setTimeLeft(60);
    setIsTimerRunning(true);
    setRoundCompleted(false);
    setIsTimedOut(false);
    setLevelJustUnlocked(null);
    isRecordingRef.current = false;

    // Reset and Randomize 50-Item Variation Pools per Level
    if (lvlNum === 1) {
      setCards(generateLevel1Cards());
      setFlippedIndices([]);
      setMoves(0);
    } else if (lvlNum === 2) {
      const pickedL2 = LEVEL_2_WORD_SEARCH_POOLS[Math.floor(Math.random() * LEVEL_2_WORD_SEARCH_POOLS.length)];
      setActiveWordSearchL2(pickedL2);
      setFoundWordsL2([]);
      setSelectedCellsL2([]);
      setIsDraggingL2(false);
      setDragStartCellL2(null);
    } else if (lvlNum === 3) {
      const pickedL3 = LEVEL_3_CROSSWORD_POOLS[Math.floor(Math.random() * LEVEL_3_CROSSWORD_POOLS.length)];
      setActiveCrosswordL3(pickedL3);
      setCrosswordAnswers({});
    } else if (lvlNum === 4) {
      const pickedL4 = sampleRandom(LEVEL_4_ANAGRAMS_POOL, 3);
      setActiveAnagramsL4(pickedL4);
      setCurrentAnagramIdx(0);
      setAssembledLetters([]);
      setSolvedAnagrams([]);
    } else if (lvlNum === 5) {
      const pickedL5 = LEVEL_5_WORD_WHEELS_POOL[Math.floor(Math.random() * LEVEL_5_WORD_WHEELS_POOL.length)];
      setActiveWheelL5(pickedL5);
      setWheelWordsFound([]);
      setCurrentWheelWord('');
    } else if (lvlNum === 6) {
      const pickedL6 = sampleRandom(LEVEL_6_PROVERBS_POOL, 3);
      setActiveProverbsL6(pickedL6);
      setCurrentProverbIdx(0);
      setSolvedProverbs([]);
    } else if (lvlNum === 7) {
      const pickedL7 = sampleRandom(LEVEL_7_RHYMES_POOL, 3);
      setActiveRhymesL7(pickedL7);
      setCurrentRhymeIdx(0);
      setSolvedRhymes([]);
    } else if (lvlNum === 8) {
      const pickedL8 = LEVEL_8_CATEGORIES_POOL[Math.floor(Math.random() * LEVEL_8_CATEGORIES_POOL.length)];
      setActiveCategoryL8(pickedL8);
      setCategorizedItems({});
    } else if (lvlNum === 9) {
      const pickedL9 = LEVEL_9_HANGMAN_POOL[Math.floor(Math.random() * LEVEL_9_HANGMAN_POOL.length)];
      setActiveHangmanL9(pickedL9);
      setHangmanGuessed([]);
      setHangmanAttemptsLeft(7);
    } else if (lvlNum === 10) {
      const pickedL10 = sampleRandom(LEVEL_10_CHALLENGES_POOL, 3);
      setActiveChallengesL10(pickedL10);
      setChallengeStep(0);
      setChallengeAnswers([]);
    }

    setViewMode('game');
    try {
      window.dispatchEvent(new CustomEvent('sahara:game-level-active', { detail: { level: lvlNum } }));
    } catch (e) {}

    const curLang = dataStore.getLanguage ? dataStore.getLanguage() : 'English';
    const vg = getVoiceGuidance(curLang);
    const gameAudio = vg?.games?.[lvlNum] || `Starting Level ${lvlNum}. You have 60 seconds.`;
    speakText(gameAudio, vg?.langCode || 'en-IN');
  };

  // -------------------------------------------------------------
  // 5. Individual Game Mode Handlers (Level 1 to Level 10)
  // -------------------------------------------------------------

  // Level 1: Memory Match Card Click
  const handleCardClickL1 = (idx) => {
    if (isTimedOut || roundCompleted || todaySessions >= 5) return;
    const card = cards[idx];
    if (card.matched || card.flipped || flippedIndices.length >= 2) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);
    speakText(card.title);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const first = newCards[newFlipped[0]];
      const second = newCards[newFlipped[1]];

      if (first.pairId === second.pairId) {
        first.matched = true;
        second.matched = true;
        setCards([...newCards]);
        setFlippedIndices([]);

        if (newCards.every(c => c.matched)) {
          handleRoundVictory(100);
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

  // Level 2: Word Search Interactive Tracing & Validation
  const getCellsBetweenL2 = (start, end) => {
    if (!start || !end) return [];
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    if (dr === 0) {
      // Horizontal
      const step = dc >= 0 ? 1 : -1;
      const cells = [];
      for (let c = start.c; c !== end.c + step; c += step) {
        cells.push({ r: start.r, c });
      }
      return cells;
    }
    if (dc === 0) {
      // Vertical
      const step = dr >= 0 ? 1 : -1;
      const cells = [];
      for (let r = start.r; r !== end.r + step; r += step) {
        cells.push({ r, c: start.c });
      }
      return cells;
    }
    if (absDr === absDc) {
      // Diagonal
      const stepR = dr > 0 ? 1 : -1;
      const stepC = dc > 0 ? 1 : -1;
      const cells = [];
      for (let i = 0; i <= absDr; i++) {
        cells.push({ r: start.r + i * stepR, c: start.c + i * stepC });
      }
      return cells;
    }
    // Dominant axis fallback
    if (absDc >= absDr) {
      const step = dc > 0 ? 1 : -1;
      const cells = [];
      for (let c = start.c; c !== end.c + step; c += step) {
        cells.push({ r: start.r, c });
      }
      return cells;
    } else {
      const step = dr > 0 ? 1 : -1;
      const cells = [];
      for (let r = start.r; r !== end.r + step; r += step) {
        cells.push({ r, c: start.c });
      }
      return cells;
    }
  };

  const checkSelectedWordL2 = (cells) => {
    if (!cells || cells.length < 2 || !activeWordSearchL2) {
      setSelectedCellsL2([]);
      setIsDraggingL2(false);
      setDragStartCellL2(null);
      return;
    }

    const letters = cells
      .map(pt => activeWordSearchL2.grid[pt.r]?.[pt.c] || '')
      .join('');
    const reversed = letters.split('').reverse().join('');

    const matchedWordObj = activeWordSearchL2.words.find(
      w => (w.word === letters || w.word === reversed) && !foundWordsL2.includes(w.word)
    );

    if (matchedWordObj) {
      const next = [...foundWordsL2, matchedWordObj.word];
      setFoundWordsL2(next);
      setSelectedCellsL2([]);
      setIsDraggingL2(false);
      setDragStartCellL2(null);
      speakText(`Wonderful! You found ${matchedWordObj.word}!`);
      showToast(`✨ Found: ${matchedWordObj.word}! (${matchedWordObj.hint})`, 'success', 2500);

      if (next.length >= activeWordSearchL2.words.length) {
        handleRoundVictory(100);
      }
    } else {
      // Clear selection if not matched
      setSelectedCellsL2([]);
      setIsDraggingL2(false);
      setDragStartCellL2(null);
    }
  };

  const handleCellPointerDownL2 = (r, c) => {
    if (isTimedOut || roundCompleted) return;
    setIsDraggingL2(true);
    setDragStartCellL2({ r, c });
    setSelectedCellsL2([{ r, c }]);
  };

  const handleCellPointerEnterL2 = (r, c) => {
    if (isTimedOut || roundCompleted || !isDraggingL2 || !dragStartCellL2) return;
    const line = getCellsBetweenL2(dragStartCellL2, { r, c });
    setSelectedCellsL2(line);
  };

  const handleCellPointerUpL2 = () => {
    if (isTimedOut || roundCompleted) return;
    if (selectedCellsL2.length > 1) {
      checkSelectedWordL2(selectedCellsL2);
    } else {
      setIsDraggingL2(false);
      setDragStartCellL2(null);
    }
  };

  const handleCellTapL2 = (r, c) => {
    if (isTimedOut || roundCompleted) return;
    if (selectedCellsL2.length === 0) {
      setSelectedCellsL2([{ r, c }]);
      const letter = activeWordSearchL2.grid[r][c];
      showToast(`Selected "${letter}". Now drag or tap the ending letter.`, 'info', 1800);
    } else if (selectedCellsL2.length === 1) {
      const first = selectedCellsL2[0];
      if (first.r === r && first.c === c) {
        setSelectedCellsL2([]);
      } else {
        const line = getCellsBetweenL2(first, { r, c });
        setSelectedCellsL2(line);
        checkSelectedWordL2(line);
      }
    } else {
      setSelectedCellsL2([{ r, c }]);
    }
  };

  const handleWordHintL2 = (wObj) => {
    if (isTimedOut || roundCompleted) return;
    if (foundWordsL2.includes(wObj.word)) {
      speakText(`${wObj.word} is already found!`);
      showToast(`✓ ${wObj.word} is already completed!`, 'success', 2000);
    } else {
      speakText(`Look for ${wObj.word} in the grid. Hint: ${wObj.hint}. Drag across letters in the grid.`);
      showToast(`💡 Look for "${wObj.word}" in the grid (${wObj.hint})`, 'info', 3500);
    }
  };

  // Level 3: Crossword Answer Check
  const handleCrosswordOptionSelect = (wordId, chosenAnswer, correctAnswer) => {
    if (isTimedOut || roundCompleted) return;
    const updated = { ...crosswordAnswers, [wordId]: chosenAnswer };
    setCrosswordAnswers(updated);
    if (chosenAnswer === correctAnswer) {
      speakText(`Correct: ${correctAnswer}!`);
      showToast(`Correct! ${correctAnswer}`, 'success', 1500);
    }
    const allFilledCorrect = activeCrosswordL3.words.every(
      w => (w.id === wordId ? chosenAnswer : updated[w.id]) === w.answer
    );
    if (allFilledCorrect) {
      handleRoundVictory(100);
    }
  };

  // Level 4: Word Unscramble Tile Click
  const handleAnagramTileClick = (letter, currentAnagram) => {
    if (isTimedOut || roundCompleted) return;
    const nextAssembled = [...assembledLetters, letter];
    setAssembledLetters(nextAssembled);
    const assembledWord = nextAssembled.join('');
    if (assembledWord === currentAnagram.target) {
      speakText(`Word spelled: ${currentAnagram.target}!`);
      showToast(`Great! ${currentAnagram.target}`, 'success', 2000);
      const nextSolved = [...solvedAnagrams, currentAnagram.id];
      setSolvedAnagrams(nextSolved);
      setAssembledLetters([]);
      if (nextSolved.length >= activeAnagramsL4.length) {
        handleRoundVictory(100);
      } else {
        setCurrentAnagramIdx(prev => prev + 1);
      }
    }
  };

  // Level 5: Word Wheel Letter Click & Submit
  const handleWheelLetterTap = (letter) => {
    if (isTimedOut || roundCompleted) return;
    setCurrentWheelWord(prev => prev + letter);
  };

  const handleWheelSubmit = () => {
    if (isTimedOut || roundCompleted) return;
    const testWord = currentWheelWord.toUpperCase();
    if (wheelWordsFound.includes(testWord)) {
      showToast('Word already found!', 'info', 2000);
      setCurrentWheelWord('');
      return;
    }
    if (activeWheelL5.validWords.includes(testWord) && testWord.includes(activeWheelL5.centerLetter)) {
      const next = [...wheelWordsFound, testWord];
      setWheelWordsFound(next);
      speakText(`Valid word: ${testWord}!`);
      showToast(`Found: ${testWord}!`, 'success', 2000);
      setCurrentWheelWord('');
      if (next.length >= (activeWheelL5.targetCount || 3)) {
        handleRoundVictory(100);
      }
    } else {
      showToast(`Must contain '${activeWheelL5.centerLetter}' and form a valid word.`, 'error', 2500);
      setCurrentWheelWord('');
    }
  };

  // Level 6: Proverb Option Click
  const handleProverbSelect = (option, currentP) => {
    if (isTimedOut || roundCompleted) return;
    if (option === currentP.answer) {
      speakText(`Correct: ${option}!`);
      showToast(`Correct! ${currentP.explanation}`, 'success', 2500);
      const nextSolved = [...solvedProverbs, currentP.id];
      setSolvedProverbs(nextSolved);
      if (nextSolved.length >= activeProverbsL6.length) {
        handleRoundVictory(100);
      } else {
        setCurrentProverbIdx(prev => prev + 1);
      }
    } else {
      showToast('Gentle hint: Try another comforting option.', 'info', 2000);
    }
  };

  // Level 7: Rhyme Option Click
  const handleRhymeSelect = (option, currentR) => {
    if (isTimedOut || roundCompleted) return;
    if (option === currentR.correct) {
      speakText(`Wonderful! ${option} rhymes with ${currentR.targetWord}!`);
      showToast(`Correct! ${option} rhymes with ${currentR.targetWord}`, 'success', 2000);
      const nextSolved = [...solvedRhymes, currentR.id];
      setSolvedRhymes(nextSolved);
      if (nextSolved.length >= activeRhymesL7.length) {
        handleRoundVictory(100);
      } else {
        setCurrentRhymeIdx(prev => prev + 1);
      }
    } else {
      showToast('Listen carefully: That does not quite rhyme. Try again!', 'info', 2000);
    }
  };

  // Level 8: Category Item Sort Click
  const handleCategoryAssign = (itemId, categoryKey, correctCategory) => {
    if (isTimedOut || roundCompleted) return;
    if (categoryKey !== correctCategory) {
      showToast('Gentle check: That belongs in the other category!', 'info', 2000);
      return;
    }
    const next = { ...categorizedItems, [itemId]: categoryKey };
    setCategorizedItems(next);
    speakText('Sorted correctly!');
    showToast('Sorted correctly!', 'success', 1500);
    if (Object.keys(next).length >= activeCategoryL8.items.length) {
      handleRoundVictory(100);
    }
  };

  // Level 9: Hangman Letter Guess
  const handleHangmanGuess = (letter) => {
    if (isTimedOut || roundCompleted || hangmanGuessed.includes(letter)) return;
    const nextGuessed = [...hangmanGuessed, letter];
    setHangmanGuessed(nextGuessed);

    if (activeHangmanL9.word.includes(letter)) {
      speakText(`Letter ${letter} found!`);
      const allFound = activeHangmanL9.word.split('').every(l => nextGuessed.includes(l));
      if (allFound) {
        handleRoundVictory(100);
      }
    } else {
      const nextLeft = hangmanAttemptsLeft - 1;
      setHangmanAttemptsLeft(nextLeft);
      if (nextLeft <= 0) {
        handleTimeUp();
      }
    }
  };

  // Level 10: Mixed Cognitive Master Step
  const handleChallengeAnswer = (chosen, correct) => {
    if (isTimedOut || roundCompleted) return;
    if (chosen === correct) {
      speakText(`Mastered: ${chosen}!`);
      showToast('Correct logic deduction!', 'success', 2000);
      const nextStep = challengeStep + 1;
      setChallengeStep(nextStep);
      if (nextStep >= activeChallengesL10.length) {
        handleRoundVictory(100);
      }
    } else {
      showToast('Take your time and examine the relationship.', 'info', 2500);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ebffe7] text-[#032109] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-28 space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* HUB VIEW: 10-LEVEL PROGRESSIVE COGNITIVE SUITE */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'hub' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Hub Banner & Today's Sync Badge */}
            <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#006e1c] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                    Cognitive Progression Suite · 10 Levels (50 Variations Each)
                  </span>
                  {aiAnalysis && (
                    <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">clinical_notes</span>
                      <span>Saha AI Baseline: Level {startingLevel}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#032109]">
                  Namaste, {elderName.split(' ')[0]} ji 🌿
                </h1>
                <p className="text-xs sm:text-sm text-[#40493d] max-w-xl">
                  Each session is 1 minute (+50 points). Every level features 50 diverse puzzle variations that change every time you play. Complete your current level to unlock the next challenge in sequence!
                </p>

                {/* Level 1-10 Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                    <span className="text-[#0d631b]">Progress Track: Level {unlockedLevel} / 10 Unlocked</span>
                    <span className="text-[#40493d]">{Math.round((unlockedLevel / 10) * 100)}% Available</span>
                  </div>
                  <div className="w-full bg-[#ebffe7] h-3 rounded-full overflow-hidden border border-[#cdf2cb] flex">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 border-r border-white/50 transition-all ${
                          idx + 1 <= unlockedLevel ? 'bg-[#006e1c]' : 'bg-gray-200'
                        }`}
                        title={`Level ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Today's Daily Stats Card */}
              <div className="bg-[#ebffe7] p-4 rounded-2xl border border-[#cdf2cb] flex sm:flex-col justify-around gap-3 text-center shrink-0">
                <div>
                  <span className="text-[11px] font-bold text-[#40493d] block">Today&apos;s Sessions</span>
                  <span className="text-2xl font-black text-[#032109]">{todaySessions} / 5</span>
                  <span className="text-[10px] text-[#0d631b] font-semibold block">5 Max Daily</span>
                </div>
                <div className="border-t border-[#cdf2cb] sm:pt-2">
                  <span className="text-[11px] font-bold text-[#40493d] block">Today&apos;s Score</span>
                  <span className="text-2xl font-black text-[#006e1c]">{todayScore} <span className="text-xs font-bold text-[#40493d]">pts</span></span>
                  <span className="text-[10px] text-[#40493d] block">250 Max Daily</span>
                </div>
              </div>
            </div>

            {/* Daily Limit Warning Banner */}
            {todaySessions >= 5 && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-amber-700">stars</span>
                <div>
                  <h4 className="text-sm font-extrabold">Daily Cap Reached (5 of 5 Sessions Completed)</h4>
                  <p className="text-xs">
                    You earned today&apos;s maximum 250 points! Outstanding cognitive practice. Your scores are saved and synced to the Caregiver Portal. Come back tomorrow!
                  </p>
                </div>
              </div>
            )}

            {/* Grid of 10 Progressive Cognitive Level Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {COGNITIVE_LEVELS.map((lvl) => {
                const isUnlocked = lvl.level <= unlockedLevel;
                const isCurrent = lvl.level === unlockedLevel;
                const isAiBaseline = aiAnalysis && lvl.level === startingLevel;

                return (
                  <div
                    key={lvl.level}
                    className={`card-tactile rounded-3xl p-5 transition-all flex flex-col justify-between border-2 ${
                      isCurrent
                        ? 'bg-white border-[#006e1c] shadow-lg ring-2 ring-[#006e1c]/20'
                        : isUnlocked
                        ? 'bg-white border-[#cdf2cb] shadow-sm hover:border-[#006e1c]'
                        : 'bg-gray-50/80 border-gray-200 opacity-60'
                    }`}
                  >
                    <div>
                      {/* Level Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${
                          isUnlocked ? 'bg-[#006e1c] text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          L{lvl.level}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isAiBaseline && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                              Saha AI Baseline
                            </span>
                          )}
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            isUnlocked
                              ? 'bg-[#d9fdd6] text-[#006e1c] border-[#cdf2cb]'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {lvl.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`material-symbols-outlined text-xl ${isUnlocked ? 'text-[#0d631b]' : 'text-gray-400'}`}>
                          {lvl.icon}
                        </span>
                        <h3 className="text-base font-extrabold text-[#032109]">
                          {lvl.title}
                        </h3>
                      </div>
                      <p className="text-xs font-semibold text-[#0d631b] mb-2">{lvl.subtitle}</p>
                      <p className="text-xs text-[#40493d] leading-relaxed mb-4">
                        {lvl.description}
                      </p>
                    </div>

                    {/* Action Button / Lock Status */}
                    <div className="pt-2 border-t border-[#cdf2cb]/60">
                      {isUnlocked ? (
                        <button
                          type="button"
                          disabled={todaySessions >= 5}
                          onClick={() => handleStartLevel(lvl.level)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            todaySessions >= 5
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : isCurrent
                              ? 'btn-tactile bg-[#006e1c] hover:bg-[#0d631b] text-white'
                              : 'bg-[#ebffe7] hover:bg-[#d9fdd6] text-[#006e1c] border border-[#cdf2cb]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {todaySessions >= 5 ? 'block' : 'play_arrow'}
                          </span>
                          <span>{todaySessions >= 5 ? 'Daily Limit' : `Play Level ${lvl.level}`}</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold">
                          <span className="material-symbols-outlined text-base">lock</span>
                          <span>Complete Level {lvl.level - 1} to Unlock</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* GAMEPLAY VIEW: ACTIVE LEVEL RUNNER */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'game' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header: Back Button, Timer, Level Details */}
            <div className="card-tactile bg-white rounded-3xl p-4 sm:p-5 shadow-md border border-[#cdf2cb] flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setViewMode('hub')}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0d631b] hover:underline cursor-pointer bg-[#ebffe7] px-3 py-1.5 rounded-xl border border-[#cdf2cb]"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Levels Hub</span>
              </button>

              <div className="text-center">
                <span className="text-[11px] font-extrabold text-[#006e1c] uppercase tracking-wider block">
                  Level {activeLevel} of 10 · {COGNITIVE_LEVELS.find(l => l.level === activeLevel)?.title}
                </span>
                <span className="text-xs text-[#40493d]">Session {todaySessions + 1} of 5 today (+50 pts)</span>
              </div>

              {/* 60-Second Countdown Badge */}
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-black text-sm border-2 shadow-xs transition-colors ${
                timeLeft <= 15
                  ? 'bg-red-100 text-red-700 border-red-300 animate-pulse'
                  : 'bg-[#ebffe7] text-[#006e1c] border-[#cdf2cb]'
              }`}>
                <span className="material-symbols-outlined text-base">timer</span>
                <span>{timeLeft}s remaining</span>
              </div>
            </div>

            {/* LEVEL 1: MEMORY MATCH (50 CARDS POOL) */}
            {activeLevel === 1 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#032109]">Level 1: Memory Match</h2>
                    <p className="text-xs text-[#40493d]">Tap cards to uncover matching pairs (50 diverse card themes)</p>
                  </div>
                  <span className="text-xs font-bold text-[#006e1c] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                    Moves: {moves}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto">
                  {cards.map((card, idx) => {
                    const isFlipped = card.flipped || card.matched;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => handleCardClickL1(idx)}
                        className={`h-32 sm:h-36 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer border-2 ${
                          card.matched
                            ? 'bg-emerald-100 border-[#006e1c] scale-95 shadow-xs'
                            : isFlipped
                            ? 'bg-white border-[#006e1c] shadow-md scale-105'
                            : 'bg-gradient-to-br from-[#d9fdd6] to-[#ebffe7] border-[#cdf2cb] hover:border-[#006e1c] shadow-sm hover:scale-102'
                        }`}
                      >
                        {isFlipped ? (
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#006e1c]">
                              {card.icon || 'star'}
                            </span>
                            <span className="text-xs font-extrabold text-[#032109] line-clamp-1">{card.title}</span>
                            <span className="text-[10px] text-[#40493d] line-clamp-1">{card.subtitle}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-[#0d631b]">
                            <span className="material-symbols-outlined text-3xl">psychology</span>
                            <span className="text-[10px] font-extrabold mt-1">Tap Card</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 2: WORD SEARCH (50 THEMED PUZZLES) */}
            {activeLevel === 2 && activeWordSearchL2 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#032109]">
                      Level 2: Word Search &middot; <span className="text-[#0d631b]">{activeWordSearchL2.theme}</span>
                    </h2>
                    <p className="text-xs text-[#40493d]">
                      Drag your finger or mouse across the letters in the 6×6 grid to find and connect each hidden word.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#006e1c] bg-[#d9fdd6] px-3.5 py-1.5 rounded-full border border-[#cdf2cb] shadow-xs">
                    Found: {foundWordsL2.length} / {activeWordSearchL2.words.length}
                  </span>
                </div>

                {/* Target Words to Find (Clicking plays voice hint, does NOT auto-solve) */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-extrabold text-[#0d631b] uppercase tracking-wider text-center">
                    Words to Find in Grid (Tap for Voice Hint):
                  </p>
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {activeWordSearchL2.words.map((w) => {
                      const isFound = foundWordsL2.includes(w.word);
                      return (
                        <button
                          key={w.word}
                          type="button"
                          onClick={() => handleWordHintL2(w)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border-2 shadow-xs ${
                            isFound
                              ? 'bg-[#006e1c] text-white border-[#006e1c] ring-2 ring-emerald-200 scale-102'
                              : 'bg-[#ebffe7] text-[#032109] border-[#cdf2cb] hover:border-[#006e1c] hover:bg-[#d9fdd6]'
                          }`}
                          title={isFound ? `${w.word} is found!` : `Tap to hear hint for ${w.word}`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {isFound ? 'check_circle' : 'lightbulb'}
                          </span>
                          <span className="text-sm font-black tracking-wider">{w.word}</span>
                          <span className={`text-[10px] ${isFound ? 'text-emerald-100' : 'text-[#40493d]'}`}>
                            ({w.hint})
                          </span>
                          {isFound && (
                            <span className="bg-white/20 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                              Found
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Selection Bar */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#d9fdd6] border border-[#cdf2cb] text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-base text-[#0d631b] shrink-0">touch_app</span>
                    <div className="truncate">
                      {selectedCellsL2.length > 0 ? (
                        <span className="flex items-center gap-1.5">
                          <span className="font-bold text-[#032109]">Selected:</span>
                          <span className="bg-white px-2.5 py-0.5 rounded-lg border border-teal-300 font-black text-teal-900 tracking-widest text-sm shadow-xs">
                            {selectedCellsL2.map(pt => activeWordSearchL2.grid[pt.r][pt.c]).join('')}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#40493d] font-medium">
                          Drag across letters or tap first & last letter to select a word.
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedCellsL2.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCellsL2([]);
                        setIsDraggingL2(false);
                        setDragStartCellL2(null);
                      }}
                      className="shrink-0 text-[11px] font-bold text-red-600 hover:text-red-800 bg-white px-2.5 py-1 rounded-xl border border-red-200 cursor-pointer shadow-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* 6x6 Interactive Word Search Grid */}
                <div
                  className="grid grid-cols-6 gap-1.5 sm:gap-2.5 max-w-sm mx-auto p-3.5 rounded-2xl bg-[#ebffe7] border-2 border-[#cdf2cb] select-none touch-none shadow-inner"
                  onPointerLeave={() => {
                    if (isDraggingL2 && selectedCellsL2.length > 1) {
                      checkSelectedWordL2(selectedCellsL2);
                    } else {
                      setIsDraggingL2(false);
                      setDragStartCellL2(null);
                    }
                  }}
                  onPointerUp={handleCellPointerUpL2}
                  onTouchMove={(e) => {
                    if (!isDraggingL2 || !dragStartCellL2) return;
                    const touch = e.touches[0];
                    if (!touch) return;
                    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                    const cellElem = elem?.closest('[data-cell-pos]');
                    if (cellElem) {
                      const r = parseInt(cellElem.getAttribute('data-row'), 10);
                      const c = parseInt(cellElem.getAttribute('data-col'), 10);
                      if (!isNaN(r) && !isNaN(c)) {
                        const line = getCellsBetweenL2(dragStartCellL2, { r, c });
                        setSelectedCellsL2(line);
                      }
                    }
                  }}
                  onTouchEnd={() => {
                    if (selectedCellsL2.length > 1) {
                      checkSelectedWordL2(selectedCellsL2);
                    } else {
                      setIsDraggingL2(false);
                      setDragStartCellL2(null);
                    }
                  }}
                >
                  {activeWordSearchL2.grid.map((row, rIdx) =>
                    row.map((letter, cIdx) => {
                      const isFound = activeWordSearchL2.words.some(
                        w => foundWordsL2.includes(w.word) && w.row === rIdx && cIdx >= w.col && cIdx < w.col + w.length
                      );
                      const isSelected = selectedCellsL2.some(pt => pt.r === rIdx && pt.c === cIdx);

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          data-cell-pos="true"
                          data-row={rIdx}
                          data-col={cIdx}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleCellPointerDownL2(rIdx, cIdx);
                          }}
                          onPointerEnter={() => handleCellPointerEnterL2(rIdx, cIdx)}
                          onClick={() => handleCellTapL2(rIdx, cIdx)}
                          className={`h-11 sm:h-13 rounded-2xl flex items-center justify-center font-black text-base sm:text-lg border-2 transition-all cursor-pointer user-select-none select-none ${
                            isFound
                              ? 'bg-[#006e1c] text-white border-[#004d13] shadow-md ring-2 ring-emerald-300/70 scale-95'
                              : isSelected
                              ? 'bg-teal-500 text-white border-teal-700 shadow-md ring-2 ring-teal-200 scale-105 animate-pulse'
                              : 'bg-white text-[#032109] border-[#cdf2cb] hover:bg-[#d9fdd6] hover:border-[#006e1c] hover:scale-102 shadow-xs active:scale-95'
                          }`}
                        >
                          {letter}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* LEVEL 3: QUICK DEMENTIA-FRIENDLY CROSSWORD (50 THEMED PUZZLES) */}
            {activeLevel === 3 && activeCrosswordL3 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#032109]">
                      Level 3: Quick Crossword &middot; <span className="text-[#0d631b]">{activeCrosswordL3.theme}</span>
                    </h2>
                    <p className="text-xs text-[#40493d]">Tap the correct comforting answer for each everyday clue:</p>
                  </div>
                  <span className="text-xs font-bold text-[#006e1c] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                    Clues: {Object.values(crosswordAnswers).filter((ans, i) => ans === activeCrosswordL3.words[i]?.answer).length} / {activeCrosswordL3.words.length}
                  </span>
                </div>

                <div className="space-y-3 max-w-xl mx-auto">
                  {activeCrosswordL3.words.map((item) => {
                    const isSolved = crosswordAnswers[item.id] === item.answer;
                    const options = item.options || [item.answer, 'WATER', 'PEACE'];

                    return (
                      <div key={item.id} className="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#006e1c]">Clue #{item.id}</span>
                          {isSolved && (
                            <span className="text-[11px] font-bold text-[#006e1c] flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>Correct</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-extrabold text-[#032109]">{item.clue}</p>

                        <div className="flex gap-2 pt-1">
                          {options.map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleCrosswordOptionSelect(item.id, opt, item.answer)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                crosswordAnswers[item.id] === opt
                                  ? opt === item.answer
                                    ? 'bg-[#006e1c] text-white border-[#006e1c]'
                                    : 'bg-red-600 text-white border-red-600'
                                  : 'bg-white text-[#032109] border-[#cdf2cb] hover:border-[#006e1c]'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 4: ANAGRAMS & WORD UNSCRAMBLES (50 WORDS POOL) */}
            {activeLevel === 4 && activeAnagramsL4[currentAnagramIdx] && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 4: Word Unscramble</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Solved: {solvedAnagrams.length} / {activeAnagramsL4.length}
                  </span>
                </div>

                {currentAnagramIdx < activeAnagramsL4.length && (
                  <div className="max-w-md mx-auto text-center space-y-4">
                    <p className="text-xs text-[#40493d]">
                      Hint: {activeAnagramsL4[currentAnagramIdx].hint}
                    </p>

                    {/* Assembled Letters Display */}
                    <div className="flex justify-center gap-2 min-h-[50px] p-2 bg-[#ebffe7] rounded-2xl border border-[#cdf2cb]">
                      {assembledLetters.map((l, i) => (
                        <span key={i} className="w-10 h-10 rounded-xl bg-[#006e1c] text-white font-black text-lg flex items-center justify-center">
                          {l}
                        </span>
                      ))}
                      {assembledLetters.length === 0 && (
                        <span className="text-xs text-gray-400 my-auto">Tap letter tiles below in correct sequence</span>
                      )}
                    </div>

                    {/* Scrambled Tile Buttons */}
                    <div className="flex justify-center gap-2 flex-wrap">
                      {activeAnagramsL4[currentAnagramIdx].scrambled.map((char, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAnagramTileClick(char, activeAnagramsL4[currentAnagramIdx])}
                          className="w-12 h-12 rounded-2xl bg-white border-2 border-[#cdf2cb] hover:border-[#006e1c] font-black text-xl text-[#032109] shadow-xs cursor-pointer active:scale-95"
                        >
                          {char}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssembledLetters([])}
                      className="text-xs font-bold text-[#0d631b] hover:underline cursor-pointer"
                    >
                      Clear / Start Word Over
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* LEVEL 5: WORD WHEEL & BUILDING (50 WHEEL POOLS) */}
            {activeLevel === 5 && activeWheelL5 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 5: Word Wheel</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Found: {wheelWordsFound.length} / {activeWheelL5.targetCount || 3}
                  </span>
                </div>
                <p className="text-xs text-[#40493d] text-center">
                  Form 3 words using the outer letters. Every word must include center letter <strong>&apos;{activeWheelL5.centerLetter}&apos;</strong>!
                </p>

                {/* Interactive Word Wheel */}
                <div className="max-w-xs mx-auto text-center space-y-4">
                  <div className="relative w-52 h-52 mx-auto rounded-full bg-[#ebffe7] border-4 border-[#cdf2cb] flex items-center justify-center shadow-inner">
                    {/* Center Letter Button */}
                    <button
                      type="button"
                      onClick={() => handleWheelLetterTap(activeWheelL5.centerLetter)}
                      className="w-16 h-16 rounded-full bg-[#006e1c] text-white font-black text-2xl shadow-md cursor-pointer hover:scale-105 transition-transform"
                    >
                      {activeWheelL5.centerLetter}
                    </button>

                    {/* Outer Letter Buttons */}
                    {activeWheelL5.outerLetters.map((letter, idx) => {
                      const angle = (idx * 360) / activeWheelL5.outerLetters.length;
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.round(75 * Math.cos(rad));
                      const y = Math.round(75 * Math.sin(rad));

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleWheelLetterTap(letter)}
                          style={{ transform: `translate(${x}px, ${y}px)` }}
                          className="absolute w-10 h-10 rounded-full bg-white border-2 border-[#006e1c] text-[#032109] font-extrabold text-base shadow-xs cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>

                  {/* Assembled Word & Actions */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-10 px-4 rounded-xl bg-white border border-[#cdf2cb] font-black text-lg text-[#006e1c] flex items-center min-w-[120px] justify-center">
                      {currentWheelWord || '...'}
                    </span>
                    <button
                      type="button"
                      onClick={handleWheelSubmit}
                      className="py-2 px-3.5 rounded-xl bg-[#006e1c] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentWheelWord('')}
                      className="py-2 px-3 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Found Words List */}
                  {wheelWordsFound.length > 0 && (
                    <div className="flex justify-center gap-2 flex-wrap">
                      {wheelWordsFound.map((w, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-[#d9fdd6] text-[#006e1c] text-xs font-bold border border-[#cdf2cb]">
                          ✓ {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LEVEL 6: FILL-IN-THE-BLANK PROVERBS (50 PROVERBS POOL) */}
            {activeLevel === 6 && activeProverbsL6[currentProverbIdx] && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 6: Fill-in-the-Blank Proverbs</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Completed: {solvedProverbs.length} / {activeProverbsL6.length}
                  </span>
                </div>

                {currentProverbIdx < activeProverbsL6.length && (
                  <div className="max-w-lg mx-auto text-center space-y-5 py-4">
                    <p className="text-base sm:text-lg font-black text-[#032109]">
                      &ldquo;{activeProverbsL6[currentProverbIdx].phrase}&rdquo;
                    </p>

                    <div className="flex justify-center gap-3">
                      {activeProverbsL6[currentProverbIdx].options.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleProverbSelect(opt, activeProverbsL6[currentProverbIdx])}
                          className="py-3 px-5 rounded-2xl bg-[#ebffe7] hover:bg-[#006e1c] hover:text-white border-2 border-[#cdf2cb] text-sm font-extrabold text-[#032109] transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LEVEL 7: RHYMING PAIRS (50 RHYMES POOL) */}
            {activeLevel === 7 && activeRhymesL7[currentRhymeIdx] && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 7: Rhyming Pairs</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Pairs Matched: {solvedRhymes.length} / {activeRhymesL7.length}
                  </span>
                </div>

                {currentRhymeIdx < activeRhymesL7.length && (
                  <div className="max-w-md mx-auto text-center space-y-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-[#40493d]">Find the word that rhymes with:</span>
                      <button
                        type="button"
                        onClick={() => speakText(activeRhymesL7[currentRhymeIdx].targetWord)}
                        className="px-3 py-1 rounded-full bg-[#d9fdd6] text-[#006e1c] text-xs font-extrabold border border-[#cdf2cb] flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">volume_up</span>
                        <span>Listen</span>
                      </button>
                    </div>

                    <h3 className="text-3xl font-black text-[#006e1c]">
                      {activeRhymesL7[currentRhymeIdx].targetWord}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {activeRhymesL7[currentRhymeIdx].options.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleRhymeSelect(opt, activeRhymesL7[currentRhymeIdx])}
                          className="py-3 px-4 rounded-2xl bg-white hover:bg-[#ebffe7] border-2 border-[#cdf2cb] hover:border-[#006e1c] text-base font-extrabold text-[#032109] transition-all shadow-xs cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LEVEL 8: CATEGORY ASSOCIATION (50 CATEGORY POOLS) */}
            {activeLevel === 8 && activeCategoryL8 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#032109]">
                      Level 8: Category Sorting &middot; <span className="text-[#0d631b]">{activeCategoryL8.theme}</span>
                    </h2>
                    <p className="text-xs text-[#40493d]">Classify each item into the correct category:</p>
                  </div>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Categorized: {Object.keys(categorizedItems).length} / {activeCategoryL8.items.length}
                  </span>
                </div>

                <div className="space-y-3 max-w-xl mx-auto">
                  {activeCategoryL8.items.map(item => {
                    const assigned = categorizedItems[item.id];
                    return (
                      <div key={item.id} className="p-3.5 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#032109]">{item.label}</span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCategoryAssign(item.id, activeCategoryL8.categoryA.key, item.category)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                              assigned === activeCategoryL8.categoryA.key
                                ? 'bg-[#006e1c] text-white border-[#006e1c]'
                                : 'bg-white text-[#032109] border-[#cdf2cb] hover:border-[#006e1c]'
                            }`}
                          >
                            {activeCategoryL8.categoryA.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCategoryAssign(item.id, activeCategoryL8.categoryB.key, item.category)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                              assigned === activeCategoryL8.categoryB.key
                                ? 'bg-[#006e1c] text-white border-[#006e1c]'
                                : 'bg-white text-[#032109] border-[#cdf2cb] hover:border-[#006e1c]'
                            }`}
                          >
                            {activeCategoryL8.categoryB.name}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 9: HANGMAN-STYLE VOCABULARY (50 MYSTERY WORDS POOL) */}
            {activeLevel === 9 && activeHangmanL9 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">
                    Level 9: Vocabulary Discovery &middot; <span className="text-[#0d631b]">{activeHangmanL9.category}</span>
                  </h2>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-red-600">
                    {Array.from({ length: hangmanAttemptsLeft }).map((_, i) => (
                      <span key={i}>❤️</span>
                    ))}
                    <span className="text-gray-500 ml-1">({hangmanAttemptsLeft} attempts)</span>
                  </div>
                </div>

                <p className="text-xs text-[#40493d] text-center">Clue: {activeHangmanL9.clue}</p>

                {/* Mystery Word Slots */}
                <div className="flex justify-center gap-2 py-4">
                  {activeHangmanL9.word.split('').map((char, idx) => {
                    const isGuessed = hangmanGuessed.includes(char);
                    return (
                      <span
                        key={idx}
                        className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl ${
                          isGuessed ? 'bg-[#ebffe7] border-[#006e1c] text-[#006e1c]' : 'bg-gray-100 border-gray-300 text-transparent'
                        }`}
                      >
                        {isGuessed ? char : '_'}
                      </span>
                    );
                  })}
                </div>

                {/* Keypad */}
                <div className="flex justify-center gap-1.5 flex-wrap max-w-md mx-auto">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                    const guessed = hangmanGuessed.includes(letter);
                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={guessed}
                        onClick={() => handleHangmanGuess(letter)}
                        className={`w-8 h-9 rounded-lg font-extrabold text-xs transition-all ${
                          guessed
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#ebffe7] hover:bg-[#006e1c] hover:text-white border border-[#cdf2cb] text-[#032109] cursor-pointer'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 10: MIXED COGNITIVE MASTER (50 CHALLENGES POOL) */}
            {activeLevel === 10 && activeChallengesL10[challengeStep] && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 10: Mixed Cognitive Master</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Step {challengeStep + 1} of {activeChallengesL10.length}
                  </span>
                </div>

                {challengeStep < activeChallengesL10.length && (
                  <div className="max-w-md mx-auto text-center space-y-5 py-4">
                    <span className="text-[11px] font-extrabold uppercase text-[#006e1c] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                      {activeChallengesL10[challengeStep].type} challenge
                    </span>
                    <h3 className="text-lg font-extrabold text-[#032109]">
                      {activeChallengesL10[challengeStep].question}
                    </h3>

                    <div className="flex flex-col gap-2.5">
                      {activeChallengesL10[challengeStep].options.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleChallengeAnswer(opt, activeChallengesL10[challengeStep].answer)}
                          className="py-3 px-4 rounded-2xl bg-[#ebffe7] hover:bg-[#006e1c] hover:text-white border-2 border-[#cdf2cb] text-sm font-extrabold text-[#032109] transition-all shadow-xs cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TIME UP MODAL */}
            {isTimedOut && (
              <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-amber-600">hourglass_disabled</span>
                <h3 className="text-xl font-black text-amber-900">Time&apos;s Up!</h3>
                <p className="text-xs text-amber-800 max-w-sm mx-auto">
                  The 60-second timer elapsed for this session. Take a gentle breath and try again or return to the levels hub.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleStartLevel(activeLevel)}
                    className="btn-tactile bg-[#006e1c] text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer"
                  >
                    Retry Level {activeLevel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('hub')}
                    className="bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-2xl text-xs font-bold cursor-pointer"
                  >
                    Return to Hub
                  </button>
                </div>
              </div>
            )}

            {/* VICTORY / LEVEL UNLOCKED MODAL */}
            {roundCompleted && (
              <div className="p-6 rounded-3xl bg-[#ebffe7] border-2 border-[#006e1c] text-center space-y-3 shadow-lg">
                <span className="material-symbols-outlined text-5xl text-[#006e1c]">verified</span>
                <h3 className="text-2xl font-black text-[#032109]">
                  Level {activeLevel} Completed! (+50 pts)
                </h3>
                <p className="text-xs sm:text-sm text-[#40493d]">
                  Saved to your daily log ({todaySessions}/5 sessions, {todayScore} points total today).
                </p>

                {levelJustUnlocked && levelJustUnlocked <= 10 && (
                  <div className="p-3 rounded-2xl bg-white border-2 border-[#006e1c] max-w-sm mx-auto flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xl text-[#006e1c]">lock_open</span>
                    <span className="text-sm font-extrabold text-[#006e1c]">
                      🎉 Level {levelJustUnlocked} is now unlocked!
                    </span>
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-3">
                  {levelJustUnlocked && levelJustUnlocked <= 10 && todaySessions < 5 && (
                    <button
                      type="button"
                      onClick={() => handleStartLevel(levelJustUnlocked)}
                      className="btn-tactile bg-[#006e1c] text-white px-5 py-3 rounded-2xl text-sm font-extrabold cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Play Level {levelJustUnlocked} Now</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewMode('hub')}
                    className="bg-white text-[#006e1c] border border-[#cdf2cb] px-5 py-3 rounded-2xl text-sm font-extrabold cursor-pointer"
                  >
                    View All Levels
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
