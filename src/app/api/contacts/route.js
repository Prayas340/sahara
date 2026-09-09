import { NextResponse } from 'next/server';
import { saveContactsToDb, getContactsFromDb } from '../../../lib/serverDb.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId');
    const caregiverEmail = searchParams.get('caregiverEmail');

    const contacts = await getContactsFromDb({ elderId, caregiverEmail });
    return NextResponse.json({
      success: true,
      contacts: contacts || [],
    });
  } catch (err) {
    console.error('[API contacts GET error]:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { elderId, caregiverEmail, contacts } = body;

    if (!Array.isArray(contacts)) {
      return NextResponse.json(
        { success: false, message: 'Contacts list must be an array.' },
        { status: 400 }
      );
    }

    const result = await saveContactsToDb({ elderId, caregiverEmail, contacts });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[API contacts POST error]:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
