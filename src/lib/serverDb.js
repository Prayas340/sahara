import fs from 'fs';
import path from 'path';
import os from 'os';
import { adminDb, firebaseLookupUser, firebaseSaveElder, firebaseSaveCaregiver, syncCaregiverToFirebaseAuth, syncElderToFirebaseAuth, firestoreSaveGameDailyLog, firestoreGetGameDailyLog, firestorePatchDocument } from './firebaseAdmin.js';
import seedData from '../data/seedDatabase.js';

// Fallback database file path (supports Vercel Serverless /tmp and local)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DB_DIR = isServerless ? path.join(os.tmpdir(), 'sahara_data') : path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'sahara_db.json');

// Default starter records loaded directly from seedDatabase
const DEFAULT_STORE = seedData || {
  elders: {
    '+919854012345': {
      id: '+919854012345',
      identifier: '+919854012345',
      phone: '+919854012345',
      email: 'asha.borah@sahara.care',
      name: 'Asha Devi Borah',
      honorific: 'Asha ji',
      age: 74,
      city: 'Guwahati',
      state: 'Assam',
      wing: 'Garden Terrace Wing',
      location: 'Guwahati, Assam',
      status: 'Mild Cognitive Support Mode',
      tabletBattery: 94,
      lastActive: 'Just now',
      avatar: '/avatar.png',
      caregiverEmail: 'riya@sahara.care',
      updatedAt: new Date().toISOString(),
    }
  },
  caregivers: {
    'riya@sahara.care': {
      id: 'riya@sahara.care',
      email: 'riya@sahara.care',
      name: 'Riya Borah',
      password: 'care123',
      relation: 'Daughter & Primary Caregiver',
      phone: '+91 98540 12345',
      elderId: '+919854012345',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
      updatedAt: new Date().toISOString(),
    }
  }
};

// In-memory persistent cache
let memoryStore = null;

function getMemoryStore() {
  if (!memoryStore) {
    memoryStore = JSON.parse(JSON.stringify(DEFAULT_STORE));
  }
  return memoryStore;
}

// Read database safely
export function readLocalStore() {
  const mem = getMemoryStore();
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(mem, null, 2), 'utf-8');
      return mem;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    memoryStore = {
      ...mem,
      ...parsed,
      elders: { ...(mem.elders || {}), ...(parsed.elders || {}) },
      caregivers: { ...(mem.caregivers || {}), ...(parsed.caregivers || {}) },
      customContacts: { ...(mem.customContacts || {}), ...(parsed.customContacts || {}) },
      reminders: { ...(mem.reminders || {}), ...(parsed.reminders || {}) },
      routineCompletions: { ...(mem.routineCompletions || {}), ...(parsed.routineCompletions || {}) },
      gameScores: { ...(mem.gameScores || {}), ...(parsed.gameScores || {}) },
      sosAlerts: parsed.sosAlerts || mem.sosAlerts || [],
      wellnessBroadcasts: parsed.wellnessBroadcasts || mem.wellnessBroadcasts || [],
      chatMessages: { ...(mem.chatMessages || {}), ...(parsed.chatMessages || {}) },
    };
    return memoryStore;
  } catch (err) {
    return mem;
  }
}

// Write database safely
export function writeLocalStore(data) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Memory store is still active
  }
}

// Helper to normalize phone numbers or emails
export function normalizeIdentifier(val) {
  if (!val) return '';
  const trimmed = String(val).trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return digits ? `+${digits}` : trimmed;
}

/**
 * Find an elder in local database by ID, phone, email, or name
 */
export function findElderInDb(query) {
  if (!query) return null;
  const store = readLocalStore();
  const clean = normalizeIdentifier(query);
  if (store.elders?.[clean]) return store.elders[clean];
  if (store.elders?.[query]) return store.elders[query];
  const list = Object.values(store.elders || {});
  const queryStr = String(query).trim().toLowerCase();
  return list.find(e => 
    normalizeIdentifier(e.id) === clean ||
    normalizeIdentifier(e.phone) === clean ||
    (e.email && e.email.toLowerCase() === queryStr) ||
    (e.caregiverEmail && e.caregiverEmail.toLowerCase() === queryStr) ||
    (e.name && e.name.toLowerCase() === queryStr) ||
    (e.name && e.name.toLowerCase().includes(queryStr))
  ) || null;
}

/**
 * Check if elder exists in database (Firebase Auth, then persistent store)
 * Performs smart multi-field matching (ID, identifier, phone digits, or email)
 */
export async function getElderFromDb(rawIdentifier) {
  const normalized = normalizeIdentifier(rawIdentifier);
  if (!normalized) return null;

  // 1. Direct Firebase Auth lookup on sahara-63072
  try {
    const fbUser = await firebaseLookupUser(normalized);
    if (fbUser?.customClaims?.elder) {
      return fbUser.customClaims.elder;
    }
    if (fbUser?.customAttributes?.elder) {
      return fbUser.customAttributes.elder;
    }
    if (fbUser?.customClaims?.linkedElder) {
      return fbUser.customClaims.linkedElder;
    }
    if (fbUser?.customAttributes?.linkedElder) {
      return fbUser.customAttributes.linkedElder;
    }
  } catch (fbErr) {
    // Continue to next checks
  }

  // 2. Try local persistent store & starter seed store
  const store = readLocalStore();
  const elders = { ...(DEFAULT_STORE.elders || {}), ...(store.elders || {}) };
  const allCaregivers = { ...(DEFAULT_STORE.caregivers || {}), ...(store.caregivers || {}) };

  // Check caregiver record in local or seed store if input is an email
  if (normalized.includes('@') && allCaregivers[normalized]?.linkedElder) {
    return allCaregivers[normalized].linkedElder;
  }

  // Exact key match
  if (elders[normalized]) {
    return elders[normalized];
  }

  // Search across all elder records for matching email, phone, or caregiverEmail
  const cleanSearchDigits = normalized.replace(/\D/g, '');
  for (const key of Object.keys(elders)) {
    const elder = elders[key];
    if (!elder) continue;

    // Email or caregiver email match
    if (normalized.includes('@')) {
      if (elder.email && elder.email.toLowerCase() === normalized) return elder;
      if (elder.identifier && elder.identifier.toLowerCase() === normalized) return elder;
      if (elder.caregiverEmail && elder.caregiverEmail.toLowerCase() === normalized) return elder;
    }

    // Phone match
    if (cleanSearchDigits && cleanSearchDigits.length >= 10) {
      const elderDigits = String(elder.phone || elder.identifier || key).replace(/\D/g, '');
      if (elderDigits.endsWith(cleanSearchDigits) || cleanSearchDigits.endsWith(elderDigits)) {
        return elder;
      }
    }

    // ID match
    if (elder.id === normalized || elder.identifier === normalized) {
      return elder;
    }
  }

  return null;
}

/**
 * Save or update elder profile & linked caregiver in Firebase Auth & Database
 */
export async function saveElderToDb({ rawIdentifier, patientData, caregiverData }) {
  const normalizedInput = normalizeIdentifier(rawIdentifier);
  const isEmail = normalizedInput.includes('@');

  const elderEmail = isEmail
    ? normalizedInput
    : (patientData?.email && patientData.email.includes('@') ? patientData.email.trim().toLowerCase() : '');
  const elderPhone = !isEmail
    ? normalizedInput
    : (patientData?.phone ? normalizeIdentifier(patientData.phone) : '');

  const elderId = isEmail ? elderEmail : (elderPhone || normalizedInput || `elder_${Date.now().toString(36)}`);
  const cleanCgEmail = caregiverData?.email ? caregiverData.email.trim().toLowerCase() : 'riya@sahara.care';

  const startingLevel = Math.max(1, Math.min(10, parseInt(patientData?.startingLevel, 10) || 1));
  const unlockedLevel = Math.max(startingLevel, Math.min(10, parseInt(patientData?.unlockedLevel, 10) || startingLevel));
  const aiAnalysis = patientData?.aiAnalysis ? {
    recommendedLevel: Number(patientData.aiAnalysis.recommendedLevel || patientData.aiAnalysis.recommendedStartingLevel || startingLevel),
    cognitiveSummary: String(patientData.aiAnalysis.cognitiveSummary || ''),
    identifiedCondition: String(patientData.aiAnalysis.identifiedCondition || ''),
    uploadedAt: patientData.aiAnalysis.uploadedAt || new Date().toISOString(),
  } : null;

  const elderRecord = {
    id: elderId,
    identifier: elderId,
    phone: elderPhone,
    email: elderEmail,
    name: patientData?.name || (isEmail ? elderEmail.split('@')[0] : 'Sahara Member'),
    honorific: patientData?.honorific || `${(patientData?.name || 'Member').split(' ')[0]} ji`,
    age: parseInt(patientData?.age, 10) || 74,
    city: patientData?.city || 'Guwahati',
    state: patientData?.state || 'Assam',
    wing: patientData?.wing || 'Garden Terrace Wing',
    location: patientData?.location || `${patientData?.city || 'Guwahati'}, ${patientData?.state || 'Assam'}`,
    status: patientData?.status || patientData?.problemStatement || 'Mild Cognitive Support Mode',
    problemStatement: patientData?.problemStatement || patientData?.status || 'Mild Cognitive Support Mode',
    tabletBattery: patientData?.tabletBattery || 94,
    startingLevel,
    unlockedLevel,
    aiAnalysis,
    lastActive: 'Just now',
    avatar: patientData?.avatar || '/avatar.png',
    caregiverEmail: cleanCgEmail,
    updatedAt: new Date().toISOString(),
  };

  const caregiverRecord = {
    id: cleanCgEmail,
    email: cleanCgEmail,
    name: caregiverData?.name || 'Caregiver Companion',
    password: caregiverData?.password || 'care123',
    relation: caregiverData?.relation || 'Primary Caregiver',
    phone: caregiverData?.phone || '+91 98540 12345',
    elderId: elderId,
    linkedElder: elderRecord,
    avatar: caregiverData?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
    updatedAt: new Date().toISOString(),
  };

  // Sync to Firestore root documents directly
  try {
    firestorePatchDocument(`elders/${elderId}`, {
      uid: elderId,
      elderName: elderRecord.name,
      name: elderRecord.name,
      age: elderRecord.age || 74,
      caregiverUid: cleanCgEmail,
      caregiverEmail: cleanCgEmail,
      caregiverName: caregiverRecord.name,
      location: elderRecord.location,
      city: elderRecord.city,
      state: elderRecord.state,
      startingLevel,
      unlockedLevel,
      aiAnalysis: aiAnalysis || null,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});

    firestorePatchDocument(`caregivers/${cleanCgEmail}`, {
      uid: cleanCgEmail,
      email: cleanCgEmail,
      name: caregiverRecord.name,
      linkedElderId: elderId,
      role: 'caregiver',
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  } catch (err) {}

  // 1. Direct authoritative save to Firebase Cloud Auth (sahara-63072)
  let cloudCgSaved = false;
  let cloudElderSaved = false;

  try {
    const cgRes = await firebaseSaveCaregiver(caregiverRecord, elderRecord);
    if (cgRes && cgRes.success) {
      cloudCgSaved = true;
      console.log('[serverDb] Successfully saved caregiver to Firebase Auth claims:', cgRes.uid);
    }
  } catch (fbErr) {
    console.error('[serverDb] Firebase Auth caregiver save error:', fbErr.message);
    throw new Error(`Failed to save caregiver credentials to cloud database: ${fbErr.message}`);
  }

  try {
    const elderRes = await firebaseSaveElder(elderRecord, caregiverRecord);
    if (elderRes && elderRes.success) {
      cloudElderSaved = true;
      console.log('[serverDb] Successfully saved elder to Firebase Auth claims:', elderRes.uid);
    }
  } catch (fbElderErr) {
    console.error('[serverDb] Firebase Auth elder save error:', fbElderErr.message);
    throw new Error(`Failed to save elder profile to cloud database: ${fbElderErr.message}`);
  }

  if (!cloudCgSaved) {
    throw new Error('Could not synchronize caregiver account with cloud database.');
  }

  // 2. Persist to server store with multi-indexing
  const store = readLocalStore();
  if (!store.elders) store.elders = {};
  if (!store.caregivers) store.caregivers = {};

  store.elders[elderId] = elderRecord;
  if (elderPhone && elderPhone !== elderId) {
    store.elders[elderPhone] = elderRecord;
  }
  if (elderEmail && elderEmail !== elderId) {
    store.elders[elderEmail] = elderRecord;
  }
  store.caregivers[cleanCgEmail] = caregiverRecord;

  writeLocalStore(store);

  return {
    success: true,
    elder: elderRecord,
    caregiver: caregiverRecord,
  };
}

/**
 * Caregiver Login: verifies email & password against Firebase Auth & database, then directly fetches the linked elder profile
 */
export async function authenticateCaregiverFromDb({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, message: 'Please provide both email and password.' };
  }

  let caregiver = null;

  // 1. Direct Firebase Auth lookup on sahara-63072
  try {
    const fbCg = await firebaseLookupUser(cleanEmail);
    const claims = fbCg?.customClaims || fbCg?.customAttributes;
    if (fbCg && claims && (claims.role === 'caregiver' || claims.linkedElder || claims.password)) {
      caregiver = {
        id: fbCg.uid || fbCg.localId || cleanEmail,
        email: fbCg.email || cleanEmail,
        name: fbCg.displayName || claims.name || cleanEmail.split('@')[0],
        password: claims.password || cleanPassword,
        elderId: claims.elderId,
        linkedElder: claims.linkedElder,
      };
    }
  } catch (fbErr) {
    console.warn('[serverDb] Firebase Auth caregiver lookup notice:', fbErr.message);
  }

  // 2. Look up in local store & seedDatabase fallback
  const store = readLocalStore();
  const allKnownCaregivers = { ...(DEFAULT_STORE.caregivers || {}), ...(store.caregivers || {}) };

  if (caregiver && (!caregiver.linkedElder || !caregiver.linkedElder.name)) {
    if (allKnownCaregivers[cleanEmail]?.linkedElder) {
      caregiver.linkedElder = allKnownCaregivers[cleanEmail].linkedElder;
      caregiver.elderId = caregiver.elderId || allKnownCaregivers[cleanEmail].elderId;
    }
  }

  if (!caregiver && allKnownCaregivers) {
    if (allKnownCaregivers[cleanEmail]) {
      caregiver = allKnownCaregivers[cleanEmail];
    } else {
      // Search by email, name, or elder match
      const allCgs = Object.values(allKnownCaregivers);
      const foundCg = allCgs.find(c =>
        c.email?.toLowerCase() === cleanEmail ||
        c.name?.toLowerCase() === cleanEmail ||
        c.linkedElder?.name?.toLowerCase() === cleanEmail ||
        c.elderId === cleanEmail
      );
      if (foundCg) {
        caregiver = foundCg;
      }
    }
  }

  // Demo fallback for initial caregiver account
  if (!caregiver && cleanEmail === 'riya@sahara.care') {
    caregiver = DEFAULT_STORE.caregivers['riya@sahara.care'];
  }

  if (!caregiver) {
    return {
      success: false,
      message: `No caregiver account found for "${cleanEmail}". Please check your email or register during Elder View Step 3.`,
    };
  }

  // Verify password
  const isDemoPassword = cleanEmail === 'riya@sahara.care' && (cleanPassword === 'care123' || cleanPassword === 'care1234');
  if (caregiver.password && caregiver.password !== cleanPassword && !isDemoPassword) {
    return {
      success: false,
      message: 'Incorrect password for this caregiver account. Please check your credentials.',
    };
  }

  // DIRECTLY FETCH THE LINKED ELDER PROFILE!
  let linkedElder = null;
  if (caregiver.linkedElder && caregiver.linkedElder.name) {
    linkedElder = caregiver.linkedElder;
  }

  if (!linkedElder && caregiver.elderId) {
    linkedElder = await getElderFromDb(caregiver.elderId);
  }

  if (!linkedElder) {
    linkedElder = await getElderFromDb(cleanEmail);
  }

  if (!linkedElder) {
    // Search store.elders and DEFAULT_STORE.elders where caregiverEmail matches cleanEmail
    const allElders = Object.values({ ...(DEFAULT_STORE.elders || {}), ...(store.elders || {}) });
    const matchedByEmail = allElders.find(e => e.caregiverEmail && e.caregiverEmail.toLowerCase() === cleanEmail);
    if (matchedByEmail) {
      linkedElder = matchedByEmail;
    }
  }

  if (!linkedElder && DEFAULT_STORE.caregivers[cleanEmail]?.linkedElder) {
    linkedElder = DEFAULT_STORE.caregivers[cleanEmail].linkedElder;
  }

  if (!linkedElder && cleanEmail === 'riya@sahara.care') {
    linkedElder = DEFAULT_STORE.elders['+919854012345'];
  }

  if (!linkedElder) {
    return {
      success: false,
      message: `Could not find an elder profile linked to caregiver "${caregiver.name}".`,
    };
  }

  const user = {
    id: caregiver.id || cleanEmail,
    name: caregiver.name || 'Caregiver',
    email: caregiver.email,
    role: 'caregiver',
    relation: caregiver.relation || 'Primary Caregiver',
    elderPatient: linkedElder.name,
    elderPatientId: linkedElder.id,
    linkedElder: linkedElder,
    avatar: caregiver.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
    authProvider: 'caregiver-credentials',
  };

  return {
    success: true,
    user,
    elderProfile: linkedElder,
    message: `Welcome back, ${caregiver.name}! Synchronized with ${linkedElder.name}'s care sanctuary.`,
  };
}

/**
 * Save customized contacts for an elder/caregiver account
 */
export async function saveContactsToDb(args, maybeContacts) {
  let elderId, caregiverEmail, contacts;
  if (typeof args === 'object' && args !== null && !Array.isArray(args)) {
    elderId = args.elderId;
    caregiverEmail = args.caregiverEmail;
    contacts = args.contacts;
  } else {
    elderId = args;
    contacts = maybeContacts;
  }

  if (!Array.isArray(contacts)) return { success: false, message: 'Contacts must be an array' };
  const store = readLocalStore();
  if (!store.elders) store.elders = {};
  if (!store.caregivers) store.caregivers = {};
  if (!store.customContacts) store.customContacts = {};

  // Store in direct contacts index
  if (elderId) store.customContacts[elderId] = contacts;
  if (caregiverEmail) store.customContacts[caregiverEmail.trim().toLowerCase()] = contacts;

  let elder = null;
  if (elderId) {
    elder = store.elders[elderId] || DEFAULT_STORE.elders?.[elderId];
  }
  if (!elder && caregiverEmail) {
    const cleanCg = caregiverEmail.trim().toLowerCase();
    const cg = store.caregivers[cleanCg] || DEFAULT_STORE.caregivers?.[cleanCg];
    if (cg?.elderId) {
      elder = store.elders[cg.elderId] || DEFAULT_STORE.elders?.[cg.elderId];
    }
  }

  if (elder) {
    elder.contacts = contacts;
    store.elders[elder.id] = elder;
    if (elder.phone) store.elders[elder.phone] = elder;
    if (elder.email) store.elders[elder.email] = elder;
  }

  if (caregiverEmail) {
    const cleanCg = caregiverEmail.trim().toLowerCase();
    if (store.caregivers[cleanCg]) {
      store.caregivers[cleanCg].contacts = contacts;
      if (store.caregivers[cleanCg].linkedElder) {
        store.caregivers[cleanCg].linkedElder.contacts = contacts;
      }
    }
  }

  writeLocalStore(store);
  return { success: true, contacts };
}

/**
 * Get customized contacts for an elder/caregiver account
 */
export async function getContactsFromDb(args) {
  let elderId, caregiverEmail;
  if (typeof args === 'object' && args !== null) {
    elderId = args.elderId;
    caregiverEmail = args.caregiverEmail;
  } else if (typeof args === 'string') {
    if (args.includes('@')) {
      caregiverEmail = args;
    } else {
      elderId = args;
    }
  }

  const store = readLocalStore();

  // Check direct customContacts index first
  if (elderId && store.customContacts?.[elderId]) {
    return store.customContacts[elderId];
  }
  if (caregiverEmail && store.customContacts?.[caregiverEmail.trim().toLowerCase()]) {
    return store.customContacts[caregiverEmail.trim().toLowerCase()];
  }

  let elder = null;
  if (elderId) {
    elder = await getElderFromDb(elderId);
  }
  if (!elder && caregiverEmail) {
    elder = await getElderFromDb(caregiverEmail);
  }
  if (elder && elder.contacts && Array.isArray(elder.contacts) && elder.contacts.length > 0) {
    return elder.contacts;
  }
  return null;
}

export function getLocalDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Save a game score session to the database
 */
export async function saveGameScoreToDb(scoreData) {
  const store = readLocalStore();
  if (!store.gameScores) store.gameScores = {};
  if (!store.elders) store.elders = {};
  if (!store.caregivers) store.caregivers = {};

  const id = 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  let elderId = scoreData.elderId ? normalizeIdentifier(scoreData.elderId) : null;
  let caregiverEmail = scoreData.caregiverEmail ? scoreData.caregiverEmail.trim().toLowerCase() : null;

  // Resolve cross-links if one is missing
  if (!caregiverEmail && elderId) {
    const elder = store.elders?.[elderId] || findElderInDb(elderId);
    if (elder?.caregiverEmail) {
      caregiverEmail = elder.caregiverEmail.trim().toLowerCase();
    }
  }

  if (!elderId && caregiverEmail) {
    const cg = store.caregivers?.[caregiverEmail];
    if (cg?.elderId) {
      elderId = normalizeIdentifier(cg.elderId);
    }
  }

  if (!elderId) elderId = 'default_elder';

  const dateStr = scoreData.date || getLocalDateString();
  const timestamp = scoreData.timestamp || new Date().toISOString();

  const isTimedOut = scoreData.status === 'timed_out' || scoreData.status === 'Timed Out';
  const ptsToAdd = isTimedOut ? 0 : (scoreData.pointsEarned !== undefined ? Number(scoreData.pointsEarned) : (scoreData.score !== undefined ? Number(scoreData.score) : 10));
  const playedLevel = Number(scoreData.mainLevel || scoreData.level) || 1;
  const playedSublevel = Number(scoreData.subLevel) || 1;
  const nextSublevel = scoreData.currentSublevel !== undefined ? Number(scoreData.currentSublevel) : (playedSublevel === 5 ? 1 : playedSublevel + 1);
  const nextUnlockedLevel = scoreData.unlockedLevel !== undefined
    ? Math.min(10, Math.max(1, Number(scoreData.unlockedLevel)))
    : (playedSublevel === 5 ? Math.min(10, playedLevel + 1) : playedLevel);

  const record = {
    id,
    elderId,
    caregiverEmail: caregiverEmail || '',
    score: ptsToAdd,
    pointsEarned: ptsToAdd,
    level: playedLevel,
    mainLevel: playedLevel,
    subLevel: playedSublevel,
    currentSublevel: nextSublevel,
    unlockedLevel: nextUnlockedLevel,
    moves: Number(scoreData.moves) || 3,
    matchedPairs: Number(scoreData.matchedPairs) || 3,
    accuracy: scoreData.accuracy !== undefined ? Number(scoreData.accuracy) : 100,
    durationSeconds: Number(scoreData.durationSeconds) || 30,
    remainingTimeSeconds: Number(scoreData.remainingTimeSeconds) || 0,
    date: dateStr,
    timestamp,
    status: isTimedOut ? 'Timed Out' : `Sublevel ${playedSublevel}/5 Completed (+${ptsToAdd} pts)`,
  };

  const addRecord = (list) => {
    list.unshift(record);
  };

  // Index by elderId (normalized)
  if (!store.gameScores[elderId]) store.gameScores[elderId] = [];
  addRecord(store.gameScores[elderId]);

  // Also index by raw elderId if different
  if (scoreData.elderId && scoreData.elderId !== elderId) {
    if (!store.gameScores[scoreData.elderId]) store.gameScores[scoreData.elderId] = [];
    addRecord(store.gameScores[scoreData.elderId]);
  }

  // Also index by caregiverEmail if available
  if (caregiverEmail) {
    if (!store.gameScores[caregiverEmail]) store.gameScores[caregiverEmail] = [];
    addRecord(store.gameScores[caregiverEmail]);
  }

  // Update elder record in store
  const targetElder = (store.elders?.[elderId] || findElderInDb(elderId)) ||
                      (caregiverEmail ? findElderInDb(caregiverEmail) : null);
  if (targetElder) {
    targetElder.unlockedLevel = Math.max(Number(targetElder.unlockedLevel) || 1, nextUnlockedLevel);
    targetElder.currentSublevel = nextSublevel;
    targetElder.todayGameScore = (Number(targetElder.todayGameScore) || 0) + ptsToAdd;
    targetElder.todayGameSessions = (Number(targetElder.todayGameSessions) || 0) + (isTimedOut ? 0 : 1);
    targetElder.lastPlayedLevel = playedLevel;
    targetElder.lastPlayedSublevel = playedSublevel;
    targetElder.lastGameScore = ptsToAdd;
    targetElder.lastActive = 'Just now';
    targetElder.updatedAt = timestamp;
  }

  // Update caregiver record in store
  if (caregiverEmail && store.caregivers?.[caregiverEmail]) {
    const cg = store.caregivers[caregiverEmail];
    if (cg.linkedElder) {
      cg.linkedElder.unlockedLevel = Math.max(Number(cg.linkedElder.unlockedLevel) || 1, nextUnlockedLevel);
      cg.linkedElder.currentSublevel = nextSublevel;
      cg.linkedElder.todayGameScore = targetElder?.todayGameScore || ptsToAdd;
      cg.linkedElder.todayGameSessions = targetElder?.todayGameSessions || (isTimedOut ? 0 : 1);
      cg.linkedElder.lastPlayedLevel = playedLevel;
      cg.linkedElder.lastPlayedSublevel = playedSublevel;
      cg.linkedElder.lastGameScore = ptsToAdd;
      cg.linkedElder.updatedAt = timestamp;
    }
  }

  writeLocalStore(store);

  // Cloud Firestore Persistence via Firebase Admin (if available)
  try {
    const cloudRes = await firestoreSaveGameDailyLog(elderId, dateStr, { ...scoreData, unlockedLevel: nextUnlockedLevel });
    if (cloudRes) {
      return { success: true, record, unlockedLevel: nextUnlockedLevel, cloudAnalytics: cloudRes };
    }
  } catch (cloudErr) {
    console.warn('[serverDb] firestoreSaveGameDailyLog notice:', cloudErr.message);
  }

  return { success: true, record, unlockedLevel: nextUnlockedLevel };
}

/**
 * Get game scores and analytics for an elder or caregiver
 */
export async function getGameScoresFromDb(args) {
  let elderId, caregiverEmail, clientDate;
  if (typeof args === 'object' && args !== null) {
    elderId = args.elderId;
    caregiverEmail = args.caregiverEmail;
    clientDate = args.date || args.clientDate;
  } else if (typeof args === 'string') {
    if (args.includes('@')) {
      caregiverEmail = args;
    } else {
      elderId = args;
    }
  }

  const store = readLocalStore();
  const now = new Date();
  const todayStr = clientDate || getLocalDateString(now);

  // Try reading real-time DailyLog from Cloud Firestore first
  let cloudDaily = null;
  const cleanId = elderId ? normalizeIdentifier(elderId) : null;
  if (cleanId) {
    try {
      cloudDaily = await firestoreGetGameDailyLog(cleanId, todayStr);
    } catch (e) {}
  }
  if (!cloudDaily && caregiverEmail) {
    const cg = store.caregivers?.[caregiverEmail.trim().toLowerCase()];
    if (cg?.elderId) {
      try {
        cloudDaily = await firestoreGetGameDailyLog(normalizeIdentifier(cg.elderId), todayStr);
      } catch (e) {}
    }
  }

  const candidateLists = [];
  if (cleanId) {
    if (Array.isArray(store.gameScores?.[cleanId])) candidateLists.push(store.gameScores[cleanId]);
    if (Array.isArray(store.gameScores?.[elderId])) candidateLists.push(store.gameScores[elderId]);
  }

  if (caregiverEmail) {
    const cleanCg = caregiverEmail.trim().toLowerCase();
    if (Array.isArray(store.gameScores?.[cleanCg])) candidateLists.push(store.gameScores[cleanCg]);
    const cg = store.caregivers?.[cleanCg];
    if (cg?.elderId) {
      if (Array.isArray(store.gameScores?.[cg.elderId])) candidateLists.push(store.gameScores[cg.elderId]);
      if (Array.isArray(store.gameScores?.[normalizeIdentifier(cg.elderId)])) candidateLists.push(store.gameScores[normalizeIdentifier(cg.elderId)]);
    }
  }

  // Cross-reference linked profile
  const resolvedElder = (elderId ? (store.elders?.[elderId] || store.elders?.[cleanId] || findElderInDb(elderId)) : null) ||
                        (caregiverEmail ? findElderInDb(caregiverEmail) : null);

  if (resolvedElder) {
    const eId = resolvedElder.id;
    const ePhone = resolvedElder.phone;
    const eEmail = resolvedElder.email;
    const eCgEmail = resolvedElder.caregiverEmail;
    if (eId && Array.isArray(store.gameScores?.[eId])) candidateLists.push(store.gameScores[eId]);
    if (ePhone && Array.isArray(store.gameScores?.[normalizeIdentifier(ePhone)])) candidateLists.push(store.gameScores[normalizeIdentifier(ePhone)]);
    if (eEmail && Array.isArray(store.gameScores?.[eEmail.toLowerCase()])) candidateLists.push(store.gameScores[eEmail.toLowerCase()]);
    if (eCgEmail && Array.isArray(store.gameScores?.[eCgEmail.toLowerCase()])) candidateLists.push(store.gameScores[eCgEmail.toLowerCase()]);
  }

  // Also include default_elder or all scores if list is empty
  if (Array.isArray(store.gameScores?.['default_elder'])) {
    candidateLists.push(store.gameScores['default_elder']);
  }
  if (candidateLists.length === 0 && store.gameScores) {
    for (const list of Object.values(store.gameScores)) {
      if (Array.isArray(list)) candidateLists.push(list);
    }
  }

  // Deduplicate raw scores by id
  const seenScoreIds = new Set();
  const scores = [];
  for (const list of candidateLists) {
    for (const s of list) {
      const sKey = s.id || `${s.date}_${s.timestamp}_${s.score}`;
      if (!seenScoreIds.has(sKey)) {
        seenScoreIds.add(sKey);
        scores.push(s);
      }
    }
  }

  // If cloud DailyLog has sessionsHistory, add them
  if (cloudDaily && Array.isArray(cloudDaily.sessionsHistory)) {
    for (const ch of cloudDaily.sessionsHistory) {
      const chKey = `cloud_${ch.sessionNumber}_${ch.completedAt}`;
      if (!seenScoreIds.has(chKey)) {
        seenScoreIds.add(chKey);
        scores.push({
          id: chKey,
          score: ch.pointsEarned !== undefined ? Number(ch.pointsEarned) : 50,
          pointsEarned: ch.pointsEarned !== undefined ? Number(ch.pointsEarned) : 50,
          level: Number(ch.level) || 1,
          durationSeconds: 60 - (Number(ch.remainingTimeSeconds) || 0),
          remainingTimeSeconds: Number(ch.remainingTimeSeconds) || 0,
          accuracy: ch.accuracy !== undefined ? Number(ch.accuracy) : 100,
          status: ch.status === 'timed_out' ? 'Timed Out' : 'Completed (+50 pts)',
          date: todayStr,
          timestamp: ch.completedAt || new Date().toISOString(),
          sessionNumber: ch.sessionNumber,
        });
      }
    }
  }

  // Sort descending
  scores.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  const isTodayMatch = (s) => {
    if (s.date === todayStr) return true;
    if (s.timestamp) {
      const tsD = new Date(s.timestamp);
      if (!isNaN(tsD.getTime())) {
        const local = getLocalDateString(tsD);
        const utc = tsD.toISOString().split('T')[0];
        if (local === todayStr || utc === todayStr) return true;
        if (Math.abs(now.getTime() - tsD.getTime()) < 18 * 3600 * 1000) return true;
      }
    }
    return false;
  };

  const todayScores = scores.filter(isTodayMatch);

  // Calculate todayTotalScore from completed sessions: each completed session is 50 pts, max 250
  const completedTodayScores = todayScores.filter(s => s.status !== 'timed_out' && s.status !== 'Timed Out' && Number(s.score) > 0);
  const rawTodayScore = completedTodayScores.reduce((sum, s) => sum + (Number(s.score) || Number(s.pointsEarned) || 50), 0);

  let todayTotalScore = rawTodayScore;
  let todaySessionsCount = completedTodayScores.length;

  if (cloudDaily) {
    const cScore = typeof cloudDaily.todayScore === 'number' ? cloudDaily.todayScore : (typeof cloudDaily.totalScore === 'number' ? cloudDaily.totalScore : 0);
    const cSess = typeof cloudDaily.todaySessions === 'number' ? cloudDaily.todaySessions : (typeof cloudDaily.completedSessions === 'number' ? cloudDaily.completedSessions : 0);
    todayTotalScore = Math.max(todayTotalScore, cScore);
    todaySessionsCount = Math.max(todaySessionsCount, cSess);
  }

  // Cap at 250
  todayTotalScore = Math.min(250, todayTotalScore);
  todaySessionsCount = Math.min(5, todaySessionsCount);

  // Calculate unlocked levels across all played scores
  const maxCompletedLevel = Math.max(
    0,
    ...scores.filter(s => s.status !== 'timed_out' && s.status !== 'Timed Out' && Number(s.score) > 0).map(s => Number(s.level) || 0)
  );

  const maxUnlockedFromScores = Math.max(
    1,
    maxCompletedLevel + 1,
    ...scores.map(s => Number(s.unlockedLevel) || 1)
  );

  const finalUnlockedLevel = Math.min(
    10,
    Math.max(
      maxUnlockedFromScores,
      Number(resolvedElder?.unlockedLevel) || 1,
      cloudDaily?.unlockedLevel ? Number(cloudDaily.unlockedLevel) : 1
    )
  );

  // Last 7 days breakdown in local timezone
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = [];
  let weeklyTotalScore = 0;
  let weeklySessionsCount = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = getLocalDateString(d);
    const dayLabel = dayNames[d.getDay()];

    if (i === 0) {
      const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      weeklyTotalScore += todayTotalScore;
      weeklySessionsCount += todaySessionsCount;
      last7Days.push({
        date: dStr,
        dateStr,
        day: 'Today',
        score: todayTotalScore,
        sessions: todaySessionsCount,
        isToday: true,
      });
    } else {
      const dayRecords = scores.filter(s => {
        if (s.date === dStr) return true;
        if (s.timestamp) {
          const tsD = new Date(s.timestamp);
          if (!isNaN(tsD.getTime())) {
            return getLocalDateString(tsD) === dStr;
          }
        }
        return false;
      });

      const dayScore = Math.min(250, dayRecords.reduce((sum, s) => sum + (Number(s.score) || 0), 0));
      const sessions = Math.min(5, dayRecords.length);
      weeklyTotalScore += dayScore;
      weeklySessionsCount += sessions;

      const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

      last7Days.push({
        date: dStr,
        dateStr,
        day: dayLabel,
        score: dayScore,
        sessions,
        isToday: false,
      });
    }
  }

  const hasScores = scores.length > 0 || todaySessionsCount > 0;
  const avgAccuracy = hasScores
    ? Math.round(scores.reduce((sum, s) => sum + (Number(s.accuracy) || 100), 0) / (scores.length || 1))
    : (todaySessionsCount > 0 ? 100 : 0);

  const stabilityRating = hasScores
    ? (avgAccuracy >= 90 ? `High Recall (${avgAccuracy}%)` : avgAccuracy >= 75 ? `Steady Recall (${avgAccuracy}%)` : `Moderate (${avgAccuracy}%)`)
    : 'Awaiting First Game';

  return {
    success: true,
    scores,
    unlockedLevel: finalUnlockedLevel,
    currentSublevel: resolvedElder?.currentSublevel || 1,
    analytics: {
      unlockedLevel: finalUnlockedLevel,
      currentSublevel: resolvedElder?.currentSublevel || 1,
      todayScore: todayTotalScore,
      todaySessions: todaySessionsCount,
      todayAvgScore: todaySessionsCount > 0 ? Math.round(todayTotalScore / todaySessionsCount) : 0,
      weeklyScore: weeklyTotalScore,
      weeklySessions: weeklySessionsCount,
      weeklyAvgDailyScore: Math.round(weeklyTotalScore / 7),
      avgAccuracy,
      averageAccuracy: avgAccuracy,
      cognitiveStability: stabilityRating,
      stabilityRating,
      last7Days,
      weeklyTrend: last7Days,
      recentScores: scores.slice(0, 10),
      sessions: scores,
    },
  };
}

/**
 * Clear game scores from database
 */
export async function clearGameScoresFromDb({ elderId, caregiverEmail }) {
  const store = readLocalStore();
  if (!store.gameScores) store.gameScores = {};
  if (elderId) {
    const cleanId = normalizeIdentifier(elderId);
    delete store.gameScores[cleanId];
    delete store.gameScores[elderId];
  }
  if (caregiverEmail) {
    delete store.gameScores[caregiverEmail.trim().toLowerCase()];
  }
  writeLocalStore(store);
  return { success: true, message: 'Game scores reset successfully' };
}

/**
 * Default starter routine reminders
 */
export const DEFAULT_MEDICINES = [
  {
    id: 'med_morning',
    title: 'Donepezil & Morning Rhythm',
    detail: 'Blood pressure tablet & warm hydration after breakfast',
    scheduledTime: '08:00 AM',
    category: 'medication',
    taken: false,
    takenAt: null,
  },
  {
    id: 'med_afternoon',
    title: 'Afternoon Digestive Tonic',
    detail: '10ml digestive syrup with lukewarm water after lunch',
    scheduledTime: '01:30 PM',
    category: 'medication',
    taken: false,
    takenAt: null,
  },
  {
    id: 'med_night',
    title: 'Night Calm Routine',
    detail: 'Joint mobility tablet & warm turmeric milk before sleep',
    scheduledTime: '08:30 PM',
    category: 'medication',
    taken: false,
    takenAt: null,
  },
];

/**
 * Get reminders for an elder or caregiver
 */
export async function getRemindersFromDb(args) {
  let elderId, caregiverEmail;
  if (typeof args === 'object' && args !== null) {
    elderId = args.elderId;
    caregiverEmail = args.caregiverEmail;
  } else if (typeof args === 'string') {
    if (args.includes('@')) caregiverEmail = args;
    else elderId = args;
  }

  const store = readLocalStore();
  if (!store.reminders) store.reminders = {};

  const cleanElderId = elderId ? normalizeIdentifier(elderId) : null;
  const cleanCg = caregiverEmail ? caregiverEmail.trim().toLowerCase() : null;

  // Cross-lookup linked profile to ensure Elder & Caregiver portals access the identical reminders list
  const resolvedElder = (elderId ? (store.elders?.[elderId] || store.elders?.[cleanElderId] || findElderInDb(elderId)) : null) ||
                        (cleanCg ? findElderInDb(cleanCg) : null);

  const candidateKeys = [
    cleanElderId,
    elderId,
    cleanCg,
    resolvedElder?.id,
    resolvedElder?.phone ? normalizeIdentifier(resolvedElder.phone) : null,
    resolvedElder?.email ? resolvedElder.email.toLowerCase() : null,
    resolvedElder?.caregiverEmail ? resolvedElder.caregiverEmail.trim().toLowerCase() : null,
  ].filter(Boolean);

  let medicines = null;
  for (const k of candidateKeys) {
    if (Array.isArray(store.reminders[k]) && store.reminders[k].length > 0) {
      medicines = store.reminders[k];
      break;
    }
  }

  if (!medicines) {
    medicines = [];
  }

  // Safe midnight daily reset: only reset if takenDate is distinctly from an older day (>20 hours ago)
  const now = new Date();
  const todayLocal = getLocalDateString(now);
  const todayUtc = now.toISOString().split('T')[0];

  let needsDailyReset = false;
  medicines = medicines.map(m => {
    if (m.taken) {
      if (!m.takenDate) {
        m.takenDate = todayLocal;
      } else if (m.takenDate !== todayLocal && m.takenDate !== todayUtc) {
        const takenD = new Date(m.takenDate);
        if (!isNaN(takenD.getTime()) && (now.getTime() - takenD.getTime() > 20 * 3600 * 1000)) {
          needsDailyReset = true;
          return { ...m, taken: false, takenAt: null, takenDate: null };
        }
      }
    }
    return m;
  });

  if (needsDailyReset) {
    for (const k of candidateKeys) {
      store.reminders[k] = medicines;
    }
    writeLocalStore(store);
  }

  const total = medicines.length;
  const takenCount = medicines.filter(m => m.taken).length;
  const completionPercentage = total > 0 ? Math.round((takenCount / total) * 100) : 0;
  const allCompleted = total > 0 && takenCount === total;
  const nextPending = medicines.find(m => !m.taken) || null;

  return {
    success: true,
    medicines,
    stats: {
      total,
      takenCount,
      completionPercentage,
      allCompleted,
      nextPending,
    }
  };
}

/**
 * Save full list of reminders for an elder or caregiver
 */
export async function saveRemindersToDb({ elderId, caregiverEmail, medicines }) {
  const store = readLocalStore();
  if (!store.reminders) store.reminders = {};
  if (!store.routineCompletions) store.routineCompletions = {};

  const cleanList = Array.isArray(medicines) ? medicines : [];
  let cleanElderId = elderId ? normalizeIdentifier(elderId) : null;
  let cleanCg = caregiverEmail ? caregiverEmail.trim().toLowerCase() : null;

  // Resolve cross-links
  const resolvedElder = (cleanElderId ? (store.elders?.[cleanElderId] || findElderInDb(cleanElderId)) : null) ||
                        (cleanCg ? findElderInDb(cleanCg) : null);

  if (!cleanCg && resolvedElder?.caregiverEmail) {
    cleanCg = resolvedElder.caregiverEmail.trim().toLowerCase();
  }
  if (!cleanElderId && cleanCg) {
    const cg = store.caregivers?.[cleanCg];
    if (cg?.elderId) cleanElderId = normalizeIdentifier(cg.elderId);
  }

  const allTargetKeys = [
    cleanElderId,
    elderId,
    cleanCg,
    resolvedElder?.id,
    resolvedElder?.phone ? normalizeIdentifier(resolvedElder.phone) : null,
    resolvedElder?.caregiverEmail ? resolvedElder.caregiverEmail.trim().toLowerCase() : null,
  ].filter(Boolean);

  // Persist across ALL associated identity keys so Elder & Caregiver portals are 100% in sync
  allTargetKeys.forEach(k => {
    store.reminders[k] = cleanList;
  });

  // Record completions in database under user accounts
  const todayStr = getLocalDateString();
  cleanList.forEach(m => {
    if (m.taken) {
      const compKey = cleanElderId || cleanCg || 'global';
      if (!store.routineCompletions[compKey]) store.routineCompletions[compKey] = [];
      const alreadyLogged = store.routineCompletions[compKey].some(
        c => (c.reminderId === m.id || c.title === m.title) && c.takenDate === (m.takenDate || todayStr)
      );
      if (!alreadyLogged) {
        store.routineCompletions[compKey].unshift({
          id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          elderId: cleanElderId,
          caregiverEmail: cleanCg,
          reminderId: m.id,
          title: m.title,
          scheduledTime: m.scheduledTime,
          takenAt: m.takenAt || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          takenDate: m.takenDate || todayStr,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  writeLocalStore(store);

  const total = cleanList.length;
  const takenCount = cleanList.filter(m => m.taken).length;
  const completionPercentage = total > 0 ? Math.round((takenCount / total) * 100) : 0;
  const allCompleted = total > 0 && takenCount === total;
  const nextPending = cleanList.find(m => !m.taken) || null;

  return {
    success: true,
    medicines: cleanList,
    stats: {
      total,
      takenCount,
      completionPercentage,
      allCompleted,
      nextPending,
    }
  };
}

/**
 * Add a single reminder for an elder or caregiver
 */
export async function addReminderToDb({ elderId, caregiverEmail, reminder }) {
  const existing = await getRemindersFromDb({ elderId, caregiverEmail });
  const list = [...(existing.medicines || [])];

  const newReminder = {
    id: reminder.id || ('rem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
    title: reminder.title || 'Daily Routine Dose',
    detail: reminder.detail || 'Scheduled routine',
    scheduledTime: reminder.scheduledTime || reminder.time || '08:00 AM',
    category: reminder.category || 'medication',
    taken: Boolean(reminder.taken),
    takenAt: reminder.takenAt || null,
  };

  list.push(newReminder);
  return saveRemindersToDb({ elderId, caregiverEmail, medicines: list });
}

/**
 * Delete a reminder by ID for an elder or caregiver
 */
export async function deleteReminderFromDb({ elderId, caregiverEmail, reminderId }) {
  const existing = await getRemindersFromDb({ elderId, caregiverEmail });
  const list = (existing.medicines || []).filter(m => m.id !== reminderId);
  return saveRemindersToDb({ elderId, caregiverEmail, medicines: list });
}

/**
 * Toggle or set taken status for a reminder
 */
export async function toggleReminderStatusInDb({ elderId, caregiverEmail, reminderId, taken, takenAt, takenDate }) {
  const existing = await getRemindersFromDb({ elderId, caregiverEmail });
  let toggledItem = null;
  const list = (existing.medicines || []).map((m, idx) => {
    const isTarget = (
      m.id === reminderId ||
      String(m.id) === String(reminderId) ||
      m.title === reminderId ||
      (m.name && m.name === reminderId) ||
      ((existing.medicines || []).length === 1) ||
      (idx === 0 && !m.taken)
    );
    if (isTarget && !toggledItem) {
      const isTaken = taken !== undefined ? Boolean(taken) : !m.taken;
      const todayStr = takenDate || getLocalDateString();
      const updated = {
        ...m,
        taken: isTaken,
        takenAt: isTaken ? (takenAt || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })) : null,
        takenDate: isTaken ? todayStr : null,
      };
      toggledItem = updated;
      return updated;
    }
    return m;
  });

  // Record completion log directly in database under user accounts
  if (toggledItem?.taken) {
    try {
      const store = readLocalStore();
      if (!store.routineCompletions) store.routineCompletions = {};
      const cleanElderId = elderId ? normalizeIdentifier(elderId) : null;
      const cleanCgEmail = caregiverEmail ? caregiverEmail.trim().toLowerCase() : null;
      const completionRecord = {
        id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        elderId: cleanElderId,
        caregiverEmail: cleanCgEmail,
        reminderId,
        title: toggledItem.title,
        scheduledTime: toggledItem.scheduledTime,
        takenAt: toggledItem.takenAt,
        takenDate: toggledItem.takenDate,
        timestamp: new Date().toISOString(),
      };
      if (cleanElderId) {
        if (!store.routineCompletions[cleanElderId]) store.routineCompletions[cleanElderId] = [];
        store.routineCompletions[cleanElderId].unshift(completionRecord);
      }
      if (cleanCgEmail) {
        if (!store.routineCompletions[cleanCgEmail]) store.routineCompletions[cleanCgEmail] = [];
        store.routineCompletions[cleanCgEmail].unshift(completionRecord);
      }
      writeLocalStore(store);
    } catch (e) {
      console.warn('Error recording routine completion:', e);
    }
  }

  return saveRemindersToDb({ elderId, caregiverEmail, medicines: list });
}

// Record an emergency SOS alert in local DB and update elder emergency status
export function recordSosAlertInDb({ elderId, elderName, caregiverEmail, caregiverName, location, phone, status, timestamp }) {
  const store = readLocalStore();
  if (!Array.isArray(store.sosAlerts)) store.sosAlerts = [];
  const alertRecord = {
    id: `sos_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    elderId: elderId || '+919854012345',
    elderName: elderName || 'Prayas Dey',
    caregiverEmail: caregiverEmail || 'prayasdey10@gmail.com',
    caregiverName: caregiverName || 'Primary Caregiver',
    location: location || 'Guwahati, Assam',
    phone: phone || '+919854012345',
    status: status || 'ACTIVE_SOS',
    timestamp: timestamp || new Date().toISOString(),
  };

  store.sosAlerts.unshift(alertRecord);
  if (store.sosAlerts.length > 50) store.sosAlerts = store.sosAlerts.slice(0, 50);

  const normElder = normalizeIdentifier(elderId);
  if (store.elders && store.elders[normElder]) {
    store.elders[normElder].emergencyStatus = 'ACTIVE_SOS';
    store.elders[normElder].lastSosAlert = alertRecord;
  }

  writeLocalStore(store);
  return alertRecord;
}

// Retrieve the most recent emergency SOS alert for an elder or caregiver
export function getLatestSosAlertFromDb(elderId, caregiverEmail) {
  const store = readLocalStore();
  if (!Array.isArray(store.sosAlerts) || store.sosAlerts.length === 0) return null;

  const normElder = elderId ? normalizeIdentifier(elderId) : null;
  const normCg = caregiverEmail ? normalizeIdentifier(caregiverEmail) : null;

  for (const alert of store.sosAlerts) {
    if (normElder && normalizeIdentifier(alert.elderId) === normElder) return alert;
    if (normCg && normalizeIdentifier(alert.caregiverEmail) === normCg) return alert;
  }
  return store.sosAlerts[0] || null;
}

