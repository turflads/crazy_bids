# 🚀 Deploy Cricket Auction Platform to Render

This guide will help you deploy your cricket auction platform to Render for free.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account
- ✅ Your code pushed to a GitHub repository
- ✅ A Render account (free) - [Sign up here](https://dashboard.render.com/register)

---

## 🎯 Step-by-Step Deployment Guide

### **Step 1: Push Your Code to GitHub**

If you haven't already:

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Cricket auction platform"
   ```

2. **Create a GitHub repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name it: `cricket-auction-platform`
   - Make it **Public** or **Private** (your choice)
   - Don't initialize with README (you already have code)
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/cricket-auction-platform.git
   git branch -M main
   git push -u origin main
   ```

---

### **Step 2: Sign Up for Render**

1. Go to [render.com](https://render.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up using your **GitHub account** (easiest option)
4. Authorize Render to access your GitHub repositories

---

### **Step 3: Create a PostgreSQL Database**

1. **In Render Dashboard**, click **"New +"** → **"PostgreSQL"**

2. **Fill in the details**:
   - **Name**: `cricket-auction-db`
   - **Database**: `cricket_auction`
   - **User**: `cricket_auction_user`
   - **Region**: Choose closest to you (or Oregon)
   - **Plan**: **Free**

3. Click **"Create Database"**

4. **IMPORTANT**: Copy the following values (you'll need them):
   - **Internal Database URL** (starts with `postgres://`)
   - Save this somewhere safe!

⚠️ **Note**: Free PostgreSQL databases on Render expire after **90 days**. Mark your calendar!

---

### **Step 4: Deploy the Web Service**

1. **In Render Dashboard**, click **"New +"** → **"Web Service"**

2. **Connect your GitHub repository**:
   - If this is your first time: Grant Render access to your repositories
   - Find and select: `cricket-auction-platform`
   - Click **"Connect"**

3. **Fill in the deployment details**:

   | Field | Value |
   |-------|-------|
   | **Name** | `cricket-auction` |
   | **Region** | Same as database (e.g., Oregon) |
   | **Branch** | `main` |
   | **Root Directory** | Leave empty |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npm run build && npm run db:push` |
   | **Start Command** | `npm start` |
   | **Plan** | **Free** |

4. **Add Environment Variables**:
   
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *Paste the Internal Database URL you copied* |

5. **Auto-Deploy**: Keep this **ON** (deploys automatically on git push)

6. Click **"Create Web Service"**

---

### **Step 5: Wait for Deployment**

Render will now:
1. ✅ Clone your GitHub repository
2. ✅ Install dependencies (`npm install`)
3. ✅ Build frontend and backend (`npm run build`)
4. ✅ Run database migrations (`npm run db:push`)
5. ✅ Start your server (`npm start`)

**This takes 5-10 minutes**. You'll see live logs on the screen.

Look for:
```
==> Build successful 🎉
==> Deploying...
==> Your service is live 🎉
```

---

### **Step 6: Get Your Live URL**

Once deployed, Render gives you a URL like:
```
https://cricket-auction.onrender.com
```

Click the URL to open your live auction platform! 🎉

---

### **Step 7: Upload Your Excel File**

1. Open your live URL
2. Login as **Super Admin**:
   - Username: `superadmin`
   - Password: `superadmin123`
3. Navigate to **"Players"** tab
4. Click **"Load Players from Excel"**
5. Upload your `players.xlsx` file
6. Click **"Save to Database"**

Your auction platform is now live! 🏏

---

## ⚙️ Configure Your Application

### **Upload Team Logos**

Your team logos need to be in the correct location:

1. Make sure logos are in: `client/public/images/`
2. Update `config.json` team flags if needed
3. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Add team logos"
   git push
   ```

Render will auto-deploy the changes!

---

## 🔧 Troubleshooting

### **Issue: "Service Unavailable" or 503 Error**

**Solution**: Free services sleep after 15 minutes of inactivity. Just wait 30-60 seconds for it to wake up.

To keep it awake, use [UptimeRobot](https://uptimerobot.com):
1. Sign up for free
2. Add your Render URL as a monitor
3. Set interval to **5 minutes**
4. This pings your app to keep it awake

---

### **Issue: Database Not Connecting**

**Check**:
1. Go to Render Dashboard → Your Web Service → Environment
2. Verify `DATABASE_URL` is set correctly
3. Make sure it's the **Internal Database URL** (not External)

---

### **Issue: Build Fails**

**Check the logs**:
1. In Render Dashboard → Your Web Service → Logs
2. Look for error messages
3. Common issues:
   - Missing dependencies → Check `package.json`
   - Build command failed → Verify commands work locally

---

### **Issue: WebSocket Not Working**

**WebSockets work on Render!** But:
- Free tier services sleep after 15 min
- Connections break when service wakes up
- Users need to refresh page

**Solution**: Your app already has auto-reconnect logic built-in via Socket.io!

---

## 📊 Monitor Your App

**Check logs**:
1. Render Dashboard → Your Web Service
2. Click **"Logs"** tab
3. See real-time server logs

**Check database**:
1. Render Dashboard → Your Database
2. Click **"Connect"** → **"External Connection"**
3. Use any PostgreSQL client to view data

---

## 🔄 Update Your App

Whenever you make changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Render automatically deploys the changes! 🚀

---

## ⚠️ Important Limitations (Free Tier)

| Limitation | Impact | Solution |
|------------|--------|----------|
| **Database expires after 90 days** | Data lost | Upgrade to $7/month or migrate to Neon |
| **Service sleeps after 15 min** | 30-60s wake time | Use UptimeRobot to keep awake |
| **No custom domain** | Uses `.onrender.com` URL | Upgrade to $7/month for custom domain |
| **Limited bandwidth** | 100GB/month | Should be fine for small auctions |

---

## 💰 Upgrade Options

If you want to remove limitations:

**Database Only** ($7/month):
- Database never expires
- Automated backups
- More storage

**Web Service Only** ($7/month):
- No sleep (always on)
- More resources
- Custom domain support

**Both** ($14/month):
- Professional setup
- Perfect for live auctions

---

## 📱 Share Your Auction Platform

Once deployed, share these URLs:

**Super Admin**: `https://your-app.onrender.com/`
- Login: `superadmin` / `superadmin123`
- Full control

**Admin**: `https://your-app.onrender.com/`
- Login: `admin` / `admin123`
- Run auctions

**Owners**: `https://your-app.onrender.com/`
- Login: `owner` / `owner123`
- View teams

**Viewers**: `https://your-app.onrender.com/`
- Login: `viewer` / `viewer123`
- Public dashboard

---

## 🎉 You're Live!

Your cricket auction platform is now deployed and accessible from anywhere in the world!

**Next Steps**:
1. Test all features (login, upload players, run auction)
2. Share the URL with your team
3. Set up UptimeRobot to keep it awake
4. Mark your calendar for 90-day database expiration

Need help? Check the troubleshooting section above!

---

**Deployment Date**: _________  
**Live URL**: https://cricket-auction.onrender.com  
**Database Expiration**: _________ (90 days from deployment)
