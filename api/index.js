import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// In-memory state storage (Note: This resets on each serverless invocation)
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

// Export for Vercel
export default app;
