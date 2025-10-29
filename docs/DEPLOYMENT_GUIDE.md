# Deployment Guide - Railway & Fly.io

This guide covers deploying the Cricket Player Auction app to Railway or Fly.io.

---

## 🚂 **Railway Deployment**

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository with your code

### Steps

#### 1. **Prepare Your Project**
Make sure your `package.json` has these scripts:
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:express --external:ws --format=esm --target=node18",
    "start": "node dist/index.js",
    "copy-assets": "cp -r client/public/* dist/public/ && cp players.xlsx dist/public/"
  }
}
```

#### 2. **Deploy to Railway**

**Option A: From GitHub**
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect Node.js

**Option B: Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### 3. **Configure Environment**
Railway will automatically set `PORT` - your app listens on port 5000.

Add these if needed:
- `NODE_ENV=production`

#### 4. **Build Command**
Railway auto-detects. If needed, set:
- **Build Command**: `npm run build && npm run copy-assets`
- **Start Command**: `npm start`

#### 5. **Access Your App**
Railway provides a URL like: `https://your-app.railway.app`

---

## ✈️ **Fly.io Deployment**

### Prerequisites
- Fly.io account (https://fly.io)
- Fly CLI installed

### Steps

#### 1. **Install Fly CLI**
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

#### 2. **Login to Fly**
```bash
fly auth login
```

#### 3. **Create fly.toml Configuration**
Create a `fly.toml` file in your project root:

```toml
app = "cricket-auction"  # Change this to your app name

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[[services]]
  internal_port = 5000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.tcp_checks]]
    grace_period = "10s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

#### 4. **Initialize and Deploy**
```bash
# Initialize
fly launch --no-deploy

# Deploy
fly deploy

# Check status
fly status

# View logs
fly logs
```

#### 5. **Access Your App**
Fly.io provides a URL like: `https://cricket-auction.fly.dev`

---

## 📝 **Post-Deployment Checklist**

After deploying to either platform:

### ✅ **1. Upload Your Excel File**
- SSH into your server or use the platform's file manager
- Upload `players.xlsx` to the correct location
- Or modify your code to upload via admin panel

### ✅ **2. Configure Teams**
- Update `client/public/config.json` with your teams, purses, and quotas
- Upload team logos to `client/public/images/`

### ✅ **3. Test Login**
Default credentials:
- **Super Admin**: `superadmin` / `superadmin123`
- **Admin**: `admin` / `admin123`
- **Owner**: `owner` / `owner123`
- **Viewer**: `viewer` / `viewer123`

**⚠️ IMPORTANT**: Change these passwords in `client/src/pages/Login.tsx` before going live!

### ✅ **4. Test Auction Flow**
1. Login as Admin
2. Start auction
3. Place some bids
4. Mark player as sold
5. Check if celebration popup appears
6. Verify team overview updates

### ✅ **5. Test Cross-Tab Sync**
- Open app in two browser tabs
- Make changes in one tab
- Verify updates appear in the other tab

---

## 🔧 **Troubleshooting**

### **Build Fails**
**Railway**:
```bash
# Check logs in Railway dashboard
# Or use CLI:
railway logs
```

**Fly.io**:
```bash
fly logs
```

### **Assets Not Loading**
Make sure you ran:
```bash
npm run copy-assets
```

This copies:
- `client/public/*` → `dist/public/`
- `players.xlsx` → `dist/public/`
- Team logos → `dist/public/images/`

### **Port Issues**
- Railway: Uses PORT from environment (don't hardcode 5000)
- Fly.io: Internal port 5000, external port 80/443

Update `server/index.ts` to use:
```typescript
const PORT = process.env.PORT || 5000;
```

### **WebSocket Issues**
If real-time updates don't work:
1. Check if platform supports WebSockets (both do!)
2. Verify WebSocket connection in browser console (F12)
3. Check server logs for WebSocket errors

---

## 💰 **Cost Comparison**

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Railway** | $5 credit/month | Pay as you go ($0.000463/GB-hour) |
| **Fly.io** | 3 VMs free | $1.94/mo per 256MB VM |

Both offer generous free tiers suitable for small auctions!

---

## 🚀 **Performance Tips**

### **1. Enable Compression**
Already enabled in Express:
```typescript
app.use(compression());
```

### **2. Optimize Images**
- Keep team logos under 100KB
- Use PNG or WebP format
- Resize to 200x200px max

### **3. Cache Static Assets**
Already configured in Express:
```typescript
app.use(express.static('dist/public', { maxAge: '1d' }));
```

### **4. Monitor Performance**
**Railway**: Built-in metrics in dashboard  
**Fly.io**: `fly dashboard` or `fly logs`

---

## 📚 **Additional Resources**

### Railway
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Fly.io
- Docs: https://fly.io/docs
- Community: https://community.fly.io

---

## ⚠️ **Security Notes**

### Before Production Deployment:

1. **Change Login Credentials**
   - Edit `client/src/pages/Login.tsx`
   - Update all default passwords

2. **Environment Variables**
   - Store sensitive data in environment variables
   - Never commit secrets to Git

3. **HTTPS**
   - Both platforms provide free SSL certificates
   - Ensure all traffic uses HTTPS

4. **Rate Limiting**
   - Consider adding rate limiting for API endpoints
   - Prevent abuse of bid endpoints

---

## 🎉 **You're Ready!**

Your auction app should now be live and accessible to teams for bidding!

For questions or issues, check:
- `/docs/` folder for other guides
- Platform-specific documentation
- GitHub issues (if open source)

Happy Auctioning! 🏏
