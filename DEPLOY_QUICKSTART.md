# ⚡ Quick Deploy Checklist

Follow these steps in order to deploy your Social Bubble app:

## ✅ Step 1: GitHub (5 minutes)
```powershell
cd C:\Users\kings\OneDrive\Desktop\social-bubble
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/social-bubble.git
git push -u origin main
```

## ✅ Step 2: Railway - Backend (10 minutes)

1. Go to [railway.app](https://railway.app) → "New Project" → "Deploy from GitHub"
2. Select `social-bubble` repo
3. Add PostgreSQL: Click "+ New" → "Database" → "PostgreSQL"
4. Configure Backend Service:
   - Settings → Root Directory: `backend`
   - Settings → Start Command: `node server.js`
5. Set Variables (Raw Editor):
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
BLUESKY_IDENTIFIER=mobachessking.bsky.social
BLUESKY_PASSWORD=volg-ntjh-lw4j-xltc
PORT=3001
NODE_ENV=production
```
6. Settings → Networking → "Generate Domain"
7. **Copy the domain URL** (you'll need it next!)

## ✅ Step 3: Vercel - Frontend (5 minutes)

1. Go to [vercel.com/new](https://vercel.com/new) → Import `social-bubble`
2. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add Environment Variable:
   - Name: `VITE_BACKEND_URL`
   - Value: `https://your-railway-url.railway.app` (from Step 2)
4. Click "Deploy"
5. Wait 2 minutes ☕
6. **Copy your Vercel URL!**

## ✅ Step 4: Update CORS (2 minutes)

After getting your Vercel URL:

1. Edit `backend/server.js` line 38:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://your-app.vercel.app', // ← Add your Vercel URL here
].filter(Boolean);
```

2. Push update:
```powershell
git add .
git commit -m "Add production CORS"
git push
```

Railway will auto-redeploy!

## ✅ Step 5: Test (1 minute)

1. **Backend**: Visit `https://your-backend.railway.app/health`
   - Should show: `{"status":"ok"...}`

2. **Frontend**: Visit `https://your-app.vercel.app`
   - Should show bubbles after a few seconds!

---

## 🎉 Done!

Your app is now live! It will:
- ✅ Update every 2 minutes with new posts
- ✅ Auto-scale with traffic
- ✅ Auto-deploy when you push to GitHub
- ✅ Stay within free tiers

**Share your app**: `https://your-app.vercel.app`

---

## 🚨 Common Issues

**"CORS Error" in browser console**:
- Make sure you added your Vercel URL to `backend/server.js`
- Push changes to GitHub
- Wait for Railway to redeploy (1-2 minutes)

**"Failed to connect to backend"**:
- Verify `VITE_BACKEND_URL` is set in Vercel
- Must start with `https://` and no trailing slash
- Redeploy frontend after adding env variable

**"Database error"**:
- Check Railway PostgreSQL is running
- Verify `DATABASE_URL` is linked: `${{Postgres.DATABASE_URL}}`

---

**Need detailed help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full guide!

