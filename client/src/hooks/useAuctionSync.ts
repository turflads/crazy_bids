import { useState, useEffect } from 'react';
import { getAuctionState, saveAuctionState } from '@/lib/auctionState';
import { getTeamState, saveTeamState } from '@/lib/teamState';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

// Custom hook to sync auction state across all pages using WebSocket
export function useAuctionSync() {
  const [auctionState, setAuctionState] = useState(getAuctionState());
  const [teamState, setTeamState] = useState(getTeamState());
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Use shared WebSocket context instead of creating duplicate connections
  const { lastMessage, isConnected } = useWebSocketContext();

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

  // Listen for WebSocket messages and update state from payload
  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      if (lastMessage.type === 'auction_update') {
        // Save the received auction state to localStorage
        saveAuctionState(lastMessage.data);
        setAuctionState(lastMessage.data);
        setLastUpdate(Date.now());
      } else if (lastMessage.type === 'team_update') {
        // Save the received team state to localStorage
        saveTeamState(lastMessage.data);
        setTeamState(lastMessage.data);
        setLastUpdate(Date.now());
      }
    }
  }, [lastMessage]);

  // Fallback polling when WebSocket is disconnected
  useEffect(() => {
    if (!isConnected) {
      // Poll every 5 seconds when WebSocket is disconnected
      const interval = setInterval(() => {
        setAuctionState(getAuctionState());
        setTeamState(getTeamState());
        setLastUpdate(Date.now());
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return { auctionState, teamState, lastUpdate, isConnected };
}
