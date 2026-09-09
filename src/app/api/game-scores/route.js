import { NextResponse } from 'next/server';
import { saveGameScoreToDb, getGameScoresFromDb, clearGameScoresFromDb } from '../../../lib/serverDb.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId') || searchParams.get('phone') || searchParams.get('email');
    const caregiverEmail = searchParams.get('caregiverEmail');

    const result = await getGameScoresFromDb({ elderId, caregiverEmail });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /game-scores GET error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { elderId, caregiverEmail, score, moves, matchedPairs, accuracy, durationSeconds, status, date } = body;

    const result = await saveGameScoreToDb({
      elderId,
      caregiverEmail,
      score,
      moves,
      matchedPairs,
      accuracy,
      durationSeconds,
      status,
      date,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /game-scores POST error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId') || searchParams.get('phone') || searchParams.get('email');
    const caregiverEmail = searchParams.get('caregiverEmail');

    const result = await clearGameScoresFromDb({ elderId, caregiverEmail });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /game-scores DELETE error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
