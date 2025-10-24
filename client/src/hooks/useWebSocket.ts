import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: 'auction_update' | 'team_update';
  timestamp: number;
  data?: any; // Full state payload
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasConnectedOnceRef = useRef(false);

  const connect = () => {
    try {
      // Construct WebSocket URL with correct protocol
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // On reconnect, only ADMIN pushes current state to server
        // This prevents stale clients from overwriting fresh server state
        if (hasConnectedOnceRef.current) {
          // This was a reconnection (not initial connection)
          // Only admin is authoritative source for repopulating server cache
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              if (userData.role === "admin") {
                console.log('WebSocket reconnected (Admin) - pushing state to server');
                import('../lib/auctionState').then(auctionModule => {
                  import('../lib/teamState').then(teamModule => {
                    const currentAuctionState = auctionModule.getAuctionState();
                    const currentTeamState = teamModule.getTeamState();
                    
                    // Push to server to repopulate cache after restart
                    Promise.all([
                      fetch('/api/auction-state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentAuctionState),
                      }).catch(() => {}),
                      fetch('/api/team-state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentTeamState),
                      }).catch(() => {}),
                    ]);
                  });
                });
              }
            } catch (e) {
              console.error('Error parsing user data:', e);
            }
          }
        }
        hasConnectedOnceRef.current = true;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  };

  return { isConnected, lastMessage, sendMessage };
}
