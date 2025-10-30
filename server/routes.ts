import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";

// Server-side in-memory state cache for cross-device sync
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
  
  // Get current auction state
  app.get('/api/auction-state', (req, res) => {
    res.json(serverAuctionState || {});
  });

  // Update auction state
  app.post('/api/auction-state', (req, res) => {
    serverAuctionState = req.body;
    res.json({ success: true });
  });

  // Get current team state
  app.get('/api/team-state', (req, res) => {
    res.json(serverTeamState || {});
  });

  // Update team state
  app.post('/api/team-state', (req, res) => {
    serverTeamState = req.body;
    res.json({ success: true });
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

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket client connected');
    
    // Send current server state to newly connected client
    if (serverAuctionState || serverTeamState) {
      if (serverAuctionState) {
        ws.send(JSON.stringify({
          type: 'auction_update',
          timestamp: Date.now(),
          data: serverAuctionState,
        }));
      }
      if (serverTeamState) {
        ws.send(JSON.stringify({
          type: 'team_update',
          timestamp: Date.now(),
          data: serverTeamState,
        }));
      }
    }

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Update server-side state cache
        if (data.type === 'auction_update' && data.data) {
          serverAuctionState = data.data;
        } else if (data.type === 'team_update' && data.data) {
          serverTeamState = data.data;
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
