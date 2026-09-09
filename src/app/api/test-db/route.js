import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const info = {
    envVercel: process.env.VERCEL || null,
    nodeEnv: process.env.NODE_ENV || null,
    hasPrivateKeyEnv: Boolean(process.env.FIREBASE_PRIVATE_KEY),
  };

  try {
    const adminApp = await import('firebase-admin/app');
    info.firebaseAdminApp = 'loaded: ' + typeof adminApp.initializeApp;
  } catch (e) {
    info.firebaseAdminAppError = e.message;
  }

  try {
    const adminAuth = await import('firebase-admin/auth');
    info.firebaseAdminAuth = 'loaded: ' + typeof adminAuth.getAuth;
  } catch (e) {
    info.firebaseAdminAuthError = e.message;
  }

  try {
    const fbAdmin = await import('../../../lib/firebaseAdmin.js');
    info.firebaseAdminJs = 'loaded';
    try {
      const auth = fbAdmin.getAdminAuth();
      info.getAdminAuth = Boolean(auth);
    } catch (authErr) {
      info.getAdminAuthError = authErr.message;
    }
  } catch (e) {
    info.firebaseAdminJsError = e.message;
    info.firebaseAdminJsStack = e.stack;
  }

  try {
    const serverDb = await import('../../../lib/serverDb.js');
    info.serverDb = 'loaded';
    try {
      const store = serverDb.readLocalStore();
      info.readLocalStore = Boolean(store);
    } catch (storeErr) {
      info.readLocalStoreError = storeErr.message;
    }
  } catch (e) {
    info.serverDbError = e.message;
    info.serverDbStack = e.stack;
  }

  return NextResponse.json(info);
}
