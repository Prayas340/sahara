import { NextResponse } from 'next/server';
import {
  getRemindersFromDb,
  saveRemindersToDb,
  addReminderToDb,
  deleteReminderFromDb,
  toggleReminderStatusInDb,
} from '../../../lib/serverDb.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId');
    const caregiverEmail = searchParams.get('caregiverEmail');

    const result = await getRemindersFromDb({ elderId, caregiverEmail });
    return NextResponse.json(result);
  } catch (err) {
    console.error('API /api/reminders GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, elderId, caregiverEmail, reminder, reminderId, medicines, taken, takenAt, takenDate } = body;

    let result;
    if (action === 'add' && reminder) {
      result = await addReminderToDb({ elderId, caregiverEmail, reminder });
    } else if (action === 'delete' && reminderId) {
      result = await deleteReminderFromDb({ elderId, caregiverEmail, reminderId });
    } else if (action === 'toggle' && reminderId) {
      result = await toggleReminderStatusInDb({ elderId, caregiverEmail, reminderId, taken, takenAt, takenDate });
    } else if (medicines && Array.isArray(medicines)) {
      result = await saveRemindersToDb({ elderId, caregiverEmail, medicines });
    } else {
      result = await getRemindersFromDb({ elderId, caregiverEmail });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('API /api/reminders POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
