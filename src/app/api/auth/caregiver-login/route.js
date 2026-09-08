import { NextResponse } from 'next/server';
import { authenticateCaregiverFromDb } from '../../../../lib/serverDb.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const result = await authenticateCaregiverFromDb({ email, password });

    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user,
        elderProfile: result.elderProfile,
        message: result.message,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: result.message || 'Invalid caregiver credentials.',
      },
      { status: 401 }
    );
  } catch (err) {
    console.error('[API caregiver-login error]:', err);
    return NextResponse.json(
      { success: false, message: 'Server authentication error: ' + err.message },
      { status: 500 }
    );
  }
}
