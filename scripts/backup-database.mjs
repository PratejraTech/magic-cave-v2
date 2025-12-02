/**
 * Database Backup Script
 * Creates backups of critical data for disaster recovery
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backupTable(tableName, backupDir) {
  console.log(`Backing up ${tableName}...`);

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`Error backing up ${tableName}:`, error);
      return false;
    }

    const backupPath = path.join(backupDir, `${tableName}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log(`✅ Backed up ${data.length} records from ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Failed to backup ${tableName}:`, error);
    return false;
  }
}

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', timestamp);

  // Create backup directory
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`Starting database backup: ${timestamp}`);

  // Critical tables to backup
  const tables = [
    'parents',
    'children',
    'calendars',
    'calendar_tiles',
    'analytics_events',
    'audit_logs',
    'user_sessions',
    'notification_schedules',
    'user_push_tokens'
  ];

  let successCount = 0;
  for (const table of tables) {
    if (await backupTable(table, backupDir)) {
      successCount++;
    }
  }

  // Create backup metadata
  const metadata = {
    timestamp,
    tables_backed_up: successCount,
    total_tables: tables.length,
    backup_directory: backupDir,
    created_at: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(backupDir, 'backup-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log(`Backup completed: ${successCount}/${tables.length} tables backed up`);
  console.log(`Backup location: ${backupDir}`);

  // Clean up old backups (keep last 30 days)
  cleanupOldBackups();

  return successCount === tables.length;
}

function cleanupOldBackups() {
  const backupsDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) return;

  const entries = fs.readdirSync(backupsDir, { withFileTypes: true });
  const backupDirs = entries
    .filter(entry => entry.isDirectory())
    .map(entry => ({
      name: entry.name,
      path: path.join(backupsDir, entry.name),
      mtime: fs.statSync(path.join(backupsDir, entry.name)).mtime
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  // Keep only last 30 backups
  const toDelete = backupDirs.slice(30);
  for (const dir of toDelete) {
    try {
      fs.rmSync(dir.path, { recursive: true, force: true });
      console.log(`Cleaned up old backup: ${dir.name}`);
    } catch (error) {
      console.error(`Failed to clean up ${dir.name}:`, error);
    }
  }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createBackup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Backup failed:', error);
      process.exit(1);
    });
}

export { createBackup };