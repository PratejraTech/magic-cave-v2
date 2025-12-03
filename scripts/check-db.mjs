#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.test
const envPath = join(process.cwd(), '.env.test');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const SUPABASE_URL = envVars.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking database status...');
console.log(`📍 URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDB() {
  try {
    // Try to query tables that should exist if migrations are applied
    const tables = ['parents', 'children', 'calendars', 'calendar_tiles', 'templates'];

    console.log('🔍 Checking for application tables...');

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error && error.message.includes('does not exist')) {
          console.log(`❌ ${table} - MISSING`);
        } else {
          console.log(`✅ ${table} - EXISTS`);
        }
      } catch (error) {
        console.log(`❌ ${table} - ERROR: ${error.message}`);
      }
    }

    console.log('\n📋 Summary:');
    console.log('If all tables are missing, run: supabase db push');
    console.log('If some tables exist, check which migrations are needed');

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

checkDB();