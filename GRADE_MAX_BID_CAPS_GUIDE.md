# Grade-Specific Max Bid Caps - Setup Guide

## Overview

You can now set **hard maximum bid limits** for specific player grades. This is useful when you want to ensure that teams cannot bid above a certain amount for players of a particular grade, regardless of their remaining purse.

For example:
- Grade A players: Max ₹15,000,000 (1.5 crores)
- Grade B players: Max ₹10,000,000 (1 crore)
- Grade C players: Max ₹5,000,000 (50 lakhs)

---

## How to Enable Grade Max Bid Caps

### Step 1: Edit `config.json`

Open the file: `client/public/config.json`

Add the `gradeMaxBidCaps` section after `gradeIncrements`:

```json
{
  "gradeBasePrices": {
    "A": 2000000,
    "B": 1500000,
    "C": 1000000
  },
  "gradeIncrements": {
    "A": 500000,
    "B": 300000,
    "C": 200000
  },
  "gradeMaxBidCaps": {
    "A": 15000000,
    "B": 10000000,
    "C": 5000000
  },
  "teams": [
    ...
  ],
  "gradeQuotas": {
    "A": 3,
    "B": 4,
    "C": 5
  }
}
```

### Step 2: Customize Your Limits

Change the values to match your auction rules:

```json
"gradeMaxBidCaps": {
  "A": 15000000,    // ₹1.5 crores max for Grade A
  "B": 10000000,    // ₹1 crore max for Grade B
  "C": 5000000      // ₹50 lakhs max for Grade C
}
```

### Step 3: Save and Reload

1. Save the `config.json` file
2. Refresh your browser (the config auto-reloads every 5 seconds)
3. The new limits are now active!

---

## How It Works

### Validation Order

When a team tries to place a bid, the system checks in this order:

1. **Grade Quota Check**: Is the team's quota for this grade already full?
   - Example: Team already has 3/3 Grade A players
   - ❌ Blocked with message: "Grade A quota fulfilled"

2. **Purse Check**: Does the team have enough remaining purse?
   - Example: Bid is ₹5,000,000 but team only has ₹4,000,000 left
   - ❌ Blocked with message: "Not enough purse"

3. **Grade Cap Check** ⭐ NEW!
   - Example: Bid is ₹16,000,000 but Grade A cap is ₹15,000,000
   - ❌ Blocked with message: "Bid exceeds Grade A maximum limit!"

4. **Smart Max Bid Check**: Can the team afford this AND still fill remaining quotas?
   - Example: Team needs to reserve funds for remaining B and C players
   - ❌ Blocked with message: "Max bid: ₹X to ensure quota completion"

### What Admins See

When a grade cap is exceeded, admins see this alert:

```
Bid exceeds Grade A maximum limit!
Max allowed for Grade A: ₹15,000,000
Your bid: ₹16,000,000
```

### What Changes in the UI

- **Max Bid Display**: The calculated max bid for each team now considers the grade cap
- **Team Cards**: Show the lower of:
  - Calculated max bid (based on purse and quotas)
  - Grade cap (if configured)

---

## Example Scenarios

### Scenario 1: No Grade Caps (Default)

```json
// config.json - NO gradeMaxBidCaps section
{
  "gradeBasePrices": { ... },
  "gradeIncrements": { ... },
  "teams": [ ... ],
  "gradeQuotas": { ... }
}
```

**Result**: Teams can bid up to their calculated max (based on purse and quotas only)

---

### Scenario 2: Grade Caps Enabled

```json
// config.json - WITH gradeMaxBidCaps
{
  "gradeBasePrices": {
    "A": 2000000,
    "B": 1500000,
    "C": 1000000
  },
  "gradeIncrements": {
    "A": 500000,
    "B": 300000,
    "C": 200000
  },
  "gradeMaxBidCaps": {
    "A": 15000000,
    "B": 10000000,
    "C": 5000000
  },
  ...
}
```

**Result**:
- Grade A player auction: No team can bid above ₹15,000,000
- Grade B player auction: No team can bid above ₹10,000,000
- Grade C player auction: No team can bid above ₹5,000,000

Even if a team has ₹50,000,000 remaining purse, they cannot bid ₹20,000,000 for a Grade A player!

---

### Scenario 3: Different Caps Per Grade

```json
"gradeMaxBidCaps": {
  "A": 20000000,    // ₹2 crores for top tier
  "B": 8000000,     // ₹80 lakhs for mid tier
  "C": 3000000      // ₹30 lakhs for base tier
}
```

**Use Case**: You want to allow higher bids for star players but control spending on lower grades.

---

### Scenario 4: Only Cap Some Grades

```json
"gradeMaxBidCaps": {
  "A": 15000000     // Only cap Grade A, B and C have no limit
}
```

**Result**:
- Grade A: Capped at ₹15,000,000
- Grade B: No cap (only limited by purse/quotas)
- Grade C: No cap (only limited by purse/quotas)

---

## Testing Your Configuration

### Test 1: Basic Cap Enforcement

1. Login as Admin
2. Start auction
3. For a Grade A player, try to bid ₹16,000,000 (above the ₹15,000,000 cap)
4. ✅ Should see error: "Bid exceeds Grade A maximum limit!"

### Test 2: Within Cap

1. For same Grade A player, bid ₹14,000,000 (below cap)
2. ✅ Should succeed if team has enough purse

### Test 3: Different Grades

1. Switch to Grade B player
2. Try bidding ₹12,000,000 (above ₹10,000,000 cap for Grade B)
3. ✅ Should see error for Grade B limit

---

## Tips & Best Practices

### Setting Appropriate Caps

1. **Analyze Your Budget**
   - Total purse per team: ₹100,000,000
   - Total players: 12 (3A + 4B + 5C)
   - Average per player: ₹8,333,333

2. **Leave Headroom**
   - If average is ₹8.3 million, cap Grade A at ₹15-20 million
   - This allows premium for star players without breaking the bank

3. **Consider Market Dynamics**
   - Higher caps = more competition for top players
   - Lower caps = forces teams to spread budget evenly

### When to Use Grade Caps

✅ **Use caps when:**
- You want to prevent runaway bidding on star players
- Budget control is important
- You want to ensure competitive balance
- Teams are new to auctions and need guardrails

❌ **Skip caps when:**
- You want pure free market bidding
- Teams are experienced with budget management
- You want to allow "all-in" strategies for specific players

---

## Troubleshooting

### Problem: Cap not working

**Check:**
1. Is `gradeMaxBidCaps` spelled correctly in config.json?
2. Is the JSON syntax valid? (Use JSONLint.com to check)
3. Did you refresh the browser after saving?
4. Check browser console for errors

### Problem: Wrong cap value showing

**Solution:**
1. Open config.json
2. Verify the number (no commas, just digits)
3. ₹1 crore = 10000000 (7 zeros)
4. ₹50 lakhs = 5000000 (6 zeros)

### Problem: Want to remove caps

**Solution:**
1. Open config.json
2. Delete the entire `"gradeMaxBidCaps"` section
3. Save file
4. Refresh browser
5. System returns to purse/quota-only validation

---

## Quick Reference: Common Values

| Amount         | Written as   | Example Use        |
|----------------|--------------|-------------------|
| ₹50 lakhs      | 5000000      | Grade C cap       |
| ₹1 crore       | 10000000     | Grade B cap       |
| ₹1.5 crores    | 15000000     | Grade A cap       |
| ₹2 crores      | 20000000     | Premium Grade A   |
| ₹5 crores      | 50000000     | Superstar only    |

---

## Support

If you encounter issues:
1. Check the browser console (F12) for errors
2. Verify config.json is valid JSON
3. Test with a simple cap first (e.g., only Grade A)
4. Gradually add caps for other grades

The system is backward compatible - if you don't add `gradeMaxBidCaps`, everything works as before!
