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
import {
  COGNITIVE_LEVELS,
  LEVEL_1_CARDS,
  LEVEL_2_WORD_SEARCH,
  LEVEL_3_CROSSWORD,
  LEVEL_4_ANAGRAMS,
  LEVEL_5_WORD_WHEEL,
  LEVEL_6_PROVERBS,
  LEVEL_7_RHYMES,
  LEVEL_8_CATEGORIES,
  LEVEL_9_HANGMAN,
  LEVEL_10_CHALLENGES,
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
    if (stored?.role === 'elder') {
      elderId = stored.phone || stored.id || stored.email;
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
        elderId = storedPatient.phone || storedPatient.id || storedPatient.email;
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
    elderId = p?.phone || p?.id || p?.email;
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

export default function ProgressiveCognitiveSuitePage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Navigation & Level State
  const [viewMode, setViewMode] = useState('hub'); // 'hub' | 'game'
  const [activeLevel, setActiveLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [startingLevel, setStartingLevel] = useState(1);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [elderName, setElderName] = useState('Elder');

  // Daily Log Sync State
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayScore, setTodayScore] = useState(0);
  const [lastPlayedLevel, setLastPlayedLevel] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // 1-Minute Active Countdown Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [levelJustUnlocked, setLevelJustUnlocked] = useState(null);

  const isRecordingRef = useRef(false);
  const timerRef = useRef(null);

  // -------------------------------------------------------------
  // LEVEL SPECIFIC GAMEPLAY STATES
  // -------------------------------------------------------------
  // Level 1: Memory Match
  const generateLevel1Cards = () => {
    const poolCopy = [...LEVEL_1_CARDS].sort(() => Math.random() - 0.5);
    const chosen = poolCopy.slice(0, 3);
    const pairs = [...chosen, ...chosen].sort(() => Math.random() - 0.5);
    return pairs.map((c, i) => ({ id: i, ...c, matched: false, flipped: false }));
  };
  const [cards, setCards] = useState(() => generateLevel1Cards());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);

  // Level 2: Word Search
  const [foundWordsL2, setFoundWordsL2] = useState([]);

  // Level 3: Quick Crossword
  const [crosswordAnswers, setCrosswordAnswers] = useState({ 1: '', 2: '', 3: '' });

  // Level 4: Anagrams / Unscramble
  const [currentAnagramIdx, setCurrentAnagramIdx] = useState(0);
  const [assembledLetters, setAssembledLetters] = useState([]);
  const [solvedAnagrams, setSolvedAnagrams] = useState([]);

  // Level 5: Word Wheel
  const [wheelWordsFound, setWheelWordsFound] = useState([]);
  const [currentWheelWord, setCurrentWheelWord] = useState('');

  // Level 6: Fill-in-the-Blank Proverbs
  const [currentProverbIdx, setCurrentProverbIdx] = useState(0);
  const [solvedProverbs, setSolvedProverbs] = useState([]);

  // Level 7: Rhyming Games
  const [currentRhymeIdx, setCurrentRhymeIdx] = useState(0);
  const [solvedRhymes, setSolvedRhymes] = useState([]);

  // Level 8: Category Sorting
  const [categorizedItems, setCategorizedItems] = useState({});

  // Level 9: Hangman Vocabulary
  const [hangmanGuessed, setHangmanGuessed] = useState([]);
  const [hangmanAttemptsLeft, setHangmanAttemptsLeft] = useState(7);

  // Level 10: Mixed Cognitive Master
  const [challengeStep, setChallengeStep] = useState(0);
  const [challengeAnswers, setChallengeAnswers] = useState([]);

  // -------------------------------------------------------------
  // 1. Synchronize Initial User and Real-Time Firestore Listeners
  // -------------------------------------------------------------
  useEffect(() => {
    const resolved = resolveElderAndCaregiver();
    setElderName(resolved.elderName);
    setStartingLevel(resolved.startingLevel);
    setUnlockedLevel(resolved.unlockedLevel);
    if (resolved.aiAnalysis) setAiAnalysis(resolved.aiAnalysis);

    const { cleanElderId } = resolved;
    const todayDate = getTodayDateString();

    if (!db || !cleanElderId) {
      setIsLoadingSession(false);
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
  // 4. Start Level Gameplay
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

    // Reset Level Specific State
    if (lvlNum === 1) {
      setCards(generateLevel1Cards());
      setFlippedIndices([]);
      setMoves(0);
    } else if (lvlNum === 2) {
      setFoundWordsL2([]);
    } else if (lvlNum === 3) {
      setCrosswordAnswers({ 1: '', 2: '', 3: '' });
    } else if (lvlNum === 4) {
      setCurrentAnagramIdx(0);
      setAssembledLetters([]);
      setSolvedAnagrams([]);
    } else if (lvlNum === 5) {
      setWheelWordsFound([]);
      setCurrentWheelWord('');
    } else if (lvlNum === 6) {
      setCurrentProverbIdx(0);
      setSolvedProverbs([]);
    } else if (lvlNum === 7) {
      setCurrentRhymeIdx(0);
      setSolvedRhymes([]);
    } else if (lvlNum === 8) {
      setCategorizedItems({});
    } else if (lvlNum === 9) {
      setHangmanGuessed([]);
      setHangmanAttemptsLeft(7);
    } else if (lvlNum === 10) {
      setChallengeStep(0);
      setChallengeAnswers([]);
    }

    setViewMode('game');
    const levelInfo = COGNITIVE_LEVELS.find(l => l.level === lvlNum);
    speakText(`Starting Level ${lvlNum}: ${levelInfo?.title || 'Cognitive Challenge'}. You have 60 seconds.`);
  };

  // -------------------------------------------------------------
  // 5. Individual Game Mode Handlers
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

  // Level 2: Word Search Word Discovery
  const handleSelectWordL2 = (wObj) => {
    if (isTimedOut || roundCompleted) return;
    if (foundWordsL2.includes(wObj.word)) return;
    const next = [...foundWordsL2, wObj.word];
    setFoundWordsL2(next);
    speakText(`Found word: ${wObj.word}!`);
    showToast(`Found: ${wObj.word}!`, 'success', 2000);
    if (next.length >= LEVEL_2_WORD_SEARCH.words.length) {
      handleRoundVictory(100);
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
    const allFilledCorrect = LEVEL_3_CROSSWORD.words.every(
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
      if (nextSolved.length >= LEVEL_4_ANAGRAMS.length) {
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
    if (LEVEL_5_WORD_WHEEL.validWords.includes(testWord) && testWord.includes(LEVEL_5_WORD_WHEEL.centerLetter)) {
      const next = [...wheelWordsFound, testWord];
      setWheelWordsFound(next);
      speakText(`Valid word: ${testWord}!`);
      showToast(`Found: ${testWord}!`, 'success', 2000);
      setCurrentWheelWord('');
      if (next.length >= LEVEL_5_WORD_WHEEL.targetCount) {
        handleRoundVictory(100);
      }
    } else {
      showToast(`Must contain '${LEVEL_5_WORD_WHEEL.centerLetter}' and form a valid word.`, 'error', 2500);
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
      if (nextSolved.length >= LEVEL_6_PROVERBS.length) {
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
      if (nextSolved.length >= LEVEL_7_RHYMES.length) {
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
    if (Object.keys(next).length >= LEVEL_8_CATEGORIES.items.length) {
      handleRoundVictory(100);
    }
  };

  // Level 9: Hangman Letter Guess
  const handleHangmanGuess = (letter) => {
    if (isTimedOut || roundCompleted || hangmanGuessed.includes(letter)) return;
    const nextGuessed = [...hangmanGuessed, letter];
    setHangmanGuessed(nextGuessed);

    if (LEVEL_9_HANGMAN.word.includes(letter)) {
      speakText(`Letter ${letter} found!`);
      const allFound = LEVEL_9_HANGMAN.word.split('').every(l => nextGuessed.includes(l));
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
      if (nextStep >= LEVEL_10_CHALLENGES.length) {
        handleRoundVictory(100);
      }
    } else {
      showToast('Take your time and examine the relationship.', 'info', 2500);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ebffe7] text-[#032109] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6">

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
                    Cognitive Progression Suite · 10 Levels
                  </span>
                  {aiAnalysis && (
                    <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">clinical_notes</span>
                      <span>AI Baseline: Level {startingLevel}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#032109]">
                  Namaste, {elderName.split(' ')[0]} ji 🌿
                </h1>
                <p className="text-xs sm:text-sm text-[#40493d] max-w-xl">
                  Each session is 1 minute (+50 points). Complete your current level to unlock the next challenge in sequence!
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
                              AI Baseline
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

            {/* LEVEL 1: MEMORY MATCH */}
            {activeLevel === 1 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 1: Memory Match</h2>
                  <span className="text-xs font-bold text-[#40493d]">Tap cards to uncover matching pairs</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto">
                  {cards.map((card, idx) => {
                    const isFlipped = card.flipped || card.matched;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => handleCardClickL1(idx)}
                        className={`h-28 sm:h-36 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer border-2 ${
                          card.matched
                            ? 'bg-emerald-100 border-[#006e1c] scale-95 shadow-xs'
                            : isFlipped
                            ? 'bg-white border-[#006e1c] shadow-md scale-105'
                            : 'bg-gradient-to-br from-[#d9fdd6] to-[#ebffe7] border-[#cdf2cb] hover:border-[#006e1c] shadow-sm'
                        }`}
                      >
                        {isFlipped ? (
                          <div className="flex flex-col items-center space-y-1">
                            <img src={card.img} alt={card.title} className="w-12 h-12 object-contain rounded-lg" />
                            <span className="text-xs font-bold text-[#032109] line-clamp-1">{card.title}</span>
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

            {/* LEVEL 2: WORD SEARCH (AUTO-TRACING ASSISTED) */}
            {activeLevel === 2 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#032109]">Level 2: Word Search</h2>
                    <p className="text-xs text-[#40493d]">Tap the target words below or discover them in the assisted 6x6 grid.</p>
                  </div>
                  <span className="text-xs font-bold text-[#006e1c] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                    Found: {foundWordsL2.length} / {LEVEL_2_WORD_SEARCH.words.length}
                  </span>
                </div>

                {/* Target Word Badges (Clicking triggers auto-trace discovery for limited dexterity) */}
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {LEVEL_2_WORD_SEARCH.words.map((w) => {
                    const isFound = foundWordsL2.includes(w.word);
                    return (
                      <button
                        key={w.word}
                        type="button"
                        onClick={() => handleSelectWordL2(w)}
                        className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border-2 ${
                          isFound
                            ? 'bg-[#006e1c] text-white border-[#006e1c]'
                            : 'bg-[#ebffe7] text-[#032109] border-[#cdf2cb] hover:border-[#006e1c]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isFound ? 'check_circle' : 'search'}
                        </span>
                        <span>{w.word}</span>
                        <span className="text-[10px] opacity-80">({w.hint})</span>
                      </button>
                    );
                  })}
                </div>

                {/* 6x6 Grid */}
                <div className="grid grid-cols-6 gap-1.5 sm:gap-2 max-w-sm mx-auto p-3 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                  {LEVEL_2_WORD_SEARCH.grid.map((row, rIdx) =>
                    row.map((letter, cIdx) => {
                      const isWordCell = LEVEL_2_WORD_SEARCH.words.some(
                        w => foundWordsL2.includes(w.word) && w.row === rIdx && cIdx >= w.col && cIdx < w.col + w.length
                      );
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`h-11 sm:h-12 rounded-xl flex items-center justify-center font-black text-sm sm:text-base border transition-all ${
                            isWordCell
                              ? 'bg-[#006e1c] text-white border-[#006e1c] shadow-xs scale-95'
                              : 'bg-white text-[#032109] border-[#cdf2cb]'
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

            {/* LEVEL 3: QUICK DEMENTIA-FRIENDLY CROSSWORD */}
            {activeLevel === 3 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <h2 className="text-lg font-extrabold text-[#032109]">Level 3: Quick Dementia-Friendly Crossword</h2>
                <p className="text-xs text-[#40493d]">Tap the correct comforting answer for each everyday clue:</p>

                <div className="space-y-3 max-w-xl mx-auto">
                  {LEVEL_3_CROSSWORD.words.map((item) => {
                    const isSolved = crosswordAnswers[item.id] === item.answer;
                    const options = [item.answer, item.id === 1 ? 'COFFEE' : item.id === 2 ? 'MOON' : 'CAT'].sort();

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

            {/* LEVEL 4: ANAGRAMS & WORD UNSCRAMBLES */}
            {activeLevel === 4 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 4: Word Unscramble</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Solved: {solvedAnagrams.length} / {LEVEL_4_ANAGRAMS.length}
                  </span>
                </div>

                {currentAnagramIdx < LEVEL_4_ANAGRAMS.length && (
                  <div className="max-w-md mx-auto text-center space-y-4">
                    <p className="text-xs text-[#40493d]">
                      Hint: {LEVEL_4_ANAGRAMS[currentAnagramIdx].hint}
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
                      {LEVEL_4_ANAGRAMS[currentAnagramIdx].scrambled.map((char, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAnagramTileClick(char, LEVEL_4_ANAGRAMS[currentAnagramIdx])}
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

            {/* LEVEL 5: WORD WHEEL & BUILDING */}
            {activeLevel === 5 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 5: Word Wheel</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Found: {wheelWordsFound.length} / {LEVEL_5_WORD_WHEEL.targetCount}
                  </span>
                </div>
                <p className="text-xs text-[#40493d] text-center">
                  Form 3 words using the outer letters. Every word must include center letter <strong>&apos;{LEVEL_5_WORD_WHEEL.centerLetter}&apos;</strong>!
                </p>

                {/* Interactive Word Wheel */}
                <div className="max-w-xs mx-auto text-center space-y-4">
                  <div className="relative w-52 h-52 mx-auto rounded-full bg-[#ebffe7] border-4 border-[#cdf2cb] flex items-center justify-center shadow-inner">
                    {/* Center Letter Button */}
                    <button
                      type="button"
                      onClick={() => handleWheelLetterTap(LEVEL_5_WORD_WHEEL.centerLetter)}
                      className="w-16 h-16 rounded-full bg-[#006e1c] text-white font-black text-2xl shadow-md cursor-pointer hover:scale-105 transition-transform"
                    >
                      {LEVEL_5_WORD_WHEEL.centerLetter}
                    </button>

                    {/* Outer Letter Buttons */}
                    {LEVEL_5_WORD_WHEEL.outerLetters.map((letter, idx) => {
                      const angle = (idx * 360) / LEVEL_5_WORD_WHEEL.outerLetters.length;
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

            {/* LEVEL 6: FILL-IN-THE-BLANK PROVERBS */}
            {activeLevel === 6 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 6: Fill-in-the-Blank Proverbs</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Completed: {solvedProverbs.length} / {LEVEL_6_PROVERBS.length}
                  </span>
                </div>

                {currentProverbIdx < LEVEL_6_PROVERBS.length && (
                  <div className="max-w-lg mx-auto text-center space-y-5 py-4">
                    <p className="text-base sm:text-lg font-black text-[#032109]">
                      &ldquo;{LEVEL_6_PROVERBS[currentProverbIdx].phrase}&rdquo;
                    </p>

                    <div className="flex justify-center gap-3">
                      {LEVEL_6_PROVERBS[currentProverbIdx].options.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleProverbSelect(opt, LEVEL_6_PROVERBS[currentProverbIdx])}
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

            {/* LEVEL 7: RHYMING PAIRS */}
            {activeLevel === 7 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 7: Rhyming Pairs</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Pairs Matched: {solvedRhymes.length} / {LEVEL_7_RHYMES.length}
                  </span>
                </div>

                {currentRhymeIdx < LEVEL_7_RHYMES.length && (
                  <div className="max-w-md mx-auto text-center space-y-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-[#40493d]">Find the word that rhymes with:</span>
                      <button
                        type="button"
                        onClick={() => speakText(LEVEL_7_RHYMES[currentRhymeIdx].targetWord)}
                        className="px-3 py-1 rounded-full bg-[#d9fdd6] text-[#006e1c] text-xs font-extrabold border border-[#cdf2cb] flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">volume_up</span>
                        <span>Listen</span>
                      </button>
                    </div>

                    <h3 className="text-3xl font-black text-[#006e1c]">
                      {LEVEL_7_RHYMES[currentRhymeIdx].targetWord}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {LEVEL_7_RHYMES[currentRhymeIdx].options.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleRhymeSelect(opt, LEVEL_7_RHYMES[currentRhymeIdx])}
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

            {/* LEVEL 8: CATEGORY ASSOCIATION */}
            {activeLevel === 8 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 8: Category Association</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Categorized: {Object.keys(categorizedItems).length} / {LEVEL_8_CATEGORIES.items.length}
                  </span>
                </div>
                <p className="text-xs text-[#40493d]">Classify each item into Fruits or Veggies:</p>

                <div className="space-y-3 max-w-xl mx-auto">
                  {LEVEL_8_CATEGORIES.items.map(item => {
                    const assigned = categorizedItems[item.id];
                    return (
                      <div key={item.id} className="p-3.5 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#032109]">{item.label}</span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCategoryAssign(item.id, 'fruits', item.category)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                              assigned === 'fruits'
                                ? 'bg-[#006e1c] text-white border-[#006e1c]'
                                : 'bg-white text-[#032109] border-[#cdf2cb] hover:border-[#006e1c]'
                            }`}
                          >
                            🍎 Fruit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCategoryAssign(item.id, 'veggies', item.category)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                              assigned === 'veggies'
                                ? 'bg-[#006e1c] text-white border-[#006e1c]'
                                : 'bg-white text-[#032109] border-[#cdf2cb] hover:border-[#006e1c]'
                            }`}
                          >
                            🥕 Veggie
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 9: HANGMAN-STYLE VOCABULARY */}
            {activeLevel === 9 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 9: Vocabulary Discovery</h2>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-red-600">
                    {Array.from({ length: hangmanAttemptsLeft }).map((_, i) => (
                      <span key={i}>❤️</span>
                    ))}
                    <span className="text-gray-500 ml-1">({hangmanAttemptsLeft} attempts)</span>
                  </div>
                </div>

                <p className="text-xs text-[#40493d] text-center">Clue: {LEVEL_9_HANGMAN.clue}</p>

                {/* Mystery Word Slots */}
                <div className="flex justify-center gap-2 py-4">
                  {LEVEL_9_HANGMAN.word.split('').map((char, idx) => {
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

            {/* LEVEL 10: MIXED COGNITIVE MASTER */}
            {activeLevel === 10 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#cdf2cb] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#032109]">Level 10: Mixed Cognitive Master</h2>
                  <span className="text-xs font-bold text-[#006e1c]">
                    Step {challengeStep + 1} of {LEVEL_10_CHALLENGES.length}
                  </span>
                </div>

                {challengeStep < LEVEL_10_CHALLENGES.length && (
                  <div className="max-w-md mx-auto text-center space-y-5 py-4">
                    <span className="text-[11px] font-extrabold uppercase text-[#006e1c] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                      {LEVEL_10_CHALLENGES[challengeStep].type} challenge
                    </span>
                    <h3 className="text-lg font-extrabold text-[#032109]">
                      {LEVEL_10_CHALLENGES[challengeStep].question}
                    </h3>

                    <div className="flex flex-col gap-2.5">
                      {LEVEL_10_CHALLENGES[challengeStep].options.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleChallengeAnswer(opt, LEVEL_10_CHALLENGES[challengeStep].answer)}
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
