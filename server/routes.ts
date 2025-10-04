import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import xlsx from "xlsx";
import { storage } from "./storage";
import { insertPlayerSchema } from "@shared/schema";

// Configure multer for file uploads using memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.mimetype === "application/vnd.ms-excel") {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Players API
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.post("/api/players/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Parse Excel file from buffer
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      if (!data || data.length === 0) {
        return res.status(400).json({ error: "Excel file is empty or has no data" });
      }

      // Transform and validate players data BEFORE deleting existing players
      const players = data.map((row: any, index: number) => {
        try {
          // Map Excel columns to player fields with better normalization
          const firstName = String(row["First Name"] || row["first name"] || row["firstName"] || "").trim();
          const lastName = String(row["Last Name"] || row["last name"] || row["lastName"] || "").trim();
          const grade = String(row["Grade"] || row["grade"] || "C").trim().toUpperCase();
          const basePriceStr = String(row["Base Price"] || row["base price"] || row["basePrice"] || "0").trim();
          const basePrice = parseInt(basePriceStr.replace(/[^0-9]/g, '')) || 0;
          
          const player = {
            firstName,
            lastName,
            grade,
            basePrice,
            imagePath: row["Image Path"] || row["image path"] || row["imagePath"] || null,
            cricheroesLink: row["Cricheroes Link"] || row["cricheroes link"] || row["cricheroesLink"] || null,
            status: "unsold",
          };

          // Validate with zod schema
          return insertPlayerSchema.parse(player);
        } catch (err) {
          throw new Error(`Row ${index + 2} validation failed: ${err instanceof Error ? err.message : 'Invalid data'}`);
        }
      });

      // Only delete existing players after validation succeeds
      await storage.deletePlayers();

      // Bulk create players
      const createdPlayers = await storage.bulkCreatePlayers(players);

      res.json({
        message: `Successfully uploaded ${createdPlayers.length} players`,
        count: createdPlayers.length,
        players: createdPlayers,
      });
    } catch (error) {
      console.error("Error uploading players:", error);
      res.status(500).json({ 
        error: "Failed to upload players",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/players/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedPlayer = await storage.updatePlayer(id, updates);
      
      if (!updatedPlayer) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      res.json(updatedPlayer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update player" });
    }
  });

  // Teams API
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const team = await storage.createTeam(req.body);
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedTeam = await storage.updateTeam(id, updates);
      
      if (!updatedTeam) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
