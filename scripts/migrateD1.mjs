import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();

const MIGRATION_FILE = path.join(ROOT, 'supabase', 'migrations', '001_session_events.sql');
const DATABASE_NAME = 'harper-advent-sessions';

/**
 * Run D1 database migration
 * Reads the SQL migration file and applies it to the D1 database
 */
async function runMigration() {
  try {
    const isLocal = process.argv.includes('--local');
    const dbFlag = isLocal ? '--local' : '';
    
    console.log('📦 Reading migration file...');
    const migrationSQL = await readFile(MIGRATION_FILE, 'utf8');
    
    if (!migrationSQL || migrationSQL.trim().length === 0) {
      throw new Error('Migration file is empty');
    }
    
    console.log(`🚀 Applying D1 migration to: ${DATABASE_NAME} ${isLocal ? '(local)' : '(remote)'}`);
    console.log('📝 Migration file:', MIGRATION_FILE);
    console.log('');
    
    // Apply migration using --file flag (more reliable than --command)
    const command = `npx wrangler d1 execute ${DATABASE_NAME} --file=${MIGRATION_FILE} ${dbFlag}`.trim();
    console.log(`Running: ${command}`);
    console.log('');
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('');
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error.message);
    if (error.stdout) console.error('STDOUT:', error.stdout.toString());
    if (error.stderr) console.error('STDERR:', error.stderr.toString());
    process.exit(1);
  }
}

runMigration();

