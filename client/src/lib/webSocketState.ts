// WebSocket-aware state management utilities
// These functions save to localStorage, POST to API, AND broadcast via WebSocket

let wsGlobal: {
  broadcastAuctionUpdate: (data: any) => void;
  broadcastTeamUpdate: (data: any) => void;
} | null = null;

export function setWebSocketBroadcaster(broadcaster: {
  broadcastAuctionUpdate: (data: any) => void;
  broadcastTeamUpdate: (data: any) => void;
}) {
  wsGlobal = broadcaster;
}

import { saveAuctionState as saveAuctionStateLocal } from './auctionState';
import { saveTeamState as saveTeamStateLocal } from './teamState';

// Wrapper for saveAuctionState that saves locally, POSTs to API (PostgreSQL), and broadcasts via WebSocket
export function saveAuctionStateWithBroadcast(state: any) {
  // 1. Save to localStorage first (for offline fallback)
  saveAuctionStateLocal(state);
  
  // 2. POST to API to persist in PostgreSQL database
  fetch('/api/auction-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  }).catch(err => {
    console.error('Failed to save auction state to database:', err);
  });
  
  // 3. Broadcast via WebSocket for real-time updates to connected clients
  if (wsGlobal) {
    wsGlobal.broadcastAuctionUpdate(state);
  }
}

// Wrapper for saveTeamState that saves locally, POSTs to API (PostgreSQL), and broadcasts via WebSocket
export function saveTeamStateWithBroadcast(teams: any) {
  // 1. Save to localStorage first (for offline fallback)
  saveTeamStateLocal(teams);
  
  // 2. POST to API to persist in PostgreSQL database
  fetch('/api/team-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teams),
  }).catch(err => {
    console.error('Failed to save team state to database:', err);
  });
  
  // 3. Broadcast via WebSocket for real-time updates to connected clients
  if (wsGlobal) {
    wsGlobal.broadcastTeamUpdate(teams);
  }
}
