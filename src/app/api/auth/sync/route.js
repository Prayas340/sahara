import { NextResponse } from 'next/server';
import { getElderFromDb, authenticateCaregiverFromDb, normalizeIdentifier, readLocalStore, writeLocalStore } from '../../../../lib/serverDb.js';
import { firebaseLookupUser, firebaseLookupCaregiver } from '../../../../lib/firebaseAdmin.js';

export const dynamic = 'force-dynamic';

/**
 * Universal Cloud Synchronization Endpoint
 * Syncs Elder View & Caregiver Portal across any device anywhere in real time.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, phone, identifier, role } = body;

    const queryId = email || phone || identifier;
    if (!queryId) {
      return NextResponse.json(
        { success: false, message: 'Email or phone identifier is required for synchronization.' },
        { status: 400 }
      );
    }

    const cleanId = String(queryId).trim();
    const isEmail = cleanId.includes('@');

    // 1. If lookup is by caregiver email
    if (isEmail || role === 'caregiver') {
      const cleanEmail = cleanId.toLowerCase();
      const fbUser = await firebaseLookupUser(cleanEmail);
      const claims = fbUser?.customClaims || fbUser?.customAttributes;

      if (claims?.linkedElder) {
        const elder = claims.linkedElder;
        const caregiver = {
          id: fbUser.uid || cleanEmail,
          email: cleanEmail,
          name: fbUser.displayName || claims.name || cleanEmail.split('@')[0],
          role: 'caregiver',
          relation: claims.relation || 'Primary Caregiver',
          elderPatient: elder.name,
          elderPatientId: elder.id,
          linkedElder: elder,
        };

        return NextResponse.json({
          success: true,
          role: 'caregiver',
          user: caregiver,
          caregiver,
          elderProfile: elder,
          message: `Synchronized with ${elder.name}'s care overview.`,
        });
      }

      // Check local store
      const store = readLocalStore();
      const cg = store.caregivers?.[cleanEmail];
      if (cg) {
        let elder = cg.linkedElder;
        if (!elder && cg.elderId) {
          elder = await getElderFromDb(cg.elderId);
        }
        if (elder) {
          return NextResponse.json({
            success: true,
            role: 'caregiver',
            user: cg,
            caregiver: cg,
            elderProfile: elder,
            message: `Synchronized with ${elder.name}'s care overview.`,
          });
        }
      }
    }

    // 2. If lookup is by elder phone or ID
    const elder = await getElderFromDb(cleanId);
    if (elder) {
      const store = readLocalStore();
      const cgEmail = elder.caregiverEmail ? elder.caregiverEmail.toLowerCase() : null;
      let caregiver = cgEmail ? store.caregivers?.[cgEmail] : null;

      if (!caregiver && cgEmail) {
        const fbCg = await firebaseLookupUser(cgEmail);
        if (fbCg) {
          caregiver = {
            id: fbCg.uid || cgEmail,
            email: cgEmail,
            name: fbCg.displayName || 'Caregiver',
            role: 'caregiver',
            relation: 'Primary Caregiver',
          };
        }
      }

      return NextResponse.json({
        success: true,
        role: 'elder',
        elder,
        caregiver: caregiver || { email: cgEmail || '', name: 'Caregiver Companion' },
        message: `Synchronized profile for ${elder.name}.`,
      });
    }

    return NextResponse.json({
      success: false,
      message: `No active account found for identifier "${cleanId}".`,
    }, { status: 404 });

  } catch (err) {
    console.error('[API auth/sync error]:', err);
    return NextResponse.json(
      { success: false, message: 'Sync error: ' + err.message },
      { status: 500 }
    );
  }
}
