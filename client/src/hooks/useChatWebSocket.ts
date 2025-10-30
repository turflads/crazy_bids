import { useEffect, useRef, useState } from 'react';
import { getChatState, addChatMessage, addChatReaction, saveChatState, type ChatMessage, type ChatReaction } from '@/lib/chatState';

export function useChatWebSocket() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<ChatReaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Load initial state
    const state = getChatState();
    setMessages(state.messages);
    setReactions(state.reactions);

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('Chat WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'chat_message' && data.data) {
              const newMessage = data.data as ChatMessage;
              setMessages(prev => {
                const updated = [...prev, newMessage];
                const state = getChatState();
                state.messages = updated;
                saveChatState(state);
                return updated.slice(-100); // Keep last 100
              });
            } else if (data.type === 'chat_reaction' && data.data) {
              const newReaction = data.data as ChatReaction;
              setReactions(prev => {
                const updated = [...prev, newReaction];
                const state = getChatState();
                state.reactions = updated;
                saveChatState(state);
                return updated.slice(-50); // Keep last 50
              });
              
              // Auto-remove reaction after 5 seconds
              setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== newReaction.id));
              }, 5000);
            }
          } catch (error) {
            console.error('Error parsing chat message:', error);
          }
        };

        ws.onclose = () => {
          console.log('Chat WebSocket disconnected');
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('Chat WebSocket error:', error);
          ws.close();
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (username: string, message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const chatMessage = addChatMessage(username, message);
    
    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      data: chatMessage,
      timestamp: Date.now(),
    }));
  };

  const sendReaction = (username: string, emoji: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const reaction = addChatReaction(username, emoji);
    
    wsRef.current.send(JSON.stringify({
      type: 'chat_reaction',
      data: reaction,
      timestamp: Date.now(),
    }));
  };

  return { messages, reactions, sendMessage, sendReaction, isConnected };
}
