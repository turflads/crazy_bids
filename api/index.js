import express from "express";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from dist/public
const publicPath = join(__dirname, '..', 'dist', 'public');
app.use(express.static(publicPath));

// In-memory state storage
let serverAuctionState = null;
let serverTeamState = null;

// API Routes
app.get("/api/auction-state", (req, res) => {
  res.json(serverAuctionState || {});
});

app.post("/api/auction-state", (req, res) => {
  serverAuctionState = req.body;
  res.json({ success: true });
});

app.get("/api/team-state", (req, res) => {
  res.json(serverTeamState || {});
});

app.post("/api/team-state", (req, res) => {
  serverTeamState = req.body;
  res.json({ success: true });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  const indexPath = join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found');
  }
});

export default app;
