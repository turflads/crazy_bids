import { useState, useEffect } from 'react';
import { getAuctionState } from '@/lib/auctionState';
import { getTeamState } from '@/lib/teamState';

// Custom hook to sync auction state across all pages
export function useAuctionSync() {
  const [auctionState, setAuctionState] = useState(getAuctionState());
  const [teamState, setTeamState] = useState(getTeamState());
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    // Sync on storage events (when another tab/window updates)
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

    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      setAuctionState(getAuctionState());
      setTeamState(getTeamState());
      setLastUpdate(Date.now());
    }, 2000);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return { auctionState, teamState, lastUpdate };
}
