# Cricket Player Auction - Real-Time Bidding Platform

## Overview

A comprehensive web application for conducting live cricket player auctions with real-time bidding, team management, and grade-based player acquisition. The platform supports role-based access control (Super Admin, Admin, Owner, Viewer) and features grade quotas, purse tracking, celebration animations for sold players, backend-like editing capabilities for corrections, PowerPoint presentation integration for paused auctions, and league sponsor branding. Built with React (Vite), Express, and localStorage for state management.

## Recent Updates (Latest)

- **Admin Layout Complete Redesign**: Fixed scroll issues and simplified layout - removed sticky positioning entirely. New structure: Player card + team bidding buttons (horizontal row) on left, auction controls on right, team overview cards visible below. Team buttons now accessible without scrolling.
- **AuctionControls Reorganization**: Custom bid and action buttons (Cancel/Sold/Unsold) now positioned directly below Next Increment for logical grouping. Team bidding buttons moved to main dashboard below player card.
- **Current Bid Enhancement**: Added team logo and name display to current bid sections on Admin, Owner, and Viewer pages showing which team placed the last bid
- **Sponsor Branding**: Added configurable league sponsor name and logo in navbar via `leagueConfig.ts` (SPONSOR_NAME, SPONSOR_LOGO constants)
- Grade-specific max bid caps system (gradeMaxBidCaps in config.json) with comprehensive documentation
- PowerPoint presentation upload and display feature for auction breaks
- Owner page grade display shows "current/quota" format (e.g., "A: 0/3")

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router

**Design System**
- **shadcn/ui** component library (New York style) with Radix UI primitives for accessible, customizable components
- **Tailwind CSS** with custom design tokens for consistent spacing, colors, and typography
- Custom color system supporting light/dark modes with grade-specific colors (A=purple, B=blue, C=orange)
- **Inter** font for UI, **JetBrains Mono** for numeric data display

**State Management**
- **localStorage-based state persistence** for auction and team data (no backend database)
- Custom hooks (`useAuctionSync`) for cross-tab synchronization via storage events and polling
- Centralized state modules: `auctionState.ts` and `teamState.ts` for predictable state updates
- **TanStack Query (React Query)** for future API integration capabilities

**Key Components**
- **Role-based dashboards**: SuperAdminDashboard, AdminDashboard, OwnerDashboard, ViewerDashboard with distinct feature sets
- **Admin layout**: Player card and auction controls side-by-side, team overview in vertical rows for better organization
- **Current bid display**: Shows bid amount, team logo, and team name across all dashboards (Admin, Owner, Viewer)
- **Super Admin controls**: Full editing interface for correcting auction mistakes (team purses, player assignments, sold prices)
- **Real-time auction controls**: Bidding interface with grade-based increments and validation
- **Player management**: Excel import via XLSX library, configurable column mapping
- **Celebration system**: CSS animations and fireworks effect for sold players
- **Presentation system**: PowerPoint upload and display feature for admin during auction breaks (paused state)
- **Sponsor branding**: Configurable league sponsor name and logo in navbar

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript for API endpoints (currently minimal, designed for future expansion)
- **Vite SSR middleware** in development for seamless hot module replacement
- Static file serving for production builds from `dist/public`

**Storage Interface**
- Abstract `IStorage` interface with in-memory implementation (`MemStorage`)
- Designed for easy migration to PostgreSQL with Drizzle ORM (configuration ready)
- Current implementation uses localStorage on frontend for all auction data

**Build & Deployment**
- **esbuild** for fast server bundling with ESM output
- Production build outputs to `dist/` with separate client (`dist/public`) and server (`dist/index.js`) bundles
- Asset copying handled via npm scripts for config files, Excel data, and images

### Data Model

**Player Schema**
- Core fields: firstName, lastName, grade (A/B/C), basePrice, status (sold/unsold)
- Optional statistics: battingStyle, bowlingStyle, runs, wickets, strikeRate, bowlingAverage
- CricHeroes profile link support for external player data
- Image storage via photo filename references in `attached_assets/`

**Team Schema**
- Team metadata: name, flag emoji, logo image path, totalPurse
- Dynamic calculations: usedPurse, purseRemaining, playersCount, gradeCount
- Max bid calculator considering remaining grade quotas and purse constraints

**Auction State**
- Linear player progression with currentPlayerIndex
- Bid tracking: currentBid, lastBidTeam, bidHistory array
- Status flags: isAuctionActive, hasBids

**Configuration**
- JSON-based config (`config.json`) for grade base prices, increments, teams, quotas, and optional grade max bid caps
- Hot-reloadable without code changes for auction customization
- League branding config in `leagueConfig.ts` (LEAGUE_NAME, SPONSOR_NAME, SPONSOR_LOGO)

### Business Logic

**Bidding Validation System**
- Four-tier validation: grade quota fulfillment, purse sufficiency, grade-specific max bid caps (optional), smart max bid calculation
- Max bid formula: `min(gradeCap, remainingPurse - reserveForUnfilledQuotas)`
- Grade-specific caps configurable in config.json (e.g., Grade A max ₹15M, Grade B max ₹10M)
- Real-time feedback with descriptive error messages

**Grade Quota Management**
- Configurable quotas per grade (default: A=3, B=4, C=5)
- Progress tracking with visual indicators (completion badges)
- Quota enforcement prevents bidding when team quota is fulfilled

**Auction Flow**
- Admin-controlled start/pause/reset with navigation controls
- Unsold marking with optional re-entry into auction pool
- Celebration popup on successful sale with team logo display

**Excel Import System**
- Configurable column mapping in `playerLoader.ts`
- Support for multiple column name variations (e.g., "runs", "Runs", "runs_scored")
- Automatic base price assignment from grade configuration
- Image path resolution for player photos

**PowerPoint Presentation System**
- File upload via admin panel with multer backend handling
- Storage in `client/public/presentations/` directory for public access
- Presentation path persisted in localStorage for cross-session availability
- Conditional UI: "Open Presentation" button appears only when auction is paused
- Office Online viewer integration for seamless in-browser PPT display
- Support for .ppt, .pptx, and .ppsx formats (100MB file size limit)
- Automatic directory creation on server startup

### Authentication & Authorization

**Simple Credentials System**
- Hardcoded username/password pairs in `Login.tsx` (lines 24-28)
- Four roles with distinct capabilities:
  - **Super Admin**: Full backend-like editing rights - can modify team purses, player status, sold prices, and team assignments. All changes sync instantly to all dashboards.
  - **Admin**: Full auction control, player management, team oversight
  - **Owner**: View-only access to teams, players, and live auction
  - **Viewer**: Public dashboard with current auction and standings
- Session persistence via localStorage with username and role

### Cross-Tab Synchronization

**Real-time Updates**
- Storage events listener for same-origin tab communication
- 2-second polling interval as fallback for state freshness
- Window focus event handler for immediate sync on tab switch
- Ensures all connected clients see consistent auction state

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: 20+ accessible component primitives (Dialog, Dropdown, Tabs, etc.)
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority**: Type-safe component variant management
- **cmdk**: Command palette component (available for future features)

### Data Processing
- **XLSX (SheetJS)**: Excel file parsing for player import
- **date-fns**: Date formatting utilities
- **Zod**: Runtime validation (via drizzle-zod)

### Database (Configured, Not Used)
- **Drizzle ORM** with PostgreSQL dialect configured
- **@neondatabase/serverless**: Neon serverless Postgres driver ready
- **connect-pg-simple**: Session store for PostgreSQL (for future auth)
- Schema defined in `shared/schema.ts` with users table

### Development Tools
- **tsx**: TypeScript execution for development server
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error overlay
- **@replit/vite-plugin-cartographer**: Code navigation (Replit-specific)
- **@replit/vite-plugin-dev-banner**: Development environment indicator

### Build & Deployment
- **esbuild**: Server bundling
- **Vite**: Client bundling and asset optimization
- **PostCSS** with **Autoprefixer**: CSS processing
- Azure deployment configuration with custom domain support (documented in `/docs`)

### Form Management
- **react-hook-form**: Form state management (available for future forms)
- **@hookform/resolvers**: Zod integration for form validation

### Asset Management
- Team logos stored in `client/public/images/` with fallback to emoji flags
- Player photos stored in `attached_assets/` directory
- Configuration file (`config.json`) in `client/public/` for runtime access