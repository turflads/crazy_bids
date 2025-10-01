// Shared auction state management
interface AuctionState {
  currentPlayerIndex: number;
  currentBid: number;
  isAuctionActive: boolean;
  players: any[];
  lastBidTeam: string;
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
  if (existing && existing.players.length > 0) {
    return existing;
  }
  
  const initialState: AuctionState = {
    currentPlayerIndex: 0,
    currentBid: players[0]?.basePrice || 0,
    isAuctionActive: false,
    players: players,
    lastBidTeam: '',
  };
  
  saveAuctionState(initialState);
  return initialState;
};
