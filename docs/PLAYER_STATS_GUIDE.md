# Player Statistics Configuration Guide

This guide explains how to add player statistics to your auction application using **two different approaches**.

---

## 📋 Overview

You can display player statistics in two ways:

### **Solution A (Recommended): Excel Stats**
- Read player stats directly from Excel columns
- Display stats in player cards (runs, wickets, strike rate, etc.)
- No external API calls needed
- Works completely offline

### **Solution B: CricHeroes Profile Links**
- Store CricHeroes profile link in Excel
- Show a "View CricHeroes Profile" button
- Opens player's profile in new tab
- Simpler setup, relies on external website

---

## 🎯 Solution A: Excel-Based Stats (Recommended)

### Step 1: Update Your Excel File

Add these columns to your `players.xlsx` file (column names are case-insensitive):

| Column Name Options | Description | Example Values |
|---------------------|-------------|----------------|
| `bat`, `Bat`, or `batting_style` | Batting style | "Right-hand bat", "Left-hand bat" |
| `bowl`, `Bowl`, or `bowling_style` | Bowling style | "Right-arm medium", "Left-arm spin" |
| `runs` or `Runs` | Total runs scored | 1250 |
| `wickets` or `Wickets` | Total wickets taken | 35 |
| `strike_rate`, `strikeRate`, or `SR` | Batting strike rate | 145.5 |
| `bowling_avg`, `bowlingAvg`, or `bowling_average` | Bowling average | 22.50 |

**Example Excel Layout:**

| name | grade | photo | bat | bowl | runs | wickets | strike_rate | bowling_avg |
|------|-------|-------|-----|------|------|---------|-------------|-------------|
| Virat Kohli | A | virat.jpg | Right-hand bat | Right-arm medium | 15000 | 4 | 137.5 | 45.00 |
| Jasprit Bumrah | A | bumrah.jpg | Right-hand bat | Right-arm fast | 150 | 150 | 85.2 | 18.50 |
| Ravindra Jadeja | B | jadeja.jpg | Left-hand bat | Left-arm spin | 5500 | 200 | 127.3 | 24.60 |

### Step 2: Current Code (Already Implemented)

The code in `client/src/lib/playerLoader.ts` is **already configured** to read these columns!

✅ No changes needed - just add the columns to your Excel file.

### Step 3: What Gets Displayed

Player cards will automatically show:

- **Batting/Bowling Styles** - Displayed as text under "Player Stats"
- **Runs** - In a small box (if available)
- **Wickets** - In a small box (if available)  
- **Strike Rate** - Formatted to 1 decimal place (if available)
- **Bowling Average** - Formatted to 2 decimal places (if available)

**The stats section only appears if at least one stat field has data.**

---

## 🔗 Solution B: CricHeroes Profile Link Only

If you only want to add a button that opens the player's CricHeroes profile:

### Step 1: Update Your Excel File

Add just this column:

| Column Name Options | Description | Example |
|---------------------|-------------|---------|
| `cricheroes_link`, `cricherosLink`, or `profile_link` | Full CricHeroes profile URL | `https://cricheroes.com/player-profile/12345/player-name` |

**Example:**

| name | grade | photo | cricheroes_link |
|------|-------|-------|-----------------|
| Virat Kohli | A | virat.jpg | https://cricheroes.com/player-profile/12345/virat-kohli |
| Jasprit Bumrah | A | bumrah.jpg | https://cricheroes.com/player-profile/67890/jasprit-bumrah |

### Step 2: Modify Code (Optional)

If you **only** want the CricHeroes button and **not** the stat boxes, edit `client/src/lib/playerLoader.ts`:

**Comment out these lines (71-76):**

```typescript
// battingStyle: battingStyle ? String(battingStyle) : undefined,
// bowlingStyle: bowlingStyle ? String(bowlingStyle) : undefined,
// runs: runs ? Number(runs) : undefined,
// wickets: wickets ? Number(wickets) : undefined,
// strikeRate: strikeRate ? Number(strikeRate) : undefined,
// bowlingAverage: bowlingAverage ? Number(bowlingAverage) : undefined,
```

**Keep only:**

```typescript
cricherosLink: cricherosLink ? String(cricherosLink) : undefined,
```

This will hide all stat displays and only show the "View CricHeroes Profile" button.

---

## 🎨 Mixed Approach: Both Stats AND Link

You can use **both solutions together**!

Just include ALL columns in your Excel:

| name | grade | photo | bat | bowl | runs | wickets | strike_rate | cricheroes_link |
|------|-------|-------|-----|------|------|---------|-------------|-----------------|
| Virat Kohli | A | virat.jpg | Right-hand bat | Right-arm medium | 15000 | 4 | 137.5 | https://cricheroes.com/.../virat-kohli |

This will display:
- ✅ Stats in the player card
- ✅ "View CricHeroes Profile" button at the bottom

---

## 📝 Column Name Reference

The code supports multiple column name variations (case-insensitive):

### Batting Style
- `bat`
- `Bat`
- `batting_style`
- `battingStyle`

### Bowling Style
- `bowl`
- `Bowl`
- `bowling_style`
- `bowlingStyle`

### Runs
- `runs`
- `Runs`

### Wickets
- `wickets`
- `Wickets`

### Strike Rate
- `strike_rate`
- `strikeRate`
- `SR`
- `sr`

### Bowling Average
- `bowling_avg`
- `bowlingAvg`
- `bowling_average`
- `bowlingAverage`

### CricHeroes Link
- `cricheroes_link`
- `cricherosLink`
- `profile_link`
- `profileLink`

---

## ❓ FAQ

**Q: What if I don't have stats for all players?**  
A: That's fine! The stats section only appears if at least one stat field has data for that player. Players without stats won't show a stats section.

**Q: Can I use only some stat columns?**  
A: Yes! Add only the columns you want. For example, you could add only `runs` and `wickets`, and skip strike rates.

**Q: Do I need to fill all columns for every player?**  
A: No! Leave cells empty if you don't have that data. Empty cells will be ignored.

**Q: What happens if my Excel has different column names?**  
A: Update the column names in the `EXCEL_COLUMNS` configuration section at lines 15-30 in `playerLoader.ts` to match your Excel file exactly.

**Q: Can I fetch stats automatically from CricHeroes?**  
A: CricHeroes doesn't provide an official API, and web scraping would violate their terms of service. The best approach is to manually add stats to your Excel file.

---

## 🚀 Quick Start Checklist

### For Excel Stats (Solution A):
- [ ] Open your `players.xlsx` file
- [ ] Add columns: `bat`, `bowl`, `runs`, `wickets`, `strike_rate`, `bowling_avg`
- [ ] Fill in player data
- [ ] Save the Excel file
- [ ] Refresh your application
- [ ] Player cards will automatically show stats!

### For CricHeroes Links (Solution B):
- [ ] Open your `players.xlsx` file
- [ ] Add column: `cricheroes_link`
- [ ] Add player profile URLs
- [ ] Save the Excel file
- [ ] Refresh your application
- [ ] Click "View CricHeroes Profile" button on player cards

---

## 🎯 Example Player Card Display

With stats, a player card will show:

```
┌─────────────────────────────┐
│  [Player Image]  Grade A    │
├─────────────────────────────┤
│ Virat Kohli                 │
│                             │
│ Base Price: ₹10,000,000     │
│                             │
│ Player Stats                │
│ Bat: Right-hand bat         │
│ Bowl: Right-arm medium      │
│                             │
│ ┌─────────┬─────────┐       │
│ │ Runs    │ Wickets │       │
│ │ 15,000  │    4    │       │
│ └─────────┴─────────┘       │
│ ┌─────────┬─────────┐       │
│ │ S/R     │ Bowl Avg│       │
│ │ 137.5   │  45.00  │       │
│ └─────────┴─────────┘       │
│                             │
│ [View CricHeroes Profile]   │
│ [View Details]              │
└─────────────────────────────┘
```

---

## 📞 Need Help?

If you encounter any issues or need to add custom stat fields, refer to:
- `client/src/lib/playerLoader.ts` - Data loading logic
- `client/src/components/PlayerCard.tsx` - Display component
