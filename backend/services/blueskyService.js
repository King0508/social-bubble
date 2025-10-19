import { BskyAgent } from '@atproto/api';
import dotenv from 'dotenv';

dotenv.config();

const agent = new BskyAgent({ service: 'https://bsky.social' });

// Optional: Login if credentials provided
let isAuthenticated = false;

export async function initBluesky() {
  if (process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_PASSWORD) {
    try {
      await agent.login({
        identifier: process.env.BLUESKY_IDENTIFIER,
        password: process.env.BLUESKY_PASSWORD,
      });
      isAuthenticated = true;
      console.log('✓ Authenticated with Bluesky');
    } catch (err) {
      console.log('⚠ Running without Bluesky authentication (public posts only)');
    }
  } else {
    console.log('⚠ No Bluesky credentials - using public API');
  }
}

// Extract hashtags from text
function extractHashtags(text) {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

// Fetch trending posts from Bluesky
export async function fetchTrendingPosts(limit = 100) {
  try {
    let allPosts = [];

    // Popular feed URIs to fetch from - more diverse sources
    const popularFeeds = [
      'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot', // What's Hot (Official Discover)
      'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/hot-classic', // Hot Classic
      'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/with-friends', // Popular with Friends
      'at://did:plc:wqowuobffl66jv3kpsvo7ak4/app.bsky.feed.generator/the-algorithm', // The Algorithm
    ];

    // Fetch from multiple popular feeds for diversity
    for (const feedUri of popularFeeds) {
      try {
        const response = await agent.app.bsky.feed.getFeed({
          feed: feedUri,
          limit: Math.floor(limit / popularFeeds.length),
        });

        const posts = response.data.feed.map(item => {
          const post = item.post;
          const hashtags = extractHashtags(post.record.text || '');
          
          // Calculate engagement score
          const likes = post.likeCount || 0;
          const reposts = post.repostCount || 0;
          const replies = post.replyCount || 0;
          const engagementScore = likes + (reposts * 2) + (replies * 1.5);

          return {
            post_uri: post.uri,
            author: post.author.handle,
            author_avatar: post.author.avatar || null,
            author_display_name: post.author.displayName || post.author.handle,
            text: post.record.text || '',
            hashtags: hashtags,
            likes: likes,
            reposts: reposts,
            replies: replies,
            engagement_score: Math.floor(engagementScore),
            created_at: post.record.createdAt,
            post_url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`,
          };
        });

        allPosts = allPosts.concat(posts);
      } catch (feedErr) {
        console.log(`⚠ Could not fetch from feed ${feedUri}:`, feedErr.message);
      }
    }

    // If popular feeds didn't work, fall back to timeline
    if (allPosts.length === 0 && isAuthenticated) {
      console.log('📱 Falling back to timeline feed...');
      const response = await agent.app.bsky.feed.getTimeline({
        limit: limit,
      });

      allPosts = response.data.feed.map(item => {
        const post = item.post;
        const hashtags = extractHashtags(post.record.text || '');
        
        const likes = post.likeCount || 0;
        const reposts = post.repostCount || 0;
        const replies = post.replyCount || 0;
        const engagementScore = likes + (reposts * 2) + (replies * 1.5);

        return {
          post_uri: post.uri,
          author: post.author.handle,
          author_avatar: post.author.avatar || null,
          author_display_name: post.author.displayName || post.author.handle,
          text: post.record.text || '',
          hashtags: hashtags,
          likes: likes,
          reposts: reposts,
          replies: replies,
          engagement_score: Math.floor(engagementScore),
          created_at: post.record.createdAt,
          post_url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`,
        };
      });
    }

    // Remove duplicates based on post_uri
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.post_uri, post])).values()
    );

    // Filter posts - prefer those with hashtags for better visualization
    const relevantPosts = uniquePosts.filter(
      post => post.hashtags.length > 0 || post.engagement_score > 5
    );

    // If we got posts with hashtags/engagement, return them
    if (relevantPosts.length > 0) {
      return relevantPosts;
    }

    // Otherwise return all posts (they'll go into #general)
    return uniquePosts;
  } catch (err) {
    console.error('Error fetching posts from Bluesky:', err.message);
    return [];
  }
}

// Get trending hashtags
export function getTrendingHashtags(posts) {
  const hashtagCount = {};
  
  posts.forEach(post => {
    post.hashtags.forEach(tag => {
      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
    });
  });

  // Sort by frequency and return top 15
  return Object.entries(hashtagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }));
}

export default agent;

