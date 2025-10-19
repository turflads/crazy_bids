# Cricket Auction - Configuration Guide

This guide shows you how to configure user credentials and team logos for the auction system.

## 📝 Changing User Credentials

### Location
File: `client/src/pages/Login.tsx` (Lines 22-26)

### How to Change

1. Open the file `client/src/pages/Login.tsx`
2. Find the credentials section (clearly marked with comments)
3. Edit the username and password as needed

### Example - Changing Admin Password

```javascript
const credentials: Record<string, { password: string; role: string }> = {
  admin: { password: "newSecurePassword123", role: "admin" },  // Changed password
  owner: { password: "owner123", role: "owner" },
  viewer: { password: "viewer123", role: "viewer" },
};
```

### Example - Adding a New User

```javascript
const credentials: Record<string, { password: string; role: string }> = {
  admin: { password: "admin123", role: "admin" },
  owner: { password: "owner123", role: "owner" },
  viewer: { password: "viewer123", role: "viewer" },
  john: { password: "john123", role: "owner" },  // New owner user
  sarah: { password: "sarah456", role: "viewer" },  // New viewer user
};
```

### Available Roles
- **admin**: Full control - can start/stop auction, sell players, reset auction
- **owner**: View auction and team information
- **viewer**: View-only access to auction status and team standings

---

## 🖼️ Team Logos (Already Set Up!)

### Current Setup

Your application already has sample team logos in place! The logos are stored in `client/public/images/`:
- ✅ chennai-super-kings.png
- ✅ royal-challengers.png  
- ✅ delhi-capitals.png
- ✅ delhi.png

These are **sample placeholder logos**. You can replace them with your own team logos.

### How to Replace Logos

1. Navigate to `client/public/images/`
2. Replace the existing PNG files with your own logo images
3. Keep the same file names (e.g., `chennai-super-kings.png`)
4. OR upload new logo images and update the `logo` paths in `config.json`
5. Supported formats: PNG, JPG, JPEG, SVG
6. Recommended size: 256x256 pixels or larger (square images work best)

### Step 2: Configure Team Logos in config.json

1. Open `client/public/config.json`
2. Add the `logo` field to each team with the path to the image

```json
{
  "teams": [
    {
      "name": "Chennai Super Kings",
      "flag": "🟡",
      "logo": "/images/chennai-super-kings.png",
      "totalPurse": 100000000
    },
    {
      "name": "Royal Challengers",
      "flag": "🔴",
      "logo": "/images/royal-challengers.png",
      "totalPurse": 100000000
    }
  ]
}
```

### Important Notes

- **Image Path**: Always start with `/images/` (the forward slash is important!)
- **File Names**: Use lowercase with hyphens (e.g., `team-name.png`)
- **Fallback**: If a logo fails to load, the system will show the flag emoji as backup
- **Keep flag field**: Don't remove the `flag` field - it serves as a fallback

---

## ⚙️ Complete config.json Structure

Here's a complete example of `client/public/config.json`:

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
  "teams": [
    {
      "name": "Chennai Super Kings",
      "flag": "🟡",
      "logo": "/images/chennai-super-kings.png",
      "totalPurse": 100000000
    },
    {
      "name": "Royal Challengers",
      "flag": "🔴",
      "logo": "/images/royal-challengers.png",
      "totalPurse": 100000000
    },
    {
      "name": "Delhi Capitals",
      "flag": "🔷",
      "logo": "/images/delhi-capitals.png",
      "totalPurse": 100000000
    }
  ],
  "gradeQuotas": {
    "A": 3,
    "B": 4,
    "C": 5
  }
}
```

---

## 🚀 After Making Changes

1. **Credentials**: Just refresh the login page to use new credentials
2. **Team Logos**: The app checks config.json every 5 seconds, so changes will appear automatically
3. **No server restart needed** for either change!

## 📍 Where Team Logos Appear

Your team logos are now displayed throughout the entire application:

✅ **Admin Dashboard**
- Team Overview cards
- Auction Control bid buttons (Click team to place bid)
- Custom bid team selector dropdown
- Team player list dialog
- Celebration popup when player is sold

✅ **Owner Dashboard**
- Team Overview cards
- Team player list dialog
- All Teams section

✅ **Viewer Dashboard**
- Team standings cards
- Team player list dialog
- Recent sales display

No more emoji flags anywhere in the application!

---

## ❓ Troubleshooting

### Logos Not Showing?
1. Check that the image file exists in `client/public/images/`
2. Verify the path in config.json starts with `/images/`
3. Make sure the file name matches exactly (case-sensitive)
4. Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)

### Can't Login with New Credentials?
1. Make sure you saved the `Login.tsx` file
2. Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
3. Check for typos in username/password

### Need Help?
- Credentials file: `client/src/pages/Login.tsx`
- Config file: `client/public/config.json`
- Logo folder: `client/public/images/`
