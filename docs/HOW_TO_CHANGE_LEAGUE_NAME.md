# How to Change League Name

The league name (currently "TLPL S4") appears on the login page and navigation bar throughout the application.

## Quick Instructions

1. Open the file: `client/src/config/leagueConfig.ts`
2. Find the line that says: `export const LEAGUE_NAME = "TLPL S4";`
3. Change `"TLPL S4"` to your desired league name
4. Save the file

The application will automatically reload with the new league name!

## Example Changes

### Change to a different season:
```typescript
export const LEAGUE_NAME = "TLPL S5";
```

### Change to a different league:
```typescript
export const LEAGUE_NAME = "IPL 2026";
```

### Use a longer name:
```typescript
export const LEAGUE_NAME = "Mumbai Premier Cricket League";
```

## File Location

**File Path:** `client/src/config/leagueConfig.ts`

**From Project Root:**
```
cricket-auction/
  └── client/
      └── src/
          └── config/
              └── leagueConfig.ts  ← Edit this file
```

## Where the Name Appears

After changing the league name, it will automatically update in:
- ✅ Login page title
- ✅ Navigation bar (top of every page)
- ✅ All admin, owner, and viewer dashboards

## Future Customization

The `leagueConfig.ts` file is designed to hold more branding options in the future. You can add additional settings like:
- League logo image path
- League description text
- Theme colors
- Social media links

All in one centralized location!
