# Cricket Player Auction Web Application - Design Guidelines

## Design Approach

**Selected Approach:** Sports Platform Design System inspired by ESPN, FanDuel, and Material Design
**Justification:** Data-heavy auction interface requiring clear hierarchy, real-time updates, and role-based access with sports-themed visual language

## Core Design Elements

### A. Color Palette

**Dark Mode Primary (Main Interface):**
- Background Base: 220 15% 10% (Deep navy-charcoal)
- Surface Elevated: 220 12% 15%
- Primary Brand: 145 65% 45% (Cricket green)
- Accent Critical: 25 95% 55% (Auction red for active bidding)
- Accent Success: 145 60% 50% (Sold players, completed quotas)
- Warning: 40 90% 55% (Budget alerts, quota warnings)

**Grade-Specific Colors:**
- Grade A: 270 60% 60% (Premium purple)
- Grade B: 200 70% 50% (Professional blue)
- Grade C: 40 75% 55% (Bronze orange)

**Text Hierarchy:**
- Primary: 0 0% 95%
- Secondary: 0 0% 70%
- Tertiary: 0 0% 50%

### B. Typography

**Font Families:**
- Display/Headings: 'Inter' (700, 600 weights) - Google Fonts
- Body/UI: 'Inter' (400, 500 weights)
- Numeric Data: 'JetBrains Mono' (500 weight) for prices, stats

**Type Scale:**
- Hero Numbers (Purse, Bids): text-5xl font-bold
- Section Headers: text-2xl font-semibold
- Player Names: text-xl font-semibold
- Card Labels: text-sm font-medium uppercase tracking-wide
- Body Text: text-base
- Stats/Metadata: text-sm

### C. Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16 (e.g., p-4, gap-6, mb-8)

**Grid System:**
- Dashboard Layouts: Three-column grid (Sidebar 280px, Main Content flex-1, Live Panel 320px)
- Player Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 with gap-6
- Admin Controls: Two-column split (Player Display 60%, Control Panel 40%)

**Container Strategy:**
- Full viewport dashboards with fixed navigation
- Content areas: max-w-7xl mx-auto px-6
- Modal overlays: max-w-2xl for forms, max-w-5xl for data tables

### D. Component Library

**Navigation:**
- Fixed top navbar (h-16) with role badge, user info, logout
- Color-coded role indicators (Admin: red, Owner: blue, Viewer: gray)
- Active auction indicator in navbar with pulsing animation

**Cards:**
- Player Cards: Rounded-lg shadow-lg with hover:shadow-xl transition
  - Top: Player image (aspect-video with object-cover)
  - Middle: Name, Grade badge, Base price
  - Bottom: Cricheroes stats preview, View Details button
- Sold Player Cards: Green border-l-4 with sold price overlay
- Unsold Player Cards: Red border-l-4 with "Unsold" badge

**Data Displays:**
- Purse Tracker: Large numeric display with progress bar showing used/remaining
- Grade Quota Cards: Circular progress indicators (4/4 Grade A) with color-coded rings
- Auction History: Timeline layout with timestamps, bid amounts, team names

**Controls (Admin Only):**
- Bidding Panel: Large increment buttons (₹5L, ₹10L, ₹25L, Custom)
- Team Selector: Dropdown with owner team logos/names
- Auction Controls: Start/Pause/Sold/Unsold buttons with distinct colors
- Player Navigator: Previous/Next player carousel controls

**Forms:**
- Excel Upload: Drag-and-drop zone with file preview and validation feedback
- Login Forms: Centered cards with role selection dropdown

**Status Indicators:**
- Live Auction Badge: Red pulsing dot with "LIVE" text
- Grade Badges: Pill-shaped with grade-specific background colors
- Sold/Unsold Status: Bold text badges with contrasting backgrounds

**Tables:**
- Player Listing: Sortable columns (Name, Grade, Base Price, Status, Team)
- Sticky headers on scroll
- Zebra striping for rows (subtle background alternation)
- Mobile: Convert to stacked cards below md breakpoint

### E. Animations

**Minimal, Purposeful Motion:**
- Bid Increment: Number counter animation (500ms ease-out)
- Player Sold: Confetti burst effect (1s, once)
- Real-time Update Pulse: Subtle scale pulse on new bid (300ms)
- Card Hover: transform scale-105 transition-transform duration-200
- No page transitions, no scroll-triggered animations

## Role-Specific Dashboard Layouts

**Admin Dashboard:**
- Center: Large player display with current auction details
- Left Sidebar: Upcoming players queue (vertical scroll)
- Right Panel: Bidding controls, team selector, auction status

**Owner Dashboard:**
- Top: Purse summary cards (Total, Used, Remaining)
- Second Row: Grade quota progress cards (3 cards side-by-side)
- Main Area: Tabbed interface (All Players, My Team, Sold, Unsold)
- Each tab: Filtered player grid with search/sort

**Viewer Dashboard:**
- Top: Live auction banner with current player on bid
- Main: Split view - Left: Current auction, Right: Recent sales
- Bottom: Full player database table with filters

## Images

**Player Images:**
- Location: Player cards, auction display, team rosters
- Style: Headshots or action shots, aspect-ratio 16:9
- Fallback: Cricket bat/ball icon silhouette on gradient background

**No Hero Image Required:** This is a dashboard application, not a marketing page. Lead directly with functional interface.

## Accessibility & Responsiveness

- Maintain dark mode throughout for reduced eye strain during long auctions
- High contrast text (WCAG AAA compliant)
- All interactive elements: min-height 44px (touch targets)
- Mobile: Stacked single-column layouts, collapsible sidebars, bottom-sheet modals
- Real-time updates announced via ARIA live regions for screen readers