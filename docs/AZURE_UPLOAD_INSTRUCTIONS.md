# 🚀 AZURE UPLOAD INSTRUCTIONS - COMPLETE GUIDE

**Everything is ready! Just follow these steps to upload and run on Azure.**

---

## ✅ **What's Already Done**

✔️ Built the app (`dist/` folder created)  
✔️ Created `server.js` (Azure startup file)  
✔️ Created `web.config` (Windows IIS configuration)  
✔️ All dependencies are in `package.json`  

**You just need to upload and configure!**

---

## 📦 **What to Upload to Azure**

Upload these files/folders to Azure:

```
Your Azure wwwroot folder needs:
├── server.js          ← Startup file (REQUIRED)
├── web.config         ← IIS config (REQUIRED)
├── package.json       ← Dependencies list (REQUIRED)
├── dist/              ← Your built app (REQUIRED)
│   ├── index.js       ← Server code
│   └── public/        ← Frontend files
│       ├── index.html
│       ├── assets/
│       ├── config.json
│       ├── images/
│       ├── player_images/
│       └── players.xlsx
└── node_modules/      ← Optional (Azure can install)
```

---

## 📤 **Upload Method: Azure Portal (Easiest)**

### **Step 1: Go to Kudu Console**

1. Open https://portal.azure.com
2. Go to your App Service
3. In left menu, click **"Advanced Tools"**
4. Click **"Go →"** (opens Kudu)
5. Click **"Debug console"** → **"CMD"**

### **Step 2: Navigate to wwwroot**

In the file browser at top, click through:
```
home → site → wwwroot
```

You should see the path: `D:\home\site\wwwroot\`

### **Step 3: Delete Old Files**

Select all files/folders in wwwroot and delete them.

### **Step 4: Upload Files**

**Drag and drop these from your local computer:**

1. `server.js`
2. `web.config`
3. `package.json`
4. `dist/` (the entire folder)

**After upload, your wwwroot should look like:**
```
D:\home\site\wwwroot\
├── server.js
├── web.config
├── package.json
└── dist/
    ├── index.js
    └── public/
```

### **Step 5: Install Dependencies**

In the **CMD console** at bottom of Kudu, type:

```bash
npm install --production
```

Wait for it to finish (may take 2-3 minutes).

---

## ⚙️ **Configure Azure Settings**

### **Set Environment Variables**

1. Go back to Azure Portal → Your App Service
2. Click **"Configuration"** in left menu
3. Click **"Application settings"** tab
4. Click **"+ New application setting"**
5. Add:
   - **Name**: `NODE_ENV`
   - **Value**: `production`
6. Click **"OK"**
7. Click **"Save"** at top
8. Click **"Continue"** when prompted

---

## 🔄 **Restart Your App**

1. Go to **"Overview"** in left menu
2. Click **"Restart"** button at top
3. Click **"Yes"** to confirm
4. Wait 30 seconds

---

## ✅ **Test Your App**

### **Check Logs First**

1. In Azure Portal, click **"Log stream"** in left menu
2. Wait 10-15 seconds
3. Look for:
   ```
   serving on port 8080
   ```
   or
   ```
   serving on port 80
   ```

**If you see this, SUCCESS! ✅**

### **Visit Your Domain**

Open your browser and go to:
- **Custom domain**: https://access.cumecidine.us
- **Azure domain**: https://YOUR-APP-NAME.azurewebsites.net

**You should see the login page!**

---

## 🎯 **Quick Checklist**

Before testing, verify:

- ✅ `server.js` is in wwwroot root
- ✅ `web.config` is in wwwroot root
- ✅ `package.json` is in wwwroot root
- ✅ `dist/` folder exists with `index.js` and `public/`
- ✅ `dist/public/index.html` exists
- ✅ `dist/public/assets/` has .js and .css files
- ✅ `npm install` completed successfully
- ✅ `NODE_ENV=production` is set in Application settings
- ✅ App has been restarted

---

## 🔧 **If Something Goes Wrong**

### **Problem: 404 Error**

**Fix:**
1. Check logs in "Log stream"
2. Verify file structure matches above
3. Make sure `server.js` exists in root
4. Restart the app again

### **Problem: Application Error**

**Fix:**
1. Check logs for specific error
2. Run `npm install` again in Kudu console
3. Verify `NODE_ENV=production` is set
4. Restart the app

### **Problem: Page Loads But Looks Broken**

**Fix:**
1. Verify `dist/public/assets/` has files
2. Check that `dist/public/index.html` exists
3. Clear browser cache
4. Restart the app

---

## 📋 **Complete Upload Commands (CLI Alternative)**

If you prefer Azure CLI instead of manual upload:

```bash
# 1. Login
az login

# 2. Create deployment zip
cd /path/to/your/project
zip -r azure-deploy.zip server.js web.config package.json dist/

# 3. Deploy
az webapp deployment source config-zip \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --src azure-deploy.zip

# 4. Set environment
az webapp config appsettings set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --settings NODE_ENV=production

# 5. Restart
az webapp restart \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg

# 6. View logs
az webapp log tail \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

---

## 🎉 **Success!**

Once you see "serving on port..." in the logs:

✅ Your auction app is LIVE!  
✅ Go to https://access.cumecidine.us  
✅ Login with:
   - Admin: `admin` / `admin123`
   - Owner: `owner` / `owner123`
   - Viewer: `viewer` / `viewer123`

---

## 📞 **Need Help?**

If logs show errors, copy the error message and let me know!

**Most common issues:**
1. Missing `server.js` → Upload it to root
2. Missing `dist/public/` → Run `npm run build` locally first
3. `NODE_ENV` not set → Add in Application settings
4. Not restarted → Click Restart button

---

**That's it! Upload these files and your app will work!** 🚀
