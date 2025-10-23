# Package.json Updates for Azure Deployment

You need to manually update your `package.json` file with these new scripts for easier Azure deployment.

## Add These Scripts

Open `package.json` and update the `"scripts"` section:

### Current Scripts:
```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

### Update To:
```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build",
  "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push",
  "postbuild": "npm run copy:assets",
  "copy:assets": "mkdir -p dist/public/assets && cp -r client/public/* dist/public/ 2>/dev/null || true && cp -r attached_assets/* dist/public/assets/ 2>/dev/null || true && cp config.json dist/ 2>/dev/null || true && cp players.xlsx dist/ 2>/dev/null || true"
}
```

## What These Scripts Do:

- **`build`**: Builds both client and server separately (cleaner)
- **`build:client`**: Builds only the React frontend with Vite
- **`build:server`**: Builds only the Express backend with esbuild
- **`postbuild`**: Automatically runs after build to copy assets
- **`copy:assets`**: Copies all necessary files to dist folder

## For Windows Users:

If you're on Windows, replace the `copy:assets` script with:

```json
"copy:assets": "if not exist dist\\public\\assets mkdir dist\\public\\assets && xcopy /E /I /Y client\\public\\* dist\\public\\ && xcopy /E /I /Y attached_assets\\* dist\\public\\assets\\ && copy config.json dist\\ && copy players.xlsx dist\\"
```

## Then Test:

```bash
# Test the build
npm run build

# Verify dist folder contains:
# - dist/index.js (backend)
# - dist/public/* (frontend files)
# - dist/public/assets/* (images, logos)
# - dist/config.json
# - dist/players.xlsx
```

After updating package.json, you're ready to deploy to Azure!
