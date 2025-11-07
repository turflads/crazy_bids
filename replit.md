# Cricket Player Auction - Real-Time Bidding Platform

## Overview

This project is a comprehensive web application designed for conducting live cricket player auctions. It features real-time bidding, robust team and player management, and a grade-based player acquisition system. The platform supports multiple user roles (Super Admin, Admin, Owner, Viewer) with distinct functionalities, including grade quotas, purse tracking, and dynamic auction controls. Key capabilities include immersive audio experiences, dual strategies for handling unsold players, Excel-style max bid formula, and comprehensive league branding customization. The application supports various player data inputs, including Google Drive images, and offers extensive customization for league branding and auction rules. Deployed on Railway with PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## Documentation

Comprehensive guides are available in the `docs/` directory:

- **[docs/README.md](docs/README.md)** - Complete documentation index
- **[docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md)** - User credentials, team logos, league branding
- **[docs/EXCEL_COLUMN_CONFIG.md](docs/EXCEL_COLUMN_CONFIG.md)** - Excel column configuration
- **[docs/PLAYER_STATS_GUIDE.md](docs/PLAYER_STATS_GUIDE.md)** - Player statistics setup
- **[docs/UNSOLD_PLAYER_STRATEGIES.md](docs/UNSOLD_PLAYER_STRATEGIES.md)** - Re-auction strategies
- **[docs/GRADE_MAX_BID_CAPS_GUIDE.md](docs/GRADE_MAX_BID_CAPS_GUIDE.md)** - Excel-style max bid formula and per-grade bid caps
- **[docs/REACTIVE_TEAM_STATE_FIX.md](docs/REACTIVE_TEAM_STATE_FIX.md)** - Nov 2024 critical bug fix details
- **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Railway and Fly.io deployment guide

## System Architecture

### Frontend Architecture

The frontend is built with **React 18** and **TypeScript**, utilizing **Vite** for fast development and optimized builds. **Wouter** handles client-side routing. The design system leverages **shadcn/ui** (New York style) with **Radix UI** primitives, styled using **Tailwind CSS** with custom design tokens for a consistent and accessible user experience. State management primarily uses **localStorage** for persistence across sessions and tabs, with custom hooks for cross-tab synchronization. **TanStack Query** is configured for future API integration. The application features role-based dashboards (Super Admin, Admin, Owner, Viewer), a reorganized Admin layout for improved usability, a comprehensive bidding interface with validation, and an Excel import system for player data supporting Google Drive image links. It also includes an audio manager for in-auction sound effects, celebration animations for sold players, a presentation system for auction breaks, and configurable sponsor branding. Player images are displayed using `object-contain` to show the complete image without cropping.

### Backend Architecture

The backend utilizes **Express.js** with **TypeScript**, serving API endpoints and static files. **Vite SSR middleware** is used during development. Data persistence is handled by **PostgreSQL** using **Drizzle ORM**. **WebSocket** (via `ws` library) provides real-time synchronization across all connected clients. **esbuild** is used for fast server bundling with Node.js 18 compatibility polyfills.

### Data Model

The core data models include:
- **Player Schema** (firstName, lastName, grade, basePrice, status, optional statistics, flexible image handling for local and Google Drive links)
- **Team Schema** (name, flag, logo, totalPurse, dynamic calculations for usedPurse, purseRemaining, playersCount, gradeCount, and max bid)
- **Auction State** (currentPlayerIndex, currentBid, bidHistory, status flags)

Configuration is managed via:
- `client/public/config.json` - Auction rules (grade base prices, increments, teams, quotas, grade-specific max bid caps)
- `client/src/config/leagueConfig.ts` - League branding (name, logo, sponsor, developer credit)

### Business Logic

#### Bidding Validation System
Four-tier validation:
1. Grade quota fulfillment check
2. Purse sufficiency check
3. Max bid calculation using Excel-style formula
4. Grade-specific max bid cap enforcement (optional)

#### Max Bid Calculation (Excel-Style Formula)
**Formula:** `Max Bid = MIN(Total Purse - Sum of all unsold players' base prices, Grade Max Bid Cap)`

**Location:** `client/src/lib/maxBidCalculator.ts`

This formula ensures:
- Teams always reserve enough money to buy all remaining players at base price
- Teams cannot exceed grade-specific spending limits
- Real-time calculation as players are sold

**Example:**
- Team total purse: ₹10 crores
- Sum of unsold players' base prices: ₹3 crores
- Grade A max cap: ₹80 lakhs
- **Result:** MIN(10cr - 3cr, 80L) = ₹80 lakhs

#### Grade Quota Management
Configurable quotas per grade with real-time progress tracking using reactive team state management.

#### Auction Flow
Admin-controlled auction supporting:
- Start/pause/reset operations
- Unsold player handling (two strategies)
- Celebration popups for sold players
- **Skip-Sold-Players Feature** - Automatically skips pre-sold players
- **Auto-completion** - Detects when no unsold players remain

#### Excel Import System
- Configurable column mapping (`client/src/lib/playerLoader.ts` lines 15-30)
- Automatic image path resolution
- **Grade trimming** - Removes leading/trailing spaces from grades
- **Smart Player Randomization** - Intelligently randomizes based on Excel organization

#### Player Image Display
- **Full image mode** using `object-contain` CSS property
- Shows complete player image without cropping
- Supports Google Drive links and local paths
- Image source: `client/src/components/PlayerCard.tsx` line 57

#### League Branding
**Configuration file:** `client/src/config/leagueConfig.ts`

Customizable elements:
- League name
- League logo
- Sponsor name and logo
- Developer credit

**Display location:** `client/src/components/NavBar.tsx`
- Left: League logo + LIVE indicator
- Center: League name + Developer credit (stacked)
- Right: Sponsor + User menu

#### PowerPoint Presentation System
Enables admins to upload and display presentations during auction breaks using Office Online viewer integration.

### Authentication & Authorization

Simple **Credentials System** with hardcoded username/password pairs for four roles:
- **Super Admin** (superadmin/superadmin123): Full editing rights
- **Admin** (admin/admin123): Full auction control
- **Owner** (owner/owner123): View-only team/player access
- **Viewer** (viewer/viewer123): Public dashboard access

**Location:** `client/src/pages/Login.tsx`

Session persistence is managed via localStorage.

### Cross-Device & Cross-Tab Synchronization

Real-time updates and consistent auction state achieved through:

- **WebSocket Real-Time Sync**: Server broadcasts all auction/team state changes to all connected clients. The `WebSocketProvider` listens for incoming `auction_update` and `team_update` messages and immediately updates localStorage, ensuring all devices stay synchronized with the database.

- **Database Persistence**: PostgreSQL (via Drizzle ORM) provides single source of truth. All state changes are saved to database tables:
  - `auction_state` (singleton): Current player, bids, auction status
  - `team_state` (singleton): Teams, purses, players, grade counts

- **Storage Events**: For same-origin tab communication within the same device.

- **Critical Fix (Nov 2024)**: Added WebSocket message listener in `WebSocketProvider` that processes incoming server updates and immediately writes them to localStorage, fixing the multi-device synchronization issue.

- **Reactive Team State (Nov 2024)**: Implemented `useTeamState` hook with React Context to provide reactive team state management. This replaced stale localStorage reads with real-time updates, fixing critical bugs where grade quotas weren't enforced and bid validation used outdated team data. The hook subscribes to both WebSocket messages and localStorage events, ensuring UI updates immediately when players are purchased.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **class-variance-authority**: Type-safe component variant management

### Data Processing
- **XLSX (SheetJS)**: Excel file parsing
- **date-fns**: Date formatting
- **Zod**: Runtime validation (via drizzle-zod)

### Database (Active - PostgreSQL)
- **Drizzle ORM**: PostgreSQL schema and queries
- **@neondatabase/serverless**: Neon serverless Postgres driver
- **Database Tables**: 
  - `auction_state` (singleton): Current player, bids, auction status
  - `team_state` (singleton): Teams, purses, players, grade counts
- **Deployment**: Database migration runs automatically via `npm run db:push` in build phase

### Real-Time Communication
- **ws**: WebSocket library for server-side real-time updates
- **WebSocket Provider**: Client-side WebSocket connection management

### Development Tools
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error overlay
- **@replit/vite-plugin-cartographer**: Code navigation
- **@replit/vite-plugin-dev-banner**: Development environment indicator

### Build & Deployment
- **esbuild**: Server bundling with custom `build.js` script that includes Node.js 18 compatibility polyfill for `import.meta.dirname`
- **Vite**: Client bundling and asset optimization
- **PostCSS** with **Autoprefixer**: CSS processing
- **Railway Deployment**: Configured via `railway.json` with automatic database migration. Node.js 18 compatibility ensured through esbuild banner injection.

### Form Management
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Zod integration for form validation

### Asset Management
- Team logos in `client/public/images/`
- Player photos in `attached_assets/`
- Configuration (`config.json`) in `client/public/`
- League branding (`leagueConfig.ts`) in `client/src/config/`

## Recent Changes (November 2024)

### Player Image Display
- Updated to show complete player image using `object-contain`
- No cropping - entire player visible from head to toe
- **File:** `client/src/components/PlayerCard.tsx` line 57

### Max Bid Formula Simplification
- Replaced complex quota-based calculation with Excel-style formula
- **New formula:** `MIN(Total Purse - Sum of unsold base prices, Grade Cap)`
- Real-time calculation as auction progresses
- **File:** `client/src/lib/maxBidCalculator.ts`

### Grade Max Bid Caps
- Added `gradeMaxBidCaps` to `config.json`
- Example caps: Grade A (₹80L), Grade B (₹60L), B+ (₹40L), 40+A (₹30L)
- Enforced via MIN function in max bid formula
- **Config:** `client/public/config.json` lines 86-91

### League Branding
- Centralized configuration in `leagueConfig.ts`
- Navbar layout: Logo (left), League Name + Developer Credit (center), Sponsor + User (right)
- **Files:**
  - `client/src/config/leagueConfig.ts` - Configuration
  - `client/src/components/NavBar.tsx` - Display

### Bug Fixes
- **Grade trimming** - Fixed leading space bug causing grade lookup failures
  - **File:** `client/src/lib/playerLoader.ts` lines 130-133
- **Reactive team state** - Owner and Viewer pages now use `useTeamState` for real-time updates
  - **Files:** `client/src/pages/Owner.tsx`, `client/src/pages/Viewer.tsx`

## Technical Notes

### Key Files
- **Max Bid Calculator:** `client/src/lib/maxBidCalculator.ts`
- **Player Loader:** `client/src/lib/playerLoader.ts`
- **Team State Hook:** `client/src/hooks/useTeamState.tsx`
- **WebSocket Provider:** `client/src/contexts/WebSocketProvider.tsx`
- **Auction Config:** `client/src/lib/auctionConfig.ts`
- **League Config:** `client/src/config/leagueConfig.ts`

### Database Schema
- **Server:** `server/db/schema.ts`
- **Migrations:** Automatic via `npm run db:push`

### Deployment
- **Platform:** Railway
- **Database:** PostgreSQL (Neon serverless driver)
- **Build:** Automatic via `railway.json`
- **Migration:** Runs during build phase

## Configuration Files

### config.json Structure
```json
{
  "gradeBasePrices": { ... },
  "gradeIncrements": { ... },
  "teams": [ ... ],
  "gradeQuotas": { ... },
  "gradeMaxBidCaps": { ... }  // Optional
}
```

### leagueConfig.ts Structure
```typescript
export const LEAGUE_NAME = "Your League Name";
export const LEAGUE_LOGO = "/path/to/logo.png";
export const SPONSOR_NAME = "Sponsor Name";
export const SPONSOR_LOGO = "/path/to/sponsor.png";
export const DEVELOPER_NAME = "Developer Name";
```

---

*Last Updated: November 7, 2024*  
*Platform Version: 2.1 (Excel-Style Max Bid + Full Image Display)*  
*Deployment: Railway + PostgreSQL*
