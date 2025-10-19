# 🌌 Social Bubble - Live Social Media Visualization

An interactive, real-time visualization of social media posts as bubbles in space. Posts are represented as bubbles sized by engagement, clustered by hashtags, with a beautiful space-themed interface.

![Social Bubble Demo](demo.gif)

## ✨ Features

- **Real-time Updates**: Live WebSocket connection for instant post updates
- **Interactive Bubbles**: D3.js force simulation with smooth animations
- **Topic Clustering**: Posts with similar hashtags cluster together in space
- **Color-coded Topics**: Different colors for different hashtags
- **Smart Filtering**: Filter by trending hashtags or search by author
- **Engagement Metrics**: Bubble size reflects post popularity (likes + reposts + replies)
- **Space Theme**: Beautiful dark theme with animated stars
- **Click to View**: Click any bubble to open the original post

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization and force simulation
- **Socket.io Client** - Real-time WebSocket connection

### Backend
- **Node.js + Express** - Server framework
- **Socket.io** - Real-time WebSocket server
- **PostgreSQL** - Database for post storage
- **Bluesky API** - Social media data source
- **node-cron** - Scheduled data fetching

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+ (or use Railway's managed database)
- **npm** or **yarn**

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
cd social-bubble
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@localhost:5432/social_bubble

# Bluesky API (Optional - works without for public posts)
BLUESKY_IDENTIFIER=your-handle.bsky.social
BLUESKY_PASSWORD=your-app-password

# CORS
FRONTEND_URL=http://localhost:5173
```

**Setup PostgreSQL Database:**

```bash
# Create database
createdb social_bubble

# Or use psql
psql -c "CREATE DATABASE social_bubble;"
```

The database schema will be automatically created when you start the server.

**Start the backend:**

```bash
npm run dev
```

The server will:
- Initialize the database schema
- Connect to Bluesky API
- Fetch initial posts
- Start WebSocket server on port 3001
- Schedule data fetching every 2 minutes

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:3001
```

**Start the frontend:**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌐 Deployment

### Backend Deployment (Railway)

1. **Create Railway Account**: Go to [railway.app](https://railway.app)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the `backend` folder as root directory

3. **Add PostgreSQL Database**:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

4. **Set Environment Variables**:
   ```
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   BLUESKY_IDENTIFIER=your-handle.bsky.social (optional)
   BLUESKY_PASSWORD=your-password (optional)
   ```

5. **Deploy**:
   - Railway will auto-deploy
   - Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### Frontend Deployment (Vercel)

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Set **Root Directory** to `frontend`

3. **Configure Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**:
   ```
   VITE_BACKEND_URL=https://your-backend.up.railway.app
   ```

5. **Deploy**:
   - Click "Deploy"
   - Your app will be live at `https://your-app.vercel.app`

6. **Update Backend CORS**:
   - Go back to Railway
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy backend

## 📁 Project Structure

```
social-bubble/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection & schema
│   ├── services/
│   │   ├── blueskyService.js    # Bluesky API integration
│   │   └── postService.js       # Database operations
│   ├── jobs/
│   │   └── fetchPosts.js        # Standalone fetch script
│   ├── server.js                # Main Express + Socket.io server
│   ├── package.json
│   └── railway.json             # Railway deployment config
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BubbleVisualization.jsx  # D3.js bubble chart
│   │   │   ├── Filters.jsx              # Filter controls
│   │   │   ├── Header.jsx               # Stats header
│   │   │   ├── ConnectionStatus.jsx     # WebSocket status
│   │   │   └── Legend.jsx               # Color legend
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Space-themed styles
│   ├── index.html
│   ├── package.json
│   └── vercel.json              # Vercel deployment config
│
└── README.md
```

## 🎨 Customization

### Change Data Source

To use a different social media API, modify `backend/services/blueskyService.js`:

```javascript
export async function fetchTrendingPosts(limit = 100) {
  // Replace with your API calls
  // Return array of posts with this structure:
  return [{
    post_uri: 'unique-id',
    author: 'username',
    text: 'post content',
    hashtags: ['#tag1', '#tag2'],
    likes: 10,
    reposts: 5,
    replies: 3,
    engagement_score: 23,
    created_at: '2024-01-01T00:00:00Z',
    post_url: 'https://...'
  }];
}
```

### Adjust Bubble Sizes

In `frontend/src/components/BubbleVisualization.jsx`:

```javascript
const radiusScale = d3.scaleSqrt()
  .domain([0, maxEngagement])
  .range([10, 60]); // Change min/max bubble size here
```

### Change Color Scheme

Modify the `colors` array in `BubbleVisualization.jsx`:

```javascript
const colors = [
  '#667eea', // Your custom colors
  '#f093fb',
  // ... add more
];
```

### Update Fetch Frequency

In `backend/server.js`:

```javascript
// Change from every 2 minutes to your desired interval
cron.schedule('*/5 * * * *', fetchAndBroadcast); // Every 5 minutes
```

## 🔧 Manual Data Fetch

Run the standalone fetch script without starting the server:

```bash
cd backend
npm run fetch
```

This is useful for:
- Testing the Bluesky API connection
- Populating the database initially
- Running as a cron job separately

## 🐛 Troubleshooting

### Backend won't start

- **Database connection error**: Check your `DATABASE_URL` is correct
- **Port already in use**: Change `PORT` in `.env` or kill the process using port 3001

### No posts appearing

- **Check backend logs**: Look for errors in console
- **Run manual fetch**: `npm run fetch` to test API connection
- **Bluesky API rate limit**: Free tier has limits, wait and try again

### Frontend shows "Disconnected"

- **Backend not running**: Start backend server first
- **Wrong backend URL**: Check `VITE_BACKEND_URL` in frontend `.env`
- **CORS issues**: Ensure `FRONTEND_URL` is set correctly in backend

### Bubbles not clustering

- **Not enough data**: Need posts with hashtags to cluster
- **All same hashtag**: Bubbles only separate with different hashtags

## 📝 API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/posts`
Get posts with optional filters

**Query Parameters:**
- `hashtag` - Filter by hashtag
- `author` - Filter by author username
- `limit` - Max posts to return (default: 200)

**Response:**
```json
[
  {
    "id": 1,
    "post_uri": "...",
    "author": "username",
    "text": "post content",
    "hashtags": ["#tag1"],
    "likes": 10,
    "reposts": 5,
    "replies": 3,
    "engagement_score": 23,
    "created_at": "2024-01-01T00:00:00Z",
    "post_url": "https://..."
  }
]
```

### `GET /api/hashtags/trending`
Get trending hashtags

**Response:**
```json
[
  { "tag": "#topic", "count": 42 }
]
```

### `GET /api/stats`
Get overall statistics

**Response:**
```json
{
  "total_posts": 150,
  "total_authors": 75,
  "total_engagement": 3420,
  "last_fetch": "2024-01-01T00:00:00Z"
}
```

## 🎯 Future Enhancements (Phase 2+)

- [ ] Time-based filtering (last hour, 24 hours, week)
- [ ] Historical replay feature
- [ ] Sentiment analysis with color coding
- [ ] User authentication and saved filters
- [ ] Multiple social media sources (Twitter, Reddit, etc.)
- [ ] 3D bubble visualization with Three.js
- [ ] Export visualizations as images/videos
- [ ] Mobile responsive design
- [ ] Dark/light theme toggle

## 📄 License

MIT License - feel free to use this project for your portfolio or learning!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 💡 Credits

Built with ❤️ using:
- [D3.js](https://d3js.org/) for visualization
- [Bluesky API](https://docs.bsky.app/) for social data
- [Socket.io](https://socket.io/) for real-time updates

---

**Enjoy visualizing the social media cosmos! 🌌✨**

