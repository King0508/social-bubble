import pool from '../config/database.js';

// Save posts to database
export async function savePosts(posts) {
  const client = await pool.connect();
  try {
    let savedCount = 0;
    
    for (const post of posts) {
      try {
        await client.query(
          `INSERT INTO posts (post_uri, author, author_avatar, author_display_name, text, hashtags, likes, reposts, replies, engagement_score, created_at, post_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (post_uri) 
           DO UPDATE SET 
             likes = EXCLUDED.likes,
             reposts = EXCLUDED.reposts,
             replies = EXCLUDED.replies,
             engagement_score = EXCLUDED.engagement_score,
             author_avatar = EXCLUDED.author_avatar,
             author_display_name = EXCLUDED.author_display_name,
             fetched_at = CURRENT_TIMESTAMP`,
          [
            post.post_uri,
            post.author,
            post.author_avatar,
            post.author_display_name,
            post.text,
            post.hashtags,
            post.likes,
            post.reposts,
            post.replies,
            post.engagement_score,
            post.created_at,
            post.post_url,
          ]
        );
        savedCount++;
      } catch (err) {
        console.error(`Error saving post ${post.post_uri}:`, err.message);
      }
    }
    
    return savedCount;
  } finally {
    client.release();
  }
}

// Get recent posts with filters
export async function getPosts(filters = {}) {
  const { hashtag, author, limit = 200, minEngagement = 0 } = filters;
  
  let query = `
    SELECT * FROM posts 
    WHERE engagement_score >= $1
  `;
  const params = [minEngagement];
  let paramIndex = 2;

  if (hashtag) {
    query += ` AND $${paramIndex} = ANY(hashtags)`;
    params.push(hashtag.toLowerCase());
    paramIndex++;
  }

  if (author) {
    query += ` AND author = $${paramIndex}`;
    params.push(author);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
  params.push(limit);

  const result = await pool.query(query, params);
  return result.rows;
}

// Get trending hashtags from database
export async function getTrendingHashtags(limit = 15) {
  const result = await pool.query(
    `SELECT unnest(hashtags) as tag, COUNT(*) as count
     FROM posts 
     WHERE created_at > NOW() - INTERVAL '24 hours'
     GROUP BY tag
     ORDER BY count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

// Get statistics
export async function getStats() {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total_posts,
      COUNT(DISTINCT author) as total_authors,
      SUM(engagement_score) as total_engagement,
      MAX(fetched_at) as last_fetch
    FROM posts
  `);
  return result.rows[0];
}

// Clean old posts (keep last 7 days)
export async function cleanOldPosts() {
  const result = await pool.query(
    `DELETE FROM posts WHERE created_at < NOW() - INTERVAL '7 days'`
  );
  return result.rowCount;
}

