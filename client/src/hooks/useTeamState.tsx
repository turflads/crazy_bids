import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getTeamState as getTeamStateFromStorage, saveTeamState } from '@/lib/teamState';

// Team state interface
export interface TeamData {
  name: string;
  flag?: string;
  logo?: string;
  totalPurse: number;
  usedPurse: number;
  players: any[];
  gradeCount: Record<string, number>;
}

// Context for team state
interface TeamStateContextValue {
  teamState: Record<string, TeamData>;
  refreshTeamState: () => void;
  updateTeamState: (newState: Record<string, TeamData>) => void;
}

const TeamStateContext = createContext<TeamStateContextValue | null>(null);

// Provider component
export function TeamStateProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [teamState, setTeamState] = useState<Record<string, TeamData>>({});

  // Load initial state
  useEffect(() => {
    const initialState = getTeamStateFromStorage();
    setTeamState(initialState);
  }, []);

  // Subscribe to WebSocket updates
  useEffect(() => {
    const handleWebSocketUpdate = (event: CustomEvent) => {
      if (event.detail.type === 'team_update') {
        console.log('[useTeamState] Received WebSocket team update');
        const updatedState = getTeamStateFromStorage();
        setTeamState(updatedState);
      }
    };

    window.addEventListener('websocket_message' as any, handleWebSocketUpdate as EventListener);
    return () => window.removeEventListener('websocket_message' as any, handleWebSocketUpdate as EventListener);
  }, []);

  // Subscribe to localStorage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cricket_auction_teams' && e.newValue) {
        console.log('[useTeamState] Received localStorage team update');
        try {
          const newState = JSON.parse(e.newValue);
          setTeamState(newState);
        } catch (err) {
          console.error('[useTeamState] Error parsing team state:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Refresh function
  const refreshTeamState = useCallback(() => {
    const updatedState = getTeamStateFromStorage();
    setTeamState(updatedState);
  }, []);

  // Update function
  const updateTeamState = useCallback((newState: Record<string, TeamData>) => {
    setTeamState(newState);
    saveTeamState(newState);
  }, []);

  return (
    <TeamStateContext.Provider value={{ teamState, refreshTeamState, updateTeamState }}>
      {children}
    </TeamStateContext.Provider>
  );
}

// Hook to use team state
export function useTeamState() {
  const context = useContext(TeamStateContext);
  if (!context) {
    throw new Error('useTeamState must be used within TeamStateProvider');
  }
  return context;
}
