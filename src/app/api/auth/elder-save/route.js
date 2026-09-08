import { NextResponse } from 'next/server';
import { saveElderToDb } from '../../../../lib/serverDb.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, patientData, caregiverData } = body;

    const result = await saveElderToDb({
      rawIdentifier: identifier || patientData?.phone || patientData?.email,
      patientData,
      caregiverData,
    });

    return NextResponse.json({
      success: true,
      elder: result.elder,
      caregiver: result.caregiver,
      message: `Profile for ${result.elder.name} saved successfully!`,
    });
  } catch (err) {
    console.error('[API elder-save error]:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
