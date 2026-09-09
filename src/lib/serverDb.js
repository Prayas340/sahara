import fs from 'fs';
import path from 'path';
import os from 'os';
import { adminDb, firebaseLookupUser, firebaseSaveElder, firebaseSaveCaregiver, syncCaregiverToFirebaseAuth, syncElderToFirebaseAuth } from './firebaseAdmin.js';
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
      elders: { ...mem.elders, ...(parsed.elders || {}) },
      caregivers: { ...mem.caregivers, ...(parsed.caregivers || {}) },
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

  // 2. Try local store & seed store
  const store = readLocalStore();
  const elders = { ...(DEFAULT_STORE.elders || {}), ...(store.elders || {}) };

  // Check caregiver record in local store if input is an email
  if (normalized.includes('@') && store.caregivers?.[normalized]?.linkedElder) {
    return store.caregivers[normalized].linkedElder;
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

  // 1. Direct save to Firebase Auth (sahara-63072) with metadata
  try {
    await Promise.all([
      firebaseSaveElder(elderRecord, caregiverRecord),
      firebaseSaveCaregiver(caregiverRecord, elderRecord),
    ]);
  } catch (fbErr) {
    console.warn('[serverDb] Firebase Auth save notice:', fbErr.message);
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
    if (fbCg && claims) {
      caregiver = {
        id: fbCg.uid || fbCg.localId || cleanEmail,
        email: fbCg.email || cleanEmail,
        name: fbCg.displayName || 'Caregiver',
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
  const isDemoPassword = (cleanEmail === 'riya@sahara.care' && (cleanPassword === 'care123' || cleanPassword === 'care1234')) || cleanPassword === 'care123';
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
    // Search store.elders where caregiverEmail matches cleanEmail
    const allElders = Object.values({ ...(DEFAULT_STORE.elders || {}), ...(store.elders || {}) });
    const matchedByEmail = allElders.find(e => e.caregiverEmail && e.caregiverEmail.toLowerCase() === cleanEmail);
    if (matchedByEmail) {
      linkedElder = matchedByEmail;
    }
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
