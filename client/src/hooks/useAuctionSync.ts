import { useState, useEffect } from 'react';
import { getAuctionState } from '@/lib/auctionState';
import { getTeamState } from '@/lib/teamState';
import { useWebSocket } from './useWebSocket';

// Custom hook to sync auction state across all pages using WebSocket
export function useAuctionSync() {
  const [auctionState, setAuctionState] = useState(getAuctionState());
  const [teamState, setTeamState] = useState(getTeamState());
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { lastMessage, isConnected } = useWebSocket();

  useEffect(() => {
    // Sync on storage events (when another tab/window updates localStorage directly)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cricket_auction_state' || e.key === 'cricket_auction_teams') {
        setAuctionState(getAuctionState());
        setTeamState(getTeamState());
        setLastUpdate(Date.now());
      }
    };

    // Sync on window focus (when user switches back to the tab)
    const handleFocus = () => {
      setAuctionState(getAuctionState());
      setTeamState(getTeamState());
      setLastUpdate(Date.now());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Listen for WebSocket messages and update state
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'auction_update' || lastMessage.type === 'team_update') {
        setAuctionState(getAuctionState());
        setTeamState(getTeamState());
        setLastUpdate(Date.now());
      }
    }
  }, [lastMessage]);

  return { auctionState, teamState, lastUpdate, isConnected };
}
