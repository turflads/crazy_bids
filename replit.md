# Cricket Player Auction - Real-Time Bidding Platform

## Overview

This project is a comprehensive web application designed for conducting live cricket player auctions. It features real-time bidding, robust team and player management, and a grade-based player acquisition system. The platform supports multiple user roles (Super Admin, Admin, Owner, Viewer) with distinct functionalities, including grade quotas, purse tracking, and dynamic auction controls. Key capabilities include immersive audio experiences, live chat for viewers, dual strategies for handling unsold players, and Excel report generation. The application also supports various player data inputs, including Google Drive images, and offers extensive customization for league branding and auction rules. The ultimate goal is to provide a flexible and engaging platform for cricket player auctions, suitable for various league sizes and formats, with future ambitions to support multiple concurrent tournaments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React 18** and **TypeScript**, utilizing **Vite** for fast development and optimized builds. **Wouter** handles client-side routing. The design system leverages **shadcn/ui** (New York style) with **Radix UI** primitives, styled using **Tailwind CSS** with custom design tokens for a consistent and accessible user experience. State management primarily uses **localStorage** for persistence across sessions and tabs, with custom hooks for cross-tab synchronization. **TanStack Query** is configured for future API integration. The application features role-based dashboards (Super Admin, Admin, Owner, Viewer), a reorganized Admin layout for improved usability, a comprehensive bidding interface with validation, and an Excel import system for player data supporting Google Drive image links. It also includes an audio manager for in-auction sound effects, celebration animations for sold players, a presentation system for auction breaks, and configurable sponsor branding.

### Backend Architecture

The backend utilizes **Express.js** with **TypeScript**, primarily serving API endpoints (currently minimal but designed for expansion) and static files. **Vite SSR middleware** is used during development. A flexible storage interface (`IStorage`) is defined, with the current implementation relying on frontend localStorage. The architecture is prepared for migration to **PostgreSQL** using **Drizzle ORM**. **esbuild** is used for fast server bundling.

### Data Model

The core data models include **Player Schema** (firstName, lastName, grade, basePrice, status, optional statistics, flexible image handling for local and Google Drive links), **Team Schema** (name, flag, logo, totalPurse, dynamic calculations for usedPurse, purseRemaining, playersCount, gradeCount, and max bid), and **Auction State** (currentPlayerIndex, currentBid, bidHistory, status flags). Configuration is managed via a `config.json` file for auction rules (grade base prices, increments, teams, quotas, grade-specific max bid caps) and `leagueConfig.ts` for branding.

### Business Logic

The system incorporates a robust **Bidding Validation System** with four tiers: grade quota fulfillment, purse sufficiency, optional grade-specific max bid caps, and a smart max bid calculation formula. **Grade Quota Management** allows configurable quotas per grade with progress tracking. **Auction Flow** is Admin-controlled, supporting start/pause/reset, unsold player handling, and celebration popups. **Skip-Sold-Players Feature** enables Super Admin to pre-sell players before auction starts; Admin auction flow automatically skips already-sold players using wrap-around roster search, detecting auction completion when no unsold players remain and auto-pausing with completion alert. An **Excel Import System** with configurable column mapping and automatic image path resolution is included. A **PowerPoint Presentation System** enables admins to upload and display presentations during auction breaks using Office Online viewer integration.

### Authentication & Authorization

A simple **Credentials System** uses hardcoded username/password pairs for four distinct roles: Super Admin (full editing rights), Admin (full auction control), Owner (view-only team/player access), and Viewer (public dashboard). Session persistence is managed via localStorage.

### Cross-Tab Synchronization

The application ensures real-time updates and consistent auction state across multiple connected clients through **Storage Events** for same-origin tab communication, a 2-second polling interval as a fallback, and a window focus event handler for immediate synchronization.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon library.
- **class-variance-authority**: Type-safe component variant management.

### Data Processing
- **XLSX (SheetJS)**: Excel file parsing.
- **date-fns**: Date formatting.
- **Zod**: Runtime validation (via drizzle-zod).

### Database (Configured, Not Used)
- **Drizzle ORM**: Configured for PostgreSQL.
- **@neondatabase/serverless**: Neon serverless Postgres driver.
- **connect-pg-simple**: Session store for PostgreSQL.

### Development Tools
- **tsx**: TypeScript execution for development.
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error overlay.
- **@replit/vite-plugin-cartographer**: Code navigation.
- **@replit/vite-plugin-dev-banner**: Development environment indicator.

### Build & Deployment
- **esbuild**: Server bundling.
- **Vite**: Client bundling and asset optimization.
- **PostCSS** with **Autoprefixer**: CSS processing.

### Form Management
- **react-hook-form**: Form state management.
- **@hookform/resolvers**: Zod integration for form validation.

### Asset Management
- Team logos in `client/public/images/`.
- Player photos in `attached_assets/`.
- Configuration (`config.json`) in `client/public/`.