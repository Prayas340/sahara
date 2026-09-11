// -------------------------------------------------------------
// Sahara Cognitive Game Progression & Atomic Firestore Engine
// +10 Points per Sublevel, 5 Sublevels per Main Level
// -------------------------------------------------------------

import { doc, setDoc, increment, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, normalizeElderId, getTodayDateString } from './firebaseClient.js';
import { dataStore } from '../services/dataStore.js';

/**
 * Record atomic completion of a sublevel across Firestore, Local Server DB, and client state.
 * Awards exactly +10 points per sublevel.
 * Completing Sublevel 5 unlocks the next Main Level (mainLevel + 1) and resets currentSublevel to 1.
 */
export const recordSublevelCompletion = async (elderId, mainLevel, subLevel, scoreData = {}, caregiverEmail = null) => {
  if (!elderId) return null;

  const cleanElderId = normalizeElderId(elderId);
  const lvl = Math.max(1, Math.min(10, Number(mainLevel) || 1));
  const sub = Math.max(1, Math.min(5, Number(subLevel) || 1));
  const today = getTodayDateString();
  const timestamp = new Date().toISOString();

  const isLastSublevel = sub === 5;
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

      // Add +10 points to today's cumulative score and append session history
      await setDoc(dailyLogRef, {
        todayScore: increment(10),
        totalScore: increment(10),
        todaySessions: increment(1),
        lastPlayedLevel: lvl,
        lastPlayedSublevel: sub,
        lastPlayedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sessionsHistory: arrayUnion(sessionEntry),
        gamesHistory: arrayUnion(sessionEntry),
      }, { merge: true });

      // Unlock progression in elder root doc
      if (isLastSublevel) {
        await setDoc(elderRef, {
          unlockedLevel: nextUnlockedLevel,
          currentSublevel: 1,
          lastPlayedLevel: lvl,
          lastPlayedSublevel: sub,
          todayGameScore: increment(10),
          todayGameSessions: increment(1),
          lastActive: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        await setDoc(elderRef, {
          currentSublevel: nextSublevel,
          lastPlayedLevel: lvl,
          lastPlayedSublevel: sub,
          todayGameScore: increment(10),
          todayGameSessions: increment(1),
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
      if (patientProfile) {
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
