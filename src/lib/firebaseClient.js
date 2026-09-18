import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase App singleton
let app = null;
let auth = null;
let googleProvider = null;
let db = null;

try {
  if (firebaseConfig.apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    if (typeof window !== 'undefined') {
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    }
    db = getFirestore(app);
  } else {
    console.warn('[firebaseClient] Firebase API Key is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local');
  }
} catch (err) {
  console.warn('[firebaseClient] Initialization notice:', err.message);
}

export function normalizeElderId(userOrId) {
  if (!userOrId) {
    console.warn('[normalizeElderId] Warning: received null or undefined userOrId.');
    return null;
  }
  let raw = userOrId;
  if (typeof userOrId === 'object') {
    raw = userOrId.id || userOrId.phone || userOrId.email || userOrId.identifier;
  }
  if (!raw) {
    console.warn('[normalizeElderId] Warning: could not extract valid identifier from object:', userOrId);
    return null;
  }
  const str = String(raw).trim();
  if (!str) return null;
  const digits = str.replace(/\D/g, '');
  if (digits.length === 10) return '+91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  if (str.startsWith('+')) return str;
  if (str.includes('@')) return str.toLowerCase();
  return str;
}

export function logFirestoreOperation(portal, action, path, payload = null) {
  const time = new Date().toLocaleTimeString();
  const prefix = `[${portal.toUpperCase()} FIRESTORE ${action.toUpperCase()}] [${time}]`;
  if (payload) {
    console.log(`${prefix} Path: %c${path}`, 'color: #0d631b; font-weight: bold;', payload);
  } else {
    console.log(`${prefix} Path: %c${path}`, 'color: #0d631b; font-weight: bold;');
  }
}

export function getTodayDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export { app, auth, googleProvider, db };

