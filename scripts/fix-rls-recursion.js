// Fix infinite RLS recursion on profiles table
// The issue: "Admins can view all profiles" policy queries profiles to check if user is admin
// This causes infinite recursion. Fix: use auth.jwt() instead.

const SVC = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHRjZ2Fmb250bW52Y2J0amxjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg4NzU2OSwiZXhwIjoyMDk3NDYzNTY5fQ.AKo4QtY0NU13U4x-ZkNlEWcmUfRRchdd3MvUUKTnXSo';
const URL = 'https://yvhtcgafontmnvcbtjlc.supabase.co';

async function insertViaRest(table, data) {
  const r = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SVC,
      'Authorization': `Bearer ${SVC}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  return { status: r.status, body: await r.text() };
}

// The fix needs to be applied via SQL. Since we can't run SQL directly,
// let's check what policies exist
async function checkPolicies() {
  // Query pg_policies via service role
  const r = await fetch(`${URL}/rest/v1/rpc/get_policies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SVC,
      'Authorization': `Bearer ${SVC}`
    },
    body: JSON.stringify({})
  });
  console.log('get_policies status:', r.status);
  const d = await r.text();
  console.log('Response:', d.slice(0, 500));
}

checkPolicies();

// The real fix SQL that needs to be run in Supabase SQL editor:
const FIX_SQL = `
-- Fix infinite recursion in profiles RLS
-- Drop the recursive admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Replace with a non-recursive version using JWT claims
-- This reads the role from the JWT token itself, not from the profiles table
CREATE POLICY "Admins can view all profiles" ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Also fix similar recursive policies on other tables
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage plans" ON public.subscription_plans;
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage all subscriptions" ON public.subscriptions FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage all orders" ON public.orders;
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage order tracking" ON public.order_tracking;
CREATE POLICY "Admins manage order tracking" ON public.order_tracking FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins view notifications" ON public.notifications_log;
CREATE POLICY "Admins view notifications" ON public.notifications_log FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage all reviews" ON public.reviews;
CREATE POLICY "Admins manage all reviews" ON public.reviews FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');
`;

console.log('\n===========================================================');
console.log('IMPORTANT: Run this SQL in Supabase Dashboard > SQL Editor:');
console.log('===========================================================');
console.log(FIX_SQL);
