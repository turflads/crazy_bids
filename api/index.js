import express from "express";
import { kv } from '@vercel/kv';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use Vercel KV (Redis) for persistent state across serverless invocations
const AUCTION_KEY = 'auction-state';
const TEAM_KEY = 'team-state';

// API Routes
app.get("/api/auction-state", async (req, res) => {
  try {
    const state = await kv.get(AUCTION_KEY);
    res.json(state || {});
  } catch (error) {
    console.error('Error getting auction state:', error);
    res.json({});
  }
});

app.post("/api/auction-state", async (req, res) => {
  try {
    await kv.set(AUCTION_KEY, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving auction state:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/team-state", async (req, res) => {
  try {
    const state = await kv.get(TEAM_KEY);
    res.json(state || {});
  } catch (error) {
    console.error('Error getting team state:', error);
    res.json({});
  }
});

app.post("/api/team-state", async (req, res) => {
  try {
    await kv.set(TEAM_KEY, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving team state:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export for Vercel
export default app;
