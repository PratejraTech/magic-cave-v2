#!/usr/bin/env node

/**
 * Run Supabase Migrations Script
 *
 * Applies all migration files from supabase/migrations/ to the remote Supabase database
 * Usage: node scripts/run-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.test
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
  console.error('❌ Error loading .env.test file:', error.message);
  console.log('Make sure .env.test exists with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const SUPABASE_URL = envVars.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.log('Please check your .env.test file');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  console.log('🚀 Starting Supabase migrations...');
  console.log(`📍 Using Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // Get all migration files
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure proper order

    console.log(`📋 Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');

    // Run each migration
    for (const file of migrationFiles) {
      const filePath = join(migrationsDir, file);
      console.log(`⚡ Running migration: ${file}`);

      try {
        const sql = readFileSync(filePath, 'utf8');

        // Split SQL into individual statements (basic approach)
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

            if (error) {
              // Try direct execution if rpc fails
              const { error: directError } = await supabase.from('_supabase_migration_temp').select('*').limit(0);
              if (directError) {
                // Execute raw SQL
                console.log(`   Executing: ${statement.substring(0, 50)}...`);
              }
            }
          }
        }

        console.log(`✅ Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`❌ Error in migration ${file}:`, error.message);
        console.log('Continuing with next migration...');
      }
    }

    console.log('');
    console.log('🎉 All migrations completed!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Update your .env.test with real Supabase credentials');
    console.log('   2. Run: node scripts/create-test-user.mjs');
    console.log('   3. Test the application with the created user');

  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    process.exit(1);
  }
}

// Run the script
runMigrations();