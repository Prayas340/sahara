import { NextResponse } from 'next/server';
import { getElderFromDb, normalizeIdentifier } from '../../../../lib/serverDb.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { exists: false, message: 'Identifier (phone or email) is required.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIdentifier(identifier);
    const elder = await getElderFromDb(normalized);

    if (elder) {
      return NextResponse.json({
        exists: true,
        elder,
        isNewUser: false,
        message: `Welcome back, ${elder.name}!`,
      });
    }

    return NextResponse.json({
      exists: false,
      isNewUser: true,
      identifier: normalized,
      message: 'First-time signup: please complete your profile details.',
    });
  } catch (err) {
    console.error('[API elder-check error]:', err);
    return NextResponse.json(
      { exists: false, isNewUser: true, error: err.message },
      { status: 200 }
    );
  }
}
