import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/notifications/subscribe
 * Body: { userId: string, token: string }
 * Saves (or updates) an FCM device token for the given user.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json({ error: 'userId and token are required' }, { status: 400 });
    }

    // Upsert so the same device token isn't duplicated
    const { error } = await supabase.from('fcm_tokens').upsert(
      {
        user_id: userId,
        token,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[FCM Subscribe]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
