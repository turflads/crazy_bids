# Grade-Specific Max Bid Caps - Setup Guide

## Overview

You can set **hard maximum bid limits** for specific player grades using a simple Excel-style formula. This ensures teams cannot bid above a certain amount for players of a particular grade.

**Formula:**
```
Max Bid = MIN(
  Total Purse - Sum of all unsold players' base prices,
  Grade Max Bid Cap
)
```

For example:
- Grade A players: Max ₹80 lakhs (8,000,000)
- Grade B players: Max ₹60 lakhs (6,000,000)
- Grade B+ players: Max ₹40 lakhs (4,000,000)
- Grade 40+A players: Max ₹30 lakhs (3,000,000)

---

## How to Enable Grade Max Bid Caps

### Step 1: Edit `config.json`

Open the file: `client/public/config.json`

Add the `gradeMaxBidCaps` section after `gradeQuotas`:

```json
{
  "gradeBasePrices": {
    "A": 2000000,
    "B": 1500000,
    "B+": 1500000,
    "40+A": 1000000
  },
  "gradeIncrements": {
    "A": 500000,
    "B": 300000,
    "B+": 200000,
    "40+A": 100000
  },
  "teams": [
    ...
  ],
  "gradeQuotas": {
    "A": 4,
    "B": 4,
    "B+": 2,
    "40+A": 1
  },
  "gradeMaxBidCaps": {
    "A": 8000000,
    "B": 6000000,
    "B+": 4000000,
    "40+A": 3000000
  }
}
```

### Step 2: Customize Your Limits

Change the values to match your auction rules:

```json
"gradeMaxBidCaps": {
  "A": 8000000,     // ₹80 lakhs max for Grade A
  "B": 6000000,     // ₹60 lakhs max for Grade B
  "B+": 4000000,    // ₹40 lakhs max for Grade B+
  "40+A": 3000000   // ₹30 lakhs max for Grade 40+A
}
```

**Note:** Values are in rupees (not lakhs):
- 8000000 = ₹80 lakhs
- 10000000 = ₹1 crore
- 50000000 = ₹5 crores

### Step 3: Save and Reload

1. Save the `config.json` file
2. Refresh your browser (the config auto-reloads every 5 seconds)
3. The new limits are now active!

---

## How It Works

### The Max Bid Formula

The system uses a simple Excel-style formula to calculate the maximum bid:

```
Max Bid = MIN(
  Total Purse - Sum of remaining unsold players' base prices,
  Grade Max Bid Cap
)
```

**Example Calculation:**
- Team's total purse: ₹10 crores (100,000,000)
- Sum of all remaining unsold players' base prices: ₹3 crores (30,000,000)
- Grade A max cap: ₹80 lakhs (8,000,000)
- **Calculated:** 10cr - 3cr = ₹7 crores
- **Result:** MIN(7cr, 80L) = **₹80 lakhs** (capped by grade limit)

### What This Means

1. **Reserve for Future Players**: The formula ensures teams always keep enough money to buy all remaining players at their base prices
2. **Grade Cap Enforcement**: Even if a team has enough money after reserving for future players, they cannot exceed the grade-specific cap
3. **Automatic Calculation**: The system automatically calculates this for every team in real-time

### Validation Order

When a team tries to place a bid, the system checks in this order:

1. **Grade Quota Check**: Is the team's quota for this grade already full?
   - Example: Team already has 4/4 Grade A players
   - ❌ Blocked with message: "Grade A quota fulfilled"

2. **Purse Check**: Does the team have enough remaining purse?
   - Example: Bid is ₹5,000,000 but team only has ₹4,000,000 left
   - ❌ Blocked with message: "Not enough purse"

3. **Max Bid Check** (Formula Applied Here)
   - Calculates: Total Purse - Sum of unsold base prices
   - Applies grade cap if configured
   - ❌ Blocked if bid exceeds this calculated max

---

## Example Scenarios

### Scenario 1: Grade Cap Limits the Bid

**Setup:**
- Team has ₹50 crores total purse
- Remaining unsold players need ₹20 crores (base prices)
- Grade A cap: ₹80 lakhs

**Calculation:**
```
Max Bid = MIN(50cr - 20cr, 80L)
        = MIN(30cr, 80L)
        = ₹80 lakhs  ← Capped by grade limit
```

**Result:** Team can bid maximum ₹80 lakhs for Grade A player, even though they have ₹30 crores available.

---

### Scenario 2: Purse Limits the Bid

**Setup:**
- Team has ₹10 crores total purse
- Remaining unsold players need ₹9.5 crores (base prices)
- Grade A cap: ₹80 lakhs

**Calculation:**
```
Max Bid = MIN(10cr - 9.5cr, 80L)
        = MIN(50L, 80L)
        = ₹50 lakhs  ← Limited by available purse
```

**Result:** Team can only bid ₹50 lakhs because they need to reserve ₹9.5 crores for remaining players.

---

### Scenario 3: No Grade Caps

If you don't add `gradeMaxBidCaps` to your config.json:

```json
{
  "gradeBasePrices": { ... },
  "gradeIncrements": { ... },
  "teams": [ ... ],
  "gradeQuotas": { ... }
  // No gradeMaxBidCaps section
}
```

**Result:** Only the purse formula applies (no grade caps):
```
Max Bid = Total Purse - Sum of unsold base prices
```

---

## What Admins See

### Max Bid Display

In the Admin dashboard, each team card shows:
```
Team Name
Max Bid: ₹X,XXX,XXX  ← Calculated using the formula
```

This max bid updates in real-time as:
- Players get sold (reducing unsold base prices sum)
- Team's purse changes

### Bid Rejection Messages

If a bid exceeds the max bid, admins see:
```
Invalid bid!
Max available bid for this team: ₹X,XXX,XXX
```

---

## Advanced Configuration

### Different Caps for Different Grades

You can set different caps for each grade:

```json
"gradeMaxBidCaps": {
  "A": 8000000,     // Premium players: ₹80L cap
  "B": 6000000,     // Mid-tier: ₹60L cap
  "B+": 4000000,    // Lower-mid: ₹40L cap
  "40+A": 3000000   // Special category: ₹30L cap
}
```

### No Cap for Certain Grades

To allow unlimited bidding for a grade (within purse limits), just omit it:

```json
"gradeMaxBidCaps": {
  "A": 8000000,   // Only Grade A is capped
  // B, B+, 40+A have no caps - can bid up to purse limit
}
```

---

## Troubleshooting

### Problem: Max bid seems wrong

**Check:**
1. Is `gradeMaxBidCaps` spelled correctly in config.json?
2. Are the values in rupees (not lakhs)?
3. Did you refresh the browser after saving?
4. Check browser console (F12) for errors

**Debug:**
- Look at the Admin dashboard - it shows the calculated max bid
- The formula is: Total Purse - Sum of all unsold base prices (capped by grade)

### Problem: Teams can still bid above the cap

**Possible causes:**
1. The config.json file has syntax errors (use JSONLint.com to validate)
2. The grade name doesn't match exactly (check for spaces, capitalization)
3. Browser cache needs clearing

**Solution:**
1. Validate your JSON syntax
2. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. Check browser console for errors

---

## Technical Details

### Where the Formula is Implemented

**File:** `client/src/lib/maxBidCalculator.ts`

The `calculateMaxBidSync` function:
1. Filters all players to get unsold ones
2. Sums their base prices
3. Subtracts from team's total purse
4. Applies grade cap if configured
5. Returns the minimum of the two

### Related Files

- **Admin Dashboard:** `client/src/pages/Admin.tsx` - Shows max bid for each team
- **Owner Dashboard:** `client/src/pages/Owner.tsx` - Shows max bid for all teams
- **Config File:** `client/public/config.json` - Where you set the caps

---

## Summary

Grade max bid caps provide a simple way to limit spending on specific grades:

1. **Add** `gradeMaxBidCaps` section to `config.json`
2. **Set** maximum bid limits in rupees for each grade
3. **Formula** automatically calculates: MIN(purse - unsold base prices, grade cap)
4. **Real-time** updates as auction progresses

This ensures balanced team building and prevents overspending on premium players! 🏏

---

*Last Updated: November 7, 2024*
*Formula: Excel-style MIN(purse - sum of unsold, grade cap)*
