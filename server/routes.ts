import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

// Server-side in-memory state cache for cross-device sync
let serverAuctionState: any = null;
let serverTeamState: any = null;

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
