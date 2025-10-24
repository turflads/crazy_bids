# Cricket Player Auction Web Application

## Overview

This is a real-time cricket player auction platform that enables live bidding on players across multiple teams. The application features role-based access control (Admin, Owner, Viewer), grade-based player acquisition with quota tracking, and synchronized auction state management. Built with React, Express, and PostgreSQL, it provides a sports-themed interface inspired by platforms like ESPN and FanDuel.

## Recent Changes (October 23, 2025)

**WebSocket Real-Time Communication** ✅
- Implemented WebSocket support for instant auction updates across all users
- Replaced 2-second polling with true real-time WebSocket broadcasting
- WebSocket server runs on `/ws` path alongside HTTP server
- All auction state and team changes broadcast instantly to connected clients
- Automatic reconnection with 3-second retry on connection loss
- Falls back to localStorage sync for cross-tab communication
- WebSocketProvider wraps the entire app for global WebSocket access
- Backward compatible: keeps localStorage as source of truth

**League Branding Configuration** ✅
- Created centralized league configuration file at `client/src/config/leagueConfig.ts`
- Changed default league name from "Cricket Auction" to "TLPL S4"
- League name now appears consistently on login page and navbar
- Easy to change for future seasons/leagues - just edit one config file
- Clear instructions included in config file for changing league name

**Documentation Organization** ✅
- Created `/docs` folder to consolidate all documentation files
- Moved all .md and .txt files to /docs directory for better organization
- Created docs/README.md with quick links and categorized documentation
- All deployment guides, configuration guides, and technical docs now in one place

**UI/UX Design Improvements** ✅
- Fixed button text overflow issues across all components
- Improved mobile responsiveness for all dashboards (Admin, Owner, Viewer)
- Enhanced NavBar with responsive layout and mobile-optimized controls
- Fixed team name truncation in cards to prevent text overflow
- Improved auction control buttons with proper sizing and responsive grids
- Enhanced dialog layouts with responsive grid columns for mobile devices
- Added proper text wrapping and truncation for long team names
- Improved tab layouts with mobile-friendly text sizing
- Fixed stat display grids to be responsive (2 columns on mobile, 4 on desktop)
- All interactive elements now properly sized with flex-shrink controls
- Consistent spacing and alignment across all components

**Bidding Validation System** ✅
- Implemented comprehensive bid validation to prevent invalid bids
- Teams cannot bid more than their remaining purse
- Teams cannot bid more than their calculated max bid (which reserves funds for unfulfilled grade quotas)
- Teams cannot bid if they've already fulfilled their grade quota for that player's grade
- Clear error messages explain why bids are rejected:
  - "Doesn't have enough purse!" with bid amount vs remaining purse
  - "Cannot bid this amount! Max Bid: ₹X" when exceeding calculated max
  - "Already fulfilled Grade X quota" when quota is met
- Validation occurs in real-time before bid is accepted
- Invalid bids do not change auction state

**Player Stats Display Optimization** ✅
- Owner page now shows player stats ONLY in Current Auction section
- Player list cards (All Players, Sold, Unsold tabs) no longer show stats to reduce clutter
- PlayerCard component has `showStats` prop for conditional stats rendering
- Admin and Viewer pages continue to show stats in player cards

## Previous Changes (October 19, 2025)

**Team Logo System Implementation**
- Replaced all emoji flags with actual team logo images throughout the application
- Created TeamLogo component with automatic fallback to emoji if image fails to load
- Updated all dashboards (Admin, Owner, Viewer) to display team logos
- Team logos stored in `client/public/images/` and configured in `config.json`
- Logos appear in: team cards, bid buttons, celebration popup, team dialogs, and dropdowns

**Auction State Persistence Fixes**
- Fixed critical bug where page refresh would restart auction from first player
- Fixed critical bug where logout/login would reset auction state
- Enhanced auction state to include bidHistory and hasBids for complete state restoration
- Auction now correctly persists across page refreshes and login/logout cycles
- Only the "Reset" button now clears and restarts the auction
- All auction state stored in localStorage ('cricket_auction_state' key)

**Celebration Fireworks Enhancement**
- Celebration popup with fireworks animation now appears on ALL pages (Admin, Owner, Viewer)
- Auto-dismisses after 5 seconds
- Shows player name, team logo, team name, and final sold price
- Next player automatically appears after celebration closes
- Works seamlessly when multiple tabs are open on the same browser
- Note: For celebrations to sync across different devices/browsers, users would need to be viewing the same browser instance (different tabs)

**Player Statistics Feature**
- Player cards now support displaying comprehensive player statistics
- Two implementation scenarios:
  - **Scenario A (Excel Stats)**: Read stats directly from Excel columns (bat, bowl, runs, wickets, strike_rate, bowling_avg)
  - **Scenario B (CricHeroes Link)**: Store CricHeroes profile link and show "View Profile" button
  - **Mixed Approach**: Use both Excel stats AND CricHeroes link together
- Stats display automatically when data is available in Excel
- Column names are case-insensitive (bat/Bat, runs/Runs, etc.)
- Stats section appears with batting/bowling styles and performance metrics (runs, wickets, strike rate, bowling average)
- Detailed setup instructions in `PLAYER_STATS_GUIDE.md`

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18 with TypeScript for type-safe component development
- Wouter for client-side routing (lightweight alternative to React Router)
- Vite as the build tool and development server

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui design system with customized "new-york" style variant
- Tailwind CSS for utility-first styling with dark mode support
- Custom color system with grade-specific colors (A: purple, B: blue, C: orange)
- Typography: Inter for UI/headings, JetBrains Mono for numeric data

**State Management Strategy**
- TanStack Query (React Query) for server state and caching
- **WebSocket-based real-time synchronization** for instant auction updates across all connected clients
- LocalStorage as source of truth with WebSocket broadcasting for cross-device sync
- Custom hooks (`useAuctionSync`) using WebSocket messages instead of polling
- `useWebSocket` hook manages WebSocket connection with auto-reconnect
- Separate state modules: `auctionState.ts` for auction flow, `teamState.ts` for team purses/players
- Broadcast wrapper functions (`saveAuctionStateWithBroadcast`, `saveTeamStateWithBroadcast`) automatically notify all clients

**Architecture**: WebSocket broadcasts state changes instantly to all connected users while localStorage ensures persistence and cross-tab compatibility. The WebSocket connection auto-reconnects after failures and gracefully falls back to storage events when WebSocket is unavailable.

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- **WebSocket Server** on `/ws` path for real-time bidirectional communication
- TypeScript with ES modules for modern JavaScript features
- Custom middleware for request logging and error handling
- WebSocket message broadcasting to all connected clients except sender

**Development vs Production**
- Vite dev middleware in development for HMR and SSR (uses separate WebSocket path)
- Static file serving in production from compiled assets
- Environment-based configuration via NODE_ENV

**Storage Layer**
- In-memory storage implementation (`MemStorage`) as default
- Interface-based design (`IStorage`) allows swapping to database persistence
- Currently implements basic user CRUD operations

**Rationale**: The in-memory storage provides a simple starting point. The interface abstraction means you can later swap to PostgreSQL/Drizzle without changing route logic.

### Database Architecture

**ORM & Schema**
- Drizzle ORM configured for PostgreSQL
- Schema definition in `shared/schema.ts` for code sharing between client/server
- Zod integration for runtime validation via `drizzle-zod`
- Migration support through `drizzle-kit`

**Current Schema**
- Users table with UUID primary keys, username/password fields
- Schema uses `gen_random_uuid()` for automatic ID generation

**Planned Extensions**
- Players table (firstName, lastName, grade, basePrice, status, soldPrice, team)
- Teams table (name, flag, totalPurse, usedPurse)
- Auction history/events table for audit trail

**Rationale**: Drizzle was selected for type-safe SQL queries and excellent TypeScript integration. The shared schema approach ensures consistent types across frontend and backend.

### Authentication & Authorization

**Current Implementation**
- Mock credential-based authentication in localStorage
- Role-based routing: `/admin`, `/owner`, `/viewer`
- Client-side role verification on page load

**Production Requirements**
- Session-based authentication with `connect-pg-simple` (already installed)
- Password hashing (bcrypt/argon2)
- Secure session cookies with HTTP-only flag
- CSRF protection for state-changing operations

**Rationale**: Mock authentication provides rapid prototyping. The installed session middleware indicates planned server-side session management.

### Real-Time Synchronization

**Multi-Tab Sync Strategy**
1. LocalStorage as shared state store
2. Storage event listeners for cross-tab communication
3. Window focus event triggers state refresh
4. 2-second polling interval as fallback

**State Updates Flow**
- Admin updates auction → saves to localStorage
- Other tabs/windows receive storage event → refresh state
- All viewers/owners see updates within 2 seconds max

**Rationale**: This approach works reliably without requiring WebSocket infrastructure, making deployment simpler while maintaining acceptable real-time performance for auction use cases.

## External Dependencies

### Core Libraries
- **@tanstack/react-query** (v5.60.5) - Server state management and caching
- **drizzle-orm** (v0.39.1) - Type-safe SQL ORM
- **@neondatabase/serverless** (v0.10.4) - Neon PostgreSQL driver for serverless environments
- **wouter** - Lightweight React routing
- **zod** - Runtime type validation

### UI Component Libraries
- **@radix-ui/** packages - Accessible component primitives (dialog, dropdown, popover, etc.)
- **class-variance-authority** - CSS variant management
- **tailwindcss** - Utility-first CSS framework
- **lucide-react** - Icon library

### Forms & Validation
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Validation resolver integration
- **drizzle-zod** - Drizzle-to-Zod schema conversion

### Development Tools
- **vite** - Build tool and dev server
- **typescript** - Type system
- **tsx** - TypeScript execution for Node.js
- **esbuild** - Production server bundling

### Database & Sessions
- **connect-pg-simple** - PostgreSQL session store for Express
- **pg** - PostgreSQL client (peer dependency)

### Fonts & Assets
- **Google Fonts**: Inter (400, 500, 600, 700), JetBrains Mono (500, 600)
- Custom CSS for fireworks celebration animation