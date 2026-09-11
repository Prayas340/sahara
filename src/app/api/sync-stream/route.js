import { NextResponse } from 'next/server';
import { normalizeIdentifier } from '../../../lib/serverDb.js';

export const dynamic = 'force-dynamic';

// Global in-memory broadcast bus for sub-second cross-window/cross-device live synchronization
if (!global._saharaLiveSubscribers) {
  global._saharaLiveSubscribers = new Map(); // elderId -> Set of controller objects
}
if (!global._saharaLatestDailyLogs) {
  global._saharaLatestDailyLogs = new Map(); // elderId -> latest state payload
}

const subscribers = global._saharaLiveSubscribers;
const latestLogs = global._saharaLatestDailyLogs;

/**
 * GET: Server-Sent Events (SSE) subscription endpoint
 * Caregiver or Elder portals connect to: /api/sync-stream?elderId=...
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawElderId = searchParams.get('elderId') || '';
  const elderId = normalizeIdentifier(rawElderId);

  if (!elderId) {
    return NextResponse.json({ error: 'Missing elderId parameter' }, { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection confirmation
  writer.write(encoder.encode(`event: connected\ndata: ${JSON.stringify({ elderId, time: Date.now() })}\n\n`));

  // If we already have a recent dailyLog state for this elder, send it immediately
  if (latestLogs.has(elderId)) {
    const cached = latestLogs.get(elderId);
    writer.write(encoder.encode(`event: update\ndata: ${JSON.stringify(cached)}\n\n`));
  }

  // Register subscriber
  if (!subscribers.has(elderId)) {
    subscribers.set(elderId, new Set());
  }
  const elderSubs = subscribers.get(elderId);

  const client = {
    id: Math.random().toString(36).slice(2),
    send: (payload) => {
      try {
        writer.write(encoder.encode(`event: update\ndata: ${JSON.stringify(payload)}\n\n`));
      } catch (e) {
        // Closed stream
      }
    },
    close: () => {
      try {
        writer.close();
      } catch (e) {}
    }
  };

  elderSubs.add(client);

  request.signal.addEventListener('abort', () => {
    elderSubs.delete(client);
    if (elderSubs.size === 0) {
      subscribers.delete(elderId);
    }
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * POST: Broadcast mutation event to all active real-time listeners for this elderId
 * Called when a routine is marked taken, a score is awarded, or a new routine is added.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { elderId: rawElderId, action, data } = body;
    const elderId = normalizeIdentifier(rawElderId);

    if (!elderId) {
      return NextResponse.json({ success: false, error: 'Missing elderId' }, { status: 400 });
    }

    const payload = {
      elderId,
      action: action || 'mutation',
      data: data || {},
      timestamp: Date.now(),
    };

    // Cache latest log state
    const prev = latestLogs.get(elderId) || {};
    latestLogs.set(elderId, {
      ...prev,
      ...payload.data,
      lastAction: action,
      lastUpdatedAt: Date.now(),
    });

    // Broadcast to all active subscribers for this elder
    const elderSubs = subscribers.get(elderId);
    if (elderSubs && elderSubs.size > 0) {
      for (const client of elderSubs) {
        client.send(payload);
      }
    }

    return NextResponse.json({
      success: true,
      subscribersCount: elderSubs ? elderSubs.size : 0,
    });
  } catch (err) {
    console.error('[sync-stream POST error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
