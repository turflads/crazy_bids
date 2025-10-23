// WebSocket-aware state management utilities
// These functions save to localStorage AND broadcast via WebSocket

// Note: We can't import useWebSocketContext here because this is not a React component
// Instead, we'll use a global WebSocket reference that gets set by the context

let wsGlobal: {
  broadcastAuctionUpdate: () => void;
  broadcastTeamUpdate: () => void;
} | null = null;

export function setWebSocketBroadcaster(broadcaster: {
  broadcastAuctionUpdate: () => void;
  broadcastTeamUpdate: () => void;
}) {
  wsGlobal = broadcaster;
}

import { saveAuctionState as saveAuctionStateLocal } from './auctionState';
import { saveTeamState as saveTeamStateLocal } from './teamState';

// Wrapper for saveAuctionState that also broadcasts via WebSocket
export function saveAuctionStateWithBroadcast(state: any) {
  saveAuctionStateLocal(state);
  if (wsGlobal) {
    wsGlobal.broadcastAuctionUpdate();
  }
}

// Wrapper for saveTeamState that also broadcasts via WebSocket
export function saveTeamStateWithBroadcast(teams: any) {
  saveTeamStateLocal(teams);
  if (wsGlobal) {
    wsGlobal.broadcastTeamUpdate();
  }
}
