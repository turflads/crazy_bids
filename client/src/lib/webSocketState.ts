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

// Wrapper for saveAuctionState that saves locally, POSTs to API, and broadcasts via WebSocket
export function saveAuctionStateWithBroadcast(state: any) {
  // 1. Save to localStorage first
  saveAuctionStateLocal(state);
  
  // 2. POST to API for cross-device/cross-browser sync (Vercel KV)
  fetch('/api/auction-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  }).catch(err => console.error('Failed to sync auction state to server:', err));
  
  // 3. Broadcast via WebSocket if connected (won't work on Vercel free tier)
  if (wsGlobal) {
    wsGlobal.broadcastAuctionUpdate(state);
  }
}

// Wrapper for saveTeamState that saves locally, POSTs to API, and broadcasts via WebSocket
export function saveTeamStateWithBroadcast(teams: any) {
  // 1. Save to localStorage first
  saveTeamStateLocal(teams);
  
  // 2. POST to API for cross-device/cross-browser sync (Vercel KV)
  fetch('/api/team-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teams),
  }).catch(err => console.error('Failed to sync team state to server:', err));
  
  // 3. Broadcast via WebSocket if connected (won't work on Vercel free tier)
  if (wsGlobal) {
    wsGlobal.broadcastTeamUpdate(teams);
  }
}
