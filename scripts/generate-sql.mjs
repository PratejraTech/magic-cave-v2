#!/usr/bin/env node

/**
 * Generate SQL for Manual Migration
 * Outputs all migration SQL that can be copied to Supabase dashboard
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log('📋 SUPABASE MIGRATION SQL');
console.log('=' .repeat(50));
console.log('');
console.log('Copy and paste this SQL into your Supabase dashboard SQL editor:');
console.log('https://supabase.com/dashboard/project/qscsyhdmtvtiauhhibhq/sql');
console.log('');
console.log('=' .repeat(50));
console.log('');

for (const file of files) {
  const filePath = join(migrationsDir, file);
  const sql = readFileSync(filePath, 'utf8');

  console.log(`-- ${file}`);
  console.log(`-- ${'='.repeat(40)}`);
  console.log(sql);
  console.log('');
  console.log('-- END OF MIGRATION');
  console.log('');
}

console.log('=' .repeat(50));
console.log('After running this SQL, run: node scripts/create-test-user.mjs');