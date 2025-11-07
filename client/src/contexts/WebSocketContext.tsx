import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { setWebSocketBroadcaster } from '@/lib/webSocketState';
import { saveAuctionState } from '@/lib/auctionState';
import { saveTeamState } from '@/lib/teamState';

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

  // CRITICAL: Listen for incoming WebSocket messages and update localStorage
  // This ensures all devices stay synchronized with the database
  useEffect(() => {
    if (!lastMessage) return;

    console.log('[WebSocket] Received message:', lastMessage.type);

    // When we receive auction state from server, immediately update localStorage
    if (lastMessage.type === 'auction_update' && lastMessage.data) {
      console.log('[WebSocket] Updating auction state from server');
      saveAuctionState(lastMessage.data);
      // Trigger a storage event to notify other tabs/components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auctionState',
        newValue: JSON.stringify(lastMessage.data),
      }));
    }

    // When we receive team state from server, immediately update localStorage
    if (lastMessage.type === 'team_update' && lastMessage.data) {
      console.log('[WebSocket] Updating team state from server');
      saveTeamState(lastMessage.data);
      // Trigger a storage event to notify other tabs/components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cricket_auction_teams',
        newValue: JSON.stringify(lastMessage.data),
      }));
    }
  }, [lastMessage]);

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
