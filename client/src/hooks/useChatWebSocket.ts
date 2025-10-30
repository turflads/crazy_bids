import { useEffect, useRef, useState } from 'react';
import { getChatState, addChatMessage, addChatReaction, saveChatState, type ChatMessage, type ChatReaction } from '@/lib/chatState';

export function useChatWebSocket() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<ChatReaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reactionTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Load initial state and clear old reactions on mount
    const state = getChatState();
    setMessages(state.messages);
    
    // Clear reactions older than 5 seconds from localStorage
    const now = Date.now();
    const fiveSecondsAgo = now - 5000;
    const freshReactions = state.reactions.filter(r => r.timestamp > fiveSecondsAgo);
    state.reactions = freshReactions;
    saveChatState(state);
    setReactions(freshReactions);
    
    // Schedule removal for hydrated reactions based on their remaining lifetime
    freshReactions.forEach(reaction => {
      const elapsed = now - reaction.timestamp;
      const remainingTime = 5000 - elapsed;
      
      if (remainingTime > 0) {
        const timeoutId = setTimeout(() => {
          setReactions(prev => {
            const filtered = prev.filter(r => r.id !== reaction.id);
            const state = getChatState();
            state.reactions = filtered;
            saveChatState(state);
            return filtered;
          });
          reactionTimeoutsRef.current.delete(reaction.id);
        }, remainingTime);
        
        reactionTimeoutsRef.current.set(reaction.id, timeoutId);
      }
    });

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
              console.log('Received reaction from WebSocket:', newReaction);
              setReactions(prev => {
                const updated = [...prev, newReaction];
                console.log('Updated reactions array:', updated);
                const state = getChatState();
                state.reactions = updated;
                saveChatState(state);
                return updated.slice(-50); // Keep last 50
              });
              
              // Auto-remove reaction after 5 seconds
              const timeoutId = setTimeout(() => {
                setReactions(prev => {
                  const filtered = prev.filter(r => r.id !== newReaction.id);
                  // Also remove from localStorage
                  const state = getChatState();
                  state.reactions = filtered;
                  saveChatState(state);
                  return filtered;
                });
                reactionTimeoutsRef.current.delete(newReaction.id);
              }, 5000);
              
              reactionTimeoutsRef.current.set(newReaction.id, timeoutId);
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
      // Clear all reaction timeouts to avoid setState-after-unmount warnings
      reactionTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      reactionTimeoutsRef.current.clear();
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
    console.log('Sending reaction via WebSocket:', reaction);
    
    wsRef.current.send(JSON.stringify({
      type: 'chat_reaction',
      data: reaction,
      timestamp: Date.now(),
    }));
  };

  return { messages, reactions, sendMessage, sendReaction, isConnected };
}
