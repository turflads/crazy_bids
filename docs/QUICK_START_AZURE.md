# Quick Start: Deploy to Azure in 10 Minutes ⚡

The fastest way to get your Cricket Auction app live on Azure with your custom domain.

## Prerequisites (5 minutes)

```bash
# 1. Install Azure CLI (if not installed)
# Windows: Download from https://aka.ms/installazurecliwindows
# Mac: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 2. Login to Azure
az login

# 3. Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "Your Subscription Name"
```

## Deploy Now! (5 minutes)

### Step 1: Update package.json

Add these scripts to your `package.json`:

```json
"scripts": {
  "build:client": "vite build",
  "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "build": "npm run build:client && npm run build:server"
}
```

### Step 2: Build Locally

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Verify dist/ folder has:
# - dist/index.js
# - dist/public/*
ls -la dist/
```

### Step 3: Deploy to Azure

```bash
# One command deploys everything!
az webapp up \
  --name cricket-auction-2025 \
  --resource-group cricket-rg \
  --runtime "NODE:20-lts" \
  --os-type Linux \
  --sku B1 \
  --location eastus
```

**Replace `cricket-auction-2025` with your unique app name!**

This command:
- ✅ Creates resource group
- ✅ Creates app service plan
- ✅ Creates web app
- ✅ Uploads your code
- ✅ Starts your app

### Step 4: Set Startup Command

```bash
az webapp config set \
  --name cricket-auction-2025 \
  --resource-group cricket-rg \
  --startup-file "node dist/index.js"
```

### Step 5: Restart App

```bash
az webapp restart \
  --name cricket-auction-2025 \
  --resource-group cricket-rg
```

### Step 6: Test Your App

Visit: `https://cricket-auction-2025.azurewebsites.net`

**Login credentials:**
- Admin: `admin` / `admin123`
- Owner: `owner` / `owner123`
- Viewer: `viewer` / `viewer123`

---

## Add Custom Domain (Optional - 10 more minutes)

### Step 1: Get Your Verification ID

```bash
VERIFICATION_ID=$(az webapp show \
  --name cricket-auction-2025 \
  --resource-group cricket-rg \
  --query customDomainVerificationId \
  --output tsv)

echo "Add this TXT record to your domain: $VERIFICATION_ID"
```

### Step 2: Add DNS Records

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**For subdomain** (e.g., `auction.yourdomain.com`):

| Type | Name | Value |
|------|------|-------|
| CNAME | auction | `cricket-auction-2025.azurewebsites.net` |
| TXT | asuid.auction | `{paste verification ID}` |

### Step 3: Add Domain to Azure

```bash
# Wait 5 minutes for DNS propagation, then:
az webapp config hostname add \
  --webapp-name cricket-auction-2025 \
  --resource-group cricket-rg \
  --hostname auction.yourdomain.com
```

### Step 4: Enable Free SSL

```bash
# Azure provides free SSL certificate
az webapp config ssl bind \
  --name cricket-auction-2025 \
  --resource-group cricket-rg \
  --certificate-thumbprint auto \
  --ssl-type SNI

# Force HTTPS
az webapp update \
  --name cricket-auction-2025 \
  --resource-group cricket-rg \
  --https-only true
```

**Wait 10 minutes for SSL certificate to activate.**

### Step 5: Visit Your Custom Domain

`https://auction.yourdomain.com` 🎉

---

## View Live Logs

```bash
# See what's happening in real-time
az webapp log tail \
  --name cricket-auction-2025 \
  --resource-group cricket-rg
```

---

## Common Commands

```bash
# Restart app
az webapp restart --name cricket-auction-2025 --resource-group cricket-rg

# Stop app
az webapp stop --name cricket-auction-2025 --resource-group cricket-rg

# View app info
az webapp show --name cricket-auction-2025 --resource-group cricket-rg

# Delete everything
az group delete --name cricket-rg --yes
```

---

## Troubleshooting

### App shows "Application Error"

```bash
# Check logs
az webapp log tail --name cricket-auction-2025 --resource-group cricket-rg

# Common fix: Restart
az webapp restart --name cricket-auction-2025 --resource-group cricket-rg
```

### Images not loading

Make sure you copied assets during build:

```bash
# Copy manually if needed
cp -r client/public/* dist/public/
cp -r attached_assets/* dist/public/assets/
cp config.json dist/
cp players.xlsx dist/

# Redeploy
az webapp up --name cricket-auction-2025 --resource-group cricket-rg
```

### Domain not working

```bash
# Check DNS propagation (can take up to 48 hours)
nslookup auction.yourdomain.com

# Verify TXT record
nslookup -type=TXT asuid.auction.yourdomain.com
```

---

## Next Steps

1. ✅ App is live at `https://cricket-auction-2025.azurewebsites.net`
2. ✅ (Optional) Custom domain at `https://auction.yourdomain.com`
3. 📚 Read full guide: `AZURE_DEPLOYMENT.md`
4. ✅ Set up auto-deployment with GitHub Actions
5. 🔒 Change default passwords in production
6. 📊 Enable monitoring and alerts

---

## Cost

**Basic B1 Tier**: ~$13/month
- 24/7 uptime
- Custom domain + SSL
- 1.75 GB RAM
- No sleep/cold starts

**Free F1 Tier**: $0/month
- 60 minutes/day runtime
- No custom domain
- Good for testing only

---

## Need Help?

- 📖 Detailed Guide: `AZURE_DEPLOYMENT.md`
- ✅ Checklist: `DEPLOYMENT_CHECKLIST.md`
- 🔧 Package.json Updates: `PACKAGE_JSON_UPDATES.md`

---

**Your cricket auction is now live! 🏏🎉**
