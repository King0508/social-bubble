# 🚀 Quick Start Guide

Get Social Bubble running locally in 5 minutes!

## Step 1: Install Dependencies

```bash
# From the root directory
npm run install:all
```

Or install separately:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Step 2: Setup PostgreSQL

### Option A: Local PostgreSQL

```bash
# Create database
createdb social_bubble
```

### Option B: Use Railway (Free)

1. Go to [railway.app](https://railway.app)
2. Create account
3. New Project → PostgreSQL
4. Copy the `DATABASE_URL` from the Connect tab

## Step 3: Configure Backend

Create `backend/.env`:

```env
PORT=3001
DATABASE_URL=postgresql://localhost:5432/social_bubble
FRONTEND_URL=http://localhost:5173
```

## Step 4: Configure Frontend

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:3001
```

## Step 5: Start Backend

```bash
cd backend
npm run dev
```

Wait for:
- ✓ Connected to PostgreSQL database
- ✓ Database schema initialized
- ✓ Fetched posts from Bluesky
- ✅ Server running on port 3001

## Step 6: Start Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🎉 You're Done!

You should see:
- Animated bubbles representing social posts
- Real-time updates every 2 minutes
- Filter controls on the left
- Stats at the top

## 🐛 Issues?

### "Database connection failed"

Check your `DATABASE_URL` is correct. For local PostgreSQL:

```env
DATABASE_URL=postgresql://localhost:5432/social_bubble
```

### "Frontend shows Disconnected"

Make sure backend is running first on port 3001.

### "No bubbles appearing"

- Check backend console for errors
- Wait 2 minutes for first fetch
- Run manual fetch: `cd backend && npm run fetch`

## 📝 Optional: Bluesky Authentication

For higher rate limits, add to `backend/.env`:

```env
BLUESKY_IDENTIFIER=your-handle.bsky.social
BLUESKY_PASSWORD=your-app-password
```

Get an app password at: https://bsky.app/settings/app-passwords

## 🚀 Next Steps

- **Customize colors**: Edit `frontend/src/components/BubbleVisualization.jsx`
- **Change fetch interval**: Edit `backend/server.js` cron schedule
- **Add more filters**: Extend `frontend/src/components/Filters.jsx`
- **Deploy**: See main README.md for Vercel + Railway deployment

Enjoy! 🌌✨

