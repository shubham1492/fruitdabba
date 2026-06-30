require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node scripts/make-admin.js <email>');
    process.exit(1);
  }

  // Find user by email to get their ID
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('Error fetching users:', userError);
    process.exit(1);
  }

  const user = userData.users.find(u => u.email === email);
  if (!user) {
    console.error(`User with email ${email} not found. Please log in to the app first to create an account.`);
    process.exit(1);
  }

  // Update profile role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
    process.exit(1);
  }

  console.log(`✅ Success! ${email} is now an admin. You can now access the admin panel at http://localhost:3000/admin`);
}

makeAdmin();
