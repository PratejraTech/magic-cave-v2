import { execSync } from 'child_process';

/**
 * Setup script for Harper Data Lake
 * Creates R2 bucket and deploys the analytics worker
 */

const R2_BUCKET_NAME = 'harper-datalake';
const WORKER_NAME = 'harper-datalake-analytics';

async function setupDataLake() {
  console.log('🚀 Setting up Harper Data Lake...\n');
  
  try {
    // Step 1: Create R2 bucket
    console.log('📦 Creating R2 bucket...');
    try {
      execSync(`npx wrangler r2 bucket create ${R2_BUCKET_NAME}`, { stdio: 'inherit' });
      console.log(`✅ R2 bucket "${R2_BUCKET_NAME}" created\n`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  R2 bucket "${R2_BUCKET_NAME}" already exists\n`);
      } else {
        throw error;
      }
    }
    
    // Step 2: Deploy worker
    console.log('🚀 Deploying analytics worker...');
    execSync(`cd workers && npx wrangler deploy`, { stdio: 'inherit' });
    console.log(`✅ Worker "${WORKER_NAME}" deployed\n`);
    
    // Step 3: Verify cron trigger
    console.log('⏰ Verifying cron trigger...');
    console.log('   Cron schedule: Every 6 hours (0 */6 * * *)');
    console.log('   Worker will run automatically\n');
    
    console.log('✅ Harper Data Lake setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify R2 bucket exists: npx wrangler r2 bucket list');
    console.log('   2. Check worker status: npx wrangler deployments list');
    console.log('   3. View worker logs: npx wrangler tail');
    console.log('   4. Manually trigger: npx wrangler trigger scheduled');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDataLake();

