# Grade Spending Limits Feature

## Overview

The **Grade Spending Limits** feature allows you to set a maximum total budget that each team can spend on all players within a specific grade category. This is different from the per-player bid cap and provides more strategic depth to the auction.

## Concept

### Current System (Without Grade Spending Limits)
- **Grade Quota**: Team must buy 2 Grade A players
- **Total Purse**: ₹100 Lakhs available
- **Result**: Team can spend ₹90L on first Grade A player, leaving only ₹10L for second

### With Grade Spending Limits
- **Grade Quota**: Team must buy 2 Grade A players  
- **Total Purse**: ₹100 Lakhs available
- **Grade A Spending Limit**: ₹60 Lakhs maximum for all Grade A players combined
- **Result**: If team spends ₹40L on first Grade A player, they can only spend max ₹20L on the second Grade A player (₹60L - ₹40L = ₹20L remaining)

## How It Works

### Budget Calculation Flow

```
For each bid, the system checks:
1. Team's remaining total purse
2. Grade quota fulfillment requirements  
3. Grade-specific per-player max bid cap (if configured)
4. Grade spending limit (NEW)
   - Total spent on this grade so far
   - Remaining slots in this grade
   - Reserve minimum for future slots
```

### Example Scenario

**Configuration:**
```json
{
  "gradeQuotas": {
    "A": 2,
    "B": 3,
    "C": 4
  },
  "gradeBasePrices": {
    "A": 1000000,
    "B": 500000,
    "C": 200000
  },
  "gradeSpendingLimits": {
    "A": 10000000,  // Max ₹1 Crore for all Grade A players
    "B": 8000000,   // Max ₹80 Lakhs for all Grade B players
    "C": 5000000    // Max ₹50 Lakhs for all Grade C players
  }
}
```

**Team Status:**
- Total Purse: ₹30,00,000 (₹3 Crores)
- Used Purse: ₹40,00,000 (₹40 Lakhs)
- Remaining Purse: ₹2,60,00,000 (₹2.6 Crores)

**Grade A Status:**
- Quota: 2 players needed
- Already bought: 1 player for ₹60,00,000
- Spent on Grade A: ₹60,00,000
- Grade A spending limit: ₹1,00,00,000
- Remaining Grade A budget: ₹40,00,000

**Max Bid Calculation for Next Grade A Player:**
1. Remaining purse: ₹2,60,00,000
2. This is the last Grade A slot (2nd of 2)
3. Remaining Grade A budget: ₹40,00,000
4. **Max Bid = Min(₹2,60,00,000, ₹40,00,000) = ₹40,00,000**

## Configuration

### 1. Update config.json

Add the `gradeSpendingLimits` section:

```json
{
  "teams": [
    {
      "name": "Team Alpha",
      "totalPurse": 30000000,
      "flag": "/images/team-alpha.png",
      "logo": "/images/team-alpha-logo.png"
    }
  ],
  "gradeBasePrices": {
    "A": 1000000,
    "B": 500000,
    "C": 200000
  },
  "gradeIncrements": {
    "A": 100000,
    "B": 50000,
    "C": 25000
  },
  "gradeQuotas": {
    "A": 2,
    "B": 3,
    "C": 4
  },
  "gradeSpendingLimits": {
    "A": 10000000,
    "B": 8000000,
    "C": 5000000
  }
}
```

### 2. Values in Indian Rupees

All amounts are in rupees. Common values:

| Display | Actual Value | Description |
|---------|--------------|-------------|
| ₹10 Lakhs | 1000000 | Ten lakhs |
| ₹50 Lakhs | 5000000 | Fifty lakhs |
| ₹1 Crore | 10000000 | One crore |
| ₹5 Crores | 50000000 | Five crores |

## Implementation Status

**Current Status: COMMENTED OUT (Not Active)**

The code for this feature has been written but is currently commented out. To activate it:

1. Uncomment all sections marked with `// NEW:` in the codebase
2. Add `gradeSpendingLimits` to your `config.json`
3. Test thoroughly with your auction setup

### Files to Update

1. **config.json** - Add spending limits configuration
2. **client/src/lib/teamState.ts** - Track spending per grade
3. **client/src/lib/maxBidCalculator.ts** - Calculate max bid with grade limits
4. **client/src/pages/Admin.tsx** - Validate bids against limits
5. **client/src/lib/auctionConfig.ts** - Load spending limits from config

## Use Cases

### Use Case 1: Prevent Star Player Dominance
**Problem:** Teams spend 80% of budget on one star player, leaving minimal funds for others.

**Solution:**
```json
"gradeSpendingLimits": {
  "A": 12000000  // Max ₹1.2 Crores for all Grade A players
}
```
With 3 Grade A players needed, teams must distribute budget more evenly.

### Use Case 2: Category-Based Budgeting
**Problem:** Want to enforce specific budget allocation across grades.

**Solution:**
```json
"gradeSpendingLimits": {
  "A": 15000000,  // 50% of ₹3 Crore purse
  "B": 10000000,  // 33% of purse
  "C": 5000000    // 17% of purse
}
```

### Use Case 3: Balanced Squad Building
**Problem:** Teams neglect lower grades, overspending on top grades.

**Solution:** Set proportional limits that force balanced spending across all grades.

## Validation Rules

When a bid is placed, the system validates:

### 1. Total Purse Check
```
Bid Amount ≤ Team's Remaining Purse
```

### 2. Grade Quota Check
```
Team has not already fulfilled quota for this grade
```

### 3. Grade Spending Limit Check (NEW)
```
(Already Spent on Grade) + (Bid Amount) ≤ Grade Spending Limit
```

### 4. Future Slots Reserve
```
If more slots remain in this grade:
  Max Bid = (Remaining Grade Budget) - (Reserve for future slots)
```

## Error Messages

When grade spending limit is exceeded:

```
Team Alpha cannot bid ₹45,00,000!

Grade A spending limit: ₹1,00,00,000
Already spent on Grade A: ₹60,00,000
Remaining budget for Grade A: ₹40,00,000
```

## Testing Checklist

Before activating this feature, test:

- [ ] Teams can bid up to the grade spending limit
- [ ] Bids exceeding grade limit are rejected with clear error
- [ ] Max bid display accounts for grade spending limits
- [ ] Multi-slot grades reserve budget for future players
- [ ] Grade spending resets when auction is reset
- [ ] Cross-tab sync updates grade spending correctly
- [ ] Excel export shows grade spending per team

## Differences from Existing Features

### vs. Grade Max Bid Cap
| Feature | Grade Max Bid Cap | Grade Spending Limit |
|---------|------------------|---------------------|
| **Scope** | Per individual player | All players in grade combined |
| **Example** | Max ₹50L per Grade A player | Max ₹1Cr total for all Grade A players |
| **Use Case** | Prevent single overpay | Control category budget |

### vs. Total Purse
| Feature | Total Purse | Grade Spending Limit |
|---------|------------|---------------------|
| **Scope** | All players combined | Specific grade only |
| **Example** | ₹3 Crores total budget | ₹1 Crore for Grade A |
| **Flexibility** | Can spend anywhere | Must distribute per grade |

## Advanced Scenarios

### Scenario: Last Slot in Grade

When buying the **last player** in a grade quota:
- Can use **full remaining grade budget**
- No need to reserve for future slots
- Still limited by total purse remaining

### Scenario: Multiple Slots Remaining

When **2+ slots** remain in a grade:
- System reserves **minimum base price** for each future slot
- Ensures team can fulfill quota
- Max bid = Remaining Grade Budget - (Future Slots × Base Price)

### Scenario: Combination with Max Bid Cap

If both features are active:
```
Actual Max Bid = Minimum of:
  1. Remaining purse
  2. Purse needed for future quotas
  3. Grade-specific max bid cap
  4. Grade spending limit calculation
```

## Future Enhancements

Potential additions to this feature:

1. **Grade Minimum Spending** - Require minimum spend per grade
2. **Dynamic Limits** - Adjust limits based on auction progress
3. **Rollover Budget** - Transfer unused grade budget to other grades
4. **Visual Indicators** - Show grade budget bars in UI
5. **Reports** - Grade-wise spending analysis after auction

## Support

For questions or issues with this feature:
1. Check configuration syntax in `config.json`
2. Verify all commented code is uncommented
3. Test with small values first
4. Review browser console for validation errors

---

**Last Updated:** November 2024  
**Status:** Code written, currently commented out  
**Ready for:** Testing and activation when needed
