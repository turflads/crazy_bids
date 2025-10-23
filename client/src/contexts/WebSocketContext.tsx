import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { setWebSocketBroadcaster } from '@/lib/webSocketState';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  broadcastAuctionUpdate: (data: any) => void;
  broadcastTeamUpdate: (data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isConnected, lastMessage, sendMessage } = useWebSocket();

  const broadcastAuctionUpdate = (data: any) => {
    sendMessage({
      type: 'auction_update',
      timestamp: Date.now(),
      data, // Include full auction state payload
    });
  };

  const broadcastTeamUpdate = (data: any) => {
    sendMessage({
      type: 'team_update',
      timestamp: Date.now(),
      data, // Include full team state payload
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
    <WebSocketContext.Provider value={{ isConnected, lastMessage, broadcastAuctionUpdate, broadcastTeamUpdate }}>
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
