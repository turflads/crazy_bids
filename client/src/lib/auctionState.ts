// Shared auction state management
interface AuctionState {
  currentPlayerIndex: number;
  currentBid: number;
  isAuctionActive: boolean;
  auctionStarted: boolean;  // Track if auction has been officially started by Admin
  players: any[];
  lastBidTeam: string;
  bidHistory: Array<{team: string, amount: number}>;
  hasBids: boolean;
  currentGrade?: string;  // Track current grade being auctioned
  showCategoryTransition?: boolean;  // Flag to show category transition across all clients
  lastCompletedGrade?: string;  // Last completed grade for transition display
  nextGrade?: string;  // Next grade after transition (undefined = auction complete)
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
      auctionStarted: existing.auctionStarted || false,
      currentGrade: existing.currentGrade,
      showCategoryTransition: existing.showCategoryTransition || false,
      lastCompletedGrade: existing.lastCompletedGrade,
      nextGrade: existing.nextGrade,
    };
  }
  
  const initialState: AuctionState = {
    currentPlayerIndex: 0,
    currentBid: players[0]?.basePrice || 0,
    isAuctionActive: false,
    auctionStarted: false,  // Auction not started yet
    players: players,
    lastBidTeam: '',
    bidHistory: [],
    hasBids: false,
    currentGrade: players[0]?.grade,
    showCategoryTransition: false,
    lastCompletedGrade: undefined,
    nextGrade: undefined,
  };
  
  saveAuctionState(initialState);
  return initialState;
};
