import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

interface SendPayload {
  userId?: string;        // Send to a single user
  userIds?: string[];     // Send to multiple users
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * POST /api/notifications/send
 * Admin-only endpoint to send push notifications via FCM REST API.
 * Body: { userId?, userIds?, title, body, data? }
 */
export async function POST(req: NextRequest) {
  // Basic admin guard (use service-role header or a secret)
  const authHeader = req.headers.get('x-admin-secret');
  if (authHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createAdminClient();
    const payload: SendPayload = await req.json();
    const { title, body, data, userId, userIds } = payload;

    // Fetch relevant tokens
    let query = supabase.from('fcm_tokens').select('token');
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (userIds?.length) {
      query = query.in('user_id', userIds);
    }
    const { data: tokenRows, error } = await query;
    if (error) throw error;

    const tokens = tokenRows?.map((r: any) => r.token) ?? [];
    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No tokens found' });
    }

    // Send via FCM v1 API using OAuth2 server key
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/messages:send`;
    const serverKey = process.env.FIREBASE_SERVER_KEY!;

    const results = await Promise.allSettled(
      tokens.map((token: any) =>
        fetch(fcmUrl, {
          method: 'POST',
          headers: {
            Authorization: `key=${serverKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
              data: data || {},
              webpush: {
                notification: {
                  icon: '/images/hero-fruit-box.png',
                  badge: '/images/hero-fruit-box.png',
                  requireInteraction: false,
                },
              },
            },
          }),
        })
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    return NextResponse.json({ success: true, sent, total: tokens.length });
  } catch (err: any) {
    console.error('[FCM Send]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
