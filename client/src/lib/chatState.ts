// Chat state management for viewer messages and reactions
export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface ChatReaction {
  id: string;
  emoji: string;
  username: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  reactions: ChatReaction[];
}

const CHAT_STATE_KEY = 'cricket_auction_chat';
const MAX_MESSAGES = 100; // Keep last 100 messages
const MAX_REACTIONS = 50; // Keep last 50 reactions

export const getChatState = (): ChatState => {
  const stored = localStorage.getItem(CHAT_STATE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { messages: [], reactions: [] };
};

export const saveChatState = (state: ChatState) => {
  // Limit stored messages and reactions
  const limitedState = {
    messages: state.messages.slice(-MAX_MESSAGES),
    reactions: state.reactions.slice(-MAX_REACTIONS),
  };
  localStorage.setItem(CHAT_STATE_KEY, JSON.stringify(limitedState));
};

export const addChatMessage = (username: string, message: string): ChatMessage => {
  const state = getChatState();
  const newMessage: ChatMessage = {
    id: `${Date.now()}-${Math.random()}`,
    username,
    message,
    timestamp: Date.now(),
  };
  
  state.messages.push(newMessage);
  saveChatState(state);
  return newMessage;
};

export const addChatReaction = (username: string, emoji: string): ChatReaction => {
  const state = getChatState();
  const newReaction: ChatReaction = {
    id: `${Date.now()}-${Math.random()}`,
    emoji,
    username,
    timestamp: Date.now(),
  };
  
  state.reactions.push(newReaction);
  saveChatState(state);
  return newReaction;
};

export const clearOldReactions = () => {
  const state = getChatState();
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  state.reactions = state.reactions.filter(r => r.timestamp > fiveMinutesAgo);
  saveChatState(state);
};

export const clearChatState = () => {
  localStorage.removeItem(CHAT_STATE_KEY);
};
