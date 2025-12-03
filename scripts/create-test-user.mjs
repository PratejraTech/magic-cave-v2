#!/usr/bin/env node

/**
 * Create Test User Script
 *
 * Creates a test parent account with child profile for development/testing
 * Usage: node scripts/create-test-user.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
const envPath = join(__dirname, '..', '.env.test');
let envVars = {};

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (error) {
  console.error('Error loading .env.test file:', error.message);
  console.log('Make sure .env.test exists with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const SUPABASE_URL = envVars.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.log('Please check your .env.test file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test user data
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPass123!',
  name: 'Test Parent',
  child: {
    name: 'Test Child',
    birthdate: '2015-12-01', // 9 years old
    gender: 'male',
    interests: { 'sports': true, 'reading': true, 'art': false }
  },
  template: 'pastel-dreams' // Use pastel dreams template
};

// Hash password using same algorithm as auth.mjs
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'advent-calendar-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createTestUser() {
  console.log('🚀 Creating test user...');

  try {
    // Check if test user already exists
    const { data: existingUsers } = await supabase
      .from('parents')
      .select('email')
      .eq('email', TEST_USER.email)
      .single();

    if (existingUsers) {
      console.log('❌ Test user already exists:', TEST_USER.email);
      console.log('To recreate, first delete the existing user from Supabase dashboard or database');
      return;
    }

    // Generate family UUID
    const familyUuid = crypto.randomUUID();

    // Hash the temporary password for child login
    const tempPassword = 'test123';
    const hashedTempPassword = await hashPassword(tempPassword);

    // Map template ID to UUID
    const templateMapping = {
      'pastel-dreams': '550e8400-e29b-41d4-a716-446655440000',
      'adventure-boy': '550e8400-e29b-41d4-a716-446655440001',
      'rainbow-fantasy': '550e8400-e29b-41d4-a716-446655440002'
    };

    const templateUuid = templateMapping[TEST_USER.template];
    if (!templateUuid) {
      throw new Error(`Invalid template: ${TEST_USER.template}`);
    }

    console.log('📧 Creating Supabase auth user...');

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: {
        name: TEST_USER.name,
        role: 'parent'
      }
    });

    if (authError) {
      throw new Error(`Auth user creation failed: ${authError.message}`);
    }

    console.log('👨 Creating parent record...');

    // Create parent record
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .insert({
        parent_uuid: authData.user.id,
        name: TEST_USER.name,
        email: TEST_USER.email,
        auth_provider: 'email',
        family_uuid: familyUuid
      })
      .select()
      .single();

    if (parentError) {
      // Clean up auth user if parent creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Parent creation failed: ${parentError.message}`);
    }

    console.log('👶 Creating child profile...');

    // Create child profile
    const { data: childData, error: childError } = await supabase
      .from('children')
      .insert({
        parent_uuid: parentData.parent_uuid,
        name: TEST_USER.child.name,
        birthdate: TEST_USER.child.birthdate,
        gender: TEST_USER.child.gender,
        interests: TEST_USER.child.interests,
        selected_template: templateUuid,
        password_hash: hashedTempPassword,
        password_updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (childError) {
      // Clean up on error
      await supabase.from('parents').delete().eq('parent_uuid', parentData.parent_uuid);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Child creation failed: ${childError.message}`);
    }

    console.log('📅 Creating calendar...');

    // Create calendar for the child
    const { data: calendarData, error: calendarError } = await supabase
      .from('calendars')
      .insert({
        child_uuid: childData.child_uuid,
        parent_uuid: parentData.parent_uuid,
        template_id: templateUuid
      })
      .select()
      .single();

    if (calendarError) {
      // Clean up on error
      await supabase.from('children').delete().eq('child_uuid', childData.child_uuid);
      await supabase.from('parents').delete().eq('parent_uuid', parentData.parent_uuid);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Calendar creation failed: ${calendarError.message}`);
    }

    console.log('🎄 Creating calendar tiles...');

    // Create 25 calendar tiles
    const tilesData = [];
    for (let day = 1; day <= 25; day++) {
      tilesData.push({
        calendar_id: calendarData.calendar_id,
        day: day
      });
    }

    const { error: tilesError } = await supabase
      .from('calendar_tiles')
      .insert(tilesData);

    if (tilesError) {
      // Clean up on error
      await supabase.from('calendar_tiles').delete().eq('calendar_id', calendarData.calendar_id);
      await supabase.from('calendars').delete().eq('calendar_id', calendarData.calendar_id);
      await supabase.from('children').delete().eq('child_uuid', childData.child_uuid);
      await supabase.from('parents').delete().eq('parent_uuid', parentData.parent_uuid);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Tiles creation failed: ${tilesError.message}`);
    }

    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('📋 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Parent Login:`);
    console.log(`  Email: ${TEST_USER.email}`);
    console.log(`  Password: ${TEST_USER.password}`);
    console.log('');
    console.log(`Child Login:`);
    console.log(`  Family Code: ${familyUuid}`);
    console.log(`  Password: ${tempPassword}`);
    console.log('');
    console.log(`Child Details:`);
    console.log(`  Name: ${TEST_USER.child.name}`);
    console.log(`  Age: ${new Date().getFullYear() - new Date(TEST_USER.child.birthdate).getFullYear()} years old`);
    console.log(`  Template: ${TEST_USER.template}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 You can now test the application with these credentials!');
    console.log('   - Use parent credentials to log in as a parent');
    console.log('   - Use family code + child password to log in as a child');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

// Run the script
createTestUser();