// -------------------------------------------------------------
// Sahara Cognitive Game Progression & Atomic Firestore Engine
// +10 Points per Sublevel, 5 Sublevels per Main Level
// -------------------------------------------------------------

import { doc, getDoc, setDoc, increment, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, normalizeElderId, getTodayDateString, logFirestoreOperation } from './firebaseClient.js';
import { dataStore } from '../services/dataStore.js';

/**
 * Initialize today's daily log document ONLY if it does not already exist.
 * Uses existence check + { merge: true } to guarantee that logging in/out
 * never overwrites existing scores, sessions, or routine progress.
 */
export const initializeDailyLog = async (elderId) => {
  if (!elderId) return;
  const cleanElderId = normalizeElderId(elderId);
  const today = getTodayDateString();

  if (!db || !cleanElderId) return;

  try {
    const elderRef = doc(db, 'elders', cleanElderId);
    const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', today);
    logFirestoreOperation('ElderPortal', 'INIT_CHECK', dailyLogRef.path);

    // Check both elder doc and daily log in parallel
    const [elderSnap, dailySnap] = await Promise.all([
      getDoc(elderRef),
      getDoc(dailyLogRef),
    ]);

    let existingMeds = [];
    let existingRoutines = [];

    if (elderSnap.exists()) {
      const elderData = elderSnap.data() || {};
      if (Array.isArray(elderData.medications) && elderData.medications.length > 0) {
        existingMeds = elderData.medications.map(m => ({
          ...m,
          taken: false,
          takenAt: null,
          completedAt: null,
          takenDate: null,
        }));
      }
      if (Array.isArray(elderData.routines) && elderData.routines.length > 0) {
        existingRoutines = elderData.routines.map(r => ({
          ...r,
          completed: false,
          completedAt: null,
        }));
      }

      // Ensure the elder master doc always has unlockedLevel and currentSublevel
      // Only set defaults if the fields are missing (never overwrite real progress)
      if (elderData.unlockedLevel === undefined || elderData.unlockedLevel === null) {
        setDoc(elderRef, {
          unlockedLevel: 1,
          currentSublevel: 1,
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});
      }
    } else {
      // Brand-new elder doc: initialize with Level 1 defaults
      setDoc(elderRef, {
        id: cleanElderId,
        unlockedLevel: 1,
        currentSublevel: 1,
        lastPlayedLevel: 1,
        lastPlayedSublevel: 1,
        todayGameScore: 0,
        todayGameSessions: 0,
        medications: [],
        routines: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }

    // If today's log already exists, preserve it completely - never overwrite!
    if (dailySnap.exists()) return;

    // Create fresh document ONLY if today's log does not already exist
    logFirestoreOperation('ElderPortal', 'WRITE_INIT', dailyLogRef.path);
    await setDoc(dailyLogRef, {
      date: today,
      todayScore: 0,
      todaySessions: 0,
      lastPlayedLevel: 1,
      lastPlayedSublevel: 1,
      medications: existingMeds,
      routines: existingRoutines,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('[gameProgression] initializeDailyLog notice:', err?.message);
  }
};


/**
 * Universal scoring mutation for all 10 Levels & Sublevels.
 * Atomically increments score (+10) in elders/{elderId}/dailyLogs/{YYYY-MM-DD}
 * and updates progression in elders/{elderId}.
 */
export const recordSublevelScore = async (elderId, mainLevel, subLevel, scoreData = {}, caregiverEmail = null) => {
  if (!elderId) {
    console.error('[gameProgression] CRITICAL: Missing elderId in recordSublevelScore!');
    return null;
  }

  const cleanElderId = normalizeElderId(elderId);
  if (!cleanElderId) {
    console.error('[gameProgression] CRITICAL: Could not normalize elderId:', elderId);
    return null;
  }

  const lvl = Math.max(1, Math.min(10, Number(mainLevel) || 1));
  const sub = Math.max(1, Math.min(5, Number(subLevel) || 1));
  const today = getTodayDateString();
  const timestamp = new Date().toISOString();

  const isLastSublevel = sub >= 5;
  const nextSublevel = isLastSublevel ? 1 : sub + 1;
  const nextUnlockedLevel = isLastSublevel ? Math.min(10, lvl + 1) : lvl;

  const sessionEntry = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    mainLevel: lvl,
    level: lvl,
    subLevel: sub,
    pointsEarned: 10,
    score: 10,
    accuracy: scoreData.accuracy !== undefined ? Number(scoreData.accuracy) : 100,
    moves: scoreData.moves || 0,
    durationSeconds: scoreData.durationSeconds || 30,
    remainingTimeSeconds: scoreData.remainingTimeSeconds || 0,
    status: `Sublevel ${sub}/5 Completed (+10 pts)`,
    completedAt: timestamp,
    timestamp,
  };

  // 1. Atomic Firestore Mutations
  if (db && cleanElderId) {
    try {
      const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', today);
      const elderRef = doc(db, 'elders', cleanElderId);

      // Log exact Firestore write path
      logFirestoreOperation('ElderPortal', 'WRITE_SUBLEVEL_SCORE', dailyLogRef.path, {
        points: 10,
        mainLevel: lvl,
        subLevel: sub,
        isMastered: isLastSublevel,
      });

      // 1. Atomically increment score (+10) in today's log
      await setDoc(dailyLogRef, {
        todayScore: increment(10),
        totalScore: increment(10),
        lastPlayedLevel: lvl,
        lastPlayedSublevel: sub,
        lastPlayedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sessionsHistory: arrayUnion(sessionEntry),
        gamesHistory: arrayUnion(sessionEntry),
      }, { merge: true });

      // 2. Unlock progress — read existing Firestore state first to prevent clobbering
      let existingUnlocked = 1;
      let existingCurrentSub = 1;
      let existingCurrentLevel = 1;
      try {
        const snap = await getDoc(elderRef);
        if (snap.exists()) {
          const d = snap.data() || {};
          existingUnlocked = Number(d.unlockedLevel) || 1;
          existingCurrentSub = Number(d.currentSublevel) || 1;
          existingCurrentLevel = Number(d.lastPlayedLevel) || 1;
        }
      } catch (e) {}

      if (isLastSublevel) {
        // When completing Sublevel 5, increment total sessions and unlock next level
        await setDoc(dailyLogRef, {
          todaySessions: increment(1),
          completedSessions: increment(1),
        }, { merge: true });

        // Only unlock next level if this level is >= existing unlocked level (prevents replay from resetting)
        const targetUnlocked = Math.max(existingUnlocked, Math.min(10, lvl + 1));
        // Only reset currentSublevel to 1 for the new unlocked level if we actually advanced
        const newCurrentSub = lvl >= existingCurrentLevel ? 1 : existingCurrentSub;

        await setDoc(elderRef, {
          unlockedLevel: targetUnlocked,
          currentSublevel: newCurrentSub,
          lastPlayedLevel: lvl,
          lastPlayedSublevel: sub,
          todayGameScore: increment(10),
          todayGameSessions: increment(1),
          lastActive: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        // Progress to next sublevel ONLY if this is the current active sublevel
        // (prevents replaying old sublevels from overwriting progress)
        const isOnCurrentLevel = lvl === existingCurrentLevel || lvl >= existingCurrentLevel;
        const isCurrentOrAheadSub = sub >= existingCurrentSub;
        const advanceSub = isOnCurrentLevel && isCurrentOrAheadSub
          ? Math.max(existingCurrentSub, sub + 1)
          : existingCurrentSub;

        await setDoc(elderRef, {
          currentSublevel: advanceSub,
          lastPlayedLevel: lvl,
          lastPlayedSublevel: sub,
          todayGameScore: increment(10),
          lastActive: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('[gameProgression] Firestore atomic write notice:', err?.message);
    }
  }

  // Broadcast to Real-Time Bridge for sub-second cross-window update
  try {
    fetch('/api/sync-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        elderId: cleanElderId,
        action: 'sublevel_score',
        data: {
          scoreAdded: 10,
          todaySessionsIncrement: isLastSublevel ? 1 : 0,
          mainLevel: lvl,
          subLevel: sub,
          unlockedLevel: nextUnlockedLevel,
          currentSublevel: nextSublevel,
          session: sessionEntry,
        },
      }),
    }).catch(() => {});
  } catch (e) {}

  // 2. Server API fallback persistence (/api/game-scores)
  try {
    fetch('/api/game-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        elderId: cleanElderId,
        caregiverEmail,
        level: lvl,
        mainLevel: lvl,
        subLevel: sub,
        currentSublevel: nextSublevel,
        unlockedLevel: nextUnlockedLevel,
        score: 10,
        pointsEarned: 10,
        moves: scoreData.moves || 3,
        accuracy: scoreData.accuracy !== undefined ? scoreData.accuracy : 100,
        durationSeconds: scoreData.durationSeconds || 30,
        remainingTimeSeconds: scoreData.remainingTimeSeconds || 0,
        status: `Sublevel ${sub}/5 Completed (+10 pts)`,
        date: today,
        timestamp,
      }),
    }).catch(() => {});
  } catch (e) {}

  // 3. Local Storage Sync (Safe Session Preservation)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const activeUser = JSON.parse(localStorage.getItem('sahara_active_user') || '{}');
      if (activeUser.role === 'elder' || !activeUser.role) {
        if (isLastSublevel) {
          activeUser.unlockedLevel = Math.max(Number(activeUser.unlockedLevel) || 1, nextUnlockedLevel);
          activeUser.currentSublevel = 1;
        } else {
          activeUser.currentSublevel = Math.max(Number(activeUser.currentSublevel) || 1, nextSublevel);
        }
        localStorage.setItem('sahara_active_user', JSON.stringify(activeUser));
      } else if (activeUser.role === 'caregiver' && activeUser.linkedElder) {
        if (isLastSublevel) {
          activeUser.linkedElder.unlockedLevel = Math.max(Number(activeUser.linkedElder.unlockedLevel) || 1, nextUnlockedLevel);
          activeUser.linkedElder.currentSublevel = 1;
        } else {
          activeUser.linkedElder.currentSublevel = Math.max(Number(activeUser.linkedElder.currentSublevel) || 1, nextSublevel);
        }
        localStorage.setItem('sahara_active_user', JSON.stringify(activeUser));
      }

      const patientProfile = JSON.parse(localStorage.getItem('sahara_patient_profile') || '{}');
      if (patientProfile && typeof patientProfile === 'object') {
        if (isLastSublevel) {
          patientProfile.unlockedLevel = Math.max(Number(patientProfile.unlockedLevel) || 1, nextUnlockedLevel);
          patientProfile.currentSublevel = 1;
        } else {
          patientProfile.currentSublevel = Math.max(Number(patientProfile.currentSublevel) || 1, nextSublevel);
        }
        localStorage.setItem('sahara_patient_profile', JSON.stringify(patientProfile));
      }
    }
  } catch (e) {}

  // 4. Update DataStore & Broadcast Event
  try {
    if (dataStore) {
      dataStore.recordGameScore?.({
        score: 10,
        pointsEarned: 10,
        level: lvl,
        mainLevel: lvl,
        subLevel: sub,
        currentSublevel: nextSublevel,
        unlockedLevel: nextUnlockedLevel,
        date: today,
        elderId: cleanElderId,
        caregiverEmail,
        status: `Sublevel ${sub}/5 Completed (+10 pts)`,
        skipServerPersist: true,
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahara:game-score-change', {
        detail: {
          score: sessionEntry,
          mainLevel: lvl,
          subLevel: sub,
          currentSublevel: nextSublevel,
          unlockedLevel: nextUnlockedLevel,
          pointsEarned: 10,
          elderId: cleanElderId,
          caregiverEmail,
        }
      }));
    }
  } catch (e) {}

  return {
    success: true,
    mainLevel: lvl,
    subLevel: sub,
    pointsAwarded: 10,
    nextSublevel,
    nextUnlockedLevel,
    isLevelMastered: isLastSublevel,
    sessionEntry,
  };
};

// Backward-compatible alias
export const recordSublevelCompletion = recordSublevelScore;
