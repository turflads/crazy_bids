import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import xlsx from "xlsx";
import path from "path";
import { storage } from "./storage";
import { insertPlayerSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
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
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Parse Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      // Clear existing players
      await storage.deletePlayers();

      // Transform and validate players data
      const players = data.map((row: any) => {
        // Map Excel columns to player fields
        const player = {
          firstName: row["First Name"] || row["first name"] || row["firstName"] || "",
          lastName: row["Last Name"] || row["last name"] || row["lastName"] || "",
          grade: row["Grade"] || row["grade"] || "C",
          basePrice: parseInt(row["Base Price"] || row["base price"] || row["basePrice"] || "0"),
          imagePath: row["Image Path"] || row["image path"] || row["imagePath"] || null,
          cricheroesLink: row["Cricheroes Link"] || row["cricheroes link"] || row["cricheroesLink"] || null,
          status: "unsold",
        };

        // Validate with zod schema
        return insertPlayerSchema.parse(player);
      });

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
