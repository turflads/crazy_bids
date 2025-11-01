// Service layer for auction and team state database operations
import { db } from "./db";
import { auctionState, teamState } from "@shared/schema";
import { eq } from "drizzle-orm";

// Auction State Operations
export async function getAuctionStateFromDB() {
  if (!db) {
    console.log('Database not available - returning null for auction state');
    return null;
  }
  
  const [state] = await db.select().from(auctionState).where(eq(auctionState.id, 1));
  
  if (!state) {
    // Return default state if no record exists
    return {
      currentPlayerIndex: 0,
      currentBid: 0,
      isAuctionActive: false,
      players: [],
      bidHistory: [],
      hasBids: false,
      lastBidTeam: '',
    };
  }
  
  // Convert integer booleans to actual booleans
  return {
    currentPlayerIndex: state.currentPlayerIndex,
    currentBid: state.currentBid,
    isAuctionActive: state.isAuctionActive === 1,
    players: state.players as any[],
    bidHistory: state.bidHistory as any[],
    hasBids: state.hasBids === 1,
    lastBidTeam: state.lastBidTeam || '',
  };
}

export async function saveAuctionStateToDB(state: {
  currentPlayerIndex: number;
  currentBid: number;
  isAuctionActive: boolean;
  players: any[];
  bidHistory: any[];
  hasBids: boolean;
  lastBidTeam?: string;
}) {
  if (!db) {
    console.log('Database not available - skipping auction state save');
    return null;
  }
  
  const dbState = {
    id: 1,
    currentPlayerIndex: state.currentPlayerIndex,
    currentBid: state.currentBid,
    isAuctionActive: state.isAuctionActive ? 1 : 0,
    players: state.players,
    bidHistory: state.bidHistory,
    hasBids: state.hasBids ? 1 : 0,
    lastBidTeam: state.lastBidTeam || '',
    updatedAt: new Date(),
  };
  
  // Upsert: insert or update if exists
  await db
    .insert(auctionState)
    .values(dbState)
    .onConflictDoUpdate({
      target: auctionState.id,
      set: dbState,
    });
  
  return dbState;
}

// Team State Operations
export async function getTeamStateFromDB() {
  if (!db) {
    console.log('Database not available - returning null for team state');
    return null;
  }
  
  const [state] = await db.select().from(teamState).where(eq(teamState.id, 1));
  
  if (!state) {
    return {};
  }
  
  return state.teams as Record<string, any>;
}

export async function saveTeamStateToDB(teams: Record<string, any>) {
  if (!db) {
    console.log('Database not available - skipping team state save');
    return null;
  }
  
  const dbState = {
    id: 1,
    teams: teams,
    updatedAt: new Date(),
  };
  
  // Upsert: insert or update if exists
  await db
    .insert(teamState)
    .values(dbState)
    .onConflictDoUpdate({
      target: teamState.id,
      set: dbState,
    });
  
  return dbState;
}

// Clear all auction data (for reset)
export async function clearAuctionDataFromDB() {
  if (!db) {
    console.log('Database not available - skipping auction data clear');
    return;
  }
  
  await db.delete(auctionState).where(eq(auctionState.id, 1));
  await db.delete(teamState).where(eq(teamState.id, 1));
}
