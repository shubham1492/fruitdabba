const { createClient } = require('@supabase/supabase-js');

// No dotenv require needed. We will pass --env-file=.env.local to node command.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing Supabase environment variables in process.env.");
  console.error("Ensure you run this script using Node's env flag: node --env-file=.env.local scripts/find-or-create-admin.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = 'tryfruitdabba@gmail.com';
  console.log(`Checking for user: ${email}...`);

  // List users to check if they exist
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    process.exit(1);
  }

  let user = users.find(u => u.email === email);

  if (!user) {
    console.log(`User ${email} does not exist. Creating user...`);
    const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: 'FruitDabba Admin' },
      app_metadata: { role: 'admin' }
    });

    if (createError) {
      console.error("Error creating user:", createError);
      process.exit(1);
    }

    user = newUser;
    console.log(`User created with ID: ${user.id}`);
  } else {
    console.log(`User ${email} exists with ID: ${user.id}. Updating user role & metadata...`);
    // Update user auth role & metadata
    const { data: { user: updatedUser }, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      role: 'admin',
      user_metadata: { ...user.user_metadata, role: 'admin' },
      app_metadata: { ...user.app_metadata, role: 'admin' }
    });

    if (updateError) {
      console.error("Error updating auth user:", updateError);
      process.exit(1);
    }
    user = updatedUser;
    console.log(`Auth user updated successfully.`);
  }

  // Now, update or insert the profile in the public.profiles table
  console.log("Checking if profile exists in public.profiles...");
  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileFetchError && profileFetchError.code !== 'PGRST116') { // PGRST116 is code for no rows returned
    console.error("Error checking profile:", profileFetchError);
  }

  if (!profile) {
    console.log("Profile does not exist. Inserting profile...");
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: 'FruitDabba Admin',
        role: 'admin',
        phone: user.phone || null
      });

    if (insertError) {
      console.error("Error inserting profile:", insertError);
      process.exit(1);
    }
    console.log("Profile inserted successfully.");
  } else {
    console.log("Profile exists. Updating role to 'admin'...");
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        full_name: profile.full_name || 'FruitDabba Admin'
      })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error("Error updating profile:", updateProfileError);
      process.exit(1);
    }
    console.log("Profile updated successfully.");
  }

  console.log(`\n🎉 Success! User ${email} (ID: ${user.id}) is now configured as an admin in both Auth and public.profiles.`);
}

main().catch(console.error);
