# Railway Deployment Guide

**✅ Ready for Deployment**: All Railway deployment issues fixed! The Node.js 18 compatibility issue has been resolved with a custom build script that polyfills `import.meta.dirname`.

This guide explains how to deploy your Cricket Auction app to Railway with PostgreSQL database for multi-device synchronization.

## Prerequisites

- Railway account (https://railway.app)
- Your code repository (GitHub, GitLab, or local)

## Deployment Steps

### Step 1: Create Railway Project

```bash
# Install Railway CLI (optional, can use web dashboard instead)
npm i -g railway

# Login to Railway
railway login
```

### Step 2: Deploy from GitHub (Recommended)

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect Node.js and start building

**OR** Deploy from CLI:

```bash
# Initialize in your project directory
railway init

# Link to new project
railway link

# Deploy
railway up
```

### Step 3: Add PostgreSQL Database

**After your app service is deployed**, add the database:

**Using Command Menu (Fastest):**
1. Press `Ctrl + K` (Windows) or `Cmd + K` (Mac)
2. Type "PostgreSQL"
3. Select it from the list

**Using + New Button:**
1. Click **"+ New"** on your Project Canvas
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for deployment

**Link Database to App:**
1. Click your **app service** (not the database)
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Type `DATABASE_URL`
5. Select **`${{Postgres.DATABASE_URL}}`** from dropdown
6. Save

Railway automatically sets `DATABASE_URL` environment variable ✅

### Step 4: Generate Public Domain

1. Click your **app service**
2. Go to **Settings** → **Networking**
3. Click **"Generate Domain"**
4. When asked for port, enter: **5000**
5. You'll get a URL like: `https://your-app.up.railway.app`

### Step 5: Wait for Deployment

Railway will automatically:
- Run `npm install`
- Build frontend with `vite build`
- Build backend with custom build script (includes Node.js 18 compatibility fix)
- Create database tables with `npm run db:push`
- Start the app with `npm start`

Check the build logs to monitor progress!

### Step 6: Set Environment Variables (if needed)

In Railway Dashboard → Variables:
- `NODE_ENV` = `production` (optional, auto-set)
- `DATABASE_URL` = Auto-set by PostgreSQL service ✅
- `SESSION_SECRET` = (generate a random string)

### Step 7: Access Your App

Once deployment is complete:
1. Railway will give you a URL like: `https://your-auction.up.railway.app`
2. Open this URL on **multiple devices** to test sync!
3. Login credentials:
   - Admin: `admin` / `admin123`
   - Super Admin: `superadmin` / `superadmin123`
   - Owner: `owner` / `owner123`
   - Viewer: `viewer` / `viewer123`

## Technical Details: Node.js 18 Compatibility Fix

**Problem**: Railway uses Node.js 18 by default, but the code used `import.meta.dirname` which was only added in Node.js 20.11+.

**Solution**: Created `build.js` with esbuild banner that polyfills `import.meta.dirname`:

```javascript
import.meta.dirname = import.meta.dirname || dirname(fileURLToPath(import.meta.url));
```

This is automatically injected during Railway build via the custom build script. No manual intervention needed!

## How Multi-Device Sync Works

```
Device 1 (Phone)          PostgreSQL Database          Device 2 (Laptop)
      |                           |                            |
   Admin logs in              Stores all                  Viewer logs in
   Places a bid    ─────→   auction data   ─────→    Sees bid in real-time
      |                           |                            |
   WebSocket ←──────────────┬─────────────────────→ WebSocket
                        Broadcasts updates
```

### What's Synced

✅ **Auction State**: Current player, bids, auction status  
✅ **Team State**: Purse, players, grade counts  
✅ **Player Data**: All sold/unsold status from Excel import  
✅ **Real-time Updates**: Bids, sales, celebrations via WebSocket  

### Testing Multi-Device Sync

1. **Device 1** - Login as Admin: `admin` / `admin123`
2. **Device 2** - Login as Viewer: `viewer` / `viewer123`
3. **Device 1** - Start auction and place bids
4. **Device 2** - Should see updates in real-time ✅

## Troubleshooting

### "DATABASE_URL must be set" Error

**Solution**: Make sure PostgreSQL database is added in Railway dashboard.

### Database tables not created

**Solution**: Check build logs. Run manually:
```bash
railway run npm run db:push
```

### WebSocket not connecting

**Solution**: Railway supports WebSockets by default. Check:
- Both HTTP and WS use same domain
- No proxy/CDN blocking WebSocket connections

### App restarts lose data

**Solution**: This should NOT happen anymore! Data is in PostgreSQL, which persists across restarts.

## Cost Estimate

**Railway Hobby Plan**: $5/month
- Includes $5 usage credit
- PostgreSQL database included
- Perfect for auction app with ~100 concurrent users

**Actual usage**: Usually $2-3/month for light usage

## Need Help?

Check Railway docs: https://docs.railway.app
Or Railway Discord: https://discord.gg/railway
