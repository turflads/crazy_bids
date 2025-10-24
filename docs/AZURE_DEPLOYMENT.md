# Azure Deployment Guide - Cricket Auction App

Complete guide to deploy your Cricket Auction application to Azure App Service with a custom domain.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Deployment Methods](#deployment-methods)
4. [Custom Domain Setup](#custom-domain-setup)
5. [Environment Configuration](#environment-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Azure Account**: [Create free account](https://azure.microsoft.com/free/)
- **Azure CLI**: [Install Guide](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- **Node.js**: Version 20.x LTS
- **Git**: For repository management

### Verify Installation

```bash
# Check Azure CLI
az --version

# Check Node.js
node --version

# Login to Azure
az login
```

---

## Quick Start

### Option 1: One-Command Deployment

```bash
# Build the app locally
npm install
npm run build

# Deploy to Azure (creates all resources automatically)
az webapp up \
  --name cricket-auction-app \
  --resource-group cricket-auction-rg \
  --runtime "NODE:20-lts" \
  --os-type Linux \
  --sku B1 \
  --location eastus
```

This creates:
- ✅ Resource Group
- ✅ App Service Plan
- ✅ App Service
- ✅ Deploys your app

**Your app will be live at**: `https://cricket-auction-app.azurewebsites.net`

---

## Deployment Methods

### Method 1: Azure CLI (Recommended)

#### Step 1: Create Resources

```bash
# Set variables
RESOURCE_GROUP="cricket-auction-rg"
APP_NAME="cricket-auction-app"  # Must be globally unique
LOCATION="eastus"

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create App Service plan (B1 = Basic, ~$13/month)
az appservice plan create \
  --name ${APP_NAME}-plan \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B1

# Create web app
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan ${APP_NAME}-plan \
  --runtime "NODE:20-lts"
```

#### Step 2: Configure App Settings

```bash
# Set Node environment
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV=production \
    WEBSITE_NODE_DEFAULT_VERSION=20-lts

# Enable detailed logging
az webapp log config \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true
```

#### Step 3: Build and Deploy

```bash
# Build locally
npm install
npm run build

# Create deployment package
zip -r deployment.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "client/node_modules/*" \
  -x "*.log"

# Deploy
az webapp deploy \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --src-path deployment.zip \
  --type zip \
  --async true
```

#### Step 4: Set Startup Command

```bash
# For Linux App Service
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "node dist/index.js"
```

---

### Method 2: GitHub Actions (CI/CD)

#### Step 1: Download Publish Profile

```bash
# Download from Azure Portal or CLI
az webapp deployment list-publishing-profiles \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --xml > publish-profile.xml
```

#### Step 2: Add to GitHub Secrets

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Value: Paste contents of `publish-profile.xml`

#### Step 3: Create Workflow File

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: cricket-auction-app
  NODE_VERSION: '20.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: |
        npm run build:client
        npm run build:server
    
    - name: Copy static files
      run: |
        mkdir -p dist/public/assets
        cp -r client/public/* dist/public/ || true
        cp -r attached_assets/* dist/public/assets/ || true
        cp config.json dist/ || true
        cp players.xlsx dist/ || true
    
    - name: Install production dependencies only
      run: |
        rm -rf node_modules
        npm ci --production
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v3
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

#### Step 4: Push to GitHub

```bash
git add .github/workflows/azure-deploy.yml
git commit -m "Add Azure deployment workflow"
git push origin main
```

Now every push to `main` automatically deploys to Azure! 🚀

---

### Method 3: VS Code Extension

1. **Install Extension**: [Azure App Service for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice)

2. **Sign in to Azure**:
   - Click Azure icon in sidebar
   - Click "Sign in to Azure"

3. **Deploy**:
   - Build app: `npm run build`
   - Right-click project folder
   - Select "Deploy to Web App"
   - Choose or create App Service
   - Confirm deployment

---

## Custom Domain Setup

### Step 1: Verify Domain Ownership

```bash
# Get verification ID
VERIFICATION_ID=$(az webapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query customDomainVerificationId \
  --output tsv)

echo "Verification ID: $VERIFICATION_ID"
```

### Step 2: Add DNS Records

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

#### For Root Domain (example.com):

| Type | Name | Value |
|------|------|-------|
| A | @ | Your App Service IP* |
| TXT | asuid | `{VERIFICATION_ID}` |

*Get IP address:
```bash
az webapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostName \
  --output tsv
```

Then look up the IP with:
```bash
nslookup cricket-auction-app.azurewebsites.net
```

#### For Subdomain (www.example.com or auction.example.com):

| Type | Name | Value |
|------|------|-------|
| CNAME | www (or auction) | `cricket-auction-app.azurewebsites.net` |
| TXT | asuid.www (or asuid.auction) | `{VERIFICATION_ID}` |

### Step 3: Add Custom Domain to Azure

```bash
# For subdomain (recommended)
az webapp config hostname add \
  --webapp-name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --hostname www.yourdomain.com

# For root domain
az webapp config hostname add \
  --webapp-name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --hostname yourdomain.com
```

### Step 4: Enable HTTPS (Free SSL)

```bash
# Bind SSL certificate (Azure manages it for free)
az webapp config ssl bind \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --certificate-thumbprint auto \
  --ssl-type SNI

# Enforce HTTPS only
az webapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --https-only true
```

**Wait 5-10 minutes for SSL certificate to provision.**

Your app is now live at: `https://www.yourdomain.com` 🎉

---

## Environment Configuration

### Application Settings (Environment Variables)

```bash
# Add any environment variables your app needs
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    LOG_LEVEL=info
```

### Upload Configuration Files

If you have `config.json` or `players.xlsx`:

```bash
# Via FTP/FTPS (get credentials from Azure Portal)
# Or include in deployment package as shown in GitHub Actions
```

### Enable Always On (Prevents app from sleeping)

```bash
# Only available on Basic tier and above
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --always-on true
```

---

## Monitoring & Logs

### View Live Logs

```bash
# Stream logs in real-time
az webapp log tail \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP
```

### Download Logs

```bash
# Download all logs
az webapp log download \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --log-file logs.zip
```

### Azure Portal Monitoring

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your App Service
3. Click "Monitoring" → "Logs"
4. View application logs, HTTP logs, and metrics

---

## Troubleshooting

### Issue: "Application Error" or 503

**Cause**: App not starting correctly

**Solution**:
```bash
# Check logs
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP

# Verify startup command
az webapp config show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query linuxFxVersion
```

Make sure startup command is: `node dist/index.js`

---

### Issue: Static files (images, CSS) not loading

**Cause**: Files not copied during build

**Solution**:
Check that deployment script copies:
- `client/public/*` → `dist/public/`
- `attached_assets/*` → `dist/public/assets/`

---

### Issue: Custom domain not working

**Cause**: DNS not propagated or verification failed

**Solution**:
```bash
# Check DNS propagation (wait up to 48 hours)
nslookup www.yourdomain.com

# Verify TXT record
nslookup -type=TXT asuid.www.yourdomain.com
```

---

### Issue: App runs on Replit but not Azure

**Cause**: Environment differences

**Checklist**:
- ✅ Use `process.env.PORT` (Azure assigns dynamic ports)
- ✅ Build app before deploying (don't rely on Azure to build)
- ✅ Include all static assets in dist folder
- ✅ Set `NODE_ENV=production`

---

## Performance Optimization

### Enable Compression

Already configured in `web.config` for Windows deployments.

For Linux:
```bash
# Compression is enabled by default on Linux App Service
```

### Enable CDN (Optional)

For static assets:
1. Create Azure CDN
2. Point to your App Service
3. Update asset URLs to use CDN

---

## Cost Breakdown

| Tier | Monthly Cost | Features |
|------|--------------|----------|
| **F1 (Free)** | $0 | 60 min/day runtime, no custom domain, no Always On |
| **B1 (Basic)** | ~$13 | 24/7 uptime, custom domain, SSL, 1.75 GB RAM |
| **S1 (Standard)** | ~$70 | Auto-scaling, staging slots, backups |
| **P1V2 (Premium)** | ~$96 | Better performance, 3.5 GB RAM |

**Recommendation**: Start with B1 for production.

---

## Useful Commands Cheat Sheet

```bash
# Restart app
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP

# Stop app
az webapp stop --name $APP_NAME --resource-group $RESOURCE_GROUP

# Start app
az webapp start --name $APP_NAME --resource-group $RESOURCE_GROUP

# Scale up (change tier)
az appservice plan update \
  --name ${APP_NAME}-plan \
  --resource-group $RESOURCE_GROUP \
  --sku S1

# Delete everything
az group delete --name $RESOURCE_GROUP --yes
```

---

## Next Steps

1. ✅ Deploy app to Azure
2. ✅ Add custom domain
3. ✅ Enable HTTPS
4. ✅ Set up CI/CD with GitHub Actions
5. ✅ Configure monitoring
6. 🔄 Set up database (if needed in future)
7. 🔄 Configure backups

---

## Support Resources

- [Azure App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Node.js on Azure Guide](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Custom Domain Setup](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain)
- [SSL Certificate Setup](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate)

---

## Questions?

Need help with deployment? Check the troubleshooting section or Azure documentation links above.

Good luck with your deployment! 🚀🏏
