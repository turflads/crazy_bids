# 🚀 Azure Manual Upload Guide (No CLI)

**Deploying by uploading files directly to Azure? Follow these steps.**

---

## Before You Upload: Build Your App

### Step 1: Build Locally

```bash
# In your project folder, run:
npm install
npm run build
```

This creates a `dist/` folder with:
- `dist/index.js` (your server)
- `dist/public/` (your website files)

### Step 2: Verify Build Output

```bash
# Check these files exist:
ls dist/index.js
ls dist/public/index.html
ls dist/public/assets/
```

**All should exist!** If not, your build failed.

---

## Configure Azure Portal Settings

### Step 1: Set Environment Variable

1. Go to **Azure Portal** → Your App Service
2. Click **Configuration** (left sidebar)
3. Under **Application settings**, click **+ New application setting**
4. Add this setting:
   - **Name**: `NODE_ENV`
   - **Value**: `production`
5. Click **OK**, then **Save** at the top
6. Click **Continue** when prompted

### Step 2: Set Startup Command

1. Still in **Configuration**
2. Click **General settings** tab
3. Find **Startup Command** field
4. Enter: `node dist/index.js`
5. Click **Save** at the top
6. Click **Continue** when prompted

---

## Upload Your Files

### Option 1: Using Azure Portal (Simple)

1. Go to **Azure Portal** → Your App Service
2. Click **Advanced Tools** (left sidebar)
3. Click **Go →** (opens Kudu)
4. Click **Debug console** → **CMD**
5. Navigate to: `/home/site/wwwroot`
6. Delete everything in this folder (select all → Delete)
7. Drag and drop your entire **`dist`** folder contents:
   - `index.js`
   - `public/` folder
   - Any other files from `dist/`

**Important**: Upload the **CONTENTS** of dist, not the dist folder itself!

Your Azure folder structure should look like:
```
/home/site/wwwroot/
├── index.js
├── public/
│   ├── index.html
│   └── assets/
└── (other dist files)
```

### Option 2: Using FTP (Alternative)

1. Go to **Azure Portal** → Your App Service
2. Click **Deployment Center** (left sidebar)
3. Click **FTPS credentials** tab
4. Copy your FTP hostname, username, and password
5. Use FileZilla or any FTP client to connect
6. Upload **contents of dist/** to `/site/wwwroot/`

---

## Restart Your App

After uploading:

1. Go to **Azure Portal** → Your App Service
2. Click **Overview** (left sidebar)
3. Click **Restart** at the top
4. Wait 30 seconds

---

## Test Your App

Visit your URLs:
- Azure URL: `https://YOUR-APP-NAME.azurewebsites.net`
- Custom domain: `https://access.cumecidine.us`

**If you see 404**, continue below.

---

## Fix 404 Error (Portal Method)

### Check 1: Verify Files Are Uploaded

1. Go to **Advanced Tools** → **Go →** (Kudu)
2. Click **Debug console** → **CMD**
3. Navigate to `/home/site/wwwroot`
4. You should see:
   - `index.js` file
   - `public/` folder

**If missing**: Re-upload as shown above.

### Check 2: Verify Environment Variable

1. Go to **Configuration**
2. Check **Application settings**
3. Verify `NODE_ENV = production` exists

**If missing**: Add it as shown in Step 1 above.

### Check 3: Verify Startup Command

1. Go to **Configuration** → **General settings**
2. Check **Startup Command** shows: `node dist/index.js`

**If different**: Change it to `node dist/index.js` and save.

### Check 4: View Logs

1. Go to **Log stream** (left sidebar)
2. Watch for errors
3. Should see: `serving on port 8080` or similar

**Common errors:**
- `Cannot find module` → Files not uploaded correctly
- `ENOENT` → Missing files in upload
- No output → Startup command is wrong

---

## Common Upload Mistakes

### ❌ WRONG: Uploading dist folder itself
```
/home/site/wwwroot/
└── dist/
    ├── index.js
    └── public/
```

### ✅ CORRECT: Uploading dist contents
```
/home/site/wwwroot/
├── index.js
└── public/
```

---

## Custom Domain Setup (Portal Method)

### Step 1: Get Verification ID

1. Go to **Custom domains** (left sidebar)
2. Copy the **Custom Domain Verification ID** shown at the top

### Step 2: Add DNS Records

Go to your domain registrar (where you bought `cumecidine.us`):

**Add these records:**

| Type | Name | Value |
|------|------|-------|
| CNAME | access | `YOUR-APP-NAME.azurewebsites.net` |
| TXT | asuid.access | `YOUR-VERIFICATION-ID` |

**Wait 5-10 minutes** for DNS to update.

### Step 3: Add Domain in Azure Portal

1. Go to **Custom domains** (left sidebar)
2. Click **+ Add custom domain**
3. Enter: `access.cumecidine.us`
4. Click **Validate**
5. Should show ✓ for all checks
6. Click **Add custom domain**

### Step 4: Enable HTTPS

1. Still in **Custom domains**
2. Find your domain in the list
3. Click **Add binding**
4. Select **TLS/SSL certificate**: `App Service Managed Certificate`
5. Click **Add binding**

**Wait 10-15 minutes** for SSL certificate to activate.

---

## Quick Troubleshooting Checklist

If getting 404 error, verify these in order:

1. ✅ Files uploaded to `/home/site/wwwroot/` (not in a subdirectory)
2. ✅ `NODE_ENV=production` in Application settings
3. ✅ Startup command is `node dist/index.js` (NOT `node dist/dist/index.js`)
4. ✅ App restarted after changes
5. ✅ `dist/public/index.html` exists in upload
6. ✅ No extra `dist/` folder wrapping in Azure

---

## Verify Local Build Before Upload

Before uploading to Azure, test locally:

```bash
# Build the app
npm run build

# Test it locally
cd dist
NODE_ENV=production PORT=5000 node index.js
```

Open browser to `http://localhost:5000`

**If it works locally**, the build is good. Upload to Azure.

**If it doesn't work locally**, fix the build first.

---

## File Upload Checklist

Before clicking Upload:

- ✅ Ran `npm run build`
- ✅ `dist/index.js` exists
- ✅ `dist/public/index.html` exists
- ✅ `dist/public/assets/` has files
- ✅ Ready to upload **contents** of dist (not dist folder itself)

---

## Need to Update App?

Every time you make changes:

1. **Build locally**: `npm run build`
2. **Delete old files** in Azure `/home/site/wwwroot/`
3. **Upload new files** from `dist/`
4. **Restart app** in Azure Portal

---

**Common Issue**: If `access.cumecidine.us` shows 404 but `YOUR-APP-NAME.azurewebsites.net` works, it's a DNS issue. Check your CNAME record points to the correct Azure URL.

---

**Still stuck?** Check the **Log stream** in Azure Portal to see the exact error message.
