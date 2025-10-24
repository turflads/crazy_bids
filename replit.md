# Cricket Player Auction Platform

## Overview

This is a real-time cricket player auction web application that enables live bidding on players across multiple teams. The platform features role-based access control (Admin, Owner, Viewer), grade-based player categorization (A, B, C), and comprehensive team management with purse tracking and quota enforcement. Built with React, TypeScript, Express, and configured for PostgreSQL with Drizzle ORM, the system supports Excel-based player data import and provides real-time auction state synchronization across multiple browser tabs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query for server state management
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design system

**Design System:**
- Dark mode primary with sports platform aesthetic
- Custom color palette for grades (A: purple, B: blue, C: orange)
- Typography using Inter for UI and JetBrains Mono for numeric data
- Consistent spacing and elevation system through Tailwind utilities

**State Management Strategy:**
- LocalStorage-based persistence for auction state and team data
- Custom hooks (`useAuctionSync`) for cross-tab synchronization
- Polling mechanism (2-second intervals) plus storage event listeners
- Separate state modules: `auctionState.ts` for auction flow, `teamState.ts` for team data

**Role-Based Pages:**
- Admin: Full auction control, bidding interface, player management
- Owner: View-only dashboard with team standings and auction status
- Viewer: Public-facing view of current auction and recent sales

**Key UI Patterns:**
- Celebration popup with fireworks animation on player sale
- Real-time bid validation with clear error messaging
- Excel drag-and-drop upload for player data
- Grade-based quota tracking with visual progress indicators

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Minimal API surface (currently using in-memory storage)
- Session management ready via `connect-pg-simple` (PostgreSQL session store)
- Vite middleware integration for development HMR

**Database Design:**
- Drizzle ORM configured for PostgreSQL dialect
- Schema location: `shared/schema.ts` for isomorphic access
- Migration output: `./migrations` directory
- Currently implements basic user table with UUID primary keys

**Authentication Approach:**
- Client-side credential validation (hardcoded in `Login.tsx`)
- LocalStorage-based session persistence
- Role stored with user session: admin, owner, viewer
- Ready for server-side session migration

**Data Flow:**
- Players loaded from Excel file using XLSX library
- Configuration loaded from `client/public/config.json`
- Auction state synchronized via LocalStorage across clients
- No current API endpoints (storage interface defined but unused)

### External Dependencies

**Core Libraries:**
- `@neondatabase/serverless`: PostgreSQL driver for Neon database
- `drizzle-orm` + `drizzle-kit`: TypeScript ORM and schema management
- `xlsx`: Excel file parsing for player data import
- `express`: Node.js web server framework

**UI Component Dependencies:**
- `@radix-ui/*`: Headless UI primitives (dialog, dropdown, accordion, etc.)
- `@tanstack/react-query`: Async state management
- `@hookform/resolvers` + `zod`: Form validation
- `class-variance-authority` + `clsx`: Dynamic className generation

**Development Tools:**
- `tsx`: TypeScript execution for development
- `esbuild`: Production bundling
- `vite`: Frontend build tool and dev server
- `@replit/*` plugins: Runtime error overlay, cartographer, dev banner

**Asset Management:**
- Team logos stored in `client/public/images/`
- Player photos referenced by filename in Excel
- Configuration via JSON file (`client/public/config.json`)

**Key Configuration Files:**
- `config.json`: Grade prices, increments, teams, quotas
- `playerLoader.ts`: Excel column mapping configuration
- `leagueConfig.ts`: League name customization
- `auctionConfig.ts`: Runtime config loading and caching

**Third-Party Integrations:**
- Optional CricHeroes profile links (external website)
- Google Fonts: Inter and JetBrains Mono
- No external APIs for auction functionality (fully self-contained)

**Bidding Validation System:**
- Client-side validation preventing invalid bids
- Max bid calculation considers remaining purse and unfulfilled quotas
- Grade quota enforcement (teams cannot bid if quota fulfilled)
- Reserve fund calculation for required grade slots
- Validation located in `maxBidCalculator.ts` and auction pages

**State Persistence Strategy:**
- Auction state persists across page refreshes and login/logout
- Only "Reset" button clears auction state
- Cross-tab synchronization via storage events and polling
- Celebration state triggers across all open tabs in same browser