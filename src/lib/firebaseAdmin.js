import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Sahara Firebase Service Account credentials for sahara-63072
const rawKey = process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDc0vdir0xIFRb9\nQM8wBRADtYSrp373rVgpi8OCpUtPdp4FsBMvgvmbVT8eL7RQ1km2A6hxPXmfc53X\nLUg4x7R/N63mE4BtSt7SICnrIjTTRNn5NovRapc3GwhcmLm4mNLYgCOWgxLOjLYo\na1Vh9rL91BYleGUM7V/964Fuow5x1xpnDWBJu2Ecyav3B2OftsCn2qgQDgF/cwBM\nmU6Ea66Hg4BQ1MdD05mfKVL7Z6+sT6eYbFYf2eqw3LpowsbDsf8awehG8EpvaOPo\nxNO2PzcKVmTWNrVwxZAJDY5lVrMLMT39T6CMAui2sk4U32QLnq/YbmB67c1vorfI\nc6BzF+pDAgMBAAECggEAD5Vv0e4PExMx8SNuu7PPwoM/3qFOa4o3K49qd8DUhMIZ\nOsuHPxYeKWEluCqjrgTBZO/zJjKxb5hILlRKwX8OdN/oDNGZgZ0EBo4whyB9298D\nBvxbd6bvDvuAZpB8otNeJds9J7UOUbdKb6XLe8NeNF2QRoqtjvD9kjzZgIZPUac7\n5dac/RT/49upjZDt7B7yN2kUG3jqUy62Ag9QMnLrKip3XgsMTLAkmChdVmtMof5b\nHZ87Qt4AiDgEe5XsRUlrl1XMyfYa4uMWFzKwmI5z+ATuZnXX0gWQfSU5HLAPO7RT\n+SKLcSlFS+6OYe7Qjv40CGvXp3DAXm+407R50QU7UQKBgQD4LmW9cgrj0447c6pW\nkRMRZ2uT/uqOeSd+ul1awMv93cUZJMw7ssjPCMRlwxD155bj3noHEMUBtqAG7OAT\n0gxW/eReVmnlMzM9jVoizfzFwekJJAUYm5Md/x4J+CPZqhs3Ta4GkuCg8Dsbtf2u\nT0Q6vdGypfqHZQHitQJU2csjiQKBgQDjx+5ifFw/Bg93wGOqh2xeshv3pCaBPpXV\nG+45hSAulSxpd/PTJoWLhpDnTzgO4fKn8PJQtsgdmrnBnthbM0+Xk4RcZgqxkK1g\nRDyYQyTM6ypqSYLMKmq1o40y9E1BkEUJieiHqwyOq0vW2Qf8X+4F0CveaiezrqEY\nMYl0eduQawKBgQCxj0BrEbSI20rfbhloZdLmmL922uKlnDiNinhP/a/0qT3ih1k3\nPOo+dV9ODwmLZW2nCfz0ISNR3n8PdVm71IPPmUZR2DFbMg5u8zqRvB4kvl8jkwmy\nWVwgEe5D46yChhmCr6jaOytK+ZTQdpxQoZWHEVd+IRHk3HdE44wPeOLFQQKBgQDT\nRLN0oYgl5IcgOU+38ZewVV7fWF9mbRgn65oPu8xXqIDi6iE67XXcLdnk0XNbSnL5\nFeCKwJ3n54T3c0+Vd4gRPP/9e5/bhidpLKFPUKencU+L+dbZa1ZCVwo2AqZNc3S1\nHjaQ7zPceEEFa5Oen5NzzNuDlc5xOD2u5PNrF0NxNQKBgQCXD7glMDWn63rpcbHI\nvnyTFqp2F/F+l7obFQKkIcal5usGCy6eKle5rlZqhWu0ypeyP+QGvB/ihlH8LMZM\n3toR9HvvDxvxVc54PDypfxb8eM2YPOipt4ICjg6TqzqDmlBspuZt2le7WZFHyeV3\nRy2sfqk9pUFOW6tyXVC/vWZ3cg==\n-----END PRIVATE KEY-----\n';

function formatPrivateKey(key) {
  if (!key) return '';
  let clean = key.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  return clean.replace(/\\n/g, '\n');
}

export const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID || 'sahara-63072',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'c05188fc7b424829ff83fb48462c8a955c480402',
  private_key: formatPrivateKey(rawKey),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@sahara-63072.iam.gserviceaccount.com',
};

let adminApp = null;
let adminAuth = null;

export function getAdminAuth() {
  if (adminAuth) return adminAuth;
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
    } else {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    }
    if (adminApp) {
      adminAuth = getAuth(adminApp);
    }
    return adminAuth;
  } catch (err) {
    console.error('[firebaseAdmin] Setup error:', err.message);
    return null;
  }
}

// Initial setup
getAdminAuth();

/**
 * Lookup user in Firebase Auth on project sahara-63072
 */
export async function firebaseLookupUser(identifier) {
  const auth = getAdminAuth();
  if (!identifier || !auth) return null;
  const cleanId = String(identifier).trim();
  const isEmail = cleanId.includes('@');

  try {
    let user = null;
    if (isEmail) {
      user = await auth.getUserByEmail(cleanId.toLowerCase()).catch(() => null);
    } else if (cleanId.startsWith('+')) {
      user = await auth.getUserByPhoneNumber(cleanId).catch(() => null);
    } else {
      user = await auth.getUser(cleanId).catch(() => null);
    }

    if (!user) return null;

    return {
      localId: user.uid,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      customAttributes: user.customClaims || {},
      customClaims: user.customClaims || {},
    };
  } catch (err) {
    console.warn('[firebaseAdmin] firebaseLookupUser notice:', err.message);
    return null;
  }
}

/**
 * Lookup caregiver directly in Firebase Auth
 */
export async function firebaseLookupCaregiver(email) {
  const auth = getAdminAuth();
  if (!email || !auth) return null;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await auth.getUserByEmail(cleanEmail).catch(() => null);
    if (!user) return null;

    return {
      uid: user.uid,
      localId: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims || {},
      customAttributes: user.customClaims || {},
    };
  } catch (err) {
    console.warn('[firebaseAdmin] firebaseLookupCaregiver notice:', err.message);
    return null;
  }
}

/**
 * Save or update Elder in Firebase Auth
 */
export async function firebaseSaveElder(elderRecord, caregiverRecord) {
  const auth = getAdminAuth();
  if (!elderRecord || !auth) return null;
  const rawEmail = elderRecord.email ? elderRecord.email.trim().toLowerCase() : null;
  const cgEmail = caregiverRecord?.email ? caregiverRecord.email.trim().toLowerCase() : null;
  const email = (rawEmail && rawEmail !== cgEmail) ? rawEmail : null;
  const phone = elderRecord.phone || null;

  try {
    let user = null;
    if (email) {
      user = await auth.getUserByEmail(email).catch(() => null);
    }
    if (!user && phone && phone.startsWith('+')) {
      user = await auth.getUserByPhoneNumber(phone).catch(() => null);
    }

    if (!user) {
      const createData = {
        displayName: elderRecord.name || 'Sahara Elder',
      };
      if (email) createData.email = email;
      if (phone && phone.startsWith('+') && phone.length >= 10) {
        createData.phoneNumber = phone;
      }
      user = await auth.createUser(createData).catch(err => {
        console.warn('[firebaseAdmin] createUser notice for elder:', err.message);
        return null;
      });
    }

    if (user) {
      const claims = {
        role: 'elder',
        elder: {
          id: elderRecord.id || elderRecord.identifier || user.uid,
          name: elderRecord.name || 'Sahara Member',
          honorific: elderRecord.honorific || `${(elderRecord.name || 'Member').split(' ')[0]} ji`,
          age: elderRecord.age || 74,
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

      await auth.setCustomUserClaims(user.uid, claims);
      return { success: true, uid: user.uid };
    }

    return null;
  } catch (err) {
    console.warn('[firebaseAdmin] firebaseSaveElder error:', err.message);
    return null;
  }
}

/**
 * Save or update Caregiver in Firebase Auth with full linkedElder profile in claims
 */
export async function firebaseSaveCaregiver(caregiverRecord, elderRecord) {
  const auth = getAdminAuth();
  if (!caregiverRecord?.email || !auth) return null;
  const cleanEmail = caregiverRecord.email.trim().toLowerCase();
  const password = caregiverRecord.password || 'care123';
  const cleanPassword = password.length >= 6 ? password : `${password}123`;
  const cleanName = (caregiverRecord.name || 'Caregiver Companion').trim();

  try {
    let user = await auth.getUserByEmail(cleanEmail).catch(() => null);

    if (!user) {
      user = await auth.createUser({
        email: cleanEmail,
        password: cleanPassword,
        displayName: cleanName,
      }).catch(err => {
        console.warn('[firebaseAdmin] createUser notice for caregiver:', err.message);
        return null;
      });
    } else {
      // Update display name or password if provided
      await auth.updateUser(user.uid, {
        displayName: cleanName,
        password: cleanPassword,
      }).catch((err) => {
        console.warn('[firebaseAdmin] updateUser notice for caregiver:', err.message);
      });
    }

    if (user) {
      const elderName = elderRecord?.name || 'Sahara Member';
      const firstName = elderName.split(' ')[0];
      const honorific = elderRecord?.honorific || `${firstName} ji`;

      const claims = {
        role: 'caregiver',
        password: caregiverRecord.password || 'care123',
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

      await auth.setCustomUserClaims(user.uid, claims);
      return { success: true, uid: user.uid };
    }

    return null;
  } catch (err) {
    console.warn('[firebaseAdmin] firebaseSaveCaregiver error:', err.message);
    return null;
  }
}

/**
 * Backward compatibility sync helpers
 */
export async function syncCaregiverToFirebaseAuth(caregiver, elder) {
  return firebaseSaveCaregiver(caregiver, elder);
}

export async function syncElderToFirebaseAuth(elder, caregiver) {
  return firebaseSaveElder(elder, caregiver);
}

// Dummy export for backward compatibility so existing imports do not throw
export const adminDb = null;
export { adminAuth, adminApp };
export default adminApp;
