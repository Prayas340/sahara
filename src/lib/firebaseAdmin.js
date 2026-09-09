import crypto from 'crypto';

// Sahara Firebase Project ID
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'sahara-63072';
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@sahara-63072.iam.gserviceaccount.com';

// Authoritative Sahara Firebase Service Account Private Key
const FALLBACK_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDc0vdir0xIFRb9\nQM8wBRADtYSrp373rVgpi8OCpUtPdp4FsBMvgvmbVT8eL7RQ1km2A6hxPXmfc53X\nLUg4x7R/N63mE4BtSt7SICnrIjTTRNn5NovRapc3GwhcmLm4mNLYgCOWgxLOjLYo\na1Vh9rL91BYleGUM7V/964Fuow5x1xpnDWBJu2Ecyav3B2OftsCn2qgQDgF/cwBM\nmU6Ea66Hg4BQ1MdD05mfKVL7Z6+sT6eYbFYf2eqw3LpowsbDsf8awehG8EpvaOPo\nxNO2PzcKVmTWNrVwxZAJDY5lVrMLMT39T6CMAui2sk4U32QLnq/YbmB67c1vorfI\nc6BzF+pDAgMBAAECggEAD5Vv0e4PExMx8SNuu7PPwoM/3qFOa4o3K49qd8DUhMIZ\nOsuHPxYeKWEluCqjrgTBZO/zJjKxb5hILlRKwX8OdN/oDNGZgZ0EBo4whyB9298D\nBvxbd6bvDvuAZpB8otNeJds9J7UOUbdKb6XLe8NeNF2QRoqtjvD9kjzZgIZPUac7\n5dac/RT/49upjZDt7B7yN2kUG3jqUy62Ag9QMnLrKip3XgsMTLAkmChdVmtMof5b\nHZ87Qt4AiDgEe5XsRUlrl1XMyfYa4uMWFzKwmI5z+ATuZnXX0gWQfSU5HLAPO7RT\n+SKLcSlFS+6OYe7Qjv40CGvXp3DAXm+407R50QU7UQKBgQD4LmW9cgrj0447c6pW\nkRMRZ2uT/uqOeSd+ul1awMv93cUZJMw7ssjPCMRlwxD155bj3noHEMUBtqAG7OAT\n0gxW/eReVmnlMzM9jVoizfzFwekJJAUYm5Md/x4J+CPZqhs3Ta4GkuCg8Dsbtf2u\nT0Q6vdGypfqHZQHitQJU2csjiQKBgQDjx+5ifFw/Bg93wGOqh2xeshv3pCaBPpXV\nG+45hSAulSxpd/PTJoWLhpDnTzgO4fKn8PJQtsgdmrnBnthbM0+Xk4RcZgqxkK1g\nRDyYQyTM6ypqSYLMKmq1o40y9E1BkEUJieiHqwyOq0vW2Qf8X+4F0CveaiezrqEY\nMYl0eduQawKBgQCxj0BrEbSI20rfbhloZdLmmL922uKlnDiNinhP/a/0qT3ih1k3\nPOo+dV9ODwmLZW2nCfz0ISNR3n8PdVm71IPPmUZR2DFbMg5u8zqRvB4kvl8jkwmy\nWVwgEe5D46yChhmCr6jaOytK+ZTQdpxQoZWHEVd+IRHk3HdE44wPeOLFQQKBgQDT\nRLN0oYgl5IcgOU+38ZewVV7fWF9mbRgn65oPu8xXqIDi6iE67XXcLdnk0XNbSnL5\nFeCKwJ3n54T3c0+Vd4gRPP/9e5/bhidpLKFPUKencU+L+dbZa1ZCVwo2AqZNc3S1\nHjaQ7zPceEEFa5Oen5NzzNuDlc5xOD2u5PNrF0NxNQKBgQCXD7glMDWn63rpcbHI\nvnyTFqp2F/F+l7obFQKkIcal5usGCy6eKle5rlZqhWu0ypeyP+QGvB/ihlH8LMZM\n3toR9HvvDxvxVc54PDypfxb8eM2YPOipt4ICjg6TqzqDmlBspuZt2le7WZFHyeV3\nRy2sfqk9pUFOW6tyXVC/vWZ3cg==\n-----END PRIVATE KEY-----\n';

function formatPrivateKey(key) {
  if (!key || typeof key !== 'string') return FALLBACK_KEY;
  let clean = key.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  clean = clean.replace(/\\n/g, '\n');
  if (!clean.includes('BEGIN PRIVATE KEY') || clean.length < 500) {
    return FALLBACK_KEY;
  }
  return clean;
}

const PRIVATE_KEY = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

export const serviceAccount = {
  type: 'service_account',
  project_id: PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'c05188fc7b424829ff83fb48462c8a955c480402',
  private_key: PRIVATE_KEY,
  client_email: CLIENT_EMAIL,
};

// Base64Url helper
function b64url(str) {
  return Buffer.from(str).toString('base64url');
}

// Token cache
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Mint Google OAuth2 access token for Google Identity Toolkit & Firebase Auth
 */
export async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiresAt > now + 60) {
    return cachedToken;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsigned = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(claims));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(PRIVATE_KEY, 'base64url');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Failed to obtain Google OAuth token: ${data.error_description || data.error || 'Unknown error'}`);
  }

  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in || 3600);
  return cachedToken;
}

/**
 * Generic helper for Google Identity Toolkit REST calls
 */
async function identityToolkitRequest(endpoint, body = {}) {
  const token = await getGoogleAccessToken();
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}${endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok && data.error) {
    const msg = data.error.message || `Identity Toolkit request failed with status ${res.status}`;
    const err = new Error(msg);
    err.code = data.error.message;
    err.status = res.status;
    throw err;
  }
  return data;
}

function parseClaims(customAttributes) {
  if (!customAttributes) return {};
  if (typeof customAttributes === 'object') return customAttributes;
  try {
    return JSON.parse(customAttributes);
  } catch (e) {
    return {};
  }
}

/**
 * Lookup user in Firebase Auth on project sahara-63072
 */
export async function firebaseLookupUser(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim();
  const isEmail = cleanId.includes('@');

  try {
    let query = {};
    if (isEmail) {
      query.email = [cleanId.toLowerCase()];
    } else if (cleanId.startsWith('+')) {
      query.phoneNumber = [cleanId];
    } else {
      query.localId = [cleanId];
    }

    const data = await identityToolkitRequest('/accounts:lookup', query);
    const user = data.users?.[0];
    if (!user) return null;

    const claims = parseClaims(user.customAttributes);
    return {
      uid: user.localId,
      localId: user.localId,
      email: user.email || '',
      displayName: user.displayName || '',
      phoneNumber: user.phoneNumber || '',
      customClaims: claims,
      customAttributes: claims,
    };
  } catch (err) {
    console.warn('[firebaseAdmin] Lookup notice:', err.message);
    return null;
  }
}

/**
 * Lookup caregiver directly in Firebase Auth
 */
export async function firebaseLookupCaregiver(email) {
  if (!email) return null;
  return firebaseLookupUser(email.trim().toLowerCase());
}

/**
 * Save or update Elder in Firebase Auth with full linked caregiver & claims
 */
export async function firebaseSaveElder(elderRecord, caregiverRecord) {
  if (!elderRecord) throw new Error('Elder profile data is required for database persistence.');

  const rawEmail = elderRecord.email ? elderRecord.email.trim().toLowerCase() : null;
  const cgEmail = caregiverRecord?.email ? caregiverRecord.email.trim().toLowerCase() : null;
  const email = (rawEmail && rawEmail !== cgEmail) ? rawEmail : null;
  const phone = elderRecord.phone && elderRecord.phone.startsWith('+') ? elderRecord.phone : null;
  const predictableId = elderRecord.id || (phone ? phone : (email ? email : `elder_${Date.now().toString(36)}`));

  // 1. Check if user already exists
  let user = null;
  if (email) {
    user = await firebaseLookupUser(email);
  }
  if (!user && phone) {
    user = await firebaseLookupUser(phone);
  }
  if (!user && predictableId) {
    user = await firebaseLookupUser(predictableId);
  }

  // 2. Create user if not found
  if (!user) {
    const createPayload = {
      displayName: elderRecord.name || 'Sahara Elder',
    };
    if (email) createPayload.email = email;
    if (phone && phone.startsWith('+') && phone.length >= 10) {
      createPayload.phoneNumber = phone;
    }
    if (!email && !phone && predictableId && predictableId.length <= 128) {
      createPayload.localId = predictableId.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    try {
      const createRes = await identityToolkitRequest('/accounts', createPayload);
      user = {
        localId: createRes.localId,
        uid: createRes.localId,
        email: createRes.email || email,
        displayName: createRes.displayName || createPayload.displayName,
      };
    } catch (createErr) {
      console.warn('[firebaseAdmin] Create elder notice:', createErr.message);
      if (email) user = await firebaseLookupUser(email);
      if (!user && phone) user = await firebaseLookupUser(phone);
      if (!user && predictableId) user = await firebaseLookupUser(predictableId);
      if (!user) {
        throw new Error(`Could not provision Elder in cloud database: ${createErr.message}`);
      }
    }
  }

  // 3. Set authoritative custom claims
  if (user && user.localId) {
    const claims = {
      role: 'elder',
      elder: {
        id: elderRecord.id || elderRecord.identifier || user.localId,
        name: elderRecord.name || 'Sahara Member',
        honorific: elderRecord.honorific || `${(elderRecord.name || 'Member').split(' ')[0]} ji`,
        age: parseInt(elderRecord.age, 10) || 74,
        city: elderRecord.city || 'Guwahati',
        state: elderRecord.state || 'Assam',
        wing: elderRecord.wing || 'Garden Terrace Wing',
        location: elderRecord.location || `${elderRecord.city || 'Guwahati'}, ${elderRecord.state || 'Assam'}`,
        status: elderRecord.status || elderRecord.problemStatement || 'Mild Cognitive Support Mode',
        avatar: elderRecord.avatar || '/avatar.png',
        caregiverEmail: caregiverRecord?.email || elderRecord.caregiverEmail || '',
      },
      caregiverEmail: caregiverRecord?.email || '',
      caregiverName: caregiverRecord?.name || '',
      updatedAt: new Date().toISOString(),
    };

    await identityToolkitRequest('/accounts:update', {
      localId: user.localId,
      customAttributes: JSON.stringify(claims),
    });

    console.log('[firebaseAdmin] Successfully set elder claims for:', user.localId);
    return { success: true, uid: user.localId, claims };
  }

  throw new Error('Failed to resolve or create elder user in Firebase Auth.');
}

/**
 * Save or update Caregiver in Firebase Auth with full linkedElder profile in claims
 */
export async function firebaseSaveCaregiver(caregiverRecord, elderRecord) {
  if (!caregiverRecord?.email) throw new Error('Caregiver email is required for registration.');

  const cleanEmail = caregiverRecord.email.trim().toLowerCase();
  const password = caregiverRecord.password || 'care123';
  const cleanPassword = password.length >= 6 ? password : `${password}123`;
  const cleanName = (caregiverRecord.name || 'Caregiver Companion').trim();

  let user = await firebaseLookupUser(cleanEmail);

  if (!user) {
    try {
      const createRes = await identityToolkitRequest('/accounts', {
        email: cleanEmail,
        password: cleanPassword,
        displayName: cleanName,
      });
      user = {
        localId: createRes.localId,
        uid: createRes.localId,
        email: cleanEmail,
        displayName: cleanName,
      };
    } catch (createErr) {
      console.warn('[firebaseAdmin] Create caregiver notice:', createErr.message);
      user = await firebaseLookupUser(cleanEmail);
      if (!user) throw new Error(`Could not create Caregiver in Firebase Auth: ${createErr.message}`);
    }
  } else {
    // Update display name or password if provided
    try {
      await identityToolkitRequest('/accounts:update', {
        localId: user.localId,
        displayName: cleanName,
        password: cleanPassword,
      });
    } catch (updErr) {
      console.warn('[firebaseAdmin] Update caregiver notice:', updErr.message);
    }
  }

  if (user && user.localId) {
    const elderName = elderRecord?.name || 'Sahara Member';
    const firstName = elderName.split(' ')[0];
    const honorific = elderRecord?.honorific || `${firstName} ji`;

    const claims = {
      role: 'caregiver',
      password: cleanPassword,
      elderId: elderRecord?.id || elderRecord?.identifier || caregiverRecord.elderId || '',
      linkedElder: {
        id: elderRecord?.id || elderRecord?.identifier || caregiverRecord.elderId || '',
        name: elderName,
        honorific: honorific,
        age: parseInt(elderRecord?.age, 10) || 74,
        city: elderRecord?.city || 'Guwahati',
        state: elderRecord?.state || 'Assam',
        wing: elderRecord?.wing || 'Garden Terrace Wing',
        location: elderRecord?.location || `${elderRecord?.city || 'Guwahati'}, ${elderRecord?.state || 'Assam'}`,
        status: elderRecord?.status || elderRecord?.problemStatement || 'Mild Cognitive Support Mode',
        problemStatement: elderRecord?.problemStatement || elderRecord?.status || 'Mild Cognitive Support Mode',
        tabletBattery: elderRecord?.tabletBattery || 94,
        lastActive: 'Just now',
        avatar: elderRecord?.avatar || '/avatar.png',
        phone: elderRecord?.phone || '',
        email: elderRecord?.email || '',
        caregiverEmail: cleanEmail,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    await identityToolkitRequest('/accounts:update', {
      localId: user.localId,
      customAttributes: JSON.stringify(claims),
    });

    console.log('[firebaseAdmin] Successfully set caregiver claims for:', user.localId);
    return { success: true, uid: user.localId, claims };
  }

  throw new Error('Failed to resolve or create caregiver user in Firebase Auth.');
}

/**
 * Backward compatibility helpers
 */
export function getAdminAuth() {
  return {
    getUserByEmail: async (email) => {
      const u = await firebaseLookupUser(email);
      if (!u) throw new Error('User not found');
      return u;
    },
    getUser: async (uid) => {
      const u = await firebaseLookupUser(uid);
      if (!u) throw new Error('User not found');
      return u;
    },
  };
}

export async function syncCaregiverToFirebaseAuth(caregiver, elder) {
  return firebaseSaveCaregiver(caregiver, elder);
}

export async function syncElderToFirebaseAuth(elder, caregiver) {
  return firebaseSaveElder(elder, caregiver);
}

export const adminDb = null;
export const adminAuth = null;
export const adminApp = null;
export default { firebaseLookupUser, firebaseSaveElder, firebaseSaveCaregiver };
