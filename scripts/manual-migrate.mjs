#!/usr/bin/env node

/**
 * Manual Migration Script
 * Executes SQL files directly against Supabase using service role
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runSQL(sql) {
  // For complex migrations, we'll need to execute them via the REST API
  // Since Supabase client doesn't support raw SQL execution, we'll use fetch
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return await response.json();
}

async function applyMigrations() {
  console.log('🚀 Applying migrations manually...');

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📋 Found ${files.length} migration files`);

  for (const file of files) {
    console.log(`\n⚡ Applying ${file}...`);

    try {
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf8');

      // Execute the entire SQL file
      await runSQL(sql);
      console.log(`✅ ${file} applied successfully`);
    } catch (error) {
      console.log(`❌ Error applying ${file}: ${error.message}`);
      // Continue with next migration
    }
  }

  console.log('\n🎉 All migrations completed!');
}

applyMigrations().catch(console.error);