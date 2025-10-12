# Cricket Player Auction Web Application

## Overview

This is a real-time cricket player auction platform that enables live bidding on players across multiple teams. The application features role-based access control (Admin, Owner, Viewer), grade-based player acquisition with quota tracking, and synchronized auction state management. Built with React, Express, and PostgreSQL, it provides a sports-themed interface inspired by platforms like ESPN and FanDuel.

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
- LocalStorage-based state synchronization for cross-tab/window updates
- Custom hooks (`useAuctionSync`) for polling and real-time state updates
- Separate state modules: `auctionState.ts` for auction flow, `teamState.ts` for team purses/players

**Rationale**: LocalStorage with polling was chosen over WebSockets for simplicity and compatibility with serverless deployments. The 2-second polling interval balances real-time updates with performance.

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript with ES modules for modern JavaScript features
- Custom middleware for request logging and error handling

**Development vs Production**
- Vite dev middleware in development for HMR and SSR
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