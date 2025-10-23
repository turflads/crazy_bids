import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { setWebSocketBroadcaster } from '@/lib/webSocketState';

interface WebSocketContextType {
  isConnected: boolean;
  broadcastAuctionUpdate: () => void;
  broadcastTeamUpdate: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isConnected, sendMessage } = useWebSocket();

  const broadcastAuctionUpdate = () => {
    sendMessage({
      type: 'auction_update',
      timestamp: Date.now(),
    });
  };

  const broadcastTeamUpdate = () => {
    sendMessage({
      type: 'team_update',
      timestamp: Date.now(),
    });
  };

  // Set the global broadcaster so non-component code can use it
  useEffect(() => {
    setWebSocketBroadcaster({
      broadcastAuctionUpdate,
      broadcastTeamUpdate,
    });
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, broadcastAuctionUpdate, broadcastTeamUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}
