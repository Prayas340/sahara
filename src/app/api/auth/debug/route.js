import { NextResponse } from 'next/server';
import { getAdminAuth, serviceAccount } from '../../../../lib/firebaseAdmin.js';
import { readLocalStore } from '../../../../lib/serverDb.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const diagnostics = {
    time: new Date().toISOString(),
    isVercel: Boolean(process.env.VERCEL),
    hasEnvPrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    privateKeyLength: (process.env.FIREBASE_PRIVATE_KEY || '').length,
    serviceAccountKeyLength: (serviceAccount?.private_key || '').length,
    serviceAccountProjectId: serviceAccount?.project_id,
    serviceAccountClientEmail: serviceAccount?.client_email,
  };

  try {
    const auth = getAdminAuth();
    diagnostics.authInitialized = Boolean(auth);
  } catch (err) {
    diagnostics.authError = err.message;
    diagnostics.authStack = err.stack;
  }

  try {
    const store = readLocalStore();
    diagnostics.storeLoaded = Boolean(store);
    diagnostics.elderCount = Object.keys(store?.elders || {}).length;
    diagnostics.cgCount = Object.keys(store?.caregivers || {}).length;
  } catch (err) {
    diagnostics.storeError = err.message;
  }

  return NextResponse.json(diagnostics);
}
