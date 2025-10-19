import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Initialize database schema
export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        post_uri VARCHAR(255) UNIQUE NOT NULL,
        author VARCHAR(100) NOT NULL,
        author_avatar TEXT,
        author_display_name VARCHAR(200),
        text TEXT NOT NULL,
        hashtags TEXT[],
        likes INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        replies INTEGER DEFAULT 0,
        engagement_score INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        post_url TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_hashtags ON posts USING GIN(hashtags);
      CREATE INDEX IF NOT EXISTS idx_engagement ON posts(engagement_score DESC);
      CREATE INDEX IF NOT EXISTS idx_created_at ON posts(created_at DESC);
    `);
    console.log('✓ Database schema initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

export default pool;

