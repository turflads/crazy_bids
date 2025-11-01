# Railway Deployment Guide

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

In Railway Dashboard:
1. Click your project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway automatically sets `DATABASE_URL` environment variable ✅

### Step 4: Configure Build Command (if needed)

Railway should auto-detect from `railway.json`, but if not:

1. Go to your service → Settings
2. Under "Build", set custom build command:
   ```
   npm install && npm run build && npm run db:push
   ```
3. Under "Deploy", start command should be:
   ```
   npm start
   ```

### Step 5: Set Environment Variables (if needed)

In Railway Dashboard → Variables:
- `NODE_ENV` = `production` (optional, auto-set)
- `DATABASE_URL` = Auto-set by PostgreSQL service ✅
- `SESSION_SECRET` = (generate a random string)

### Step 6: Deploy & Access

1. Railway will build and deploy automatically
2. You'll get a URL like: `https://your-auction.up.railway.app`
3. Open this URL on **multiple devices** to test sync!

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
