# 📚 Cricket Auction Documentation

Welcome to the complete documentation for the Cricket Player Auction platform!

---

## 🚀 **Getting Started**

New to the system? Start here:

1. **[START_HERE.md](./START_HERE.md)** - Quick overview and first steps
2. **[HOW_TO_CONFIGURE_AUCTION.txt](./HOW_TO_CONFIGURE_AUCTION.txt)** - Basic auction setup
3. **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** - Detailed configuration options

---

## 📖 **Documentation Index**

### **Setup & Configuration**
- **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** - Complete config.json reference
- **[HOW_TO_CONFIGURE_AUCTION.txt](./HOW_TO_CONFIGURE_AUCTION.txt)** - Step-by-step auction setup
- **[HOW_TO_CHANGE_LEAGUE_NAME.md](./HOW_TO_CHANGE_LEAGUE_NAME.md)** - Customize league branding

### **Player Management**
- **[EXCEL_COLUMN_CONFIG.md](./EXCEL_COLUMN_CONFIG.md)** - Excel file format and column mapping
- **[PLAYER_STATS_GUIDE.md](./PLAYER_STATS_GUIDE.md)** - Player statistics and data fields

### **Advanced Features**
- **[GRADE_MAX_BID_CAPS_GUIDE.md](./GRADE_MAX_BID_CAPS_GUIDE.md)** - Set maximum bid limits per grade
- **[UNSOLD_PLAYER_STRATEGIES.md](./UNSOLD_PLAYER_STRATEGIES.md)** - Two modes for handling unsold players
- **[QUICK_SWITCH_GUIDE.txt](./QUICK_SWITCH_GUIDE.txt)** - Quick reference for switching unsold strategies

### **Deployment**
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to Railway or Fly.io

### **Design & Development**
- **[design_guidelines.md](./design_guidelines.md)** - UI/UX design principles and component usage

---

## 🎯 **Quick Links**

### **Common Tasks**

| Task | Documentation |
|------|--------------|
| Set up teams and purses | [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) |
| Import players from Excel | [EXCEL_COLUMN_CONFIG.md](./EXCEL_COLUMN_CONFIG.md) |
| Change league name/logo | [HOW_TO_CHANGE_LEAGUE_NAME.md](./HOW_TO_CHANGE_LEAGUE_NAME.md) |
| Configure grade quotas | [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) |
| Set max bid limits | [GRADE_MAX_BID_CAPS_GUIDE.md](./GRADE_MAX_BID_CAPS_GUIDE.md) |
| Handle unsold players | [UNSOLD_PLAYER_STRATEGIES.md](./UNSOLD_PLAYER_STRATEGIES.md) |
| Deploy the app | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |

---

## 📋 **Feature Documentation**

### **Unsold Player System**
The platform supports **two different strategies** for handling unsold players:

1. **Grade-Based Re-Auction** (for sorted Excel files)
   - Unsold Grade A players come back after all Grade A players
   - Like real IPL auction flow
   
2. **All Unsold at End** (for random Excel files)
   - All unsold players come together at the end
   - Works with any Excel file order

📖 **Read more**: [UNSOLD_PLAYER_STRATEGIES.md](./UNSOLD_PLAYER_STRATEGIES.md) | [QUICK_SWITCH_GUIDE.txt](./QUICK_SWITCH_GUIDE.txt)

### **Grade Max Bid Caps**
Optional feature to set maximum bid limits per grade:
- Grade A max: ₹15M
- Grade B max: ₹10M  
- Grade C max: ₹5M

📖 **Read more**: [GRADE_MAX_BID_CAPS_GUIDE.md](./GRADE_MAX_BID_CAPS_GUIDE.md)

### **Excel Report Export**
Admin can download auction results as Excel file with:
- Player Name
- Phone Number
- Team
- Grade
- Sold Price

📖 **Read more**: [EXCEL_COLUMN_CONFIG.md](./EXCEL_COLUMN_CONFIG.md)

---

## 🎨 **UI/UX Guidelines**

For developers working on the frontend:

📖 **Read**: [design_guidelines.md](./design_guidelines.md)

Covers:
- Component usage (shadcn/ui)
- Color system and theming
- Responsive design patterns
- Dark mode implementation

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

## 🆘 **Need Help?**

### **Documentation Issues**
- Check if you're reading the latest version
- Look for related guides in this folder
- Search for keywords in the docs

### **Technical Issues**
- Check browser console (F12) for errors
- Verify configuration files are correct
- Ensure Excel file format matches documentation

### **Feature Requests**
- Review existing documentation first
- Check if feature exists but needs configuration
- Consider if it aligns with project goals

---

## 📊 **System Requirements**

### **Development**
- Node.js 18+
- npm or yarn
- Modern web browser

### **Production**
- Railway or Fly.io account
- Custom domain (optional)
- SSL certificate (provided by platforms)

---

## 🎓 **Learning Path**

**New Users:**
1. Read START_HERE.md
2. Configure teams in config.json
3. Import players from Excel
4. Test auction flow locally

**Advanced Users:**
1. Configure grade max bid caps
2. Choose unsold player strategy
3. Customize league branding
4. Deploy to production

**Developers:**
1. Read design_guidelines.md
2. Understand state management (replit.md)
3. Review component architecture
4. Follow TypeScript patterns

---

## 📅 **Version History**

See **[replit.md](../replit.md)** in the root folder for:
- Recent updates
- System architecture
- Technical specifications
- Development notes

---

## 🎉 **Ready to Go!**

You now have access to all the documentation you need to run a successful cricket player auction!

Pick a guide from above and get started. 🏏

---

*Last Updated: October 2025*
