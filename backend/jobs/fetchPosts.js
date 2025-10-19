import { initBluesky, fetchTrendingPosts } from '../services/blueskyService.js';
import { savePosts } from '../services/postService.js';
import { initDatabase } from '../config/database.js';

// Standalone script to fetch and save posts
async function runFetchJob() {
  console.log('🚀 Starting post fetch job...');
  
  try {
    // Initialize database and Bluesky
    await initDatabase();
    await initBluesky();

    // Fetch posts
    console.log('📥 Fetching posts from Bluesky...');
    const posts = await fetchTrendingPosts(200); // Increased from 100 to 200
    console.log(`✓ Fetched ${posts.length} posts`);

    // Save to database
    if (posts.length > 0) {
      const savedCount = await savePosts(posts);
      console.log(`✓ Saved ${savedCount} posts to database`);
    }

    console.log('✅ Fetch job completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in fetch job:', err);
    process.exit(1);
  }
}

runFetchJob();

