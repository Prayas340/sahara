import { NextResponse } from 'next/server';
import { recordSosAlertInDb, getLatestSosAlertFromDb } from '../../../lib/serverDb.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      elderId = '+919854012345',
      elderName = 'Prayas Dey',
      displayHonorific = 'Prayas ji',
      caregiverEmail = 'prayasdey10@gmail.com',
      caregiverName = 'Primary Caregiver',
      location = 'Guwahati, Assam',
      phone = '+919854012345',
      status = 'Mild Cognitive Support Mode',
      timestamp = new Date().toISOString(),
    } = body;

    const formattedTime = new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    // Record immediately into server database
    let alertRecord = null;
    try {
      alertRecord = recordSosAlertInDb({
        elderId,
        elderName: `${elderName} (${displayHonorific})`,
        caregiverEmail,
        caregiverName,
        location,
        phone,
        status,
        timestamp,
      });
    } catch (dbErr) {
      console.warn('Could not record SOS in server DB:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      timestamp: formattedTime,
      elderName,
      caregiverEmail,
      alert: alertRecord,
      message: 'Emergency SOS alert registered and dispatched successfully.',
    });
  } catch (err) {
    console.error('Error processing SOS alert:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch SOS alert' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId');
    const caregiverEmail = searchParams.get('caregiverEmail');

    const alert = getLatestSosAlertFromDb(elderId, caregiverEmail);
    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      alert: null,
    });
  }
}

