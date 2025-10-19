# Excel Column Configuration Guide

## 🎯 Quick Setup - Change Column Names Here

Open this file: **`client/src/lib/playerLoader.ts`**

Look for lines **13-27** at the top of the file. This is where you change column names to match your Excel file.

---

## 📝 Configuration Section (Lines 13-27)

```typescript
const EXCEL_COLUMNS = {
  // Required columns
  NAME_COLUMN: 'name',        // Player's full name
  GRADE_COLUMN: 'grade',      // Player grade (A, B, C)
  PHOTO_COLUMN: 'photo',      // Player photo filename
  
  // Optional stat columns (leave empty '' if you don't have this column)
  BATTING_STYLE_COLUMN: 'bat',           // e.g., "Right-hand bat"
  BOWLING_STYLE_COLUMN: 'bowl',          // e.g., "Right-arm medium"
  RUNS_COLUMN: 'runs',                   // Total runs scored
  WICKETS_COLUMN: 'wickets',             // Total wickets taken
  STRIKE_RATE_COLUMN: 'strike_rate',     // Batting strike rate
  BOWLING_AVG_COLUMN: 'bowling_avg',     // Bowling average
  CRICHEROES_LINK_COLUMN: 'cricheroes_link', // CricHeroes profile URL
};
```

---

## 🔧 How to Change Column Names

### Example 1: Your Excel has "runs_scored" instead of "runs"

**Change this line:**
```typescript
RUNS_COLUMN: 'runs',
```

**To this:**
```typescript
RUNS_COLUMN: 'runs_scored',
```

---

### Example 2: Your Excel has "Total_Runs" instead of "runs"

**Change this line:**
```typescript
RUNS_COLUMN: 'runs',
```

**To this:**
```typescript
RUNS_COLUMN: 'Total_Runs',
```

---

### Example 3: Your Excel has different stat columns

If your Excel file looks like this:

| Player_Name | Grade | Photo | Batting | Bowling | Total_Runs | Total_Wickets | SR | Bowl_Avg |
|-------------|-------|-------|---------|---------|------------|---------------|----|----------|
| Virat Kohli | A | virat.jpg | RHB | RAM | 15000 | 4 | 137.5 | 45.00 |

**Update the config like this:**

```typescript
const EXCEL_COLUMNS = {
  // Required columns
  NAME_COLUMN: 'Player_Name',    // Changed from 'name'
  GRADE_COLUMN: 'Grade',
  PHOTO_COLUMN: 'Photo',
  
  // Optional stat columns
  BATTING_STYLE_COLUMN: 'Batting',        // Changed from 'bat'
  BOWLING_STYLE_COLUMN: 'Bowling',        // Changed from 'bowl'
  RUNS_COLUMN: 'Total_Runs',              // Changed from 'runs'
  WICKETS_COLUMN: 'Total_Wickets',        // Changed from 'wickets'
  STRIKE_RATE_COLUMN: 'SR',               // Changed from 'strike_rate'
  BOWLING_AVG_COLUMN: 'Bowl_Avg',         // Changed from 'bowling_avg'
  CRICHEROES_LINK_COLUMN: '',             // No link column in this Excel
};
```

---

## ⚠️ Important Notes

1. **Column names are CASE-SENSITIVE**
   - If your Excel has `Runs`, use `'Runs'` (capital R)
   - If your Excel has `runs`, use `'runs'` (lowercase r)

2. **Use exact spelling**
   - Spaces, underscores, and special characters must match exactly
   - `Total_Runs` is different from `Total Runs` (one has underscore, one has space)

3. **Leave empty if column doesn't exist**
   - If you don't have a CricHeroes link column:
     ```typescript
     CRICHEROES_LINK_COLUMN: '',  // Leave empty
     ```

4. **Don't modify anything below line 31**
   - Only change the `EXCEL_COLUMNS` section
   - Everything below that is automatic

---

## 📋 Common Excel Variations

### Variation 1: Simple lowercase
```typescript
const EXCEL_COLUMNS = {
  NAME_COLUMN: 'name',
  GRADE_COLUMN: 'grade',
  PHOTO_COLUMN: 'photo',
  BATTING_STYLE_COLUMN: 'bat',
  BOWLING_STYLE_COLUMN: 'bowl',
  RUNS_COLUMN: 'runs',
  WICKETS_COLUMN: 'wickets',
  STRIKE_RATE_COLUMN: 'sr',
  BOWLING_AVG_COLUMN: 'avg',
  CRICHEROES_LINK_COLUMN: '',
};
```

### Variation 2: CamelCase
```typescript
const EXCEL_COLUMNS = {
  NAME_COLUMN: 'playerName',
  GRADE_COLUMN: 'playerGrade',
  PHOTO_COLUMN: 'playerPhoto',
  BATTING_STYLE_COLUMN: 'battingStyle',
  BOWLING_STYLE_COLUMN: 'bowlingStyle',
  RUNS_COLUMN: 'totalRuns',
  WICKETS_COLUMN: 'totalWickets',
  STRIKE_RATE_COLUMN: 'strikeRate',
  BOWLING_AVG_COLUMN: 'bowlingAverage',
  CRICHEROES_LINK_COLUMN: 'profileLink',
};
```

### Variation 3: Underscores with capitals
```typescript
const EXCEL_COLUMNS = {
  NAME_COLUMN: 'Player_Name',
  GRADE_COLUMN: 'Player_Grade',
  PHOTO_COLUMN: 'Photo_File',
  BATTING_STYLE_COLUMN: 'Batting_Style',
  BOWLING_STYLE_COLUMN: 'Bowling_Style',
  RUNS_COLUMN: 'Total_Runs',
  WICKETS_COLUMN: 'Total_Wickets',
  STRIKE_RATE_COLUMN: 'Strike_Rate',
  BOWLING_AVG_COLUMN: 'Bowling_Average',
  CRICHEROES_LINK_COLUMN: 'Profile_URL',
};
```

---

## ✅ Step-by-Step Process

1. **Open your Excel file** and check the column names in the first row

2. **Open** `client/src/lib/playerLoader.ts`

3. **Find lines 13-27** (the `EXCEL_COLUMNS` section)

4. **Update each column name** to match your Excel exactly

5. **Save the file**

6. **Refresh your browser** - the app will automatically restart

7. **The stats will now show up** in player cards during the auction!

---

## 🎯 Where Stats Appear

Stats will automatically appear in player cards on:
- ✅ **Admin Page** - When controlling the auction
- ✅ **Owner Page** - When viewing players for bidding
- ✅ **Viewer Page** - When watching the auction

The stats appear **below the base price** and **above the "View Details" button** in every player card.

---

## ❓ Troubleshooting

**Problem: Stats not showing up**

1. Check that column names match EXACTLY (case-sensitive)
2. Make sure your Excel file is saved as `players.xlsx` in the `public` folder
3. Refresh your browser with Ctrl+F5 (hard refresh)
4. Check browser console for errors (F12 key)

**Problem: Some stats show, others don't**

- This is normal if you only have some columns in your Excel
- Only stats with data will appear
- Empty or missing columns are automatically hidden

---

## 📞 Need More Help?

See the full guide: **`PLAYER_STATS_GUIDE.md`**
