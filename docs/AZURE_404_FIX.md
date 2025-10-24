# 🔧 Fixing Azure 404 Error

**Getting `404 Not Found` on your Azure domain? Follow these steps in order.**

---

## Step 1: Check If App Is Running on Azure

```bash
# View live logs from your Azure app
az webapp log tail \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

**What to look for:**
- ✅ Should see: `serving on port 8080` or similar
- ❌ If you see errors, note them and continue

**Press Ctrl+C to exit logs**

---

## Step 2: Verify Environment Variables

The app MUST have `NODE_ENV=production` set.

```bash
# Set NODE_ENV to production
az webapp config appsettings set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --settings NODE_ENV=production

# Verify it's set
az webapp config appsettings list \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --query "[?name=='NODE_ENV']"
```

---

## Step 3: Ensure Correct Startup Command

```bash
# Set the correct startup command
az webapp config set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --startup-file "node dist/index.js"

# Verify it's set
az webapp config show \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --query "appCommandLine"
```

Should show: `"node dist/index.js"`

---

## Step 4: Rebuild and Redeploy

**Important**: Your local build might be missing files.

```bash
# Clean previous build
rm -rf dist/

# Install dependencies (fresh)
npm install

# Build everything
npm run build

# Verify build output
ls -la dist/
# Should see:
# - dist/index.js (your server)
# - dist/public/ (your client files)

ls -la dist/public/
# Should see:
# - index.html
# - assets/ (folder with JS/CSS)
```

**If `dist/public/` is missing or empty**, you need to fix the build:

```bash
# Build client first, then server
npm run build
```

---

## Step 5: Check Package.json Build Script

Open `package.json` and verify this line exists:

```json
"scripts": {
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
}
```

**This command does two things:**
1. `vite build` → Creates `dist/public/` with your frontend
2. `esbuild...` → Creates `dist/index.js` with your backend

---

## Step 6: Redeploy to Azure

```bash
# Deploy the newly built app
az webapp up \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --runtime "NODE:20-lts"

# Restart the app
az webapp restart \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

**Wait 30 seconds**, then visit your domain.

---

## Step 7: Verify App Files on Azure

```bash
# SSH into your Azure app (this opens a browser)
az webapp ssh \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

Once connected, run these commands in the Azure shell:

```bash
# Check if files exist
ls -la
# Should see: dist/ folder

ls -la dist/
# Should see: index.js, public/

ls -la dist/public/
# Should see: index.html, assets/

# Try running the app manually
NODE_ENV=production PORT=8080 node dist/index.js
```

**If it says "serving on port 8080"**, your app works! The issue is configuration.

**Press Ctrl+C** to stop it and type `exit` to leave SSH.

---

## Step 8: Enable Detailed Logging

```bash
# Enable detailed logging
az webapp log config \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --application-logging filesystem \
  --level verbose

# Restart app
az webapp restart \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg

# View logs again
az webapp log tail \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

---

## Step 9: Check Domain Configuration

If your `.azurewebsites.net` URL works but your custom domain (`access.cumecidine.us`) doesn't:

```bash
# Verify custom domain is added
az webapp config hostname list \
  --webapp-name YOUR_APP_NAME \
  --resource-group cricket-rg
```

**Should show your domain in the list.**

If not, add it:

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --hostname access.cumecidine.us
```

**Then verify DNS:**

```bash
# Check if DNS points to Azure
nslookup access.cumecidine.us
```

**Should return something like:**
```
Name:    access.cumecidine.us
Address: YOUR-APP-NAME.azurewebsites.net
```

---

## Step 10: Force HTTPS (If Using Custom Domain)

```bash
# Enable HTTPS only
az webapp update \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --https-only true

# Restart
az webapp restart \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

---

## Quick Fix Checklist

Run these commands in order:

```bash
# 1. Set environment
az webapp config appsettings set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --settings NODE_ENV=production

# 2. Set startup command
az webapp config set \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --startup-file "node dist/index.js"

# 3. Restart
az webapp restart \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg

# 4. Watch logs
az webapp log tail \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg
```

**Wait 30 seconds and test your domain.**

---

## Common Errors & Solutions

### Error: "Could not find the build directory"

**Cause**: Missing `dist/public/` folder

**Fix**:
```bash
rm -rf dist/
npm run build
az webapp up --name YOUR_APP_NAME --resource-group cricket-rg
```

---

### Error: "ENOENT: no such file or directory"

**Cause**: Missing files in deployment

**Fix**:
```bash
# Verify these files exist locally before deploying
ls dist/index.js
ls dist/public/index.html
ls dist/public/assets/

# If missing, rebuild
npm run build
```

---

### Error: "Application Error"

**Cause**: App crashed on startup

**Fix**:
```bash
# Check logs for specific error
az webapp log tail --name YOUR_APP_NAME --resource-group cricket-rg

# Common fix: Reinstall dependencies
rm -rf node_modules/ package-lock.json
npm install
npm run build
az webapp up --name YOUR_APP_NAME --resource-group cricket-rg
```

---

### Custom Domain Shows 404, But .azurewebsites.net Works

**Cause**: DNS or SSL certificate issue

**Fix**:
```bash
# 1. Verify DNS
nslookup access.cumecidine.us

# 2. Re-add domain
az webapp config hostname delete \
  --webapp-name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --hostname access.cumecidine.us

az webapp config hostname add \
  --webapp-name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --hostname access.cumecidine.us

# 3. Wait 5 minutes for SSL certificate
# 4. Test again
```

---

## Still Not Working?

### Debug with these commands:

```bash
# Get all app details
az webapp show \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg

# List all settings
az webapp config appsettings list \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg

# Check app state
az webapp show \
  --name YOUR_APP_NAME \
  --resource-group cricket-rg \
  --query "state"
```

**Should show: `"Running"`**

---

## Test URLs

After fixes, test both:

1. **Azure Default URL**: `https://YOUR_APP_NAME.azurewebsites.net`
2. **Custom Domain**: `https://access.cumecidine.us`

**Both should work!**

---

## Need More Help?

Provide these details:
1. Error message from logs (`az webapp log tail`)
2. Output of `ls -la dist/` locally
3. Output of `az webapp config show --name YOUR_APP_NAME --resource-group cricket-rg`
4. Whether `.azurewebsites.net` URL works

---

**Most common fix: Just run the Quick Fix Checklist above! 🚀**
