# TLPL S4 Auction System Documentation

Welcome to the TLPL Season 4 auction system documentation. This folder contains all the guides and documentation for the application.

## 📚 Documentation Files

### Configuration & Setup
- **[replit.md](./replit.md)** - Main project documentation with architecture, recent changes, and system overview
- **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** - Complete configuration guide for teams, grades, quotas, and pricing
- **[HOW_TO_CONFIGURE_AUCTION.txt](./HOW_TO_CONFIGURE_AUCTION.txt)** - Quick reference for auction configuration

### Player Management
- **[PLAYER_STATS_GUIDE.md](./PLAYER_STATS_GUIDE.md)** - Guide for adding player statistics from Excel or CricHeroes
- **[EXCEL_COLUMN_CONFIG.md](./EXCEL_COLUMN_CONFIG.md)** - Excel column mapping configuration

### Design & Development
- **[design_guidelines.md](./design_guidelines.md)** - UI/UX design guidelines and patterns

## 🎯 Quick Start

1. Read [replit.md](./replit.md) for project overview and recent changes
2. Follow [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) to set up teams and auction rules
3. Use [PLAYER_STATS_GUIDE.md](./PLAYER_STATS_GUIDE.md) to add player data

## 🔧 Changing the League Name

To change "TLPL S4" to your league name:

**File:** `client/src/lib/leagueConfig.ts`

```typescript
export const LEAGUE_CONFIG = {
  name: "YOUR LEAGUE NAME",     // Short name shown in header
  fullName: "Your League Full Name",  // Full name for future use
};
```

This will automatically update:
- Login page title
- Navigation bar header
- All pages throughout the application

## 📝 Notes

- All markdown files use standard Markdown syntax
- Configuration files are in JSON or TypeScript format
- Keep this README updated when adding new documentation
