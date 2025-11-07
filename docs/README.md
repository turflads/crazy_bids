# 📚 Cricket Auction Documentation

Welcome to the complete documentation for the Cricket Player Auction platform!

---

## 🚀 **Getting Started**

New to the system? Start here:

1. **Login** - Use default credentials to access different roles
2. **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** - Set up teams, purses, and grade quotas
3. **[EXCEL_COLUMN_CONFIG.md](./EXCEL_COLUMN_CONFIG.md)** - Import players from Excel
4. **Start the auction** - Use Admin dashboard to begin bidding

---

## 📖 **Documentation Index**

### **Setup & Configuration**
- **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** - Complete config.json reference
  - Team setup and purses
  - Grade quotas configuration
  - Bid increments and base prices
  - League branding (logo, name, sponsor)

### **Player Management**
- **[EXCEL_COLUMN_CONFIG.md](./EXCEL_COLUMN_CONFIG.md)** - Excel file format and column mapping
  - Required columns
  - Google Drive image support
  - Player randomization
- **[PLAYER_STATS_GUIDE.md](./PLAYER_STATS_GUIDE.md)** - Player statistics and data fields

### **Advanced Features**
- **[GRADE_MAX_BID_CAPS_GUIDE.md](./GRADE_MAX_BID_CAPS_GUIDE.md)** - Set maximum bid limits per grade
  - Excel-style formula: MIN(purse - sum of unsold, grade cap)
  - Real-time max bid calculation
- **[UNSOLD_PLAYER_STRATEGIES.md](./UNSOLD_PLAYER_STRATEGIES.md)** - Two modes for handling unsold players
  - Grade-based re-auction
  - All unsold at end

### **Technical Documentation**
- **[REACTIVE_TEAM_STATE_FIX.md](./REACTIVE_TEAM_STATE_FIX.md)** - Nov 2024 critical bug fix
  - Grade quota enforcement
  - Real-time state synchronization

### **Deployment**
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to Railway or Fly.io
  - PostgreSQL database setup
  - Environment configuration
  - Production deployment

---

## 🎯 **Quick Reference**

### **Common Tasks**

| Task | Documentation |
|------|--------------|
| Set up teams and purses | [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) |
| Import players from Excel | [EXCEL_COLUMN_CONFIG.md](./EXCEL_COLUMN_CONFIG.md) |
| Configure league branding | [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) - Edit `client/src/config/leagueConfig.ts` |
| Configure grade quotas | [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) |
| Set max bid limits | [GRADE_MAX_BID_CAPS_GUIDE.md](./GRADE_MAX_BID_CAPS_GUIDE.md) |
| Handle unsold players | [UNSOLD_PLAYER_STRATEGIES.md](./UNSOLD_PLAYER_STRATEGIES.md) |
| Deploy the app | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |

---

## 📋 **Key Features**

### **Max Bid Formula (Excel-Style)**
```
Max Bid = MIN(
  Total Purse - Sum of all unsold players' base prices,
  Grade Max Bid Cap
)
```

This ensures teams:
- Always have enough money for remaining players
- Cannot exceed grade-specific spending limits
- Get real-time max bid calculations

📖 **Read more**: [GRADE_MAX_BID_CAPS_GUIDE.md](./GRADE_MAX_BID_CAPS_GUIDE.md)

### **Unsold Player Strategies**
Two different strategies for handling unsold players:

1. **Grade-Based Re-Auction** - Unsold players return after their grade group
2. **All Unsold at End** - All unsold players return together at the end

📖 **Read more**: [UNSOLD_PLAYER_STRATEGIES.md](./UNSOLD_PLAYER_STRATEGIES.md)

### **League Branding**
Customize your auction with:
- League name and logo
- Sponsor branding
- Developer credit
- Custom team logos

📖 **Configuration**: Edit `client/src/config/leagueConfig.ts`

### **Player Images**
- **Full image display** - Shows complete player image without cropping
- **Google Drive support** - Import images directly from Google Drive links
- **Local images** - Support for local image paths

---

## 🔐 **Default Login Credentials**

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `superadmin123` |
| Admin | `admin` | `admin123` |
| Owner | `owner` | `owner123` |
| Viewer | `viewer` | `viewer123` |

⚠️ **Change these before deploying to production!**

Edit: `client/src/pages/Login.tsx`

---

## 🎨 **UI Features**

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode Support** - Automatic theme switching
- **Real-time Updates** - WebSocket synchronization across all devices
- **Celebration Animations** - Player sold celebrations
- **Audio Feedback** - In-auction sound effects

---

## 📊 **System Requirements**

### **Development**
- Node.js 18+
- npm or yarn
- Modern web browser

### **Production**
- Railway or Fly.io account
- PostgreSQL database (provided by Railway/Fly.io)
- Custom domain (optional)

---

## 🎓 **Learning Path**

**New Users:**
1. Login with default credentials
2. Configure teams in `config.json`
3. Import players from Excel (Super Admin)
4. Test auction flow (Admin)

**Advanced Users:**
1. Configure grade max bid caps
2. Choose unsold player strategy
3. Customize league branding
4. Deploy to Railway

**Developers:**
1. Review system architecture in `replit.md`
2. Understand reactive state management
3. Review component patterns
4. Follow TypeScript conventions

---

## 📅 **Recent Updates - November 2024**

### ✅ Latest Changes

**Player Display:**
- Updated to show full player images using `object-contain`
- No cropping - entire player visible from head to toe

**Max Bid Formula:**
- Simplified to Excel-style formula
- Formula: `MIN(Total Purse - Sum of unsold base prices, Grade Cap)`
- Real-time calculation as players are sold

**League Branding:**
- Centralized configuration in `client/src/config/leagueConfig.ts`
- League name and developer credit displayed in navbar center
- Sponsor branding in navbar right

**Grade Management:**
- Fixed leading space bug in grade trimming
- Proper grade quota enforcement
- Real-time grade count updates

### 🔧 Critical Bug Fixes
- **Grade Quota Enforcement** - Fixed via reactive team state management
  - Teams can no longer exceed configured grade quotas
  - Grade counts update in real-time across all devices
  - Bid validation uses live data
  - 📖 **Details**: [REACTIVE_TEAM_STATE_FIX.md](./REACTIVE_TEAM_STATE_FIX.md)

---

## 🆘 **Need Help?**

### **Documentation Issues**
- Check if you're reading the latest version
- Look for related guides in this folder
- Search for keywords in the docs

### **Technical Issues**
- Check browser console (F12) for errors
- Verify configuration files are correct (use JSONLint.com)
- Ensure Excel file format matches documentation
- Hard refresh browser: Ctrl+Shift+R

### **Common Problems**

| Problem | Solution |
|---------|----------|
| Max bid seems wrong | Check [GRADE_MAX_BID_CAPS_GUIDE.md](./GRADE_MAX_BID_CAPS_GUIDE.md) - verify formula |
| Images not loading | Check Google Drive sharing settings |
| Grade quotas not working | Use reactive team state (already implemented) |
| Players not importing | Verify Excel column names in [EXCEL_COLUMN_CONFIG.md](./EXCEL_COLUMN_CONFIG.md) |

---

## 🎉 **Ready to Go!**

You now have access to all the documentation you need to run a successful cricket player auction!

Pick a guide from above and get started. 🏏

---

*Last Updated: November 7, 2024*  
*Platform Version: 2.1 (Excel-Style Max Bid Formula)*
