// WebSocket-aware state management utilities
// These functions save to localStorage AND broadcast via WebSocket WITH FULL PAYLOAD

// Note: We can't import useWebSocketContext here because this is not a React component
// Instead, we'll use a global WebSocket reference that gets set by the context

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

// Wrapper for saveAuctionState that also broadcasts via WebSocket
export function saveAuctionStateWithBroadcast(state: any) {
  // Save to localStorage first
  saveAuctionStateLocal(state);
  // Broadcast the full state via WebSocket to all other clients
  if (wsGlobal) {
    wsGlobal.broadcastAuctionUpdate(state);
  }
}

// Wrapper for saveTeamState that also broadcasts via WebSocket
export function saveTeamStateWithBroadcast(teams: any) {
  // Save to localStorage first
  saveTeamStateLocal(teams);
  // Broadcast the full state via WebSocket to all other clients
  if (wsGlobal) {
    wsGlobal.broadcastTeamUpdate(teams);
  }
}
