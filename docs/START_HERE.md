# 🚀 START HERE - Azure Deployment Guide

**Confused about which Azure deployment guide to use? This page will help!**

---

## 📍 Deploying to Microsoft Azure

Choose the guide that matches your needs:

### 📤 Manual Upload (No CLI - Easiest)

**📄 Use: `AZURE_MANUAL_UPLOAD.md`**

**Perfect if you:**
- Upload files through Azure Portal
- Don't want to use command line
- Have Azure already set up
- Just drag & drop your files

**What's included:**
- How to build your app locally
- Where to upload files in Azure Portal
- Portal configuration settings
- Custom domain setup via Portal

---

### ⚡ Quick Start with CLI

**📄 Use: `QUICK_START_AZURE.md`**

**Perfect if you:**
- Want to use Azure CLI commands
- Comfortable with terminal/command line
- Want automated deployment

**What's included:**
- One-command deployment
- Custom domain setup
- SSL certificate configuration
- Basic troubleshooting

---

### 📚 Complete Guide (For Advanced Users)

**📄 Use: `AZURE_DEPLOYMENT.md`**

**Perfect if you:**
- Want detailed explanations of each step
- Need multiple deployment methods
- Want to set up GitHub Actions CI/CD
- Need advanced troubleshooting options

**What's included:**
- Multiple deployment approaches
- Detailed architecture explanation
- GitHub Actions workflow setup
- Comprehensive troubleshooting
- Advanced configuration options

---

### ✅ Pre-Deployment Checklist

**📄 Use: `DEPLOYMENT_CHECKLIST.md`**

**Use this before deploying to verify:**
- All configuration is correct
- Login credentials are changed
- Team logos are uploaded
- Players are imported
- Everything is ready for production

---

## 🎯 Quick Decision Guide

```
┌─────────────────────────────────────┐
│  Which guide should I use?          │
└─────────────────────────────────────┘
           │
           ├─ Upload files manually?
           │  └─→ AZURE_MANUAL_UPLOAD.md
           │
           ├─ Use command line?
           │  └─→ QUICK_START_AZURE.md
           │
           ├─ Getting 404 error?
           │  └─→ AZURE_404_FIX.md
           │
           ├─ Need detailed explanations?
           │  └─→ AZURE_DEPLOYMENT.md
           │
           └─ Setting up CI/CD?
              └─→ AZURE_DEPLOYMENT.md
```

---

## 📋 After Deployment: Configuration Guides

**Once your app is live on Azure**, customize it for your league:

### 1. Change League Name
- 📄 **Guide**: `HOW_TO_CHANGE_LEAGUE_NAME.md`
- 📁 **File**: `client/src/config/leagueConfig.ts`
- 🎯 **Change**: "TLPL S4" → Your league name

### 2. Configure Teams, Quotas, Prices
- 📄 **Guide**: `CONFIGURATION_GUIDE.md`
- 📁 **File**: `client/public/config.json`
- 🎯 **Configure**: Teams, purse, grade quotas, base prices

### 3. Import Players from Excel
- 📄 **Guide**: `EXCEL_COLUMN_CONFIG.md`
- 📁 **File**: `players.xlsx`
- 🎯 **Setup**: Column mapping, player data import

### 4. Add Player Statistics
- 📄 **Guide**: `PLAYER_STATS_GUIDE.md`
- 🎯 **Add**: Batting/bowling stats, strike rates, averages

---

## 🚀 Recommended Path for First-Time Deployment

Follow this order for smooth deployment:

```
1. Read DEPLOYMENT_CHECKLIST.md
   └─ Verify everything is ready
   
2. Follow QUICK_START_AZURE.md
   └─ Deploy your app (10 minutes)
   
3. Change league name
   └─ HOW_TO_CHANGE_LEAGUE_NAME.md
   
4. Configure teams & settings
   └─ CONFIGURATION_GUIDE.md
   
5. Import your players
   └─ EXCEL_COLUMN_CONFIG.md
   
6. Test the auction
   └─ Run a test auction with sample data
   
7. Go live!
   └─ Ready for your actual auction
```

---

## 🆘 Common Questions

**Q: Getting 404 error on Azure?**
**A:** See `AZURE_404_FIX.md` for step-by-step troubleshooting.

**Q: Do I need to remove .replit files before deploying to Azure?**
**A:** No! Azure deployment ignores Replit-specific files automatically.

**Q: Will WebSocket real-time updates work on Azure?**
**A:** Yes! Azure App Service supports WebSockets. The app also has built-in polling fallback.

**Q: Can I deploy this for multiple leagues?**
**A:** Yes! Deploy to different Azure App Services with different configurations.

**Q: How do I change default passwords for production?**
**A:** Edit `client/src/pages/Login.tsx` before deploying. See DEPLOYMENT_CHECKLIST.md.

**Q: What if I get stuck during deployment?**
**A:** Check the troubleshooting section in AZURE_DEPLOYMENT.md or QUICK_START_AZURE.md.

**Q: Can I use a custom domain?**
**A:** Yes! Both guides include custom domain setup instructions.

---

## 📞 Need Help?

1. **Start with**: `QUICK_START_AZURE.md` (covers 90% of use cases)
2. **Still stuck?**: Check `AZURE_DEPLOYMENT.md` troubleshooting section
3. **Before deploying**: Review `DEPLOYMENT_CHECKLIST.md`

---

**Ready to deploy to Azure? Open `QUICK_START_AZURE.md` now! 🚀**
