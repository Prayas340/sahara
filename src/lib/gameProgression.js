// -------------------------------------------------------------
// Sahara Cognitive Game Progression & Atomic Firestore Engine
// +10 Points per Sublevel, 5 Sublevels per Main Level
// -------------------------------------------------------------

import { doc, getDoc, setDoc, increment, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, normalizeElderId, getTodayDateString } from './firebaseClient.js';
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
    const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', today);
    const snap = await getDoc(dailyLogRef);

    if (!snap.exists()) {
      // Create fresh document ONLY if today's log does not already exist
      await setDoc(dailyLogRef, {
        date: today,
        todayScore: 0,
        todaySessions: 0,
        lastPlayedLevel: 1,
        lastPlayedSublevel: 1,
        medications: [],
        routines: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
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
    console.error('Missing elderId in recordSublevelScore!');
    return null;
  }

  const cleanElderId = normalizeElderId(elderId);
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

      // 2. Unlock progress
      if (isLastSublevel) {
        // When completing Sublevel 5, increment total sessions and unlock next level
        await setDoc(dailyLogRef, {
          todaySessions: increment(1),
          completedSessions: increment(1),
        }, { merge: true });

        let targetUnlocked = Math.min(10, lvl + 1);
        try {
          const snap = await getDoc(elderRef);
          if (snap.exists()) {
            const existingUnlocked = snap.data()?.unlockedLevel || 1;
            targetUnlocked = Math.max(existingUnlocked, Math.min(10, lvl + 1));
          }
        } catch (e) {}

        await setDoc(elderRef, {
          unlockedLevel: targetUnlocked,
          currentSublevel: 1,
          lastPlayedLevel: lvl,
          lastPlayedSublevel: sub,
          todayGameScore: increment(10),
          todayGameSessions: increment(1),
          lastActive: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        // Progress to next sublevel
        await setDoc(elderRef, {
          currentSublevel: sub + 1,
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
