// Run specific SQL migrations on Supabase using the Management API
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'yvhtcgafontmnvcbtjlc'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHRjZ2Fmb250bW52Y2J0amxjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg4NzU2OSwiZXhwIjoyMDk3NDYzNTY5fQ.AKo4QtY0NU13U4x-ZkNlEWcmUfRRchdd3MvUUKTnXSo'

async function runSQL(query) {
  const response = await fetch(`https://yvhtcgafontmnvcbtjlc.supabase.co/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query })
  })
  return response
}

// Use pg endpoint via service role
async function execSQL(sql) {
  // Split by semicolons and run each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let success = 0
  let failed = 0
  
  for (const stmt of statements) {
    try {
      // Try using the pg/query endpoint
      const r = await fetch(`https://yvhtcgafontmnvcbtjlc.supabase.co/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: stmt + ';' })
      })
      if (r.ok) {
        success++
      } else {
        const err = await r.text()
        console.log(`  STMT FAILED (${r.status}): ${stmt.slice(0, 60)}...`)
        console.log(`  Error: ${err.slice(0, 150)}`)
        failed++
      }
    } catch(e) {
      failed++
    }
  }
  return { success, failed }
}

async function main() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  
  // Run only what's missing: reviews table (003) and profile trigger update (004)
  const toRun = ['003_reviews_table.sql', '004_update_profile_trigger.sql']
  
  for (const file of toRun) {
    const filePath = path.join(migrationsDir, file)
    if (!fs.existsSync(filePath)) { console.log(`Skipping ${file}`); continue }
    
    const sql = fs.readFileSync(filePath, 'utf8')
    console.log(`\n📄 Running: ${file}`)
    const { success, failed } = await execSQL(sql)
    console.log(`   ✅ ${success} statements OK, ❌ ${failed} failed`)
  }
  
  // Verify reviews table now exists
  const check = await fetch('https://yvhtcgafontmnvcbtjlc.supabase.co/rest/v1/reviews?select=id&limit=1', {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  })
  console.log('\n🔍 Reviews table check:', check.status === 200 ? '✅ EXISTS' : `❌ MISSING (${check.status})`)
  
  // Also insert seed products if not present
  const prodCheck = await fetch('https://yvhtcgafontmnvcbtjlc.supabase.co/rest/v1/products?select=id&limit=1', {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  })
  const prodData = await prodCheck.json()
  console.log('🔍 Products table check:', prodCheck.status === 200 ? '✅ EXISTS' : '❌ MISSING')
  console.log('   Products count:', Array.isArray(prodData) ? prodData.length : 'N/A')
}

main().catch(console.error)
