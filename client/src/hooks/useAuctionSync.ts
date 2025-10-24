import { useState, useEffect, useRef } from 'react';
import { getAuctionState, saveAuctionState } from '@/lib/auctionState';
import { getTeamState, saveTeamState } from '@/lib/teamState';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

// Fetch state from server
async function fetchServerState() {
  try {
    const [auctionRes, teamRes] = await Promise.all([
      fetch('/api/auction-state'),
      fetch('/api/team-state'),
    ]);
    
    const auctionData = await auctionRes.json();
    const teamData = await teamRes.json();
    
    // Guard: Only update localStorage with server state if it's not empty
    // This prevents overwriting existing local state when server cache is empty
    const hasAuctionData = auctionData && Object.keys(auctionData).length > 0 && auctionData.players;
    const hasTeamData = teamData && Object.keys(teamData).length > 0;
    
    if (hasAuctionData) {
      saveAuctionState(auctionData);
    }
    if (hasTeamData) {
      saveTeamState(teamData);
    }
    
    // Return current state (from localStorage if server was empty)
    return {
      auctionData: hasAuctionData ? auctionData : getAuctionState(),
      teamData: hasTeamData ? teamData : getTeamState(),
    };
  } catch (error) {
    console.error('Failed to fetch state from server:', error);
    return null;
  }
}

// Custom hook to sync auction state across all pages using WebSocket
export function useAuctionSync() {
  const [auctionState, setAuctionState] = useState(getAuctionState());
  const [teamState, setTeamState] = useState(getTeamState());
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const wasConnectedRef = useRef(true);
  
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

  // Fetch from server on reconnect
  useEffect(() => {
    if (isConnected && !wasConnectedRef.current) {
      // Just reconnected - fetch latest state from server
      fetchServerState().then(result => {
        if (result) {
          setAuctionState(result.auctionData);
          setTeamState(result.teamData);
          setLastUpdate(Date.now());
        }
      });
    }
    wasConnectedRef.current = isConnected;
  }, [isConnected]);

  // Fallback polling when WebSocket is disconnected - fetch from server
  useEffect(() => {
    if (!isConnected) {
      // Poll server every 5 seconds when WebSocket is disconnected
      const interval = setInterval(async () => {
        const result = await fetchServerState();
        if (result) {
          setAuctionState(result.auctionData);
          setTeamState(result.teamData);
          setLastUpdate(Date.now());
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return { auctionState, teamState, lastUpdate, isConnected };
}
