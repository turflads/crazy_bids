// Shared auction state management
interface AuctionState {
  currentPlayerIndex: number;
  currentBid: number;
  isAuctionActive: boolean;
  players: any[];
  lastBidTeam: string;
  bidHistory: Array<{team: string, amount: number}>;
  hasBids: boolean;
}

const AUCTION_STATE_KEY = 'cricket_auction_state';

export const getAuctionState = (): AuctionState | null => {
  const stored = localStorage.getItem(AUCTION_STATE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const saveAuctionState = (state: AuctionState) => {
  localStorage.setItem(AUCTION_STATE_KEY, JSON.stringify(state));
};

export const clearAuctionState = () => {
  localStorage.removeItem(AUCTION_STATE_KEY);
};

export const initializeAuctionState = (players: any[]): AuctionState => {
  const existing = getAuctionState();
  // Only use existing state if it has valid data
  if (existing && existing.players && existing.players.length > 0) {
    // Ensure all required fields exist (for backward compatibility)
    return {
      ...existing,
      bidHistory: existing.bidHistory || [],
      hasBids: existing.hasBids || false,
    };
  }
  
  const initialState: AuctionState = {
    currentPlayerIndex: 0,
    currentBid: players[0]?.basePrice || 0,
    isAuctionActive: false,
    players: players,
    lastBidTeam: '',
    bidHistory: [],
    hasBids: false,
  };
  
  saveAuctionState(initialState);
  return initialState;
};
