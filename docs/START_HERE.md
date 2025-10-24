# 🚀 START HERE - Deployment Guide

**Confused about which deployment guide to use? This page will help!**

---

## 📍 Where Are You Deploying?

### ✅ Deploying to **Bolt.new**
You're currently on **bolt.new** and want to deploy from there.

**Follow this order:**

1. **Option 1: Quick Deploy (Fastest)**
   - Click "Deploy" button in bolt.new interface
   - Get instant `.bolt.host` URL
   - Good for: Testing, demos

2. **Option 2: Netlify (Recommended for Production)**
   - In bolt.new, click "Integrations"
   - Connect to Netlify
   - Click "Deploy to Netlify"
   - Good for: Production with custom domain

3. **Option 3: Download & Deploy Later**
   - Download ZIP from bolt.new
   - Follow Azure guide below
   - Good for: Full control

**What you need to know:**
- ✅ No need to remove any files
- ✅ App works as-is
- ✅ WebSocket + polling fallback already built-in

---

### ✅ Deploying to **Azure**
You want to deploy to Microsoft Azure App Service.

**Follow this path:**

#### If you're new to Azure or want FAST deployment (10 minutes)
📄 **Use: `QUICK_START_AZURE.md`**
- Simple step-by-step guide
- One command deployment
- Custom domain setup included

#### If you want DETAILED explanations and advanced options
📄 **Use: `AZURE_DEPLOYMENT.md`**
- Complete deployment guide
- Multiple deployment methods
- Troubleshooting section
- GitHub Actions CI/CD setup

#### Before deploying to Azure
📄 **Check: `DEPLOYMENT_CHECKLIST.md`**
- Pre-deployment checklist
- What to verify before going live

---

### ✅ Deploying to **Other Platforms** (Vercel, Render, Heroku, etc.)
You want to deploy somewhere else.

**General Steps:**
1. Build the app: `npm run build`
2. Deploy `dist/` folder to your platform
3. Set startup command: `node dist/index.js`
4. Set environment: `NODE_ENV=production`

**Platform-Specific Notes:**
- **Vercel**: Use `vercel.json` config (similar to Azure)
- **Render**: Use `render.yaml` config
- **Heroku**: Use `Procfile` with `web: node dist/index.js`

---

## 🎯 Quick Decision Tree

```
Where are you deploying?
│
├─ Bolt.new → Click "Deploy" or use Netlify integration
│
├─ Azure (First time) → QUICK_START_AZURE.md
│
├─ Azure (Advanced) → AZURE_DEPLOYMENT.md
│
└─ Other Platform → Build locally, deploy dist/ folder
```

---

## 📋 Configuration Guides (After Deployment)

**After your app is live**, customize it for your league:

1. **Change League Name**
   - 📄 See: `HOW_TO_CHANGE_LEAGUE_NAME.md`
   - File: `client/src/config/leagueConfig.ts`

2. **Configure Teams, Quotas, Prices**
   - 📄 See: `CONFIGURATION_GUIDE.md`
   - File: `client/public/config.json`

3. **Import Players from Excel**
   - 📄 See: `EXCEL_COLUMN_CONFIG.md`
   - File: `players.xlsx`

4. **Add Player Statistics**
   - 📄 See: `PLAYER_STATS_GUIDE.md`

---

## ❓ Still Confused?

### For Deployment
- **Just want it live ASAP?** → `QUICK_START_AZURE.md` or Bolt.new deploy button
- **Want to understand everything?** → `AZURE_DEPLOYMENT.md`
- **Need a checklist?** → `DEPLOYMENT_CHECKLIST.md`

### For Configuration
- **Change league name?** → `HOW_TO_CHANGE_LEAGUE_NAME.md`
- **Change teams/settings?** → `CONFIGURATION_GUIDE.md`
- **Import players?** → `EXCEL_COLUMN_CONFIG.md`

---

## 🎯 Recommended Path for Beginners

```
1. Deploy first (Quick Start)
   ↓
2. Test with sample data
   ↓
3. Customize league name
   ↓
4. Configure teams
   ↓
5. Import your players
   ↓
6. Go live!
```

---

## 🆘 Common Questions

**Q: Do I need to remove .replit or other files before deploying?**
A: No! Deployment processes ignore Replit-specific files automatically.

**Q: Will my WebSocket real-time updates work on other platforms?**
A: Yes! The app has built-in fallback mechanisms (polling) if WebSocket fails.

**Q: Can I use this for multiple leagues?**
A: Yes! Just change the configuration and deploy to different domains.

**Q: How do I change passwords for production?**
A: Edit `client/src/pages/Login.tsx` and change the default credentials before deploying.

---

**Ready to deploy? Pick your platform above and follow the guide! 🚀**
