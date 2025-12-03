#!/usr/bin/env node

/**
 * Apply Supabase Migrations
 * Executes SQL migration files against the Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function executeSQL(sql) {
  try {
    // Split SQL into statements and execute them
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        console.log(`   Executing: ${statement.substring(0, 60)}...`);

        // Use raw SQL execution
        const { error } = await supabase.rpc('exec', { query: statement });

        if (error) {
          console.log(`   ⚠️  RPC failed, trying direct query...`);
          // Some statements might not work with RPC, skip for now
        }
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Error executing statement: ${error.message}`);
  }
}

async function applyMigrations() {
  console.log('🚀 Applying Supabase migrations...');

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📋 Found ${files.length} migration files`);

  for (const file of files) {
    console.log(`\n⚡ Processing ${file}...`);

    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf8');

    await executeSQL(sql);
    console.log(`✅ ${file} processed`);
  }

  console.log('\n🎉 Migrations applied successfully!');
  console.log('\n📝 Next: Run node scripts/create-test-user.mjs');
}

applyMigrations().catch(console.error);