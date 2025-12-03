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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testTables() {
  console.log('🧪 Testing table access...');

  const tables = ['parents', 'children', 'calendars', 'calendar_tiles', 'templates'];

  for (const table of tables) {
    try {
      console.log(`\n🔍 Testing ${table}...`);

      // Try to select from the table
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK (${data?.length || 0} records)`);
      }

    } catch (error) {
      console.log(`❌ ${table}: Exception - ${error.message}`);
    }
  }
}

testTables();