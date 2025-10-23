# Azure Deployment Checklist ✅

Follow this checklist to ensure a smooth deployment to Azure.

## Pre-Deployment Checklist

### 1. Update package.json ✏️
- [ ] Add new build scripts (see `PACKAGE_JSON_UPDATES.md`)
- [ ] Test build locally: `npm run build`
- [ ] Verify `dist/` folder contains:
  - `dist/index.js` (server)
  - `dist/public/` (frontend files)
  - `dist/public/assets/` (images, team logos)
  - `dist/config.json`
  - `dist/players.xlsx`

### 2. Prepare Configuration Files 📁
- [ ] Verify `config.json` exists with team logos configured
- [ ] Verify `players.xlsx` exists with player data
- [ ] Check `web.config` is in root directory (for Windows Azure)
- [ ] Check `.deployment` is in root directory
- [ ] Check `deploy.sh` is in root directory and is executable

### 3. Test Locally 🧪
```bash
# Install dependencies
npm install

# Build the app
npm run build

# Test production build locally
npm start

# Visit http://localhost:5000
# Test login with admin/owner/viewer accounts
# Verify all features work
```

### 4. Prepare Azure Account 🔑
- [ ] Create Azure account: https://azure.microsoft.com/free/
- [ ] Install Azure CLI: https://learn.microsoft.com/cli/azure/install-azure-cli
- [ ] Login: `az login`
- [ ] Verify: `az account show`

### 5. Choose Deployment Method 🚀

Pick ONE method:

#### Option A: Quick Deploy (Easiest)
```bash
npm run build
az webapp up --name your-app-name --runtime "NODE:20-lts" --sku B1
```

#### Option B: GitHub Actions (Best for Teams)
- [ ] Push code to GitHub
- [ ] Download publish profile from Azure
- [ ] Add to GitHub Secrets as `AZURE_WEBAPP_PUBLISH_PROFILE`
- [ ] Create `.github/workflows/azure-deploy.yml`
- [ ] Push to main branch → auto-deploy

#### Option C: Azure CLI (Most Control)
- [ ] Follow Step-by-Step in `AZURE_DEPLOYMENT.md`

## Post-Deployment Checklist

### 1. Verify Deployment ✅
- [ ] App is accessible at `https://your-app.azurewebsites.net`
- [ ] Login page appears
- [ ] Can login as admin (username: admin, password: admin123)
- [ ] Can start auction
- [ ] Can bid on players
- [ ] Team logos display correctly
- [ ] Player images display correctly

### 2. Check Logs 📋
```bash
# Stream logs
az webapp log tail --name your-app-name --resource-group your-rg

# Look for errors
# Verify "serving on port XXXX" message appears
```

### 3. Configure Custom Domain (Optional) 🌐

#### Step 1: Get Verification ID
```bash
az webapp show \
  --name your-app-name \
  --resource-group your-rg \
  --query customDomainVerificationId \
  --output tsv
```

#### Step 2: Add DNS Records at Your Domain Registrar

For subdomain (e.g., `auction.yourdomain.com`):
- [ ] CNAME record: `auction` → `your-app.azurewebsites.net`
- [ ] TXT record: `asuid.auction` → `{verification-id}`

#### Step 3: Add Domain to Azure
```bash
az webapp config hostname add \
  --webapp-name your-app-name \
  --resource-group your-rg \
  --hostname auction.yourdomain.com
```

#### Step 4: Enable HTTPS
```bash
az webapp config ssl bind \
  --name your-app-name \
  --resource-group your-rg \
  --certificate-thumbprint auto \
  --ssl-type SNI

az webapp update \
  --name your-app-name \
  --resource-group your-rg \
  --https-only true
```

- [ ] Wait 5-10 minutes for SSL certificate
- [ ] Visit `https://auction.yourdomain.com`
- [ ] Verify SSL padlock appears in browser

### 4. Performance Optimization ⚡
```bash
# Enable Always On (keeps app warm, no cold starts)
az webapp config set \
  --name your-app-name \
  --resource-group your-rg \
  --always-on true

# Verify compression enabled (in web.config)
# Verify caching headers
```

### 5. Monitoring Setup 📊
- [ ] Enable Application Insights (optional)
- [ ] Set up alerts for errors
- [ ] Monitor resource usage in Azure Portal

### 6. Security Hardening 🔒
```bash
# Enforce HTTPS
az webapp update \
  --name your-app-name \
  --resource-group your-rg \
  --https-only true

# Disable FTP (use FTPS only)
az webapp config set \
  --name your-app-name \
  --resource-group your-rg \
  --ftps-state FtpsOnly
```

- [ ] Change default admin password in production
- [ ] Review CORS settings if needed
- [ ] Set up IP restrictions if needed

### 7. Backup Strategy 💾
```bash
# Create backup (Standard tier and above)
az webapp config backup create \
  --resource-group your-rg \
  --webapp-name your-app-name \
  --backup-name initial-backup \
  --container-url "https://yourstorage.blob.core.windows.net/backups?{SAS-token}"
```

## Common Issues & Solutions

### Issue: "Application Error"
**Solution**: Check logs with `az webapp log tail`
- Verify startup command: `node dist/index.js`
- Ensure `dist/index.js` exists
- Check environment variables

### Issue: Images not loading
**Solution**: 
- Verify files copied to `dist/public/assets/`
- Check file paths in `config.json`
- View browser console for 404 errors

### Issue: "Cannot find module"
**Solution**:
- Install production dependencies
- Check `package.json` has all dependencies (not devDependencies)

### Issue: Domain not working
**Solution**:
- Wait 24-48 hours for DNS propagation
- Verify DNS with: `nslookup auction.yourdomain.com`
- Check TXT record exists

## Quick Commands Reference

```bash
# View app status
az webapp show --name your-app --resource-group your-rg

# Restart app
az webapp restart --name your-app --resource-group your-rg

# View logs
az webapp log tail --name your-app --resource-group your-rg

# Update app settings
az webapp config appsettings set --name your-app --resource-group your-rg --settings KEY=VALUE

# Scale up/down
az appservice plan update --name your-plan --resource-group your-rg --sku S1

# Delete everything (careful!)
az group delete --name your-rg --yes
```

## Cost Optimization 💰

### Free Tier (F1) - $0/month
- ✅ Good for: Testing, demos
- ❌ Limitations: 60 min/day, no custom domain, sleeps after inactivity

### Basic Tier (B1) - ~$13/month ⭐ RECOMMENDED
- ✅ Good for: Production use, small teams
- ✅ Features: 24/7 uptime, custom domain, SSL, 1.75 GB RAM

### Standard Tier (S1) - ~$70/month
- ✅ Good for: High traffic, auto-scaling needed
- ✅ Features: Auto-scale, staging slots, backups

## Support & Resources

- 📖 Full Guide: `AZURE_DEPLOYMENT.md`
- 🔧 Azure CLI Docs: https://learn.microsoft.com/cli/azure/
- 🌐 Custom Domain Guide: https://learn.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain
- 🔒 SSL Certificate: https://learn.microsoft.com/azure/app-service/configure-ssl-certificate

---

## Ready to Deploy? 🚀

1. ✅ Complete Pre-Deployment Checklist
2. 🚀 Choose deployment method and deploy
3. ✅ Complete Post-Deployment Checklist
4. 🎉 Your Cricket Auction is live!

**Questions?** Check `AZURE_DEPLOYMENT.md` for detailed troubleshooting.

Good luck with your deployment! 🏏
