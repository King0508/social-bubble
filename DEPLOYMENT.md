# 🚀 Deployment Guide - Social Bubble

This guide will help you deploy your Social Bubble app to the web for free using **Vercel** (frontend) and **Railway** (backend + database).

## 📝 Prerequisites

1. **GitHub Account** - Create one at [github.com](https://github.com)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) using your GitHub
3. **Railway Account** - Sign up at [railway.app](https://railway.app) using your GitHub
4. **Bluesky Account** - You already have this with your app password

---

## Part 1: Push Code to GitHub

### 1. Create a New Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Name it: `social-bubble`
3. Make it **Public** or **Private** (your choice)
4. **DO NOT** initialize with README (we have one already)
5. Click "Create repository"

### 2. Push Your Code

Open PowerShell in the `social-bubble` folder and run:

```powershell
# Navigate to your project
cd C:\Users\kings\OneDrive\Desktop\social-bubble

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Social Bubble app"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/social-bubble.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend to Railway (with Database)

### 1. Create New Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your `social-bubble` repository
5. Railway will detect it and create a project

### 2. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will provision a database (wait ~30 seconds)
4. Click on the PostgreSQL service to see its details

### 3. Configure Backend Service

1. Click on your main service (the one that deployed from GitHub)
2. Go to "Settings" tab
3. Under "Root Directory", set it to: `backend`
4. Under "Start Command", verify it says: `node server.js`

### 4. Set Environment Variables

1. In your backend service, go to "Variables" tab
2. Click "RAW Editor" button
3. Paste these variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
BLUESKY_IDENTIFIER=mobachessking.bsky.social
BLUESKY_PASSWORD=volg-ntjh-lw4j-xltc
PORT=3001
NODE_ENV=production
```

4. Click "Update Variables"

**Important**: The `${{Postgres.DATABASE_URL}}` will automatically link to your PostgreSQL database!

### 5. Deploy Backend

1. Go to "Deployments" tab
2. Click "Deploy" or wait for automatic deployment
3. Once deployed, go to "Settings" → "Networking"
4. Click "Generate Domain" to get a public URL
5. **Copy this URL** - you'll need it for the frontend! (e.g., `https://social-bubble-backend-production.up.railway.app`)

---

## Part 3: Deploy Frontend to Vercel

### 1. Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import" next to your `social-bubble` repository
3. Vercel will detect it's a Vite project

### 2. Configure Build Settings

In the import screen:

1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### 3. Add Environment Variable

Before deploying, add your backend URL:

1. Click "Environment Variables"
2. Add:
   - **Key**: `VITE_BACKEND_URL`
   - **Value**: Your Railway backend URL (e.g., `https://social-bubble-backend-production.up.railway.app`)
   - **Environment**: Production, Preview, Development (check all)
3. Click "Add"

### 4. Deploy Frontend

1. Click "Deploy"
2. Wait 1-2 minutes for the build to complete
3. Vercel will give you a live URL! (e.g., `https://social-bubble.vercel.app`)

---

## Part 4: Update Backend CORS (Important!)

After getting your Vercel URL, you need to allow it in the backend:

### Update backend/server.js

1. Go to your Railway backend service
2. Click on the GitHub icon to edit code, or:
3. Update locally and push:

```javascript
// In backend/server.js, update CORS configuration:
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'https://social-bubble.vercel.app', // Add your Vercel URL here
    process.env.FRONTEND_URL // You can also set this as an env variable
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

4. Commit and push to GitHub:

```powershell
git add .
git commit -m "Add production CORS origin"
git push
```

5. Railway will auto-deploy the update

---

## Part 5: Test Your Deployment

### 1. Check Backend

1. Visit your Railway backend URL: `https://YOUR-BACKEND-URL.railway.app/health`
2. You should see: `{"status":"ok","timestamp":"..."}`

### 2. Check Frontend

1. Visit your Vercel URL: `https://social-bubble.vercel.app`
2. You should see bubbles loading after a few seconds
3. Check browser console (F12) for any errors

### 3. Check Database

1. In Railway, click on your PostgreSQL database
2. Go to "Data" tab
3. You should see the `posts` table with data

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**:
```
✓ Go to Railway → PostgreSQL → Variables
✓ Copy the DATABASE_URL
✓ Paste it in backend service Variables tab
```

**Port Error**:
```
✓ Make sure PORT=3001 is set in backend environment variables
✓ Railway will override this with their own PORT, which is fine
```

**Bluesky Auth Error**:
```
✓ Verify your app password is correct
✓ Make sure BLUESKY_IDENTIFIER is your full handle
```

### Frontend Issues

**Can't Connect to Backend**:
```
✓ Check that VITE_BACKEND_URL is set correctly
✓ Must include https:// and no trailing slash
✓ Redeploy frontend after adding env variable
```

**CORS Error**:
```
✓ Update backend/server.js with your Vercel URL
✓ Push changes to GitHub
✓ Wait for Railway to redeploy
```

**Blank Page**:
```
✓ Check browser console (F12) for errors
✓ Verify frontend build completed successfully
✓ Check Vercel deployment logs
```

---

## 🔄 Updating Your Deployment

### When You Make Changes:

1. **Commit and push to GitHub**:
   ```powershell
   git add .
   git commit -m "Your update message"
   git push
   ```

2. **Automatic Deployments**:
   - Railway will automatically redeploy backend
   - Vercel will automatically redeploy frontend

3. **Manual Redeploy** (if needed):
   - Railway: Go to "Deployments" → Click "Deploy"
   - Vercel: Go to project → "Deployments" → Click "⋯" → "Redeploy"

---

## 💰 Cost Breakdown (FREE!)

### Vercel
- ✅ 100GB bandwidth/month (FREE)
- ✅ Unlimited projects
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN

### Railway
- ✅ $5 FREE credits/month
- ✅ Includes PostgreSQL database
- ✅ Auto-scaling
- ⚠️ ~$3-5/month usage (covered by free credits)

**Total Cost: $0/month** (within free tiers)

---

## 📊 Monitor Your App

### Vercel Dashboard
- View deployment logs
- See visitor analytics
- Monitor build times
- Check performance

### Railway Dashboard
- Monitor database usage
- View server logs
- Check CPU/memory usage
- Database metrics

---

## 🎉 You're Live!

Your app is now deployed and accessible worldwide! Share your Vercel URL:

**Frontend**: `https://social-bubble.vercel.app` (or your custom URL)

The bubbles will update every 2 minutes with fresh posts from Bluesky!

---

## 🔗 Quick Links

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Railway Dashboard**: [railway.app/dashboard](https://railway.app/dashboard)
- **GitHub Repo**: Your repository URL
- **Frontend (Live)**: Your Vercel URL
- **Backend (Live)**: Your Railway URL

---

## 📚 Next Steps

1. ✅ **Custom Domain**: Add a custom domain in Vercel settings (optional)
2. ✅ **Analytics**: Enable Vercel Analytics for visitor tracking
3. ✅ **Monitoring**: Set up Railway alerts for downtime
4. ✅ **Backup**: Railway auto-backs up your database daily

---

**Need Help?** Check the main [README.md](./README.md) or [create an issue](https://github.com/YOUR_USERNAME/social-bubble/issues) on GitHub.

