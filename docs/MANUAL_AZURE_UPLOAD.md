# 📤 Manual Azure Upload Guide

**How to manually upload your cricket auction app to Azure**

---

## Prerequisites

✅ You have an Azure App Service created
✅ You have built the app locally (`npm run build`)
✅ Your `dist/` folder exists with the correct structure

---

## Option 1: Upload via Azure Portal (Easiest)

### Step 1: Go to Azure Portal

1. Visit: https://portal.azure.com
2. Navigate to your App Service (e.g., "cricket-auction-2025")
3. In the left menu, find **"Advanced Tools"** or **"App Service Editor"**
4. Click **"Go →"**

### Step 2: Access Kudu Console

The Kudu console will open. Choose one of these methods:

**Method A: Using File Manager**
1. Click **"Debug console"** → **"CMD"** or **"PowerShell"**
2. You'll see a file browser at the top and a command prompt at the bottom

**Method B: Using ZIP Deploy**
1. Click **"Tools"** → **"Zip Deploy"**

### Step 3: Navigate to the Right Folder

In the file browser, navigate to:
```
D:\home\site\wwwroot\
```

This is where your files need to go.

### Step 4: Upload Your Files

**If using File Manager:**
1. Delete any existing files in `wwwroot/`
2. Drag and drop your **entire `dist/` folder** into `wwwroot/`
3. After upload, you should see:
   ```
   D:\home\site\wwwroot\
   └── dist/
       ├── index.js
       └── public/
           ├── assets/
           ├── index.html
           └── ... (other files)
   ```

**If using ZIP Deploy:**
1. Zip your `dist/` folder locally:
   ```bash
   cd dist/
   zip -r ../app.zip .
   cd ..
   ```
2. Drag `app.zip` to the Zip Deploy page
3. Azure will automatically extract it to `wwwroot/`

---

## Option 2: Upload via FTP (Alternative)

### Step 1: Get FTP Credentials

In Azure Portal:
1. Go to your App Service
2. Click **"Deployment Center"** in left menu
3. Click **"FTPS credentials"** tab
4. Copy:
   - **FTP hostname**
   - **Username**
   - **Password**

### Step 2: Connect with FTP Client

Use FileZilla or any FTP client:
- **Host**: (paste FTP hostname)
- **Username**: (paste username)
- **Password**: (paste password)
- **Port**: 21 (for FTP) or 990 (for FTPS - recommended)

### Step 3: Upload Files

1. Navigate to remote folder: `/site/wwwroot/`
2. Delete any existing files
3. Upload your **entire `dist/` folder** contents
4. Final structure on Azure:
   ```
   /site/wwwroot/
   ├── index.js
   └── public/
       ├── assets/
       ├── index.html
       └── ... (other files)
   ```

**IMPORTANT**: Upload the **contents** of `dist/`, not the `dist/` folder itself!

---

## Option 3: Upload via Azure CLI (Fastest)

```bash
# Build locally first
npm run build

# Create a zip of the dist folder contents
cd dist/
zip -r ../deploy.zip .
cd ..

# Deploy the zip to Azure
az webapp deployment source config-zip \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --src deploy.zip

# Clean up
rm deploy.zip
```

---

## Critical: Set Startup Command

After uploading files, you **MUST** set the startup command:

### Via Azure Portal:
1. Go to your App Service
2. Click **"Configuration"** in left menu
3. Click **"General settings"** tab
4. In **"Startup Command"** box, enter:
   ```
   node dist/index.js
   ```
5. Click **"Save"** at the top

### Via Azure CLI:
```bash
az webapp config set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --startup-file "node dist/index.js"
```

---

## Set Environment Variables

### Via Azure Portal:
1. Go to **"Configuration"** → **"Application settings"**
2. Click **"New application setting"**
3. Add:
   - **Name**: `NODE_ENV`
   - **Value**: `production`
4. Click **"OK"**, then **"Save"**

### Via Azure CLI:
```bash
az webapp config appsettings set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --settings NODE_ENV=production
```

---

## Restart Your App

### Via Azure Portal:
1. Go to your App Service **"Overview"** page
2. Click **"Restart"** at the top

### Via Azure CLI:
```bash
az webapp restart \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

---

## Verify It Works

### Step 1: Check Logs

**Via Azure Portal:**
1. Go to **"Log stream"** in left menu
2. Wait 10 seconds
3. Look for: `serving on port 8080` or similar

**Via Azure CLI:**
```bash
az webapp log tail \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

### Step 2: Test Your Domain

Visit your URL:
- Azure default: `https://YOUR_APP_NAME.azurewebsites.net`
- Custom domain: `https://access.cumecidine.us`

You should see the login page!

---

## Common Issues After Manual Upload

### Issue 1: "Application Error" or 404

**Cause**: Wrong folder structure or startup command

**Fix**:
1. Verify files are in `wwwroot/` (not `wwwroot/dist/`)
2. Check startup command is: `node dist/index.js`
3. Verify `wwwroot/dist/index.js` exists
4. Verify `wwwroot/dist/public/index.html` exists

### Issue 2: Files Not Found

**Cause**: Uploaded `dist/` folder instead of its contents

**Wrong structure:**
```
wwwroot/
└── dist/          ← WRONG! Extra dist folder
    └── dist/
        ├── index.js
        └── public/
```

**Correct structure:**
```
wwwroot/
└── dist/          ← CORRECT!
    ├── index.js
    └── public/
```

**Fix**: Delete everything in `wwwroot/` and upload again, making sure the first level is `dist/`.

### Issue 3: CSS/Images Not Loading

**Cause**: Missing `public/` folder or files

**Fix**:
1. Verify `wwwroot/dist/public/` exists
2. Verify `wwwroot/dist/public/assets/` exists with `.js` and `.css` files
3. Verify `wwwroot/dist/public/index.html` exists
4. Rebuild locally: `npm run build`
5. Upload again

---

## Final Checklist

Before testing your app, verify:

✅ Files uploaded to correct location:
   - `D:\home\site\wwwroot\dist\index.js` (Windows)
   - `/home/site/wwwroot/dist/index.js` (Linux)

✅ Startup command set:
   - `node dist/index.js`

✅ Environment variable set:
   - `NODE_ENV=production`

✅ App restarted after changes

✅ Logs show "serving on port..."

---

## Quick Commands Reference

```bash
# Build locally
npm run build

# Create deployment zip
cd dist/ && zip -r ../deploy.zip . && cd ..

# Deploy via CLI
az webapp deployment source config-zip \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --src deploy.zip

# Set startup command
az webapp config set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --startup-file "node dist/index.js"

# Set environment
az webapp config appsettings set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --settings NODE_ENV=production

# Restart
az webapp restart \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg

# View logs
az webapp log tail \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

---

## Need Help?

If you're still getting 404 errors after following this guide:

1. Check logs: `az webapp log tail --name YOUR_APP_NAME --resource-group cricket-rg`
2. Verify folder structure in Kudu console
3. Confirm startup command is set correctly
4. Ensure `NODE_ENV=production` is set

---

**Your app should now be live! 🎉**
