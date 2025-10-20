import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDatabase } from './config/database.js';
import { initBluesky, fetchTrendingPosts } from './services/blueskyService.js';
import { 
  savePosts, 
  getPosts, 
  getTrendingHashtags as getDBTrendingHashtags,
  getStats,
  cleanOldPosts 
} from './services/postService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      // Allow localhost, env variable, and all Vercel preview deployments
      if (!origin || 
          origin.includes('localhost') || 
          origin === process.env.FRONTEND_URL ||
          origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// CORS configuration - supports local development, production, and all Vercel previews
const corsOptions = {
  origin: function (origin, callback) {
    // Allow localhost, env variable, and all Vercel preview deployments
    if (!origin || 
        origin.includes('localhost') || 
        origin === process.env.FRONTEND_URL ||
        origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get posts endpoint
app.get('/api/posts', async (req, res) => {
  try {
    const { hashtag, author, limit } = req.query;
    const posts = await getPosts({ 
      hashtag, 
      author, 
      limit: parseInt(limit) || 200 
    });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get trending hashtags
app.get('/api/hashtags/trending', async (req, res) => {
  try {
    const hashtags = await getDBTrendingHashtags();
    res.json(hashtags);
  } catch (err) {
    console.error('Error fetching hashtags:', err);
    res.status(500).json({ error: 'Failed to fetch hashtags' });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Fetch and broadcast new posts
async function fetchAndBroadcast() {
  try {
    console.log('🔄 Fetching new posts...');
    const posts = await fetchTrendingPosts(200); // Increased from 100 to 200
    
    if (posts.length > 0) {
      const savedCount = await savePosts(posts);
      console.log(`✓ Fetched and saved ${savedCount} posts`);
      
      // Get all posts and broadcast to connected clients
      const allPosts = await getPosts({ limit: 500 }); // Increased from 200 to 500
      const hashtags = await getDBTrendingHashtags();
      
      io.emit('posts_update', { posts: allPosts, hashtags });
      console.log(`📡 Broadcasted ${allPosts.length} posts to ${io.engine.clientsCount} clients`);
    }
  } catch (err) {
    console.error('Error in fetch and broadcast:', err);
  }
}

// WebSocket connection handling
io.on('connection', async (socket) => {
  console.log(`✓ Client connected: ${socket.id}`);

  try {
    // Send initial data
    const posts = await getPosts({ limit: 500 }); // Increased from 200 to 500
    const hashtags = await getDBTrendingHashtags();
    socket.emit('initial_data', { posts, hashtags });
  } catch (err) {
    console.error('Error sending initial data:', err);
  }

  socket.on('disconnect', () => {
    console.log(`✗ Client disconnected: ${socket.id}`);
  });

  // Handle filter requests
  socket.on('filter_posts', async (filters) => {
    try {
      const posts = await getPosts(filters);
      socket.emit('filtered_posts', posts);
    } catch (err) {
      console.error('Error filtering posts:', err);
    }
  });
});

// Initialize and start server
async function startServer() {
  try {
    console.log('🚀 Starting Social Bubble Backend...');
    
    // Initialize database
    await initDatabase();
    
    // Initialize Bluesky
    await initBluesky();
    
    // Fetch initial data
    console.log('📥 Fetching initial posts...');
    await fetchAndBroadcast();
    
    // Schedule periodic fetching (every 2 minutes)
    cron.schedule('*/2 * * * *', fetchAndBroadcast);
    console.log('⏱️  Scheduled post fetching every 2 minutes');
    
    // Schedule cleanup (daily at 2 AM)
    cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Cleaning old posts...');
      const deleted = await cleanOldPosts();
      console.log(`✓ Deleted ${deleted} old posts`);
    });
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

