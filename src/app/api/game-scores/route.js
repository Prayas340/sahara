import { NextResponse } from 'next/server';
import { saveGameScoreToDb, getGameScoresFromDb, clearGameScoresFromDb } from '../../../lib/serverDb.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId') || searchParams.get('phone') || searchParams.get('email');
    const caregiverEmail = searchParams.get('caregiverEmail');
    const date = searchParams.get('date');

    const result = await getGameScoresFromDb({ elderId, caregiverEmail, date });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /game-scores GET error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      elderId,
      caregiverEmail,
      score,
      pointsEarned,
      level,
      mainLevel,
      subLevel,
      currentSublevel,
      unlockedLevel,
      moves,
      matchedPairs,
      accuracy,
      durationSeconds,
      remainingTimeSeconds,
      status,
      date,
      timestamp,
    } = body;

    const result = await saveGameScoreToDb({
      elderId,
      caregiverEmail,
      score: score !== undefined ? score : (pointsEarned !== undefined ? pointsEarned : 10),
      pointsEarned: pointsEarned !== undefined ? pointsEarned : 10,
      level: Number(mainLevel || level) || 1,
      subLevel: Number(subLevel) || 1,
      currentSublevel: currentSublevel ? Number(currentSublevel) : undefined,
      unlockedLevel: unlockedLevel ? Number(unlockedLevel) : undefined,
      moves,
      matchedPairs,
      accuracy,
      durationSeconds,
      remainingTimeSeconds,
      status,
      date,
      timestamp,
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
