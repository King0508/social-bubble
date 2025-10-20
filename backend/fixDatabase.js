import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function fixDatabase() {
  console.log('🔧 Fixing database schema...');
  
  try {
    // Add missing columns
    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS author_avatar TEXT,
      ADD COLUMN IF NOT EXISTS author_display_name VARCHAR(200);
    `);
    
    console.log('✅ Database schema updated successfully!');
    console.log('✓ Added author_avatar column');
    console.log('✓ Added author_display_name column');
    
    // Clear old data and refetch
    await pool.query('DELETE FROM posts');
    console.log('✓ Cleared old posts (will refetch with new data)');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing database:', err);
    process.exit(1);
  }
}

fixDatabase();

