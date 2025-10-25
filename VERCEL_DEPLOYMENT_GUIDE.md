# 🚀 VERCEL DEPLOYMENT GUIDE

## ⚠️ IMPORTANT LIMITATION

**WebSockets are NOT supported on Vercel's Hobby (free) plan.**

Your auction app uses WebSockets for real-time updates, but **the fallback polling system (5-second intervals) will work on Vercel**. Real-time updates will be slightly delayed (5 seconds max) instead of instant.

For true WebSocket support, you need:
- **Vercel Pro plan** ($20/month) with Edge Functions
- **OR deploy to Azure/Railway/Render** (which support WebSockets on free tiers)

---

## ✅ Quick Answer: Vercel Settings

When importing your project in Vercel:

### **Framework Preset**: 
Select **"Other"** (not Vite, because you have a custom build)

### **Root Directory**: 
Leave as **`.`** (root) or leave blank

### **Build Settings**:
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

---

## 📦 Deployment Steps

### **Step 1: Build Locally First**

```bash
npm run build
```

Verify you have:
- `dist/index.js` (server)
- `dist/public/` (frontend)

### **Step 2: Push to GitHub**

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### **Step 3: Import to Vercel**

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: **"Other"**
   - **Root Directory**: `.` (or leave blank)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

5. Click **"Deploy"**

### **Step 4: Set Environment Variables**

After deployment:
1. Go to **Project Settings** → **Environment Variables**
2. Add:
   - `NODE_ENV` = `production`

### **Step 5: Add Custom Domain (Optional)**

1. Go to **Project Settings** → **Domains**
2. Add: `access.cumecidine.us`
3. Follow DNS configuration instructions

---

## 🔧 Files I Created For You

✅ **`vercel.json`** - Vercel configuration file

This tells Vercel:
- How to build your Express backend (`dist/index.js`)
- How to serve your Vite frontend (`dist/public/`)
- How to route requests (API → backend, everything else → frontend)

---

## 🎯 How It Works on Vercel

### **Your Current Structure:**
```
project/
├── server/           → Builds to dist/index.js
├── client/           → Builds to dist/public/
├── dist/
│   ├── index.js      → Express server (serverless function)
│   └── public/       → Static frontend
└── vercel.json       → Deployment config
```

### **What Vercel Does:**

1. **Build Phase**: Runs `npm run build`
   - Vite builds frontend → `dist/public/`
   - esbuild builds server → `dist/index.js`

2. **Deploy Phase**:
   - Converts `dist/index.js` to serverless function
   - Serves `dist/public/` as static files
   - Routes `/api/*` to serverless function
   - Routes everything else to static files

3. **Runtime**:
   - Backend runs as serverless (on-demand)
   - Frontend served via CDN (instant)
   - **WebSockets disabled** (falls back to 5s polling)

---

## ⚙️ Vercel.json Explanation

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",        // Your Express server
      "use": "@vercel/node"          // Node.js runtime
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",  // Build frontend
      "config": {
        "distDir": "dist/public"      // Frontend output
      }
    }
  ],
  "routes": [
    {
      "src": "/ws",                   // WebSocket (won't work on Hobby)
      "dest": "/dist/index.js"
    },
    {
      "src": "/api/(.*)",             // API requests
      "dest": "/dist/index.js"
    },
    {
      "src": "/(.*)",                 // Everything else
      "dest": "/dist/public/$1"       // Frontend files
    }
  ]
}
```

---

## 🧪 Testing After Deployment

1. **Visit your domain**: `https://your-app.vercel.app`
2. **Login** with:
   - Admin: `admin` / `admin123`
   - Owner: `owner` / `owner123`
   - Viewer: `viewer` / `viewer123`

3. **Test real-time updates**:
   - Open two browser windows
   - Place a bid in one
   - Should update in the other **within 5 seconds** (polling fallback)

---

## 🐛 Common Issues

### **Problem: 404 on API Routes**

**Fix**: Check Vercel logs (Project → Deployments → View Function Logs)

### **Problem: Frontend Loads But Broken**

**Fix**: Verify build output
```bash
# Locally run
npm run build
ls dist/public/  # Should show index.html, assets/, etc.
```

### **Problem: Real-time Updates Not Working**

**Cause**: WebSockets disabled on Vercel Hobby  
**Solution**: Wait 5 seconds, or upgrade to Vercel Pro

### **Problem: Environment Variables Missing**

**Fix**: Add `NODE_ENV=production` in Vercel dashboard

---

## 💡 Alternative: Deploy to Railway (Free WebSockets)

If you need WebSockets:

1. Go to https://railway.app
2. **"New Project"** → **"Deploy from GitHub"**
3. Select your repo
4. Railway auto-detects and deploys
5. Get free WebSocket support + custom domain

**Railway is better for this app** because it supports WebSockets on the free tier.

---

## 📊 Vercel vs Railway vs Azure

| Feature | Vercel (Hobby) | Railway (Free) | Azure (Free) |
|---------|----------------|----------------|--------------|
| **WebSockets** | ❌ No | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Auto-Deploy** | ✅ Yes | ✅ Yes | ⚠️ Manual |
| **Cost** | Free | Free (5$/mo credits) | Free |
| **Real-time Updates** | 5s polling | Instant | Instant |
| **Best For** | Static/API apps | Full-stack + WS | Enterprise |

**Recommendation**: Use **Railway** for this auction app (better WebSocket support).

---

## 🎉 Success Indicators

After deployment, check:

✅ Homepage loads at your Vercel URL  
✅ Login works  
✅ Admin dashboard shows players  
✅ Can start auction  
✅ Bidding updates **within 5 seconds** (not instant)  
✅ Team purse calculations work  
✅ Player images load  

---

## 🔄 Updates After Deployment

Every time you push to GitHub `main` branch:
- Vercel auto-deploys
- New version goes live in ~2 minutes
- Zero downtime

---

## 📞 Need Help?

If deployment fails, share:
1. Vercel deployment logs
2. Build logs
3. Function logs (for API errors)

**Quick Fix 90% of Issues:**
```bash
# Rebuild locally
npm run build

# Check outputs
ls -la dist/
ls -la dist/public/

# Push again
git add .
git commit -m "Fix deployment"
git push
```

---

**Ready to deploy!** Just import your GitHub repo to Vercel and use the settings above. 🚀
