// Test Supabase connection and check existing tables
const SUPABASE_URL = 'https://yvhtcgafontmnvcbtjlc.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHRjZ2Fmb250bW52Y2J0amxjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg4NzU2OSwiZXhwIjoyMDk3NDYzNTY5fQ.AKo4QtY0NU13U4x-ZkNlEWcmUfRRchdd3MvUUKTnXSo'

async function checkTables() {
  // Check if profiles table exists
  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  })
  console.log('profiles table status:', r.status, r.status === 200 ? '✅ EXISTS' : '❌ MISSING')
  
  // Check categories
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=name&limit=5`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  })
  const cats = await r2.json()
  console.log('categories table status:', r2.status, r2.status === 200 ? '✅ EXISTS' : '❌ MISSING')
  if (r2.status === 200) console.log('  categories found:', cats)
  
  // Check reviews
  const r3 = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  })
  console.log('reviews table status:', r3.status, r3.status === 200 ? '✅ EXISTS' : '❌ MISSING')

  // Check subscription_plans
  const r4 = await fetch(`${SUPABASE_URL}/rest/v1/subscription_plans?select=name&limit=3`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  })
  const plans = await r4.json()
  console.log('subscription_plans status:', r4.status, r4.status === 200 ? '✅ EXISTS' : '❌ MISSING')
  if (r4.status === 200) console.log('  plans found:', plans)
}

checkTables().catch(console.error)
