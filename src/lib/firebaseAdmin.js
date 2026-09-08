import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { JWT } from 'google-auth-library';

// Sahara Firebase Service Account credentials for sahara-63072
const rawKey = process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDc0vdir0xIFRb9\nQM8wBRADtYSrp373rVgpi8OCpUtPdp4FsBMvgvmbVT8eL7RQ1km2A6hxPXmfc53X\nLUg4x7R/N63mE4BtSt7SICnrIjTTRNn5NovRapc3GwhcmLm4mNLYgCOWgxLOjLYo\na1Vh9rL91BYleGUM7V/964Fuow5x1xpnDWBJu2Ecyav3B2OftsCn2qgQDgF/cwBM\nmU6Ea66Hg4BQ1MdD05mfKVL7Z6+sT6eYbFYf2eqw3LpowsbDsf8awehG8EpvaOPo\nxNO2PzcKVmTWNrVwxZAJDY5lVrMLMT39T6CMAui2sk4U32QLnq/YbmB67c1vorfI\nc6BzF+pDAgMBAAECggEAD5Vv0e4PExMx8SNuu7PPwoM/3qFOa4o3K49qd8DUhMIZ\nOsuHPxYeKWEluCqjrgTBZO/zJjKxb5hILlRKwX8OdN/oDNGZgZ0EBo4whyB9298D\nBvxbd6bvDvuAZpB8otNeJds9J7UOUbdKb6XLe8NeNF2QRoqtjvD9kjzZgIZPUac7\n5dac/RT/49upjZDt7B7yN2kUG3jqUy62Ag9QMnLrKip3XgsMTLAkmChdVmtMof5b\nHZ87Qt4AiDgEe5XsRUlrl1XMyfYa4uMWFzKwmI5z+ATuZnXX0gWQfSU5HLAPO7RT\n+SKLcSlFS+6OYe7Qjv40CGvXp3DAXm+407R50QU7UQKBgQD4LmW9cgrj0447c6pW\nkRMRZ2uT/uqOeSd+ul1awMv93cUZJMw7ssjPCMRlwxD155bj3noHEMUBtqAG7OAT\n0gxW/eReVmnlMzM9jVoizfzFwekJJAUYm5Md/x4J+CPZqhs3Ta4GkuCg8Dsbtf2u\nT0Q6vdGypfqHZQHitQJU2csjiQKBgQDjx+5ifFw/Bg93wGOqh2xeshv3pCaBPpXV\nG+45hSAulSxpd/PTJoWLhpDnTzgO4fKn8PJQtsgdmrnBnthbM0+Xk4RcZgqxkK1g\nRDyYQyTM6ypqSYLMKmq1o40y9E1BkEUJieiHqwyOq0vW2Qf8X+4F0CveaiezrqEY\nMYl0eduQawKBgQCxj0BrEbSI20rfbhloZdLmmL922uKlnDiNinhP/a/0qT3ih1k3\nPOo+dV9ODwmLZW2nCfz0ISNR3n8PdVm71IPPmUZR2DFbMg5u8zqRvB4kvl8jkwmy\nWVwgEe5D46yChhmCr6jaOytK+ZTQdpxQoZWHEVd+IRHk3HdE44wPeOLFQQKBgQDT\nRLN0oYgl5IcgOU+38ZewVV7fWF9mbRgn65oPu8xXqIDi6iE67XXcLdnk0XNbSnL5\nFeCKwJ3n54T3c0+Vd4gRPP/9e5/bhidpLKFPUKencU+L+dbZa1ZCVwo2AqZNc3S1\nHjaQ7zPceEEFa5Oen5NzzNuDlc5xOD2u5PNrF0NxNQKBgQCXD7glMDWn63rpcbHI\nvnyTFqp2F/F+l7obFQKkIcal5usGCy6eKle5rlZqhWu0ypeyP+QGvB/ihlH8LMZM\n3toR9HvvDxvxVc54PDypfxb8eM2YPOipt4ICjg6TqzqDmlBspuZt2le7WZFHyeV3\nRy2sfqk9pUFOW6tyXVC/vWZ3cg==\n-----END PRIVATE KEY-----\n';

export const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID || 'sahara-63072',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'c05188fc7b424829ff83fb48462c8a955c480402',
  private_key: rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@sahara-63072.iam.gserviceaccount.com',
};

const PROJECT_NUMBER = '887187131198';

let adminApp = null;
let adminDb = null;

try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
  } else {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: 'sahara-63072',
    });
  }
  if (adminApp) {
    adminDb = getFirestore(adminApp);
  }
} catch (err) {
  console.warn('[firebaseAdmin] Setup notice:', err.message);
}

// Helper to obtain Google Cloud OAuth access token using Service Account
export async function getServiceAccountToken() {
  try {
    const jwt = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: [
        'https://www.googleapis.com/auth/identitytoolkit',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase',
      ],
    });
    const tokens = await jwt.authorize();
    return tokens?.access_token || null;
  } catch (err) {
    console.warn('[firebaseAdmin] getServiceAccountToken notice:', err.message);
    return null;
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
    const token = await getServiceAccountToken();
    if (!token) return null;

    const payload = isEmail ? { email: [cleanId.toLowerCase()] } : { phoneNumber: [cleanId] };
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_NUMBER}/accounts:lookup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.users || data.users.length === 0) return null;

    const user = data.users[0];
    let customAttrs = {};
    if (user.customAttributes) {
      try {
        customAttrs = JSON.parse(user.customAttributes);
      } catch (e) {}
    }

    return {
      localId: user.localId,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      customAttributes: customAttrs,
    };
  } catch (err) {
    console.warn('[firebaseAdmin] firebaseLookupUser notice:', err.message);
    return null;
  }
}

/**
 * Save or update Elder in Firebase Auth with full metadata customAttributes
 */
export async function firebaseSaveElder(elderRecord, caregiverRecord) {
  if (!elderRecord) return null;
  const email = elderRecord.email ? elderRecord.email.trim().toLowerCase() : null;
  const phone = elderRecord.phone || null;

  try {
    const token = await getServiceAccountToken();
    if (!token) return null;

    // 1. Check if user already exists in Firebase Auth
    let existing = null;
    if (email) existing = await firebaseLookupUser(email);
    if (!existing && phone) existing = await firebaseLookupUser(phone);

    let localId = existing?.localId;

    // 2. If user doesn't exist, create user in Firebase Auth
    if (!localId) {
      const createBody = {
        displayName: elderRecord.name || 'Sahara Elder',
      };
      if (email) createBody.email = email;
      if (phone && phone.startsWith('+')) createBody.phoneNumber = phone;

      const createRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_NUMBER}/accounts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createBody),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        localId = createData.localId;
      }
    }

    // 3. Save profile and caregiver linkage in customAttributes
    if (localId) {
      const customAttributes = {
        role: 'elder',
        elder: elderRecord,
        caregiver: caregiverRecord ? {
          email: caregiverRecord.email,
          name: caregiverRecord.name,
          relation: caregiverRecord.relation,
          password: caregiverRecord.password,
        } : null,
        updatedAt: new Date().toISOString(),
      };

      await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_NUMBER}/accounts:update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localId,
          displayName: elderRecord.name || undefined,
          customAttributes: JSON.stringify(customAttributes),
        }),
      });
    }

    return { success: true, localId };
  } catch (err) {
    console.warn('[firebaseAdmin] firebaseSaveElder notice:', err.message);
    return null;
  }
}

/**
 * Save or update Caregiver in Firebase Auth
 */
export async function firebaseSaveCaregiver(caregiverRecord, elderRecord) {
  if (!caregiverRecord?.email) return null;
  const email = caregiverRecord.email.trim().toLowerCase();
  const password = caregiverRecord.password || 'care123';
  const cleanPassword = password.length >= 6 ? password : `${password}123`;

  try {
    const token = await getServiceAccountToken();
    if (!token) return null;

    let existing = await firebaseLookupUser(email);
    let localId = existing?.localId;

    if (!localId) {
      const createRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_NUMBER}/accounts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: cleanPassword,
          displayName: caregiverRecord.name || 'Caregiver Companion',
        }),
      });
      if (createRes.ok) {
        const createData = await createRes.json();
        localId = createData.localId;
      }
    }

    if (localId) {
      const customAttributes = {
        role: 'caregiver',
        elderId: elderRecord?.id || caregiverRecord.elderId,
        linkedElder: elderRecord || null,
        password: caregiverRecord.password,
        updatedAt: new Date().toISOString(),
      };

      await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_NUMBER}/accounts:update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localId,
          password: cleanPassword,
          displayName: caregiverRecord.name || undefined,
          customAttributes: JSON.stringify(customAttributes),
        }),
      });
    }

    return { success: true, localId };
  } catch (err) {
    console.warn('[firebaseAdmin] firebaseSaveCaregiver notice:', err.message);
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

export const adminAuth = null;
export { adminDb };
export default adminApp;
