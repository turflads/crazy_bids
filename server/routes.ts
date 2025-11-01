import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getAuctionStateFromDB, saveAuctionStateToDB, getTeamStateFromDB, saveTeamStateToDB } from "./auctionService";

// Server-side in-memory state cache for cross-device sync (deprecated, using DB now)
let serverAuctionState: any = null;
let serverTeamState: any = null;

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'client', 'public', 'presentations');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'presentation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.ppt', '.pptx', '.ppsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PowerPoint files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints for state synchronization
  
  // Get current auction state from database
  app.get('/api/auction-state', async (req, res) => {
    try {
      const state = await getAuctionStateFromDB();
      serverAuctionState = state; // Update cache for WebSocket
      res.json(state);
    } catch (error) {
      console.error('Error fetching auction state:', error);
      res.status(500).json({ error: 'Failed to fetch auction state' });
    }
  });

  // Update auction state in database
  app.post('/api/auction-state', async (req, res) => {
    try {
      await saveAuctionStateToDB(req.body);
      serverAuctionState = req.body; // Update cache for WebSocket
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving auction state:', error);
      res.status(500).json({ error: 'Failed to save auction state' });
    }
  });

  // Get current team state from database
  app.get('/api/team-state', async (req, res) => {
    try {
      const teams = await getTeamStateFromDB();
      serverTeamState = teams; // Update cache for WebSocket
      res.json(teams);
    } catch (error) {
      console.error('Error fetching team state:', error);
      res.status(500).json({ error: 'Failed to fetch team state' });
    }
  });

  // Update team state in database
  app.post('/api/team-state', async (req, res) => {
    try {
      await saveTeamStateToDB(req.body);
      serverTeamState = req.body; // Update cache for WebSocket
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving team state:', error);
      res.status(500).json({ error: 'Failed to save team state' });
    }
  });

  // Clear all auction data (reset)
  app.post('/api/reset-auction', async (req, res) => {
    try {
      const { clearAuctionDataFromDB } = await import('./auctionService');
      await clearAuctionDataFromDB();
      serverAuctionState = null;
      serverTeamState = null;
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing auction data:', error);
      res.status(500).json({ error: 'Failed to clear auction data' });
    }
  });

  // Upload presentation endpoint
  app.post('/api/upload-presentation', upload.single('presentation'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = '/presentations/' + req.file.filename;
      res.json({ 
        success: true, 
        path: filePath,
        filename: req.file.filename 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server on /ws path (distinct from Vite's HMR websocket)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', async (ws: WebSocket) => {
    console.log('New WebSocket client connected');
    
    // Load latest state from database and send to newly connected client
    try {
      const auctionState = await getAuctionStateFromDB();
      const teamStateData = await getTeamStateFromDB();
      
      serverAuctionState = auctionState;
      serverTeamState = teamStateData;
      
      if (auctionState) {
        ws.send(JSON.stringify({
          type: 'auction_update',
          timestamp: Date.now(),
          data: auctionState,
        }));
      }
      if (teamStateData) {
        ws.send(JSON.stringify({
          type: 'team_update',
          timestamp: Date.now(),
          data: teamStateData,
        }));
      }
    } catch (error) {
      console.error('Error loading state for WebSocket client:', error);
    }

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Update server-side state cache AND database
        if (data.type === 'auction_update' && data.data) {
          serverAuctionState = data.data;
          // Persist to database
          await saveAuctionStateToDB(data.data).catch(err => 
            console.error('Failed to save auction state from WebSocket:', err)
          );
        } else if (data.type === 'team_update' && data.data) {
          serverTeamState = data.data;
          // Persist to database
          await saveTeamStateToDB(data.data).catch(err =>
            console.error('Failed to save team state from WebSocket:', err)
          );
        }
        // Handle chat messages and reactions - broadcast to all clients
        else if (data.type === 'chat_message' || data.type === 'chat_reaction') {
          // Broadcast to all connected clients (including sender for confirmation)
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
          return; // Don't process further
        }
        
        // Broadcast message to all connected clients except sender
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
