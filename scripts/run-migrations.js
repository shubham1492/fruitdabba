// Run all migrations against Supabase via the REST SQL endpoint
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://yvhtcgafontmnvcbtjlc.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHRjZ2Fmb250bW52Y2J0amxjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg4NzU2OSwiZXhwIjoyMDk3NDYzNTY5fQ.AKo4QtY0NU13U4x-ZkNlEWcmUfRRchdd3MvUUKTnXSo'

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

// Only run the complete setup (which includes everything)
const migrationFiles = [
  '000_complete_setup.sql'
]

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    },
    body: JSON.stringify({ sql })
  })
  
  if (!response.ok) {
    const err = await response.text()
    // Try direct SQL endpoint
    return { error: err, status: response.status }
  }
  return { data: await response.json(), error: null }
}

async function runSQLDirect(sql) {
  // Use the pg REST endpoint
  const response = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  })
  
  if (!response.ok) {
    const err = await response.text()
    return { error: err, status: response.status }
  }
  return { data: await response.json(), error: null }
}

async function main() {
  console.log('🚀 Starting Supabase migrations...\n')
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file)
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} (not found)`)
      continue
    }
    
    const sql = fs.readFileSync(filePath, 'utf8')
    console.log(`📄 Running: ${file} (${(sql.length / 1024).toFixed(1)} KB)`)
    
    const result = await runSQL(sql)
    if (result.error) {
      console.log(`   ⚠️  RPC method failed (status ${result.status}): ${result.error.slice(0, 200)}`)
      console.log(`   → This is expected if exec_sql function doesn't exist yet`)
    } else {
      console.log(`   ✅ Success!`)
    }
  }
  
  console.log('\n✅ Migration script completed!')
  console.log('ℹ️  If errors occurred, please run the SQL manually in Supabase Dashboard → SQL Editor')
}

main().catch(console.error)
