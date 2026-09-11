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
import { doc, onSnapshot } from 'firebase/firestore';
import {
  COGNITIVE_LEVELS,
  SUBLEVEL_CONFIGS,
  getSublevelConfig,
  getRandomPuzzle,
} from '../../data/gameQuestionBank.js';
import { recordSublevelCompletion } from '../../lib/gameProgression.js';

function resolveElderAndCaregiver() {
  let elderId = null;
  let caregiverEmail = null;
  let caregiverName = null;
  let startingLevel = 1;
  let unlockedLevel = 1;
  let currentSublevel = 1;
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
      if (stored.currentSublevel) currentSublevel = Number(stored.currentSublevel);
      if (stored.startingLevel) startingLevel = Number(stored.startingLevel);
      if (stored.aiAnalysis) aiAnalysis = stored.aiAnalysis;
    } else if (stored?.role === 'caregiver') {
      elderId = stored.linkedElder?.phone || stored.linkedElder?.id || stored.linkedElder?.email;
      caregiverEmail = stored.email || null;
      caregiverName = stored.name || null;
      elderName = stored.linkedElder?.name || elderName;
      if (stored.linkedElder?.unlockedLevel) unlockedLevel = Number(stored.linkedElder.unlockedLevel);
      if (stored.linkedElder?.currentSublevel) currentSublevel = Number(stored.linkedElder.currentSublevel);
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
        if (storedPatient.currentSublevel) currentSublevel = Number(storedPatient.currentSublevel);
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
    if (p?.currentSublevel) currentSublevel = Number(p.currentSublevel);
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
    currentSublevel: Math.max(1, Math.min(5, currentSublevel)),
    aiAnalysis,
  };
}

export default function ProgressiveCognitiveSuitePage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Navigation & Level Progression State
  const [viewMode, setViewMode] = useState('hub'); // 'hub' | 'game'
  const [activeLevel, setActiveLevel] = useState(1);
  const [activeSublevel, setActiveSublevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [currentSublevel, setCurrentSublevel] = useState(1);
  const [startingLevel, setStartingLevel] = useState(1);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [elderName, setElderName] = useState('Elder');

  // Sublevel Selection Drawer / Modal State
  const [isSublevelModalOpen, setIsSublevelModalOpen] = useState(false);
  const [selectedMainLevel, setSelectedMainLevel] = useState(1);

  // Daily Score & Session Sync State (+10 pts per sublevel)
  const [todayScore, setTodayScore] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Active Timer & Completion Modal State
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerMax, setTimerMax] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [victoryDetails, setVictoryDetails] = useState(null);

  const isRecordingRef = useRef(false);
  const timerRef = useRef(null);

  // -------------------------------------------------------------
  // DYNAMIC LEVEL SPECIFIC GAMEPLAY STATES (Randomized from 50+ Banks)
  // -------------------------------------------------------------

  // Level 1: Memory Match
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);

  // Level 2: Word Search
  const [activeWordSearchL2, setActiveWordSearchL2] = useState(null);
  const [foundWordsL2, setFoundWordsL2] = useState([]);
  const [selectedCellsL2, setSelectedCellsL2] = useState([]);
  const [isDraggingL2, setIsDraggingL2] = useState(false);
  const [dragStartCellL2, setDragStartCellL2] = useState(null);

  // Level 3: Quick Crossword
  const [activeCrosswordL3, setActiveCrosswordL3] = useState(null);
  const [crosswordAnswers, setCrosswordAnswers] = useState({});

  // Level 4: Anagrams / Unscramble
  const [activeAnagramsL4, setActiveAnagramsL4] = useState([]);
  const [currentAnagramIdx, setCurrentAnagramIdx] = useState(0);
  const [assembledLetters, setAssembledLetters] = useState([]);
  const [solvedAnagrams, setSolvedAnagrams] = useState([]);

  // Level 5: Word Wheel
  const [activeWheelL5, setActiveWheelL5] = useState(null);
  const [wheelWordsFound, setWheelWordsFound] = useState([]);
  const [currentWheelWord, setCurrentWheelWord] = useState('');

  // Level 6: Fill-in-the-Blank Proverbs
  const [activeProverbsL6, setActiveProverbsL6] = useState([]);
  const [currentProverbIdx, setCurrentProverbIdx] = useState(0);
  const [solvedProverbs, setSolvedProverbs] = useState([]);

  // Level 7: Rhyming Pairs
  const [activeRhymesL7, setActiveRhymesL7] = useState([]);
  const [currentRhymeIdx, setCurrentRhymeIdx] = useState(0);
  const [solvedRhymes, setSolvedRhymes] = useState([]);

  // Level 8: Category Sorting
  const [activeCategoryL8, setActiveCategoryL8] = useState(null);
  const [categorizedItems, setCategorizedItems] = useState({});

  // Level 9: Hangman Vocabulary
  const [activeHangmanL9, setActiveHangmanL9] = useState(null);
  const [hangmanGuessed, setHangmanGuessed] = useState([]);
  const [hangmanAttemptsLeft, setHangmanAttemptsLeft] = useState(7);

  // Level 10: Mixed Cognitive Master
  const [activeChallengesL10, setActiveChallengesL10] = useState([]);
  const [challengeStep, setChallengeStep] = useState(0);

  // -------------------------------------------------------------
  // 1. Initial State Sync & Real-Time Listeners
  // -------------------------------------------------------------
  useEffect(() => {
    const resolved = resolveElderAndCaregiver();
    setElderName(resolved.elderName);
    setStartingLevel(resolved.startingLevel);
    setUnlockedLevel(resolved.unlockedLevel);
    setCurrentSublevel(resolved.currentSublevel);
    if (resolved.aiAnalysis) setAiAnalysis(resolved.aiAnalysis);

    const { cleanElderId, elderId, caregiverEmail } = resolved;
    const todayDate = getTodayDateString();

    // 1. Fetch initial state & scores from Server DB
    fetch(`/api/game-scores?elderId=${encodeURIComponent(elderId || '')}&caregiverEmail=${encodeURIComponent(caregiverEmail || '')}&date=${encodeURIComponent(todayDate)}`)
      .then(r => r.json())
      .then(sData => {
        setIsLoadingSession(false);
        if (sData?.success) {
          const unLvl = Number(sData.unlockedLevel || sData.analytics?.unlockedLevel);
          if (unLvl) {
            setUnlockedLevel(prev => Math.max(prev, unLvl));
          }
          if (sData.currentSublevel || sData.analytics?.currentSublevel) {
            setCurrentSublevel(Number(sData.currentSublevel || sData.analytics?.currentSublevel));
          }
          if (sData.analytics) {
            const tScore = Number(sData.analytics.todayScore) || 0;
            const tSessions = Number(sData.analytics.todaySessions) || 0;
            setTodayScore(tScore);
            setTodaySessions(tSessions);
          }
        }
      })
      .catch(() => setIsLoadingSession(false));

    if (!db || !cleanElderId) return;

    // 2. Real-time Firestore Elder Doc Listener
    const elderDocRef = doc(db, 'elders', cleanElderId);
    const unsubElder = onSnapshot(elderDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data() || {};
        if (typeof d.unlockedLevel === 'number') {
          setUnlockedLevel(prev => Math.max(prev, d.unlockedLevel));
        }
        if (typeof d.currentSublevel === 'number') {
          setCurrentSublevel(d.currentSublevel);
        }
        if (typeof d.startingLevel === 'number') {
          setStartingLevel(d.startingLevel);
        }
        if (d.aiAnalysis) setAiAnalysis(d.aiAnalysis);
        if (d.name) setElderName(d.name);
      }
    }, (err) => console.warn('[GameHub] Elder snapshot notice:', err));

    // 3. Real-time Firestore DailyLog Listener
    const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
    const unsubDaily = onSnapshot(dailyLogRef, (snap) => {
      setIsLoadingSession(false);
      if (snap.exists()) {
        const data = snap.data() || {};
        const score = typeof data.todayScore === 'number' ? data.todayScore : (typeof data.totalScore === 'number' ? data.totalScore : 0);
        const sess = typeof data.todaySessions === 'number' ? data.todaySessions : (typeof data.completedSessions === 'number' ? data.completedSessions : 0);
        setTodayScore(score);
        setTodaySessions(sess);
      }
    }, () => setIsLoadingSession(false));

    return () => {
      unsubElder();
      unsubDaily();
    };
  }, []);

  // -------------------------------------------------------------
  // 2. Progressive Countdown Timer Loop
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

  // Timeout handler (no points awarded on expiration)
  const handleTimeUp = () => {
    if (roundCompleted || isTimedOut) return;
    setIsTimerRunning(false);
    setIsTimedOut(true);

    speakText('Time is up! Take a gentle breath. You can retry this sublevel anytime.');
    showToast("⏰ Time's up! No points awarded for incomplete sublevel. Tap retry to try again.", 'info', 5000);
  };

  // -------------------------------------------------------------
  // 3. Sublevel Victory & Atomic +10 Point Mutation
  // -------------------------------------------------------------
  const handleSublevelVictory = async (customAccuracy = 100) => {
    if (isRecordingRef.current || isTimedOut || roundCompleted) return;
    isRecordingRef.current = true;
    setIsTimerRunning(false);
    setRoundCompleted(true);

    const finalRemaining = timeLeft;
    const { cleanElderId, caregiverEmail } = resolveElderAndCaregiver();

    // Call Atomic Sublevel Persistence Engine (+10 points)
    const result = await recordSublevelCompletion(cleanElderId, activeLevel, activeSublevel, {
      accuracy: customAccuracy,
      moves: moves || 3,
      durationSeconds: timerMax - finalRemaining,
      remainingTimeSeconds: finalRemaining,
    }, caregiverEmail);

    const isMastered = activeSublevel === 5;
    const nextSub = isMastered ? 1 : activeSublevel + 1;
    const nextUnl = isMastered ? Math.min(10, activeLevel + 1) : unlockedLevel;

    if (isMastered) {
      setUnlockedLevel(prev => Math.max(prev, nextUnl));
      setCurrentSublevel(1);
    } else {
      setCurrentSublevel(prev => Math.max(prev, nextSub));
    }

    setTodayScore(prev => prev + 10);
    setTodaySessions(prev => prev + 1);

    setVictoryDetails({
      mainLevel: activeLevel,
      subLevel: activeSublevel,
      isMastered,
      nextSublevel: nextSub,
      nextUnlockedLevel: nextUnl,
      pointsAwarded: 10,
    });

    setIsVictoryModalOpen(true);

    if (isMastered) {
      speakText(`Magnificent! You completed Sublevel 5 and mastered Level ${activeLevel}! Level ${nextUnl} is now unlocked!`);
      showToast(`🏆 Level ${activeLevel} Mastered! Level ${nextUnl} Unlocked! +10 Points!`, 'success', 6000);
    } else {
      speakText(`Wonderful job! Sublevel ${activeSublevel} complete! You earned 10 points!`);
      showToast(`🎉 Sublevel ${activeSublevel}/5 Complete! +10 Points Awarded!`, 'success', 4000);
    }
  };

  // -------------------------------------------------------------
  // 4. Start Sublevel Round (Fetch from 50+ Question Bank)
  // -------------------------------------------------------------
  const handleStartSublevel = (mainLvl, subLvl) => {
    const lvlNum = Math.max(1, Math.min(10, Number(mainLvl) || 1));
    const subNum = Math.max(1, Math.min(5, Number(subLvl) || 1));
    const config = getSublevelConfig(lvlNum, subNum);

    setActiveLevel(lvlNum);
    setActiveSublevel(subNum);
    setTimerMax(config.timerSeconds);
    setTimeLeft(config.timerSeconds);
    setIsTimerRunning(true);
    setRoundCompleted(false);
    setIsTimedOut(false);
    isRecordingRef.current = false;
    setIsVictoryModalOpen(false);
    setIsSublevelModalOpen(false);

    // Fetch randomized puzzle variant from 50+ question bank
    const puzzleData = getRandomPuzzle(lvlNum, subNum);

    switch (lvlNum) {
      case 1:
        setCards(puzzleData.cards || []);
        setFlippedIndices([]);
        setMoves(0);
        break;
      case 2:
        setActiveWordSearchL2(puzzleData.puzzle);
        setFoundWordsL2([]);
        setSelectedCellsL2([]);
        setIsDraggingL2(false);
        break;
      case 3:
        setActiveCrosswordL3(puzzleData.puzzle);
        setCrosswordAnswers({});
        break;
      case 4:
        setActiveAnagramsL4(puzzleData.puzzles || []);
        setCurrentAnagramIdx(0);
        setAssembledLetters([]);
        setSolvedAnagrams([]);
        break;
      case 5:
        setActiveWheelL5(puzzleData.puzzle);
        setWheelWordsFound([]);
        setCurrentWheelWord('');
        break;
      case 6:
        setActiveProverbsL6(puzzleData.puzzles || []);
        setCurrentProverbIdx(0);
        setSolvedProverbs([]);
        break;
      case 7:
        setActiveRhymesL7(puzzleData.puzzles || []);
        setCurrentRhymeIdx(0);
        setSolvedRhymes([]);
        break;
      case 8:
        setActiveCategoryL8(puzzleData.puzzle);
        setCategorizedItems({});
        break;
      case 9:
        setActiveHangmanL9(puzzleData.puzzle);
        setHangmanGuessed([]);
        setHangmanAttemptsLeft(config.maxAttempts || 7);
        break;
      case 10:
        setActiveChallengesL10(puzzleData.puzzles || []);
        setChallengeStep(0);
        break;
      default:
        break;
    }

    setViewMode('game');

    // Spoken Audio Introduction
    const levelMeta = COGNITIVE_LEVELS.find(l => l.level === lvlNum);
    speakText(`Level ${lvlNum}, Sublevel ${subNum}: ${config.name}. ${config.desc}`);
  };

  // Open Sublevel Selection Modal from Hub
  const handleOpenSublevelSelect = (mainLvl) => {
    setSelectedMainLevel(mainLvl);
    setIsSublevelModalOpen(true);
  };

  // -------------------------------------------------------------
  // 5. Game Interactions for All 10 Cognitive Modes
  // -------------------------------------------------------------

  // Level 1: Memory Match Flip
  const handleCardClick = (index) => {
    if (isTimedOut || roundCompleted || flippedIndices.length === 2) return;
    if (cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        newCards[firstIdx].matched = true;
        newCards[secondIdx].matched = true;
        setCards(newCards);
        setFlippedIndices([]);

        const allMatched = newCards.every(c => c.matched);
        if (allMatched) {
          handleSublevelVictory(100);
        }
      } else {
        setTimeout(() => {
          newCards[firstIdx].flipped = false;
          newCards[secondIdx].flipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  // Level 2: Word Search Dragging & Word Finding
  const handleCellMouseDown = (r, c) => {
    if (isTimedOut || roundCompleted) return;
    setIsDraggingL2(true);
    setDragStartCellL2({ r, c });
    setSelectedCellsL2([{ r, c }]);
  };

  const handleCellMouseEnter = (r, c) => {
    if (!isDraggingL2 || isTimedOut || roundCompleted || !dragStartCellL2) return;
    const startR = dragStartCellL2.r;
    const startC = dragStartCellL2.c;
    const cells = [];
    const minR = Math.min(startR, r);
    const maxR = Math.max(startR, r);
    const minC = Math.min(startC, c);
    const maxC = Math.max(startC, c);

    if (startR === r) {
      for (let currC = minC; currC <= maxC; currC++) cells.push({ r, c: currC });
    } else if (startC === c) {
      for (let currR = minR; currR <= maxR; currR++) cells.push({ r: currR, c });
    } else {
      cells.push({ r, c });
    }
    setSelectedCellsL2(cells);
  };

  const handleCellMouseUp = () => {
    if (!isDraggingL2 || isTimedOut || roundCompleted || !activeWordSearchL2) {
      setIsDraggingL2(false);
      setSelectedCellsL2([]);
      return;
    }
    setIsDraggingL2(false);

    const formed = selectedCellsL2.map(cell => activeWordSearchL2.grid[cell.r]?.[cell.c] || '').join('');
    const targetWords = activeWordSearchL2.words || [];
    const matched = targetWords.find(w => w.toUpperCase() === formed.toUpperCase() && !foundWordsL2.includes(w.toUpperCase()));

    if (matched) {
      const nextFound = [...foundWordsL2, matched.toUpperCase()];
      setFoundWordsL2(nextFound);
      showToast(`Found word: ${matched}!`, 'success', 2000);
      speakText(`Found: ${matched}!`);

      const config = getSublevelConfig(2, activeSublevel);
      const targetCount = config.wordsToFind || targetWords.length;
      if (nextFound.length >= targetCount) {
        handleSublevelVictory(100);
      }
    }
    setSelectedCellsL2([]);
  };

  // Level 3: Crossword Answer Change
  const handleCrosswordChange = (clueId, val) => {
    if (isTimedOut || roundCompleted || !activeCrosswordL3) return;
    const clean = val.toUpperCase().slice(0, 10);
    const nextAnswers = { ...crosswordAnswers, [clueId]: clean };
    setCrosswordAnswers(nextAnswers);

    const clues = activeCrosswordL3.clues || [];
    const allSolved = clues.every(c => (nextAnswers[c.id] || '').toUpperCase() === c.answer.toUpperCase());
    if (allSolved) {
      handleSublevelVictory(100);
    }
  };

  // Level 4: Anagram Letter Click
  const handleAnagramTileClick = (letter, tileIdx) => {
    if (isTimedOut || roundCompleted) return;
    const nextAssembled = [...assembledLetters, { letter, tileIdx }];
    setAssembledLetters(nextAssembled);

    const cur = activeAnagramsL4[currentAnagramIdx];
    if (!cur) return;
    const formed = nextAssembled.map(a => a.letter).join('');

    if (formed.length === cur.targetWord.length) {
      if (formed.toUpperCase() === cur.targetWord.toUpperCase()) {
        speakText(`Correct: ${cur.targetWord}!`);
        showToast(`Unscrambled: ${cur.targetWord}!`, 'success', 2000);
        const nextSolved = [...solvedAnagrams, cur.id];
        setSolvedAnagrams(nextSolved);
        setAssembledLetters([]);

        if (nextSolved.length >= activeAnagramsL4.length) {
          handleSublevelVictory(100);
        } else {
          setCurrentAnagramIdx(prev => prev + 1);
        }
      } else {
        showToast('Gentle hint: Let us try arranging again!', 'info', 2000);
        setTimeout(() => setAssembledLetters([]), 600);
      }
    }
  };

  // Level 5: Word Wheel Submit
  const handleWheelLetterTap = (letter) => {
    if (isTimedOut || roundCompleted) return;
    setCurrentWheelWord(prev => prev + letter);
  };

  const handleWheelSubmit = () => {
    if (isTimedOut || roundCompleted || !activeWheelL5) return;
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

      const config = getSublevelConfig(5, activeSublevel);
      const targetCount = config.targetCount || activeWheelL5.targetCount || 3;
      if (next.length >= targetCount) {
        handleSublevelVictory(100);
      }
    } else {
      showToast(`Must contain '${activeWheelL5.centerLetter}' and form a valid word.`, 'error', 2500);
      setCurrentWheelWord('');
    }
  };

  // Level 6: Proverb Select
  const handleProverbSelect = (option, currentP) => {
    if (isTimedOut || roundCompleted) return;
    if (option === currentP.answer) {
      speakText(`Correct: ${option}!`);
      showToast(`Correct! ${currentP.explanation}`, 'success', 2500);
      const nextSolved = [...solvedProverbs, currentP.id];
      setSolvedProverbs(nextSolved);

      if (nextSolved.length >= activeProverbsL6.length) {
        handleSublevelVictory(100);
      } else {
        setCurrentProverbIdx(prev => prev + 1);
      }
    } else {
      showToast('Gentle hint: Try another uplifting choice.', 'info', 2000);
    }
  };

  // Level 7: Rhyme Select
  const handleRhymeSelect = (option, currentR) => {
    if (isTimedOut || roundCompleted) return;
    if (option === currentR.correct) {
      speakText(`Wonderful! ${option} rhymes with ${currentR.targetWord}!`);
      showToast(`Correct! ${option} rhymes with ${currentR.targetWord}`, 'success', 2000);
      const nextSolved = [...solvedRhymes, currentR.id];
      setSolvedRhymes(nextSolved);

      if (nextSolved.length >= activeRhymesL7.length) {
        handleSublevelVictory(100);
      } else {
        setCurrentRhymeIdx(prev => prev + 1);
      }
    } else {
      showToast('Listen carefully: That does not quite rhyme. Try again!', 'info', 2000);
    }
  };

  // Level 8: Category Assign
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

    if (Object.keys(next).length >= (activeCategoryL8?.items?.length || 4)) {
      handleSublevelVictory(100);
    }
  };

  // Level 9: Hangman Guess
  const handleHangmanGuess = (letter) => {
    if (isTimedOut || roundCompleted || hangmanGuessed.includes(letter) || !activeHangmanL9) return;
    const nextGuessed = [...hangmanGuessed, letter];
    setHangmanGuessed(nextGuessed);

    if (activeHangmanL9.word.toUpperCase().includes(letter.toUpperCase())) {
      speakText(`Letter ${letter} found!`);
      const allFound = activeHangmanL9.word.toUpperCase().split('').every(l => nextGuessed.includes(l));
      if (allFound) {
        handleSublevelVictory(100);
      }
    } else {
      const nextLeft = hangmanAttemptsLeft - 1;
      setHangmanAttemptsLeft(nextLeft);
      if (nextLeft <= 0) {
        handleTimeUp();
      }
    }
  };

  // Level 10: Mixed Logic Challenge Answer
  const handleChallengeAnswer = (chosen, correct) => {
    if (isTimedOut || roundCompleted) return;
    if (chosen === correct) {
      speakText(`Mastered: ${chosen}!`);
      showToast('Correct logic deduction!', 'success', 2000);
      const nextStep = challengeStep + 1;
      setChallengeStep(nextStep);

      if (nextStep >= activeChallengesL10.length) {
        handleSublevelVictory(100);
      }
    } else {
      showToast('Take your time and examine the relationship.', 'info', 2500);
    }
  };

  // Current active sublevel config
  const activeSubConfig = getSublevelConfig(activeLevel, activeSublevel);
  const selectedLevelMeta = COGNITIVE_LEVELS.find(l => l.level === selectedMainLevel) || COGNITIVE_LEVELS[0];
  const selectedSublevels = SUBLEVEL_CONFIGS[selectedMainLevel] || SUBLEVEL_CONFIGS[1];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ebffe7] text-[#032109] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-28 space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* HUB VIEW: 10-LEVEL PROGRESSIVE COGNITIVE SUITE WITH 5 SUBLEVELS */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'hub' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Hub Banner & Today's Sync Badge */}
            <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#006e1c] bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                    Cognitive Progression Suite · 10 Levels & 50 Progressive Sublevels
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
                  Each main level contains <strong>5 progressive sublevels</strong> (+10 points each). Puzzles are randomized from our curated bank of 50+ challenges per game type!
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
                  <span className="text-[11px] font-bold text-[#40493d] block">Today&apos;s Score</span>
                  <span className="text-3xl font-black text-[#006e1c]">{todayScore} <span className="text-xs font-bold text-[#40493d]">pts</span></span>
                  <span className="text-[10px] text-[#0d631b] font-semibold block">+10 pts per Sublevel</span>
                </div>
                <div className="border-t border-[#cdf2cb] sm:pt-2">
                  <span className="text-[11px] font-bold text-[#40493d] block">Completed Stages</span>
                  <span className="text-xl font-black text-[#032109]">{todaySessions} Sublevels</span>
                </div>
              </div>
            </div>

            {/* Grid of 10 Progressive Cognitive Level Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {COGNITIVE_LEVELS.map((lvl) => {
                const isUnlocked = lvl.level <= unlockedLevel;
                const isCurrent = lvl.level === unlockedLevel;
                const isAiBaseline = aiAnalysis && lvl.level === startingLevel;
                const activeSub = isCurrent ? currentSublevel : (lvl.level < unlockedLevel ? 5 : 1);

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

                      {/* Title & Sublevel Indicator */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`material-symbols-outlined text-xl ${isUnlocked ? 'text-[#0d631b]' : 'text-gray-400'}`}>
                          {lvl.icon}
                        </span>
                        <h3 className="text-base font-extrabold text-[#032109]">
                          {lvl.title}
                        </h3>
                      </div>
                      <p className="text-xs font-semibold text-[#0d631b] mb-1.5">{lvl.subtitle}</p>
                      <p className="text-xs text-[#40493d] leading-relaxed mb-3">
                        {lvl.description}
                      </p>

                      {/* 5 Sublevel Progress Dots */}
                      {isUnlocked && (
                        <div className="mb-4 bg-[#ebffe7] p-2.5 rounded-xl border border-[#cdf2cb] flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#0d631b]">5 Sublevels (+10 pts ea):</span>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((subNum) => {
                              const isSubCompleted = lvl.level < unlockedLevel || (isCurrent && subNum < currentSublevel);
                              const isSubActive = isCurrent && subNum === currentSublevel;
                              return (
                                <span
                                  key={subNum}
                                  title={`Sublevel ${subNum}/5`}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                                    isSubCompleted
                                      ? 'bg-[#006e1c] text-white'
                                      : isSubActive
                                      ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500/50'
                                      : 'bg-gray-200 text-gray-400'
                                  }`}
                                >
                                  {isSubCompleted ? '✓' : subNum}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button / Lock Status */}
                    <div className="pt-2 border-t border-[#cdf2cb]/60">
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleOpenSublevelSelect(lvl.level)}
                          className="w-full btn-tactile py-2.5 px-4 rounded-xl text-xs font-extrabold shadow-sm bg-[#006e1c] hover:bg-[#0d631b] text-white flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">play_arrow</span>
                          <span>Select Sublevel (1–5)</span>
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
        {/* SUBLEVEL SELECTION MODAL (5 Progressive Stages per Level)     */}
        {/* ------------------------------------------------------------- */}
        {isSublevelModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border-2 border-[#cdf2cb] space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 border-b border-[#cdf2cb] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-[#006e1c] text-white flex items-center justify-center font-black text-lg shadow-sm">
                    L{selectedMainLevel}
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-[#032109]">{selectedLevelMeta.title}</h2>
                    <p className="text-xs text-[#40493d]">{selectedLevelMeta.category} • Choose your sublevel challenge</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSublevelModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* 5 Sublevel Stage Cards */}
              <div className="space-y-3">
                {selectedSublevels.map((sub) => {
                  const isLevelUnlocked = selectedMainLevel <= unlockedLevel;
                  const isMainCurrent = selectedMainLevel === unlockedLevel;
                  const isSublevelUnlocked = isLevelUnlocked && (selectedMainLevel < unlockedLevel || sub.subLevel <= currentSublevel);
                  const isSublevelCompleted = isLevelUnlocked && (selectedMainLevel < unlockedLevel || sub.subLevel < currentSublevel);

                  return (
                    <div
                      key={sub.subLevel}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSublevelUnlocked
                          ? 'bg-[#ebffe7] border-[#006e1c] shadow-xs'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isSublevelCompleted
                            ? 'bg-[#006e1c] text-white'
                            : isSublevelUnlocked
                            ? 'bg-amber-400 text-amber-950 font-black'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isSublevelCompleted ? '✓' : `S${sub.subLevel}`}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-[#032109]">
                              Sublevel {sub.subLevel}: {sub.name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d9fdd6] text-[#006e1c]">
                              +10 pts
                            </span>
                          </div>
                          <p className="text-xs text-[#40493d] mt-0.5">{sub.desc}</p>
                          <span className="text-[10px] text-[#0d631b] font-semibold">⏱ {sub.timerSeconds}s Timer • {sub.difficulty}</span>
                        </div>
                      </div>

                      {isSublevelUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleStartSublevel(selectedMainLevel, sub.subLevel)}
                          className="btn-tactile px-4 py-2 rounded-xl bg-[#006e1c] hover:bg-[#0d631b] text-white text-xs font-extrabold shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          <span>{isSublevelCompleted ? 'Replay' : 'Play'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-sm">lock</span>
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* GAMEPLAY VIEW: ACTIVE SUBLEVEL RUNNER                         */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'game' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header: Back Button, Timer, Sublevel Progress */}
            <div className="card-tactile bg-white rounded-3xl p-4 sm:p-5 shadow-md border border-[#cdf2cb] flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setViewMode('hub')}
                className="btn-tactile px-3.5 py-2 rounded-xl bg-[#ebffe7] hover:bg-[#d9fdd6] text-[#006e1c] text-xs font-extrabold flex items-center gap-1 border border-[#cdf2cb] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Exit to Hub</span>
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-[#032109]">
                    Level {activeLevel} • Sublevel {activeSublevel}/5: {activeSubConfig.name}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#d9fdd6] text-[#006e1c] border border-[#cdf2cb]">
                    +10 pts
                  </span>
                </div>
                <p className="text-xs text-[#40493d] mt-0.5">{activeSubConfig.desc}</p>
              </div>

              {/* Countdown Timer Badge */}
              <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border-2 font-black text-sm sm:text-base ${
                timeLeft <= 10 ? 'bg-red-100 text-red-700 border-red-400 animate-pulse' : 'bg-[#d9fdd6] text-[#006e1c] border-[#cdf2cb]'
              }`}>
                <span className="material-symbols-outlined text-xl">timer</span>
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* LEVEL 1: Memory Match */}
            {activeLevel === 1 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center">
                <p className="text-xs sm:text-sm text-[#40493d]">
                  Tap cards to reveal pairs. Moves made: <strong>{moves}</strong>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto">
                  {cards.map((card, idx) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleCardClick(idx)}
                      className={`h-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer ${
                        card.flipped || card.matched
                          ? 'bg-[#d9fdd6] border-[#006e1c] shadow-sm rotate-0'
                          : 'bg-emerald-800 text-white border-emerald-900 shadow-md hover:bg-emerald-700'
                      }`}
                    >
                      {card.flipped || card.matched ? (
                        <>
                          <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#0d631b] mb-1">
                            {card.icon || 'star'}
                          </span>
                          <span className="text-xs font-black text-[#032109] line-clamp-1">{card.title}</span>
                        </>
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-emerald-200">spa</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LEVEL 2: Word Search */}
            {activeLevel === 2 && activeWordSearchL2 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center select-none">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#40493d]">Find Words:</span>
                  {activeWordSearchL2.words.map((w, i) => (
                    <span
                      key={i}
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        foundWordsL2.includes(w.toUpperCase())
                          ? 'bg-[#006e1c] text-white border-[#006e1c] line-through'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                      }`}
                    >
                      {w}
                    </span>
                  ))}
                </div>

                <div
                  className="inline-block p-3 rounded-2xl bg-teal-900/10 border-2 border-teal-600/30"
                  onMouseLeave={() => { if (isDraggingL2) handleCellMouseUp(); }}
                >
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                    {activeWordSearchL2.grid.map((row, rIdx) =>
                      row.map((letter, cIdx) => {
                        const isSelected = selectedCellsL2.some(c => c.r === rIdx && c.c === cIdx);
                        return (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            onMouseDown={() => handleCellMouseDown(rIdx, cIdx)}
                            onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx)}
                            onMouseUp={handleCellMouseUp}
                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-sm sm:text-base cursor-pointer border transition-all ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-105'
                                : 'bg-white text-teal-950 border-teal-200 hover:bg-teal-50'
                            }`}
                          >
                            {letter}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* LEVEL 3: Quick Crossword */}
            {activeLevel === 3 && activeCrosswordL3 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-4">
                <h3 className="text-sm font-extrabold text-[#032109]">Theme: {activeCrosswordL3.theme}</h3>
                <div className="space-y-3">
                  {activeCrosswordL3.clues.map((clue) => {
                    const ans = crosswordAnswers[clue.id] || '';
                    const isCorrect = ans.toUpperCase() === clue.answer.toUpperCase();
                    return (
                      <div key={clue.id} className="p-3.5 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-xs font-black text-[#006e1c] uppercase">{clue.id}. {clue.direction}</span>
                          <p className="text-xs font-bold text-[#032109] mt-0.5">{clue.clue}</p>
                        </div>
                        <input
                          type="text"
                          value={ans}
                          maxLength={clue.answer.length}
                          placeholder={`${clue.answer.length} letters`}
                          onChange={(e) => handleCrosswordChange(clue.id, e.target.value)}
                          className={`w-full sm:w-44 px-3 py-2 rounded-xl font-black text-sm tracking-widest uppercase border-2 outline-none ${
                            isCorrect ? 'bg-emerald-100 border-emerald-600 text-emerald-950' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 4: Word Unscramble (Anagrams) */}
            {activeLevel === 4 && activeAnagramsL4[currentAnagramIdx] && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center">
                <span className="text-xs font-black text-[#006e1c] px-3 py-1 rounded-full bg-[#d9fdd6] border border-[#cdf2cb]">
                  Word {currentAnagramIdx + 1} of {activeAnagramsL4.length}
                </span>
                <div>
                  <h3 className="text-lg font-black text-[#032109]">
                    Clue: {activeAnagramsL4[currentAnagramIdx].clue}
                  </h3>
                  <p className="text-xs text-[#40493d] mt-1">Tap the letters in the correct order:</p>
                </div>

                {/* Formed Word Preview */}
                <div className="min-h-[48px] flex items-center justify-center gap-2 p-2 bg-[#ebffe7] rounded-2xl border-2 border-dashed border-[#006e1c]">
                  {assembledLetters.map((item, i) => (
                    <span key={i} className="w-10 h-10 rounded-xl bg-[#006e1c] text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {item.letter}
                    </span>
                  ))}
                </div>

                {/* Scrambled Letter Tiles */}
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  {activeAnagramsL4[currentAnagramIdx].scrambled.split('').map((letter, idx) => {
                    const isUsed = assembledLetters.some(a => a.tileIdx === idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isUsed}
                        onClick={() => handleAnagramTileClick(letter, idx)}
                        className={`w-12 h-12 rounded-2xl font-black text-lg shadow-sm border-2 transition-all cursor-pointer ${
                          isUsed ? 'bg-gray-200 text-gray-400 border-gray-300 opacity-50 cursor-not-allowed' : 'bg-white text-[#032109] border-[#006e1c] hover:scale-105 active:scale-95'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 5: Word Wheel */}
            {activeLevel === 5 && activeWheelL5 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#40493d]">Words Found: {wheelWordsFound.length} / {activeSubConfig.targetCount || 3}</span>
                  <span className="text-xs font-black text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full">Center: {activeWheelL5.centerLetter}</span>
                </div>

                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 min-h-[44px] flex items-center justify-center text-lg font-black tracking-widest text-indigo-950">
                  {currentWheelWord || 'Tap letters below...'}
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {[activeWheelL5.centerLetter, ...activeWheelL5.outerLetters].map((l, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleWheelLetterTap(l)}
                      className={`w-12 h-12 rounded-2xl font-black text-lg border-2 shadow-sm transition-all cursor-pointer ${
                        l === activeWheelL5.centerLetter ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-950 border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentWheelWord('')}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleWheelSubmit}
                    className="btn-tactile px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md cursor-pointer"
                  >
                    Submit Word
                  </button>
                </div>
              </div>
            )}

            {/* LEVEL 6: Fill-in-the-Blank Proverbs */}
            {activeLevel === 6 && activeProverbsL6[currentProverbIdx] && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center">
                <span className="text-xs font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
                  Proverb {currentProverbIdx + 1} of {activeProverbsL6.length}
                </span>
                <h3 className="text-lg font-black text-[#032109] max-w-lg mx-auto">
                  &ldquo;{activeProverbsL6[currentProverbIdx].sentence}&rdquo;
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                  {activeProverbsL6[currentProverbIdx].options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleProverbSelect(opt, activeProverbsL6[currentProverbIdx])}
                      className="btn-tactile p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-black text-sm border-2 border-purple-200 shadow-xs cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LEVEL 7: Rhyming Pairs */}
            {activeLevel === 7 && activeRhymesL7[currentRhymeIdx] && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center">
                <span className="text-xs font-black text-pink-900 bg-pink-100 px-3 py-1 rounded-full">
                  Rhyme Challenge {currentRhymeIdx + 1} of {activeRhymesL7.length}
                </span>
                <h3 className="text-lg font-black text-[#032109]">
                  Which word rhymes with <span className="text-pink-700 underline">&ldquo;{activeRhymesL7[currentRhymeIdx].targetWord}&rdquo;</span>?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                  {activeRhymesL7[currentRhymeIdx].options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRhymeSelect(opt, activeRhymesL7[currentRhymeIdx])}
                      className="btn-tactile p-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-950 font-black text-sm border-2 border-pink-200 shadow-xs cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LEVEL 8: Category Sorting */}
            {activeLevel === 8 && activeCategoryL8 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center">
                <h3 className="text-sm font-black text-[#032109]">Sort each item into its correct natural category:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCategoryL8.categories.map((cat) => (
                    <div key={cat.key} className="p-4 rounded-2xl bg-[#ebffe7] border-2 border-[#006e1c]/40 space-y-3">
                      <h4 className="text-sm font-black text-[#006e1c]">{cat.name}</h4>
                      <div className="min-h-[90px] p-2 bg-white rounded-xl border border-[#cdf2cb] flex flex-wrap gap-2 items-center justify-center">
                        {Object.entries(categorizedItems)
                          .filter(([_, assignedCat]) => assignedCat === cat.key)
                          .map(([itemId]) => {
                            const itm = activeCategoryL8.items.find(i => i.id === itemId);
                            return (
                              <span key={itemId} className="px-2.5 py-1 rounded-lg bg-[#006e1c] text-white text-xs font-black">
                                {itm?.name || itemId}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Items Pool to Sort */}
                <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                  {activeCategoryL8.items
                    .filter(itm => !categorizedItems[itm.id])
                    .map((itm) => (
                      <div key={itm.id} className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-center gap-2">
                        <span className="text-xs font-black text-[#032109]">{itm.name}</span>
                        <div className="flex gap-1">
                          {activeCategoryL8.categories.map(cat => (
                            <button
                              key={cat.key}
                              type="button"
                              onClick={() => handleCategoryAssign(itm.id, cat.key, itm.correctCategory)}
                              className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* LEVEL 9: Hangman Vocabulary */}
            {activeLevel === 9 && activeHangmanL9 && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#40493d]">Attempts Left: <strong>{hangmanAttemptsLeft}</strong></span>
                  <span className="text-xs font-bold text-orange-800 bg-orange-100 px-3 py-1 rounded-full">Hint: {activeHangmanL9.hint}</span>
                </div>

                <div className="flex items-center justify-center gap-2 py-4">
                  {activeHangmanL9.word.toUpperCase().split('').map((l, i) => (
                    <span
                      key={i}
                      className="w-10 h-12 rounded-xl border-b-4 border-[#006e1c] bg-[#ebffe7] flex items-center justify-center text-xl font-black text-[#032109]"
                    >
                      {hangmanGuessed.includes(l) ? l : '_'}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-md mx-auto">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => {
                    const isGuessed = hangmanGuessed.includes(char);
                    return (
                      <button
                        key={char}
                        type="button"
                        disabled={isGuessed}
                        onClick={() => handleHangmanGuess(char)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          isGuessed ? 'bg-gray-200 text-gray-400 opacity-40 cursor-not-allowed' : 'bg-white text-orange-950 border border-orange-300 hover:bg-orange-100 cursor-pointer'
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 10: Mixed Cognitive Master */}
            {activeLevel === 10 && activeChallengesL10[challengeStep] && (
              <div className="card-tactile bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-[#cdf2cb] space-y-5 text-center">
                <span className="text-xs font-black text-rose-900 bg-rose-100 px-3 py-1 rounded-full">
                  Step {challengeStep + 1} of {activeChallengesL10.length}
                </span>
                <h3 className="text-base font-black text-[#032109] max-w-md mx-auto">
                  {activeChallengesL10[challengeStep].question}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                  {activeChallengesL10[challengeStep].options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChallengeAnswer(opt, activeChallengesL10[challengeStep].answer)}
                      className="btn-tactile p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-950 font-black text-sm border-2 border-rose-200 shadow-xs cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBLEVEL VICTORY & LEVEL UNLOCK MODAL (+10 Points)            */}
        {/* ------------------------------------------------------------- */}
        {isVictoryModalOpen && victoryDetails && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border-4 border-[#006e1c] space-y-5 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-[#d9fdd6] text-[#006e1c] flex items-center justify-center mx-auto text-3xl font-black shadow-md animate-bounce">
                {victoryDetails.isMastered ? '🏆' : '⭐'}
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#006e1c] bg-[#d9fdd6] px-3 py-1 rounded-full">
                  +10 Points Awarded & Synced
                </span>
                <h2 className="text-2xl font-black text-[#032109] mt-2">
                  {victoryDetails.isMastered
                    ? `Level ${victoryDetails.mainLevel} Mastered!`
                    : `Sublevel ${victoryDetails.subLevel}/5 Cleared!`}
                </h2>
                <p className="text-xs text-[#40493d] mt-1">
                  {victoryDetails.isMastered
                    ? `Outstanding! You completed all 5 sublevels and unlocked Level ${victoryDetails.nextUnlockedLevel}!`
                    : `Great focus, ${elderName.split(' ')[0]} ji! 10 points added to today's cumulative score.`}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {victoryDetails.isMastered ? (
                  <button
                    type="button"
                    onClick={() => handleStartSublevel(victoryDetails.nextUnlockedLevel, 1)}
                    className="w-full btn-tactile py-3 px-4 rounded-2xl bg-[#006e1c] hover:bg-[#0d631b] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Play Level {victoryDetails.nextUnlockedLevel} (Sublevel 1)</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartSublevel(victoryDetails.mainLevel, victoryDetails.nextSublevel)}
                    className="w-full btn-tactile py-3 px-4 rounded-2xl bg-[#006e1c] hover:bg-[#0d631b] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Play Sublevel {victoryDetails.nextSublevel}/5</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setIsVictoryModalOpen(false); setViewMode('hub'); }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Return to Game Hub
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
