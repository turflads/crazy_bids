# League Branding Customization Guide

This guide explains how to customize your cricket auction platform with your own league name, logos, sponsor information, and developer credit.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Customizing League Name](#customizing-league-name)
3. [Adding League Logo](#adding-league-logo)
4. [Adding Sponsor Branding](#adding-sponsor-branding)
5. [Updating Developer Credit](#updating-developer-credit)
6. [Where Branding Appears](#where-branding-appears)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

All branding settings are in **one file**:

```
client/src/config/leagueConfig.ts
```

**Steps:**
1. Open the file
2. Edit the values
3. Save the file
4. The app automatically reloads with your changes!

---

## 1️⃣ Customizing League Name

### Current Setting
```typescript
export const LEAGUE_NAME = "TLPL S4";
```

### How to Change

**Step 1:** Open `client/src/config/leagueConfig.ts`

**Step 2:** Find the line with `LEAGUE_NAME`

**Step 3:** Replace the text between quotes with your league name:

```typescript
// Examples:
export const LEAGUE_NAME = "Mumbai Premier League 2025";
export const LEAGUE_NAME = "IPL Mega Auction 2026";
export const LEAGUE_NAME = "Corporate Cricket Championship";
export const LEAGUE_NAME = "MZPL Season 5";
```

**Step 4:** Save the file

✅ **Done!** Your league name now appears on:
- Login page
- Top navigation bar (center)
- All pages throughout the app

---

## 2️⃣ Adding League Logo

### Current Setting
```typescript
export const LEAGUE_LOGO = ""; // Empty = no logo
```

### How to Add Your Logo

**Step 1:** Prepare your logo image
- Recommended format: PNG (with transparent background)
- Recommended size: 200x200 pixels (square)
- File should be small (under 100KB for fast loading)

**Step 2:** Add logo to the project
- Place your logo file in: `client/public/images/`
- Example: `client/public/images/my-league-logo.png`

**Step 3:** Update the configuration

```typescript
// Before
export const LEAGUE_LOGO = "";

// After (use the filename you uploaded)
export const LEAGUE_LOGO = "/images/my-league-logo.png";
```

**Step 4:** Save the file

✅ **Done!** Your league logo appears in the top-left corner of the navbar!

### Example

```typescript
// Mumbai Premier League example:
export const LEAGUE_LOGO = "/images/mpl-logo.png";
```

**If no logo is set:**
- A trophy icon (🏆) appears instead

---

## 3️⃣ Adding Sponsor Branding

### Current Settings
```typescript
export const SPONSOR_NAME = "Powered by Your Sponsor";
export const SPONSOR_LOGO = "";
```

### How to Add Sponsor Information

**Option A: Sponsor Name Only**

```typescript
export const SPONSOR_NAME = "Powered by Dream11";
export const SPONSOR_LOGO = ""; // No logo
```

**Option B: Sponsor Name + Logo**

**Step 1:** Add sponsor logo to project
- Place logo in: `client/public/images/`
- Example: `client/public/images/sponsor-logo.png`

**Step 2:** Update both settings

```typescript
export const SPONSOR_NAME = "Powered by Dream11";
export const SPONSOR_LOGO = "/images/sponsor-logo.png";
```

**Step 3:** Save the file

✅ **Done!** Sponsor appears in the top-right area of the navbar!

### Remove Sponsor Branding

To hide sponsor information completely:

```typescript
export const SPONSOR_NAME = ""; // Empty string
export const SPONSOR_LOGO = "";
```

---

## 4️⃣ Updating Developer Credit

### Current Setting
```typescript
export const DEVELOPER_NAME = "Your Name";
```

### How to Change

```typescript
// Examples:
export const DEVELOPER_NAME = "Tech Solutions India";
export const DEVELOPER_NAME = "John Doe";
export const DEVELOPER_NAME = "Mumbai Cricket Board IT Team";
```

This displays as: **"Developed by [Your Name]"** below the league name in the navbar.

### Remove Developer Credit

To hide developer credit:

```typescript
export const DEVELOPER_NAME = ""; // Empty string
```

---

## 🎨 Where Branding Appears

### Navigation Bar Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] [LIVE]     LEAGUE NAME                 [Sponsor]   │
│                  Developed by Dev Name          [User]      │
└────────────────────────────────────────────────────────────┘
     LEFT              CENTER                      RIGHT
```

**Left Side:**
- League Logo (or trophy icon if no logo)
- "LIVE" badge (when auction is running)

**Center:**
- League Name (large, bold)
- Developer Credit (small text below)

**Right Side:**
- Sponsor Logo + Name
- Username
- User Role Badge
- Logout Button

---

## 🖼️ Complete Example Configuration

Here's a fully configured example for "Mumbai Premier League":

```typescript
// client/src/config/leagueConfig.ts

export const LEAGUE_NAME = "Mumbai Premier League 2025";

export const LEAGUE_LOGO = "/images/mpl-logo.png";

export const SPONSOR_NAME = "Powered by Dream11";
export const SPONSOR_LOGO = "/images/dream11-logo.png";

export const DEVELOPER_NAME = "Tech Solutions Mumbai";
```

**Required Files:**
- `client/public/images/mpl-logo.png` (your league logo)
- `client/public/images/dream11-logo.png` (sponsor logo)

---

## 🛠️ Troubleshooting

### Logo Not Showing?

**Check these:**

1. ✅ File is in `client/public/images/` folder
2. ✅ Path starts with `/images/` (with forward slash)
3. ✅ Filename matches exactly (case-sensitive)
4. ✅ File format is PNG, JPG, or SVG

**Common Mistakes:**

```typescript
// ❌ WRONG - Missing leading slash
export const LEAGUE_LOGO = "images/logo.png";

// ❌ WRONG - Wrong folder
export const LEAGUE_LOGO = "/logo.png";

// ✅ CORRECT
export const LEAGUE_LOGO = "/images/logo.png";
```

### Logo Too Big or Too Small?

The navbar automatically sizes logos:
- **League Logo:** 40-48px height (responsive)
- **Sponsor Logo:** 24-32px height (responsive)

**Recommendation:**
- League Logo: 200x200px PNG
- Sponsor Logo: 120x40px PNG (wide format)

### Text Not Changing?

1. Save the file after editing
2. Check browser is showing latest version (refresh: Ctrl+R or Cmd+R)
3. Look for TypeScript errors in the console

### Want to Preview Before Saving?

The app has **hot reload** - changes appear immediately when you save the file!

---

## 📱 Mobile View

All branding is responsive and adapts to mobile screens:
- League name becomes smaller text
- "LIVE" badge shows as a dot (•) on mobile
- Sponsor name may be hidden on very small screens
- Logos remain visible

---

## 🔄 Restoring Defaults

To go back to original settings:

```typescript
export const LEAGUE_NAME = "TLPL S4";
export const LEAGUE_LOGO = "";
export const SPONSOR_NAME = "Powered by Your Sponsor";
export const SPONSOR_LOGO = "";
export const DEVELOPER_NAME = "Your Name";
```

---

## 💡 Pro Tips

1. **Use PNG format** for logos (supports transparency)
2. **Keep file sizes small** (under 100KB) for fast loading
3. **Test on mobile** to ensure text fits
4. **Use high contrast** logos that work in light/dark mode
5. **Brand consistently** - use same colors/fonts as your league materials

---

## 📞 Need Help?

If you encounter issues:
1. Check the file path is correct
2. Verify image files exist in `client/public/images/`
3. Look for errors in browser console (F12)
4. Make sure you saved the file after editing

---

**Last Updated:** November 8, 2024  
**File Location:** `client/src/config/leagueConfig.ts`  
**Platform Version:** 2.1
