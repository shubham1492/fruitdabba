import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time migration endpoint - only works in dev with service role key
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 400 })
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results: any[] = []

  // Create reviews table
  const reviewsSQL = `
    CREATE TABLE IF NOT EXISTS public.reviews (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      order_id      UUID REFERENCES public.orders(id) ON DELETE SET NULL,
      reviewer_name TEXT NOT NULL,
      rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      category      TEXT NOT NULL,
      title         TEXT,
      body          TEXT NOT NULL,
      image_url     TEXT,
      is_approved   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
    CREATE POLICY "Anyone can view approved reviews"
      ON public.reviews FOR SELECT
      USING (is_approved = TRUE);

    DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
    CREATE POLICY "Anyone can insert reviews"
      ON public.reviews FOR INSERT
      WITH CHECK (TRUE);

    DROP POLICY IF EXISTS "Admins manage all reviews" ON public.reviews;
    CREATE POLICY "Admins manage all reviews"
      ON public.reviews FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );

    CREATE OR REPLACE FUNCTION public.set_reviews_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
    CREATE TRIGGER set_reviews_updated_at
      BEFORE UPDATE ON public.reviews
      FOR EACH ROW
      EXECUTE FUNCTION public.set_reviews_updated_at();
  `

  // Run via supabase rpc - use a raw query approach
  let data = null
  let error = null
  try {
    const res = await supabase.rpc('exec_sql', { sql: reviewsSQL })
    data = res.data
    error = res.error
  } catch (err: any) {
    error = { message: err?.message || 'RPC not available' }
  }
  
  if (error) {
    // Try inserting a test review to see if table exists
    const { error: checkErr } = await supabase.from('reviews').select('id').limit(1)
    if (!checkErr) {
      return NextResponse.json({ 
        message: 'Reviews table already exists!', 
        status: 'ok' 
      })
    }
    
    return NextResponse.json({ 
      error: 'Could not create reviews table via RPC. Please run the SQL manually in Supabase Dashboard.',
      sql: reviewsSQL,
      instructions: 'Go to https://supabase.com/dashboard → your project → SQL Editor → paste the SQL above'
    }, { status: 500 })
  }

  results.push({ step: 'reviews_table', status: 'ok' })

  return NextResponse.json({ success: true, results })
}
